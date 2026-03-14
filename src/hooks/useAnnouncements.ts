import { useEffect, useRef } from 'react';
import { useRunStore } from '../store/runStore';
import { useSpeech } from './useSpeech';
import { pickMessage } from '../constants/messages';
import { formatTimeVerbose } from '../utils/formatTime';
import { estimateDistanceKm, formatDistance } from '../utils/paceCalc';
import { DEFAULT_PACE_SEC_PER_KM } from '../constants/presets';
import type { ScheduledAnnouncement } from '../types/run';

function buildContext(elapsed: number, totalDuration: number, paceSecPerKm?: number) {
  const remaining = totalDuration - elapsed;
  const pace = paceSecPerKm ?? DEFAULT_PACE_SEC_PER_KM;
  const distKm = estimateDistanceKm(elapsed, pace);
  return {
    elapsed: formatTimeVerbose(elapsed),
    remaining: formatTimeVerbose(remaining),
    duration: formatTimeVerbose(totalDuration),
    distanceKm: formatDistance(distKm),
  };
}

function getContentIndex(messageKey: string): number | null {
  const match = messageKey.match(/^content_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

function getMessageForAnnouncement(
  ann: ScheduledAnnouncement,
  ctx: ReturnType<typeof buildContext>,
  contentPool: (string | null)[],
): string {
  // content_N keys use fetched poems/facts, fall back to built-in
  if (ann.type === 'motivational') {
    const idx = getContentIndex(ann.messageKey);
    if (idx !== null) {
      const fetched = contentPool[idx];
      if (fetched) return fetched;
    }
    return pickMessage('motivational', ctx);
  }

  switch (ann.type) {
    case 'start': return pickMessage('start', ctx);
    case 'interval': return pickMessage('interval', ctx);
    case 'halfway': return pickMessage('halfway', ctx);
    case 'three_quarters': return pickMessage('three_quarters', ctx);
    case 'last_warning': return pickMessage('last_warning', ctx);
    case 'completion': return pickMessage('completion', ctx);
    default: return '';
  }
}

export function useAnnouncements() {
  const elapsedSec = useRunStore(s => s.state.elapsedSec);
  const totalDuration = useRunStore(s => s.state.totalDuration);
  const announcements = useRunStore(s => s.state.announcements);
  const paceSecPerKm = useRunStore(s => s.state.config.paceSecondsPerKm);
  const contentPool = useRunStore(s => s.contentPool);
  const markFired = useRunStore(s => s.markAnnouncementFired);
  const phase = useRunStore(s => s.state.phase);
  const { speak } = useSpeech();

  const processedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (phase === 'idle') processedRef.current = new Set();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running' && phase !== 'complete') return;

    announcements.forEach((ann, idx) => {
      if (!ann.fired && !processedRef.current.has(idx) && elapsedSec >= ann.triggerAtElapsedSec) {
        processedRef.current.add(idx);
        markFired(idx);
        const ctx = buildContext(elapsedSec, totalDuration, paceSecPerKm);
        const msg = getMessageForAnnouncement(ann, ctx, contentPool);
        if (msg) speak(msg, { rate: 0.95 }); // slightly slower for poems
      }
    });
  }, [elapsedSec, phase, announcements, totalDuration, paceSecPerKm, contentPool, markFired, speak]);
}
