# Systèmes — squelette v0

> Ce document est un **cadre**, pas une spécification finale. Il pose le vocabulaire et les
> invariants. Les agents `progression-designer`, `item-designer` et `game-designer` le
> remplissent et le font évoluer, dans leurs fichiers respectifs sous `docs/design/`.

## Vocabulaire (à respecter partout : code, doc, UI)

| Terme | Définition |
|---|---|
| **Pool** | L'ensemble des dés que possède le personnage. C'est sa fiche de perso. |
| **Main** | Les dés disponibles ce tour : les dés conservés du tour précédent, complétés par de nouveaux dés tirés du pool. |
| **Report** | Un dé non dépensé reste en Main avec sa face et n'est pas relancé (D49). Ce n'est pas un choix : c'est la conséquence de ne pas l'avoir joué. |
| **Face** | Le symbole obtenu sur un dé tiré : Frappe, Garde, Élan, Éclat (joker). |
| **Dépense** | L'acte de consommer un dé pour exécuter une action. Le moment où tout se déclenche. |
| **Relique** | Un objet permanent de la run. Ne donne pas de stats : modifie le pool, les faces, le tirage, ou réagit à une dépense. |
| **Intention** | L'action télégraphée d'un ennemi pour le tour à venir. |
| **Combo** | Un motif observable dans les dés dépensés ce tour : Paire, Trio, Écho, Suite. |
| **Résonance** | Nom provisoire d'une synergie nommée entre reliques (à valider par `lore-keeper`). |

## Le dé

> Recommandation en attente de validation (A21 de `docs/06-arbitrages.md`).

Un seul type de dé, faces mixtes. Quatre faces possibles :

| Face | Rôle |
|---|---|
| **Frappe** | Agression. La face la plus fréquente, c'est le verbe central du jeu. |
| **Garde** | Défense, préparation, contrôle. |
| **Élan** | Déplacement ambitieux : 2-3 cases, traversée, poussée. |
| **Éclat** | Joker. Compte comme n'importe quelle face, et alimente les synergies. Absent du dé de départ : il s'obtient. |

Dé de départ : 3 Frappe, 2 Garde, 1 Élan. Pool de départ : 6 dés identiques.

### Structure d'un tour

1. **Tirage** — la main est complétée à 3 depuis le pool. Les nouveaux dés sont lancés ; les
   dés conservés au tour précédent gardent leur face.
2. **Lecture** — les intentions ennemies sont affichées.
3. **Choix** — on dépense les dés qu'on veut, dans l'ordre qu'on veut, et on désigne ceux
   qu'on conserve (2 au plus). **Rien n'est résolu**, tout est modifiable.
4. **Validation** — fin du choix.
5. **Résolution** — les dépenses du joueur dans l'ordre choisi, puis les ennemis.
6. **Défausse** — les dés dépensés et les dés non conservés retournent au pool. Ils seront
   relancés lors d'un tirage ultérieur.

**Pourquoi la résolution est différée sans rien coûter.** Comme aucun aléatoire n'intervient
dans la résolution (I2), le résultat d'une dépense est entièrement prévisible avant de la
faire. Résoudre après la validation ne prive donc le joueur d'aucune information : on gagne
l'annulation libre pendant tout le tour, on ne perd rien. La contrepartie à surveiller est
l'ordre des dépenses, qui compte pour les combos Écho et Suite : il fait partie du choix.

**La conservation est un choix, pas une conséquence.** Conserver un dé, c'est renoncer à
l'action de ce tour — donc encaisser un coup — pour préparer un combo au suivant. C'est la
tension principale de la boucle de tour, et le plafond de 2 en est le curseur.

**Un pas gratuit par tour.** Le déplacement d'une case ne coûte pas de dé, et n'est jamais
indisponible. C'est ce qui garantit qu'aucun tirage ne peut bloquer le joueur — sans cette
règle, une main de trois Frappes face à une intention ennemie serait une défaite due au
tirage, ce qui viole l'invariant I2 dans l'esprit sinon dans la lettre.

**Le pool de départ est homogène, délibérément.** Au premier combat, le tirage ne veut rien
dire puisque tous les dés sont identiques : le seul aléatoire est le lancer. À mesure que le
pool se diversifie, *quel* dé on tire devient une question. La complexité du système croît au
rythme de la maîtrise du joueur, sans écran de tutoriel.

## Les combos

Les faces mixtes produisent naturellement des motifs dans la main. Les reliques peuvent les
observer :

| Combo | Définition |
|---|---|
| **Paire** | Deux dés de même face dépensés dans le même tour. |
| **Trio** | Les trois. |
| **Écho** | Un dé dépensé identique au précédent. |
| **Suite** | Frappe → Garde → Élan, dans l'ordre. |

Les combos et le report des dés (D12, plafond de 2) se renforcent mutuellement : garder une
Frappe ce tour pour en avoir deux au suivant est une vraie décision, payée par le coup qu'on
encaisse en attendant. **Le plafond de report est le paramètre qui règle toute cette tension**
— c'est le premier chiffre que `balance-simulator` doit faire varier.

