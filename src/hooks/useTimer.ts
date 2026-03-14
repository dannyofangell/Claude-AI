import { useEffect, useRef } from 'react';
import { useRunStore } from '../store/runStore';

export function useTimer() {
  const phase = useRunStore(s => s.state.phase);
  const tick = useRunStore(s => s.tick);

  const rafRef = useRef<number>(0);
  const startWallTime = useRef<number>(0);
  const totalPausedMs = useRef<number>(0);
  const pauseStartTime = useRef<number>(0);

  useEffect(() => {
    if (phase === 'running') {
      // Starting or resuming
      const now = performance.now();
      if (startWallTime.current === 0) {
        startWallTime.current = now;
      } else {
        // Resuming from pause
        totalPausedMs.current += now - pauseStartTime.current;
      }

      const loop = (now: number) => {
        const elapsedMs = now - startWallTime.current - totalPausedMs.current;
        tick(elapsedMs / 1000);
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafRef.current);
    }

    if (phase === 'paused') {
      cancelAnimationFrame(rafRef.current);
      pauseStartTime.current = performance.now();
    }

    if (phase === 'idle' || phase === 'complete') {
      cancelAnimationFrame(rafRef.current);
      startWallTime.current = 0;
      totalPausedMs.current = 0;
      pauseStartTime.current = 0;
    }
  }, [phase, tick]);
}
