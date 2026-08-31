# Progression — puissance, survie, Forge

> Agent responsable : `progression-designer`. Statut : **v1, mesurable**.
> Cadre : concept figé, D1-D33, invariants I1-I5. Complète `docs/design/combat.md` et
> `docs/design/run.md`. Tranche **A24** (les valeurs de survie).
> **[T]** = paramètre de tuning : il peut bouger sans que la règle change.
> **[H]** = hypothèse de travail : le chiffre est cohérent avec le reste du modèle mais
> n'a pas encore été mesuré. `balance-simulator` le confirme ou le corrige.

---

## 1. Définir « puissance » avant de dessiner une courbe

Il n'y a ni XP, ni niveaux, ni arbre de compétences. « Le joueur est plus fort » n'a donc
aucun support numérique dans le jeu : ni le moteur ni le simulateur ne peuvent le lire
quelque part. Il faut le **calculer**. Tant que ce calcul n'existe pas, la phrase « la
puissance doit tripler » du concept n'est pas vérifiable, et toute courbe est décorative.

### 1.1 La grandeur

> **Puissance `P` = `DPT` + 0,5 × `RPT`**, en points de dégâts par tour.

| Terme | Définition exacte |
|---|---|
| **`DPT`** | Dégâts par tour infligés aux unités ennemies, moyennés sur le banc d'essai (§ 1.2) |
| **`RPT`** | Réduction par tour : Bouclier produit + PV soignés en combat + (`Armure` × nombre d'instances de dégâts subies), moyennés sur le même banc |

**Pourquoi 0,5 et pas 1.** Un point de dégâts infligé vaut plus qu'un point de dégâts évité,
pour deux raisons cumulatives : il **raccourcit le combat**, donc il évite mécaniquement
d'autres dégâts (l'offensive se compose avec elle-même, la défense non), et les PV sont une
ressource **récupérable** entre les combats (Repos, victoire de boss) alors que les tours ne
le sont pas. Le facteur 0,5 est le prix de conversion entre les deux.

**Le 0,5 est falsifiable, et doit être falsifié.** `balance-simulator` régresse le taux de
victoire d'une run sur `DPT` et `RPT` mesurés au boss 2 ; le rapport des deux coefficients
*est* le facteur. Si la mesure donne 0,3 ou 0,8, c'est le facteur qui change ici, pas les
reliques. **[T]**

Écarté : définir la puissance comme le seul `DPT`. Une relique purement défensive
compterait alors pour zéro, ce qui rendrait invisible tout un tiers du catalogue et
pousserait `item-designer` vers l'agression pure. Écarté aussi : un indice composite à
cinq termes (mobilité, contrôle, économie de dés). Chaque terme supplémentaire est un
poids arbitraire de plus ; deux termes et un prix de conversion, c'est déjà à la limite de
ce qu'on peut défendre.

### 1.2 Le banc d'essai (pour que `P` soit reproductible bit pour bit — I1)

`P` n'est pas mesurée en combat réel : le combat réel mélange la puissance du joueur et la
qualité de la rencontre. Elle est mesurée sur un banc fixe.

| | |
|---|---|
| Grille | 5×7, joueur en `(3,5)` |
| Cibles | 3 unités inertes en `(2,3)`, `(3,3)`, `(4,3)`, PV infinis, `Armure` 0, aucune intention |
| Pression | Une instance de 3 dégâts sur la case du joueur à la fin de chaque phase ennemie, non esquivable — elle existe pour que `Bouclier` et `Armure` aient quelque chose à absorber |
| Durée | 20 tours, seed fixe |
| Politique de dépense | **gloutonne lisible** : dépenser toute Frappe ayant une cible légale ; sinon Garde ; sinon Élan vers la cible la plus proche ; conserver un dé si et seulement si cela complète une Paire au tour suivant |
| Sortie | `DPT` = dégâts totaux ÷ 20 · `RPT` = (Bouclier produit + soins + Armure appliquée) ÷ 20 |

