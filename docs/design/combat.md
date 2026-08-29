# Combat — règles complètes

> Agent responsable : `game-designer`. Statut : **v1, implémentable**.
> Cadre : D10-D22 de `docs/06-arbitrages.md`, invariants I1-I5 de `docs/02-systemes-v0.md`.
> Ce document est le contrat entre le design, `packages/core` et `balance-simulator`.
> Tout chiffre marqué **[T]** est un paramètre de tuning : il peut bouger sans que la règle
> change. Tout chiffre non marqué est une règle.

---

## 1. Le terrain

| | |
|---|---|
| Grille | 5 colonnes × 7 rangées (D10) |
| Coordonnées | `(x, y)`, `x` de 1 à 5 de gauche à droite, `y` de 1 à 7 de haut en bas |
| Voisinage | **Orthogonal uniquement.** Les diagonales n'existent pas dans ce jeu |
| Distance | Manhattan : `|dx| + |dy|` |
| Ligne orthogonale | Deux cases partageant `x` ou `y`. Une ligne est **dégagée** si aucune unité n'occupe les cases strictement intermédiaires |
| Occupation | **Au plus une unité par case, à tout instant.** C'est un invariant du moteur, à asserter |
| Case de départ du joueur | `(3, 5)` |
| Cases de départ des ennemis | rangées 1 à 3, définies par la rencontre (placement écrit à la main, jamais généré) |

Pourquoi `(3, 5)` et pas `(3, 7)` : les deux rangées du bas sont partiellement sous le pouce
et sous le HUD ; le jeton du joueur ne doit pas y vivre par défaut. Et à `y = 5`, le premier
contact tombe au tour 1 ou 2 au lieu du tour 3, ce qui économise deux tours de marche par
combat — soit **16 s par combat**, non négociable vu le budget.

Pas d'obstacles de décor en v0. Le moteur réserve la notion (une case peut porter un
`blocker`), aucune rencontre ne s'en sert avant l'acte 2.

---

## 2. L'état d'un combat

### 2.1 Persisté (c'est la sauvegarde — `docs/05-technique.md`, « l'état est la sauvegarde »)

| Champ | Contenu |
|---|---|
| `seed`, `rngCursor` | Graine et compteur d'appels. Garantit I1 |
| `turn` | Numéro de tour, à partir de 1 |
| `phase` | `draw` \| `choice` \| `resolve_player` \| `resolve_enemy` \| `end_turn` \| `won` \| `lost` |
| `player.hp`, `player.hpMax` | PV courants et maximum. **Traversent le combat et la run** |
| `player.case` | Case occupée |
| `player.shield` | Bouclier courant. Remis à 0 en fin de tour |
| `player.freeStepUsed` | Le pas gratuit a-t-il été consommé ce tour |
| `pool` | Multiset des dés non encore tirés ce combat |
| `discard` | Multiset des dés dépensés ou défaussés |
| `hand` | Liste ordonnée de dés en main : `{ dieId, face, kept }` |
| `pendingActions` | **Séquence ordonnée** des actions posées ce tour, non encore résolues |
| `units[]` | Ennemis : `{ id, typeId, case, hp, hpMax, shield, armor, intent, statuses[] }` |
| `relics[]` | Reliques du personnage et leurs compteurs par tour |
| `triggerBudget`, `perSourceBudget` | Compteurs de déclenchements restants ce tour (§ 12) |
| `lastTurnLog` | Journal d'événements du tour précédent, conservé pour le rejeu visuel |

`pendingActions` est persisté : fermer l'application au milieu de la pose des dés et revenir
trois jours après reprend **exactement au même dé** (contrainte n°1 du mobile). La
sérialisation a lieu après **chaque** entrée du joueur en phase de choix, pas seulement à la
validation. L'état complet fait moins de 4 ko : le coût est nul.

### 2.2 Dérivé (recalculé, jamais persisté)

Cases de déplacement légales, cases surlignées par les intentions, prévisualisation d'un
Élan, badges de combo, aperçu des dégâts. Tout cela est une fonction pure de l'état
persisté ; c'est ce qui rend le rendu jetable et le simulateur possible.

### 2.3 Visible (I5 — aucune stat cachée)

Tout est affichable en tapant dessus, sans exception : PV et Bouclier de chaque unité,
Armure, intention et son motif de cases, faces des dés en main, **composition du `pool`
restant sous forme de comptage par face**, contenu du `discard`, liste des reliques et de
leurs compteurs.

La seule chose non montrée est **l'ordre du `pool`**. Ce n'est pas une statistique cachée,
c'est l'aléatoire du tirage lui-même (D6). Le `pool` est donc toujours présenté comme un
**multiset**, jamais comme une pile ordonnée, y compris dans le code de l'UI.

---

## 3. La séquence d'un tour

Six phases. Le point de non-retour est le tap sur **Valider**, et nulle part ailleurs.

### Phase 0 — Début de tour (automatique, 0 s de décision)
1. `triggerBudget` et tous les compteurs par relique sont réinitialisés.
2. Les statuts à durée décrémentent ; ceux à 0 expirent.
3. Événement `TURN_START` émis (crochet de relique).
4. `player.freeStepUsed = false`.

### Phase 1 — Tirage (1 geste, ~0,5 s)
La Main est complétée à 3 dés (D11). **Le tirage et le lancer sont un seul événement
aléatoire** (D20) : une action `DRAW_AND_ROLL` atomique produit toute la Main.

Ordre de consommation du RNG, figé pour I1 : sélection de tous les dés d'abord, dans
l'ordre du tirage, puis lancer de chacun dans le même ordre.

