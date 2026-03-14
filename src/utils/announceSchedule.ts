import type { ScheduledAnnouncement } from '../types/run';

const DEDUP_WINDOW_SEC = 60;
const MOTIVATIONAL_MIN_GAP_SEC = 90;

export function buildAnnouncementSchedule(
  totalDuration: number,
  intervalSec: number,
  minElapsed = 0,
): ScheduledAnnouncement[] {
  const announces: ScheduledAnnouncement[] = [];

  // Fixed milestones
  announces.push({ triggerAtElapsedSec: 0, type: 'start', messageKey: 'start', fired: false });

  const halfway = Math.floor(totalDuration / 2);
  announces.push({ triggerAtElapsedSec: halfway, type: 'halfway', messageKey: 'halfway', fired: false });

  const threeQuarters = Math.floor(totalDuration * 0.75);
  announces.push({ triggerAtElapsedSec: threeQuarters, type: 'three_quarters', messageKey: 'three_quarters', fired: false });

  // Last-5-min warning (only if run is > 10 min)
  if (totalDuration > 10 * 60) {
    const lastWarning = totalDuration - 5 * 60;
    announces.push({ triggerAtElapsedSec: lastWarning, type: 'last_warning', messageKey: 'last_warning', fired: false });
  }

  announces.push({ triggerAtElapsedSec: totalDuration, type: 'completion', messageKey: 'completion', fired: false });

  // Interval announces
  for (let t = intervalSec; t < totalDuration - intervalSec / 2; t += intervalSec) {
    const nearMilestone = announces.some(a =>
      a.type !== 'interval' && Math.abs(a.triggerAtElapsedSec - t) < DEDUP_WINDOW_SEC
    );
    if (!nearMilestone) {
      announces.push({ triggerAtElapsedSec: t, type: 'interval', messageKey: 'interval', fired: false });
    }
  }

  // Motivational messages (pseudo-random, 2-4 messages)
  const count = totalDuration > 20 * 60 ? 4 : totalDuration > 10 * 60 ? 3 : 2;
  const motSlots: number[] = [];
  const seed = totalDuration; // deterministic per run duration

  for (let i = 0; i < count * 5 && motSlots.length < count; i++) {
    // pseudo-random position between 2min and totalDuration-2min
    const range = totalDuration - 4 * 60;
    const candidate = 2 * 60 + Math.abs((seed * (i + 7) * 2654435761) % range);

    const tooClose = [...announces, ...motSlots.map(t => ({ triggerAtElapsedSec: t }))].some(
      a => Math.abs(a.triggerAtElapsedSec - candidate) < MOTIVATIONAL_MIN_GAP_SEC
    );

    if (!tooClose) motSlots.push(candidate);
  }

  motSlots.forEach((t, idx) => {
    announces.push({
      triggerAtElapsedSec: Math.floor(t),
      type: 'motivational',
      messageKey: `motivational_${idx}`,
      fired: false,
    });
  });

  // Sort by trigger time
  announces.sort((a, b) => a.triggerAtElapsedSec - b.triggerAtElapsedSec);

  // Pre-mark already-fired (for addTime re-schedule)
  return announces.map(a => ({
    ...a,
    fired: a.triggerAtElapsedSec < minElapsed,
  }));
}
