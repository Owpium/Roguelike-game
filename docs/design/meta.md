# Méta-progression — déblocage de contenu

> Agent responsable : `progression-designer`. Statut : **v1**.
> Cadre : **D3** (déblocage de contenu, jamais de puissance), D15 (3 à 6 runs avant la
> première victoire), `docs/03-content-budget.md`.
> **[T]** = paramètre de tuning · **[H]** = hypothèse à mesurer par `balance-simulator`.

---

## 1. Le contrat, et comment on le vérifie

D3 dit : « déblocage de **contenu**, jamais de **puissance** ». C'est une intention. Elle ne
sert à rien tant qu'on ne peut pas mesurer qu'on l'a tenue — parce que ajouter une relique au
catalogue *ressemble* à ajouter de la puissance, et parfois c'en est.

> **Contrat maître.** Le taux de victoire de `SOCLE` avec le **catalogue complet** ne doit
> pas dépasser de plus de **3 points** son taux avec le **catalogue de départ**, à difficulté
> de référence et à nombre de runs simulées égal. **[T]**

Au-delà de 3 points, le joueur à 100 runs est objectivement plus fort que le joueur à 3 runs,
et D3 est violé. En dessous de −3 points, on a fait pire : on a dilué le catalogue avec du
contenu faible.

C'est la mesure la plus importante de ce document. Elle est calculable dès que le simulateur
sait charger un sous-ensemble du catalogue.

### Ce qui ne se débloque jamais — liste noire

Elle existe pour que la question ne se repose pas dans six mois, un soir où un déblocage
paraîtra tiède.

- PV maximum, soins, `Armure` de départ
- Dégâts de la Frappe, Bouclier de la Garde, portée, distance de l'Élan
- Taille de la Main, plafond de conservation, nombre de relances
- Taille ou composition du pool de départ d'un personnage
- Prix de boutique, montant du refus, quantité de monnaie gagnée
- Probabilité d'apparition d'une rareté
- **Toute forme de monnaie de méta, de point à dépenser, de bonus permanent, d'arbre.**

Il n'y a **aucune ressource qui traverse les runs**. La monnaie de `run.md` est intra-run et
disparaît à la mort. La seule chose qui traverse une run est la liste des contenus débloqués
— et le savoir-faire du joueur, qui est le vrai sujet.

### Ce qui se débloque

| Catégorie | Au départ | Débloquable | Total v1 |
|---|---|---|---|
| Personnages | 1 | **3** | 4 |
| Reliques | 22 | **38** | 60 |
| Ennemis | 10 | **8** | 18 |
| Mini-boss (élites) | 2 | **1** | 3 |
| Événements non-combat | 5 | **7** | 12 |
| Objectifs de déblocage | — | — | **20** |

Ces nombres tombent exactement sur `docs/03-content-budget.md`. Ce n'est pas une coïncidence :
le budget de contenu est la contrainte, la liste d'objectifs en découle.

**Biomes : aucun n'est débloquable, et c'est un écart assumé.** Le concept les cite comme
contenu déblocable, mais le budget v1 en prévoit trois pour trois actes. Verrouiller le biome
2 verrouillerait l'acte 2, donc la moitié de la run : inacceptable dans un roguelike à
permadeath où la run complète doit être visible dès la première partie. Ce qui varie dans un
biome, ce sont ses ennemis et ses rencontres — et ceux-là se débloquent. Si un quatrième
biome apparaît un jour, il redeviendra un déblocage. À reporter dans A13.

### Trois règles de forme

1. **Une run complète est jouable dès la run 1.** Trois actes, trois boss, la carte entière.
   On ne verrouille jamais du chemin.
2. **Aucun objectif ne dépend d'un tirage.** « Trouver la relique X » est du grind déguisé en
   objectif. Tous les objectifs ci-dessous sont des **actions du joueur** ou des **jalons de
   parcours**.
3. **Aucun objectif ne récompense le fait de jouer mal.** Pas de « perds trois fois de
   suite », pas de « termine à 1 PV ».

---

