import { useRunStore } from '../../store/runStore';
import { useRunSession } from '../../hooks/useRunSession';
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
    <div className="flex flex-col" style={{ height: '100svh', background: '#000' }}>
      {/* Progress bar — top edge */}
      <div className="h-1 w-full bg-white/10 shrink-0">
        <div
          className="h-full bg-orange-500 transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Status row */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2 shrink-0">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: phase === 'paused' ? '#f97316' : 'rgba(255,255,255,0.35)' }}
        >
          {phase === 'paused' ? '⏸ Paused' : '● Running'}
        </span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {formatTime(elapsedSec)} done
        </span>
      </div>

      {/* Giant timer — centre of screen */}
      <div className="flex flex-col items-center justify-center flex-1 min-h-0 px-4">
        <div
          style={{
            fontSize: 'clamp(5rem, 22vw, 8rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: phase === 'paused' ? 'rgba(255,255,255,0.3)' : '#fff',
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s',
          }}
        >
          {formatTime(remainingSec)}
        </div>
        <div className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>
          REMAINING
        </div>

        {/* Next content hint */}
        {nextAnn && nextAnn.type === 'motivational' && phase === 'running' && (
          <div className="mt-6 text-xs text-center" style={{ color: 'rgba(249,115,22,0.5)' }}>
            ♪ in {formatTime(Math.max(0, nextAnn.triggerAtElapsedSec - elapsedSec))}
          </div>
        )}
      </div>

      {/* Pace stats */}
      <div className="shrink-0 flex justify-center py-3">
        <PaceStats />
      </div>

      {/* Controls */}
      <div className="shrink-0 flex justify-center pb-8 pt-2">
        <ControlBar />
      </div>
    </div>
  );
}
