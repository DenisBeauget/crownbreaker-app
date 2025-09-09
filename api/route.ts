import { StravaSegment } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RouteConfig {
  routeName: string;
  startPoint: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  profile: 'bike' | 'foot' | 'moutainbike';
  goBack: boolean;
}

export interface GeneratedRoute {
  routeId: string;
  totalDistance: number;
  totalDuration: number;
  segments: {
    id: string;
    name: string;
    distance: number;
    komTime: number | null;
    startPoint: {
      latitude: number;
      longitude: number;
    };
  }[];
  fullGeometry: {
    latitude: number;
    longitude: number;
    name?: string;
    }[];
  waypoints: {
    latitude: number;
    longitude: number;
    name?: string;
  }[];
}

const API_BASE_URL = "https://kom-optimizer-production.up.railway.app/api";

export class RouteApiService {
  private static baseUrl = "https://kom-optimizer-production.up.railway.app/api";

   static async getAccessTokenFromStorage(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem("authToken");
        } catch(error: any) {
            console.error("No token found", error);
            return null;
        }
    }
  
  static async generateRoute(
    config: RouteConfig, 
    selectedSegments: StravaSegment[]
  ): Promise<GeneratedRoute> {
    try {

    const token = await this.getAccessTokenFromStorage();
      if (!token) {
        throw new Error('No token found');
      }


      // Convertir les segments Strava en IDs pour l'API
      const segmentIds = selectedSegments.map(segment => segment.id.toString());
      
      const requestBody = {
        segmentIds,
        startPoint: config.startPoint,
        routeName: config.routeName,
        profile: config.profile,
        goBack: config.goBack
      };

      console.log('Envoi de la requête:', requestBody);

      const response = await fetch(`${API_BASE_URL}/route/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la génération de la route');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la génération de la route');
      }

      return {
        routeId: result.data.routeId,
        totalDistance: result.data.totalDistance,
        totalDuration: result.data.totalDuration,
        segments: result.data.segments,
        fullGeometry: result.data.fullGeometry,
        waypoints: result.data.waypoints
      };

    } catch (error) {
      console.error('Erreur API generateRoute:', error);
      throw error;
    }
  }

  static async getUserRoutes(): Promise<{
    id: string;
    name: string;
    totalDistance: number;
    totalDuration: number;
    segmentCount: number;
    createdAt: string;
  }[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/route/my-routes`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des routes');
      }

      const result = await response.json();
      return result.routes;

    } catch (error) {
      console.error('Erreur API getUserRoutes:', error);
      throw error;
    }
  }

  static async getRoute(routeId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Route non trouvée');
      }

      const result = await response.json();
      return result.route;

    } catch (error) {
      console.error('Erreur API getRoute:', error);
      throw error;
    }
  }

  static async exportRoute(routeId: string, format: 'gpx' | 'json' | 'tcx' = 'gpx'): Promise<string> {
    try {

      const token = await this.getAccessTokenFromStorage();
      if (!token) {
        throw new Error('No token found');
      }



      const response = await fetch(`${API_BASE_URL}/route/${routeId}/export/${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export de la route');
      }

      return await response.text();

    } catch (error) {
      console.error('Erreur API exportRoute:', error);
      throw error;
    }
  }

 private static async getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log("TOKEN", token)
    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token', error);
    return null;
  }
}
}