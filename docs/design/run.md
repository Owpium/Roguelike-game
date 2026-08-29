# Run — carte, rencontres, récompenses, difficulté

> Agent responsable : `game-designer`. Statut : **v1, implémentable**.
> Complète `docs/design/combat.md`. Cadre : concept figé, D15 (3 à 6 runs avant la première
> victoire), budget de temps de `docs/01-boucle-et-pacing.md`.
> **[T]** = paramètre de tuning.

---

## 1. Forme d'une run

3 actes. Chaque acte : **3 rangs de rencontres + 1 boss**. 12 rencontres au total sur le
chemin, dont 3 boss (concept figé).

```
            ACTE n
  rang 1     [ A ]   [ B ]              2 nœuds, tous deux Combat
               \ X /
  rang 2   [ C ] [ D ] [ E ]            3 nœuds : Combat / Repos / Boutique ou Événement
               \ | /
  rang 3     [ F ]   [ G ]              2 nœuds : Combat / Élite
                \   /
  rang 4       [ BOSS ]
```

### Connexions
**Tout nœud d'un rang est relié à tous les nœuds du rang suivant.** Le choix est libre à
chaque rang, indépendamment du précédent.

Décision (point A6). Carte **entièrement visible à l'avance**, un acte tient sur un écran de
téléphone sans défilement (4 rangs × ~90 pt = 360 pt).

Écarté : le graphe branché à connexions restreintes façon *Slay the Spire*. Il apporte la
planification à trois nœuds d'avance, mais il apporte aussi des arêtes qui se croisent — et à
390 pt de large, des arêtes croisées sont soit illisibles, soit obligent à faire défiler la
carte, ce qui coûte un geste et casse « l'état tient sur un écran ». On garde 90 % du bénéfice
(voir tout l'acte à l'avance, savoir où est le Repos) pour 0 % du coût de lisibilité.

Conséquence assumée : le chemin n'est pas un puzzle d'itinéraire, c'est **trois choix
indépendants par acte**. Ça reste 9 décisions de chemin par run.

### Composition des rangs

| Rang | Nœuds | Règle |
|---|---|---|
| 1 | 2 | **Toujours deux Combats**, de compositions différentes et de budget de PV identique. On choisit *quelle menace* on affronte, pas *si* on se bat. Un acte ouvre toujours par un combat : c'est ce qui pose la menace |
| 2 | 3 | **Combat**, **Repos**, et un troisième : Événement en acte 1, Boutique en actes 2 et 3 |
| 3 | 2 | **Combat** et **Élite** |
| 4 | 1 | **Boss** |

La Boutique n'apparaît pas en acte 1 : au premier rang 2, le joueur a gagné une seule
rencontre, il n'a rien à dépenser. Un magasin vide est une décision qu'on lui fait perdre.

### Nombre de combats par run
Par acte : 1 (rang 1) + 0 ou 1 (rang 2) + 1 (rang 3) + 1 boss = **3 ou 4 rencontres**.
Sur une run : **9 à 12 rencontres, dont 6 à 9 combats normaux**.

C'est volontaire : sauter un combat pour se soigner, c'est renoncer à une relique. Le budget
de `docs/01-boucle-et-pacing.md` suppose 9 combats normaux ; les deux extrêmes tiennent :

| Chemin | Combats | Non-combats | Durée |
|---|---|---|---|
| Tout combat (rang 2 = Combat, rang 3 = Élite) | 9 + 3 boss | 0 | 9×40 + 3×95 + 12×6 = **12 min 17** |
| Tout évitement (rang 2 = Repos, rang 3 = Combat) | 6 + 3 boss | 3 | 6×40 + 3×95 + 9×6 + 3×25 = **10 min 54** |

Les deux sont dans la fenêtre 10-15 min. La borne haute est le chemin gourmand, ce qui est
sain : le joueur qui prend des risques joue un peu plus longtemps.

---

## 2. Types de nœuds

| Nœud | Durée | Ce qu'on y fait |
|---|---|---|
| **Combat** | 40 s | Une rencontre de `combat.md`. Récompense : relique + monnaie |
| **Élite** | 65 s | Un mini-boss. Nettement plus dur, nettement mieux payé |
| **Boss** | 95 s | Fin d'acte. Obligatoire |
| **Repos** | 15 s | Un choix parmi deux : **Soin +10 PV** **[T]**, ou **Forge** (une modification du `pool`) |
| **Boutique** | 35 s | 3 reliques + 2 opérations de Forge, à prix affichés. On peut ne rien acheter |
| **Événement** | 25 s | Texte court (≤ 300 caractères), 2 ou 3 choix, effet sur PV / `pool` / relique / monnaie |

