# Rapport — l'esquive est gratuite et totale

**Date** : 2026-08-31 · **Jalon** : M1 · **Auteur** : socle technique, pas encore
`balance-simulator` · **Statut** : à arbitrer par `game-designer`

## Mesure

200 runs, IA gloutonne, contenu de l'acte 1 réel et remplisseurs pour les actes 2 et 3.

| Mesure | Valeur |
|---|---|
| Taux de victoire | **100 %** (200/200) |
| Runs terminées **sans perdre un seul PV** | **98,5 %** (197/200) |
| PV en fin de run | médiane 40 / 40, minimum 37 |
| Tours par run | médiane 79, soit ~6,6 par rencontre |

Le chiffre des tours est plutôt bon : 6,6 tours par rencontre est juste au-dessus de la
fourchette 4-6 de `docs/01-boucle-et-pacing.md`, avec une IA volontairement bête.

Le reste ne l'est pas.

## Ce que ça révèle

Trois règles, chacune saine isolément, se composent en une immunité :

1. **Le pas gratuit est disponible chaque tour** (D18), inconditionnellement.
2. **Les intentions sont ancrées et figées au télégraphe** (D28) : l'attaque part sur l'offset
   mémorisé, pas sur la position réelle du joueur.
3. **Les trois ennemis de départ ont un motif d'attaque d'une seule case** (`combat.md` § 9).

Conséquence : un pas suffit à esquiver **toutes** les attaques du tour, y compris quand trois
ennemis visent la même case — puisqu'ils visent tous la case que le joueur vient de quitter.
Et comme le pas est gratuit, esquiver ne coûte aucun dé : le joueur frappe *et* esquive.

L'ennemi qui a attaqué dans le vide n'a pas bougé, donc il se retrouve à distance 2, donc il
passe le tour suivant à se déplacer. La boucle se referme : attaque manquée, déplacement,
attaque manquée. Aucun ennemi de l'acte 1 ne peut toucher un joueur qui n'est pas acculé.

Ce n'est pas un défaut de l'IA du simulateur : c'est une IA gloutonne à une seule profondeur.
Si elle y arrive, un joueur humain y arrivera trivialement.

## Ce que ce n'est pas

- **Pas un bug d'implémentation.** L'ancrage se comporte exactement comme le décrit § 8.2, et
  les tests le vérifient. Le moteur applique les règles écrites.
- **Pas un problème de réglage.** Monter les dégâts ennemis ne change rien à un taux de
  toucher nul. Aucun chiffre ne corrige ceci.

## Pistes, sans trancher — c'est le périmètre de `game-designer`

- **Motifs à plusieurs cases.** Une attaque qui couvre la case visée *et* ses voisines rend
  l'esquive d'un pas insuffisante. C'est le levier le plus direct, et il conserve entièrement
  D28 et le pilier « zéro information cachée ».
- **Le pas gratuit conditionnel.** Par exemple indisponible le tour où l'on frappe. Cela
  restaure un arbitrage, mais mange la garantie de D18 et rend possible le tour bloqué.
- **Des ennemis qui punissent le déplacement** plutôt que la position. Une intention de type
  « frappe la case que tu occuperas » est impossible sans information cachée, mais « frappe une
  ligne entière » ou « frappe en réaction à ton déplacement » ne l'est pas.
- **Des rencontres qui acculent.** Le placement à la main peut créer des situations sans case
  de fuite. C'est un correctif de contenu, pas de système : il ne règle pas le cas général.

Ma préférence, à titre indicatif : les motifs à plusieurs cases. C'est le seul des quatre qui
corrige la cause sans toucher à une décision figée.

## Ce que ça dit du jalon M2

Le gate M2 demande « est-ce que jouer un seul combat est déjà agréable ? ». Tel quel, un
combat d'acte 1 est un exercice sans risque. **Il faut arbitrer ce point avant de mesurer le
gate**, sinon le gate mesurera un jeu qui n'existera pas.
