const MOVES_3X3 = ['U', 'D', 'R', 'L', 'F', 'B'];
const MOVES_4X4 = [...MOVES_3X3, 'Uw', 'Dw', 'Rw', 'Lw', 'Fw', 'Bw'];
const MOVES_2X2 = ['U', 'R', 'F'];
const MODIFIERS = ['', "'", '2'];

export const generateScramble = (cubeType: string): string => {
  let moves = MOVES_3X3;
  let length = 20;

  if (cubeType === '2x2') {
    moves = MOVES_2X2;
    length = 10;
  } else if (cubeType === '4x4') {
    moves = MOVES_4X4;
    length = 40;
  } else if (cubeType.includes('x') && cubeType.length === 3) { 
    // Para cubos grandes NxN usamos movimientos de 4x4 simplificados por ahora
    moves = MOVES_4X4; 
    length = parseInt(cubeType[0]) * 10;
  } else if (cubeType === 'pyraminx') {
    moves = ['U', 'R', 'L', 'B'];
    length = 10;
  } else if (cubeType === 'megaminx') {
    moves = MOVES_3X3;
    length = 40;
  } else if (cubeType === 'generic') {
    moves = MOVES_3X3;
    // Longitud aleatoria entre 20 y 30
    length = Math.floor(Math.random() * 11) + 20;
  }  else if (cubeType === '3x3') {
    moves = MOVES_3X3;
    length = 20;
  } 

  let scramble: string[] = [];

  for (let i = 0; i < length; i++) {
    let move: string = '';
    let axis: string = '';
    
    // Find a valid move
    while (true) {
      move = moves[Math.floor(Math.random() * moves.length)];
      axis = move.charAt(0);
      
      const lastMove = scramble.length > 0 ? scramble[scramble.length - 1] : null;
      const lastAxis = lastMove ? lastMove.charAt(0) : null;
      
      // Avoid consecutive same-axis moves
      if (lastAxis !== axis) {
        if (scramble.length > 1) {
          const secondLastMove = scramble[scramble.length - 2];
          const secondLastAxis = secondLastMove.charAt(0);
          
          const isOpposite = (a: string, b: string) => {
            return (a === 'U' && b === 'D') || (a === 'D' && b === 'U') ||
                   (a === 'R' && b === 'L') || (a === 'L' && b === 'R') ||
                   (a === 'F' && b === 'B') || (a === 'B' && b === 'F');
          };
          
          if (isOpposite(axis, lastAxis as string) && axis === secondLastAxis) {
             continue; 
          }
        }
        break; // Valid move found
      }
    }
    
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    scramble.push(move + modifier);
  }
  
  return scramble.join(' ');
};