Le Repos est le seul endroit où l'on **sculpte le pool** en dehors des événements. C'est
délibéré : c'est ce qui fait de lui un vrai concurrent du combat au rang 2, y compris pour un
joueur en pleine santé. Le catalogue des opérations de Forge appartient à
`progression-designer`.

---

## 3. Récompenses (point A7)

| Source | Relique | Monnaie | Autre |
|---|---|---|---|
| Combat normal | 1 au choix parmi 3, communes et peu communes | 10-14 **[T]** | — |
| Élite | 1 au choix parmi 3, dont au moins 1 rare | 22-28 **[T]** | — |
| Boss | 1 au choix parmi 3 rares | 30-35 **[T]** | Soin **+5 PV** après les boss 1 et 2 |
| Événement | variable | variable | variable |
| Boutique | achat | — | — |

**Décision : une relique par combat gagné, choisie parmi 3, avec l'option de refuser.**
Refuser rend **8 pièces** **[T]**. Le nombre de reliques en fin de run tombe à **12-15**, ce
qui est la fourchette visée par A7 :

```
6 à 9 combats + 0 à 3 élites + 3 boss + 0 à 4 achats  ->  10 à 19, médiane ~13
```

**Décision : une seule monnaie** (point A12, partiellement tranché — le nom appartient à
`lore-keeper`, les prix à `item-designer`). Écarté : deux monnaies. La méta-progression est un
déblocage de contenu (D3), donc elle n'a pas besoin d'une monnaie ; une seconde monnaie
n'aurait servi qu'à découper artificiellement l'économie d'une run de 12 minutes.

### Refus et retrait (point A8)

- **On peut toujours refuser une relique.** Bouton *Passer* sur l'écran de récompense, qui rend
  de la monnaie.
- **On ne peut jamais retirer une relique déjà prise.** Aucun service de retrait, ni en
  boutique, ni au Repos, ni en événement.
- **En revanche, on peut toujours retirer un dé du `pool`** à la Forge.

Cette asymétrie est le cœur de la décision. Refuser est un **choix**, pris avec l'information du
moment ; retirer est une **optimisation**, prise plus tard avec plus d'information. Dans un jeu
dont le plaisir est l'empilement de synergies (D4), autoriser le retrait fait converger toutes
les runs vers le même petit ensemble optimal, et efface le coût d'un mauvais choix — donc le
poids de tous les choix. Le refus au moment de la récompense suffit à protéger un build pur.

Le `pool`, lui, est la partie **sculptable** du personnage ; les reliques sont la partie
**accumulée**. Cette division est ce qui donne deux textures différentes à la progression.

Écarté : le retrait payant en boutique façon *Slay the Spire*. Ça marche là-bas parce que le
deck fait 30 cartes et que la dilution est le vrai problème ; ici le `pool` fait 6 à 10 dés et
la Forge s'en occupe déjà.

---

## 4. Génération de la carte

Déterministe à partir de la seed de la run (I1).

1. La forme de l'acte (rangs, types de nœuds) est **fixe**, jamais tirée au sort.
2. Pour chaque nœud de Combat, une rencontre est tirée dans le catalogue de l'acte, **sans
   remise sur la run entière**. Deux nœuds du même rang ne proposent jamais la même rencontre.
3. Le contenu de la Boutique et l'Événement sont tirés au sort à la génération de la run, pas à
   l'entrée du nœud : la carte est entièrement déterminée dès le début, ce qui rend une run
   rejouable à l'identique pour reproduire un bug.
4. Le placement des unités d'une rencontre est **écrit à la main** dans le catalogue, jamais
   généré. Une rencontre télégraphiée est un petit problème posé ; un placement aléatoire
   produit du bruit.

Le catalogue de rencontres de la v1 : ~8 par acte, soit 24 rencontres écrites à la main pour
18 ennemis (`docs/03-content-budget.md`). Le vertical slice M3 en demande 4 pour l'acte 1.

---

## 5. Courbe de difficulté

### 5.1 Les deux grandeurs qui pilotent tout

- **DPT** — dégâts par tour attendus du joueur, pour un build médian. C'est
  `progression-designer` qui possède cette courbe ; les valeurs ci-dessous sont l'hypothèse de
  travail dont dérivent tous les budgets de PV ennemis.
- **Marge de survie** — `PV courants ÷ dégâts entrants attendus de la prochaine rencontre`.
  C'est le nombre de rencontres que le joueur peut encaisser avant de mourir. **C'est la
  grandeur que ce document contrôle**, et c'est elle que `balance-simulator` doit tracer.

### 5.2 Table des rencontres