Recyclage : si le `pool` est vide ou insuffisant, on tire ce qu'il contient, puis le
`discard` est mélangé dans le `pool` (mélange seedé), puis on continue le tirage. Le
recyclage n'est jamais partiel et n'a pas de coût.

Les dés conservés au tour précédent sont déjà dans la Main et **ne sont pas relancés**
(D12). Ils gardent la face qu'ils montraient.

### Phase 2 — Lecture (0 geste, ~1,5 s)
Les intentions sont déjà affichées : elles ont été calculées à la fin du tour précédent
(phase 5), donc elles sont visibles pendant toute l'animation de résolution. Aucune
information n'apparaît en phase 2 ; elle n'existe que dans le budget de temps.

### Phase 3 — Choix (2 à 4 décisions, ~4,5 s)
Le joueur compose une **séquence ordonnée** d'actions. Trois types d'entrée :

| Entrée | Geste | Contrainte |
|---|---|---|
| Pas gratuit | drag du jeton vers une case adjacente libre | une fois par tour |
| Dépense | drag d'un dé de la Main vers une case cible | la cible doit être légale (§ 5) |
| Conservation | tap sur un dé de la Main | 2 au plus (D12) |

**Rien n'est résolu** (D21). L'ordre des entrées est mémorisé : il compte pour Écho et Suite.

**Annulation.** Le bouton *Annuler* retire la **dernière entrée** de la séquence (LIFO).
Un appui long fait *Tout annuler*. Il n'y a pas d'annulation arbitraire au milieu de la
séquence : retirer la 2ᵉ de 3 dépenses obligerait à définir une sémantique de réordonnancement,
donc une UI de tri, donc un geste composé — interdit par `docs/01-boucle-et-pacing.md`.
Coût de l'annulation LIFO : un bouton fixe sous le pouce, 0 s de réflexion.

Les badges de combo (§ 11) s'allument **en direct** pendant cette phase. Les cases visées par
les intentions se **recalculent en direct** si une action déplace un ennemi (§ 8.2). Le joueur
voit donc l'image finale exacte avant de valider : la résolution différée ne lui cache rien.

### Phase 4 — Validation (1 geste, ~0,3 s) — **POINT DE NON-RETOUR**
Un seul tap, bouton fixe en bas à droite. Pas de dialogue de confirmation, jamais.
Si des dés restent en Main sans être conservés, le bouton affiche un badge « n dés perdus »
mais **ne bloque pas**. Passer un tour entier est légal.

### Phase 5 — Résolution (0 geste, ≤ 2,0 s)
Voir § 10 pour l'ordre exact. En résumé :
dépenses du joueur dans l'ordre choisi → combos → morts → phase ennemie → fin de tour →
calcul des intentions du tour suivant.

La résolution est **rejouable en boucle** : `lastTurnLog` est conservé, un bouton *Revoir*
rejoue l'animation sans toucher à l'état.

### Phase 6 — Défausse et fin de tour (automatique)
1. `player.shield = 0`.
2. Les dés dépensés partent au `discard`. Les dés en Main non conservés partent au `discard`.
   Les dés conservés (≤ 2) restent en Main avec leur face.
3. `TURN_END` émis.
4. Chaque ennemi survivant calcule et affiche son intention pour le tour suivant (§ 8).
5. `turn += 1`. Retour en phase 0.

### Plafond dur
**30 tours par combat.** Au-delà, le combat est perdu. Ce n'est pas une règle de jeu, c'est
une garantie de terminaison pour la CI : un build qui bloque indéfiniment ne doit pas faire
tourner le simulateur à l'infini. Un avertissement s'affiche à partir du tour 25. Aucune
partie honnête ne s'en approche : les rencontres les plus longues font 11 tours (§ `run.md`).

---

## 4. Le modèle de dégâts

Il n'y a **aucune valeur sur les dés** (D13). Les chiffres sont sur les *actions* et sur les
*unités*. Toute la course aux nombres tient sur une main d'écran :

| Grandeur | Valeur |
|---|---|
| PV max du joueur au départ | **40** **[T]** |
| Dégâts d'une Frappe | **2** |
| Bouclier d'une Garde | **3** |
| Dégâts de piétinement d'un Élan | **1** par ennemi traversé |
| Dégâts d'une attaque ennemie | 2 à 3 en acte 1, 3 à 4 en acte 2, 4 à 6 en acte 3 **[T]** |
| PV d'un ennemi de base | 3 à 7 **[T]** |

**Ordre d'application d'une instance de dégâts**, sans exception :
1. `Armure` réduit le montant (plancher 0).
2. `Bouclier` absorbe le reste ; le Bouclier consommé disparaît.
3. Le reliquat retire des PV.
4. Si `hp <= 0`, l'unité est marquée `dying` (§ 10.4).

Une instance de dégâts est **atomique** : elle n'est jamais fractionnée entre deux cibles ni
recomposée. C'est ce qui rend `Armure` lisible (« mes petits coups ne passent pas ») et ce qui
rend les reliques simulables.

Garde donne 3 et l'attaque de base ennemie fait 2 ou 3 : **une Garde annule exactement une
attaque de base**. C'est le calage volontaire de tout le système défensif de l'acte 1.

---

## 5. Ce que fait chaque face

Version de base, sans aucune relique. Chaque dépense est **un seul geste** : drag du dé vers
une case.

### Frappe — le verbe central (3 faces sur 6)
> **Frappe.** 2 dégâts à un ennemi situé sur la même ligne orthogonale, à distance 1 ou 2,
> la ligne devant être dégagée.