La politique de dépense fait partie de la définition : sans elle, `P` dépend de l'IA de test
et n'est plus comparable d'une version à l'autre. Elle est volontairement médiocre — elle
mesure ce qu'un build **produit tout seul**, pas ce qu'un joueur parfait en tire.

### 1.3 Puissance nominale et puissance effective

- **`P` nominale** — mesurée au banc. C'est la valeur du build.
- **`P` effective** — mesurée dans les rencontres réelles : dégâts réellement infligés par
  tour, Bouclier réellement consommé par tour.

> **Contrat : `P` effective ÷ `P` nominale ≥ 0,75** **[T]** sur l'ensemble d'une run.

En dessous, ce n'est pas le build qui est faible, c'est la **grille qui se bat contre lui** :
pas de cible à portée, Bouclier gagné les mauvais tours, Élan sans destination utile. C'est
un défaut de conception de rencontre, pas d'équilibrage de relique, et il se corrige dans
`run.md`, pas ici.

### 1.4 Décomposition — ce que `item-designer` doit fournir

```
DPT  =  N_off  ×  d̄  +  T_decl
```

| Symbole | Définition |
|---|---|
| `N_off` | Nombre de dés dépensés par tour en action offensive (Frappe, Élan qui piétine, Éclat joué en Frappe) |
| `d̄` | Dégâts moyens par dé offensif |
| `T_decl` | Dégâts par tour venant des **déclenchements** de reliques, non portés par un dé |

Cible :

| Repère | `N_off` | `d̄` | `T_decl` | `DPT` |
|---|---|---|---|---|
| Premier tour de la run | 1,50 | 2,00 | 0,0 | **3,0** |
| Boss 1 | 1,70 | 2,10 | 0,4 | **4,0** |
| Boss 2 | 2,00 | 2,40 | 1,7 | **6,5** |
| Boss 3 | 2,50 | 2,70 | 3,2 | **10,0** |

Les trois facteurs sont **multiplicatifs entre eux** : une relique qui monte `N_off` et une
relique qui monte `d̄` se multiplient. C'est là qu'est l'accélération de la courbe, et c'est
structurel — elle ne vient pas de reliques tardives plus grosses, elle vient du fait que les
reliques se composent. Conséquence pour `item-designer` : le catalogue doit fournir des
reliques sur **les trois facteurs**. Un catalogue qui n'agit que sur `T_decl` donne une
courbe linéaire, et la promesse de boule de neige du concept tombe.

> **Règle de production : au boss 3, environ un tiers du `DPT` doit venir de `T_decl`.**
> C'est la traduction chiffrée de « j'ai construit une machine ridicule ». Elle est
> cohérente avec `combat.md` § 12, qui attend 10 à 14 déclenchements par tour en acte 3.

`RPT` se décompose de la même façon : `RPT` = (dés dépensés en Garde × Bouclier par Garde)
+ soins en combat + `Armure` appliquée.

---

## 2. La courbe cible de puissance

### 2.1 Le contrat

> **`P` au boss 3 ÷ `P` au premier tour de la run ∈ [2,8 ; 3,2].**

Mesuré sur le build **médian** (50ᵉ centile de `P` au boss 3, sur l'ensemble des runs
simulées qui atteignent le boss 3). Le ratio est le contrat, pas les valeurs absolues : il
reste valable quel que soit le personnage joué et quelle que soit la valeur de départ de son
pool.

Valeur de référence du pool de départ nu (6 dés standards, sans relique) : **`P₀` = 4,50**
(`DPT` 3,0 = 1,5 Frappe par tour × 2 dégâts ; `RPT` 3,0 = 1,0 Garde par tour × 3 Bouclier).
Cible au boss 3 : **`P` = 13,50**.

### 2.2 La courbe, rang par rang

