# Arbitrage — l'esquive gratuite et totale

> Agent responsable : `game-designer`. Statut : **arbitrage rendu, mesure à faire**.
> Répond à `docs/design/rapports/2026-08-31-esquive-gratuite.md`.
> Modifie `docs/design/combat.md` (§ 2.1, 3, 5.5, 6, 8, 9, 10.5, 11.1, 14, 15).
> Ne touche pas à D21 ni D28, qui ne sont pas rouvertes.
> Décisions à consigner par le propriétaire dans `docs/06-arbitrages.md` : **D44 à D47**, lignes
> prêtes à coller en § 6. (Numérotation choisie après coup : `progression-designer` a pris
> D34-D43 dans la même session. Si le propriétaire consolide dans un autre ordre, seuls ces
> quatre numéros sont à réécrire, ici et dans `combat.md`.)

---

## 1. Vérification du raisonnement sur D18 et D30

**Le raisonnement du propriétaire est juste.** Je le confirme sans réserve, et je le durcis.

D18 promet deux choses distinctes, qui ont toujours été présentées comme une seule :

| Ce que D18 promet | Qui le fournit réellement |
|---|---|
| (a) *Aucun tirage ne peut bloquer le joueur* | **D30, la dépense de secours**, entièrement |
| (b) *On ne dépense pas une décision à avancer d'une case* | D18 seule — et c'est une action gratuite par tour |

Preuve de (a) : la Main est complétée à 3 dés à chaque tour (D11) et le `pool` se recycle depuis
le `discard` quand il est vide, donc **la Main n'est jamais vide en phase de choix**. D30 permet
de convertir n'importe quel dé, quelle que soit sa face, en un pas d'une case. Une main de trois
Frappes face à une intention peut donc produire jusqu'à trois pas. La garantie anti-blocage est
intégralement couverte, sans le pas gratuit.

Il reste un cas limite, et il n'est pas couvert par D18 non plus : un joueur **encerclé** (quatre
voisines occupées ou hors grille) ne peut pas faire de pas, gratuit ou payé. Le vrai filet
universel n'a jamais été le pas gratuit, c'est que **Garde est toujours légale** — il n'existe
aucun état où le joueur n'a aucune action légale. Je l'écris explicitement dans `combat.md` § 5.5,
parce que c'était une propriété tacite du système et qu'une propriété tacite se perd.

Correction de vocabulaire à porter au registre : D30 est aujourd'hui rédigée comme « étend la
garantie de D18 ». C'est l'inverse. **D30 contient la garantie de D18 ; D18 ne conserve, en
propre, qu'une action gratuite par tour.** Une règle qui ne conserve en propre qu'un cadeau doit
justifier le cadeau, pas la garantie.

---

## 2. Le point de géométrie, qui commande tout le reste

Je démonte une partie de l'analyse fournie. **La piste 1 ne corrige pas la cause. Elle corrige la
moitié gratuite de la cause.**

Fait mesurable, vérifiable à la main sur `intents.ts` :

> Toutes les intentions `attack` de l'acte 1 ancrent leur motif sur **la case occupée par le
> joueur au moment du télégraphe**, et ce motif fait **une case**. Donc, quel que soit le nombre
> d'ennemis qui télégraphient une attaque ce tour-ci, **le nombre de cases menacées est
> exactement 1**.

Conséquences, dans l'ordre :

1. **Le nombre d'ennemis n'a aucun effet sur la difficulté de l'esquive.** Trois ennemis visent
   la même case qu'un seul. Ajouter des corps augmente les dégâts potentiels et n'augmente pas
   d'un iota la probabilité qu'ils touchent. C'est pour ça qu'aucun réglage ne corrige le
   problème, et le rapport a raison de le dire.
2. **Un unique pas, dans n'importe laquelle des directions libres, échappe à tout.** Le joueur n'a
   même pas à choisir la direction : il n'y a pas de mauvaise esquive.