- La distance ne change rien aux dégâts : 1 ou 2, c'est 2.
- « Ligne dégagée » signifie qu'à distance 2, une unité intercalée bloque la Frappe. Un
  ennemi robuste devant protège donc un ennemi fragile derrière — c'est le problème tactique
  de base de l'acte 1, et la raison d'être d'Élan.
- Cible obligatoire : un ennemi. Pas de dépense à vide (§ 5.5).

Pourquoi portée 2 et pas 1 : à portée 1 pure, un joueur passe la moitié de ses tours à
marcher, ce qui contredit D10 (« déplacement secondaire ») et fait exploser le nombre de tours
par combat. La portée 2 fait gagner environ un tour par combat, soit **8 s × 12 rencontres
= 1 min 36 par run**.

### Garde — la réponse au télégraphe (2 faces sur 6)
> **Garde.** Tu gagnes 3 Bouclier.

- Le Bouclier s'accumule dans le tour (deux Gardes = 6 Bouclier) et **disparaît intégralement
  en fin de tour**. Il ne se reporte jamais.
- Cible : soi-même. Toujours légale.

Garde est délibérément la face la plus pauvre du kit de base. Le Bouclier périssable existe
pour être une **réponse à une intention lue**, pas une accumulation : dans un jeu à zéro
information cachée, se garder « au cas où » ne doit pas être une stratégie. Toute la
profondeur de Garde est reportée sur les reliques (D4) — c'est un choix assumé, pas un oubli.

### Élan — le déplacement ambitieux (1 face sur 6)
> **Élan.** Déplace-toi de 2 ou 3 cases sur un seul axe orthogonal, sans virage. Les unités ne
> t'arrêtent pas : tu les traverses, et chaque ennemi traversé subit 1 dégât. Tu ne peux pas
> terminer sur une case occupée.

Résolution précise :
1. Le joueur choisit une direction (4 possibles) et une distance (2 ou 3). Le drag encode les
   deux : la direction par le sens, la distance par la longueur. Les destinations légales sont
   surlignées — au maximum 8 cases.
2. Le chemin est parcouru **case par case**. Chaque ennemi rencontré subit 1 dégât ; il est
   retiré immédiatement s'il meurt, avant l'évaluation de la case suivante.
3. La case d'arrivée doit être dans la grille et libre au moment de la résolution. Si elle est
   occupée, l'Élan s'arrête sur **la dernière case libre du chemin** — la distance peut se
   raccourcir, jamais s'allonger. Si aucune case du chemin n'est libre, la destination n'était
   pas surlignée et le coup n'a pas pu être posé.
4. Le piétinement est un dégât par ennemi traversé, jamais deux fois le même ennemi.

Élan est la seule réponse de base à un mur de corps et le seul moyen de traverser la moitié de
la grille en un dé. Il est à 1/6 pour cette raison : quand on en tire un, c'est un événement.

### Éclat — le joker (0 face au départ, s'obtient)
> **Éclat.** Au moment de la dépense, choisis Frappe, Garde ou Élan. Le dé exécute cette
> action. Pour tous les combos et tous les crochets de relique, l'Éclat **compte comme la face
> choisie**, et seulement comme elle.

Aucun bonus numérique. Sa puissance est la flexibilité et le fait qu'il rend un Trio ou une
Suite atteignables. Écarté : « l'Éclat compte comme toutes les faces à la fois » — ça
transformerait chaque Éclat en Trio automatique et ferait sauter le contrat de combo (§ 11)
dès la première relique.

Le choix de face est fait à la pose, il est annulable comme n'importe quelle entrée, et il est
visible sur le dé posé. Coût en temps : +0,4 s sur les tours avec Éclat, acceptable puisqu'un
Éclat est par construction rare dans le pool.

### 5.5 Dépense de secours (règle universelle)
> **Tout dé, quelle que soit sa face, peut être dépensé pour un déplacement d'une case
> orthogonale**, à la place de son action.

C'est le filet qui garantit que *jamais* un tirage ne rend un tour inutile — D18 le promet
pour le pas gratuit, cette règle l'étend au cas où le pas gratuit est déjà consommé. Elle donne
aussi au joueur un vrai levier : un tour peut être entièrement converti en mobilité (1 pas
gratuit + 3 dés = 4 cases, ou 7 avec un Élan).

Le dé garde sa face pour les combos : une Frappe dépensée en secours reste une Frappe.

**Ce qui reste interdit : la dépense à vide.** Un dé ne peut jamais être dépensé « pour rien »,
même pour déclencher une relique. Sans cette interdiction, un build à déclenchements ferme
simplement les yeux sur la grille et enchaîne les dépenses stériles : la couche tactique
disparaît. Une relique *peut* accorder cette permission — c'est typiquement une relique du
tiers « explosive » (`docs/03-content-budget.md`), sous surveillance du simulateur.

---

## 6. Le déplacement

| Source | Distance | Coût | Traverse |
|---|---|---|---|
| Pas gratuit (D18) | 1 case orthogonale | gratuit, 1 fois par tour | non |
| Dépense de secours (§ 5.5) | 1 case orthogonale | 1 dé, autant qu'on en a | non |
| Élan | 2 ou 3 cases, un seul axe | 1 dé | oui, 1 dégât par ennemi traversé |
| Poussée (subie) | 1 case, direction imposée | — | non |

Ce qui bloque un déplacement d'une case : le bord de la grille, une unité, un `blocker`.
Ce qui bloque un Élan : rien sur le chemin (il traverse) ; seule la case d'arrivée doit être
libre, et un `blocker` interrompt le chemin (l'Élan s'arrête juste avant).