| Rang | `P` | `DPT` | `RPT` | `RPT`/`DPT` | Reliques acquises **[H]** |
|---|---|---|---|---|---|
| Acte 1 rang 1 | 4,5 | 3,0 | 3,0 | 1,00 | 0 (+ signature) |
| Acte 1 rang 2 | 5,1 | 3,5 | 3,2 | 0,91 | 1 |
| Acte 1 rang 3 | 5,1 | 3,5 | 3,2 | 0,91 | 2 |
| **Boss 1** | 5,8 | 4,0 | 3,5 | 0,88 | 3 |
| Acte 2 rang 1 | 7,0 | 5,0 | 4,0 | 0,80 | 4 |
| Acte 2 rang 2 | 7,6 | 5,5 | 4,2 | 0,76 | 5 |
| Acte 2 rang 3 | 8,3 | 6,0 | 4,5 | 0,75 | 5 |
| **Boss 2** | 8,9 | 6,5 | 4,8 | 0,74 | 6 |
| Acte 3 rang 1 | 10,9 | 8,0 | 5,7 | 0,71 | 7 |
| Acte 3 rang 2 | 11,5 | 8,5 | 6,0 | 0,71 | 8 |
| Acte 3 rang 3 | 12,2 | 9,0 | 6,3 | 0,70 | 9 |
| **Boss 3** | 13,5 | 10,0 | 7,0 | 0,70 | 10-11 |

Cette courbe **valide** l'hypothèse de `DPT` posée par `game-designer` dans `run.md` § 5.2
(3,0 → 10,0) : les deux tables coïncident à l'arrondi près. Elle en donne en plus la
justification et la moitié défensive.

### 2.3 La forme : accélération

| Acte | `P` début → fin | Gain absolu | Gain relatif |
|---|---|---|---|
| Acte 1 | 4,5 → 5,8 | **+1,3** | +29 % |
| Acte 2 | 5,8 → 8,9 | **+3,1** | +53 % |
| Acte 3 | 8,9 → 13,5 | **+4,6** | +52 % |

Le gain **absolu** par acte croît de +1,3 à +4,6 : c'est ça, l'accélération que le joueur
ressent. Le gain **relatif** plafonne vers +52 %, ce qui est sain : une courbe dont le taux
de croissance augmente aussi devient injouable au dernier acte et rend le boss 3 décoratif.

L'acte 1 est délibérément plat (+29 %). Le joueur y apprend les dés, la grille et les
intentions ; lui empiler de la puissance pendant ce temps double le nombre de choses qu'il a
à comprendre. Le concept est explicite : « l'acte 1 enseigne, il ne trie pas ».

### 2.4 Le ratio `RPT`/`DPT` : la deuxième histoire de la courbe

Il glisse de **1,00 à 0,70**. Au premier tour, le pool est symétrique (3 Frappe / 2 Garde) et
le joueur se garde autant qu'il frappe. Au boss 3, il tue plus vite qu'il n'encaisse.

Ce ratio est un **diagnostic de build**, pas une cible individuelle :

| Ratio mesuré au boss 2 | Lecture |
|---|---|
| < 0,45 | Build verre — il gagne vite ou il meurt. Doit exister, doit rester minoritaire |
| 0,60 à 0,85 | Build médian |
| > 1,10 | Build forteresse — vérifier qu'il finit la run en moins de 30 tours par combat (`combat.md` § 3) |

Si **plus de 60 % des builds** simulés tombent dans une seule de ces trois bandes, le
catalogue de reliques n'offre pas de vrai choix offensive/défensive.

### 2.5 Le budget de puissance par relique

Le triplement doit être **financé**. Sur une run de référence : 10 ou 11 reliques et 2
opérations de Forge, soit 12 à 13 acquisitions pour un facteur 3. Moyenne géométrique
nécessaire : **×1,096 par acquisition**.

> **Contribution médiane réalisée à `P`**, par rareté :
>
> | Rareté | Contribution | Bande admise |
> |---|---|---|
> | Commune | **+7 %** **[T]** | 0 % à +16 % |
> | Peu commune | **+10 %** **[T]** | 0 % à +22 % |
> | Rare | **+14 %** **[T]** | 0 % à +32 % |
> | Opération de Forge | **+4 %** **[T]** | +1 % à +9 % |
> | Relique signature de personnage | **+7 %** au premier tour | voir § 2.6 |

Deux précisions qui changent tout pour `item-designer` :

