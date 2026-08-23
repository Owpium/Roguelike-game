# Content budget v1

Chiffres cibles pour la version 1. Ce sont des **plafonds de production**, pas des
objectifs à dépasser. Un catalogue plus petit et mieux équilibré bat un gros catalogue tiède.

| Contenu | v1 | Vertical slice (M3) | Commentaire |
|---|---|---|---|
| Personnages | 4 | 1 | 1 de départ + 3 déblocables |
| Reliques | 60 | 15 | dont ~40 % à levier « déclenchement » |
| Ennemis | 18 | 4 | répartis sur 3 biomes |
| Mini-boss | 3 | 0 | |
| Boss | 3 | 1 | un par acte |
| Biomes | 3 | 1 | |
| Événements non-combat | 12 | 0 | boutique, autel, rencontre |
| Objectifs de déblocage | ~20 | 0 | |

## Règle des tiers pour les reliques

- **1/3 fondations** : lisibles, immédiatement utiles, débloquées tôt. Elles enseignent le
  système.
- **1/3 orientées build** : puissantes seulement avec un type de pool. Elles créent les
  archétypes.
- **1/3 explosives** : elles cassent une règle. Rares, mémorables, et sous surveillance
  permanente du simulateur.

## Archétypes de build cibles pour la v1

Cible : **5 à 6 archétypes viables**, chacun devant pouvoir finir la run. Ils émergent des
reliques, ils ne sont pas des « classes ». À définir par `item-designer`, validés par
`balance-simulator` (un archétype est validé quand il gagne entre 35 % et 65 % des runs
simulées à difficulté de référence).

## Volume de texte

Contrainte mobile stricte, à faire respecter par `lore-keeper` :
- Nom de relique : ≤ 22 caractères
- Effet mécanique : ≤ 90 caractères, formulé dans le vocabulaire de `02-systemes-v0.md`
- Saveur (facultative) : ≤ 100 caractères, jamais nécessaire à la compréhension
- Aucun texte d'événement > 300 caractères
