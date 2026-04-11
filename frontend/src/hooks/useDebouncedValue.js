import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delay` ms (search debounce).
 */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
