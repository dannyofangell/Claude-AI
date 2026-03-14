import type { ScheduledAnnouncement } from '../types/run';

const DEDUP_WINDOW_SEC = 60;
const CONTENT_INTERVAL_SEC = 2 * 60; // poem/fact every 2 minutes

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

  if (totalDuration > 10 * 60) {
    const lastWarning = totalDuration - 5 * 60;
    announces.push({ triggerAtElapsedSec: lastWarning, type: 'last_warning', messageKey: 'last_warning', fired: false });
  }

  announces.push({ triggerAtElapsedSec: totalDuration, type: 'completion', messageKey: 'completion', fired: false });

  // Time interval announces (every 5 min)
  for (let t = intervalSec; t < totalDuration - intervalSec / 2; t += intervalSec) {
    const nearMilestone = announces.some(a =>
      a.type !== 'interval' && Math.abs(a.triggerAtElapsedSec - t) < DEDUP_WINDOW_SEC
    );
    if (!nearMilestone) {
      announces.push({ triggerAtElapsedSec: t, type: 'interval', messageKey: 'interval', fired: false });
    }
  }

  // Content announcements (poem/fact) every 2 minutes
  // Start at 2 min, skip last 2 min, skip if near another announcement
  let contentIdx = 0;
  for (let t = CONTENT_INTERVAL_SEC; t < totalDuration - CONTENT_INTERVAL_SEC; t += CONTENT_INTERVAL_SEC) {
    const nearOther = announces.some(a =>
      Math.abs(a.triggerAtElapsedSec - t) < DEDUP_WINDOW_SEC
    );
    if (!nearOther) {
      announces.push({
        triggerAtElapsedSec: t,
        type: 'motivational',
        messageKey: `content_${contentIdx}`,
        fired: false,
      });
      contentIdx++;
    }
  }

  announces.sort((a, b) => a.triggerAtElapsedSec - b.triggerAtElapsedSec);

  return announces.map(a => ({
    ...a,
    fired: a.triggerAtElapsedSec < minElapsed,
  }));
}

// Count how many content slots will be needed for a given duration
export function countContentSlots(totalDuration: number, intervalSec: number): number {
  const tempAnnounces: { triggerAtElapsedSec: number }[] = [
    { triggerAtElapsedSec: 0 },
    { triggerAtElapsedSec: Math.floor(totalDuration / 2) },
    { triggerAtElapsedSec: Math.floor(totalDuration * 0.75) },
    { triggerAtElapsedSec: totalDuration - 5 * 60 },
    { triggerAtElapsedSec: totalDuration },
  ];
  for (let t = intervalSec; t < totalDuration - intervalSec / 2; t += intervalSec) {
    tempAnnounces.push({ triggerAtElapsedSec: t });
  }
  let count = 0;
  for (let t = CONTENT_INTERVAL_SEC; t < totalDuration - CONTENT_INTERVAL_SEC; t += CONTENT_INTERVAL_SEC) {
    const nearOther = tempAnnounces.some(a => Math.abs(a.triggerAtElapsedSec - t) < DEDUP_WINDOW_SEC);
    if (!nearOther) count++;
  }
  return Math.max(count, 1);
}
