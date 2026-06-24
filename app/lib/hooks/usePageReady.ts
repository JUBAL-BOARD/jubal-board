import { useMemo } from "react";

/**
 * Pass in any number of loading booleans from your hooks.
 * Returns true only when ALL of them are false (i.e. everything is ready).
 *
 * Usage:
 *   const isReady = usePageReady(profileLoading, kycLoading, pitchesLoading);
 */
const usePageReady = (...loadingStates: boolean[]): boolean => {
  return useMemo(
    () => loadingStates.every((state) => state === false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadingStates
  );
};

export default usePageReady;