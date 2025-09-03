import { decode } from '@mapbox/polyline';
import { MapRegion, StravaSegment } from '../types/types';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export const decodePolyline = (encodedPolyline?: string): Coordinate[] => {
  if (!encodedPolyline) return [];
  
  try {
    return decode(encodedPolyline).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));
  } catch (error) {
    console.error('Erreur décodage polyline:', error);
    return [];
  }
};

export const calculateMapRegion = (segments: StravaSegment[]): MapRegion => {
  if (!segments || segments.length === 0) {
    return {
      latitude: 45.764,
      longitude: 4.835,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  segments.forEach(segment => {
    if (segment.start_latlng) {
      const [lat, lng] = segment.start_latlng;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
    if (segment.end_latlng) {
      const [lat, lng] = segment.end_latlng;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  });

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.2,
    longitudeDelta: (maxLng - minLng) * 1.2,
  };
};