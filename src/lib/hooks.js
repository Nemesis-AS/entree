import { useState, useEffect } from 'react';

export function usePoll(url, interval = 5000) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(url);
        setData(await res.json());
      } catch {}
    };
    run();
    const id = setInterval(run, interval);
    return () => clearInterval(id);
  }, [url]);
  return data;
}