Le pas gratuit est une **entrée de la séquence**, au même titre qu'une dépense : on peut
frapper, puis se déplacer, puis frapper depuis la nouvelle position. Il ne compte pour aucun
combo et n'émet pas `DIE_SPENT`.

Le pas gratuit ne peut pas être fractionné ni reporté d'un tour à l'autre. Non consommé, il
est perdu.

---

## 7. Mots-clés (liste fermée en v0)

| Mot-clé | Définition exacte |
|---|---|
| **Bouclier N** | Absorbe N dégâts, se consomme, tombe à 0 en fin de tour. Se cumule dans le tour |
| **Armure N** | Réduit de N **chaque instance** de dégâts, plancher 0. Permanente, jamais consommée |
| **Poussée N (direction)** | L'unité se déplace de N cases dans la direction, une case à la fois. Dès qu'une case ne peut pas être occupée (bord, unité, `blocker`), la poussée s'arrête et l'unité subit **1 dégât de choc**, une seule fois quel que soit le nombre de cases restantes |
| **Zone (dégâts D, durée T)** | Marque une case. Toute unité qui s'y trouve à la fin de la phase ennemie subit D dégâts. La zone expire après T tours, décrémentée en phase 0 |

Une poussée hors grille **ne tue pas**. L'éjection instantanée serait la mécanique la plus
forte du jeu dans un système sans nombres sur les dés : les bords deviendraient la seule chose
qui compte, et une relique de poussée vaudrait dix relique de dégâts. Le dégât de choc garde
la poussée intéressante (elle fait mal *et* elle déplace) sans qu'elle devienne l'unique
stratégie. Écarté : l'éjection mortelle façon *Into the Breach*, qui fonctionne là-bas parce
que la grille y est ouverte et le contrôle rare.

`Armure` et `Zone` sont définies ici parce que le moteur en a besoin dès M2 ; aucun ennemi de
départ ne les utilise. Elles entrent à l'acte 2.

---

## 8. Les ennemis et les intentions

### 8.1 Ce qu'est une intention

Une intention est une donnée, calculée en fin de tour et affichée immédiatement :

```
intent = {
  kind,          // attack | move | charge | soutien | zone
  pattern,       // liste d'offsets (dx, dy) relatifs à l'ancre
  value,         // dégâts, Bouclier accordé, ou dégâts de zone
  push,          // { distance, direction } ou null
  path,          // pour move et charge : suite d'offsets parcourus
}
```

Les cinq `kind`, liste fermée pour la v1 :

| `kind` | Ce que ça fait | Introduit |
|---|---|---|
| `attack` | Inflige `value` sur toutes les cases du motif, et applique `push` s'il existe | acte 1 |
| `move` | Parcourt `path`. S'arrête devant le premier blocage et affiche « Bloqué » | acte 1 |
| `charge` | Parcourt `path`, **puis** exécute `attack` avec le motif ancré sur la case d'arrivée | acte 2 |
| `soutien` | Accorde `value` Bouclier (ou Armure) aux unités alliées sur les cases du motif | acte 2 |
| `zone` | Pose une Zone sur les cases du motif | acte 3 |

C'est la réponse à « ce qu'un ennemi peut faire de plus qu'attaquer » : se déplacer, charger,
protéger un allié, interdire du terrain. Quatre verbes, chacun lisible en une icône. Rien
d'autre n'entre en v1 — pas d'invocation, pas de soin, pas de buff de dégâts : chacun de ces
trois-là allonge le combat, et le combat n'a que 40 secondes.

### 8.2 Ancrage — la règle qui rend le télégraphe honnête

**Le motif de cases est figé au moment du télégraphe. L'ancre suit l'unité.**

Concrètement : le Guetteur qui vise le joueur trois cases au sud mémorise l'offset `(0, +3)`,
pas la case absolue. Si le joueur bouge, le tir part quand même sur `(0, +3)` et tombe dans le
vide — **esquiver est la défense principale du jeu**. Si le Guetteur est poussé d'une case, tout
son motif se décale d'une case avec lui.

Cette règle est compatible avec le pilier « zéro information cachée » **uniquement parce que la
résolution est différée** : les cases surlignées se recalculent en direct pendant la phase de
choix, donc le joueur voit le résultat exact de sa poussée avant de valider. Sans D21, cette
règle serait une trahison ; avec D21, elle est gratuite.

Écarté : figer les cases absolues. Déplacer un ennemi n'aurait alors aucun effet défensif, ce
qui viderait de sens la moitié du design de contrôle et rendrait Élan et les poussées purement
offensifs.

### 8.3 Ordre d'initiative

Les ennemis agissent par **index de spawn croissant**, fixe pour tout le combat, affiché sur le
badge d'intention. Écarté : l'ordre de lecture de la grille (haut-gauche vers bas-droite), qui
change dès qu'un ennemi bouge — donc imprévisible pour le joueur, donc une information cachée.

### 8.4 Déterminisme de l'IA (I1, et `balance-simulator` doit pouvoir la rejouer)

Toute décision d'IA est une fonction pure de l'état. Aucun appel au RNG dans le choix d'une
intention. Ordre de départage universel des directions : **Haut, Droite, Bas, Gauche**.

Marche d'une case « vers le joueur » :
1. Considérer les 4 cases adjacentes libres.
2. Garder celles qui réduisent la distance de Manhattan au joueur.
3. S'il en reste, prendre la première dans l'ordre des directions.
4. Sinon, garder celles qui ne l'augmentent pas, même départage.
5. Sinon, ne pas bouger ; l'intention devient `move` avec un `path` vide, affichée « Bloqué ».

