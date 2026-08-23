# Boucle de jeu et pacing

## Les trois boucles

```
BOUCLE DE TOUR      (~8 s)   tirer la main → lire les télégraphes → dépenser → résoudre
BOUCLE DE RUN       (~12 min) combat → récompense → choix de chemin → ... → boss → mort/victoire
BOUCLE DE META      (n runs)  débloquer perso/objets → nouvelles combinaisons possibles
```

Chaque boucle doit être satisfaisante **seule**. Si la boucle de tour n'est pas bonne, aucun
contenu ne sauvera le jeu — c'est pour ça que le jalon M2 du plan de dev est un gate de
décision.

## Boucle de tour (le cœur)

1. **Tirage** — tu piges N dés de ton pool (N = 3 au départ). Le pool se recycle quand il
   est vide.
2. **Lecture** — chaque ennemi affiche son intention sur la grille (case visée, effet).
   Aucune surprise.
3. **Dépense** — tu poses tes dés sur des actions. Chaque dé dépensé peut déclencher les
   effets de tes objets.
4. **Résolution** — tes actions, puis celles des ennemis, dans un ordre lisible et fixe.

Contraintes de design non négociables :
- Une action = **un geste** (tap, ou drag du dé vers une case). Jamais de combo de gestes.
- Tout est **annulable tant que le tour n'est pas validé**. Sur mobile, le mistap est la
  première cause de frustration.
- Le tour de l'ennemi est **rejouable en boucle** visuellement si le joueur ne comprend pas
  ce qui vient de se passer.

## Budget de temps d'une run (cible 12 min)

| Segment | Nb | Unitaire | Total |
|---|---|---|---|
| Combats normaux | 9 | 40 s | 6 min 00 |
| Boss | 3 | 95 s | 4 min 45 |
| Choix de récompense / chemin | 12 | 6 s | 1 min 12 |
| Écran de sélection de perso | 1 | 15 s | 0 min 15 |
| **Total** | | | **~12 min** |

Ce tableau est un **contrat**. `balance-simulator` doit mesurer la durée réelle et alerter
dès qu'on dérive de plus de 20 %. Le premier réflexe en cas de dérive est de raccourcir les
combats, jamais d'en enlever : la densité de choix est ce qui rend la run mémorable.

## Courbe de tension

```
Acte 1  apprentissage      difficulté basse, on découvre son build
Acte 2  affirmation        la difficulté croise la puissance ; c'est là qu'on meurt
Acte 3  démonstration      le build est constitué, le jeu te laisse t'en servir
Boss 3  test               le build doit être testé, pas contourné
```

Règle : le pic de difficulté est **au milieu de l'acte 2**, pas au boss final. Le boss final
doit être la récompense du build, pas un mur. Un joueur qui arrive au boss 3 avec un bon
build doit gagner ~60 % du temps.

## Interruptibilité (contrainte n°1 du mobile)

- L'état complet est sérialisé **après chaque action validée**, pas à chaque écran.
- Fermer l'app en plein combat et revenir 3 jours après reprend exactement au même dé.
- Aucun écran de chargement de plus de 500 ms après le premier lancement.
- Le jeu ne doit jamais dire « tu vas perdre ta progression ».

## Rejouabilité

À trancher (voir `docs/06-arbitrages.md`) : ascensions/paliers de difficulté, mutateurs,
seed du jour. Aucun de ces systèmes n'entre avant le jalon M6.
