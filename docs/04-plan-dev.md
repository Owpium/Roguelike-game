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

### M1 — Socle technique
Repo TypeScript, Vite, Vitest, CI, et le **cœur de jeu headless** : état, réducteur pur,
RNG seedé, une run entière jouable en ligne de commande, sans une seule pixel.
**Sortie** : `pnpm sim --seed 42` joue une run complète avec une IA basique et affiche le log.
**Pourquoi d'abord** : ça rend `balance-simulator` opérationnel dès M2, et ça garantit
l'invariant de déterminisme au lieu de le rattraper plus tard.

### M2 — Le premier combat 🚦 **GATE DE DÉCISION**
Grille, dés, main, intentions ennemies, 1 personnage, 3 ennemis, rendu généré par code, en
portrait, sur un vrai téléphone.
**Sortie** : un combat jouable au pouce.
**Question du gate** : *est-ce que jouer un seul combat est déjà agréable ?*
Si non → on pivote la boucle de tour ici, où ça ne coûte que M1+M2. Ne pas franchir ce gate
par optimisme.

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
