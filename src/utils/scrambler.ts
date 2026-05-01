const MOVES_3X3 = ['U', 'D', 'R', 'L', 'F', 'B'];
const MOVES_4X4 = [...MOVES_3X3, 'Uw', 'Dw', 'Rw', 'Lw', 'Fw', 'Bw'];
const MODIFIERS = ['', "'", '2'];

export const generateScramble = (cubeType: '3x3' | '4x4'): string => {
  const moves = cubeType === '3x3' ? MOVES_3X3 : MOVES_4X4;
  const length = cubeType === '3x3' ? 20 : 40;
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
      
      // Avoid consecutive same-axis moves (e.g., R R')
      if (lastAxis !== axis) {
        if (scramble.length > 1) {
          const secondLastMove = scramble[scramble.length - 2];
          const secondLastAxis = secondLastMove.charAt(0);
          
          const isOpposite = (a: string, b: string) => {
            return (a === 'U' && b === 'D') || (a === 'D' && b === 'U') ||
                   (a === 'R' && b === 'L') || (a === 'L' && b === 'R') ||
                   (a === 'F' && b === 'B') || (a === 'B' && b === 'F');
          };
          
          // Avoid sequences like R L R where the axis repeats surrounding its opposite
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
