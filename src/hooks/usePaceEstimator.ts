import { useRunStore } from '../store/runStore';
import { estimateDistanceKm, formatDistance, formatPace } from '../utils/paceCalc';
import { DEFAULT_PACE_SEC_PER_KM } from '../constants/presets';

export function usePaceEstimator() {
  const elapsedSec = useRunStore(s => s.state.elapsedSec);
  const configuredPace = useRunStore(s => s.state.config.paceSecondsPerKm);
  const paceSecPerKm = configuredPace ?? DEFAULT_PACE_SEC_PER_KM;

  const distKm = estimateDistanceKm(elapsedSec, paceSecPerKm);

  return {
    distanceDisplay: formatDistance(distKm),
    paceDisplay: formatPace(paceSecPerKm),
    isEstimated: !configuredPace,
  };
}