Budget de PV ennemis ≈ `DPT × nombre de tours visé`. Dégâts entrants pour un build **médian** ;
un bon build encaisse environ 60 % de ces valeurs en acte 3, parce qu'il termine les combats
plus vite.

| Rencontre | DPT attendu | PV ennemis | Ennemis | Tours visés | Dégâts entrants |
|---|---|---|---|---|---|
| A1 rang 1 | 3,0 | 7-8 | 2 | 4 | 3 |
| A1 rang 2 | 3,5 | 10-11 | 2-3 | 4 | 4 |
| A1 rang 3 | 3,5 | 14 | 3 | 5 | 5 |
| A1 élite | 3,5 | 22 | 2 | 6 | 7 |
| **Boss 1** | 4,0 | 30 | 1 + renforts | 8 | 8 |
| A2 rang 1 | 5,0 | 24 | 3 | 5 | 6 |
| **A2 rang 2 — pic** | 5,5 | **32** | 3-4 | **6** | **10** |
| A2 rang 3 | 6,0 | 30 | 3 | 5 | 7 |
| A2 élite | 6,0 | 40 | 3 | 7 | 11 |
| **Boss 2** | 6,5 | 60 | 1 + renforts | 9 | 12 |
| A3 rang 1 | 8,0 | 42 | 4 | 5 | 7 |
| A3 rang 2 | 8,5 | 48 | 4 | 6 | 8 |
| A3 rang 3 | 9,0 | 50 | 4 | 6 | 8 |
| A3 élite | 9,0 | 62 | 3 | 7 | 12 |
| **Boss 3** | 10,0 | 95 | 1 + renforts | 10 | 15 |

Vérifications :
- Combats normaux : **4 à 6 tours** partout. ✔ contrat de pacing.
- Boss : 8 à 10 tours × 8 s = **64 à 80 s**, plus les phases de boss et la lecture des
  nouvelles intentions ≈ **95 s**. ✔ fenêtre 90-120 s.
- Le DPT triple entre le début de l'acte 1 (3,0) et le boss 3 (10,0). ✔ cible de
  `docs/02-systemes-v0.md`.

### 5.3 Le pic de mortalité : acte 2, rang 2

La rencontre la plus meurtrière de la run n'est pas le boss 3, c'est **le combat du rang 2 de
l'acte 2** :

- son budget de PV ennemis est **+20 % au-dessus** de la ligne de l'acte 2 ;
- c'est le premier combat qui **combine deux menaces de nature différente** (un ennemi à
  distance et un ennemi qui interdit du terrain), donc le premier qui punit une position et non
  une dépense ;
- il tombe au moment précis où le joueur a 6 ou 7 reliques : assez pour croire que son build
  existe, pas assez pour qu'il fonctionne. C'est la définition de la phase « affirmation » de
  `docs/01-boucle-et-pacing.md`.

**Et c'est exactement le rang qui offre le Repos.** La rencontre la plus dure de la run partage
son rang avec le nœud le plus sûr. La mort au pic est donc toujours le résultat d'un **choix
gourmand**, jamais d'un mur : le joueur peut toujours nommer ce qui l'a tué (« j'ai pris le
combat au lieu du repos »), ce que D15 exige de la première run.

### 5.4 Courbe de PV et marge de survie

Hypothèse : PV max 40, Repos +10, boss 1 et 2 +5.

**Chemin prudent** (rang 2 = Repos, rang 3 = Élite), build médian :

| Étape | PV | Marge de survie |
|---|---|---|
| Départ | 40 | 13,3 |
| Après A1 r1 et r3, Repos pris | 40 − 3 − 5 + 10 = 40 (plafonné) | 5,7 |
| Après A1 élite | 33 | 4,1 |
| Après boss 1 (+5) | 30 | 5,0 |
| Après A2 r1 | 24 | **2,4 ← minimum de la run** |
| Repos | 34 | 3,1 |
| Après A2 élite | 23 | 1,9 |
| Après boss 2 (+5) | 16 | 2,3 |
| Acte 3, bon build (×0,6) | 16 → 12 → 7 | ~1,0 au boss 3 |

**Chemin gourmand** (tout combat), build médian : mort attendue entre A2 rang 2 et A2 élite.
C'est le comportement voulu.

**Contrat mesurable pour `balance-simulator`** :
- la marge de survie minimale d'une run doit tomber **entre A2 rang 1 et A2 rang 3** dans plus
  de 70 % des runs simulées ;
- cette marge minimale doit valoir **2,0 à 3,0** pour un build médian sur chemin prudent ;
- si le minimum se déplace vers l'acte 3, le boss final est devenu un mur — on baisse les
  dégâts entrants de l'acte 3, jamais les PV du boss.

