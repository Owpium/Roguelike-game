# Personnages — les quatre manières de tordre les dés

> Agent responsable : `progression-designer`. Statut : **v1**.
> Cadre : D5, D16, D19, D22, D27, D29. Les noms sont des **noms de code** : `lore-keeper`
> les remplace, la mécanique ne bouge pas.
> **[T]** = paramètre de tuning · **[H]** = hypothèse à mesurer par `balance-simulator`.

---

## 1. Ce qu'est un personnage, et ce qu'il n'est pas

Un personnage = **un pool de départ + une relique signature + une règle propre**.

Trois contraintes structurantes, dont deux viennent du moteur :

1. **La Main ne traverse pas les combats et le pool est remélangé à chaque combat** (D29).
   Il n'existe donc **aucun état persistant** qui pourrait porter l'identité d'un
   personnage entre deux combats, à part le pool, les reliques et les PV. Le pool est le
   personnage. Littéralement, pas comme métaphore.
2. **Chacun tord les dés à sa manière** (D16), pas le combat. On ne fera pas « le rapide,
   le lourd, le contrôleur » : ces archétypes-là sont interchangeables et ils gaspilleraient
   le seul système qui rend ce jeu particulier.
3. **La différence doit être visible au premier tour.** Le test est le § 2. Un personnage
   dont on ne peut pas dire la différence en une phrase n'existe pas — on le coupe.

Les quatre torsions correspondent aux quatre leviers de relique de
`docs/02-systemes-v0.md` § « Les 4 leviers ». Ce n'est pas une coïncidence : chaque
personnage est une leçon vivante sur un levier, et le joueur qui l'a joué comprend ensuite
les reliques qui utilisent ce levier.

| # | Nom de code | Levier tordu | Ce qu'il apprend au joueur |
|---|---|---|---|
| 1 | `SOCLE` | **aucun** | les faces, la grille, les intentions, la Paire |
| 2 | `RELANCE` | **tirage** | un tirage se corrige ; un gros pool est un pool sale |
| 3 | `GRAVURE` | **faces** | conserver est un investissement ; l'Éclat existe |
| 4 | `LES-TROIS` | **composition du pool** | le pool est une composition, pas un stock ; l'ordre des dépenses compte |

---

## 2. Le test d'une phrase

C'est le seul critère d'acceptation de ce document. Si l'une de ces phrases devient fausse
en implémentation, le personnage est à refaire, pas à rééquilibrer.

| | En une phrase |
|---|---|
| `SOCLE` | Il joue les règles du jeu, sans exception, et il est récompensé quand il dépense deux dés de la même face. |
| `RELANCE` | Il a un dé de trop et un pool trop sale, et il en répare **un par tour**. |
| `GRAVURE` | Il conserve des dés non pas pour les rejouer, mais pour **les transformer en jokers**. |
| `LES-TROIS` | Il n'a que **trois dés**, il les voit tous à chaque tour, et son pool ne grossira jamais. |

Et le test au premier tour, qui est plus dur :

| | Ce que le joueur voit au tour 1, avant même de jouer |
|---|---|
| `SOCLE` | Trois dés, un pool de 6, rien d'autre. |
| `RELANCE` | Un pool de **8**, et un geste de relance sous la Main avec un compteur « 1 ». |
| `GRAVURE` | Une Main **presque toujours pleine de Frappes**, et un pool où l'Élan est rare. |
| `LES-TROIS` | Sa Main **est** son pool : trois dés nommés, différents les uns des autres, et un cadenas sur la taille du pool. |

---

## 3. Personnage 1 — `SOCLE` (de départ)

> **Fantaisie :** « Je frappe, je me garde, et quand je fais deux fois la même chose dans le
> tour, ça paie. »

| | |
|---|---|
| **Pool de départ** | **6 dés standards**, tous identiques : 3 Frappe / 2 Garde / 1 Élan (D17, D19) |
| **Règle propre** | **aucune** |
| **Relique signature** | `LE-DOUBLE` — « **Paire : tu gagnes 2 Bouclier.** » |
| `P₀` | **4,50** (`DPT` 3,0 · `RPT` 3,0), la référence de toute la courbe de `progression.md` |
| **À comprendre au tour 1** | rien de plus que les règles du jeu |

### Il n'a pas de règle propre, et c'est sa définition

Le concept dit « pool + relique signature + une règle propre ». Le personnage de départ en a
deux sur trois, délibérément.