1. C'est une contribution **médiane réalisée**, mesurée sur l'ensemble des builds simulés,
   pas une intention de conception. Une relique qui vaut 0 % dans huit builds sur dix et
   +30 % dans deux est **exactement dans la cible** — c'est même la définition d'une relique
   orientée build (`docs/03-content-budget.md`, règle des tiers).
2. La borne haute de la bande est le vrai garde-fou. Une relique dont le 90ᵉ centile dépasse
   sa bande n'est pas « forte », elle **remplace le build** : toutes les runs qui la voient
   convergent vers elle, et la variété du catalogue s'effondre.

Vérification : 6 communes, 3 peu communes, 3 rares, 2 Forges donnent
`1,07⁶ × 1,10³ × 1,14³ × 1,04² = 3,20`. Avec les refus, les mauvais choix et les reliques
inertes pour le build en cours, le médian réalisé retombe dans la fenêtre [2,8 ; 3,2]. ✔

---

## 3. Les valeurs de survie — point A24

C'est le point qui conditionne tout le reste : les PV ennemis et les dégâts entrants de
chaque rencontre en dérivent.

### 3.1 Ce qui est tranché

| Grandeur | Valeur | Statut |
|---|---|---|
| PV maximum au départ | **40** | arbitré |
| PV maximum pendant la run | **40, constant** | **tranché ici** |
| Soin du Repos | **+12** (30 % du maximum) **[T]** | **tranché ici** — remplace l'hypothèse +10 |
| Soin de victoire des boss 1 et 2 | **+12** (30 % du maximum) **[T]** | **tranché ici** — remplace l'hypothèse +5 |
| Plafond absolu de PV maximum (reliques comprises) | **50** | **tranché ici** |

**Un seul chiffre de soin, deux endroits.** Le Repos et la victoire de boss donnent la même
chose : 30 % de la barre. Le joueur n'a qu'un nombre à retenir, et le nombre suit
automatiquement si une relique monte son maximum. C'est aussi ce qui rend l'acte lisible
comme unité : on entre dans un acte avec un tiers de barre rendu.

**Pourquoi +12 et pas +10 au Repos.** À 40 PV maximum et avec 9 à 12 rencontres, +10 ne
suffit pas à faire remonter la marge de survie au-dessus de 2,0 après le boss 2 : la course
se termine mécaniquement par une mort au boss 3 dans presque toutes les trajectoires
médianes. +12 est la plus petite valeur qui place le minimum de la marge en acte 2 plutôt
qu'au boss 3 — c'est-à-dire la plus petite valeur qui respecte le contrat de `run.md` § 5.4.

**Pourquoi +12 et pas +5 après un boss.** +5 sur 40 est cosmétique : c'est un demi-coup
d'acte 3. Un soin qui ne change aucune décision est du bruit sur l'écran de récompense.

**Pourquoi le maximum ne monte pas.** J'ai instruit l'option « +10 PV maximum par boss
vaincu » (40 / 50 / 60). Elle marche numériquement, et elle a été écartée pour trois
raisons : elle rend la marge de survie incomparable d'un acte à l'autre (le dénominateur et
le numérateur bougent tous les deux) ; elle ajoute une deuxième courbe de progression à
côté du pool, ce qui contredit frontalement le pilier 1 (« le pool de dés est le
personnage ») ; et 40 est un nombre que le joueur mémorise et contre lequel il lit tous les
dégâts de tout le jeu. Une relique **peut** monter le maximum, jusqu'à 50 au total — c'est
un effet rare, pas une courbe.

### 3.2 La marge de survie, définie proprement

`game-designer` a posé la grandeur ; il faut en fixer la définition exacte, sinon elle n'est
pas calculable.

> **Marge de survie `M(rang)` = PV à l'entrée du rang ÷ dégâts entrants du nœud le plus dur
> de ce rang.**

Le **nœud le plus dur du rang**, pas le nœud choisi. Trois conséquences, toutes voulues :

- `M` est une propriété de **l'état**, pas du chemin. Elle est comparable entre deux runs
  qui ont fait des choix différents, ce qui est la condition pour en tirer une statistique.
