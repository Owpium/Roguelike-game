# Concept — Game Concept Doc

> Statut : **figé v1** (2026-08-23). Toute modification passe par `docs/06-arbitrages.md`.

## Pitch

Un roguelike tactique mobile, en portrait, jouable au pouce. Chaque tour, tu tires une
**main de dés d'action** depuis ton pool. Tu les dépenses sur une petite grille pour
frapper, bouger, te garder. Tes objets ne donnent pas des stats : ils **modifient tes
dés** et **déclenchent des effets quand tu les dépenses**. Les combinaisons s'empilent
jusqu'à des builds absurdes. Une run dure 10 à 15 minutes et se coupe à n'importe quel
moment sans rien perdre.

## Les 3 piliers

1. **Le pool de dés est le personnage.** Ta puissance n'est pas un chiffre, c'est la
   composition de ton pool et ce qui se déclenche quand tu dépenses. Toute progression
   intra-run passe par là.
2. **Zéro information cachée.** Les ennemis télégraphient leur prochaine action (façon
   *Into the Breach*). L'aléatoire est dans le tirage, jamais dans la résolution : pas de
   coup manqué, pas de dégâts aléatoires. Le joueur perd parce qu'il a mal joué, pas parce
   qu'il a mal roulé.
3. **Le mobile est une contrainte de design, pas un portage.** Portrait, une main,
   interruptible à la seconde près, une run tient dans un trajet de métro.

## Anti-objectifs (ce qu'on ne fera pas)

- Pas de temps réel, pas de timing, pas de dextérité.
- Pas de mur de grind : la méta-progression débloque du **contenu**, pas de la puissance
  brute (voir `docs/02-systemes-v0.md`).
- Pas d'inventaire à gérer, pas d'équipement à comparer case par case.
- Pas de narration longue. Le lore passe par les noms, les descriptions d'objets et de
  courts encarts. Personne ne lit trois paragraphes sur un téléphone.
- Pas de multijoueur, pas de temps réel serveur, pas de compte obligatoire. Le jeu est
  100 % jouable hors ligne.

## La fantaisie du joueur

« J'ai construit une machine ridicule à partir de trois objets qui n'avaient rien à voir,
et je viens de tuer le boss en un tour. » — c'est la sensation *Binding of Isaac*, portée
dans un cadre tactique lisible et sans stress temporel.

## Choix de personnage

On démarre chaque run en choisissant un personnage. Un seul est disponible au début, les
autres se débloquent en jouant.

Un personnage, c'est **un pool de dés de départ + un objet signature + une règle propre**.
Ce n'est pas un pack de stats. Deux personnages doivent se jouer différemment dès le
premier tour, pas être « le même en plus fort ».

**Point de design ouvert (à trancher par `progression-designer`)** : est-ce que l'objet
signature d'un personnage peut se retrouver en jeu avec un autre personnage ?
Recommandation à instruire : **oui pour les objets, non pour la règle propre**. Retrouver
l'objet signature d'Untel avec un autre perso est un excellent moment de synergie
inattendue ; dupliquer la règle propre casse l'identité du personnage.

## Format d'une run

| | |
|---|---|
| Durée cible | 10-15 min (médiane 12) |
| Structure | 3 actes × (3 rencontres + 1 boss) = 12 rencontres |
| Durée d'un combat normal | 30-60 s (4-6 tours) |
| Durée d'un boss | 90-120 s |
| Tour du joueur | 6-10 s, 2-4 décisions |
| Décisions significatives par run | 20-30 (objets, chemin, dépense de dés critique) |
| Fin | Permadeath. La run se termine, le contenu débloqué reste. |

## Plateformes

iOS + Android, portrait uniquement. Web jouable en interne pour le dev et les tests.
