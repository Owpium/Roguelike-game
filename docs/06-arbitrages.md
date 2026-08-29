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
| D23 | Structure de la carte (A6) | Acte entier visible à l'avance : 4 rangs (2 nœuds, 3 nœuds, 2 nœuds, boss), **connexions complètes entre rangs consécutifs** | Graphe branché à arêtes restreintes façon *Slay the Spire* | Des arêtes croisées sont illisibles à 390 pt de large et obligent à faire défiler la carte. On garde 90 % du bénéfice (voir tout l'acte) pour 0 % du coût de lisibilité. Reste 3 choix de chemin par acte |
| D24 | Récompenses (A7) | 1 relique au choix parmi 3 par combat gagné ; **une seule monnaie** ; boutique au rang 2 des actes 2 et 3 ; 12-15 reliques par run | Monnaie sans choix de relique ; deux monnaies | La méta-progression étant du déblocage de contenu (D3), une 2ᵉ monnaie ne servirait qu'à découper une économie de 12 min |
| D25 | Refus et retrait (A8) | Refuser une relique est **toujours** possible (rend de la monnaie) ; **retirer une relique prise est impossible** ; en revanche on retire des dés du `pool` à la Forge | Retrait payant en boutique | Refuser est un choix pris avec l'information du moment ; retirer est une optimisation prise plus tard. Le retrait fait converger toutes les runs vers le même ensemble optimal. Le `pool` est la partie sculptable, les reliques la partie accumulée |
| D26 | Limite de déclenchements (A9, I3) | **20 par tour**, dont **6 au plus pour une même relique**. File FIFO en largeur, jamais ré-entrante | Pas de plafond, avec détection de cycle | Le nombre est dérivé du budget : 20 × 100 ms d'animation = 2,0 s, le plafond de résolution du § 14 de `combat.md`. La détection de cycle n'attrape pas les chaînes finies et gigantesques, qui sont le vrai problème sur téléphone |
| D27 | Crochets de combo (A20) | Liste **fermée** : Paire, Trio, Écho, Suite, définis sur la séquence ordonnée des dépenses. Détection à la validation, résolution après la dernière dépense, une fois chacun par tour, ordre canonique Paire → Écho → Trio → Suite | Détection au fil de la pose et résolution immédiate | La détection au fil met les combos dans la boucle de récursion et oblige à résoudre pendant la phase de choix, ce qui casse D21. Écho et Suite exigent la **consécutivité**, sinon elles deviennent triviales dès qu'on dépense 5 dés |
| D28 | Ancrage des intentions | Le motif de cases est figé au télégraphe, **l'ancre suit l'unité** ; les cases visées se recalculent en direct pendant la phase de choix | Cases absolues figées | Avec des cases absolues, déplacer un ennemi n'aurait aucun effet défensif et viderait de sens tout le design de contrôle. La règle n'est honnête que grâce à D21 : le joueur voit l'image finale avant le point de non-retour |
| D29 | Ce qui traverse un combat | PV, `pool` et reliques traversent. **La Main ne traverse pas** : Main vide, `pool` complet remélangé à chaque combat | Reporter les dés conservés d'un combat au suivant | Reporter oblige à se souvenir d'une décision prise avant un écran de récompense et parfois 3 jours d'interruption, et transforme le dernier tour de chaque combat en tour d'optimisation. Un `pool` non remélangé serait en plus un état invisible entre deux écrans (esprit d'I5) |
| D30 | Dépense de secours | Tout dé peut, à la place de son action, être dépensé pour un pas d'une case. **La dépense à vide reste interdite** | Autoriser la dépense sans cible ; ne rien autoriser | Étend la garantie de D18 quand le pas gratuit est déjà consommé. La dépense à vide permettrait à un build à déclenchements d'ignorer la grille : la couche tactique disparaîtrait. Une relique peut accorder cette permission (tiers « explosif ») |
| D31 | Poussée bloquée ou hors grille | La poussée échoue, l'unité ne bouge pas et subit **1 dégât de choc** | Éjection mortelle façon *Into the Breach* | Dans un système sans valeurs sur les dés, l'éjection serait la mécanique la plus forte du jeu : les bords deviendraient la seule chose qui compte |
| D32 | Portée de la Frappe | Distance 1 **ou 2** en ligne orthogonale dégagée, 2 dégâts dans les deux cas | Mêlée pure (portée 1) | À portée 1, le joueur passe la moitié de ses tours à marcher, ce qui contredit D10 et ajoute ~1 tour par combat, soit 1 min 36 par run. C'est la règle qui finance le budget de temps du tour |
| D33 | Plafond de combat | 30 tours ; au-delà, combat perdu | Aucun plafond | Garantie de terminaison pour la CI, pas une règle de jeu : la rencontre la plus longue fait 11 tours |

---

## Partie 2 — Ouvert, par priorité

### P0 — Bloque le jalon M2 (le premier combat)

Tous les points P0 sont tranchés : A1 à A5 par D10-D14, le modèle du dé par D17-D22.
Le jalon M2 n'est plus bloqué par une question de design.

### P1 — Bloque le vertical slice (M3)

A6, A7, A8, A9 et A20 sont tranchés (D23 à D27), voir `docs/design/combat.md` et
`docs/design/run.md`.

**A10. Le format de données d'un effet de relique.** Décision technique à forte conséquence
de design : plus le format est expressif, plus les reliques sont créatives, mais moins le
simulateur peut raisonner dessus. À trancher entre M1 et M3, avec `item-designer` dans la
boucle. La liste des événements que le moteur émet est désormais figée
(`docs/design/combat.md` § 10.9) : c'est le seul jeu de crochets auxquels ce format peut
s'accrocher.

**A24. Les valeurs de survie.** PV max de départ (40), soin du Repos (+10), courbe de dégâts
par tour du joueur. Posées comme hypothèses de travail dans `docs/design/run.md` § 5, elles
appartiennent à `progression-designer` et doivent être validées par simulation avant M4.

### P2 — Avant le contenu de masse (M4)

**A11.** Les reliques signatures des personnages sont-elles trouvables par les autres
personnages ? (recommandation : oui pour les reliques, non pour les règles propres)
**A12.** Économie de la run : *tranché en partie par D24 — une seule monnaie*. Reste
ouvert : les prix de la boutique et le montant rendu par un refus (`item-designer`).
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
gaucher. **A25.** Télémétrie d'équilibrage et son cadre RGPD/ATT.

---

## Journal des décisions

| Date | Décision | Contexte |
|---|---|---|
| 2026-08-23 | D1 à D9 | Session de cadrage initiale |
| 2026-08-23 | D10 à D16 | Arbitrage des P0 : grille, main, report, valeurs, santé, difficulté, identité des personnages |
| 2026-08-29 | D17 à D22 | Modèle du dé, déplacement, structure du tour, relances. D12 précisée : la conservation est un choix |
| 2026-08-29 | D23 à D33 | Session `game-designer` : règles de combat et structure de run. Crée `docs/design/combat.md` et `docs/design/run.md`. Tranche A6, A7, A8, A9, A20 et la moitié d'A12. L'ancien A20 de la partie P3 (télémétrie) est renuméroté A25 pour lever le doublon |