Pas de recherche de chemin. Un ennemi se laisse bloquer par un corps : c'est une tactique du
joueur, pas un bug.

---

## 9. Les trois ennemis de départ

Chacun enseigne exactement une chose. Ils sont conçus pour être rencontrés dans cet ordre.

### E1 — Rôdeur — *enseigne : l'intention vise une case, pas toi*

| | |
|---|---|
| PV | 4 |
| Armure | 0 |
| Attaque | 2 dégâts, motif d'une seule case |
| Portée | 1 (orthogonale adjacente) |
| Déplacement | 1 case |

**Choix d'intention :** si le joueur est orthogonalement adjacent → `attack` sur la case du
joueur. Sinon → `move` d'une case vers le joueur.

Meurt en 2 Frappes. C'est le mètre étalon : le joueur apprend qu'un dé et demi de Frappe tue
un Rôdeur, et il calibre tout le reste là-dessus. La leçon arrive au tour 2 de la toute
première rencontre : le Rôdeur télégraphie une case, le joueur fait son pas gratuit, le coup
tombe dans le vide. Rien à lire, rien à expliquer.

### E2 — Guetteur — *enseigne : la ligne et la portée*

| | |
|---|---|
| PV | 3 |
| Armure | 0 |
| Attaque | **3 dégâts**, motif d'une seule case |
| Portée | 2 à 4, en ligne orthogonale dégagée |
| Déplacement | 1 case, jamais vers le joueur à moins de distance 2 |

**Choix d'intention :** s'il existe une ligne orthogonale dégagée vers le joueur de longueur 2
à 4 → `attack` sur la case du joueur. Sinon → `move` d'une case, en préférant dans l'ordre :
(a) une case adjacente libre qui donnerait immédiatement une telle ligne ; (b) la case
adjacente libre qui minimise `min(|dx|, |dy|)` par rapport au joueur ; (c) rester en place.
Il ne se déplace jamais sur une case à distance ≤ 1 du joueur.

