export interface CFOPCase {
  id: string;
  name: string;
  algorithm: string;
  group: string;
  imagePlaceholder: string;
}

export const f2lCases: CFOPCase[] = [
  {
    id: 'f2l-1',
    name: 'Arista y esquina separadas 1',
    algorithm: "R U R'",
    group: 'Piezas en la capa superior',
    imagePlaceholder: 'f2l_1',
  },
  {
    id: 'f2l-2',
    name: 'Arista y esquina separadas 2',
    algorithm: "y' U' R' U R",
    group: 'Piezas en la capa superior',
    imagePlaceholder: 'f2l_2',
  },
  {
    id: 'f2l-3',
    name: 'Esquina en la base, arista arriba',
    algorithm: "U' R U R' U2 R U' R'",
    group: 'Esquina en la base',
    imagePlaceholder: 'f2l_3',
  },
];

export const ollCases: CFOPCase[] = [
  {
    id: 'oll-21',
    name: 'OLL 21 - Sune',
    algorithm: "R U R' U R U2 R'",
    group: 'Forma de Cruz',
    imagePlaceholder: 'oll_21',
  },
  {
    id: 'oll-22',
    name: 'OLL 22 - Pi',
    algorithm: "R U2' R2' U' R2 U' R2' U2' R",
    group: 'Forma de Cruz',
    imagePlaceholder: 'oll_22',
  },
  {
    id: 'oll-1',
    name: 'OLL 1 - Runway',
    algorithm: "R U2' R2' F R F' U2' R' F R F'",
    group: 'Forma de Punto',
    imagePlaceholder: 'oll_1',
  },
];

export const pllCases: CFOPCase[] = [
  {
    id: 'pll-ua',
    name: 'Ua-Perm',
    algorithm: "M2 U M U2 M' U M2",
    group: 'Solo Aristas',
    imagePlaceholder: 'pll_ua',
  },
  {
    id: 'pll-ub',
    name: 'Ub-Perm',
    algorithm: "M2 U' M U2 M' U' M2",
    group: 'Solo Aristas',
    imagePlaceholder: 'pll_ub',
  },
  {
    id: 'pll-aa',
    name: 'Aa-Perm',
    algorithm: "x L2 D2 L' U' L D2 L' U L'",
    group: 'Solo Esquinas',
    imagePlaceholder: 'pll_aa',
  },
];
