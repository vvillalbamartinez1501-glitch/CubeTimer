// ==============================
// TUTORIALES BÁSICOS
// ==============================
export interface TutorialStep {
  step: number;
  title: string;
  description: string;
}

export const basicTutorials: Record<string, TutorialStep[]> = {
  '3x3': [
    { step: 1, title: 'Cruz Blanca (White Cross)', description: 'Forma una cruz en la cara blanca alineando los bordes con los centros de las caras adyacentes. Empieza buscando las piezas de borde blanco y colócalas una a una. Asegúrate de que el color lateral de cada borde coincida con el centro de esa cara.' },
    { step: 2, title: 'Esquinas de la Primera Capa', description: 'Coloca las 4 esquinas blancas en su posición correcta. Busca una esquina blanca en la capa inferior, colócala debajo de su posición objetivo y aplica el algoritmo: R U R\' U\' (repite hasta que encaje). Si la esquina está atrapada arriba, sácala primero con R U R\'.' },
    { step: 3, title: 'Segunda Capa (F2L Básico)', description: 'Inserta los bordes de la segunda capa. Encuentra un borde sin amarillo en la capa superior. Si debe ir a la derecha: U R U\' R\' U\' F\' U F. Si debe ir a la izquierda: U\' L\' U L U F U\' F\'. Repite para los 4 bordes.' },
    { step: 4, title: 'Cruz Amarilla (OLL parcial)', description: 'Forma una cruz en la cara amarilla (no importa el orden de los colores laterales). Algoritmo clave: F R U R\' U\' F\'. Dependiendo del patrón inicial (punto, L, línea), aplícalo 1, 2 o 3 veces con la orientación correcta.' },
    { step: 5, title: 'Orientar Esquinas Amarillas', description: 'Orienta las esquinas amarillas para completar la cara amarilla. Usa: R U R\' U R U2 R\'. Coloca las esquinas no orientadas en la posición frontal-derecha y repite. Puede requerir varias aplicaciones.' },
    { step: 6, title: 'Permutar Esquinas (PLL parcial)', description: 'Coloca las esquinas en su posición correcta (sin importar la orientación). Busca dos esquinas adyacentes que ya estén bien. Colócalas a la izquierda y aplica: U R U\' L\' U R\' U\' L. Si ninguna está bien, aplica el algoritmo una vez desde cualquier ángulo.' },
    { step: 7, title: 'Permutar Bordes Finales', description: 'Último paso: coloca los bordes de la última capa. Si necesitas ciclar 3 bordes en sentido horario: R U\' R U R U R U\' R\' U\' R2. En sentido antihorario: R2 U R U R\' U\' R\' U\' R\' U R\'. ¡Cubo resuelto!' },
  ],
  '2x2': [
    { step: 1, title: 'Primera Cara', description: 'Elige un color (normalmente blanco) y resuelve una cara completa. Como no hay centros ni bordes, solo necesitas colocar 4 esquinas. Usa la intuición: coloca piezas una a una girando las caras hasta que encajen. El truco es asegurarte de que los colores laterales también coincidan entre sí.' },
    { step: 2, title: 'Orientar Última Capa (OLL)', description: 'Orienta las piezas de la última capa para que todas muestren el mismo color arriba. Algoritmos clave — "Sune": R U R\' U R U2 R\'. "Antisune": R U2 R\' U\' R U\' R\'. Identifica el patrón (1 esquina, 2 esquinas adyacentes, 2 opuestas, o ninguna orientada) y aplica el algoritmo correspondiente.' },
    { step: 3, title: 'Permutar Última Capa (PLL)', description: 'Intercambia las esquinas de la última capa para resolver el cubo. Solo hay dos casos posibles: Adyacente (intercambiar 2 esquinas vecinas): R U\' R F2 R\' U R\'. Diagonal (intercambiar 2 esquinas opuestas): F R U\' R\' U\' R U R\' F\' R U R\' U\' R\' F R F\'. ¡El 2x2 está resuelto!' },
  ],
  '4x4+': [
    { step: 1, title: 'Centros', description: 'Resuelve los 6 centros (bloques de 2x2 en el 4x4). Empieza con blanco, luego amarillo (opuesto), y después los 4 laterales. Usa movimientos de capas internas (r, l) para mover piezas de centro sin destruir los centros ya resueltos. Recuerda: los colores opuestos son fijos (blanco-amarillo, rojo-naranja, azul-verde).' },
    { step: 2, title: 'Emparejamiento de Bordes', description: 'Empareja las dos mitades de cada borde para que funcionen como un solo borde de 3x3. Técnica "Slice-Flip-Slice": coloca dos mitades compatibles en las posiciones Front-Right y Back-Right, haz un corte interno (r), alinea, y deshaz (r\'). Repite para los 12 bordes.' },
    { step: 3, title: 'Resolver como 3x3', description: 'Una vez centros y bordes están resueltos, el 4x4 se comporta como un 3x3 grande. Aplica tu método favorito de 3x3. ¡Cuidado con las paridades! OLL Parity: r U2 x r U2 r U2 r\' U2 l U2 r\' U2 r U2 r\' U2 r\'. PLL Parity: 2R2 U2 2R2 Uw2 2R2 Uw2.' },
  ],
  'Megaminx': [
    { step: 1, title: 'Primera Cara (Estrella)', description: 'Resuelve la primera cara del Megaminx (usualmente blanca). Es similar al 3x3 pero con 5 bordes formando una estrella. Coloca los bordes primero formando la estrella, luego inserta las 5 esquinas. La intuición del 3x3 aplica aquí, solo que con pentágonos en vez de cuadrados.' },
    { step: 2, title: 'Primeras 5 Caras Laterales', description: 'Resuelve las 5 caras que rodean la cara inicial, trabajando capa por capa. Para cada cara lateral: primero coloca el borde inferior, luego las dos esquinas inferiores, luego los dos bordes laterales. Usa F2L adaptado. Trabaja una cara a la vez, rotando el Megaminx.' },
    { step: 3, title: 'Segunda Banda de Caras', description: 'Resuelve las siguientes 5 caras (la "banda del ecuador"). Este paso es más intuitivo y requiere movimientos de inserción similares a F2L. Coloca bordes y esquinas capa por capa. Si una pieza está atrapada, sácala con R U R\' y reinsértala.' },
    { step: 4, title: 'Última Cara', description: 'Resuelve la última cara usando algoritmos adaptados del 3x3. Forma la estrella (cruz): R U R\' U\' F\' adaptado. Orienta esquinas: Sune adaptado. Permuta bordes y esquinas. Los algoritmos son los mismos del 3x3 pero aplicados en un contexto pentagonal. Puede requerir más repeticiones.' },
  ],
};