Au premier tour de sa première run, le joueur découvre simultanément : quatre faces de dé,
une grille de 35 cases, une portée de Frappe à 1 **ou** 2, un pas gratuit, un plafond de
conservation, des intentions télégraphiées avec une ancre mobile, et une résolution
différée. C'est déjà six systèmes. Un septième — une règle qui ne vaut que pour ce
personnage — n'ajoute pas de la profondeur, il ajoute du bruit dans le seul moment de la vie
du joueur où tout ce qu'il voit est nouveau.

D16 l'annonce d'ailleurs comme une contrepartie assumée : « le personnage de départ doit
rester simple, il enseigne les dés ». Enseigner les dés et tordre les dés sont des tâches
opposées ; on ne peut pas confier les deux au même personnage.

Écarté : lui donner « conservation de 3 dés au lieu de 2 ». Le plafond de conservation est
**le premier curseur d'équilibrage du jeu** (`combat.md` § 15) ; le déplacer sur le
personnage que 100 % des joueurs jouent en premier reviendrait à ne jamais mesurer sa valeur
par défaut. Écarté aussi : « +1 dégât sur la première Frappe du tour ». C'est un bonus de
stat, et D16 dit explicitement que ces personnages ne sont pas des paquets de stats.

### Pourquoi sa signature s'accroche à Paire

`game-designer` le recommande (`combat.md` § 15) ; je le retiens, et je précise pourquoi.

La Paire est le **seul** combo qui se produit tout seul. Avec un pool homogène 3F/2G/1É et
trois dés dépensés, la probabilité d'avoir au moins deux faces identiques est de **5/6**.
Le joueur n'a rien à chercher : il pose ses dés normalement, le badge s'allume, il gagne du
Bouclier, il regarde pourquoi. La leçon arrive au tour 1 ou 2 de la toute première
rencontre, sans un mot de tutoriel — exactement comme le Rôdeur enseigne l'esquive
(`combat.md` § 9).

Les trois autres combos échoueraient à ce travail : l'Écho exige la consécutivité, le Trio
exige les trois dés de la même face (1/6 environ), la Suite exige un tirage précis **et**
un ordre précis (~3 %). Un combo qui ne se déclenche pas n'enseigne rien.

**Pourquoi du Bouclier et pas des dégâts.** Un `LE-DOUBLE` offensif fausserait le repère le
plus important du jeu : « deux Frappes tuent un Rôdeur » (`combat.md` § 9). Le mètre étalon
doit rester intact. Une récompense défensive est lisible (« je perds 2 PV de moins »), elle
ne touche pas au compte des morts, et sa valeur s'effondre naturellement à mesure que la run
avance — ce qui est la bonne forme pour un objet gratuit et permanent.

**Valeur :** 2 Bouclier × ~0,61 tour avec Paire = **+1,2 `RPT`**, soit **+13 %** de `P` au
tour 1 et **+2 %** au boss 3. C'est le seul objet du jeu dont la contribution passe de
« peu commune » à « nulle » au cours d'une run, et c'est voulu **[H]**.

---

## 4. Personnage 2 — `RELANCE` (torsion : le tirage)

> **Fantaisie :** « Mon tirage n'est pas une fatalité. J'en corrige un dé par tour. »

| | |
|---|---|
| **Pool de départ** | **8 dés** : 6 standards (3F/2G/1É) + **2 Ternes** (2 Frappe / 4 Garde / **0 Élan**) **[T]** |
| **Règle propre** | **La Relance** — une fois par tour, relancer un dé de la Main |
| **Relique signature** | `LA-FACE-INTERDITE` — « **Un dé que tu relances ne peut pas retomber sur la face qu'il montrait.** » |
| `P₀` | **≈ 4,8** **[H]** (`DPT` 2,75 avant relance · `RPT` 3,75) |
| **À comprendre au tour 1** | il y a un geste de plus, il ne sert **qu'une fois**, et il répare la Main |

### La règle propre, et ses garde-fous

Une relance, par tour, sur un dé de la Main, à n'importe quel moment de la phase de choix.
Elle respecte les trois règles de garde de D22, qui ne sont pas négociables :

- **plafonnée à 1 par tour**, et le compteur est affiché en permanence à côté de la Main ;
- **un seul geste**, sans confirmation — appui long sur le dé ;
- **une relance n'engendre jamais une relance.** Aucune relique, aucun événement ne peut
  rendre sa relance à ce personnage dans le même tour.

Coût en temps du tour : **+0,9 s** sur les tours où elle est utilisée **[H]**, dont 0,5 s
d'animation de lancer. Sur un budget de 8,0 s déjà tendu (`combat.md` § 14), c'est le
personnage à surveiller en priorité pour la durée de run. **Contrat : sa run médiane ne doit
pas dépasser celle de `SOCLE` de plus de 90 secondes.** Au-delà, on ne rééquilibre pas la
relance, on la rend gratuite en temps (relance instantanée, sans animation de lancer).

