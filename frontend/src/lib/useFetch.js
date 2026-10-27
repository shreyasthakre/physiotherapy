import { useEffect, useState, useCallback } from 'react';
import api from './api.js';

/**
 * Minimal data-fetching hook. `select` extracts the payload from the
 * response data. Re-runs when `path` changes.
 */
export const useFetch = (path, { select = (d) => d, skip = false } = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);

  const refetch = useCallback(() => {
    if (skip) return;
    setLoading(true);
    setError(null);
    api
      .get(path)
      .then((res) => setData(select(res.data)))
      .catch((err) => setError(err))
      // eslint-disable-next-line no-use-before-define
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, skip]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};
