// API Service Layer for connecting to the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthResponse {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: 'passenger' | 'driver' | 'both';
    avatar?: string;
    averageRating: number;
    totalRatings: number;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    fullName: string;
  };
  token: string;
}

interface BackendUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'passenger' | 'driver' | 'both';
  avatar?: string;
  averageRating: number;
  totalRatings: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  fullName: string;
}

interface BackendRide {
  _id: string;
  driver: BackendUser;
  startLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  endLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  totalDistance?: number;
  estimatedDuration?: number;
  status: string;
  passengers: Array<{
    user: BackendUser;
    status: string;
    pickupLocation: {
      type: string;
      coordinates: [number, number];
      address: string;
    };
  }>;
  preferences?: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    musicAllowed: boolean;
    airConditioned: boolean;
  };
}

interface DriverRegistration {
  licenseNumber: string;
  carMake: string;
  carModel: string;
  carYear: number;
  carRegistrationNumber: string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
}

interface RideCreation {
  startLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  endLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  preferences?: {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    musicAllowed: boolean;
    airConditioned: boolean;
  };
}

interface PaymentInitialization {
  rideId: string;
  seats: number;
  paymentMethod: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage if available
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Get headers with authentication
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
  }): Promise<ApiResponse<{ user: BackendUser }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Set token if login successful
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<{ user: BackendUser }>> {
    return this.request('/auth/profile');
  }

  // Driver methods
  async registerAsDriver(driverData: DriverRegistration): Promise<ApiResponse<any>> {
    return this.request('/driver/register', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async getDriverProfile(): Promise<ApiResponse<any>> {
    return this.request('/driver/profile');
  }

  // Ride methods
  async createRide(rideData: RideCreation): Promise<ApiResponse<{ ride: BackendRide }>> {
    return this.request('/rides', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  }

  async searchRides(params: {
    longitude: number;
    latitude: number;
    maxDistance?: number;
    departureTime?: string;
  }): Promise<ApiResponse<{ rides: BackendRide[]; count: number }>> {
    const queryParams = new URLSearchParams();
    queryParams.append('longitude', params.longitude.toString());
    queryParams.append('latitude', params.latitude.toString());
    
    if (params.maxDistance) {
      queryParams.append('maxDistance', params.maxDistance.toString());
    }
    
    if (params.departureTime) {
      queryParams.append('departureTime', params.departureTime);
    }

    return this.request(`/rides/search?${queryParams.toString()}`);
  }

  async getMyRides(type: 'all' | 'driving' | 'passenger' = 'all'): Promise<ApiResponse<{ rides: BackendRide[]; count: number }>> {
    return this.request(`/rides/my-rides?type=${type}`);
  }

  async joinRide(rideId: string, pickupLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/rides/${rideId}/join`, {
      method: 'POST',
      body: JSON.stringify({ pickupLocation }),
    });
  }

  // Payment methods
  async initializePayment(paymentData: PaymentInitialization): Promise<ApiResponse<{
    payment: {
      id: string;
      amount: number;
      totalAmount: number;
      currency: string;
      reference: string;
    };
    paystack: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }>> {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(reference: string): Promise<ApiResponse<{
    payment: {
      id: string;
      status: string;
      amount: number;
      paidAt: string;
    };
  }>> {
    return this.request(`/payments/verify/${reference}`, {
      method: 'POST',
    });
  }

  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    payments: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPayments: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    return this.request(`/payments/history?page=${page}&limit=${limit}`);
  }

  // Location methods
  async updateLocation(locationData: {
    longitude: number;
    latitude: number;
    address?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/location/update', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async geocodeAddress(address: string): Promise<ApiResponse<{
    address: string;
    coordinates: [number, number];
    placeId: string;
    types: string[];
  }>> {
    return this.request('/location/geocode', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  async reverseGeocode(longitude: number, latitude: number): Promise<ApiResponse<{
    address: string;
    coordinates: [number, number];
    placeId: string;
    types: string[];
    addressComponents: any[];
  }>> {
    return this.request('/location/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify({ longitude, latitude }),
    });
  }

  async calculateDistance(origin: any, destination: any): Promise<ApiResponse<{
    distance: number;
    unit: string;
    method: string;
  }>> {
    return this.request('/location/distance', {
      method: 'POST',
      body: JSON.stringify({ origin, destination }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    message: string;
    timestamp: string;
    environment: string;
  }>> {
    return this.request('/health');
  }

  // Google OAuth
  async googleAuth(token: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    // Set token if login successful
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Get Google OAuth URL
  async getGoogleAuthUrl(): Promise<ApiResponse<{
    authUrl: string;
    clientId: string;
  }>> {
    return this.request('/auth/google/url');
  }

  // Upload methods (if needed)
  async uploadFile(file: File, type: string): Promise<ApiResponse<{
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it for FormData
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
    });
  }

  // Logout
  logout() {
    this.clearToken();
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type {
  ApiResponse,
  AuthResponse,
  BackendUser,
  BackendRide,
  DriverRegistration,
  RideCreation,
  PaymentInitialization,
};
