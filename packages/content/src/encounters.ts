import type { Encounter } from "@rl/core";

/**
 * Les placements sont écrits à la main, jamais générés (docs/design/run.md § 4) : une
 * rencontre télégraphiée est un petit problème posé, un placement aléatoire produit du bruit.
 * Le joueur démarre en (3, 5) ; les ennemis occupent les rangées 1 à 3.
 */

/** Acte 1 — les cinq compositions de `combat.md` § 9. */
export const ACT1_ENCOUNTERS: Encounter[] = [
  {
    id: "a1-esquiver",
    units: [
      { typeId: "prowler", cell: { x: 2, y: 3 } },
      { typeId: "prowler", cell: { x: 4, y: 3 } },
    ],
  },
  {
    id: "a1-casser-la-ligne",
    units: [
      { typeId: "prowler", cell: { x: 3, y: 3 } },
      { typeId: "watcher", cell: { x: 3, y: 1 } },
    ],
  },
  {
    id: "a1-priorites",
    units: [
      { typeId: "prowler", cell: { x: 2, y: 3 } },
      { typeId: "prowler", cell: { x: 4, y: 3 } },
      { typeId: "watcher", cell: { x: 3, y: 1 } },
    ],
  },
  {
    id: "a1-corps-et-tireur",
    units: [
      { typeId: "ram", cell: { x: 3, y: 3 } },
      { typeId: "watcher", cell: { x: 1, y: 2 } },
    ],
  },
  {
    id: "a1-tout-a-la-fois",
    units: [
      { typeId: "prowler", cell: { x: 2, y: 2 } },
      { typeId: "watcher", cell: { x: 4, y: 1 } },
      { typeId: "ram", cell: { x: 3, y: 3 } },
    ],
  },
];

/**
 * PLACEHOLDER — actes 2 et 3, élites et boss.
 *
 * Ces compositions ne sont PAS du design : elles réutilisent les trois ennemis de l'acte 1 en
 * groupes plus gros, uniquement pour que le moteur et le simulateur puissent exécuter une run
 * entière dès M1. Le vrai catalogue (18 ennemis, 3 élites, 3 boss) appartient à
 * `game-designer` et `progression-designer`, et remplacera intégralement ce fichier au jalon M4.
 * Aucun chiffre d'équilibrage ne doit être tiré de ces rencontres.
 */
export const PLACEHOLDER_ENCOUNTERS: Encounter[] = [
  {
    id: "placeholder-groupe",
    units: [
      { typeId: "ram", cell: { x: 2, y: 2 } },
      { typeId: "ram", cell: { x: 4, y: 2 } },
      { typeId: "watcher", cell: { x: 3, y: 1 } },
    ],
  },
  {
    id: "placeholder-meute",
    units: [
      { typeId: "prowler", cell: { x: 1, y: 3 } },
      { typeId: "prowler", cell: { x: 5, y: 3 } },
      { typeId: "prowler", cell: { x: 3, y: 2 } },
      { typeId: "watcher", cell: { x: 2, y: 1 } },
    ],
  },
  {
    id: "placeholder-mur",
    units: [
      { typeId: "ram", cell: { x: 3, y: 3 } },
      { typeId: "ram", cell: { x: 2, y: 2 } },
      { typeId: "watcher", cell: { x: 4, y: 1 } },
      { typeId: "watcher", cell: { x: 1, y: 1 } },
    ],
  },
  {
    id: "placeholder-tenaille",
    units: [
      { typeId: "watcher", cell: { x: 1, y: 2 } },
      { typeId: "watcher", cell: { x: 5, y: 2 } },
      { typeId: "prowler", cell: { x: 3, y: 3 } },
      { typeId: "ram", cell: { x: 3, y: 1 } },
    ],
  },
];

export const PLACEHOLDER_BOSS: Encounter = {
  id: "placeholder-boss",
  units: [
    { typeId: "ram", cell: { x: 3, y: 2 } },
    { typeId: "ram", cell: { x: 2, y: 3 } },
    { typeId: "ram", cell: { x: 4, y: 3 } },
    { typeId: "watcher", cell: { x: 1, y: 1 } },
    { typeId: "watcher", cell: { x: 5, y: 1 } },
  ],
};
