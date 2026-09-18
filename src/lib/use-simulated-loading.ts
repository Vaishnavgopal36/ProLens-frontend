import * as React from "react";

/**
 * Mimics an async data fetch's isLoading flag so skeleton states can be
 * previewed against mock data today and swapped for a real query later.
 */
export function useSimulatedLoading(delayMs = 500) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return isLoading;
}