### Le pool sale, qui est le vrai personnage

Sa relance n'aurait aucun intérêt avec un bon pool : on ne répare que ce qui est cassé. Son
pool fait donc **8 dés dont 2 mauvais**, et il est mauvais de façon précise :

| | Frappe | Garde | Élan |
|---|---|---|---|
| Pool standard (6 dés) | 0,500 | 0,333 | 0,167 |
| Pool de `RELANCE` (8 dés) | **0,458** | **0,417** | **0,125** |

Moins de Frappe, moins d'Élan, trop de Garde. Il tire des mains molles. Et parce que son
pool fait 8 dés au lieu de 6, il **recycle moins souvent** : il voit moins bien ce qui lui
reste, ce qui est le vrai coût d'un gros pool et que le joueur ne découvre qu'en le jouant.

C'est la leçon centrale de ce personnage, et aucun autre ne l'enseigne : **grossir son pool
est un affaiblissement.** Le joueur qui l'a compris sur `RELANCE` regarde ensuite
l'opération *Fondre* de la Forge (`progression.md` § 4) avec des yeux différents.

### La signature

`LA-FACE-INTERDITE` supprime le pire résultat possible d'une relance : retomber sur la même
face. C'est un levier « faces », pas un bonus, et il rend la règle propre **fiable** au lieu
de la rendre plus grosse. Une relance qui peut ne rien changer est une décision qu'on hésite
à prendre ; une relance qui change toujours quelque chose est une décision qu'on prend
volontiers, ce qui est le but.

Conséquence sur le RNG (I1) : la relance consomme un tirage sur une distribution des
**5 faces restantes** du dé, et l'ordre de consommation du `rngCursor` est celui de la pose.

---

## 5. Personnage 3 — `GRAVURE` (torsion : les faces)

> **Fantaisie :** « Je renonce à un dé ce tour-ci pour qu'il devienne n'importe quoi au
> tour suivant. »

| | |
|---|---|
| **Pool de départ** | **6 dés** : 4 standards + **2 Bruts** (4 Frappe / 2 Garde / **0 Élan**) **[T]** |
| **Règle propre** | **La Gravure** — un dé que tu conserves **devient un Éclat** au tour suivant |
| **Relique signature** | `LA-MAIN-PATIENTE` — « **Quand tu conserves un dé, tu gagnes 1 Bouclier.** » |
| `P₀` | **≈ 4,6** **[H]** (`DPT` 3,33 · `RPT` 3,0, moins le coût de tempo de la Gravure) |
| **À comprendre au tour 1** | sa Main est pleine de Frappes ; pour obtenir autre chose, il doit **en conserver une** |

### La Gravure

Un dé conservé (D12, 2 au plus) ne garde pas sa face : au tirage suivant, il montre
**Éclat**. Il n'est pas relancé — il est gravé.

C'est la torsion la plus profonde des quatre, parce qu'elle s'attache à la **tension
centrale de la boucle de tour** : conserver, c'est renoncer à agir maintenant pour préparer
après, et c'est payé par le coup qu'on encaisse en attendant
(`docs/02-systemes-v0.md`, D12). `GRAVURE` ne change pas ce marché, il en **augmente les
deux côtés** : il renonce plus souvent, et il obtient beaucoup plus.

Et il est le seul personnage à voir des Éclats dès le tour 2. L'Éclat compte comme la face
choisie pour tous les combos (`combat.md` § 5) : c'est donc lui qui met le Trio et la Suite
à portée de main, et donc lui qui enseigne au joueur que les combos rares existent
réellement.

### Le pool rigide, qui rend la Gravure nécessaire

| | Frappe | Garde | Élan |
|---|---|---|---|
| Pool standard | 0,500 | 0,333 | 0,167 |
| Pool de `GRAVURE` | **0,556** | 0,333 | **0,111** |

Il frappe fort et il ne bouge pas. Un Élan tous les trois tours, contre un tous les deux
tours pour `SOCLE`. Devant un mur de corps (`combat.md` § 5, « Élan est la seule réponse de
base à un mur de corps »), il n'a qu'une solution : conserver une Frappe, la graver, et
dépenser l'Éclat en Élan au tour suivant.

C'est exactement la boucle qu'on veut lui faire jouer, et elle est **imposée par la
composition de son pool**, pas par un texte d'aide.

### La signature

