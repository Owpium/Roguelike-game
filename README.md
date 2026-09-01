# Roguelike tactique mobile

Un roguelike tactique en portrait, jouable au pouce. Chaque tour, tu tires une main de dés
d'action ; tes reliques ne donnent pas de stats, elles modifient tes dés et se déclenchent
quand tu les dépenses. Une run dure 10 à 15 minutes et s'interrompt à tout moment.

**État : premier combat jouable (jalon M2).** Le gate de décision est prêt à être joué.

```bash
pnpm install
pnpm dev                        # le combat, à ouvrir sur un téléphone
pnpm typecheck && pnpm test
pnpm sim --seed 42              # une run complète en console
pnpm sim --campaign --runs 500  # les six variantes de règles, appariées
```

`pnpm dev` écoute sur le réseau local : ouvre l'adresse affichée sur ton téléphone, c'est
là que la question du gate se juge.

## Paquets

| Paquet | Rôle |
|---|---|
| `packages/core` | Le jeu. Pur, déterministe, aucune référence au DOM ni au temps qui passe |
| `packages/content` | Les données : dés, ennemis, rencontres |
| `packages/sim` | Le simulateur headless et son IA de joueur |
| `packages/app` | L'interface : grille en canvas, HUD React, portrait, une main |

## Documentation

| Document | Contenu |
|---|---|
| [Concept](docs/00-concept.md) | pitch, piliers, anti-objectifs, format d'une run |
| [Boucle et pacing](docs/01-boucle-et-pacing.md) | boucle de tour, budget de temps, interruptibilité |
| [Systèmes v0](docs/02-systemes-v0.md) | vocabulaire, leviers de conception, invariants |
| [Content budget](docs/03-content-budget.md) | volumes de contenu visés pour la v1 |
| [Plan de dev](docs/04-plan-dev.md) | jalons M0 à M7 |
| [Technique](docs/05-technique.md) | stack, architecture, décisions structurantes |
| [Arbitrages](docs/06-arbitrages.md) | décisions prises et points ouverts par priorité |
| [Combat](docs/design/combat.md) | règles complètes, chiffrées, implémentables |
| [Run](docs/design/run.md) | carte, nœuds, récompenses, courbe de difficulté |
| [Rapports](docs/design/rapports/) | mesures de simulation |

## Stack visée

TypeScript · Vite · Vitest · Canvas 2D + React · Capacitor (iOS/Android)