3. **Rendre le pas payant rend l'immunité coûteuse ; elle reste une immunité.** Et le coût est
   plus faible qu'il n'y paraît : la dépense de secours conserve la face du dé pour les combos, et
   le joueur paiera l'esquive avec son plus mauvais dé du tour. Sur une main de 3, la probabilité
   de n'avoir que des Frappes est de 1/8 ; **7 fois sur 8, l'esquive se paie avec une Garde ou un
   Élan dont la valeur, sur un tour où l'on esquive, est proche de zéro.**
4. Symétriquement, **la piste 3 seule est inerte sur les dégâts**. Une `charge` télégraphie une
   case d'arrivée puis une case visée : c'est toujours une case, toujours esquivable d'un pas,
   toujours gratuitement. L'analyse du propriétaire est exacte sur ce point.

Donc : le pas gratuit explique pourquoi l'immunité est **gratuite** ; la géométrie du motif
explique pourquoi c'est une **immunité**. Ce sont deux défauts distincts, ils demandent deux
correctifs, et aucun des deux ne rend l'autre superflu.

C'est la seule chose sur laquelle je contredis l'analyse reçue, et c'est le cœur de l'arbitrage.

---

## 3. L'arbitrage

### D44 — Le pas gratuit est supprimé. **Retenue (piste 1).**

Tout déplacement se paie : dépense de secours (1 dé, 1 case, D30) ou Élan (1 dé, 2-3 cases,
traversée). Le pas gratuit disparaît du jeu de base.

**Pourquoi.** Une action disponible à chaque tour, sans coût, sans condition et toujours utile
n'est pas une décision : c'est une constante. Le tableau du § 14 de `combat.md` lui attribuait
« utilisé environ 60 % des tours » ; la mesure montre que sous jeu compétent c'est ~100 %. Une
règle utilisée systématiquement et jamais arbitrée ne mérite pas 0,6 s du budget de tour. En la
supprimant, la position devient une **monnaie** au même titre que les dégâts et le Bouclier, et
la grille redevient un problème.

**Alternatives écartées.**

- *Le pas gratuit conditionnel* (« indisponible le tour où tu frappes »), proposé par le rapport.
  Écartée : la légalité d'une entrée dépendrait alors des entrées déjà posées, donc de leur
  ordre ; l'annulation LIFO (§ 3 de `combat.md`) réactiverait et désactiverait le pas au fil des
  annulations, et le joueur devrait planifier son pas *avant* de savoir s'il frappera. C'est une
  règle qu'on ne peut pas afficher en une icône : « pourquoi ce pas est-il grisé ? » n'a pas de
  réponse courte.
- *Un pas gratuit tous les deux tours.* Écartée : ajoute un compteur persistant à l'écran pour
  n'atténuer le problème que de moitié.
- *Ne rien changer et compenser par les dégâts.* Écartée par le rapport, à raison : un taux de
  toucher nul ne se corrige pas par un multiplicateur.

### D45 — Le pas gratuit devient une permission de relique, tier explosif. **Retenue (piste 2), sous condition.**

Le texte de la permission, à reprendre tel quel par `item-designer` :

> **Pas gratuit.** Une fois par tour, déplace-toi d'une case orthogonale libre sans dépenser de
> dé. Ce déplacement ne compte pour aucun combo et n'émet pas `DIE_SPENT`.

Contraintes que j'impose à la relique qui la portera :

- **Tier explosif** (`docs/03-content-budget.md`) : elle casse une règle de base, elle est rare,
  elle est sous surveillance permanente du simulateur.
- **Non cumulable au-delà de 1 pas par tour.** Deux exemplaires, ou cette relique plus une
  relique de mobilité, ne donnent jamais 2 pas gratuits. Sans ce plafond, on reconstruit
  l'immunité de la mesure et on la rend permanente pour le reste de la run.
- **Condition de publication : elle n'entre au catalogue qu'une fois D46 en place.** Sans motifs
  à plusieurs cases, « un pas gratuit par tour » n'est pas une relique puissante, c'est une
  relique d'invulnérabilité — la mesure des 200 runs en est la démonstration. C'est le point le
  plus important de cette section : **la piste 2 est mécaniquement conditionnée par les motifs.**

