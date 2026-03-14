import { usePaceEstimator } from '../../hooks/usePaceEstimator';

export function PaceStats() {
  const { distanceDisplay, paceDisplay, isEstimated } = usePaceEstimator();

  return (
    <div className="flex gap-8 text-center">
      <div>
        <div className="text-white text-lg font-semibold">{distanceDisplay}</div>
        <div className="text-white/40 text-xs uppercase tracking-wider mt-0.5">
          {isEstimated ? 'Est. Distance' : 'Distance'}
        </div>
      </div>
      <div>
        <div className="text-white text-lg font-semibold">{paceDisplay}</div>
        <div className="text-white/40 text-xs uppercase tracking-wider mt-0.5">
          {isEstimated ? 'Est. Pace' : 'Pace'}
        </div>
      </div>
    </div>
  );
}