C'est la plus grosse frappe de l'acte 1 (3 dégâts, contre 2 partout ailleurs) et le corps le
plus fragile (3 PV, une Frappe + un piétinement d'Élan). La leçon est double mais tient en une
phrase : **casse la ligne ou tue-le tout de suite**. Il apprend aussi au joueur que sortir
d'une ligne orthogonale — donc se placer « en diagonale » — est une position sûre, ce qui est
la compétence spatiale de base de ce jeu.

### E3 — Bélier — *enseigne : la menace qu'on ne supprime pas ce tour-ci*

| | |
|---|---|
| PV | 7 |
| Armure | 0 |
| Attaque | 2 dégâts, motif d'une seule case, **+ Poussée 1** dans la direction opposée au Bélier |
| Portée | 1 |
| Déplacement | 1 case |

**Choix d'intention :** identique au Rôdeur (adjacent → `attack`, sinon → `move`).

Sept PV, c'est quatre Frappes, soit la moitié d'un combat entier. Le joueur ne peut pas le
faire disparaître : il doit le **gérer**. Et la poussée le déplace lui, souvent dans la ligne
d'un Guetteur — c'est la première fois que le jeu punit une position et pas une décision de
dépense. Écarté pour lui : une Armure. Deux règles nouvelles sur le même ennemi, c'est une
leçon de trop ; l'Armure entre à l'acte 2 sur un autre corps.

### Compositions de l'acte 1

| Rencontre | Composition | PV totaux | Leçon |
|---|---|---|---|
| A1 rang 1 (a) | 2 × Rôdeur | 8 | esquiver |
| A1 rang 1 (b) | Rôdeur + Guetteur | 7 | casser la ligne |
| A1 rang 2 (a) | 2 × Rôdeur + Guetteur | 11 | ordre de priorité des cibles |
| A1 rang 2 (b) | Bélier + Guetteur | 10 | le corps qui protège le tireur |
| A1 rang 3 | Rôdeur + Guetteur + Bélier | 14 | tout à la fois |

Les placements de départ sont écrits à la main pour chaque rencontre, jamais générés. Une
rencontre télégraphiée est un petit puzzle ; un placement aléatoire produit de la bouillie.

---

## 10. L'ordre de résolution complet

### 10.1 Vue d'ensemble

```
VALIDATION
  1. Pour chaque entrée de pendingActions, dans l'ordre :
       a. résoudre l'entrée (effet atomique)
       b. drainer la file de déclenchements (§ 12)
       c. retirer les unités mourantes
  2. Résoudre les combos détectés, dans l'ordre canonique (§ 11)
       (même sous-boucle a/b/c)
  3. PLAYER_PHASE_END
  4. Test de victoire  -> si tous les ennemis sont morts : COMBAT_WON, on saute au 8
  5. Test de défaite   -> si player.hp <= 0 : COMBAT_LOST, fin immédiate
  6. Pour chaque ennemi vivant, par index de spawn croissant :
       a. résoudre son intention
       b. drainer la file de déclenchements
       c. retirer les unités mourantes
       d. tester la défaite après chaque ennemi
  7. Résolution des Zones, puis ENEMY_PHASE_END
  8. Fin de tour : Bouclier à 0, défausse, TURN_END, calcul des intentions suivantes
```

### 10.2 Deux unités sur la même case

Ne peut jamais arriver comme état stable. Trois garde-fous :

- Un déplacement d'une case vers une case occupée est **illégal** : il n'est pas proposé au
  joueur, et l'IA ne le choisit pas (§ 8.4).
- Un Élan dont la case d'arrivée est occupée **raccourcit** jusqu'à la dernière case libre du
  chemin (§ 5).
- Une poussée vers une case occupée **échoue** : l'unité reste, 1 dégât de choc (§ 7).

Le moteur asserte l'unicité d'occupation après chaque effet atomique. Une violation est un
crash en développement, pas un avertissement.

### 10.3 Une unité meurt avant d'avoir agi

Son intention est **annulée intégralement**. Pas d'effet partiel, pas de « dernier souffle » de
base. Une relique peut évidemment ajouter un effet de mort, via l'événement `UNIT_DIED`.

### 10.4 Le moment exact de la mort

`hp <= 0` marque l'unité `dying` mais ne la retire pas au milieu d'un effet. Le retrait a lieu
à la fin de l'**effet atomique** en cours, pour toutes les unités mourantes, par `id` croissant,
chacune émettant `UNIT_DIED`. Conséquences voulues :

- Un Élan qui traverse trois ennemis les tue un par un : chaque case est un effet atomique,
  donc un ennemi mort libère sa case avant l'évaluation de la case suivante, et l'Élan peut
  finir sur cette case.
- Une attaque de zone qui tue deux unités les tue simultanément ; leurs déclenchements de mort
  s'empilent dans la file dans l'ordre des `id`.

### 10.5 Une action dont la cible a disparu

Une dépense validée dont la cible n'existe plus au moment de la résolution **fait long feu** :
aucun effet, mais **le dé est bel et bien dépensé, l'événement `DIE_SPENT` est émis, et il
compte pour les combos**. Un joueur qui surtue ne doit pas voir son combo s'effondrer à cause
d'un bon jet.

Un déplacement (pas gratuit, secours, Élan) dont la case d'arrivée est devenue illégale suit
les règles de § 10.2, il ne fait pas long feu.

### 10.6 Un effet qui se déclenche pendant la résolution

Les déclenchements ne sont **jamais ré-entrants**. Ils vont dans une file **FIFO**, drainée
après l'effet atomique courant. Un déclenchement qui en produit un autre l'ajoute en queue.
Le parcours est donc en largeur, la file est bornée (§ 12), et le journal se lit dans l'ordre
chronologique — ce qui est la condition pour que l'animation soit une simple frise et que le
bouton *Revoir* fonctionne.

### 10.7 Le joueur meurt pendant sa propre phase

Possible via une relique à coût en PV. La résolution s'arrête **immédiatement**, les entrées
restantes ne sont pas résolues, les combos ne sont pas résolus. `COMBAT_LOST`.

### 10.8 Poussée hors grille ou dans un mur

Voir § 7 : la poussée échoue, 1 dégât de choc, l'unité ne bouge pas.

### 10.9 Journal d'événements (le contrat pour les reliques et le simulateur)

Le moteur émet, dans cet ordre chronologique strict :

`TURN_START` · `HAND_DRAWN` · `DIE_SPENT{dieId, face, actionKind}` ·
`UNIT_MOVED{unitId, from, to, cause}` · `DAMAGE_DEALT{sourceId, targetId, amount}` ·
`SHIELD_GAINED{unitId, amount}` · `UNIT_PUSHED{unitId, from, to, blocked}` ·
`UNIT_DIED{unitId}` · `COMBO_DETECTED{combo}` · `COMBO_RESOLVED{combo}` ·
`PLAYER_PHASE_END` · `INTENT_RESOLVED{unitId}` · `ENEMY_PHASE_END` · `TURN_END` ·
`COMBAT_WON` · `COMBAT_LOST`

Cette liste est **le seul jeu de crochets** que les reliques peuvent observer. Le format de la
donnée d'effet qui s'y accroche est A10 — décision technique, hors de mon périmètre.

---

## 11. Les combos — contrat A20

Un combo est une **observation** sur la séquence ordonnée des dépenses du tour. En v0, aucun
combo n'a d'effet propre : ce sont des crochets que les reliques observent. La liste est
**fermée** : quatre motifs, jamais un cinquième sans passer par un arbitrage.

### 11.1 Définitions formelles

Soit `S = [f₁, f₂, ..., fₙ]` la séquence des **faces effectives** des dés dépensés ce tour,
dans l'ordre de pose. La face effective d'un Éclat est la face choisie à la pose. Le pas
gratuit n'entre pas dans `S`. Une dépense qui fait long feu (§ 10.5) entre dans `S`. Une
dépense de secours (§ 5.5) entre dans `S` avec sa propre face.

| Combo | Définition |
|---|---|
| **Paire** | Il existe une face `f` telle que `count(S, f) ≥ 2` |
| **Trio** | Il existe une face `f` telle que `count(S, f) ≥ 3` |
| **Écho** | Il existe un indice `i` tel que `fᵢ = fᵢ₊₁` (deux dépenses **consécutives** identiques) |
| **Suite** | `S` contient la sous-séquence **consécutive** `[Frappe, Garde, Élan]`, dans cet ordre exact |

### 11.2 Règles du contrat

1. **Les combos ne sont pas exclusifs.** Un Trio satisfait aussi Paire. Un Écho satisfait aussi
   Paire. Les trois se déclenchent.
2. **Chaque combo se déclenche au plus une fois par tour**, quelle que soit la longueur de `S`.
   Six Frappes dépensées donnent une Paire et un Trio, pas trois Paires.
3. **Détection à la validation**, sur la séquence finale. Le badge s'allume donc en direct
   pendant la phase de choix, ce qui est le vrai apport : le joueur voit son combo se former
   *avant* le point de non-retour.
4. **Résolution après la dernière dépense**, dans l'ordre canonique fixe :
   **Paire → Écho → Trio → Suite**. Cet ordre est une règle, pas une convention : il rend le
   résultat reproductible bit pour bit quand plusieurs reliques s'accrochent à plusieurs combos.
5. `S` peut dépasser 3 éléments si une relique accorde des dés supplémentaires. Toutes les
   définitions restent valides à n'importe quelle longueur — c'est la raison pour laquelle Écho
   et Suite exigent la **consécutivité** : sans elle, elles deviennent triviales dès qu'on
   dépense cinq dés, et les reliques qui s'y accrochent perdent toute condition.

### 11.3 Ce que le contrat interdit

- Aucun combo ne peut s'accrocher à autre chose qu'à `S`. Pas de combo sur les faces
  *conservées*, pas de combo sur les faces du tour précédent, pas de combo sur les cases.
- Aucune relique ne peut ajouter un motif : elle peut accrocher un des quatre, avec des
  conditions supplémentaires de son cru, mais le moteur n'émet que ces quatre `COMBO_DETECTED`.

Écarté : détecter les combos au fil de la pose et les résoudre à l'instant où ils se complètent.
C'est plus « juteux » en apparence, mais ça met les combos dans la boucle de récursion (une
relique de combo qui accorde un dé peut compléter un autre combo), ça rend l'ordre de résolution
dépendant de l'ordre de pose de manière non triviale, et ça oblige à résoudre pendant la phase
de choix — ce qui casse D21.