// ==============================
// CFOP - ALGORITMOS
// ==============================
export interface AlgorithmCase {
  name: string;
  algorithm: string;
  description?: string;
}

export const cfopAlgs: Record<string, AlgorithmCase[]> = {
  'Cross': [
    { name: 'Cruz en 8 movimientos', algorithm: '—', description: 'La cruz no tiene algoritmos fijos. Practica planificar la cruz completa durante la inspección de 15 segundos. Objetivo: resolver la cruz en 8 movimientos o menos, idealmente sin mirar el cubo.' },
    { name: 'Cruz Eficiente', algorithm: '—', description: 'Tip: No resuelvas los bordes de uno en uno. Busca maneras de insertar 2 bordes simultáneamente. Practica en color neutro (empezando por cualquier color) para tener más opciones.' },
    { name: 'X-Cross', algorithm: '—', description: 'Técnica avanzada: resolver la cruz + un par F2L durante la inspección. Añade complejidad a la planificación pero ahorra mucho tiempo. Solo para cubers sub-15 segundos.' },
  ],
  'F2L': [
    { name: 'Caso Básico (Ambos arriba)', algorithm: 'U R U\' R\'', description: 'La esquina y el borde están en la capa superior. Alinea la esquina sobre su ranura y el borde se inserta naturalmente.' },
    { name: 'Caso Inverso', algorithm: 'U\' F\' U F', description: 'Similar al básico pero insertando desde el lado izquierdo. Útil cuando el par está mejor posicionado a la izquierda.' },
    { name: 'Esquina en ranura, borde arriba', algorithm: 'U R U\' R\' U\' F\' U F', description: 'Saca la esquina, empareja con el borde, y reinserta el par completo.' },
    { name: 'Par conectado (mismo color visible)', algorithm: 'R U R\'', description: 'Cuando la esquina y el borde ya están conectados correctamente arriba. Inserción directa de 3 movimientos.' },
    { name: 'Par invertido', algorithm: 'R U2 R\' U\' R U R\'', description: 'El par está conectado pero con orientación incorrecta. Separa, reorienta y reinserta.' },
  ],
  'OLL': [
    { name: 'OLL 21 - Cruz + Esquinas Opuestas', algorithm: 'R U2 R\' U\' R U R\' U\' R U\' R\'', description: 'Forma: Cruz amarilla hecha, dos esquinas opuestas orientadas.' },
    { name: 'OLL 22 - Cruz + Una Esquina', algorithm: 'R U2 R2 U\' R2 U\' R2 U2 R', description: 'Forma: Cruz amarilla hecha, solo una esquina orientada.' },
    { name: 'OLL 26 - Sune', algorithm: 'R U R\' U R U2 R\'', description: 'Uno de los casos más comunes y fundamentales. Cruz hecha, una esquina orientada con amarillo apuntando al frente.' },
    { name: 'OLL 27 - Antisune', algorithm: 'R U2 R\' U\' R U\' R\'', description: 'Espejo del Sune. Una esquina orientada con amarillo apuntando a la derecha.' },
    { name: 'OLL 45 - Línea', algorithm: 'F R U R\' U\' F\'', description: 'Caso "línea horizontal". Forma la cruz amarilla desde una línea. Uno de los primeros OLL que se aprende.' },
    { name: 'OLL 44 - Punto Completo', algorithm: 'F U R U\' R\' F\' + F R U R\' U\' F\'', description: 'Cuando solo hay un punto amarillo (sin línea ni L). Combina dos algoritmos simples.' },
  ],
  'PLL': [
    { name: 'Permutación T', algorithm: 'R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'', description: 'Intercambia dos esquinas y dos bordes adyacentes. Uno de los PLL más comunes y rápidos de ejecutar.' },
    { name: 'Permutación Y', algorithm: 'F R U\' R\' U\' R U R\' F\' R U R\' U\' R\' F R F\'', description: 'Intercambia dos esquinas diagonales y dos bordes adyacentes. Caso diagonal, fácil de reconocer.' },
    { name: 'Permutación Ua (Ciclo horario)', algorithm: 'R U\' R U R U R U\' R\' U\' R2', description: 'Cicla 3 bordes en sentido horario. Las esquinas están resueltas, solo se mueven bordes.' },
    { name: 'Permutación Ub (Ciclo antihorario)', algorithm: 'R2 U R U R\' U\' R\' U\' R\' U R\'', description: 'Cicla 3 bordes en sentido antihorario. Espejo del Ua.' },
    { name: 'Permutación H', algorithm: 'M2 U M2 U2 M2 U M2', description: 'Intercambia bordes opuestos en ambos ejes. Muy fácil de reconocer: patrón de tablero de ajedrez en los bordes.' },
    { name: 'Permutación Z', algorithm: 'M2 U M2 U M\' U2 M2 U2 M\' U2', description: 'Intercambia dos pares de bordes adyacentes. Similar al H pero con bordes adyacentes.' },
  ],
};

// ==============================
// GUÍA DE MÉTODOS
// ==============================
export interface MethodInfo {
  name: string;
  difficulty: string;
  avgMoves: string;
  description: string;
  pros: string[];
  cons: string[];
}

export const methodsGuide: MethodInfo[] = [
  {
    name: 'Principiante (Capa por Capa)',
    difficulty: '⭐ Fácil',
    avgMoves: '~100-120',
    description: 'El método más intuitivo. Resuelve el cubo capa por capa: primero la cara blanca con su primera capa, luego la segunda capa insertando bordes, y finalmente la última capa en varios pasos (cruz, orientar esquinas, permutar esquinas, permutar bordes). Solo requiere ~6 algoritmos.',
    pros: ['Muy fácil de aprender', 'Pocos algoritmos (5-7)', 'Base para entender métodos avanzados'],
    cons: ['Muchos movimientos por solve', 'Difícil bajar de 1 minuto', 'Poca eficiencia'],
  },
  {
    name: 'CFOP (Fridrich)',
    difficulty: '⭐⭐⭐ Intermedio-Avanzado',
    avgMoves: '~55-60',
    description: 'El método más popular en competiciones. Cross → F2L → OLL → PLL. La Cruz se planifica en inspección. F2L (First Two Layers) inserta esquinas y bordes simultáneamente. OLL (57 algoritmos) orienta la última capa. PLL (21 algoritmos) permuta la última capa. Total: ~78 algoritmos para dominio completo.',
    pros: ['El más popular (muchos recursos)', 'Muy rápido (sub-10 posible)', 'Ergonómico para speedsolving'],
    cons: ['Muchos algoritmos (78 en total)', 'F2L requiere mucha práctica intuitiva', 'La cruz siempre empieza igual'],
  },
  {
    name: 'Roux',
    difficulty: '⭐⭐⭐ Intermedio-Avanzado',
    avgMoves: '~45-48',
    description: 'Método basado en bloques. Paso 1: Construye un bloque 1x2x3 en el lado izquierdo. Paso 2: Construye otro bloque 1x2x3 en el lado derecho. Paso 3: Orienta y permuta las esquinas de la última capa (CMLL). Paso 4: Resuelve los 6 bordes restantes con movimientos M y U (LSE). Menos algoritmos que CFOP.',
    pros: ['Menos movimientos que CFOP', 'Menos algoritmos (~42)', 'Muy eficiente y elegante'],
    cons: ['Menos recursos de aprendizaje', 'Requiere buena visión espacial', 'Movimientos M pueden ser lentos'],
  },
  {
    name: 'ZZ',
    difficulty: '⭐⭐⭐⭐ Avanzado',
    avgMoves: '~45-55',
    description: 'Método que prioriza la ergonomía. Paso 1: EOLine — orienta todos los bordes y coloca la línea inferior (paso más difícil). Paso 2: F2L usando solo movimientos R, U, L (sin rotaciones). Paso 3: Last Layer con algoritmos de CFOP u ZBLL (493 algoritmos para un solo paso). La ausencia de rotaciones lo hace extremadamente fluido.',
    pros: ['Sin rotaciones en F2L', 'Muy ergonómico', 'Potencialmente el más rápido'],
    cons: ['EOLine es muy difícil', 'ZBLL son 493 algoritmos', 'Comunidad más pequeña'],
  },
];

// ==============================
// CONSEJOS AVANZADOS
// ==============================
export interface AdvancedTip {
  title: string;
  description: string;
  tips: string[];
}

export const advancedTips: AdvancedTip[] = [
  {
    title: 'Look-ahead',
    description: 'La habilidad más importante para bajar tiempos. Consiste en buscar la siguiente pieza MIENTRAS ejecutas el algoritmo actual, eliminando las pausas entre pasos.',
    tips: [
      'Practica solves lentos (slow turning): resuelve a velocidad constante sin pausas, forzándote a encontrar la siguiente pieza antes de terminar la actual.',
      'Empieza con look-ahead en F2L: mientras insertas un par, busca el siguiente borde o esquina.',
      'No mires lo que tus manos hacen. Los algoritmos deben ser memoria muscular.',
      'Practica con metrónomo: mantén un ritmo constante de giros.',
      'El objetivo no es girar más rápido, sino pausar menos.',
    ],
  },
  {
    title: 'Fingertricks',
    description: 'Técnicas de agarre y movimiento de dedos que permiten ejecutar algoritmos a máxima velocidad. La diferencia entre un solve de 20s y uno de 10s suele ser la fluidez de los fingertricks.',
    tips: [
      'U: Empuja con el dedo índice derecho. U\': Empuja con el dedo índice izquierdo (o anular derecho).',
      'R: Usa la muñeca derecha, no solo los dedos. R\': Tira hacia atrás con los dedos.',
      'Practica algoritmos individuales hasta que sean automáticos (al menos 100 repeticiones cada uno).',
      'Evita regrips (cambiar el agarre del cubo). Cada regrip añade ~0.2 segundos.',
      'Usa cubos con tensión adecuada y lubricados. Un cubo que gira bien facilita enormemente los fingertricks.',
      'Graba tus manos y compara con videos de speedcubers profesionales para identificar movimientos ineficientes.',
    ],
  },
  {
    title: 'Color Neutrality',
    description: 'La capacidad de empezar la cruz (o el primer bloque en Roux) con CUALQUIER color, no solo blanco. Esto multiplica por 6 tus opciones de cruz, permitiéndote elegir siempre la más fácil.',
    tips: [
      'Empieza practicando con 2 colores (blanco y amarillo, por ser opuestos).',
      'Luego añade los colores laterales uno a uno.',
      'Al principio serás más lento. Es normal. Es una inversión a largo plazo.',
      'Durante la inspección, mira rápidamente las 6 caras y elige el color que ofrezca la cruz más corta.',
      'La mayoría de cubers top son color neutral. Feliks Zemdegs empezó con blanco y migró.',
      'Si ya eres sub-15 con un color, la migración será dolorosa pero vale la pena para bajar de sub-10.',
    ],
  },
];
