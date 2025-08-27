import AsyncStorage from "@react-native-async-storage/async-storage";
import { OptimizedRouteRequest, OptimizedRouteResponse, StravaSegment, StravaSegmentDetails, UserRoute } from '../types/types';

const API_BASE_URL = "https://kom-optimizer-production.up.railway.app/api";


class komOptimizer {

    async getAccessTokenFromStorage(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem("authToken");
        } catch(error: any) {
            console.error("No token found", error);
            return null;
        }
    }

    // starred
  async getStarredSegments(): Promise<StravaSegment[]> {
    try {
      const token = await this.getAccessTokenFromStorage();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/user/segments/starred`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.segments as StravaSegment[];
    } catch (error) {
      console.error('Error when get starred:', error);
      throw error;
    }
  }

  // get segment details
  async getSegmentDetails(segmentId: number): Promise<StravaSegmentDetails> {
    try {
      const token = await this.getAccessTokenFromStorage();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/user/segment/${segmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.segment as StravaSegmentDetails;
    } catch (error) {
      console.error('Error when get segment:', error);
      throw error;
    }
  }

  // optimize
  async generateOptimizedRoute(request: OptimizedRouteRequest): Promise<OptimizedRouteResponse> {
    try {
      const token = await this.getAccessTokenFromStorage();
      if (!token) {
          throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/route/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as OptimizedRouteResponse;
    } catch (error) {
      console.error('Error when generate route:', error);
      throw error;
    }
  }

  // all routes
  async getUserRoutes(): Promise<UserRoute[]> {
    try {
      const token = await this.getAccessTokenFromStorage();
      if (!token) {
          throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/route/my-routes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.routes as UserRoute[];
    } catch (error) {
      console.error('Error when get user routes:', error);
      throw error;
    }
  }

  // specific route
  async getRoute(routeId: string): Promise<any> {
    try {
      const token = await this.getAccessTokenFromStorage();
      if (!token) {
          throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/route/${routeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.route;
    } catch (error) {
      console.error('Error when get route:', error);
      throw error;
    }
  }

  // Export
  async exportRoute(routeId: string, format: 'gpx' | 'json' | 'tcx'): Promise<any> {
    try {
      const token = await this.getAccessTokenFromStorage();
      if (!token) {
          throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/route/${routeId}/export/${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.text(); 
    } catch (error) {
      console.error('Error when export:', error);
      throw error;
    }
  }
}

export default new komOptimizer();