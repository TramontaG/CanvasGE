function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export { clamp, random };
