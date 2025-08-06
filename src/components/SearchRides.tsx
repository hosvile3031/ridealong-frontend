import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock, Users, Star, Zap, Wifi, Music, Car, Share2, TrendingDown, AlertCircle, Navigation, Shield, Luggage, Plane } from 'lucide-react';
import { mockRides, nigerianStates, popularCities } from '../utils/data';
import { Ride, Payment, AuthUser } from '../types';
import PaymentModal from './PaymentModal';
import ShareRideModal from './ShareRideModal';
import MapModal from './MapModal';
import ReportModal from './ReportModal';

interface SearchRidesProps {
  user: AuthUser | null;
  onAuthRequired: (mode: 'signin' | 'signup') => void;
}

const SearchRides: React.FC<SearchRidesProps> = ({ user, onAuthRequired }) => {
  const [fromState, setFromState] = useState('');
  const [fromArea, setFromArea] = useState('');
  const [toState, setToState] = useState('');
  const [toArea, setToArea] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [hasLuggage, setHasLuggage] = useState(false);
  const [showInterstate, setShowInterstate] = useState(false);
  const [filteredRides, setFilteredRides] = useState<Ride[]>(mockRides.filter(ride => !ride.isInterstate));
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [shareRide, setShareRide] = useState<Ride | null>(null);
  const [mapRide, setMapRide] = useState<Ride | null>(null);
  const [reportRide, setReportRide] = useState<Ride | null>(null);

  const handleSearch = () => {
    let filtered = mockRides;
    
    // Filter by interstate preference first
    filtered = filtered.filter(ride => 
      showInterstate ? ride.isInterstate : !ride.isInterstate
    );
    
    if (fromState) {
      filtered = filtered.filter(ride => 
        ride.from.state.toLowerCase().includes(fromState.toLowerCase())
      );
    }

    if (fromArea) {
      filtered = filtered.filter(ride => 
        ride.from.area.toLowerCase().includes(fromArea.toLowerCase())
      );
    }
    
    if (toState) {
      filtered = filtered.filter(ride => 
        ride.to.state.toLowerCase().includes(toState.toLowerCase())
      );
    }

    if (toArea) {
      filtered = filtered.filter(ride => 
        ride.to.area.toLowerCase().includes(toArea.toLowerCase())
      );
    }
    
    if (date) {
      filtered = filtered.filter(ride => ride.date === date);
    }

    if (time) {
      filtered = filtered.filter(ride => ride.time >= time);
    }

    if (hasLuggage) {
      filtered = filtered.filter(ride => ride.allowsLuggage);
    }

    // Filter by available seats for passengers
    filtered = filtered.filter(ride => ride.availableSeats >= passengers);
    
    setFilteredRides(filtered);
  };

  // Update filtered rides when switching between local and interstate
  React.useEffect(() => {
    const filtered = mockRides.filter(ride => 
      showInterstate ? ride.isInterstate : !ride.isInterstate
    );
    setFilteredRides(filtered);
  }, [showInterstate]);

  const handleBookRide = (ride: Ride) => {
    if (!user) {
      onAuthRequired('signin');
      return;
    }
    setSelectedRide(ride);
    setSeatsToBook(passengers);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (payment: Payment) => {
    console.log('Payment completed:', payment);
    setShowPaymentModal(false);
    setSelectedRide(null);
    setSeatsToBook(1);
    // Here you would typically update the ride data and refresh the list
  };

  const handleShareRide = (ride: Ride) => {
    setShareRide(ride);
    setShowShareModal(true);
  };

  const handleViewPickupLocation = (ride: Ride) => {
    if (!user) {
      onAuthRequired('signin');
      return;
    }
    setMapRide(ride);
    setShowMapModal(true);
  };

  const handleReportDriver = (ride: Ride) => {
    if (!user) {
      onAuthRequired('signin');
      return;
    }
    setReportRide(ride);
    setShowReportModal(true);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'ac': return <Zap className="h-4 w-4" />;
      case 'music': return <Music className="h-4 w-4" />;
      case 'phone charging': return <Zap className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getSavingsInfo = (ride: Ride) => {
    const savings = ride.basePricePerSeat - ride.currentPricePerSeat;
    const discountPercentage = Math.round((savings / ride.basePricePerSeat) * 100);
    return { savings, discountPercentage };
  };

  const getTimeUntilRide = (ride: Ride) => {
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    const diffMs = rideDateTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMs < 0) return null;
    if (diffMinutes <= 5) return 'pickup-soon';
    if (diffMinutes <= 60) return 'pickup-hour';
    return 'pickup-later';
  };

  const calculateTotalPrice = (ride: Ride) => {
    let total = ride.currentPricePerSeat * passengers;
    if (hasLuggage && ride.luggagePrice) {
      total += ride.luggagePrice;
    }
    return total;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Your pick of rides at
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"> low prices</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Whatever distance you're going, by bus or carpool, find the perfect ride from our wide range of destinations and routes at low prices.
        </p>
      </div>

      {/* Trip Type Toggle */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex">
          <button
            onClick={() => setShowInterstate(false)}
            className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 ${
              !showInterstate
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Car className="h-6 w-6" />
            <div className="text-left">
              <div className="font-bold">Local Rides</div>
              <div className="text-xs opacity-80">Within same state</div>
            </div>
          </button>
          <button
            onClick={() => setShowInterstate(true)}
            className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 ${
              showInterstate
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plane className="h-6 w-6" />
            <div className="text-left">
              <div className="font-bold">Interstate Travel</div>
              <div className="text-xs opacity-80">Between states</div>
            </div>
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Leaving from</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={fromState}
                onChange={(e) => {
                  setFromState(e.target.value);
                  setFromArea(''); // Reset area when state changes
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="">Select state</option>
                {nigerianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Area</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={fromArea}
                onChange={(e) => setFromArea(e.target.value)}
                disabled={!fromState}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:opacity-50"
              >
                <option value="">Select area</option>
                {fromState && popularCities[fromState as keyof typeof popularCities]?.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Going to</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={toState}
                onChange={(e) => {
                  setToState(e.target.value);
                  setToArea(''); // Reset area when state changes
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="">Select state</option>
                {nigerianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Area</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={toArea}
                onChange={(e) => setToArea(e.target.value)}
                disabled={!toState}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:opacity-50"
              >
                <option value="">Select area</option>
                {toState && popularCities[toState as keyof typeof popularCities]?.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Passengers</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Options</label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="luggage"
                  checked={hasLuggage}
                  onChange={(e) => setHasLuggage(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="luggage" className="text-sm text-gray-700 flex items-center space-x-1">
                  <Luggage className="h-4 w-4" />
                  <span>I have luggage</span>
                </label>
              </div>
              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            {showInterstate ? (
              <>
                <Plane className="h-6 w-6 text-blue-600" />
                <span>Interstate Rides ({filteredRides.length})</span>
              </>
            ) : (
              <>
                <Car className="h-6 w-6 text-blue-600" />
                <span>Local Rides ({filteredRides.length})</span>
              </>
            )}
          </h2>
          {showInterstate && (
            <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl text-sm font-medium">
              Long-distance travel between states
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {filteredRides.map((ride) => {
            const { savings, discountPercentage } = getSavingsInfo(ride);
            const timeStatus = getTimeUntilRide(ride);
            const totalPrice = calculateTotalPrice(ride);
            
            return (
              <div
                key={ride.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Interstate Badge */}
                  {ride.isInterstate && (
                    <div className="mb-4">
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        <Plane className="h-4 w-4" />
                        <span>Interstate Travel • {ride.distance} • {ride.duration}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={ride.driver.avatar}
                        alt={ride.driver.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{ride.driver.name}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{ride.driver.rating}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">{ride.driver.ridesCompleted} rides</span>
                          {ride.driver.verified && (
                            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {savings > 0 && (
                          <div className="text-right">
                            <div className="text-sm text-gray-400 line-through">₦{ride.basePricePerSeat}</div>
                            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              {discountPercentage}% OFF
                            </div>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">₦{ride.currentPricePerSeat}</div>
                          <div className="text-sm text-gray-500">per seat</div>
                          {hasLuggage && ride.luggagePrice && (
                            <div className="text-xs text-blue-600">+₦{ride.luggagePrice} luggage</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Tracking Alert */}
                  {timeStatus === 'pickup-soon' && (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-orange-800 text-sm font-medium">Pickup starting soon!</p>
                        <p className="text-orange-700 text-xs">Enable location tracking to coordinate with driver.</p>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Pricing Alert */}
                  {ride.availableSeats > 1 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 flex items-start space-x-2">
                      <TrendingDown className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">Smart Pricing Active!</p>
                        <p className="text-yellow-700 text-xs">Price decreases as more passengers join. Share this ride to save more!</p>
                      </div>
                    </div>
                  )}

                  {/* Luggage Info */}
                  {hasLuggage && (
                    <div className={`p-3 rounded-lg mb-4 flex items-start space-x-2 ${
                      ride.allowsLuggage 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <Luggage className={`h-4 w-4 mt-0.5 ${
                        ride.allowsLuggage ? 'text-green-600' : 'text-red-600'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          ride.allowsLuggage ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {ride.allowsLuggage ? 'Luggage Allowed' : 'No Luggage Space'}
                        </p>
                        <p className={`text-xs ${
                          ride.allowsLuggage ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {ride.allowsLuggage 
                            ? `Additional ₦${ride.luggagePrice || 200} for luggage`
                            : 'This ride does not accommodate luggage'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">{ride.from.landmark}</div>
                          <div className="text-sm text-gray-500">{ride.from.area}, {ride.from.state}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">{ride.to.landmark}</div>
                          <div className="text-sm text-gray-500">{ride.to.area}, {ride.to.state}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ride.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{ride.time} • {ride.duration}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{ride.availableSeats} of {ride.totalSeats} seats available</span>
                      </div>
                    </div>
                  </div>

                  {ride.description && (
                    <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                      {ride.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {ride.amenities.slice(0, 3).map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {ride.amenities.length > 3 && (
                        <span className="text-sm text-gray-500">+{ride.amenities.length - 3} more</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReportDriver(ride)}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center space-x-1"
                        title="Report driver"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Report</span>
                      </button>
                      <button
                        onClick={() => handleViewPickupLocation(ride)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-100 transition-colors flex items-center space-x-1"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Location</span>
                      </button>
                      <button
                        onClick={() => handleShareRide(ride)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-100 transition-colors flex items-center space-x-1"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => handleBookRide(ride)}
                        disabled={(hasLuggage && !ride.allowsLuggage) || ride.availableSeats < passengers}
                        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Book Ride
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRides.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {showInterstate ? <Plane className="h-12 w-12 text-gray-400" /> : <Car className="h-12 w-12 text-gray-400" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {showInterstate ? 'interstate' : 'local'} rides found
            </h3>
            <p className="text-gray-600">
              {showInterstate 
                ? 'Try adjusting your search criteria or check back later for new interstate routes.'
                : 'Try adjusting your search criteria or check back later for new local rides.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRide && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSeatsToBook(1);
          }}
          amount={calculateTotalPrice(selectedRide)}
          rideDetails={{
            from: `${selectedRide.from.area}, ${selectedRide.from.state}`,
            to: `${selectedRide.to.area}, ${selectedRide.to.state}`,
            date: new Date(selectedRide.date).toLocaleDateString(),
            time: selectedRide.time,
            seats: seatsToBook
          }}
          onPaymentComplete={handlePaymentComplete}
          hasLuggage={hasLuggage}
          luggagePrice={selectedRide.luggagePrice}
          selectedRide={selectedRide}
          seatsToBook={seatsToBook}
          onSeatsChange={setSeatsToBook}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareRide && (
        <ShareRideModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          ride={shareRide}
        />
      )}

      {/* Map Modal */}
      {showMapModal && mapRide && (
        <MapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          ride={mapRide}
          userType="passenger"
        />
      )}

      {/* Report Modal */}
      {showReportModal && reportRide && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          ride={reportRide}
          reportType="driver"
        />
      )}
    </div>
  );
};

export default SearchRides;