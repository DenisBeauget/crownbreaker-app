export interface StravaSegment {
  id: number;
  name: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: boolean;
  starred: boolean;
  map?: {
    id: string;
    polyline: string;
    summary_polyline: string;
  };
}

export interface StravaSegmentDetails extends StravaSegment {
  created_at: string;
  updated_at: string;
  total_elevation_gain: number;
  effort_count: number;
  athlete_count: number;
  hazardous: boolean;
  star_count: number;
}

export interface OptimizedRouteRequest {
  segmentIds: number[];
  startPoint: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  profile: 'bike' | 'foot' | 'moutainbike';
  goBack: boolean;
  routeName?: string;
}

export interface OptimizedRouteResponse {
  success: boolean;
  message: string;
  data: {
    routeId: string;
    totalDistance: number;
    totalDuration: number;
    segments: any[];
    waypoints: any[];
  };
}

export interface UserRoute {
  id: string;
  name: string;
  totalDistance: number;
  totalDuration: number;
  segmentCount: number;
  createdAt: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}