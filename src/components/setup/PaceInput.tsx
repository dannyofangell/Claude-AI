interface Props {
  value?: number; // seconds per km
  onChange: (secPerKm: number | undefined) => void;
}

export function PaceInput({ value, onChange }: Props) {
  const displayMinutes = value ? Math.floor(value / 60) : '';
  const displaySeconds = value ? String(value % 60).padStart(2, '0') : '';

  const handleChange = (part: 'min' | 'sec', raw: string) => {
    const n = parseInt(raw, 10);
    if (part === 'min') {
      if (raw === '') { onChange(undefined); return; }
      const sec = value ? value % 60 : 0;
      if (!isNaN(n) && n >= 0) onChange(n * 60 + sec);
    } else {
      const min = value ? Math.floor(value / 60) : 0;
      if (!isNaN(n) && n >= 0 && n < 60) onChange(min * 60 + n);
    }
  };

  return (
    <div>
      <label className="block text-sm text-white/50 mb-2">
        Your pace (optional — used for distance estimate)
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="30"
          placeholder="5"
          value={displayMinutes}
          onChange={e => handleChange('min', e.target.value)}
          className="w-20 bg-white/10 text-white rounded-xl px-3 py-3 text-center outline-none focus:ring-2 focus:ring-orange-500 placeholder-white/30"
        />
        <span className="text-white/50">:</span>
        <input
          type="number"
          min="0"
          max="59"
          placeholder="00"
          value={displaySeconds}
          onChange={e => handleChange('sec', e.target.value)}
          className="w-20 bg-white/10 text-white rounded-xl px-3 py-3 text-center outline-none focus:ring-2 focus:ring-orange-500 placeholder-white/30"
        />
        <span className="text-white/50 text-sm">/km</span>
        {value && (
          <button
            onClick={() => onChange(undefined)}
            className="ml-2 text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
