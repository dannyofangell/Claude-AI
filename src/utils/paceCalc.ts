export function estimateDistanceKm(elapsedSec: number, paceSecPerKm: number): number {
  if (paceSecPerKm <= 0) return 0;
  return elapsedSec / paceSecPerKm;
}

export function formatDistance(km: number): string {
  return km.toFixed(2) + ' km';
}

export function formatPace(paceSecPerKm: number): string {
  const m = Math.floor(paceSecPerKm / 60);
  const s = Math.floor(paceSecPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

export function paceFromMinPerKm(minPerKm: number): number {
  return minPerKm * 60;
}