- Elle est définie au rang 2, là où le joueur peut prendre le Repos. Si on la mesurait sur
  le nœud choisi, prendre le Repos rendrait `M` infinie et effacerait précisément le moment
  le plus tendu de la run.
- Elle mesure **l'exposition** : « si je prends le pire nœud de ce rang, combien de fois
  puis-je l'encaisser ». C'est la question que le joueur se pose devant la carte.

### 3.3 La table des rencontres

`DPT` et `RPT` viennent du § 2.2. Les autres colonnes en dérivent.

- **PV ennemis** = `DPT` × (`Tours` − 1). Le « −1 » est le tour d'approche : au tour 1, les
  ennemis démarrent aux rangées 1-3 et le joueur en `(3,5)`, la plupart des cibles ne sont
  pas encore à portée. Les boss portent +7 % pour leurs transitions de phase.
- **Pression `B`** = somme des dégâts télégraphiés par tour par les ennemis vivants au
  tour 2. C'est le budget d'agression que l'auteur de rencontre répartit entre ses unités.
- **Taux d'encaissement `τ`** = dégâts entrants ÷ dégâts télégraphiés totaux. Il descend au
  fil de la run parce que le build monte : on esquive plus, on se garde mieux, on tue plus
  tôt.
- **Dégâts entrants `D`** = `B` × (`Tours` − 1) × `τ`, pour un build **médian**.

| Rencontre | `DPT` | Tours | PV ennemis | Pression `B` | `τ` | **`D` entrants** |
|---|---|---|---|---|---|---|
| A1 rang 1 | 3,0 | 4 | **8** | 4 | 0,25 | **3** |
| A1 rang 2 | 3,5 | 4 | **10** | 5 | 0,26 | **4** |
| A1 rang 3 | 3,5 | 5 | **14** | 6 | 0,21 | **5** |
| A1 élite | 3,5 | 6 | **18** | 6 | 0,20 | **6** |
| **Boss 1** | 4,0 | 8 | **30** | 6 | 0,17 | **7** |
| A2 rang 1 | 5,0 | 5 | **20** | 11 | 0,18 | **8** |
| **A2 rang 2 — pic** | 5,5 | 6 | **28** | 12 | 0,18 | **11** |
| A2 rang 3 | 6,0 | 5 | **24** | 13 | 0,17 | **9** |
| A2 élite | 6,0 | 7 | **36** | 13 | 0,17 | **13** |
| **Boss 2** | 6,5 | 9 | **56** | 9 | 0,15 | **11** |
| A3 rang 1 | 8,0 | 5 | **32** | 14 | 0,14 | **8** |
| A3 rang 2 | 8,5 | 6 | **43** | 11 | 0,14 | **8** |
| A3 rang 3 | 9,0 | 6 | **45** | 14 | 0,13 | **9** |
| A3 élite | 9,0 | 7 | **54** | 17 | 0,13 | **13** |
| **Boss 3** | 10,0 | 10 | **95** | 9 | 0,12 | **10** |

Vérifications :
- Combats normaux : 4 à 6 tours partout. ✔ contrat de pacing de `docs/01-boucle-et-pacing.md`
- Boss : 8, 9 et 10 tours. ✔ fenêtre 90-120 s
- A1 rang 1 à 8 PV ennemis = 2 Rôdeurs de `combat.md` § 9. A1 rang 2 à 10-11 PV = les deux
  compositions écrites. A1 rang 3 à 14 PV = Rôdeur + Guetteur + Bélier. ✔ la table est
  compatible avec les rencontres déjà écrites.
- A2 rang 2 : 28 PV contre 22 pour un nœud de rang 2 ordinaire, soit **+27 %**. ✔ le « +20 %
  au-dessus de la ligne » de `run.md` § 5.3.

**Correction par rapport à `run.md` § 5.2**, à assumer explicitement : les budgets de PV
ennemis y étaient calculés `DPT × tours` sans retirer le tour d'approche, et les dégâts
entrants d'acte 3 y étaient trop élevés d'environ 40 %. La table ci-dessus les remplace.
Le nombre de tours visé et la position du pic, eux, sont inchangés.