## 2. Le mur de grind — le calcul, avant la liste

La question à poser à chaque déblocage est : **combien de runs pour l'obtenir ?** Au-delà
d'environ 6 runs pour un déblocage majeur, c'est du grind déguisé.

> **Deux garde-fous chiffrés :**
> - **Aucun déblocage majeur (un personnage) ne dépasse 6 runs d'espérance.** **[T]**
> - **Espérance de déblocages : ≥ 0,8 par run sur les runs 1 à 10, ≥ 0,4 sur les runs 11 à
>   25.** **[T]**

Le second est le plus important des deux. Un jeu peut avoir des déblocages lointains sans
être un jeu de grind, **à condition qu'il en ait beaucoup de petits en chemin**. Le mur ne
naît pas de la distance, il naît du silence : trois runs sans rien débloquer, et le joueur
conclut qu'il n'avance plus. La forme correcte de la fin de liste est donc **nombreuse et
petite**, jamais **rare et grosse**.

**Porte de secours des déblocages majeurs.** Tout déblocage conditionné à une victoire a une
condition alternative fondée sur la **progression**, jamais sur la répétition. Le personnage
4 se débloque en gagnant une run **ou** en atteignant le boss 3 trois fois : un joueur qui
bute au dernier combat continue d'avancer, et il n'est jamais récompensé d'avoir perdu — il
est récompensé d'être arrivé loin.

---

## 3. L'ordre de déblocage est un parcours d'apprentissage

Les trois personnages déblocables ne sont pas rangés par puissance ni par difficulté
d'obtention : ils sont rangés par **ce qu'ils enseignent**, et chacun enseigne ce que le
précédent n'enseigne pas (voir `personnages.md` § 1).

| Ordre | Personnage | Ce qu'il ajoute au vocabulaire du joueur | Pourquoi pas avant |
|---|---|---|---|
| 1 | `SOCLE` | les faces, la grille, les intentions, la **Paire** | — |
| 2 | `RELANCE` | le tirage se **corrige** ; un pool plus gros est un pool plus **sale** | Il faut avoir subi un mauvais tirage avant de vouloir le réparer. Un joueur qui n'a pas encore vu trois Gardes tomber ensemble ne comprend pas ce qu'on lui offre |
| 3 | `GRAVURE` | conserver est un **investissement** ; l'**Éclat** existe | Il faut connaître le prix de la conservation — un coup encaissé — avant qu'on vous propose d'en tirer beaucoup plus. C'est la tension centrale du jeu (D12) ; on ne la tord pas avant que le joueur l'ait sentie |
| 4 | `LES-TROIS` | le pool est une **composition**, pas un stock ; l'**ordre** des dépenses compte (Suite) | C'est le seul dont l'identité se joue dans son rapport à la Forge et aux reliques. Il n'a de sens qu'une fois qu'on sait ce qu'on refuse en le jouant |

La progression va donc : **subir le tirage → le corriger → transformer ce qu'on a → choisir
ce qu'on possède.** Chaque étape est un degré de contrôle en plus sur les dés, et chacune
suppose la précédente comprise. C'est le parcours, et c'est la raison de l'ordre.

Ce placement de `RELANCE` en deuxième a un effet secondaire voulu : il tombe après la
première victoire sur le boss 1, c'est-à-dire à la fin de la première ou de la deuxième run.
Le joueur qui perd sa run 1 en acte 2 débloque quand même un personnage entier. **La première
défaite doit rapporter quelque chose de gros** — c'est le seul moment où on peut perdre le
joueur pour toujours.

---

## 4. Les 20 objectifs

Chaque objectif est **visible et suivi** : le joueur voit sa progression (« Trio : 0/1 »)
depuis le menu, sinon c'est du grind aveugle. Les noms de contenu sont des **noms de code**.

### Palier 1 — Découverte (runs 1 à 3)

