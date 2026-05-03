import { Scrambow } from 'scrambow';

const scrambler = new Scrambow();

const mapIdToScrambow = (id: string): string => {
  switch (id) {
    case '2x2': return '222';
    case '3x3': 
    case '3x3oh':
    case '3x3bld':
    case 'mirror-3x3':
      return '333';
    case '4x4': return '444';
    case '5x5': return '555';
    case '6x6': return '666';
    case '7x7': return '777';
    case 'pyraminx': return 'pyram';
    case 'megaminx': return 'mega';
    case 'skewb': return 'skewb';
    case 'square-1': return 'sq1';
    case 'clock': return 'clock';
    default: return '333';
  }
};

export const generateScramble = (cubeType: string): string => {
  try {
    const type = mapIdToScrambow(cubeType);
    const result = scrambler.setType(type).get(1);
    return result[0].scramble_string;
  } catch (error) {
    console.error('Error generating scramble:', error);
    return 'R U R\' U\''; // Fallback
  }
};
