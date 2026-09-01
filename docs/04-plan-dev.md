# Plan de développement

Contexte : dev solo, **temps irrégulier, par à-coups**. Conséquences assumées sur le plan :

- Chaque jalon se termine par **quelque chose qui se lance et se joue**. Jamais de jalon
  « refacto » ou « infrastructure » qui laisse le projet injouable pendant trois semaines.
- Chaque jalon est découpé en tâches d'**une session de 2 h maximum**.
- La doc et les tests ne sont pas du confort : ce sont les seuls moyens de reprendre après
  un mois d'absence sans tout relire. Une session qui se termine met à jour
  `docs/06-arbitrages.md`.

## Jalons

### M0 — Cadrage ✅ (ce commit)
Concept figé, systèmes cadrés, content budget, agents créés, arbitrages listés.
**Sortie** : la doc de ce dossier. Aucune ligne de code de jeu.

### M1 — Socle technique ✅
Monorepo pnpm, TypeScript strict, Vitest, CI, et le **cœur de jeu headless** : état,
réducteur pur, RNG seedé, une run entière jouable en ligne de commande, sans une seule pixel.

**Sortie livrée** : `pnpm sim --seed 42` joue une run complète et affiche le journal ;
`pnpm sim --seed 1 --runs 200` agrège. 36 tests, typecheck et déterminisme vérifiés en CI.

**Ce que le jalon a immédiatement produit** : le premier rapport de simulation,
`docs/design/rapports/2026-08-31-esquive-gratuite.md`, qui montre que l'esquive est gratuite
et totale — 98,5 % des runs se terminent sans perdre un seul PV. C'est exactement ce pour quoi
ce jalon passe avant le rendu.

**Réserve** : le contenu des actes 2 et 3, les élites et les boss sont des remplisseurs
(`packages/content/src/encounters.ts`). Ils font tourner le moteur, ils ne mesurent rien.

Le moteur applique désormais les règles arbitrées : pas de pas gratuit (D44), grammaire des
motifs `single`/`lunge`/`line3` (D46), `charge` à partir de l'acte 2 (D47), soin de 12 PV
(D36). La campagne de mesure reste disponible pour comparer à la référence historique :
`pnpm sim --campaign --runs 500`.

### M2 — Le premier combat 🚦 **GATE DE DÉCISION** — prochain jalon
Grille, dés, main, intentions ennemies, 1 personnage, 3 ennemis, rendu généré par code, en
portrait, sur un vrai téléphone.
**Sortie livrée** : `pnpm dev`, un combat jouable au pouce en portrait. Les cinq rencontres
de l'acte 1, les trois reliques factices activables une à une, la grille en canvas derrière
une interface `Renderer`, le HUD et la Main en React dans le tiers inférieur de l'écran.

Ce que l'interface tient déjà : le rendu lit l'**état projeté**, donc les cases visées se
recalculent en direct pendant la pose — la promesse de D21 est vraie par construction, pas
par vigilance. L'annulation est LIFO. Rien n'est résolu avant *Valider*.

Ce qu'elle ne fait pas encore, et c'est conforme au plan : **aucune animation**. L'état
bascule d'un coup, avec des indicateurs de dégâts flottants et le journal du tour en
français. Le mouvement animé, l'haptique et le son sont le sujet de M5.

Vérification automatique : `pnpm --filter @rl/app smoke` ouvre la page dans un Chromium aux
dimensions d'un téléphone et échoue si la page déborde latéralement, si une case passe sous
44 px, ou si la console produit une erreur.
**Question du gate** : *est-ce que jouer un seul combat est déjà agréable ?*
Si non → on pivote la boucle de tour ici, où ça ne coûte que M1+M2. Ne pas franchir ce gate
par optimisme.

**Deux questions lui ont été explicitement déléguées** :
- **Les dégâts subis sont-ils au bon niveau ?** (D48) La simulation ne peut pas y répondre :
  son barème d'IA a un biais défensif tant que A26 n'est pas traité. Trois combats joués à la
  main trancheront.
- **Le combat est-il évalué avec des reliques ?** `game-designer` prévient que le kit de base
  est délibérément maigre — Garde ne fait que « +3 Bouclier » — et que toute la profondeur
  défensive est reportée sur les reliques. Tester le gate sans deux ou trois reliques
  factices, c'est mesurer un jeu qui n'existera pas.

### M3 — Vertical slice
Carte branchée, 1 acte complet + boss, 15 reliques, récompenses, sauvegarde/reprise,
écran de mort. Une run courte de bout en bout.
**Sortie** : une run de 4 min qu'on peut faire jouer à quelqu'un d'autre.

### M4 — Systèmes et contenu
3 actes, 4 personnages, 60 reliques, 18 ennemis, événements. `balance-simulator` tourne en
CI sur chaque changement de contenu.
**Sortie** : le jeu complet en contenu, laid mais entier.

### M5 — Mobile et sensation
Capacitor, builds iOS/Android, haptique, audio, animations, onboarding sans tutoriel textuel,
tenue en main, accessibilité de base.
**Sortie** : un build installable sur ton téléphone et celui d'un testeur.

### M6 — Méta et rejouabilité
Déblocages, objectifs, paliers de difficulté, statistiques, seed du jour si retenue.
**Sortie** : une raison de relancer une 20ᵉ run.

### M7 — Direction artistique et finition
Remplacement des visuels générés par code (pipeline ComfyUI), localisation, écrans de store,
optimisation.
**Sortie** : candidat à la publication.

## Ce qui peut avancer en parallèle

Le contenu (reliques, lore, ennemis) est de la **donnée**, pas du code. Les agents de design
peuvent produire du contenu dès M1, tant qu'ils respectent le format de données défini en M1.
C'est le principal levier de parallélisation du projet.

## Règle de qualité

Aucun merge sans : typecheck vert, tests verts, et — dès M4 — simulation d'équilibrage sans
régression. La CI le vérifie ; on ne discute pas avec la CI.
