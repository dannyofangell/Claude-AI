import { useTimer } from './useTimer';
import { useAnnouncements } from './useAnnouncements';

// Orchestrates timer + announcements as a single hook
export function useRunSession() {
  useTimer();
  useAnnouncements();
}
