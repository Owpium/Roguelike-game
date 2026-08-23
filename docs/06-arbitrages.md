# Registre d'arbitrages

Deux parties : ce qui est **tranché** (et pourquoi), et ce qui reste **ouvert**, par ordre
de priorité. Ce fichier est le point d'entrée quand on reprend le projet après une pause :
il dit où on en est de la réflexion, pas seulement du code.

---

## Partie 1 — Tranché

| # | Décision | Retenu | Alternative écartée | Raison |
|---|---|---|---|---|
| D1 | Sous-genre | Tactique tour par tour sur grille compacte, avec main de dés d'action | Survivor temps réel, deckbuilder, auto-battler | Interruptible, une main, pas de coût de « game feel », et simulable pour l'équilibrage |
| D2 | Stack | TypeScript / Web → Capacitor | Godot, Unity, Flutter | Itération la plus rapide, cœur de jeu testable en headless, CI complète |
| D3 | Méta-progression | Déblocage de **contenu**, jamais de puissance | Upgrades permanents, roguelike pur | Pas de grind, équilibrage stable dans la durée, cohérent avec l'envie de combinaisons |
| D4 | Source du plaisir | Synergies empilées entre reliques (esprit *Binding of Isaac*) | Maîtrise tactique pure | C'est la demande explicite ; oriente tout le design des reliques vers le levier « déclenchement » |
| D5 | Identité de run | Choix d'un personnage déblocable, pool + relique signature + règle propre | Personnage unique | Rejouabilité et support naturel de la méta-progression |
| D6 | Aléatoire | Dans le tirage et la génération, jamais dans la résolution | Jets à toucher, dégâts variables | Le joueur doit pouvoir attribuer sa défaite à ses décisions |
| D7 | Art | Généré par code d'abord, remplacé ensuite (ComfyUI + retouches) | Asset packs, artiste dès le départ | Zéro blocage de production, DA cohérente tôt, remplacement progressif |
| D8 | Ambition | Projet perso ambitieux, sortie éventuelle | Sortie commerciale planifiée, prototype jetable | On vise un jeu fini et bon, sans payer maintenant le coût de la monétisation |
| D9 | Réseau | 100 % hors ligne en v1 | Comptes, cloud save, classements | Aucune dépendance serveur tant que le jeu n'est pas bon |

---

## Partie 2 — Ouvert, par priorité

### P0 — Bloque le jalon M2 (le premier combat)

**A1. Taille de la grille et gestion de la position.**
Une grille 5×7 en portrait donne des cases confortables au pouce mais peu de place tactique.
Le déplacement est-il un vrai levier tactique (donc grille plus grande, dés de Pas
importants) ou un simple positionnement d'appoint (grille minuscule, tout se joue sur la
dépense) ? *Ça change la boucle de tour, donc tout le reste.*

**A2. Nombre de dés en main et taille du pool de départ.**
3 dés en main sur un pool de 6 ? La main est-elle de taille fixe ou variable ? Le pool se
recycle-t-il quand il est vide, ou se reconstitue-t-il à chaque combat ? *Détermine
directement la longueur d'un tour, donc la durée d'une run.*

**A3. Que fait-on des dés non dépensés ?**
Perdus, reportés au tour suivant, convertis en ressource ? C'est le principal levier de
tension d'un tour, et le principal vecteur de synergies (« quand tu gardes un dé, … »).

**A4. Coût des actions.**
Une action = un dé de la bonne face ? Ou les dés ont-ils des valeurs qu'on additionne ?
*Les valeurs numériques ouvrent beaucoup de design d'objets, mais alourdissent la lecture
sur petit écran.* Recommandation à instruire : commencer sans valeurs, ajouter seulement si
le combat manque de décisions.

**A5. Défaite et santé.**
Points de vie classiques, ou une jauge plus lisible (ex. : ton pool se dégrade quand tu
prends des coups) ? *La seconde option lie dégâts et identité, ce qui est élégant, mais elle
crée une spirale de la mort qu'il faut maîtriser.*

### P1 — Bloque le vertical slice (M3)

**A6. Structure de la carte.** Chemin branché visible à l'avance façon *Slay the Spire*, ou
découverte progressive ? Le premier est plus lisible en portrait et permet la planification.

**A7. Système de récompense.** Choix parmi 3 reliques ? Une monnaie et une boutique ? Les
deux ? Combien de reliques possède-t-on à la fin d'une run (ordre de grandeur : 10-14) ?

**A8. Peut-on refuser / retirer une relique ?** Question cruciale dans un jeu à synergies :
sans retrait, les builds se diluent ; avec retrait, on optimise trop facilement.

**A9. Limite dure sur les chaînes de déclenchement.** Combien de déclenchements en cascade
sont autorisés par tour ? Fixer un nombre maintenant, et le tester, plutôt que de découvrir
un blocage sur téléphone en M5.

**A10. Le format de données d'un effet de relique.** Décision technique à forte conséquence
de design : plus le format est expressif, plus les reliques sont créatives, mais moins le
simulateur peut raisonner dessus. À trancher entre M1 et M3, avec `item-designer` dans la
boucle.

### P2 — Avant le contenu de masse (M4)

**A11.** Les reliques signatures des personnages sont-elles trouvables par les autres
personnages ? (recommandation : oui pour les reliques, non pour les règles propres)
**A12.** Économie de la run : une monnaie ? deux ? aucune ?
**A13.** Sous-thèmes des 3 biomes, et ce qu'ils changent mécaniquement (pas seulement la
couleur).
**A14.** Nombre d'archétypes de build visés et taux de victoire cible par archétype.

### P3 — Avant la sortie (M5-M7)

**A15.** Monétisation : premium, gratuit avec pub récompensée, cosmétiques ? *Décision
reportée volontairement (D8), mais elle doit être prise avant M6 car elle influe sur les
déblocages.*
**A16.** Rejouabilité longue : paliers d'ascension, mutateurs, seed du jour.
**A17.** Classements et partage social (implique de casser D9).
**A18.** Langues à la sortie. **A19.** Accessibilité : daltonisme, taille de texte, mode
gaucher. **A20.** Télémétrie d'équilibrage et son cadre RGPD/ATT.

---

## Journal des décisions

| Date | Décision | Contexte |
|---|---|---|
| 2026-08-23 | D1 à D9 | Session de cadrage initiale |
