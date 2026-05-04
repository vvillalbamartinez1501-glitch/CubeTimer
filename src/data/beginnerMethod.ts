export interface BeginnerStep {
  id: string;
  title: string;
  description: string;
  algorithms?: string[];
  imagePlaceholder: string;
}

export const beginnerSteps: BeginnerStep[] = [
  {
    id: 'step-1',
    title: 'La Cruz Blanca',
    description: 'Encuentra el centro blanco y coloca las 4 aristas blancas a su alrededor, coincidiendo con los colores laterales.',
    algorithms: [],
    imagePlaceholder: 'cube-outline',
  },
  {
    id: 'step-2',
    title: 'Esquinas Blancas (Primera Capa)',
    description: 'Coloca las esquinas que tienen blanco en la capa inferior.',
    algorithms: ["R U R' U'"],
    imagePlaceholder: 'cube-outline',
  },
  {
    id: 'step-3',
    title: 'Segunda Capa (Aristas medias)',
    description: 'Busca aristas en la capa superior sin amarillo y colócalas en el medio.',
    algorithms: ["U R U' R' U' F' U F", "U' L' U L U F U' F'"],
    imagePlaceholder: 'cube-outline',
  },
  {
    id: 'step-4',
    title: 'La Cruz Amarilla',
    description: 'Haz una cruz en la cara superior amarilla.',
    algorithms: ["F R U R' U' F'"],
    imagePlaceholder: 'cube-outline',
  },
  {
    id: 'step-5',
    title: 'Orientar Aristas Amarillas',
    description: 'Haz que los lados de la cruz amarilla coincidan con los centros laterales.',
    algorithms: ["R U R' U R U2 R'"],
    imagePlaceholder: 'cube-outline',
  },
  {
    id: 'step-6',
    title: 'Posicionar Esquinas Amarillas',
    description: 'Pon cada esquina en su sitio correcto, sin importar si el amarillo mira hacia arriba.',
    algorithms: ["U R U' L' U R' U' L"],
    imagePlaceholder: 'cube-outline',
  },
  {
    id: 'step-7',
    title: 'Orientar Esquinas (Paso Final)',
    description: 'Gira las esquinas para que el amarillo quede arriba. Cuidado, el cubo parecerá desarmarse.',
    algorithms: ["R' D' R D"],
    imagePlaceholder: 'cube-outline',
  }
];
