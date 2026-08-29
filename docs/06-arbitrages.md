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
| D12 | Dés non dépensés | Reportés au tour suivant, plafond de 2 | Perdus, reportés sans limite | Crée une vraie décision de temporisation sans permettre d'accumuler jusqu'au tour parfait. Renforce mutuellement les combos (D17) |
| D13 | Valeurs numériques | Aucune. Une action coûte un dé de la bonne face | Dés à valeurs qu'on additionne | Lisibilité sur petit écran. On pourra ajouter des valeurs si le combat manque de décisions ; l'inverse est très difficile à retirer |
| D14 | Santé | Points de vie classiques | Dégradation du pool à chaque coup reçu | Trop punitif comme règle par défaut ; la dégradation du pool est réservée aux boss et aux hautes difficultés |
| D15 | Difficulté cible | 3 à 6 runs avant la première victoire | Victoire à la première run, ou 20 défaites préalables | Territoire *Slay the Spire*. Cible mesurable : ~25-30 % de victoires en découverte, ~55-60 % en maîtrise |
| D16 | Identité des personnages | Chacun tord les dés à sa manière | Archétypes de combat (le rapide, le lourd, le contrôleur) | Bien plus riche avec ce système. Contrepartie assumée : le personnage de départ doit rester simple, il enseigne les dés |

---

## Partie 2 — Ouvert, par priorité

### P0 — Bloque le jalon M2 (le premier combat)

Les cinq points P0 initiaux (A1 à A5) sont tranchés : voir D10 à D14. Il reste le modèle du
dé lui-même.

**A21. Modèle du dé — en attente de validation.**
Recommandation formulée le 2026-08-23, à confirmer avant que `game-designer` ne rédige les
règles de combat :

- **Un seul type de dé, faces mixtes.** Des dés de mouvement séparés supprimeraient les
  combos (une paire n'a de sens que si tout dé peut montrer tout symbole) et rendraient
  inerte la moitié de l'espace de design des personnages « tordeurs de dés » (D16).
- **Quatre faces** : Frappe, Garde, Élan, Éclat (joker). Pas davantage : c'est la limite de
  lisibilité sur téléphone et la limite au-delà de laquelle les combos deviennent illisibles.
- **Dé de départ** : 3 Frappe, 2 Garde, 1 Élan. Aucun Éclat au départ — l'Éclat s'obtient
  par les reliques et les gravures, ce qui en fait une progression visible.
- **Un pas gratuit par tour**, toujours disponible. Les dés servent aux actions, pas au
  déplacement de base. Sans cette règle, un tirage de trois Frappes empêche de fuir : le
  joueur perdrait à cause du tirage et non de ses décisions, ce qui viole le pilier 2.
  Le déplacement ambitieux (2-3 cases, traversée, poussée) reste sur la face Élan.
- **Pool de départ homogène** : 6 dés identiques. Au premier combat le seul aléatoire est le
  lancer ; le tirage ne signifie rien tant que les dés sont identiques. La complexité du
  système croît au rythme de la diversification du pool, donc au rythme de la maîtrise du
  joueur, sans écran de tutoriel.

**A22. Le dé est-il lancé, ou est-ce un jeton à face fixe ?**
Conséquence de A21. Recommandation : tirage et lancer sont **un seul geste** — on pige 3 dés
et ils sont lancés en même temps, donc un seul événement aléatoire par tour. Deux couches
d'aléatoire (quel dé, puis quelle face) sur une main de 3 dés produisent trop de variance
pour une run de 12 minutes.

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
