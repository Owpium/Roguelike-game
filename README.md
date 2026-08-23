# Roguelike tactique mobile

Un roguelike tactique en portrait, jouable au pouce. Chaque tour, tu tires une main de dés
d'action ; tes reliques ne donnent pas de stats, elles modifient tes dés et se déclenchent
quand tu les dépenses. Une run dure 10 à 15 minutes et s'interrompt à tout moment.

**État : cadrage (jalon M0).** Aucune ligne de code de jeu pour l'instant — c'est délibéré.

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

## Stack visée

TypeScript · Vite · Vitest · Canvas 2D + React · Capacitor (iOS/Android)
