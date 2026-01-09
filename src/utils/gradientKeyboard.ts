const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const adjustAngleForArrow = (
  angle: number,
  key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
  shift = false
): number => {
  const step = shift ? 10 : 1;
  const delta = key === 'ArrowLeft' || key === 'ArrowDown' ? -step : step;
  return clamp(angle + delta, 0, 360);
};

export const adjustStopPositionForArrow = (
  position: number,
  key: 'ArrowLeft' | 'ArrowRight',
  shift = false
): number => {
  const step = shift ? 10 : 1;
  const delta = key === 'ArrowLeft' ? -step : step;
  return clamp(position + delta, 0, 100);
};