| # | Objectif | Débloque | Runs **[H]** | Ce que ça change pour le joueur |
|---|---|---|---|---|
| **O1** | Déclencher une **Paire** dans un tour | Lot Fondations A — 4 reliques communes | 1 | Le catalogue de récompense cesse d'être le même à chaque run. Le déblocage arrive au 2ᵉ tour de la 1ʳᵉ run : le joueur apprend, en 30 secondes, que le jeu débloque des choses |
| **O2** | **Vaincre le boss 1** | **Personnage 2 `RELANCE`** + `LE-DOUBLE` au catalogue commun | 1-2 | Un deuxième écran de sélection de personnage, et une manière entièrement différente de jouer un tour. Plus : `SOCLE` peut désormais retrouver sa propre relique signature en double |
| **O3** | Déclencher un **Trio** | Lot Fondations B — 4 reliques communes | 2 | Le joueur cherche activement à aligner ses faces. Le Trio n'arrive pas par accident : c'est le premier objectif qui change la façon de dépenser |
| **O4** | Tuer une unité par **piétinement d'Élan** | 2 événements | 1-2 | Enseigne que l'Élan est une arme, pas seulement un déplacement. Ouvre deux nœuds de rang 2 que le joueur n'avait jamais vus |
| **O5** | Terminer un combat **sans subir un seul dégât** | 2 ennemis d'acte 1 | 2-3 | Enseigne l'esquive comme stratégie complète, pas comme réflexe. Les rencontres d'acte 1 cessent de se répéter d'une run à l'autre |

### Palier 2 — Affirmation (runs 3 à 7)

| # | Objectif | Débloque | Runs **[H]** | Ce que ça change pour le joueur |
|---|---|---|---|---|
| **O6** | **Vaincre une élite** | Lot Build A — 5 reliques orientées build | 3 | Les premières reliques qui ne sont fortes qu'avec un certain pool. C'est le moment où « prendre la meilleure des trois » devient « prendre celle qui va avec les miennes » |
| **O7** | **Vaincre le boss 2** | **Personnage 3 `GRAVURE`** + `LA-FACE-INTERDITE` au catalogue | 3-5 | La conservation devient un moteur au lieu d'une hésitation. Et `SOCLE` et `RELANCE` héritent d'une relique qui rend la relance fiable |
| **O8** | Utiliser la **Forge 3 fois** dans une même run | 2 événements | 3-4 | Récompense le chemin prudent, qui sinon ne débloque rien de spécifique. Enseigne que sculpter le pool est une stratégie à part entière |
| **O9** | **Refuser 3 reliques** dans une même run | Lot Build B — 5 reliques orientées build | 4-5 | Enseigne D25 : refuser est un choix, et dans ce jeu renoncer est un levier. Le lot débloqué récompense précisément les builds purs |
| **O10** | **Vaincre le boss 2 avec deux personnages différents** | 3 ennemis d'acte 2 | 5-7 | Force à sortir du personnage préféré au moment exact où le joueur commence à en avoir un. L'acte 2 gagne sa variété au moment où le joueur y meurt le plus |
| **O11** | Déclencher un **Écho trois tours de suite** | 1 mini-boss (3ᵉ élite) | 4-6 | Le seul objectif qui porte sur l'**ordre** des dépenses. Il prépare le personnage 4 sans le nommer |

### Palier 3 — Démonstration (runs 6 à 12)

| # | Objectif | Débloque | Runs **[H]** | Ce que ça change pour le joueur |
|---|---|---|---|---|
| **O12** | **Gagner une run** — *ou* atteindre le boss 3 trois fois | **Personnage 4 `LES-TROIS`** + `LA-MAIN-PATIENTE` au catalogue | 4-8 | Le dernier personnage est la récompense de la première victoire (D15 : 3 à 6 runs). Sa porte de secours garantit qu'un joueur qui bute sur le boss 3 continue d'avancer |
| **O13** | Terminer une run avec **14 reliques ou plus** | Lot Build C — 5 reliques orientées build | 6-9 | Récompense le chemin gourmand, qui est un pari (voir `progression.md` § 3.6). Le joueur qui prend tous les combats a maintenant une raison de le faire |
| **O14** | Vaincre les **trois élites d'une même run** | 3 ennemis d'acte 3 | 7-10 | L'acte 3 cesse d'être trois fois la même rencontre plus grosse. C'est le déblocage qui rend la fin de run rejouable |
| **O15** | Déclencher une **Suite** | Lot Explosif A — 4 reliques explosives | 6-9 | Presque impossible avant `LES-TROIS`, presque automatique avec lui : l'objectif suit naturellement O12 et donne au joueur une raison immédiate d'essayer le nouveau personnage |
| **O16** | Terminer un combat **en un seul tour** | 2 événements | 7-10 | La confirmation que le build peut casser le jeu. C'est le moment « j'ai construit une machine ridicule » transformé en objectif nommé |

