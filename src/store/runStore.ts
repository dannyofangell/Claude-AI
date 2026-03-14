import { create } from 'zustand';
import type { RunConfig, RunPhase, RunState, ScheduledAnnouncement } from '../types/run';
import { buildAnnouncementSchedule, countContentSlots } from '../utils/announceSchedule';
import { DEFAULT_ANNOUNCEMENT_INTERVAL_SEC } from '../constants/presets';
import { fetchContentPool } from '../services/contentFetcher';

interface RunStore {
  state: RunState;
  contentPool: (string | null)[];
  startRun: (config: RunConfig) => void;
  pause: () => void;
  resume: () => void;
  tick: (elapsedSec: number) => void;
  addTime: (secondsToAdd: number) => void;
  markAnnouncementFired: (idx: number) => void;
  completeRun: () => void;
  reset: () => void;
  setPhase: (phase: RunPhase) => void;
}

const defaultState: RunState = {
  phase: 'idle',
  config: {
    totalDuration: 0,
    announcementIntervalSec: DEFAULT_ANNOUNCEMENT_INTERVAL_SEC,
  },
  elapsedSec: 0,
  totalDuration: 0,
  announcements: [],
};

export const useRunStore = create<RunStore>((set, get) => ({
  state: defaultState,
  contentPool: [],

  startRun: (config: RunConfig) => {
    const announcements = buildAnnouncementSchedule(
      config.totalDuration,
      config.announcementIntervalSec,
    );
    set({
      state: {
        phase: 'running',
        config,
        elapsedSec: 0,
        totalDuration: config.totalDuration,
        announcements,
      },
      contentPool: [],
    });

    // Pre-fetch content pool in background
    const needed = countContentSlots(config.totalDuration, config.announcementIntervalSec);
    fetchContentPool(needed).then(pool => {
      if (get().state.phase !== 'idle') {
        set({ contentPool: pool });
      }
    });
  },

  pause: () =>
    set(s => ({ state: { ...s.state, phase: 'paused' } })),

  resume: () =>
    set(s => ({ state: { ...s.state, phase: 'running' } })),

  tick: (elapsedSec: number) => {
    const { state } = get();
    if (state.phase !== 'running') return;

    if (elapsedSec >= state.totalDuration) {
      set({ state: { ...state, elapsedSec: state.totalDuration, phase: 'complete' } });
      return;
    }
    set({ state: { ...state, elapsedSec } });
  },

  addTime: (secondsToAdd: number) => {
    const { state } = get();
    const newTotal = state.totalDuration + secondsToAdd;
    const announcements = buildAnnouncementSchedule(
      newTotal,
      state.config.announcementIntervalSec,
      state.elapsedSec,
    );
    set({ state: { ...state, totalDuration: newTotal, announcements } });
  },

  markAnnouncementFired: (idx: number) => {
    const { state } = get();
    const announcements: ScheduledAnnouncement[] = state.announcements.map((a, i) =>
      i === idx ? { ...a, fired: true } : a
    );
    set({ state: { ...state, announcements } });
  },

  completeRun: () =>
    set(s => ({ state: { ...s.state, phase: 'complete' } })),

  reset: () => set({ state: defaultState, contentPool: [] }),

  setPhase: (phase: RunPhase) =>
    set(s => ({ state: { ...s.state, phase } })),
}));