La liste des combos autorisés est un contrat aussi structurant que la liste des crochets :
chaque motif ouvert est un axe de synergies et une source potentielle de boucle infinie
(invariant I3). Elle se fixe avant l'écriture de la première relique — voir A20.

## Les 4 leviers de conception d'une relique

Toute relique doit agir sur **au moins un** de ces leviers. Une relique qui ne fait
qu'ajouter des dégâts est refusée par défaut.

1. **Composition du pool** — ajoute, retire, transforme des dés.
2. **Faces** — change ce que montre un dé, ou ce que fait une face.
3. **Tirage** — change le nombre de dés tirés, le moment, le recyclage, la conservation, ou
   permet de **relancer un dé individuellement**. C'est le levier des personnages tordeurs de
   dés (D16), et celui qui pèse le plus sur la durée d'un tour : voir l'avertissement ci-dessous.
4. **Déclenchement** — « quand tu dépenses un dé X, alors Y ». C'est le levier des
   synergies : c'est là que naissent les builds absurdes, et c'est aussi là que naissent
   les boucles infinies. `balance-simulator` surveille ce levier en priorité.

## Invariants (violer un invariant = bug de design, pas d'équilibrage)

- **I1 — Déterminisme.** Même seed + même suite d'actions = même résultat, bit pour bit.
  Non négociable : c'est ce qui rend la simulation d'équilibrage possible.
- **I2 — Aléatoire en amont.** L'aléatoire est dans le tirage et la génération de la run,
  jamais dans la résolution d'une action. Pas de « 30 % de chance de rater ».
- **I3 — Terminaison.** Aucun tour ne peut boucler indéfiniment. Tout effet déclenché en
  chaîne a une limite dure de récursion, et cette limite est un paramètre testé.
- **I4 — Lisibilité.** L'état complet d'un combat doit tenir sur un écran de téléphone
  sans défilement.
- **I5 — Aucune stat cachée.** Tout ce qui influe sur le résultat est affichable en tapant
  dessus.

## Les relances individuelles

Reliques et personnages peuvent permettre de **relancer un dé précis**. C'est le levier le
plus demandé et le plus dangereux du jeu, pour trois raisons cumulées :

- **Il gonfle la durée du tour.** Le budget est de 8 secondes. Un personnage bâti sur la
  relance peut le doubler, et faire passer la run de 12 à 20 minutes sans qu'aucune règle
  n'ait changé. C'est la dérive que `balance-simulator` doit détecter en premier.
- **Il crée de la paralysie d'analyse.** Relancer jusqu'à obtenir la bonne face transforme
  une décision en optimisation mécanique.
- **Il ouvre la porte aux boucles** dès qu'une relance peut en produire une autre (I3).

Règles de garde, à respecter par toute relique ou personnage à relance :
- Une relance est **plafonnée par tour**, jamais illimitée, et le plafond est visible.
- Une relance est **un seul geste**, sans confirmation.
- Une relance qui octroie une relance est interdite par défaut. Toute exception passe par
  `game-designer` et est testée en simulation avant d'entrer dans le catalogue.

## Progression intra-run

La puissance monte par : nouvelles reliques (récompense de combat), modification du pool
(événements, boutiques), et rarement de la santé. Il n'y a **pas de niveaux, pas d'XP, pas
de points de compétence** — le pool remplace tout ça.

Cible : la puissance du joueur doit environ **tripler** entre le début de l'acte 1 et le
boss 3, avec une courbe qui s'accélère (l'effet boule de neige est la récompense). À
chiffrer par `progression-designer`.

Difficulté cible (D15) : **3 à 6 runs avant la première victoire**, soit environ 25-30 % de
victoires pour un joueur qui découvre et 55-60 % en maîtrise. Conséquence de design : la
première run doit être perdable mais **instructive** — le joueur doit pouvoir nommer ce qui
l'a tué.

## Méta-progression

Modèle retenu : **déblocage de contenu, pas de puissance.**

- Terminer des objectifs débloque : personnages, reliques ajoutées au pool commun,
  ennemis, biomes.
- Ce qui est débloqué **change les possibilités, pas les chiffres**. Un joueur avec 100
  runs n'est pas plus fort qu'un joueur avec 3 runs : il a plus de variété et plus de
  savoir-faire.
- Conséquence à assumer : la rétention repose sur la découverte de combinaisons, donc la
  qualité du catalogue de reliques est **le risque n°1 du projet**.

## Personnages

Un personnage = pool de départ + relique signature + une règle propre.
Cible v1 : 4 personnages (1 de départ, 3 déblocables).

Chaque personnage **tord les dés à sa manière** (D16) : il relance, il joue à cinq dés avec
un pool médiocre, il transforme ses faces, il grave. Ce ne sont pas des archétypes de combat
(le rapide, le lourd, le contrôleur) — ceux-là seraient interchangeables et gâcheraient le
seul système qui rend ce jeu particulier.

Contrepartie assumée : le **personnage de départ doit rester simple**. Son rôle est
d'enseigner les dés, pas de les tordre. Les torsions arrivent avec les déblocages, quand le
joueur sait déjà ce qu'il tord.