`LA-MAIN-PATIENTE` paie le prix du tempo. Sans elle, `GRAVURE` renonce à une action pour
gagner de la flexibilité et encaisse le coup en pleine face ; avec elle, le renoncement
rapporte 1 Bouclier, ce qui rembourse environ un tiers d'une attaque d'acte 1. Elle ne rend
pas la Gravure plus forte, elle la rend **jouable au tour 1**, ce qui est le seul critère
qui compte pour une signature.

**Valeur :** ~1,3 conservation par tour × 1 Bouclier = **+1,3 `RPT`**, soit **+14 %** de
`P` au tour 1 **[H]**.

---

## 6. Personnage 4 — `LES-TROIS` (torsion : la composition du pool)

> **Fantaisie :** « Je n'ai que trois dés. Je les connais par cœur, et je les relance tous à
> chaque tour. »

| | |
|---|---|
| **Pool de départ** | **3 dés nommés et différents** (ci-dessous) **[T]** |
| **Règle propre** | **Le Pool scellé** — le pool contient exactement 3 dés, il ne peut ni grossir ni rétrécir. Tout effet qui ajouterait un dé **grave une face** sur un dé existant à la place |
| **Relique signature** | `LA-LIGNE` — « **Suite : 2 dégâts à une unité de ton choix.** » |
| `P₀` | **≈ 4,85** **[H]** (`DPT` 3,0 + signature · `RPT` 2,5) |
| **À comprendre au tour 1** | sa Main **est** son pool : il n'y a pas de tirage, seulement un lancer, et ses trois dés ne montrent pas les mêmes faces |

### Les trois dés

| Dé | Faces | Rôle |
|---|---|---|
| `ROUGE` | 5 Frappe · 1 Élan | il frappe presque toujours |
| `BLEU` | 4 Garde · 2 Frappe | il garde deux fois sur trois |
| `VERT` | 3 Élan · 2 Frappe · 1 Garde | il bouge une fois sur deux |

| | Frappe | Garde | Élan |
|---|---|---|---|
| Pool standard | 0,500 | 0,333 | 0,167 |
| Pool de `LES-TROIS` | 0,500 | **0,278** | **0,222** |

Puissance brute quasi identique à `SOCLE`, distribution complètement différente : plus
mobile, moins défensif. Mais surtout : **la variance de composition est nulle**. Chaque
tour, il a exactement `ROUGE`, `BLEU` et `VERT` en Main. Le seul aléatoire de son jeu est le
lancer.

C'est l'expérience de dés la plus éloignée des trois autres, et elle se voit au premier
regard : les autres tirent des dés interchangeables dans un sac, lui roule trois dés
qu'il connaît. Conserver, pour lui, ne veut plus dire « garder ce dé pour le tour
suivant » — les trois y seront de toute façon — mais **« ne relance pas celui-ci »**. La
règle de D12 est inchangée ; c'est son sens qui change, ce qui est la meilleure sorte de
torsion.

### Le Pool scellé

Aucune opération de Forge et aucune relique ne peut faire varier la taille de son pool.
*Battre*, *Décalquer* et *Fondre* (`progression.md` § 4) lui sont proposés sous une forme
convertie : **ils gravent une face** sur l'un des trois dés.

Conséquences, toutes voulues :
- Sa progression passe **entièrement par les faces**. Sur 18 faces, chaque gravure vaut
  5,6 % de son pool — contre 2,8 % pour un pool de 6 dés. **Chaque modification est deux
  fois plus lourde chez lui que chez n'importe qui d'autre.**
- *Éclater* (une face devient Éclat) est le meilleur achat du jeu pour lui, et il le voit
  tourner à chaque tour. Sur un pool de 8 dés, un Éclat est une rumeur ; sur le sien, c'est
  un outil.
- Il est **immunisé** aux reliques qui diluent le pool, et il **ne profite pas** de celles
  qui l'élargissent. `item-designer` doit vérifier qu'au moins un tiers du catalogue reste
  intéressant pour lui.

### La signature

`LA-LIGNE` s'accroche à la **Suite** — Frappe → Garde → Élan dans cet ordre, consécutifs
(D27). C'est le combo le plus dur du jeu, et c'est le seul personnage pour qui il est
naturel : `ROUGE` → `BLEU` → `VERT` est littéralement l'ordre de ses trois dés, et la
probabilité qu'ils montrent les bonnes faces simultanément est de
`5/6 × 4/6 × 3/6 ≈ 0,28` **[H]** — contre ~3 % pour un pool standard.