### Palier 4 — Long cours (runs 10 à 25)

Nombreux et petits, jamais rares et gros.

| # | Objectif | Débloque | Runs **[H]** | Ce que ça change pour le joueur |
|---|---|---|---|---|
| **O17** | **Gagner avec `RELANCE`** | Lot Explosif B — 4 reliques | +2 | Chaque personnage a maintenant sa propre récompense terminale. Les reliques explosives arrivent par petits paquets, ce qui laisse le temps de les découvrir |
| **O18** | **Gagner avec `GRAVURE`** | Lot Explosif C — 4 reliques | +2 | idem |
| **O19** | **Gagner avec `LES-TROIS`** | Lot Explosif D — 3 reliques | +2 | idem. C'est le dernier lot : le catalogue est complet à 60 |
| **O20** | Avoir **rencontré les 18 ennemis** | 1 événement + la galerie d'ennemis | passif | Ne demande aucun effort dirigé : il tombe tout seul une fois O5, O10 et O14 obtenus. C'est un objectif de clôture, pas un objectif de grind |

### Vérification du budget

| Contenu | Départ | Ajouté par | Total |
|---|---|---|---|
| Reliques | 22 | O1 +4 · O3 +4 · O6 +5 · O9 +5 · O13 +5 · O15 +4 · O17 +4 · O18 +4 · O19 +3 | **60** ✔ |
| Ennemis | 10 | O5 +2 · O10 +3 · O14 +3 | **18** ✔ |
| Élites (mini-boss) | 2 | O11 +1 | **3** ✔ |
| Événements | 5 | O4 +2 · O8 +2 · O16 +2 · O20 +1 | **12** ✔ |
| Personnages | 1 | O2 +1 · O7 +1 · O12 +1 | **4** ✔ |
| Objectifs | — | O1 à O20 | **20** ✔ |

### Vérification du mur de grind

| Run | Déblocages attendus dans la run | Cumul |
|---|---|---|
| 1 | O1, O4, (O2) | 2-3 |
| 2 | O2 si manqué, O3, O5 | 5 |
| 3 | O6, O8 | 7 |
| 4 | O9, O11 | 9 |
| 5 | O7 | 10 |
| 6 | O10, O12 | 12 |
| 7 | O15 | 13 |
| 8 | O13 | 14 |
| 9-10 | O14, O16 | 16 |
| 11-16 | O17, O18, O19 | 19 |
| ≤ 20 | O20 | **20** |

**≈ 1,6 déblocage par run sur les runs 1 à 10**, **≈ 0,4 sur les runs 11 à 20**. ✔ les deux
garde-fous du § 2. Le déblocage majeur le plus lointain (O12, personnage 4) tombe à la run 6
en espérance, avec une porte de secours. ✔ sous les 6 runs.

**Trous à surveiller.** Les runs 11 à 16 ne portent que trois objectifs, tous du même type
(« gagner avec X »). C'est le seul endroit du parcours qui ressemble à du grind. Correctif
prévu si la mesure le confirme : découper O17-O19 en deux moitiés chacun (atteindre l'acte 3
avec le personnage, puis gagner avec lui), ce qui double le nombre de jalons sans changer
d'un pouce la quantité de contenu. **[T]**

---

## 5. Les règles anti-puissance, catégorie par catégorie

