import { useCallback, useEffect, useState } from "react";

// Calls fetcher() now and then every `ms` milliseconds.
export default function usePolling(fetcher, ms = 2000, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await fetcher());
      setError(null);
    } catch (e) {
      setError(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    const timer = setInterval(load, ms);
    return () => clearInterval(timer);
  }, [load, ms]);

  return { data, error, reload: load };
}