### 5.5 Distribution des morts visée (D15)

| Où | Part des runs perdues |
|---|---|
| Acte 1 | 10 % |
| Acte 2, rangs 1-3 | 35 % |
| Boss 2 | 10 % |
| Acte 3, rangs 1-3 | 20 % |
| Boss 3 | 25 % |

Taux de victoire visé : **25-30 % en découverte**, **55-60 % en maîtrise** (D15). Un joueur qui
arrive au boss 3 avec un build constitué gagne **~60 %** — ce qui, croisé avec la table
ci-dessus, veut dire qu'environ 45 % des runs atteignent le boss 3.

Corollaire : mourir en acte 1 doit être **rare et évident**. Aucune rencontre de l'acte 1 ne
doit pouvoir infliger plus de 12 dégâts à un joueur qui fait des erreurs — c'est-à-dire moins
d'un tiers de ses PV. L'acte 1 enseigne, il ne trie pas.

### 5.6 Ce qui monte, acte par acte

| | Acte 1 | Acte 2 | Acte 3 |
|---|---|---|---|
| Ennemis par rencontre | 2-3 | 3-4 | 4 |
| Dégâts d'une attaque | 2-3 | 3-4 | 4-6 |
| `kind` d'intention introduits | `attack`, `move` | `charge`, `soutien` | `zone` |
| Mots-clés introduits | Poussée | Armure | Zone |
| Rencontres avec `blocker` de décor | 0 | 1 sur 8 | 3 sur 8 |

La difficulté monte par **le nombre de menaces simultanées et la nature des intentions**, pas
par l'inflation des PV ennemis seule. Un ennemi d'acte 3 doit poser un problème que le joueur
n'a jamais résolu, pas le même problème avec un chiffre plus gros. Règle de production : **une
rencontre n'introduit jamais deux nouveautés à la fois** — une nouvelle intention *ou* un
nouveau mot-clé *ou* un nouveau décor.

---

## 6. Rythme des récompenses

Ce que le joueur reçoit, dans l'ordre, sur un chemin prudent :

```
A1r1 combat   -> relique 1  + monnaie
A1r2 REPOS    -> soin, ou une modification du pool
A1r3 élite    -> relique 2 (rare possible) + monnaie
BOSS 1        -> relique 3 (rare) + monnaie + 5 PV
A2r1 combat   -> relique 4  + monnaie
A2r2 REPOS    -> soin / forge          <- le rang du pic de mortalité
A2r3 élite    -> relique 5 + monnaie
BOSS 2        -> relique 6 (rare) + monnaie + 5 PV
A3r1 combat   -> relique 7 + monnaie
A3r2 BOUTIQUE -> 0 à 3 reliques achetées
A3r3 élite    -> relique 8 + monnaie
BOSS 3        -> fin
```

Sur ce chemin, **8 à 11 reliques**. Sur un chemin gourmand, 12 à 15. Le joueur prudent est plus
sain mais moins puissant : c'est le bon arbitrage à lui offrir, et c'est mesurable — les deux
stratégies doivent finir la run entre 35 % et 65 % du temps, comme n'importe quel archétype
(`docs/03-content-budget.md`).

**Trou de récompense à surveiller.** Le chemin prudent traverse le rang 2 sans relique dans les
trois actes. Trois rencontres de suite sans nouvelle relique, ça se sent. Correctif de design
déjà intégré : le Repos offre la Forge, qui est une modification du `pool` — donc une montée en
puissance visible sur la fiche de personnage (pilier 1), et pas seulement des PV. C'est la
raison pour laquelle la Forge est au Repos et pas ailleurs.

---

## 7. Points laissés ouverts

- **`progression-designer`** : la courbe de DPT du § 5.2 est mon hypothèse de travail, elle est
  la sienne à valider ; le catalogue des opérations de Forge ; la valeur du soin au Repos (+10)
  et des PV max (40), qui sont les deux curseurs les plus directs de la marge de survie.
- **`item-designer`** : les prix de la Boutique, la distribution des raretés par acte, et le
  remboursement du refus (8 pièces) qui doit rester inférieur au prix de la relique la moins
  chère, sans quoi refuser devient un moteur économique.
- **`lore-keeper`** : le nom de la monnaie, les noms des types de nœuds, les 12 événements.
- **`balance-simulator`** : tracer la marge de survie par rencontre (§ 5.4), la distribution des
  morts (§ 5.5), la durée réelle de chaque chemin (§ 1), et vérifier que les deux chemins
  extrêmes tiennent tous les deux dans 10-15 min.
- **Non tranché volontairement** : la difficulté d'ascension (A16), qui multipliera les tables
  du § 5.2. Rien avant M6.
