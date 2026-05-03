export interface Category {
  id: string;
  name: string;
  group: string;
}

export const CATEGORIES: Category[] = [
  // NxN
  { id: '2x2', name: '2x2', group: 'NxN' },
  { id: '3x3', name: '3x3', group: 'NxN' },
  { id: '4x4', name: '4x4', group: 'NxN' },
  { id: '5x5', name: '5x5', group: 'NxN' },
  { id: '6x6', name: '6x6', group: 'NxN' },
  { id: '7x7', name: '7x7', group: 'NxN' },
  
  // WCA Oficiales
  { id: '3x3oh', name: '3x3 OH', group: 'WCA Oficiales' },
  { id: '3x3bld', name: '3x3 BLD', group: 'WCA Oficiales' },
  { id: 'megaminx', name: 'Megaminx', group: 'WCA Oficiales' },
  { id: 'pyraminx', name: 'Pyraminx', group: 'WCA Oficiales' },
  { id: 'skewb', name: 'Skewb', group: 'WCA Oficiales' },
  { id: 'square-1', name: 'Square-1', group: 'WCA Oficiales' },
  { id: 'clock', name: 'Clock', group: 'WCA Oficiales' },

  // Variantes
  { id: 'mirror-3x3', name: 'Mirror 3x3', group: 'Variantes' },
  { id: 'ghost', name: 'Ghost Cube', group: 'Variantes' },

  // Especial
  { id: 'custom', name: 'Personalizado', group: 'Especial' },
];
