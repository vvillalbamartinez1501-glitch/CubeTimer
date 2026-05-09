export interface NotationMove {
  id: string;
  name: string;
  imagePath: string;
}

export const notationData: Record<string, NotationMove[]> = {
  "2x2": [
    { id: "L", name: "Izquierda", imagePath: "notation.2x2.L" },
    { id: "F", name: "Frontal", imagePath: "notation.2x2.F" },
    { id: "R", name: "Derecha", imagePath: "notation.2x2.R" },
    { id: "B", name: "Detrás", imagePath: "notation.2x2.B" },
    { id: "U", name: "Superior", imagePath: "notation.2x2.U" },
    { id: "D", name: "Inferior", imagePath: "notation.2x2.D" },
    { id: "L'", name: "Izquierda Anti", imagePath: "notation.2x2.L'" },
    { id: "F'", name: "Frontal Anti", imagePath: "notation.2x2.F'" },
    { id: "R'", name: "Derecha Anti", imagePath: "notation.2x2.R'" },
    { id: "B'", name: "Detrás Anti", imagePath: "notation.2x2.B'" },
    { id: "U'", name: "Superior Anti", imagePath: "notation.2x2.U'" },
    { id: "D'", name: "Inferior Anti", imagePath: "notation.2x2.D'" },
    { id: "L2", name: "Izquierda Doble", imagePath: "notation.2x2.L2" },
    { id: "U2", name: "Superior Doble", imagePath: "notation.2x2.U2" },
    { id: "D2", name: "Inferior Doble", imagePath: "notation.2x2.D2" },
  ],
  "3x3": [
    { id: "R", name: "Right", imagePath: "notation.3x3.R" },
    { id: "U", name: "Up", imagePath: "notation.3x3.U" },
    { id: "L", name: "Left", imagePath: "notation.3x3.L" },
    { id: "F", name: "Front", imagePath: "notation.3x3.F" },
    { id: "D", name: "Down", imagePath: "notation.3x3.D" },
    { id: "B", name: "Back", imagePath: "notation.3x3.B" },
  ],
  "4x4": [
    { id: "R", name: "Right", imagePath: "notation.4x4.R" },
    { id: "Rw", name: "Right Wide", imagePath: "notation.4x4.Rw" },
    { id: "Uw", name: "Up Wide", imagePath: "notation.4x4.Uw" },
    { id: "Lw", name: "Left Wide", imagePath: "notation.4x4.Lw" },
    { id: "Fw", name: "Front Wide", imagePath: "notation.4x4.Fw" },
  ]
};