Chaque catégorie a son propre risque de faire entrer de la puissance par la porte de service.

### Reliques débloquées
> **Une relique ajoutée au catalogue doit avoir la même contribution médiane à `P` que
> celles qu'elle rejoint, à ±2 points de pourcentage près** (`progression.md` § 2.5).

Elle peut être plus **spécialisée** — c'est même le but des lots Build et Explosif : leur
variance est plus grande, leur médiane est identique. Une relique qui vaut 0 % dans huit
builds sur dix et +30 % dans deux est parfaitement conforme.

### Ennemis débloqués
> **Un ennemi débloqué tient dans le même budget de PV et de pression que ceux qu'il
> rejoint, et une rencontre qui l'emploie vise le même nombre de tours**
> (`progression.md` § 3.3).

Le risque ici est inverse du précédent : débloquer des ennemis peut rendre le jeu **plus
dur**, ce qui est une violation symétrique de D3 — le joueur à 50 runs jouerait un jeu
différent de celui à 5 runs. Mesure : la distribution des morts par acte
(`run.md` § 5.5) ne doit pas bouger de plus de **5 points** entre catalogue de départ et
catalogue complet. **[T]**

### Événements débloqués
> **Espérance de contribution à `P` d'un événement : entre −2 % et +6 %** **[T]**, un peu
> moins qu'une relique commune.

Un événement peut et doit être un pari (un choix qui peut mal tourner). C'est son espérance
qui est bornée, pas sa variance.

### Personnages débloqués
Voir `personnages.md` § 7 : `P₀` ∈ [4,3 ; 4,9] et taux de victoire entre 35 % et 65 % pour
chacun des quatre. Le dernier débloqué ne doit pas être le plus fort — sinon le déblocage
est une montée en puissance déguisée en variété.

---

## 6. Ce qui est explicitement reporté

- **A16 — rejouabilité longue** (paliers d'ascension, mutateurs, seed du jour). Rien avant
  M6. Quand ce système arrivera, il devra respecter D3 dans l'autre sens : une ascension
  ajoute de la **difficulté**, pas de la puissance, et elle ne verrouille aucun contenu.
- **A15 — monétisation.** Elle influe directement sur cette liste (un contenu payant est un
  déblocage qui n'en est pas un). Décision avant M6, comme prévu. En attendant, ce document
  suppose que **tout le contenu de la v1 est atteignable en jouant**, et il faudra le
  redéfendre si ce n'est plus vrai.
- **Les noms.** Tous les noms de lots, d'objectifs et de contenus ci-dessus sont des noms de
  code.

---

## 7. Ce que je laisse ouvert, et pour qui

- **`balance-simulator`** : le contrat maître du § 1 (écart de taux de victoire entre
  catalogue de départ et catalogue complet, ≤ 3 points) est la mesure la plus importante de
  ce document. Puis : les espérances de runs par objectif du § 4, qui sont toutes marquées
  **[H]** et dont aucune n'a été mesurée ; et la distribution des morts par acte, avant et
  après déblocage des ennemis.
- **`item-designer`** : la composition des 9 lots de reliques, et le fait que chaque lot doit
  être **jouable seul** — un joueur qui débloque le Lot Build A et rien d'autre doit pouvoir
  en tirer un archétype. Un lot dont les reliques ne fonctionnent qu'avec un lot ultérieur est
  un déblocage qui ne change rien.
- **`lore-keeper`** : les 20 intitulés d'objectifs vus par le joueur (≤ 60 caractères,
  formulés dans le vocabulaire normé), et les noms des 9 lots.
- **`mobile-ux`** : l'écran de suivi des objectifs. Contrainte : la progression d'un objectif
  doit être visible **sans quitter l'écran de fin de run**, sinon le joueur ne fait jamais le
  lien entre ce qu'il vient de faire et ce qu'il vient de débloquer.
- **`game-designer`** : la porte de secours d'O12 (« atteindre le boss 3 trois fois ») suppose
  que l'état de run enregistre le rang atteint même en cas de défaite.
