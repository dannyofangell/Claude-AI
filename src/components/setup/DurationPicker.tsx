import { useState } from 'react';
import { DURATION_PRESETS } from '../../constants/presets';

interface Props {
  value: number; // seconds
  onChange: (seconds: number) => void;
}

export function DurationPicker({ value, onChange }: Props) {
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handlePreset = (seconds: number) => {
    setShowCustom(false);
    setCustomMinutes('');
    onChange(seconds);
  };

  const handleCustomSubmit = () => {
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 600) {
      onChange(mins * 60);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {DURATION_PRESETS.map(preset => (
          <button
            key={preset.seconds}
            onClick={() => handlePreset(preset.seconds)}
            className={`
              py-3 px-2 rounded-xl text-sm font-semibold transition-all
              ${value === preset.seconds
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}
            `}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(v => !v)}
          className={`
            py-3 px-2 rounded-xl text-sm font-semibold transition-all
            ${showCustom
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}
          `}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="600"
            placeholder="Minutes"
            value={customMinutes}
            onChange={e => setCustomMinutes(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
            className="flex-1 bg-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 placeholder-white/30"
          />
          <button
            onClick={handleCustomSubmit}
            className="bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-400 transition-colors"
          >
            Set
          </button>
        </div>
      )}
    </div>
  );
}
