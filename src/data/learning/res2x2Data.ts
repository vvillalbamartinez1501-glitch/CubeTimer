export interface ResolutionCase {
  id: string;
  name: string;
  algorithm?: string;
  imagePath: string;
}

export const res2x2Data: Record<string, ResolutionCase[]> = {
  basic: [
    { id: "oll1", name: "Sune", algorithm: "R U R' U R U2 R'", imagePath: "resolution.2x2.basic.oll1" },
    { id: "oll2", name: "Anti-Sune", algorithm: "R U2 R' U' R U' R'", imagePath: "resolution.2x2.basic.oll2" },
  ],
  advanced: [
    { id: "cll1", name: "CLL Case 1", algorithm: "R U R' U R U2 R'", imagePath: "resolution.2x2.advanced.cll1" },
  ]
};
