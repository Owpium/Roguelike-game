# Instructions projet

Roguelike tactique mobile, en TypeScript, packagé avec Capacitor. Dev solo, **temps
irrégulier** : la doc est le seul mécanisme de reprise après une pause. Traite-la comme du
code.

## À lire au début de toute session

1. `docs/00-concept.md` — le concept figé et les anti-objectifs
2. `docs/06-arbitrages.md` — ce qui est tranché, ce qui reste ouvert, et par quelle priorité
3. `docs/04-plan-dev.md` — où on en est dans les jalons

## Règles de travail

- **Le concept est figé.** Les décisions D1-D9 de `docs/06-arbitrages.md` ne se
  renégocient pas au détour d'une implémentation. Si l'une d'elles pose vraiment problème,
  dis-le explicitement et attends l'arbitrage.
- **Le vocabulaire est normé.** Pool, Main, Face, Dépense, Relique, Intention en français
  côté joueur ; `pool`, `hand`, `face`, `spend`, `relic`, `intent` dans le code. Aucun
  synonyme, nulle part.
- **Les invariants I1-I5 de `docs/02-systemes-v0.md` sont des règles dures.** Les casser est
  un bug, pas un compromis. Le déterminisme (I1) en particulier : aucun `Math.random` dans
  `packages/core`.
- **Fin de session : mets à jour `docs/06-arbitrages.md`.** Une décision prise et non
  consignée sera reprise à zéro dans trois semaines.
- Pas de merge sans typecheck vert et tests verts. Dès M4, sans régression d'équilibrage.

## Les agents

Six agents spécialisés sont définis dans `.claude/agents/`. Ils ont des périmètres
volontairement étanches — un agent qui déborde produit des décisions contradictoires.

| Agent | Périmètre |
|---|---|
| `game-designer` | boucle de tour, boucle de run, règles de combat, difficulté |
| `progression-designer` | pool, courbe de puissance, personnages, méta-progression |
| `item-designer` | reliques, synergies, archétypes de build, rareté |
| `lore-keeper` | univers, noms, tous les textes vus par le joueur |
| `balance-simulator` | simulation headless, mesures, détection de contenu cassé |
| `mobile-ux` | ergonomie du pouce, lisibilité, interruptibilité, accessibilité |

Leurs productions vont dans `docs/design/`.

## Branche

Développement sur `claude/mobile-roguelike-game-scope-4nqupz`.
