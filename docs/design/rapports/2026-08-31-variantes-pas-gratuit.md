# Mesure — le pas gratuit, trois variantes

**Date** : 2026-08-31 · **Jalon** : M1 · **Objet** : mesurer avant d'arbitrer l'esquive
gratuite (voir `2026-08-31-esquive-gratuite.md`)

Même graine, même IA gloutonne, même contenu. Seule la règle change.

| Variante | Pas gratuits / tour | Runs sans perdre un PV | Tours / run (médiane) | PV min en fin de run |
|---|---|---|---|---|
| `no-free-step` | 0 | **36,0 %** | 92 | 24 |
| `base` | 1 | **99,0 %** | 79 | 37 |
| `legendary-step` | 2 | **100 %** | 75 | 40 |

300 runs pour les deux premières, 150 pour la troisième.

## Ce que ça établit

**Le pas gratuit est bien la cause, et il est le seul levier nécessaire.** Aucune autre règle
n'a bougé : ni les motifs d'attaque, ni l'ancrage, ni l'IA ennemie, ni les dégâts. Faire
passer le pas gratuit de 1 à 0 fait tomber la part des runs sans dégât de 99 % à 36 %. Ce
n'est pas un ajustement, c'est un changement de nature du combat.

**Le pas gratuit est un effet de rareté légendaire.** À 2 pas par tour, le joueur devient
strictement intouchable : 100 % des runs sans un seul PV perdu, et un minimum de 40 PV sur
40. Une règle dont on ne peut pas doubler la valeur sans casser le jeu n'est pas une règle de
base, c'est un plafond de puissance. Ça confirme l'intuition à l'origine de cet arbitrage.

**La suppression coûte des tours.** La médiane passe de 79 à 92 tours, soit environ 7,7 tours
par rencontre contre 6,6. C'est au-dessus de la fourchette de 4 à 6 tours de
`docs/01-boucle-et-pacing.md`, et ça se paie en durée de run. Deux lectures possibles, à
trancher par `game-designer` : soit l'IA gloutonne joue mal une fois privée de sa mobilité
gratuite, soit le kit de base manque de mobilité une fois le pas gratuit retiré — auquel cas
c'est Élan, à 1 face sur 6, qui est trop rare.

## Ce que ça n'établit pas

- **Rien sur la difficulté.** Les trois variantes gagnent 100 % des runs, parce que les actes
  2 et 3, les élites et les boss sont des remplisseurs, et parce qu'aucune relique n'existe.
  Le taux de victoire ne veut rien dire ici. Seules la part de runs sans dégât et la durée
  sont des signaux exploitables.
- **Rien sur le plaisir.** Une IA gloutonne à une profondeur ne mesure pas si un tour est
  intéressant à jouer. Elle mesure si une règle est exploitable — et elle vient de montrer
  que oui.
- **Rien sur les motifs d'attaque à plusieurs cases**, l'autre piste envisagée. Elle n'a pas
  été implémentée : elle demande de réécrire les trois ennemis de départ, ce qui est du
  design, pas du réglage.

## Reproduire

```bash
pnpm sim --seed 1 --runs 300 --variant base
pnpm sim --seed 1 --runs 300 --variant no-free-step
pnpm sim --seed 1 --runs 150 --variant legendary-step
```

Les variantes sont déclarées dans `packages/sim/src/content.ts`. Ajouter une variante, c'est
ajouter une ligne : c'est ce que l'injection du `RuleSet` dans l'état de combat a rendu
possible.
