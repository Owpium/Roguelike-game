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
| D18 | ~~Déplacement de base~~ **révoquée par D44** | ~~Un pas gratuit par tour~~ ; le déplacement ambitieux passe par la face Élan | Tout déplacement payé en dés | Aucun tirage ne peut bloquer le joueur, et on ne dépense pas une décision à avancer d'une case |
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
| D34 | Définition de la puissance | **`P` = `DPT` + 0,5 × `RPT`**, mesurée sur un banc d'essai fixe (`docs/design/progression.md` § 1) | Puissance = `DPT` seul ; indice composite à cinq termes | Sans grandeur calculable, « la puissance doit tripler » n'est pas vérifiable et aucune courbe n'est falsifiable. `DPT` seul rendrait invisible tout le catalogue défensif. Le facteur 0,5 est un paramètre à recalibrer par régression |
| D35 | Courbe de puissance | Contrat en **ratio** : `P`(boss 3) ÷ `P`(1ᵉʳ tour) ∈ [2,8 ; 3,2], build médian. Budget par acquisition : +7 % commune, +10 % peu commune, +14 % rare, +4 % Forge | Courbe en valeurs absolues par rencontre | Un ratio reste valable quel que soit le personnage joué, donc comparable entre les quatre. L'accélération est structurelle (les facteurs `N_off`, `d̄`, `T_decl` se multiplient), pas obtenue par des reliques tardives plus grosses |
| D36 | **A24 — valeurs de survie** | PV max **40, constant** toute la run (plafond absolu 50 via relique). **Soin = 12 PV (30 % du max)**, au Repos **et** à la victoire des boss 1 et 2. Table complète des PV ennemis, pression et dégâts entrants dans `progression.md` § 3.3 | Repos +10 / boss +5 (hypothèses de `run.md`) ; PV max croissant 40/50/60 | +10 et +5 ne permettent pas de remonter la marge de survie au-dessus de 2,0 après le boss 2 : le minimum se déplace mécaniquement sur le boss 3, ce qui viole le contrat de `run.md` § 5.4. Un PV max croissant rend la marge incomparable d'un acte à l'autre et ajoute une deuxième courbe de progression à côté du pool (contre le pilier 1) |
| D37 | Marge de survie | `M(rang)` = PV à l'entrée du rang ÷ dégâts entrants du **nœud le plus dur de ce rang** | Mesure sur le nœud effectivement choisi | Mesurée sur le nœud choisi, prendre le Repos rendrait `M` infinie et effacerait le moment le plus tendu de la run. Mesurée sur le pire nœud, `M` est une propriété de l'état, comparable entre deux runs aux chemins différents — condition pour en tirer une statistique. Minimum obtenu : **2,27 en acte 2 rang 2** |
| D38 | Forge | Catalogue de 7 opérations, disponible en entier dès la run 1. Pool : **3 dés minimum, 10 maximum** | Débloquer les opérations une à une | Une opération débloquée est une puissance débloquée (D3). Sous 3 dés le tirage cesse d'être une décision ; au-dessus de 10 le joueur ne tient plus la composition en tête et I5 devient une fiction |
| D39 | Les 4 personnages | `SOCLE` (aucune torsion), `RELANCE` (tirage), `GRAVURE` (faces), `LES-TROIS` (composition du pool). Le personnage de départ **n'a pas de règle propre** ; sa relique signature s'accroche à **Paire** | Donner une règle propre au personnage de départ | Au premier tour d'une première run, le joueur découvre déjà six systèmes ; un septième est du bruit. Paire est le seul combo qui se produit tout seul (5/6 sur trois dés dépensés) : il enseigne les combos sans écran de tutoriel. Récompense **défensive**, pour ne pas fausser le mètre étalon « deux Frappes tuent un Rôdeur » |
| D40 | **A11 — reliques signatures** | Une relique signature entre au **catalogue commun** dès que son personnage est débloqué. Une **règle propre n'est jamais partagée** | Signatures exclusives ; règles propres accordables par relique | Une signature relue par un autre personnage est une synergie inattendue gratuite à produire, et débloquer un personnage enrichit alors aussi les trois autres. Une règle propre partagée détruit l'identité : un `SOCLE` qui relance rend `RELANCE` inutile. Garde-fou : aucune relique n'accorde de relance inconditionnelle |
| D41 | Méta-progression | 20 objectifs, 4 paliers. Ordre des personnages = **parcours d'apprentissage** (subir le tirage → le corriger → transformer → choisir). Plafond de **6 runs** par déblocage majeur ; **≥ 0,8 déblocage par run** sur les runs 1-10 | Déblocages rares et gros ; déblocage par accumulation | Le mur de grind ne naît pas de la distance mais du silence. La fin de liste est nombreuse et petite. Tout déblocage majeur a une porte de secours fondée sur la progression, jamais sur la répétition |
| D42 | Vérification de D3 | **Contrat maître** : le taux de victoire de `SOCLE` avec le catalogue complet ne dépasse pas de plus de **3 points** son taux avec le catalogue de départ | Se fier à l'intention « contenu, pas puissance » | Ajouter une relique au catalogue ressemble à ajouter de la puissance, et parfois c'en est. Sans mesure, D3 est une déclaration. La liste noire des choses qui ne se débloquent jamais est dans `docs/design/meta.md` § 1 |
| D43 | Chemins de référence | Les stratégies de référence sont **prudent** et **référence** (2 ou 3 Repos). « Tout combattre sans jamais se reposer » est un **pari** à 10-20 % de réussite, pas une stratégie | Les deux extrêmes finissent la run 35-65 % du temps (`run.md` § 6) | Sur 12 rencontres sans Repos, le déficit est de 24 PV de soin contre un gain de puissance d'environ +25 % : le calcul ne se referme pas. Cohérent avec `run.md` § 5.3, qui annonce déjà la mort du chemin gourmand en acte 2 |
| D44 | Pas gratuit | **Supprimé.** Tout déplacement se paie : dépense de secours (D30) ou Élan | Pas gratuit conditionnel ; un pas tous les deux tours ; statu quo compensé par les dégâts | La garantie anti-blocage de D18 est intégralement fournie par D30 ; le pas gratuit ne conservait qu'une action gratuite par tour, utilisée ~100 % des tours et jamais arbitrée. Le conditionnel ferait dépendre la légalité d'une entrée de l'ordre des entrées, donc de l'annulation LIFO |
| D45 | Le pas gratuit comme relique | Permission de tier **explosif**, plafonnée à 1 pas/tour, non cumulable, **publiable seulement une fois D46 en place** | Règle propre de personnage | Sans motifs à plusieurs cases, « un pas gratuit » est une relique d'invulnérabilité (mesure du 2026-08-31). D16 réserve aux personnages la torsion des dés, pas de la grille |
| D46 | Motifs d'attaque | Grammaire fermée à 3 formes dérivées de l'axe ennemi → cible : `single`, `lunge` (2 cases), `line3` (3 cases) | Motif en croix (5 cases) ; motifs libres par ennemi ; intentions en réaction au déplacement | Avec des motifs d'une case tous ancrés sur la case du joueur, le nombre de cases menacées vaut 1 quel que soit le nombre d'ennemis : l'esquive ne peut pas échouer. La croix supprime l'esquive au lieu de la conditionner ; la réaction demanderait un 6ᵉ `kind` et casserait la frise de rejeu |
| D47 | Cerveau de mêlée | `charge` (déplacement **puis** attaque) par défaut **à partir de l'acte 2** | `charge` dès l'acte 1 ; conserver l'asymétrie | Corrige l'asymétrie ressentie et supprime le tour perdu de réengagement (−0,4 tour/combat), ce qui paie la facture en temps de D44. N'est pas un correctif de l'esquive : une `charge` reste télégraphiée sur une case et reste esquivable d'un pas |
| D48 | Clôture de l'arbitrage de l'esquive | Le paquet D44-D47 est **adopté sur la seule preuve solide de la campagne — la géométrie** (`contact` 24,9 % → 42,3 %). La question des dégâts subis est **reportée au gate M2**, où le ressenti d'une partie jouée à la main tranchera | Relancer une campagne après correction du barème d'IA | Le barème neutre exigé par le protocole a un biais défensif : il compare 1 PV évité à 1 PV infligé sans créditer une Frappe non létale de rapprocher d'un mort. Aucune colonne de dégâts n'est donc comparable entre variantes. Trois combats joués à la main en diront plus qu'une IA gloutonne à une profondeur |

