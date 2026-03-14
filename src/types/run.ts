export type RunPhase = 'idle' | 'running' | 'paused' | 'complete';

export interface RunConfig {
  totalDuration: number; // seconds
  paceSecondsPerKm?: number; // optional, for distance estimation
  announcementIntervalSec: number; // e.g. 300 for every 5 min
}

export interface ScheduledAnnouncement {
  triggerAtElapsedSec: number;
  type: 'start' | 'interval' | 'halfway' | 'three_quarters' | 'last_warning' | 'motivational' | 'completion';
  messageKey: string;
  fired: boolean;
}

export interface RunState {
  phase: RunPhase;
  config: RunConfig;
  elapsedSec: number;
  totalDuration: number; // mutable — addTime changes this
  announcements: ScheduledAnnouncement[];
}
