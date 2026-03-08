import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '../types';

// Configure base URL - change for production
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          // Server responded with error
          const errorData = error.response.data?.error || {
            code: 'UNKNOWN_ERROR',
            message: error.message,
          };
          console.error(`API Error: ${errorData.code} - ${errorData.message}`);
          throw new Error(errorData.message);
        } else if (error.request) {
          // No response received
          console.error('Network Error: No response from server');
          throw new Error('No se pudo conectar al servidor');
        } else {
          // Request setup error
          console.error('Request Error:', error.message);
          throw new Error(error.message);
        }
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