---

## 12. Limite de récursion des déclenchements — invariant I3 / point A9

| Paramètre | Valeur |
|---|---|
| Déclenchements totaux par tour | **20** |
| Déclenchements d'une même relique par tour | **6** |
| Discipline de file | FIFO, en largeur, jamais ré-entrante |

**D'où sortent ces nombres.** Ils sont dérivés du budget de temps, pas d'une intuition. La
résolution dispose de 2,0 s (§ 14). Une animation de déclenchement lisible, avec regroupement
des déclenchements consécutifs identiques, coûte environ 100 ms. **20 × 100 ms = 2,0 s** : le
plafond est exactement ce que le budget de pacing autorise à montrer au joueur. Un plafond plus
haut produirait mécaniquement des tours qu'on ne peut pas afficher.

Contrôle de cohérence par rapport au jeu réel : un tour ordinaire d'acte 1 produit 3 à 5
déclenchements ; un tour d'acte 3 avec un build de synergie abouti en produit 10 à 14. **20
laisse donc de la marge au fantasme du « build absurde » tout en le bornant.** Le sous-plafond
de 6 par relique existe pour un cas précis : deux reliques qui se renvoient la balle
consommeraient tout le budget à elles seules et étoufferaient les huit autres.

**Comportement à la saturation.** Les déclenchements excédentaires sont **abandonnés
silencieusement dans la logique**, mais le journal affiche une ligne « limite de déclenchements
atteinte » et le HUD un petit indicateur — I5 interdit qu'un effet disparaisse sans que le
joueur puisse le voir.

**Ce que `balance-simulator` doit mesurer.** Le nombre de déclenchements par tour, distribution
complète. Signal d'alerte : **p99 > 12**. Si le 99ᵉ centile approche le plafond, c'est que le
plafond fait du travail d'équilibrage, ce qui n'est pas son rôle : il faut alors corriger la
relique, pas monter le plafond.

Écarté : pas de plafond, avec détection de cycle. La détection de cycle attrape les boucles
strictes mais pas les chaînes finies et gigantesques, qui sont le vrai problème sur un
téléphone — une chaîne de 400 déclenchements termine correctement et rend le jeu injouable.

---

## 13. Victoire, défaite, et ce qui traverse le combat

### 13.1 Victoire
Tous les ennemis sont morts. Le test est fait **après la résolution complète de la phase du
joueur, combos inclus** (§ 10.1, étape 4). La phase ennemie est sautée. Le tour n'est pas
compté comme perdu : les reliques `TURN_END` se déclenchent normalement, puis `COMBAT_WON`.

Pourquoi terminer la phase du joueur au lieu de s'arrêter au dernier mort : parce que les
dépenses sont déjà validées et que les combos doivent rester honnêtes (§ 10.5). Coût réel :
environ 0,3 s sur le dernier tour d'un combat.

### 13.2 Défaite
`player.hp <= 0` à n'importe quel instant → `COMBAT_LOST` immédiat, résolution interrompue.
La run se termine (permadeath, D8/concept). Pas de « second souffle » de base ; c'est un
territoire de relique.

### 13.3 Ce qui traverse

