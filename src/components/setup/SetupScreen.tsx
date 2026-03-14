import { useState } from 'react';
import { DurationPicker } from './DurationPicker';
import { PaceInput } from './PaceInput';
import { useRunStore } from '../../store/runStore';
import { useSpeech } from '../../hooks/useSpeech';
import { DEFAULT_ANNOUNCEMENT_INTERVAL_SEC } from '../../constants/presets';
import { formatTime } from '../../utils/formatTime';

export function SetupScreen() {
  const [duration, setDuration] = useState(20 * 60);
  const [paceSecPerKm, setPaceSecPerKm] = useState<number | undefined>(undefined);
  const startRun = useRunStore(s => s.startRun);
  const { unlockAudio, isSupported } = useSpeech();

  const handleStart = () => {
    unlockAudio();
    startRun({
      totalDuration: duration,
      paceSecondsPerKm: paceSecPerKm,
      announcementIntervalSec: DEFAULT_ANNOUNCEMENT_INTERVAL_SEC,
    });
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
      style={{ background: '#000' }}
    >
      <div className="w-full max-w-sm space-y-10">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-4">🏃</div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Hoka Run
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            poems &amp; facts while you run
          </p>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            How long?
          </p>
          <DurationPicker value={duration} onChange={setDuration} />
          <p className="text-center" style={{ color: '#f97316', fontWeight: 700, fontSize: '1.1rem' }}>
            {formatTime(duration)}
          </p>
        </div>

        {/* Pace */}
        <PaceInput value={paceSecPerKm} onChange={setPaceSecPerKm} />

        {!isSupported && (
          <p style={{ color: '#fbbf24', fontSize: '0.75rem', textAlign: 'center' }}>
            Voice not supported in this browser.
          </p>
        )}

        {/* Start */}
        <button
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '1.2rem',
            background: '#f97316',
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 900,
            border: 'none',
            borderRadius: '1rem',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
          }}
        >
          Start Run →
        </button>
      </div>
    </div>
  );
}
