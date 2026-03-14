import { formatTime } from '../../utils/formatTime';

interface Props {
  remainingSec: number;
  phase: 'running' | 'paused';
}

export function TimerDisplay({ remainingSec, phase }: Props) {
  return (
    <div className="text-center">
      <div
        className={`text-5xl font-bold tabular-nums tracking-tight transition-opacity ${
          phase === 'paused' ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {formatTime(remainingSec)}
      </div>
      {phase === 'paused' && (
        <div className="text-orange-400 text-xs font-semibold uppercase tracking-widest mt-1">
          Paused
        </div>
      )}
    </div>
  );
}
