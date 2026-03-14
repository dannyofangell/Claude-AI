import { useState } from 'react';
import { useRunStore } from '../../store/runStore';
import { useSpeech } from '../../hooks/useSpeech';
import { AddTimeModal } from './AddTimeModal';

export function ControlBar() {
  const phase = useRunStore(s => s.state.phase);
  const pause = useRunStore(s => s.pause);
  const resume = useRunStore(s => s.resume);
  const reset = useRunStore(s => s.reset);
  const { cancel } = useSpeech();
  const [showAddTime, setShowAddTime] = useState(false);

  const handlePauseResume = () => {
    if (phase === 'running') {
      cancel();
      pause();
    } else {
      resume();
    }
  };

  const handleStop = () => {
    cancel();
    reset();
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Stop */}
        <button
          onClick={handleStop}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Stop run"
        >
          <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
            <rect x="4" y="4" width="12" height="12" rx="1" />
          </svg>
        </button>

        {/* Pause / Resume — primary */}
        <button
          onClick={handlePauseResume}
          className="w-20 h-20 rounded-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 flex items-center justify-center transition-all shadow-xl shadow-orange-500/30 active:scale-95"
        >
          {phase === 'running' ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Add time */}
        <button
          onClick={() => setShowAddTime(true)}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Add time"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {showAddTime && <AddTimeModal onClose={() => setShowAddTime(false)} />}
    </>
  );
}
