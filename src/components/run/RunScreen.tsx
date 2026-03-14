import { useRunStore } from '../../store/runStore';
import { useRunSession } from '../../hooks/useRunSession';
import { ProgressRing } from './ProgressRing';
import { TimerDisplay } from './TimerDisplay';
import { ControlBar } from './ControlBar';
import { PaceStats } from './PaceStats';
import { formatTime } from '../../utils/formatTime';

export function RunScreen() {
  useRunSession();

  const elapsedSec = useRunStore(s => s.state.elapsedSec);
  const totalDuration = useRunStore(s => s.state.totalDuration);
  const phase = useRunStore(s => s.state.phase) as 'running' | 'paused';
  const announcements = useRunStore(s => s.state.announcements);

  const remainingSec = Math.max(0, totalDuration - elapsedSec);
  const progress = elapsedSec / totalDuration;

  const nextAnn = announcements.find(a => !a.fired);

  return (
    <div className="flex flex-col items-center px-6 py-4" style={{ height: '100svh' }}>
      {/* Header */}
      <div className="w-full flex justify-between items-center py-2 shrink-0">
        <span className="text-white/40 text-sm font-medium uppercase tracking-widest">
          {phase === 'paused' ? 'Paused' : 'Running'}
        </span>
        <span className="text-white/40 text-sm">
          {formatTime(elapsedSec)} elapsed
        </span>
      </div>

      {/* Main ring + timer — grows to fill available space */}
      <div className="flex flex-col items-center justify-center flex-1 gap-3 min-h-0">
        <ProgressRing progress={progress} size={240}>
          <TimerDisplay remainingSec={remainingSec} phase={phase} />
        </ProgressRing>

        {nextAnn && phase === 'running' && (
          <p className="text-white/25 text-xs text-center">
            Next update in {formatTime(Math.max(0, nextAnn.triggerAtElapsedSec - elapsedSec))}
          </p>
        )}
      </div>

      {/* Pace stats */}
      <div className="shrink-0 py-3">
        <PaceStats />
      </div>

      {/* Controls */}
      <div className="shrink-0 pb-6">
        <ControlBar />
      </div>
    </div>
  );
}
