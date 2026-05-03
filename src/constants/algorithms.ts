// ─── Types ────────────────────────────────────────────────────────────────────
export interface Algorithm {
  id: string;
  name: string;
  algorithm: string;
  setup: string;       // inverse moves to set up the case on a solved cube
  group: 'PLL' | 'OLL';
  subgroup?: string;   // e.g. 'Corners', 'Edges', 'Cross', etc.
  // Top-face color pattern: 9 chars, U=yellow, X=other, in row-major order (UL→UR, ML→MR, BL→BR)
  // Used to render the top-face SVG diagram
  topFace?: string;
}

// ─── PLL (21 cases) ───────────────────────────────────────────────────────────
export const PLL_ALGORITHMS: Algorithm[] = [
  // ── Corners only ──
  {
    id: 'pll_aa',
    name: 'Aa-Perm',
    algorithm: "x (R' U R') D2 (R U' R') D2 R2 x'",
    setup: "x R2 D2 (R U R') D2 (R U' R) x'",
    group: 'PLL', subgroup: 'Corners',
  },
  {
    id: 'pll_ab',
    name: 'Ab-Perm',
    algorithm: "x R2 D2 (R' U' R) D2 (R' U R') x'",
    setup: "x (R U' R) D2 (R' U R) D2 R2 x'",
    group: 'PLL', subgroup: 'Corners',
  },
  {
    id: 'pll_e',
    name: 'E-Perm',
    algorithm: "x' (R U' R' D) (R U R' D') (R U R' D) (R U' R' D') x",
    setup: "x (D R U' R' D') (R U R') (D R U' R' D') (R U R') x'",
    group: 'PLL', subgroup: 'Corners',
  },
  // ── Edges only ──
  {
    id: 'pll_ua',
    name: 'Ua-Perm',
    algorithm: "R U' R U R U R U' R' U' R2",
    setup: "R2 U R U R' U' R' U' R' U R'",
    group: 'PLL', subgroup: 'Edges',
  },
  {
    id: 'pll_ub',
    name: 'Ub-Perm',
    algorithm: "R2 U R U R' U' R' U' R' U R'",
    setup: "R U' R U R U R U' R' U' R2",
    group: 'PLL', subgroup: 'Edges',
  },
  {
    id: 'pll_z',
    name: 'Z-Perm',
    algorithm: "(M2 U M2 U) (M' U2) (M2 U2 M') U2",
    setup: "U2 M U2 M2 U2 M' U2 M2 U2",
    group: 'PLL', subgroup: 'Edges',
  },
  {
    id: 'pll_h',
    name: 'H-Perm',
    algorithm: "M2 U M2 U2 M2 U M2",
    setup: "M2 U' M2 U2 M2 U' M2",
    group: 'PLL', subgroup: 'Edges',
  },
  // ── Adjacent corner swap + edges ──
  {
    id: 'pll_t',
    name: 'T-Perm',
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    setup: "F R U R' U' R' F' R2 U R U' R'",
    group: 'PLL', subgroup: 'Adjacent',
  },
  {
    id: 'pll_f',
    name: 'F-Perm',
    algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    setup: "R' U' R U' R U R F' R' U R U R' U' F R",
    group: 'PLL', subgroup: 'Adjacent',
  },
  {
    id: 'pll_ja',
    name: 'Ja-Perm',
    algorithm: "x R2 F R F' R U2 r' U r U2 x'",
    setup: "x' U2 r' U' r U2 R F' R' F' R2 x",
    group: 'PLL', subgroup: 'Adjacent',
  },
  {
    id: 'pll_jb',
    name: 'Jb-Perm',
    algorithm: "R U R' F' R U R' U' R' F R2 U' R'",
    setup: "R U R2 F' R U R U' R' F R",
    group: 'PLL', subgroup: 'Adjacent',
  },
  {
    id: 'pll_ra',
    name: 'Ra-Perm',
    algorithm: "R U R' F' R U2 R' U2 R' F R U R U2 R'",
    setup: "R U2 R' U2 R F' R' U' R U' R' F R U' R'",
    group: 'PLL', subgroup: 'Adjacent',
  },
  {
    id: 'pll_rb',
    name: 'Rb-Perm',
    algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2",
    setup: "R2 F R U R U' R' F' U2 R' U2 R",
    group: 'PLL', subgroup: 'Adjacent',
  },
  {
    id: 'pll_l',
    name: 'L-Perm',
    algorithm: "R' U' R' F R F' L' U R U' R' L R",
    setup: "R' L U R U' R F' R' F L U R",
    group: 'PLL', subgroup: 'Adjacent',
  },
  // ── Diagonal corner swap ──
  {
    id: 'pll_v',
    name: 'V-Perm',
    algorithm: "R' U R' d' R' F' R2 U' R' U R' F R F",
    setup: "F' R' F' R2 U R' U' R' F R2 U R d R",
    group: 'PLL', subgroup: 'Diagonal',
  },
  {
    id: 'pll_y',
    name: 'Y-Perm',
    algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    setup: "F R' F' R U R U' R' F R' F' R U R U'",
    group: 'PLL', subgroup: 'Diagonal',
  },
  {
    id: 'pll_na',
    name: 'Na-Perm',
    algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    setup: "R U R' U2 R U R' F' R U R' U' R' F R2 U' R' U R U' R'",
    group: 'PLL', subgroup: 'Diagonal',
  },
  {
    id: 'pll_nb',
    name: 'Nb-Perm',
    algorithm: "R' U L' U2 R U' L R' U L' U2 R U' L U2",
    setup: "U2 R' U L' U2 R U' L R' U L' U2 R U' L",
    group: 'PLL', subgroup: 'Diagonal',
  },
  // ── G Perms ──
  {
    id: 'pll_ga',
    name: 'Ga-Perm',
    algorithm: "R2 U R' U R' U' R U' R2 D U' R' U R D'",
    setup: "D R' U' R U D' R2 U R' U' R U R U' R2",
    group: 'PLL', subgroup: 'G-Perms',
  },
  {
    id: 'pll_gb',
    name: 'Gb-Perm',
    algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D",
    setup: "D' R2 U' R U' R' U R' U R2 D R' U R",
    group: 'PLL', subgroup: 'G-Perms',
  },
  {
    id: 'pll_gc',
    name: 'Gc-Perm',
    algorithm: "R2 U' R U' R U R' U R2 D' U R U' R' D",
    setup: "D R' U R' U' R U' R2 D' R2 U R U' R' U",
    group: 'PLL', subgroup: 'G-Perms',
  },
  // Gd moved to index 20 for 21 total
  {
    id: 'pll_gd',
    name: 'Gd-Perm',
    algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'",
    setup: "D R2 U' R U R' U' R U R2 D' U' R' U R",
    group: 'PLL', subgroup: 'G-Perms',
  },
];

