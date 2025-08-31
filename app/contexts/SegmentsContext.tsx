import komOptimizer from '@/api/komOptimizer';
import { StravaSegment } from '@/types/types';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SegmentsContextValue {
  segments: StravaSegment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SegmentsContext = createContext<SegmentsContextValue | undefined>(undefined);

export const SegmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<StravaSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSegments = async () => {
    try {
      setLoading(true);
      setError(null);
      const starredSegments = await komOptimizer.getStarredSegments();
      setSegments(starredSegments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Serveur error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegments();
  }, []);

  return (
    <SegmentsContext.Provider value={{ segments, loading, error, refetch: loadSegments }}>
      {children}
    </SegmentsContext.Provider>
  );
};

export const useSegmentsContext = (): SegmentsContextValue => {
  const context = useContext(SegmentsContext);
  if (!context) {
    throw new Error('useSegmentsContext must be used within a SegmentsProvider');
  }
  return context;
};
