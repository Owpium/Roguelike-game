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
| D10 | Grille | 5×7, déplacement secondaire | Grille large où le déplacement est le levier principal | Une case doit faire 44 pt sous le pouce ; au-delà de 7 rangées on tape à côté |
| D11 | Main et pool | 3 dés en main, pool de départ de 6, recyclage quand le pool est vide | Main variable, pool reconstitué à chaque combat | Le recyclage rend la composition du pool visible au joueur, ce qui est le cœur du pilier 1 |
| D12 | Dés non dépensés | Conservation **choisie**, 2 au plus. Les autres retournent au pool et seront relancés | Report automatique, dés perdus, report sans limite | Un choix explicite ajoute une décision par tour au lieu d'une conséquence subie. Renforce mutuellement les combos |
| D13 | Valeurs numériques | Aucune. Une action coûte un dé de la bonne face | Dés à valeurs qu'on additionne | Lisibilité sur petit écran. On pourra ajouter des valeurs si le combat manque de décisions ; l'inverse est très difficile à retirer |
| D14 | Santé | Points de vie classiques | Dégradation du pool à chaque coup reçu | Trop punitif comme règle par défaut ; la dégradation du pool est réservée aux boss et aux hautes difficultés |
| D15 | Difficulté cible | 3 à 6 runs avant la première victoire | Victoire à la première run, ou 20 défaites préalables | Territoire *Slay the Spire*. Cible mesurable : ~25-30 % de victoires en découverte, ~55-60 % en maîtrise |
| D16 | Identité des personnages | Chacun tord les dés à sa manière | Archétypes de combat (le rapide, le lourd, le contrôleur) | Bien plus riche avec ce système. Contrepartie assumée : le personnage de départ doit rester simple, il enseigne les dés |
| D17 | Modèle du dé | Un seul type, faces mixtes : Frappe ×3, Garde ×2, Élan ×1. Éclat obtenu, jamais de départ | Dés de mouvement et dés d'action séparés | Des pools séparés supprimeraient les combos — une paire n'a de sens que si tout dé peut montrer tout symbole — et rendraient inerte la moitié du design des personnages |
| D18 | Déplacement de base | Un pas gratuit par tour ; le déplacement ambitieux passe par la face Élan | Tout déplacement payé en dés | Aucun tirage ne peut bloquer le joueur, et on ne dépense pas une décision à avancer d'une case |
| D19 | Pool de départ | 6 dés identiques | Pool hétérogène dès le départ | Au premier combat le seul aléatoire est le lancer ; la complexité du système croît au rythme de la maîtrise, sans écran de tutoriel |
| D20 | Aléatoire par tour | Un seul événement : tirage et lancer en un geste | Piocher puis lancer comme deux étapes distinctes | Deux couches de hasard sur une main de 3 dés, c'est trop de variance pour une run de 12 min |
| D21 | Structure du tour | Tirage → lecture → choix (dépenses et conservations, tout annulable) → validation → résolution → défausse | Résolution immédiate à chaque dépense | Sans aléatoire dans la résolution, la différer ne prive le joueur d'aucune information : l'annulation libre est gratuite. L'ordre des dépenses reste choisi, car il compte pour les combos |
| D22 | Relances individuelles | Autorisées comme levier de reliques et de personnages, mais plafonnées par tour, en un geste, et sans relance qui engendre une relance | Relance libre, ou aucune relance | Le levier le plus demandé et le plus dangereux : il pèse directement sur le budget de 8 s par tour, donc sur la durée de la run |

---

## Partie 2 — Ouvert, par priorité

### P0 — Bloque le jalon M2 (le premier combat)

Tous les points P0 sont tranchés : A1 à A5 par D10-D14, le modèle du dé par D17-D22.
Le jalon M2 n'est plus bloqué par une question de design.

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

**A20. Les crochets de combo.** Quels motifs les reliques peuvent-elles observer : Paire,
Trio, Écho (un dé identique au précédent), Suite ? Chacun ouvert est un axe de synergies,
et chacun est aussi une source de boucle potentielle. En fixer la liste avant d'écrire la
moindre relique — c'est un contrat aussi structurant que les crochets de dépense.

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
| 2026-08-23 | D10 à D16 | Arbitrage des P0 : grille, main, report, valeurs, santé, difficulté, identité des personnages |
| 2026-08-29 | D17 à D22 | Modèle du dé, déplacement, structure du tour, relances. D12 précisée : la conservation est un choix |
