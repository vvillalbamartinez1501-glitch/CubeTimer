export interface ResolutionCase {
  id: string;
  name: string;
  algorithm?: string;
  imagePath: string;
}

export const res3x3Data: Record<string, ResolutionCase[]> = {
  beginner: [
    { id: "cross", name: "Cruz Blanca", imagePath: "resolution.3x3.beginner.cross" },
    { id: "corners", name: "Esquinas 1ra Capa", imagePath: "resolution.3x3.beginner.corners" },
  ],
  reduced_fridrich: [
    { id: "oll_cross", name: "OLL Cruz", imagePath: "resolution.3x3.reduced_fridrich.oll_cross" },
    { id: "pll_corners", name: "PLL Esquinas", imagePath: "resolution.3x3.reduced_fridrich.pll_corners" },
  ],
  full_fridrich: [
    { id: "f2l1", name: "F2L Caso 1", imagePath: "resolution.3x3.full_fridrich.f2l1" },
    { id: "oll1", name: "OLL 1", imagePath: "resolution.3x3.full_fridrich.oll1" },
    { id: "pll_aa", name: "PLL Aa", imagePath: "resolution.3x3.full_fridrich.pll_aa" },
  ]
};
