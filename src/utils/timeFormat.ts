export const formatTime = (timeInMillis: number) => {
  const minutes = Math.floor(timeInMillis / 60000);
  const seconds = Math.floor((timeInMillis % 60000) / 1000);
  const centiseconds = Math.floor((timeInMillis % 1000) / 10);

  const minsStr = minutes > 0 ? `${minutes}:` : '';
  const secsStr = minutes > 0 ? seconds.toString().padStart(2, '0') : seconds.toString();
  const msStr = centiseconds.toString().padStart(2, '0');

  return `${minsStr}${secsStr}:${msStr}`; 
};