### 3.4 Le taux d'encaissement, et pourquoi il tombe

`τ` passe de 0,25 à 0,12. Autrement dit, en acte 3 le joueur ne subit qu'un huitième de ce
que les ennemis annoncent. C'est **le** chiffre à surveiller, parce que c'est là que la
promesse « le build est constitué, le jeu te laisse t'en servir » devient vraie ou fausse.

Trois mécanismes le font descendre, et aucun n'est un bonus caché :
1. **Les morts progressives.** Tuer une unité au tour 2 d'un combat de 6 tours supprime les
   quatre cinquièmes de sa contribution. Un `DPT` plus haut réduit `τ` sans rien faire d'autre.
2. **L'esquive.** L'ancre suit l'unité mais le motif est figé (D28) : bouger annule un tir.
   C'est la défense principale du jeu, et elle est gratuite (pas gratuit, D18).
3. **`RPT`.** 7 points de Bouclier par tour au boss 3, sur 9 tours de dégâts, absorbent 63
   points sur les ~81 télégraphiés.

> **Bande cible par acte : `τ` ∈ [0,22 ; 0,28] en acte 1, [0,15 ; 0,20] en acte 2,
> [0,11 ; 0,15] en acte 3.**

- `τ` qui reste haut en acte 3 : la rencontre est oppressive (trop de menaces simultanées),
  ou le build n'a pas de réponse. On corrige la **rencontre**.
- `τ` qui s'effondre sous 0,08 : le joueur ne subit plus rien, l'acte 3 est une parade. On
  corrige la **pression**, jamais les PV ennemis (monter les PV allonge le combat sans le
  rendre plus intéressant, et casse le budget de temps).

### 3.5 La trajectoire de PV et la marge de survie

Chemin de référence : Combat au rang 1 ; Combat au rang 2 en acte 1 (le Repos y serait
gaspillé, le joueur est à pleine barre), Repos au rang 2 en actes 2 et 3 ; Combat au rang 3.

| Rang | PV à l'entrée | `D` du nœud le plus dur | **Marge** | Nœud pris |
|---|---|---|---|---|
| A1 rang 1 | 40 | 3 | 13,3 | Combat |
| A1 rang 2 | 37 | 4 | 9,3 | Combat |
| A1 rang 3 | 33 | 6 (élite) | 5,5 | Combat |
| Boss 1 | 28 | 7 | 4,0 | Boss → +12 |
| A2 rang 1 | 33 | 8 | 4,1 | Combat |
| **A2 rang 2** | **25** | **11** | **2,27 ← minimum de la run** | Repos → +12 |
| A2 rang 3 | 37 | 13 (élite) | 2,85 | Combat |
| Boss 2 | 28 | 11 | 2,55 | Boss → +12 |
| A3 rang 1 | 29 | 8 | 3,6 | Combat |
| A3 rang 2 | 21 | 8 | 2,62 | Repos → +12 |
| A3 rang 3 | 33 | 13 (élite) | 2,54 | Combat |
| Boss 3 | 24 | 10 | 2,40 | Boss |

Fin de run à **14 PV**. Marge minimale **2,27**, atteinte en **acte 2 rang 2**.
✔ Contrat de `run.md` § 5.4 : minimum entre 2,0 et 3,0, situé en acte 2.

Lecture de la courbe : trois plongeons (rangs 1 à 3 de chaque acte) et trois remontées
(Repos, victoire de boss). L'amplitude des plongeons croît, celle des remontées est
constante — c'est ce qui fait descendre le plancher d'acte en acte sans jamais le faire
passer sous 2,0 pour un build médian.

### 3.6 Les trois chemins de référence

