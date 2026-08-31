# Campagne — les six variantes de l'esquive

**Date** : 2026-08-31 · **Jalon** : M1 · **Protocole** : `docs/design/esquive-arbitrage.md` § 5
**Verdict court** : la campagne **ne tranche pas**, et la raison est instructive.

## D'abord, une correction de mon premier rapport

`2026-08-31-esquive-gratuite.md` annonçait « 98,5 % des runs terminées sans perdre un seul
PV ». **C'est faux.** La métrique calculait `hp == 40 en fin de run`, or le Repos et les
victoires de boss rendent des PV : un joueur qui perdait 6 PV puis se reposait était compté
comme n'ayant jamais été touché.

La métrique correcte — aucun PV perdu à aucun moment, sur l'acte 1 seul, seul contenu réel —
donne **52,4 %** pour les règles actuelles. L'immunité existe, elle est deux fois moins totale
que je ne l'ai écrit. La conclusion qualitative du rapport tient ; son chiffre était gonflé.

## La mesure

500 seeds par variante, mêmes seeds partout, acte 1 uniquement, barème d'IA neutralisé selon
le § 5.5 de l'arbitrage.

| Var. | Ce qu'elle isole | `contact` | `pv/renc` | `tours/renc` | `runs0` | `secours` |
|---|---|---|---|---|---|---|
| **R** | référence | 24,9 % | 0,37 | 3,6 | 52,4 % | 16,2 % |
| **A** | pas gratuit supprimé | 29,7 % | **0,24** | 4,0 | **70,2 %** | 28,4 % |
| **C** | `charge` | 22,7 % | **0,79** | 3,8 | 31,8 % | 21,2 % |
| **D** | motifs D46 | 37,3 % | 0,50 | 3,5 | 46,6 % | 15,7 % |
| **E** | paquet acte 1 | **42,3 %** | 0,32 | 4,0 | 58,2 % | 27,5 % |
| **F** | paquet actes 2-3 | 28,9 % | 0,58 | 4,4 | 41,6 % | **30,1 %** |

## Les trois prédictions engagées

1. **« A seule laisse `runs0` au-dessus de 30 % »** → **confirmée, et au-delà** : 70,2 %.
   Supprimer le pas gratuit ne réduit pas l'immunité, il l'**augmente**. Le raisonnement de
   l'arbitrage — l'esquive reste une immunité, simplement payante — est vérifié dans une
   forme plus forte que celle qu'il annonçait.
2. **« C est inerte, `pv/renc` reste sous 1,0 »** → **techniquement confirmée, mais le seuil
   ne testait rien**. À 0,79 contre 0,37, la `charge` **double** les dégâts subis et fait
   chuter `runs0` de 52 % à 32 %. C'est le plus gros effet défensif d'un levier isolé de
   toute la campagne, et le seuil choisi était trop lâche pour s'en apercevoir.
3. **« D seule fait couler du sang, `runs0` < 10 % »** → **falsifiée**. 46,6 %.

## Les seuils d'acceptation du paquet E/F ne sont pas atteints

| Seuil | Cible | E | F |
|---|---|---|---|
| `runs0` | < 2 % | **58,2 %** | **41,6 %** |
| `contact` | 15-30 % | 42,3 % (haut) | 28,9 % ✓ |
| `pv/renc` acte 1 | 2,0-4,0 | **0,32** | **0,58** |
| `tours/renc` | ≤ 6,5 | 4,0 ✓ | 4,4 ✓ |
| `secours` | 12-30 % | 27,5 % ✓ | 30,1 % (limite) |

Le paquet recommandé rate ses propres critères d'un ordre de grandeur sur les deux mesures
qui portent le sujet. **Il ne faut pas en conclure que le paquet est mauvais.**

## Pourquoi la campagne ne tranche pas : le barème neutre a un biais défensif

Le § 5.5 demandait un barème exprimé en points de vie, pour que la mesure compare des règles
et non des pondérations. C'est la bonne exigence, et elle a été suivie. Mais le barème obtenu
compare **1 PV évité à 1 PV infligé**, et il est myope à un tour :

- une esquive vaut la menace annulée ce tour ;
- une Frappe non létale vaut ses 2 dégâts, **sans aucun crédit pour le fait qu'elle rapproche
  d'un mort** — or tuer supprime toute la menace future de la cible ;
- seule la Frappe létale reçoit ce crédit.

Une IA ainsi notée préfère systématiquement se protéger. Privée du pas gratuit, elle ne
s'expose pas : elle **paie des dés** pour esquiver (28 % des dépenses contre 16 %), allonge le
combat et prend *moins* de dégâts. D'où l'inversion R → A, qui est un artefact du barème et
non un effet des règles.

Autrement dit : le barème neutralise bien le biais qu'il visait, et en introduit un autre.
Aucune des six lignes du tableau ne mesure ce qu'un joueur humain subirait, parce qu'aucun
joueur humain ne joue pour ne pas être touché — il joue pour gagner vite.

## Ce que la campagne établit malgré tout

- **La géométrie fonctionne comme annoncé.** `contact` passe de 24,9 % à 37,3 % avec les
  seuls motifs D46, et à 42,3 % dans le paquet. C'est la seule mesure qui bouge dans le sens
  prévu, sur le seul axe que le barème ne biaise pas : le contact est de la géométrie, pas de
  la décision.
- **La `charge` n'est pas inerte.** Elle mérite d'être reclassée : c'est un correctif défensif
  autant qu'un correctif de rythme.
- **`secours` atteint son plafond** dans le paquet F (30,1 %). Au-delà, un tiers des dés du
  jeu servent à marcher — c'est l'alerte que l'arbitrage avait posée lui-même.
- **`tours/renc` ne pose aucun problème** : 4,0 à 4,4 contre un plafond à 6,5. La crainte que
  D44 allonge les combats hors budget ne se matérialise pas. La prédiction de 5,5 tours pour
  la référence était haute : la mesure donne 3,6 sur l'acte 1.

## Ce qu'il faut faire ensuite, et par qui

Le barème a besoin d'un terme pour la **progression vers la mort d'une cible** — créditer une
Frappe non létale d'une fraction de la menace future qu'elle finira par annuler — sinon la
défense gagne toujours et aucune variante ne sera comparable sur les dégâts.

Ce terme est une conception d'IA, pas un réglage de mesure : il appartient à
`balance-simulator`, avec l'exigence qu'il reste exprimé en points de vie et identique d'une
variante à l'autre. Tant qu'il n'existe pas, `contact` est la seule colonne de ce tableau sur
laquelle on peut arbitrer.

## Reproduire

```bash
pnpm sim --campaign --runs 500
pnpm sim --seed 1 --runs 500 --variant E
```
