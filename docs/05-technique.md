# Cadre technique

## Stack retenue

| Couche | Choix | Raison |
|---|---|---|
| Langage | TypeScript strict | typage du contenu, refactos sûres après des semaines d'absence |
| Build | Vite | démarrage instantané, build mobile simple |
| Paquets | pnpm workspaces | sépare le cœur du rendu de façon contraignante |
| Rendu grille | Canvas 2D derrière une interface `Renderer` | zéro dépendance au départ ; passage à PixiJS possible sans toucher au jeu |
| UI / écrans | React + CSS | menus, HUD, sélection de reliques : c'est de l'UI, pas du jeu |
| État | réducteur pur, pas de framework d'état | l'état du jeu est une donnée sérialisable, point |
| Tests | Vitest | tests unitaires + tests de simulation |
| Persistance | IndexedDB (via une petite couche maison) | volume et fiabilité supérieurs à localStorage |
| Mobile | Capacitor | un seul code, iOS + Android, accès haptique/statusbar |
| CI | GitHub Actions | lint, typecheck, tests, simulation d'équilibrage |

## Architecture

```
packages/
  core/        le jeu. Pur, déterministe, aucune référence au DOM, au temps réel, à React.
               reducer(state, action) -> state
  content/     les données : reliques, ennemis, personnages, biomes. TypeScript typé.
  sim/         le simulateur headless : joue N runs, sort des statistiques.
  app/         le rendu, les écrans, les entrées, Capacitor.
```

**Règle d'or** : `core` ne connaît ni `app` ni le temps qui passe. Si `core` a besoin de
savoir qu'une animation est terminée, c'est que l'architecture est cassée. Les animations
consomment un journal d'événements produit par `core`, elles ne le pilotent pas.

## Décisions structurantes

- **Déterminisme et RNG injecté.** Un générateur seedé explicite (pas de `Math.random`
  nulle part dans `core`, vérifié par une règle de lint). L'état contient la seed et le
  compteur d'appels, donc il est reproductible à l'identique.
- **L'état est la sauvegarde.** Pas de format de sauvegarde séparé : on sérialise l'état.
  Versionné avec des migrations dès qu'on distribue un build à quelqu'un.
- **Le contenu est du TypeScript typé, pas du JSON.** On veut l'autocomplétion, la
  vérification à la compilation et la possibilité d'exprimer des effets. Un effet de
  relique est une donnée décrivant un déclencheur et une conséquence, pas une fonction
  arbitraire — sinon rien n'est ni sérialisable ni analysable par le simulateur.
- **Journal d'actions.** Chaque run enregistre seed + suite d'actions. Ça donne
  gratuitement : la reprise après crash, la reproduction d'un bug signalé, et plus tard le
  replay.
- **Le simulateur est un citoyen de première classe**, pas un script jetable. C'est le seul
  moyen d'équilibrer 60 reliques en solo.

## Conventions

- Tout le vocabulaire de jeu (Pool, Main, Face, Dépense, Relique, Intention) est en
  **français dans l'UI et en anglais dans le code** (`pool`, `hand`, `face`, `spend`,
  `relic`, `intent`), avec la table de correspondance dans `docs/02-systemes-v0.md`.
- Commits conventionnels (`feat:`, `fix:`, `docs:`, `content:`).
- Pas de `any`, pas de `@ts-ignore` sans commentaire justifiant.

## Ce qu'on ne met PAS en place maintenant

Analytics, backend, comptes, cloud save, pubs, IAP. Rien de tout ça avant M6, et seulement
si l'arbitrage sur la monétisation le demande.
