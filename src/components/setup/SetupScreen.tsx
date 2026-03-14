import { useState } from 'react';
import { DurationPicker } from './DurationPicker';
import { PaceInput } from './PaceInput';
import { useRunStore } from '../../store/runStore';
import { useSpeech } from '../../hooks/useSpeech';
import { DEFAULT_ANNOUNCEMENT_INTERVAL_SEC } from '../../constants/presets';
import { formatTime } from '../../utils/formatTime';

export function SetupScreen() {
  const [duration, setDuration] = useState(20 * 60); // default 20 min
  const [paceSecPerKm, setPaceSecPerKm] = useState<number | undefined>(undefined);
  const startRun = useRunStore(s => s.startRun);
  const { unlockAudio, isSupported } = useSpeech();

  const handleStart = () => {
    unlockAudio(); // iOS Safari TTS unlock
    startRun({
      totalDuration: duration,
      paceSecondsPerKm: paceSecPerKm,
      announcementIntervalSec: DEFAULT_ANNOUNCEMENT_INTERVAL_SEC,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">🏃</div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Hoka Run</h1>
          <p className="text-white/50 text-sm">Your free running companion</p>
        </div>

        {/* Duration picker */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-base">How long?</h2>
          <DurationPicker value={duration} onChange={setDuration} />
          <p className="text-center text-white/40 text-sm">
            Selected: <span className="text-orange-400 font-semibold">{formatTime(duration)}</span>
          </p>
        </div>

        {/* Pace input */}
        <div>
          <PaceInput value={paceSecPerKm} onChange={setPaceSecPerKm} />
        </div>

        {/* TTS warning */}
        {!isSupported && (
          <p className="text-yellow-400 text-xs text-center">
            Voice announcements not supported in this browser.
          </p>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full py-5 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white text-xl font-bold rounded-2xl transition-all shadow-xl shadow-orange-500/30 active:scale-95"
        >
          Start Run
        </button>
      </div>
    </div>
  );
}
