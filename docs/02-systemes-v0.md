# Systèmes — squelette v0

> Ce document est un **cadre**, pas une spécification finale. Il pose le vocabulaire et les
> invariants. Les agents `progression-designer`, `item-designer` et `game-designer` le
> remplissent et le font évoluer, dans leurs fichiers respectifs sous `docs/design/`.

## Vocabulaire (à respecter partout : code, doc, UI)

| Terme | Définition |
|---|---|
| **Pool** | L'ensemble des dés que possède le personnage. C'est sa fiche de perso. |
| **Main** | Les dés tirés ce tour depuis le pool. |
| **Face** | Le symbole obtenu sur un dé tiré : Frappe, Pas, Garde, Éclat (joker). |
| **Dépense** | L'acte de consommer un dé pour exécuter une action. Le moment où tout se déclenche. |
| **Relique** | Un objet permanent de la run. Ne donne pas de stats : modifie le pool, les faces, le tirage, ou réagit à une dépense. |
| **Intention** | L'action télégraphée d'un ennemi pour le tour à venir. |
| **Résonance** | Nom provisoire d'une synergie nommée entre reliques (à valider par `lore-keeper`). |

## Les 4 leviers de conception d'une relique

Toute relique doit agir sur **au moins un** de ces leviers. Une relique qui ne fait
qu'ajouter des dégâts est refusée par défaut.

1. **Composition du pool** — ajoute, retire, transforme des dés.
2. **Faces** — change ce que montre un dé, ou ce que fait une face.
3. **Tirage** — change le nombre de dés tirés, le moment, le recyclage, permet de relancer.
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

## Progression intra-run

La puissance monte par : nouvelles reliques (récompense de combat), modification du pool
(événements, boutiques), et rarement de la santé. Il n'y a **pas de niveaux, pas d'XP, pas
de points de compétence** — le pool remplace tout ça.

Cible : la puissance du joueur doit environ **tripler** entre le début de l'acte 1 et le
boss 3, avec une courbe qui s'accélère (l'effet boule de neige est la récompense). À
chiffrer par `progression-designer`.

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
Cible v1 : 4 personnages (1 de départ, 3 déblocables). Chacun doit incarner une manière
de tordre le système, pas un archétype de fantasy.