// ─── OLL (57 cases — skip OLL skip = solved) ──────────────────────────────────
export const OLL_ALGORITHMS: Algorithm[] = [
  // ── Cross ──
  { id: 'oll_33', name: 'OLL 33', algorithm: "R U R' U' R' F R F'", setup: "F R' F' R U R U'", group: 'OLL', subgroup: 'Cross' },
  { id: 'oll_45', name: 'OLL 45', algorithm: "F R U R' U' F'", setup: "F U R U' R' F'", group: 'OLL', subgroup: 'Cross' },
  { id: 'oll_44', name: 'OLL 44', algorithm: "F U R U' R' F'", setup: "F R U R' U' F'", group: 'OLL', subgroup: 'Cross' },
  { id: 'oll_43', name: 'OLL 43', algorithm: "R' U' F' U F R", setup: "R' F' U' F U R", group: 'OLL', subgroup: 'Cross' },
  // ── Dot ──
  { id: 'oll_1', name: 'OLL 1', algorithm: "R U2 R2 F R F' U2 R' F R F'", setup: "F R' F' U2 R F R' F' R2 U2 R'", group: 'OLL', subgroup: 'Dot' },
  { id: 'oll_2', name: 'OLL 2', algorithm: "F R U R' U' F' f R U R' U' f'", setup: "f U R U' R' f' F U R U' R' F'", group: 'OLL', subgroup: 'Dot' },
  { id: 'oll_3', name: 'OLL 3', algorithm: "f U R U' R' f' U' F R U R' U' F'", setup: "F U R U' R' F' U f U R U' R' f'", group: 'OLL', subgroup: 'Dot' },
  { id: 'oll_4', name: 'OLL 4', algorithm: "f U R U' R' f' U F R U R' U' F'", setup: "F U R U' R' F' U' f U R U' R' f'", group: 'OLL', subgroup: 'Dot' },
  // ── Line ──
  { id: 'oll_46', name: 'OLL 46', algorithm: "R' U' R' F R F' U R", setup: "R' U' F' R F R U R'", group: 'OLL', subgroup: 'Line' },
  { id: 'oll_47', name: 'OLL 47', algorithm: "F' L' U' L U F", setup: "F' U' L' U L F", group: 'OLL', subgroup: 'Line' },
  { id: 'oll_48', name: 'OLL 48', algorithm: "F R U R' U' F'", setup: "F U R U' R' F'", group: 'OLL', subgroup: 'Line' },
  { id: 'oll_49', name: 'OLL 49', algorithm: "r U R' U R U2 r'", setup: "r U2 R' U' R U' r'", group: 'OLL', subgroup: 'Line' },
  { id: 'oll_50', name: 'OLL 50', algorithm: "r' U' R U' R' U2 r", setup: "r' U2 R U R' U r", group: 'OLL', subgroup: 'Line' },
  // ── Small L ──
  { id: 'oll_7', name: 'OLL 7', algorithm: "r U R' U R U2 r'", setup: "r U2 R' U' R U' r'", group: 'OLL', subgroup: 'Small-L' },
  { id: 'oll_8', name: 'OLL 8', algorithm: "r' U' R U' R' U2 r", setup: "r' U2 R U R' U r", group: 'OLL', subgroup: 'Small-L' },
  { id: 'oll_11', name: 'OLL 11', algorithm: "r' R2 U R' U R U2 R' U M'", setup: "M U2 R' U' R U' R2 r M", group: 'OLL', subgroup: 'Small-L' },
  { id: 'oll_12', name: 'OLL 12', algorithm: "M' R' U' R U' R' U2 R U' M", setup: "M' U R U2 R' U R U R' M", group: 'OLL', subgroup: 'Small-L' },
  // ── P-shapes ──
  { id: 'oll_31', name: 'OLL 31', algorithm: "R' U' F U R U' R' F' R", setup: "R' F R U R' U' F' R", group: 'OLL', subgroup: 'P-shape' },
  { id: 'oll_32', name: 'OLL 32', algorithm: "S R U R' U' R' F R f'", setup: "f R' F' R U R U' S'", group: 'OLL', subgroup: 'P-shape' },
  { id: 'oll_43', name: 'OLL 43b', algorithm: "f' L' U' L U f", setup: "f' U' L' U L f", group: 'OLL', subgroup: 'P-shape' },
  // ── C-shapes ──
  { id: 'oll_34', name: 'OLL 34', algorithm: "R U R' U' B' R' F R F' B", setup: "B' F R' F' R B U R U'", group: 'OLL', subgroup: 'C-shape' },
  { id: 'oll_46b', name: 'OLL 46b', algorithm: "R' U' R' F R F' R' F R F' U R", setup: "R' U' F R' F' R F R' F' R U R", group: 'OLL', subgroup: 'C-shape' },
  // ── W-shapes ──
  { id: 'oll_36', name: 'OLL 36', algorithm: "R U R' U R U' R' U' R' F R F'", setup: "F R' F' R U R U' R' U R U' R'", group: 'OLL', subgroup: 'W-shape' },
  { id: 'oll_38', name: 'OLL 38', algorithm: "R U R' U R U' R' U' R' F R F'", setup: "F R' F' R U R U' R' U R U' R'", group: 'OLL', subgroup: 'W-shape' },
  // ── S-shapes ──
  { id: 'oll_40', name: 'OLL 40', algorithm: "R' F R U R' U' F' U R", setup: "R' U F U R U' R' F' R", group: 'OLL', subgroup: 'S-shape' },
  { id: 'oll_39', name: 'OLL 39', algorithm: "L F' L' U' L U F U' L'", setup: "L U' F' U L' U L F L'", group: 'OLL', subgroup: 'S-shape' },
  // ── T-shapes ──
  { id: 'oll_57', name: 'OLL 57', algorithm: "R U R' U' M' U R U' r'", setup: "r U R' U M U' R U' R'", group: 'OLL', subgroup: 'T-shape' },
  { id: 'oll_56', name: 'OLL 56', algorithm: "r' U' r U' R' U R U' R' U R r' U r", setup: "r' U' R U R' U' R U r U' r' U r", group: 'OLL', subgroup: 'T-shape' },
  // ── Square shapes ──
  { id: 'oll_5', name: 'OLL 5', algorithm: "r' U2 R U R' U r", setup: "r' U' R U' R' U2 r", group: 'OLL', subgroup: 'Square' },
  { id: 'oll_6', name: 'OLL 6', algorithm: "r U2 R' U' R U' r'", setup: "r U R' U R U2 r'", group: 'OLL', subgroup: 'Square' },
  // ── Fish shapes ──
  { id: 'oll_9', name: 'OLL 9', algorithm: "R U R' U' R' F R2 U R' U' F'", setup: "F U R U' R2 F' R U R U'", group: 'OLL', subgroup: 'Fish' },
  { id: 'oll_10', name: 'OLL 10', algorithm: "R U R' U R' F R F' R U2 R'", setup: "R U2 R' F' R F R' U' R U' R'", group: 'OLL', subgroup: 'Fish' },
  { id: 'oll_35', name: 'OLL 35', algorithm: "R U2 R2 F R F' R U2 R'", setup: "R U2 R' F R' F' R2 U2 R'", group: 'OLL', subgroup: 'Fish' },
  { id: 'oll_37', name: 'OLL 37', algorithm: "F R' F' R U R U' R'", setup: "R U R' U' R F R' F'", group: 'OLL', subgroup: 'Fish' },
  // ── Knight move shapes ──
  { id: 'oll_13', name: 'OLL 13', algorithm: "F U R U' R2 F' R U R U' R'", setup: "R U R' U' R F R2 F' R U R' U'", group: 'OLL', subgroup: 'Knight' },
  { id: 'oll_14', name: 'OLL 14', algorithm: "R' F R U R' F' R F U' F'", setup: "F U F' R' F R U' R' F' R", group: 'OLL', subgroup: 'Knight' },
  { id: 'oll_15', name: 'OLL 15', algorithm: "r' U' r R' U' R U r' U r", setup: "r' U' r U R' U' R U r' U r", group: 'OLL', subgroup: 'Knight' },
  { id: 'oll_16', name: 'OLL 16', algorithm: "r U r' R U R' U' r U' r'", setup: "r U r' R U R' U' r U' r'", group: 'OLL', subgroup: 'Knight' },
  // ── Awkward shapes ──
  { id: 'oll_29', name: 'OLL 29', algorithm: "R U R' U' R U' R' F' U' F R U R'", setup: "R' U' R F' U F R U R' U R U' R'", group: 'OLL', subgroup: 'Awkward' },
  { id: 'oll_30', name: 'OLL 30', algorithm: "F R' F R2 U' R' U' R U R' F2", setup: "F2 R U R' U R U R2 F' R F'", group: 'OLL', subgroup: 'Awkward' },
  { id: 'oll_41', name: 'OLL 41', algorithm: "R U R' U R U2 R' F R U R' U' F'", setup: "F U R U' R' F' R U2 R' U' R U' R'", group: 'OLL', subgroup: 'Awkward' },
  { id: 'oll_42', name: 'OLL 42', algorithm: "R' U' R U' R' U2 R F R U R' U' F'", setup: "F U R U' R' F' R' U2 R U R' U R", group: 'OLL', subgroup: 'Awkward' },
  // ── Lightning bolts ──
  { id: 'oll_17', name: 'OLL 17', algorithm: "F R' F' R2 r' U R U' R' U' M'", setup: "M U R U R' U' R2 F R F'", group: 'OLL', subgroup: 'Lightning' },
  { id: 'oll_18', name: 'OLL 18', algorithm: "r U R' U R U2 r2 U' R U' R' U2 r", setup: "r' U2 R U R' U2 r2 U' R U' R' U r'", group: 'OLL', subgroup: 'Lightning' },
  { id: 'oll_19', name: 'OLL 19', algorithm: "r' R U R U R' U' M' R' F R F'", setup: "F R' F' R M U R U' R' U' R'", group: 'OLL', subgroup: 'Lightning' },
  { id: 'oll_20', name: 'OLL 20', algorithm: "r U R' U' r' R U R U' R' M'", setup: "M R U R' U' R U R' r' M", group: 'OLL', subgroup: 'Lightning' },
  // ── Corners correct (no edges) ──
  { id: 'oll_21', name: 'OLL 21', algorithm: "R U2 R' U' R U R' U' R U' R'", setup: "R U R' U R U' R' U R U2 R'", group: 'OLL', subgroup: 'Corners' },
  { id: 'oll_22', name: 'OLL 22', algorithm: "R U2 R2 U' R2 U' R2 U2 R", setup: "R' U2 R2 U R2 U R2 U2 R'", group: 'OLL', subgroup: 'Corners' },
  { id: 'oll_23', name: 'OLL 23', algorithm: "R2 D' R U2 R' D R U2 R", setup: "R' U2 R' D' R U2 R' D R2", group: 'OLL', subgroup: 'Corners' },
  { id: 'oll_24', name: 'OLL 24', algorithm: "r U R' U' r' F R F'", setup: "F R' F' r U R U' r'", group: 'OLL', subgroup: 'Corners' },
  { id: 'oll_25', name: 'OLL 25', algorithm: "F' r U R' U' r' F R", setup: "R' F' r U R U' r' F", group: 'OLL', subgroup: 'Corners' },
  { id: 'oll_26', name: 'OLL 26', algorithm: "R U2 R' U' R U' R'", setup: "R U R' U R U2 R'", group: 'OLL', subgroup: 'Corners' },
  { id: 'oll_27', name: 'OLL 27', algorithm: "R U R' U R U2 R'", setup: "R U2 R' U' R U' R'", group: 'OLL', subgroup: 'Corners' },
  // ── All corners + edges ──
  { id: 'oll_51', name: 'OLL 51', algorithm: "f R U R' U' R U R' U' f'", setup: "f U R U' R' U R U' R' f'", group: 'OLL', subgroup: 'All-corners' },
  { id: 'oll_52', name: 'OLL 52', algorithm: "R U R' U R d' R U' R' F'", setup: "F R U R' U' R' d R U' R U' R'", group: 'OLL', subgroup: 'All-corners' },
  { id: 'oll_53', name: 'OLL 53', algorithm: "l' U2 L U L' U l", setup: "l' U' L' U L U2 l", group: 'OLL', subgroup: 'All-corners' },
  { id: 'oll_54', name: 'OLL 54', algorithm: "r U2 R' U' R U' r'", setup: "r U R' U R U2 r'", group: 'OLL', subgroup: 'All-corners' },
  { id: 'oll_55', name: 'OLL 55', algorithm: "R U2 R2 U' R U' R' U2 F R F'", setup: "F R' F' U2 R U R' U R2 U2 R'", group: 'OLL', subgroup: 'All-corners' },
  { id: 'oll_28', name: 'OLL 28', algorithm: "r U R' U' M U R U' R'", setup: "R U R' U M' U R U' R'", group: 'OLL', subgroup: 'All-corners' },
];

// ─── Combined lookup ──────────────────────────────────────────────────────────
export const ALL_ALGORITHMS: Algorithm[] = [...PLL_ALGORITHMS, ...OLL_ALGORITHMS];

export const getAlgorithmById = (id: string): Algorithm | undefined =>
  ALL_ALGORITHMS.find(a => a.id === id);

// Group by subgroup for display
export const groupBySubgroup = (algs: Algorithm[]): Record<string, Algorithm[]> =>
  algs.reduce<Record<string, Algorithm[]>>((acc, alg) => {
    const key = alg.subgroup ?? 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(alg);
    return acc;
  }, {});
