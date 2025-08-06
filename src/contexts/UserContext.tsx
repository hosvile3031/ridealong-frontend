import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { AuthUser } from '../types';

interface UserContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        // Verify token and get user profile
        const response = await apiService.getProfile();
        if (response.success) {
          const userData = {
            id: response.data.user._id || response.data.user.id,
            name: response.data.user.firstName ? 
              `${response.data.user.firstName} ${response.data.user.lastName}` : 
              response.data.user.name || 'User',
            email: response.data.user.email,
            phone: response.data.user.phone || '',
            location: response.data.user.location || '',
            avatar: response.data.user.avatar || getDefaultAvatar(),
            verified: response.data.user.isEmailVerified || false,
            rating: response.data.user.averageRating || 5.0,
            ridesCompleted: response.data.user.totalRatings || 0
          };
          setUser(userData);
        } else {
          // Invalid token, clear it
          localStorage.removeItem('token');
          apiService.clearToken();
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('token');
      apiService.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const userData = {
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.firstName ? 
            `${response.data.user.firstName} ${response.data.user.lastName}` : 
            response.data.user.name || 'User',
          email: response.data.user.email,
          phone: response.data.user.phone || '',
          location: response.data.user.location || '',
          avatar: response.data.user.avatar || getDefaultAvatar(),
          verified: response.data.user.isEmailVerified || false,
          rating: response.data.user.averageRating || 5.0,
          ridesCompleted: response.data.user.totalRatings || 0
        };
        
        setUser(userData);
        
        // Store token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.register(userData);
      
      if (response.success) {
        const newUser = {
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.firstName ? 
            `${response.data.user.firstName} ${response.data.user.lastName}` : 
            userData.firstName + ' ' + userData.lastName,
          email: response.data.user.email,
          phone: response.data.user.phone || userData.phone,
          location: userData.location || '',
          avatar: response.data.user.avatar || getDefaultAvatar(),
          verified: response.data.user.isEmailVerified || false,
          rating: 5.0,
          ridesCompleted: 0
        };
        
        setUser(newUser);
        return true;
      } else {
        setError(response.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    apiService.clearToken();
    setError(null);
  };

  const refreshProfile = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        const userData = {
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.firstName ? 
            `${response.data.user.firstName} ${response.data.user.lastName}` : 
            response.data.user.name || 'User',
          email: response.data.user.email,
          phone: response.data.user.phone || '',
          location: response.data.user.location || '',
          avatar: response.data.user.avatar || getDefaultAvatar(),
          verified: response.data.user.isEmailVerified || false,
          rating: response.data.user.averageRating || 5.0,
          ridesCompleted: response.data.user.totalRatings || 0
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Profile refresh failed:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const getDefaultAvatar = () => {
    const avatars = [
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const value: UserContextType = {
    user,
    setUser,
    login,
    register,
    logout,
    isLoading,
    error,
    clearError,
    refreshProfile,
    isLoggedIn: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
