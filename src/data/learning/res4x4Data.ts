export interface ResolutionCase {
  id: string;
  name: string;
  algorithm?: string;
  imagePath: string;
}

export const res4x4Data: Record<string, ResolutionCase[]> = {
  yau: [
    { id: "centers", name: "Primeros 2 Centros", imagePath: "resolution.4x4.yau.centers" },
    { id: "cross", name: "Cruz (3 aristas)", imagePath: "resolution.4x4.yau.cross" },
  ]
};
