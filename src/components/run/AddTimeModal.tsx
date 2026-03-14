import { ADD_TIME_OPTIONS } from '../../constants/presets';
import { useRunStore } from '../../store/runStore';

interface Props {
  onClose: () => void;
}

export function AddTimeModal({ onClose }: Props) {
  const addTime = useRunStore(s => s.addTime);

  const handleAdd = (seconds: number) => {
    addTime(seconds);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-72 space-y-4 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-center text-lg">Add time?</h3>
        <div className="space-y-2">
          {ADD_TIME_OPTIONS.map(opt => (
            <button
              key={opt.seconds}
              onClick={() => handleAdd(opt.seconds)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