---

## Partie 2 — Ouvert, par priorité

### P0 — Bloque le jalon M2 (le premier combat)

Tous les points P0 sont tranchés : A1 à A5 par D10-D14, le modèle du dé par D17-D22.
Le jalon M2 n'est plus bloqué par une question de design.

### P1 — Bloque le vertical slice (M3)

A6, A7, A8, A9 et A20 sont tranchés (D23 à D27), voir `docs/design/combat.md` et
`docs/design/run.md`.

**A26. Le terme manquant du barème d'IA.** La politique de simulation doit créditer une
Frappe non létale d'une fraction de la menace future qu'elle finira par annuler, sinon la
défense gagne toujours et aucune variante n'est comparable sur les dégâts. Exigences : le
barème reste exprimé en points de vie, et reste identique d'une variante à l'autre.
Périmètre : `balance-simulator`. Nécessaire avant toute mesure d'équilibrage de M4, pas avant
le gate M2 (D48).

**A10. Le format de données d'un effet de relique.** Décision technique à forte conséquence
de design : plus le format est expressif, plus les reliques sont créatives, mais moins le
simulateur peut raisonner dessus. À trancher entre M1 et M3, avec `item-designer` dans la
boucle. La liste des événements que le moteur émet est désormais figée
(`docs/design/combat.md` § 10.9) : c'est le seul jeu de crochets auxquels ce format peut
s'accrocher.