| Élément | Traverse un combat ? | Traverse la run ? |
|---|---|---|
| PV et PV max | — | **oui** |
| Composition du `pool` | — | **oui** (c'est le personnage, pilier 1) |
| Reliques | — | **oui** |
| Monnaie | — | **oui** |
| Bouclier | non | non |
| Statuts (Zone, etc.) | non | non |
| **Main et dés conservés** | **non** | non |
| Répartition `pool` / `discard` | **non** : tout retourne au `pool`, remélangé | non |

**Décision : la Main ne traverse pas les combats.** Chaque combat commence avec une Main vide,
un `discard` vide et un `pool` complet remélangé. Le premier tirage du combat est un tirage
normal de 3 dés.

Trois raisons, dans l'ordre de leur poids :
1. **Mémoire du joueur.** Reporter deux dés à travers un écran de récompense, un écran de carte
   et parfois trois jours d'interruption oblige le joueur à se souvenir d'une décision prise
   dans un autre contexte. C'est exactement ce que l'interruptibilité mobile interdit.
2. **Ça corrompt le dernier tour de chaque combat.** Avec report, le tour qui tue le dernier
   ennemi devient un tour d'optimisation (« je conserve deux Frappes pour le combat suivant »)
   au lieu d'être un tour de récompense. On ajouterait une décision par combat, au pire endroit.
3. **Le pilier 1 y gagne.** Si la Main ne traverse pas, la *seule* chose qui traverse est la
   composition du `pool`. Le pool redevient la fiche de personnage, sans bruit.

Écarté : reporter les dés conservés d'un combat au suivant. C'est plus riche sur le papier — ça
crée une méta-décision de fin de combat — mais ça paye ce petit gain avec les trois coûts
ci-dessus, dont le premier est rédhibitoire sur mobile.

Le `pool` complet est remélangé à chaque combat, ce qui empêche aussi un état invisible
pernicieux : sans remélange, la dernière rencontre d'un acte pourrait commencer avec un `pool`
presque vide, une information que le joueur devrait suivre entre deux écrans. C'est un cas
d'école de violation de l'esprit d'I5.

---

## 14. Vérification contre le budget de temps

Contrat de `docs/01-boucle-et-pacing.md` : combat normal 40 s, 4 à 6 tours, donc **8,0 s par
tour complet, résolution comprise**, avec 2 à 4 décisions.

| Phase | Coût | Détail |
|---|---|---|
| 0 — Début de tour | 0,0 s | aucune décision, aucune animation bloquante |
| 1 — Tirage | 0,5 s | un événement aléatoire (D20), animation interruptible au tap |
| 2 — Lecture | 1,5 s | uniquement quand les intentions changent |
| 3 — Choix : 3 dépenses | 3,3 s | 1,1 s par drag |
| 3 — Choix : pas gratuit | 0,6 s | utilisé environ 60 % des tours |
| 3 — Choix : conservation | 0,3 s | 0 tap par défaut, 1 tap quand on conserve |
| 4 — Validation | 0,3 s | un tap, bouton fixe |
| 5 — Résolution | **1,5 s** | joueur ~0,6 s + ennemis ~0,9 s, plafond dur 2,0 s |
| 6 — Défausse | 0,0 s | enchaîne automatiquement sur le tirage suivant |
| **Total** | **8,0 s** | |

Le compte tombe **pile sur le budget, sans marge**. Trois exigences en découlent, et ce sont des
exigences de développement, pas des vœux :
- toute animation est interruptible au tap et l'état saute à sa fin ;
- il n'y a **aucun tap entre la fin d'un tour et le tirage suivant** ; le tour s'enchaîne seul ;
- la résolution est **plafonnée à 2,0 s** quel que soit le nombre de déclenchements, ce qui est
  précisément le raisonnement qui fixe le plafond à 20 (§ 12).

### Ce que chaque règle coûte, et son arbitrage

| Règle | Coût par tour | Coût par run | Verdict |
|---|---|---|---|
| Conservation (D12) | +0,3 s | +18 s | **gardée** : c'est la tension centrale de la boucle de tour |
| Pas gratuit (D18) | +0,6 s | +36 s | **gardé** : imposé par D18, et il rend le télégraphe intéressant |
| Choix de distance de l'Élan (2 ou 3) | +0,4 s, ~1 tour sur 3 | +8 s | **gardé** : sans le choix de distance, Élan ne peut plus se poser précisément, et il perd sa raison d'être. Alternative écartée : Élan toujours de 3 cases |
| Choix de face de l'Éclat | +0,4 s sur les tours à Éclat | +6 s | **gardé** : c'est toute la valeur de la face |
| Ordre des dépenses (combos) | **0,0 s** | 0 s | l'ordre est celui de la pose, l'annulation est LIFO. Aucune UI de tri |
| Recalcul en direct des intentions (§ 8.2) | **0,0 s** | 0 s | c'est un rendu, pas une décision |
| Portée 2 de la Frappe | **−8 s par combat** | **−1 min 36** | c'est la règle qui finance toutes les autres |

Sans la portée 2 de la Frappe, la somme ci-dessus sort du budget. C'est l'arbitrage central de
ce document.

---

## 15. Ce que je laisse ouvert, et pour qui

- **`progression-designer`** : PV max de départ (40 est un point de départ), catalogue des
  opérations de Forge, courbe de dégâts par tour du joueur (§ `run.md` la suppose), et la
  recommandation que la relique signature du personnage de départ s'accroche à **Paire** —
  c'est ce qui enseigne les combos sans écran de tutoriel.
- **`item-designer`** : le format de la donnée d'effet (A10), les prix, la distribution des
  raretés, et deux permissions à traiter comme des reliques « explosives » : *dépenser un dé
  sans cible* (§ 5.5) et *poser une deuxième dépense de secours gratuite*.
- **`balance-simulator`** : mesurer les déclenchements par tour (alerte p99 > 12), la durée de
  tour réelle, le nombre de tours par rencontre, et faire varier le plafond de conservation
  (D12) qui reste le premier curseur du système.
- **`mobile-ux`** : la zone de drop d'un Élan (8 destinations surlignées est le maximum que je
  m'autorise ; si le pouce ne suit pas, il faudra passer à un sélecteur de direction en deux
  temps, et ça coûtera 0,4 s de plus par Élan).
