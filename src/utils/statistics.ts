export const calculateMo3 = (times: number[]): number | null => {
  if (times.length < 3) return null;
  const recent = times.slice(0, 3);
  const sum = recent.reduce((a, b) => a + b, 0);
  return Math.floor(sum / 3);
};

export const calculateAo5 = (times: number[]): number | null => {
  if (times.length < 5) return null;
  const recent = times.slice(0, 5).sort((a, b) => a - b);
  const sum = recent[1] + recent[2] + recent[3];
  return Math.floor(sum / 3);
};

export const calculateAo12 = (times: number[]): number | null => {
  if (times.length < 12) return null;
  const recent = times.slice(0, 12).sort((a, b) => a - b);
  const toAverage = recent.slice(1, 11);
  const sum = toAverage.reduce((a, b) => a + b, 0);
  return Math.floor(sum / 10);
};

export const calculateAo100 = (times: number[]): number | null => {
  if (times.length < 100) return null;
  const recent = times.slice(0, 100).sort((a, b) => a - b);
  const toAverage = recent.slice(5, 95); // remove 5 best, 5 worst
  const sum = toAverage.reduce((a, b) => a + b, 0);
  return Math.floor(sum / 90);
};

export const calculateBestSingle = (times: number[]): number | null => {
  if (times.length === 0) return null;
  return Math.min(...times);
};

export const calculateTotalSolves = (times: number[]): number => {
  return times.length;
};