A24 est tranché (D34 à D37, D43), voir `docs/design/progression.md`. Restent à **mesurer**
avant M4, pas à trancher : le facteur 0,5 de la définition de `P`, le taux d'encaissement `τ`
par rencontre, et la position réelle du minimum de marge de survie.

### P2 — Avant le contenu de masse (M4)

A11 est tranché (D40) et A14 l'est en partie (D39, D41 : 4 personnages entre 35 % et 65 %
de victoires ; le nombre d'archétypes de build reste à `item-designer`).
**A12.** Économie de la run : *tranché en partie par D24 — une seule monnaie*. Reste
ouvert : les prix de la boutique et le montant rendu par un refus (`item-designer`).
**A13.** Sous-thèmes des 3 biomes, et ce qu'ils changent mécaniquement (pas seulement la
couleur). *Précision apportée par `docs/design/meta.md` § 1 : aucun biome n'est déblocable en
v1 — trois biomes pour trois actes, en verrouiller un verrouillerait un tiers de la run. Ce
qui se débloque dans un biome, ce sont ses ennemis et ses rencontres. Un 4ᵉ biome
redeviendrait un déblocage.*
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
| 2026-08-31 | D23 à D33 | Règles de combat complètes et structure de run |
| 2026-08-31 | D34 à D43 | Progression, méta-progression, valeurs de survie, les 4 personnages |
| 2026-08-31 | D44 à D47 | Arbitrage de l'esquive gratuite. **D18 est révoquée par D44** : le pas gratuit disparaît des règles de base et devient une permission de relique |
| 2026-08-31 | D48 | Clôture : le paquet est adopté sur la géométrie, la question des dégâts passe au gate M2. Les règles arbitrées deviennent les règles par défaut du moteur |
| 2026-08-29 | D23 à D33 | Session `game-designer` : règles de combat et structure de run. Crée `docs/design/combat.md` et `docs/design/run.md`. Tranche A6, A7, A8, A9, A20 et la moitié d'A12. L'ancien A20 de la partie P3 (télémétrie) est renuméroté A25 pour lever le doublon |
| 2026-08-31 | D34 à D43 | Session `progression-designer` : puissance, survie, personnages, méta. Crée `docs/design/progression.md`, `docs/design/personnages.md` et `docs/design/meta.md`. Tranche **A24** et **A11**, et une partie d'A14. Corrige les budgets de PV ennemis et de dégâts entrants de `run.md` § 5.2 (le tour d'approche n'y était pas retiré ; l'acte 3 était trop élevé d'environ 40 %) et le soin du Repos, porté de +10 à +12. Signale une contradiction dans `run.md` § 6, tranchée par D43 |
