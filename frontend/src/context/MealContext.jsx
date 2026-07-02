import { createContext, useEffect, useMemo, useState } from 'react';
import { menuApi } from '../api/api';

export const MealContext = createContext();

export function MealProvider({ children }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMeals() {
      setLoading(true);
      setError('');
      try {
        const data = await menuApi.getAll(searchQuery);
        setMeals(data.data || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Gagal memuat menu');
          setMeals([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    const delay = setTimeout(fetchMeals, 350);
    return () => {
      controller.abort();
      clearTimeout(delay);
    };
  }, [searchQuery]);

  const value = useMemo(() => ({
    meals,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshMeals: async () => {
      const data = await menuApi.getAll(searchQuery);
      setMeals(data.data || []);
    },
  }), [meals, loading, error, searchQuery]);

  return (
    <MealContext.Provider value={value}>
      {children}
    </MealContext.Provider>
  );
}
