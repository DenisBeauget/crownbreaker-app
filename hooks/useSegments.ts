import { useEffect, useState } from 'react';
import komOptimizer from '../api/komOptimizer';
import { StravaSegment } from '../types/types';

interface UseSegmentsReturn {
  segments: StravaSegment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSegments = (): UseSegmentsReturn => {
  const [segments, setSegments] = useState<StravaSegment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSegments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const starredSegments = await komOptimizer.getStarredSegments(); 
      setSegments(starredSegments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegments();
  }, []);

  return {
    segments,
    loading,
    error,
    refetch: loadSegments
  };
};