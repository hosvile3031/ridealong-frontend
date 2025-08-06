import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Users, Clock, AlertCircle, CheckCircle, Smartphone, Zap } from 'lucide-react';
import { Ride, Passenger } from '../types';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  userType: 'driver' | 'passenger';
  currentUser?: any;
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface PassengerLocation extends LocationData {
  passengerId: string;
  name: string;
  avatar: string;
  isInRange: boolean;
  distanceFromPickup: number;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, ride, userType, currentUser }) => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [passengerLocations, setPassengerLocations] = useState<PassengerLocation[]>([]);
  const [locationError, setLocationError] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [timeUntilPickup, setTimeUntilPickup] = useState<number>(0);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Mock pickup location (in real app, this would come from the ride data)
  const pickupLocation = {
    lat: 9.0579, // Berger Junction coordinates
    lng: 7.4951,
    name: ride.from.landmark
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Check if user is within pickup range
  const isWithinRange = (userLat: number, userLng: number): boolean => {
    const distance = calculateDistance(userLat, userLng, pickupLocation.lat, pickupLocation.lng);
    return distance <= 100; // 100 meter radius
  };

  // Calculate time until pickup
  useEffect(() => {
    const calculateTimeUntilPickup = () => {
      const rideDateTime = new Date(`${ride.date}T${ride.time}`);
      const now = new Date();
      const diffMs = rideDateTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      setTimeUntilPickup(diffMinutes);
    };

    calculateTimeUntilPickup();
    const interval = setInterval(calculateTimeUntilPickup, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [ride.date, ride.time]);

  // Start location tracking
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsTracking(true);
    setLocationError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    const successCallback = (position: GeolocationPosition) => {
      const newLocation: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

      setUserLocation(newLocation);

      // Check if user is within range and show alert if needed
      const inRange = isWithinRange(newLocation.lat, newLocation.lng);
      if (timeUntilPickup <= 5 && timeUntilPickup > 0 && !inRange) {
        setShowLocationAlert(true);
      }

      // Simulate other passengers' locations (in real app, this would come from real-time updates)
      if (userType === 'driver') {
        const mockPassengerLocations: PassengerLocation[] = ride.passengers.map((passenger, index) => {
          // Generate random locations within 50-200m of pickup point
          const randomOffset = (Math.random() - 0.5) * 0.004; // ~200m offset
          const passengerLat = pickupLocation.lat + randomOffset;
          const passengerLng = pickupLocation.lng + randomOffset;
          const distance = calculateDistance(passengerLat, passengerLng, pickupLocation.lat, pickupLocation.lng);
          
          return {
            passengerId: passenger.user.id,
            name: passenger.user.name,
            avatar: passenger.user.avatar,
            lat: passengerLat,
            lng: passengerLng,
            accuracy: 10,
            timestamp: Date.now(),
            isInRange: distance <= 100,
            distanceFromPickup: Math.round(distance)
          };
        });
        setPassengerLocations(mockPassengerLocations);
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      setIsTracking(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError('Location access denied. Please enable location permissions.');
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError('Location information unavailable.');
          break;
        case error.TIMEOUT:
          setLocationError('Location request timed out.');
          break;
        default:
          setLocationError('An unknown error occurred while retrieving location.');
          break;
      }
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

  const getLocationStatusColor = (distance: number) => {
    if (distance <= 50) return 'text-green-600 bg-green-50';
    if (distance <= 100) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getLocationStatusText = (distance: number) => {
    if (distance <= 50) return 'Perfect location!';
    if (distance <= 100) return 'Good location';
    return 'Too far from pickup';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-green-600" />
            <span>Pickup Location Tracker</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Time Alert */}
          {timeUntilPickup <= 5 && timeUntilPickup > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-orange-800 font-medium">Pickup Time Approaching!</p>
                <p className="text-orange-700 text-sm">
                  Only {timeUntilPickup} minute{timeUntilPickup !== 1 ? 's' : ''} until pickup. 
                  {userType === 'passenger' ? ' Please be within 100m of the pickup point.' : ' Track your passengers below.'}
                </p>
              </div>
            </div>
          )}

          {/* Location Alert */}
          {showLocationAlert && userType === 'passenger' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Location Required!</p>
                <p className="text-red-700 text-sm">
                  You must be within 100m of the pickup point 5 minutes before departure. Please move closer to {ride.from.landmark}.
                </p>
                <button
                  onClick={() => setShowLocationAlert(false)}
                  className="mt-2 text-red-600 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Ride Details */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Pickup Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Point:</span>
                  <span className="font-medium">{ride.from.landmark}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{ride.from.area}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Time:</span>
                  <span className="font-medium">{ride.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className={`font-medium ${timeUntilPickup <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                    {timeUntilPickup > 0 ? `${timeUntilPickup} min` : 'Pickup time passed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Tracking Controls */}
          <div className="bg-white border border-gray-200 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Location Tracking</h4>
              <button
                onClick={isTracking ? stopLocationTracking : startLocationTracking}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isTracking
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <Navigation className="h-4 w-4" />
                <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
              </button>
            </div>

            {locationError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                <p className="text-red-700 text-sm">{locationError}</p>
              </div>
            )}

            {userLocation && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Location:</span>
                  <span className="text-sm text-gray-500">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="text-sm text-gray-500">±{Math.round(userLocation.accuracy)}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance to Pickup:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getLocationStatusColor(calculateDistance(userLocation.lat, userLocation.lng, pickupLocation.lat, pickupLocation.lng))
                  }`}>
                    {Math.round(calculateDistance(userLocation.lat, userLocation.lng, pickupLocation.lat, pickupLocation.lng))}m - {
                      getLocationStatusText(calculateDistance(userLocation.lat, userLocation.lng, pickupLocation.lat, pickupLocation.lng))
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-100 rounded-xl overflow-hidden">
            <div 
              ref={mapRef}
              className="h-64 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative"
            >
              <div className="text-center">
                <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">Interactive Map</p>
                <p className="text-gray-500 text-sm">Pickup point and user locations</p>
              </div>
              
              {/* Pickup Point Marker */}
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Pickup Point</span>
              </div>

              {/* Range Indicator */}
              <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Within 50m</span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>50-100m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Beyond 100m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Locations (Driver View) */}
          {userType === 'driver' && passengerLocations.length > 0 && (
            <div className="bg-white border border-gray-200 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Passenger Locations</span>
              </h4>
              <div className="space-y-3">
                {passengerLocations.map((passenger) => (
                  <div key={passenger.passengerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={passenger.avatar}
                        alt={passenger.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{passenger.name}</div>
                        <div className="text-sm text-gray-500">
                          {passenger.lat.toFixed(6)}, {passenger.lng.toFixed(6)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getLocationStatusColor(passenger.distanceFromPickup)
                      }`}>
                        {passenger.distanceFromPickup}m
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {passenger.isInRange ? 'In range' : 'Too far'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Requirements */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Location Requirements</span>
            </h4>
            <div className="space-y-2 text-blue-800 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>All passengers must be within 100m of pickup point</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>Location tracking must be enabled 5 minutes before pickup</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>High accuracy GPS required for precise positioning</span>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="h-4 w-4 mt-0.5" />
                <span>Real-time location sharing with driver during pickup window</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {userType === 'passenger' && userLocation && (
              <button
                onClick={() => {
                  // In real app, this would share location with driver
                  alert('Location shared with driver!');
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Navigation className="h-5 w-5" />
                <span>Share Live Location</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;