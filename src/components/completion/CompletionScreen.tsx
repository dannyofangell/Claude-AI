import { useRunStore } from '../../store/runStore';
import { formatTime } from '../../utils/formatTime';
import { estimateDistanceKm, formatDistance, formatPace } from '../../utils/paceCalc';
import { DEFAULT_PACE_SEC_PER_KM } from '../../constants/presets';

export function CompletionScreen() {
  const elapsedSec = useRunStore(s => s.state.elapsedSec);
  const paceSecPerKm = useRunStore(s => s.state.config.paceSecondsPerKm) ?? DEFAULT_PACE_SEC_PER_KM;
  const reset = useRunStore(s => s.reset);

  const distKm = estimateDistanceKm(elapsedSec, paceSecPerKm);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Celebration */}
        <div className="space-y-2">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white">Run Complete!</h1>
          <p className="text-white/50">You absolutely crushed it!</p>
        </div>

        {/* Stats */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Time</span>
            <span className="text-white font-semibold text-lg">{formatTime(elapsedSec)}</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Est. Distance</span>
            <span className="text-white font-semibold text-lg">{formatDistance(distKm)}</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Pace</span>
            <span className="text-white font-semibold text-lg">{formatPace(paceSecPerKm)}</span>
          </div>
        </div>

        {/* Motivational message */}
        <p className="text-orange-400 font-medium text-sm">
          Every run makes you stronger. See you next time! 🏃
        </p>

        {/* Back button */}
        <button
          onClick={reset}
          className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl transition-colors shadow-xl shadow-orange-500/20"
        >
          New Run
        </button>
      </div>
    </div>
  );
}