| Chemin | Rang 2 | Rang 3 | Rencontres | Reliques | Soins | Verdict attendu |
|---|---|---|---|---|---|---|
| **Prudent** | Repos ×3 | Combat | 9 | 8-9 | 3 Repos + 2 boss | finit la run, avec un build faible que le boss 3 punit |
| **Référence** | Combat en A1, Repos en A2-A3 | Combat | 10 | 9-11 | 2 Repos + 2 boss | ✔ la trajectoire du § 3.5 |
| **Gourmand** | Combat ×3 | Élite ×3 | 12 | 12-15 | 2 boss seulement | **meurt en acte 2**, entre le rang 2 et l'élite |

Ces trois chemins sont **auto-équilibrants**, et c'est le point de design le plus important
de cette section : le chemin prudent prend moins de reliques, donc son `DPT` est plus bas,
donc ses combats durent plus longtemps, donc ses dégâts entrants réels sont **très
supérieurs** à la table du § 3.3, qui est écrite pour le build médian. Le chemin gourmand
fait l'inverse. Les soins compensent presque exactement l'écart de puissance — presque, et
c'est là que se joue la difficulté.

**Précision apportée à `run.md` § 6, à faire valider par `game-designer`.** Le document de
run demande que « les deux stratégies finissent la run entre 35 % et 65 % du temps » en
citant le chemin tout-combat comme l'une des deux. Ce n'est pas tenable : sur 12 rencontres
sans un seul Repos, le déficit est de 24 PV de soin contre un gain de puissance d'environ
+25 %, et le calcul ne se referme pas. Les deux stratégies de référence sont donc
**prudent** et **référence** ; « tout combattre sans jamais se reposer » est un **pari**,
pas une stratégie, et doit tourner autour de 10 à 20 % de réussite. C'est cohérent avec
`run.md` § 5.3, qui annonce déjà la mort du chemin gourmand en acte 2.

### 3.7 Le plafond d'erreur de l'acte 1

`run.md` § 5.5 exige qu'aucune rencontre d'acte 1 ne puisse infliger plus de 12 dégâts à un
joueur qui se trompe. Facteur d'erreur retenu pour un débutant : **×1,6** sur `D` **[H]**.

| Rencontre | `D` médian | × 1,6 | ≤ 12 ? |
|---|---|---|---|
| A1 rang 1 | 3 | 4,8 | ✔ |
| A1 rang 2 | 4 | 6,4 | ✔ |
| A1 rang 3 | 5 | 8,0 | ✔ |
| A1 élite | 6 | 9,6 | ✔ |
| Boss 1 | 7 | 11,2 | ✔ |

C'est précisément cette contrainte qui fixe les dégâts entrants du boss 1 à 7 et pas à 9.

---

## 4. Le catalogue de la Forge

La Forge est l'autre choix du Repos (`run.md` § 2) et une opération achetable en Boutique.
C'est **la seule progression sculptée** de la run : les reliques s'accumulent, le pool se
taille (D25).

| Opération | Effet | Poids `P` **[T]** |
|---|---|---|
| **Aiguiser** | Une face Garde d'un dé devient Frappe | +4 % |
| **Tremper** | Une face Frappe d'un dé devient Garde | +4 % |
| **Alléger** | Une face Frappe ou Garde d'un dé devient Élan | +3 % |
| **Fondre** | Retire un dé du pool | +5 % |
| **Battre** | Ajoute un dé standard (3 Frappe / 2 Garde / 1 Élan) au pool | +4 % |
| **Décalquer** | Ajoute au pool une copie d'un dé déjà présent | +6 % |
| **Éclater** | Une face quelconque d'un dé devient Éclat | +8 % |

Noms de code : `lore-keeper` les remplace. Le vocabulaire mécanique (`pool`, face, Frappe,
Garde, Élan, Éclat), lui, ne bouge pas.

**Règles d'accès**
- Au **Repos** : une seule opération, choisie parmi **trois** tirées de la seed de la run.
  *Éclater* n'apparaît pas avant l'acte 2.
- En **Boutique** : deux opérations à prix affichés (`run.md` § 2). Les prix appartiennent à
  `item-designer`.