**Alternative écartée** : en faire une *règle propre* de personnage. D16 dit que les personnages
tordent les dés, pas la grille ; et un personnage dont l'identité est « je ne prends pas de
dégâts » est inéquilibrable par construction — on ne peut pas le rendre plus faible ailleurs sans
le rendre injouable.

### D46 — Grammaire des motifs d'attaque : `single`, `lunge`, `line3`. **Retenue.**

C'est le correctif de la cause géométrique. Trois formes, liste fermée en v1, chacune dérivée
**au moment du télégraphe** de l'axe ennemi → case visée.

Soit `a` l'offset de l'ennemi vers la case visée, et `d` le vecteur unitaire orthogonal de cet
axe (défini seulement si l'ennemi et la case visée sont alignés) :

| Forme | Cases (offsets relatifs à l'ancre) | Esquives possibles | Lecture |
|---|---|---|---|
| `single` | `[a]` | les 4 voisines | 1 case surlignée |
| `lunge` | `[a, a+d]` | les 2 voisines perpendiculaires (la 3ᵉ est l'ennemi) | 2 cases, contiguës |
| `line3` | `[a−d, a, a+d]` | les 2 voisines perpendiculaires | 3 cases alignées |

Si l'ennemi et la case visée ne sont pas alignés, `d` n'existe pas et la forme retombe sur
`single`. Aucun appel au RNG, fonction pure de l'état : I1 tient. Les cases hors grille sont
affichées écrêtées et ignorées à la résolution.

**Ce que ça change réellement.** Deux ennemis dont les axes sont perpendiculaires couvrent
désormais 4 cases distinctes. Sur les 4 voisines du joueur, 2 sont occupées par les ennemis et 2
sont menacées : **il n'y a plus d'esquive d'une case.** Le joueur doit alors se garder, tuer, ou
sortir à l'Élan. C'est la première fois que le jeu produit une tenaille, et elle naît du
**placement écrit à la main**, qui redevient un levier de design au lieu d'un décor.

Effet de bord voulu : l'Élan (2-3 cases, traversée) devient la sortie de secours des tenailles.
Sa fréquence de 1/6 et son statut d'« événement » (§ 5 de `combat.md`) s'en trouvent renforcés.

**Alternatives écartées.**

- *Le motif en croix (5 cases : la case visée et ses 4 voisines).* Écartée : aucune esquive d'une
  case n'y échappe jamais, donc le pas cesse d'être une réponse et Garde devient l'unique
  réponse. On remplacerait un automatisme par un autre, et on perdrait la ligne de `combat.md`
  § 8.2 : « esquiver est la défense principale du jeu ».
- *Des motifs libres, écrits case par case par ennemi.* Écartée : ingérable pour la lecture
  (chaque ennemi devient une forme à mémoriser) et incompatible avec un champ statique, puisque
  les formes utiles dépendent de la direction. Trois formes nommées suffisent pour 18 ennemis.
- *Les intentions en réaction au déplacement* (piste du rapport). Écartée : il faudrait un 6ᵉ
  `kind`, une seconde fenêtre de résolution, et le rejeu du tour (`lastTurnLog`, bouton *Revoir*)
  cesserait d'être une frise linéaire. Coût structurel élevé pour un problème que la géométrie
  résout à coût nul.

### D47 — `charge` devient le cerveau de mêlée par défaut à partir de l'acte 2. **Retenue (piste 3), reclassée.**

Adoptée, mais **pas comme correctif de l'esquive** — elle n'en est pas un (§ 2, point 4). Elle est
adoptée pour deux raisons qui lui sont propres :

1. **Elle supprime l'asymétrie ressentie**, qui est un vrai défaut : le joueur se déplace *et*
   agit, l'ennemi fait l'un ou l'autre. Sur un télégraphe, cette asymétrie se lit comme de la
   bêtise, pas comme de la clémence.
2. **Elle paie la facture en temps de D44.** Aujourd'hui, un ennemi qui a frappé dans le vide se
   retrouve à distance 2 et gâche un tour à marcher ; le joueur gâche le sien à attendre. La
   boucle « attaque manquée → déplacement → attaque manquée » du rapport coûte des tours aux deux
   camps. Avec `charge`, l'ennemi se réengage dans le même tour. Estimation : **−0,4 tour par
   combat** sur les actes 2 et 3, ce qui compense presque exactement le coût de D44 (§ 4).

**Pas en acte 1.** `run.md` § 5.6 place `charge` en acte 2, et la règle de production « une
rencontre n'introduit jamais deux nouveautés à la fois » tient. Les trois ennemis de départ
gardent leur cerveau actuel : leur travail est d'enseigner une chose chacun, pas de faire mal.

**Alternative écartée** : `charge` dès l'acte 1. Elle rendrait les trois premières minutes du jeu
illisibles (deux cases d'arrivée à suivre par ennemi dès la première rencontre) et n'apporterait
aucun dégât supplémentaire, puisqu'elle ne casse pas l'esquive.

### Lignes prêtes à coller dans `docs/06-arbitrages.md` (partie 1)

| # | Décision | Retenu | Alternative écartée | Raison |
|---|---|---|---|---|
| D44 | Pas gratuit | **Supprimé.** Tout déplacement se paie : dépense de secours (D30) ou Élan | Pas gratuit conditionnel ; un pas tous les deux tours ; statu quo compensé par les dégâts | La garantie anti-blocage de D18 est intégralement fournie par D30 ; le pas gratuit ne conservait qu'une action gratuite par tour, utilisée ~100 % des tours et jamais arbitrée. Le conditionnel ferait dépendre la légalité d'une entrée de l'ordre des entrées, donc de l'annulation LIFO |
| D45 | Le pas gratuit comme relique | Permission de tier **explosif**, plafonnée à 1 pas/tour, non cumulable, **publiable seulement une fois D46 en place** | Règle propre de personnage | Sans motifs à plusieurs cases, « un pas gratuit » est une relique d'invulnérabilité (mesure du 2026-08-31). D16 réserve aux personnages la torsion des dés, pas de la grille |
| D46 | Motifs d'attaque | Grammaire fermée à 3 formes dérivées de l'axe ennemi → cible : `single`, `lunge` (2 cases), `line3` (3 cases) | Motif en croix (5 cases) ; motifs libres par ennemi ; intentions en réaction au déplacement | Avec des motifs d'une case tous ancrés sur la case du joueur, le nombre de cases menacées vaut 1 quel que soit le nombre d'ennemis : l'esquive ne peut pas échouer. La croix supprime l'esquive au lieu de la conditionner ; la réaction demanderait un 6ᵉ `kind` et casserait la frise de rejeu |
| D47 | Cerveau de mêlée | `charge` (déplacement **puis** attaque) par défaut **à partir de l'acte 2** | `charge` dès l'acte 1 ; conserver l'asymétrie | Corrige l'asymétrie ressentie et supprime le tour perdu de réengagement (−0,4 tour/combat), ce qui paie la facture en temps de D44. N'est pas un correctif de l'esquive : une `charge` reste télégraphiée sur une case et reste esquivable d'un pas |

---

## 4. Conséquences sur le budget de temps

### 4.1 Budget de tour

| Phase | Aujourd'hui | Après D44 + D46 | Détail |
|---|---|---|---|
| 0 — Début de tour | 0,0 s | 0,0 s | |
| 1 — Tirage | 0,5 s | 0,5 s | |
| 2 — Lecture | 1,5 s | **1,7 s** | +0,2 s : 2 ou 3 cases surlignées au lieu d'1, sur ~70 % des tours |
| 3 — Choix : 3 dépenses | 3,3 s | 3,3 s | inchangé : un pas payé est un drag comme un autre |
| 3 — Choix : pas gratuit | 0,6 s | **0,0 s** | supprimé |
| 3 — Choix : conservation | 0,3 s | 0,3 s | |
| 4 — Validation | 0,3 s | 0,3 s | |
| 5 — Résolution | 1,5 s | 1,5 s | plafond dur 2,0 s inchangé |
| **Total** | **8,0 s** | **7,6 s** | |

**7,6 s contre un contrat de 8,0 s : 0,4 s de marge.** C'est la première marge que `combat.md` ait
jamais eue. Elle ne doit être dépensée par personne : c'est la réserve qui absorbe les
dépassements de résolution.

### 4.2 Tours par combat — ma prédiction

Point de départ : la mesure donne 6,6 tours par rencontre, tous types confondus. Sur 12
rencontres dont 3 boss visés à 8-10 tours (`run.md` § 5.2), cela implique **~5,5 tours pour un
combat normal**. Le contrat est 4-6 : on est dedans, avec ~0,5 tour de marge.

| Effet | Δ tours / combat normal | Raisonnement |
|---|---|---|
| D44 (pas gratuit supprimé) | **+0,4** | Le joueur convertit un dé en pas sur ~50 % des tours menacés. 7 fois sur 8, ce dé est une Garde ou un Élan de faible valeur : la perte de DPT est de ~10 %, pas de 33 % |
| D46 (motifs) | **+0,2** | Les tenailles obligent à dépenser une Garde au lieu d'une Frappe, et les dégâts encaissés n'accélèrent rien |
| D47 (`charge`, actes 2-3) | **−0,4** | Plus de tour perdu au réengagement, des deux côtés |
| **Net acte 1** (sans D47) | **+0,6** | 5,5 → **6,1 tours** |
| **Net actes 2-3** | **+0,2** | 5,5 → **5,7 tours** |

Traduction en durée : acte 1, 6,1 × 7,6 = **46 s** (contre 44 s aujourd'hui, contrat 40 s) ;
actes 2-3, 5,7 × 7,6 = **43 s**. On reste sous le seuil d'alerte de +20 % de
`docs/01-boucle-et-pacing.md`, mais l'acte 1 est le point tendu.

Sur une run entière : −0,6 s × ~72 tours = **−43 s** rendus par D44, +9 s de lecture, +0,2 tour ×
12 rencontres × 7,6 s = +18 s, −0,4 tour × 8 rencontres × 7,6 s = −24 s. **Net : environ −40 s
par run.** Le paquet est légèrement favorable au budget, ce qui est contre-intuitif et mérite
d'être vérifié plutôt que cru.

**Si la mesure dit que les combats normaux passent au-dessus de 6,5 tours**, le correctif n'est
pas de rendre le pas gratuit : c'est de baisser de 10 à 15 % les budgets de PV ennemis de
`run.md` § 5.2 — désormais repris et affiné par `progression-designer` (D36, table des valeurs de
survie) —, qui sont marqués **[T]**. Je le note ici pour que ce réflexe soit écrit avant que
la mesure ne tombe.

---

## 5. Protocole de mesure

C'est la partie qui compte. Une variante non mesurable n'en est pas une, et une prédiction fausse
est une information — les prédictions ci-dessous sont miennes et engagent l'arbitrage.

### 5.1 L'interrupteur

Le `RuleSet` de `packages/core/src/rules.ts` porte déjà `freeStepsPerTurn`. Trois champs à
ajouter, tous purs, aucun appel au RNG (I1) :

```ts
// dans RuleSet
/** D44. 1 = règle historique, 0 = tout déplacement se paie. Cible : 0. */
freeStepsPerTurn: number;

/** D46. Force la forme de tous les motifs d'attaque, quelle que soit celle du type
 *  d'ennemi. `null` = chaque type utilise sa propre forme. Levier de contrôle. */
attackShapeOverride: "single" | "lunge" | "line3" | null;

/** D47. Cerveau des types `melee`. "approach" = se déplacer OU attaquer (historique),
 *  "charge" = se déplacer PUIS attaquer dans le même tour. */
meleeBrain: "approach" | "charge";
```

Et un champ sur `EnemyType` :

```ts
/** D46. Défaut "single" : les types existants ne changent pas de comportement. */
shape: "single" | "lunge" | "line3";
```

**Point d'implémentation à ne pas rater.** `EnemyType.pattern` (liste d'offsets statiques) ne peut
pas exprimer `lunge` ni `line3`, qui dépendent de l'axe ennemi → cible. La forme est donc
**résolue au télégraphe**, dans `attackIntent()` de `intents.ts`, et le résultat est stocké dans
`intent.pattern` comme aujourd'hui. Rien d'autre ne change : D28 continue de s'appliquer
inchangée, l'ancre suit l'unité, les cases se recalculent en direct.

**Deuxième point à ne pas rater — la résolution d'une `charge`.** Le motif d'une `charge` est
stocké **relativement à la case d'arrivée**, et l'attaque s'ancre sur `unit.cell` *après* le
déplacement. Si la case d'arrivée est devenue occupée (le joueur s'y est mis), le déplacement
s'arrête comme un `move` ordinaire et **l'attaque tombe une case trop court**, parce que l'ancre
n'a pas bougé. Ce n'est pas un cas particulier à coder : c'est D28 qui s'applique. Et c'est une
tactique offerte au joueur — bloquer une charge avec un corps la fait manquer.

### 5.2 Les métriques, définies sur le journal d'événements

| Métrique | Définition exacte |
|---|---|
| `contact` | `count(DAMAGE_DEALT, targetId = "player", sourceId ≠ null)` ÷ `count(INTENT_RESOLVED)` dont l'intention résolue était `attack` ou `charge`. Le Bouclier n'annule pas un contact : on mesure la géométrie, pas la mitigation |
| `pv/renc` | PV perdus par rencontre, Bouclier déduit (`hpMax − hp` sur la rencontre) |
| `tours/renc` | Tours de joueur par rencontre, boss séparés des combats normaux |
| `runs0` | Part des runs terminées avec `hp == hpMax` **et** sans aucun `DAMAGE_DEALT` non absorbé |
| `secours` | Part des `DIE_SPENT` dont `actionKind === "step"` |
| `victoire` | **Non décisionnel dans cette mesure** : les actes 2 et 3 sont des remplisseurs |

Protocole : **≥ 2 000 seeds par variante**, mêmes seeds pour toutes les variantes (comparaison
appariée), contenu réel de l'acte 1, remplisseurs identiques ailleurs.

### 5.3 Les six variantes

| Var. | `freeStepsPerTurn` | `shape` du roster | `meleeBrain` | Ce qu'elle isole |
|---|---|---|---|---|
| **R** | 1 | tout `single` | `approach` | Référence, reproduit la mesure du 2026-08-31 |
| **A** | **0** | tout `single` | `approach` | Piste 1 seule |
| **C** | 1 | tout `single` | **`charge`** | Piste 3 seule |
| **D** | 1 | roster D46 | `approach` | Motifs seuls |
| **E** | **0** | roster D46 | `approach` | **Paquet recommandé, acte 1** |
| **F** | **0** | roster D46 | **`charge`** | **Paquet recommandé, actes 2-3** |

Roster D46 : Rôdeur `single`, Guetteur `line3`, Bélier `lunge` (justification en § 6).

La piste 2 (D45) n'est pas une variante mécanique séparée : c'est E pour les runs qui n'ont pas la
relique, et R pour celles qui l'ont. Elle se mesurera avec les reliques, pas ici. Ce que cette
campagne doit lui fournir, c'est l'écart R↔E : **c'est la puissance exacte de la relique.**

### 5.4 Mes prédictions

Valeurs pour l'acte 1, contenu réel, IA gloutonne à une profondeur (voir la réserve du § 5.5).
Chaque case est un intervalle ; le milieu est mon estimation ponctuelle.

| Var. | `contact` | `pv/renc` (A1) | `tours/renc` (normaux) | `runs0` | `secours` |
|---|---|---|---|---|---|
| **R** *(déjà mesuré)* | ~1 % | 0,0 | 5,5 | **98,5 %** | ~2 % |
| **A** | 4-9 % | 0,3-0,8 | 5,8-6,4 | **35-60 %** | 15-22 % |
| **C** | 0-3 % | 0,0-0,2 | 5,0-5,6 | **88-98 %** | ~2 % |
| **D** | 10-18 % | 1,2-2,2 | 5,6-6,2 | **3-12 %** | 3-8 % |
| **E** | 16-26 % | 2,2-3,5 | 6,0-6,6 | **< 2 %** | 18-28 % |
| **F** | 20-32 % | 3,0-4,5 | 5,6-6,2 | **< 1 %** | 20-30 % |

Les trois affirmations que ces chiffres mettent en jeu, et qui doivent me faire tort si elles sont
fausses :

1. **A ne suffit pas.** Je prédis que supprimer le pas gratuit laisse plus d'un tiers des runs à
   zéro dégât, parce que l'esquive reste une immunité, simplement payante. **Si `runs0` sous A
   tombe sous 5 %, j'ai tort et D46 devient facultative** — je ne garderais alors que `lunge` sur
   le Bélier, pour la saveur.
2. **C est inerte.** Je prédis que la piste 3 ne change les dégâts d'aucune quantité mesurable, et
   qu'elle raccourcit les combats de ~0,4 tour. **Si `pv/renc` sous C dépasse 1,0, j'ai tort** et
   la piste 3 est un vrai correctif défensif, pas seulement un correctif de rythme.
3. **D seule fait couler du sang, et ce n'est pas suffisant pour autant.** Je prédis `runs0` sous
   10 % dès les motifs seuls. Si c'est le cas, quelqu'un dira que D44 est désormais inutile.
   **Ma réponse est écrite d'avance et la mesure ne peut pas la trancher** : D44 ne répond pas à
   « le joueur prend-il des dégâts », mais à « le tour contient-il une décision ». Une action
   gratuite, toujours disponible et toujours utile n'est pas une décision, même dans un jeu où
   l'on saigne. Le propriétaire peut me surclasser sur ce point ; il le fera en connaissance de
   cause, pas par défaut de mesure.

Seuils d'acceptation du paquet E/F, à confronter à `run.md` § 5.2 (dégâts entrants visés : 3 pour
A1 rang 1, 5 pour A1 rang 3) :

- `runs0` < 2 %
- `contact` entre 15 % et 30 % — en dessous, l'esquive reste automatique ; au-dessus, le
  télégraphe cesse d'être une promesse et le jeu ment
- `pv/renc` en acte 1 entre 2,0 et 4,0
- `tours/renc` des combats normaux ≤ 6,5
- `secours` entre 12 % et 30 % — au-dessus de 30 %, un tiers des dés du jeu servent à marcher et
  les faces perdent leur sens ; c'est alors D44 qu'il faut revoir, ou la portée de la Frappe

### 5.5 Réserve méthodologique — la politique gloutonne doit être rendue neutre

**La mesure telle quelle comparerait des poids, pas des règles.** Le barème de
`packages/sim/src/policy.ts` a été calibré sous R : une esquive payée y vaut 3, une Frappe non
létale 10. Sous la variante A, cette IA ne fuira jamais tant qu'une Frappe est possible, et
encaissera des dégâts qu'un joueur humain n'encaisserait pas. Elle rendrait D44 artificiellement
efficace, exactement de la façon dont on ne veut pas se tromper.

Avant la campagne, le barème doit être exprimé dans **une seule monnaie : les points de vie**, ce
qui le rend indépendant des règles :

| Entrée | Score |
|---|---|
| Pas (gratuit ou payé) vers `c` | `menace(case actuelle) − menace(c)` |
| Élan vers `c` | `menace(case actuelle) − menace(c) + 2 × piétinements létaux + 1 × piétinements` |
| Garde | `min(menace(case actuelle), guardShield)` |
| Frappe non létale | `strikeDamage` |
| Frappe létale | `strikeDamage + menace apportée par la cible ce tour` |

avec `menace(c)` = somme des `value` des intentions `attack` et `charge` dont le motif projeté
couvre `c`. Départage à score égal : l'ordre de `legalEntries`, qui est déjà déterministe. Aucun
seuil, aucune constante à retoucher entre les variantes — c'est la condition pour que le tableau
du § 5.4 mesure les règles.

Ce barème appartient à `balance-simulator` ; je le pose comme **exigence de validité de la
mesure**, pas comme une conception d'IA.

---

## 6. Modifications de `docs/design/combat.md`

Appliquées dans le même passage. Résumé pour relecture :

| § | Modification |
|---|---|
| en-tête | Statut v1.1, renvoi à ce document, D44-D47 |
| 2.1 | `player.freeStepUsed` retiré de l'état persisté |
| 3, phase 0 | l'item 4 (`freeStepUsed = false`) disparaît |
| 3, phase 3 | la ligne « Pas gratuit » du tableau des entrées disparaît |
| 5.5 | réécrite : la dépense de secours passe de filet à **verbe de déplacement ordinaire** ; ajout du filet réel (« Garde est toujours légale ») |
| 6 | tableau des sources de déplacement : le pas gratuit devient une permission de relique |
| 8.1 | grammaire des formes `single` / `lunge` / `line3` ; règle d'ancrage d'une `charge` |
| 8.4 | cerveau `charge` spécifié (règle de choix déterministe) |
| 9 | formes attribuées aux trois ennemis de départ ; leçons mises à jour |
| 10.5 | mention du pas gratuit retirée |
| 11.1 | phrase « le pas gratuit n'entre pas dans `S` » retirée |
| 14 | nouveau budget (7,6 s) et nouvelles lignes d'arbitrage |
| 15 | passation de la permission « pas gratuit » à `item-designer` |

**Attribution des formes aux trois ennemis de départ** (§ 9), avec la raison :

- **E1 Rôdeur → `single`.** Il enseigne « l'intention vise une case, pas toi ». Sa leçon exige
  qu'une esquive, n'importe laquelle, fonctionne. Il reste le mètre étalon.
- **E2 Guetteur → `line3`.** Sa leçon est « casse la ligne ». Avec `line3`, la ligne devient
  littéralement dangereuse sur toute sa longueur autour du joueur, et la seule esquive est
  perpendiculaire. La compétence spatiale de base du jeu — se placer en diagonale — passe d'un
  conseil à une nécessité.
- **E3 Bélier → `lunge`.** Sa leçon est « la menace qu'on ne supprime pas ce tour-ci ». Une fente
  qui dépasse la cible d'une case supprime une des deux esquives ; combinée à sa Poussée, il
  devient l'ennemi qui **ferme des cases**. C'est aussi lui qui, croisé avec un Guetteur, produit
  la première tenaille du jeu — la rencontre A1 rang 2 (b), « le corps qui protège le tireur »,
  qui portait jusqu'ici mal son nom.

Aucun nouvel ennemi, aucun nouveau chiffre de dégâts : la modification est géométrique.

---

## 7. Ce que je laisse ouvert

- **Propriétaire** : consigner D44-D47 en partie 1 de `docs/06-arbitrages.md`, et corriger la
  formulation de D30 (elle *contient* la garantie de D18, elle ne l'*étend* pas).
- **`balance-simulator`** : le barème en points de vie du § 5.5, la campagne R/A/C/D/E/F, et une
  régression permanente sur `runs0` — si `runs0` remonte au-dessus de 5 % après une session de
  contenu, une relique a recréé l'immunité.
- **`item-designer`** : la relique portant la permission « pas gratuit » (D45), tier explosif,
  non publiable avant D46. Et le fait que D44 revalorise mécaniquement toute relique de mobilité :
  le prix de référence de la mobilité a changé, il faut le recalibrer.
- **`mobile-ux`** : la lisibilité d'un `line3` sur 5 colonnes, et surtout **la distinction visuelle
  entre une case menacée et une case libre quand il n'en reste que deux**. C'est le moment où le
  joueur doit lire vite et où une erreur de lecture coûte 3 PV. Mon budget de lecture est +0,2 s ;
  si le rendu demande davantage, c'est la forme `line3` qui saute, pas le budget.
- **`progression-designer`** : D44 augmente la pression sur le `pool`. Un pool riche en Élan
  devient une réponse défensive, ce qui n'était pas vrai hier. La courbe de DPT de `run.md` § 5.2
  suppose 3 dés offensifs par tour ; elle en suppose désormais ~2,5 en présence de menaces.
- **Non tranché volontairement** : les formes des ennemis des actes 2 et 3. Règle de production
  que je pose dès maintenant — **au plus un ennemi par rencontre porte une forme autre que
  `single`** en acte 1 et en acte 2 ; l'acte 3 peut en porter deux. Au-delà, la grille se ferme et
  le jeu devient un puzzle sans solution.
