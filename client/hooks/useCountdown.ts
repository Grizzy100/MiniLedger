import { useCallback, useEffect, useRef, useState } from "react";

/**
 * hooks/useCountdown.ts
 *
 * Provides a countdown timer that decrements once per second.
 * `start(duration)` resets and begins the timer.
 * The interval is cleared on unmount and on each new `start` call,
 * so there is never more than one live timer.
 */
export function useCountdown() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (duration: number) => {
      clear();
      setSeconds(duration);
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clear();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear],
  );

  // Clean up on unmount to prevent state updates on unmounted component.
  useEffect(() => () => clear(), [clear]);

  return {
    seconds,
    /** True while the countdown is running. */
    active: seconds > 0,
    start,
  };
}