- **Taille du pool : minimum 3, maximum 10.** **[T]**
  En dessous de 3, la Main de 3 vide le pool à chaque tour et le tirage cesse d'exister
  comme décision — sauf pour le personnage 4, dont c'est justement l'identité (voir
  `personnages.md`). Au-dessus de 10, le joueur ne peut plus tenir la composition de son
  pool en tête, et l'invariant I5 devient une fiction : la donnée est affichée mais elle
  n'est plus lisible.
- *Fondre* ne peut pas amener le pool sous le minimum ; l'opération est alors retirée du
  tirage de trois plutôt que proposée puis refusée.

**Pourquoi *Fondre* pèse plus lourd que *Battre*.** Retirer un dé concentre le pool : dans
un pool de 6, retirer le dé le moins utile monte la probabilité de tirer les autres de 20 %.
C'est l'opération la plus forte du catalogue et la plus contre-intuitive pour un joueur qui
vient d'un jeu où « plus » veut dire « mieux ». Elle est le pendant exact du refus de
relique (D25) : dans ce jeu, **renoncer est un levier de puissance**.

**Le trou de récompense du rang 2.** `run.md` § 6 le signale : sur un chemin qui prend le
Repos aux trois actes, le joueur traverse trois rangs sans nouvelle relique. La Forge est la
réponse, et elle n'est une vraie réponse que si sa modification est **visible sur la fiche
du personnage**. D'où le choix d'opérations qui changent la composition affichée du pool
(une face, un dé) plutôt que des effets abstraits.

---

## 5. Ce que `balance-simulator` doit mesurer

Par ordre de priorité. Chaque ligne est un écart entre une cible de ce document et une run
réelle.

| # | Mesure | Cible | Alerte |
|---|---|---|---|
| 1 | `P` au boss 3 ÷ `P` au premier tour, médiane | 3,0 | hors de [2,8 ; 3,2] |
| 2 | Marge de survie minimale d'une run, médiane | 2,2 à 2,5 | hors de [2,0 ; 3,0] |
| 3 | Rang où tombe la marge minimale | acte 2 | moins de 70 % des runs en acte 2 |
| 4 | `τ` par rencontre | § 3.4 | hors bande sur 2 rencontres du même acte |
| 5 | Tours par rencontre | § 3.3 | écart > 1,5 tour |
| 6 | `P` effective ÷ `P` nominale | ≥ 0,75 | < 0,70 |
| 7 | Contribution réalisée de chaque relique à `P` | § 2.5 | 90ᵉ centile au-dessus de la bande |
| 8 | `RPT`/`DPT` au boss 2, distribution | § 2.4 | > 60 % des builds dans une seule bande |
| 9 | Part de `T_decl` dans le `DPT` au boss 3 | ≈ 1/3 | < 0,20 ou > 0,50 |
| 10 | Taux de victoire des 3 chemins du § 3.6 | 40-60 / 45-65 / 10-20 % | hors bande |

Le facteur 0,5 de la définition de `P` (§ 1.1) doit être **recalibré par régression** dès
que 10 000 runs simulées existent. C'est le seul paramètre de ce document qui est un pari
théorique plutôt qu'une dérivation.

---

## 6. Ce que je laisse ouvert, et pour qui

- **`item-designer`** : le budget du § 2.5 est un contrat, pas une suggestion — chaque
  relique doit annoncer sur quel facteur de la décomposition du § 1.4 elle agit (`N_off`,
  `d̄`, `T_decl`, ou `RPT`), et le catalogue doit couvrir les quatre. Les prix de la Forge.
  La distribution des raretés par acte, qui détermine si le chemin gourmand paie vraiment
  ses élites.
- **`game-designer`** : la précision du § 3.6 sur le chemin gourmand, qui contredit une
  phrase de `run.md` § 6 ; et la pression `B` par rencontre du § 3.3, qui est un budget
  d'agression à répartir entre les unités qu'il écrit.
- **`balance-simulator`** : tout le § 5. En priorité, le facteur 0,5.
- **`mobile-ux`** : l'affichage de la composition du pool après une opération de Forge. Si
  le joueur ne **voit** pas son pool changer, la Forge ne compense pas le trou de récompense
  du rang 2 et tout le § 4 tombe.