Il apprend donc au joueur deux choses que personne d'autre n'apprend :
**l'ordre des dépenses est une décision**, et **la Suite existe pour de vrai**.

---

## 7. Équilibre entre personnages

Un déblocage ne doit jamais donner de la puissance (D3). Cela vaut aussi pour les
personnages : `LES-TROIS`, débloqué en dernier, ne doit pas être le plus fort.

> **Contrat, à vérifier par `balance-simulator` à difficulté de référence :**
> - `P₀` de chaque personnage, relique signature comprise : **∈ [4,3 ; 4,9]**
> - taux de victoire de chaque personnage : **entre 35 % et 65 %**, la même bande que les
>   archétypes de build (`docs/03-content-budget.md`)
> - `P` au boss 3 ÷ `P` au premier tour : **∈ [2,8 ; 3,2]** pour chacun des quatre

Les compositions de pool des § 4 à 6 sont marquées **[T]** parce que ce sont elles, et pas
les règles propres, qu'on corrige si un personnage sort de la bande. Une règle propre est
une identité ; une face de dé est un chiffre.

**Signal d'alerte spécifique :** si deux personnages convergent vers les mêmes archétypes de
build en fin de run, l'identité ne tient que jusqu'à la troisième relique et le travail est
raté. Mesure : distribution des archétypes atteints au boss 3, par personnage. On veut au
moins un archétype dominant différent par personnage.

---

## 8. Les reliques signatures circulent, les règles propres non — point A11

> **Tranché : une relique signature entre au catalogue commun dès que son personnage est
> débloqué. Une règle propre n'est jamais accessible à un autre personnage.**

C'est la recommandation du concept (`docs/00-concept.md`), et elle se défend mieux encore
une fois les personnages écrits.

**Pourquoi les reliques circulent.** `LA-MAIN-PATIENTE` (« conserver donne 1 Bouclier »)
entre les mains de `LES-TROIS`, chez qui conserver veut dire « ne relance pas celui-ci »,
n'est pas la même carte du tout. C'est exactement le moment de synergie inattendue que le
pilier « builds absurdes » recherche, et il ne coûte rien à produire : quatre reliques déjà
écrites, quatre lectures nouvelles.

Bénéfice de méta-progression, et c'est le vrai argument : **débloquer un personnage
enrichit aussi les trois autres.** Un joueur qui débloque `GRAVURE` et n'aime pas le jouer
n'a pas perdu son déblocage — son `SOCLE` a gagné une carte.

**Pourquoi les règles propres ne circulent pas.** Une règle propre est ce qui reste quand on
a tout enlevé. Si `SOCLE` peut trouver une relique « une relance par tour », `RELANCE`
n'existe plus : il devient « `SOCLE` avec un pool moins bon ». Les règles propres ne sont
pas des objets, elles ne sont pas dans le catalogue, et aucun événement ne peut les accorder.

**Garde-fou à faire respecter par `item-designer` :** aucune relique du catalogue commun ne
doit reproduire une règle propre, même partiellement. En particulier — **aucune relique
n'accorde une relance de dé sans condition** ; une relance liée à un déclenchement précis
(« quand tu tues une unité, relance un dé ») reste permise, parce qu'elle n'est pas la même
promesse.

---

## 9. Ce que je laisse ouvert, et pour qui

- **`game-designer`** : rien de ce qui précède ne modifie une règle de combat. Un point à
  valider tout de même — la conversion « ajouter un dé → graver une face » du Pool scellé
  (§ 6) doit exister comme opération du moteur.
- **`item-designer`** : les quatre reliques signatures ci-dessus sont les **seules** que
  j'écris ; elles entrent au catalogue commun avec la rareté « peu commune ». Le garde-fou
  du § 8 (aucune relique ne duplique une règle propre, aucune relance inconditionnelle). Et
  la vérification qu'au moins un tiers du catalogue reste utile à `LES-TROIS`.
- **`lore-keeper`** : les quatre noms de personnages, les quatre noms de reliques
  signatures, les noms des dés `ROUGE` / `BLEU` / `VERT` et des dés `Terne` / `Brut`. Les
  noms de code n'apparaissent jamais devant le joueur.
- **`balance-simulator`** : les trois contrats du § 7, et le temps de tour de `RELANCE`
  (§ 4), qui est le seul risque de dérive du budget de 12 minutes identifié dans ce document.
- **`mobile-ux`** : le geste de relance de `RELANCE` (appui long sur un dé, un seul geste,
  compteur visible) et l'affichage d'un pool de 3 dés nommés pour `LES-TROIS`, qui n'est pas
  le même écran qu'un pool de 8 dés anonymes.
