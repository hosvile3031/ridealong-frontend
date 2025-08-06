import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ride } from '../types';
import apiService from '../services/api';
import { io, Socket } from 'socket.io-client';

interface RideContextType {
  rides: Ride[];
  myRides: Ride[];
  isLoading: boolean;
  error: string | null;
  searchRides: (params: SearchParams) => Promise<void>;
  createRide: (rideData: any) => Promise<Ride | null>;
  joinRide: (rideId: string, pickupLocation: any) => Promise<boolean>;
  getMyRides: (type?: 'all' | 'driving' | 'passenger') => Promise<void>;
  refreshRides: () => Promise<void>;
  clearError: () => void;
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

interface SearchParams {
  longitude: number;
  latitude: number;
  maxDistance?: number;
  departureTime?: string;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

interface RideProviderProps {
  children: ReactNode;
}

export const RideProvider: React.FC<RideProviderProps> = ({ children }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to socket when component mounts
    connectSocket();
    
    return () => {
      // Cleanup socket connection on unmount
      disconnectSocket();
    };
  }, []);

  const connectSocket = () => {
    if (socket?.connected) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to real-time updates');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time updates');
    });

    newSocket.on('ride-updated', (updatedRide: Ride) => {
      console.log('🔄 Ride updated:', updatedRide.id);
      
      // Update rides list
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === updatedRide.id ? updatedRide : ride
        )
      );
      
      // Update myRides list
      setMyRides(prevMyRides => 
        prevMyRides.map(ride => 
          ride.id === updatedRide.id ? updatedRide : ride
        )
      );
    });

    newSocket.on('new-booking', (data: { rideId: string, passenger: any }) => {
      console.log('🎉 New booking received:', data);
      // Update the specific ride with new passenger count
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === data.rideId 
            ? { ...ride, availableSeats: ride.availableSeats - 1 }
            : ride
        )
      );
    });

    newSocket.on('ride-cancelled', (rideId: string) => {
      console.log('🚫 Ride cancelled:', rideId);
      
      // Remove from rides list
      setRides(prevRides => prevRides.filter(ride => ride.id !== rideId));
      
      // Update status in myRides
      setMyRides(prevMyRides => 
        prevMyRides.map(ride => 
          ride.id === rideId ? { ...ride, status: 'cancelled' } : ride
        )
      );
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const searchRides = async (params: SearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.searchRides(params);
      
      if (response.success) {
        // Transform backend rides to frontend format
        const transformedRides = response.data.rides.map(transformBackendRide);
        setRides(transformedRides);
      } else {
        setError('Failed to search rides');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to search rides');
    } finally {
      setIsLoading(false);
    }
  };

  const createRide = async (rideData: any): Promise<Ride | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.createRide(rideData);
      
      if (response.success) {
        const newRide = transformBackendRide(response.data.ride);
        
        // Add to myRides
        setMyRides(prev => [...prev, newRide]);
        
        // Join the ride room for real-time updates
        if (socket) {
          socket.emit('join-ride-room', newRide.id);
        }
        
        return newRide;
      } else {
        setError('Failed to create ride');
        return null;
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create ride');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const joinRide = async (rideId: string, pickupLocation: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.joinRide(rideId, pickupLocation);
      
      if (response.success) {
        // Update the ride in both lists
        setRides(prevRides => 
          prevRides.map(ride => 
            ride.id === rideId 
              ? { ...ride, availableSeats: ride.availableSeats - 1 }
              : ride
          )
        );
        
        // Join the ride room for real-time updates
        if (socket) {
          socket.emit('join-ride-room', rideId);
        }
        
        // Refresh myRides to include the new booking
        await getMyRides();
        
        return true;
      } else {
        setError('Failed to join ride');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Failed to join ride');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getMyRides = async (type: 'all' | 'driving' | 'passenger' = 'all') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getMyRides(type);
      
      if (response.success) {
        const transformedRides = response.data.rides.map(transformBackendRide);
        setMyRides(transformedRides);
        
        // Join all ride rooms for real-time updates
        if (socket) {
          transformedRides.forEach(ride => {
            socket.emit('join-ride-room', ride.id);
          });
        }
      } else {
        setError('Failed to fetch your rides');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch your rides');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRides = async () => {
    // Refresh the current search results with last used parameters
    // This is a simplified version - you might want to store search params
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user's location for a general search
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await searchRides({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              maxDistance: 50 // 50km radius
            });
          },
          () => {
            // Fallback to Lagos coordinates if location access denied
            searchRides({
              latitude: 6.5244,
              longitude: 3.3792,
              maxDistance: 50
            });
          }
        );
      }
    } catch (error: any) {
      setError(error.message || 'Failed to refresh rides');
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Transform backend ride format to frontend format
  const transformBackendRide = (backendRide: any): Ride => {
    return {
      id: backendRide._id,
      driver: {
        id: backendRide.driver._id,
        name: backendRide.driver.firstName + ' ' + backendRide.driver.lastName,
        email: backendRide.driver.email,
        phone: backendRide.driver.phone || '',
        rating: backendRide.driver.averageRating || 5.0,
        avatar: backendRide.driver.avatar || getRandomAvatar(),
        verified: backendRide.driver.isEmailVerified || false,
        ridesCompleted: backendRide.driver.totalRatings || 0
      },
      from: {
        landmark: backendRide.startLocation.address.split(',')[0],
        area: backendRide.startLocation.address.split(',')[0],
        state: backendRide.startLocation.address.split(',')[1] || 'Unknown',
        coordinates: {
          lat: backendRide.startLocation.coordinates[1],
          lng: backendRide.startLocation.coordinates[0]
        }
      },
      to: {
        landmark: backendRide.endLocation.address.split(',')[0],
        area: backendRide.endLocation.address.split(',')[0],
        state: backendRide.endLocation.address.split(',')[1] || 'Unknown',
        coordinates: {
          lat: backendRide.endLocation.coordinates[1],
          lng: backendRide.endLocation.coordinates[0]
        }
      },
      date: new Date(backendRide.departureTime).toISOString().split('T')[0],
      time: new Date(backendRide.departureTime).toTimeString().slice(0, 5),
      totalSeats: backendRide.availableSeats,
      availableSeats: backendRide.availableSeats,
      basePricePerSeat: backendRide.pricePerSeat,
      currentPricePerSeat: backendRide.pricePerSeat,
      duration: calculateDuration(backendRide.startLocation, backendRide.endLocation),
      distance: calculateDistance(backendRide.startLocation, backendRide.endLocation),
      description: `Comfortable ride with ${backendRide.driver.firstName}`,
      amenities: getAmenitiesFromPreferences(backendRide.preferences),
      pickupPoints: [
        {
          landmark: backendRide.startLocation.address.split(',')[0],
          area: backendRide.startLocation.address.split(',')[0],
          state: backendRide.startLocation.address.split(',')[1] || 'Unknown',
          coordinates: {
            lat: backendRide.startLocation.coordinates[1],
            lng: backendRide.startLocation.coordinates[0]
          }
        }
      ],
      dropoffPoints: [
        {
          landmark: backendRide.endLocation.address.split(',')[0],
          area: backendRide.endLocation.address.split(',')[0],
          state: backendRide.endLocation.address.split(',')[1] || 'Unknown',
          coordinates: {
            lat: backendRide.endLocation.coordinates[1],
            lng: backendRide.endLocation.coordinates[0]
          }
        }
      ],
      status: backendRide.status || 'active',
      passengers: [],
      shareableLink: `${window.location.origin}/ride/${backendRide._id}`,
      isInterstate: isInterstateRoute(backendRide.startLocation, backendRide.endLocation)
    };
  };

  // Helper functions
  const getRandomAvatar = () => {
    const avatars = [
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      'https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const getAmenitiesFromPreferences = (preferences: any) => {
    const amenities = [];
    if (preferences?.airConditioned) amenities.push('AC');
    if (preferences?.musicAllowed) amenities.push('Music');
    if (preferences?.smokingAllowed) amenities.push('Smoking Allowed');
    return amenities;
  };

  const calculateDuration = (start: any, end: any) => {
    // This is a simplified calculation - in real app, use Google Maps API
    return Math.random() > 0.5 ? '45 min' : '1h 15min';
  };

  const calculateDistance = (start: any, end: any) => {
    // This is a simplified calculation - in real app, use Google Maps API
    return Math.floor(Math.random() * 50 + 10) + ' km';
  };

  const isInterstateRoute = (start: any, end: any) => {
    const startState = start.address.split(',')[1]?.trim();
    const endState = end.address.split(',')[1]?.trim();
    return startState && endState && startState !== endState;
  };

  const value: RideContextType = {
    rides,
    myRides,
    isLoading,
    error,
    searchRides,
    createRide,
    joinRide,
    getMyRides,
    refreshRides,
    clearError,
    socket,
    connectSocket,
    disconnectSocket
  };

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = (): RideContextType => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
