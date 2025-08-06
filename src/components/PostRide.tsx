import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Users, DollarSign, Plus, X, Car, Share2, TrendingDown, Lightbulb, Luggage, Plane } from 'lucide-react';
import { nigerianStates, popularCities, amenitiesList, calculateDynamicPrice } from '../utils/data';
import { AuthUser, Ride } from '../types';
import ShareRideModal from './ShareRideModal';
import PricingAdviceModal from './PricingAdviceModal';
import apiService from '../services/api';

interface PostRideProps {
  user: AuthUser | null;
  onAuthRequired: (mode: 'signin' | 'signup') => void;
}

const PostRide: React.FC<PostRideProps> = ({ user, onAuthRequired }) => {
  const [formData, setFormData] = useState({
    fromState: '',
    fromArea: '',
    toState: '',
    toArea: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '',
    seats: 1,
    price: '',
    description: '',
    amenities: [] as string[],
    allowsLuggage: false,
    luggagePrice: 200,
    isInterstate: false
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [createdRide, setCreatedRide] = useState<Ride | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onAuthRequired('signin');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare ride data for backend API
      const rideData = {
        startLocation: {
          type: 'Point',
          coordinates: [0, 0], // Default coordinates - should be obtained from geocoding
          address: `${formData.fromArea}, ${formData.fromState}`
        },
        endLocation: {
          type: 'Point',
          coordinates: [0, 0], // Default coordinates - should be obtained from geocoding
          address: `${formData.toArea}, ${formData.toState}`
        },
        departureTime: `${formData.date}T${formData.time}:00.000Z`,
        availableSeats: formData.seats,
        pricePerSeat: parseInt(formData.price),
        preferences: {
          smokingAllowed: false,
          petsAllowed: false,
          musicAllowed: formData.amenities.includes('Music'),
          airConditioned: formData.amenities.includes('AC')
        }
      };

      // Call the backend API to create the ride
      const response = await apiService.createRide(rideData);
      
      if (response.success) {
        // Create a ride object for the UI
        const newRide: Ride = {
          id: response.data.ride._id,
          driver: user,
          from: {
            landmark: 'Selected Location',
            area: formData.fromArea,
            state: formData.fromState,
            coordinates: { lat: 0, lng: 0 }
          },
          to: {
            landmark: 'Selected Destination',
            area: formData.toArea,
            state: formData.toState,
            coordinates: { lat: 0, lng: 0 }
          },
          date: formData.date,
          time: formData.time,
          totalSeats: formData.seats,
          availableSeats: response.data.ride.availableSeats,
          basePricePerSeat: parseInt(formData.price),
          currentPricePerSeat: response.data.ride.pricePerSeat,
          duration: formData.isInterstate ? '4-8 hours' : '30 min',
          distance: formData.isInterstate ? '300-800 km' : '15 km',
          description: formData.description,
          amenities: formData.amenities,
          pickupPoints: [],
          dropoffPoints: [],
          status: 'active',
          passengers: [],
          shareableLink: `https://ridealong.com/ride/${response.data.ride._id}`,
          allowsLuggage: formData.allowsLuggage,
          luggagePrice: formData.allowsLuggage ? formData.luggagePrice : undefined,
          isInterstate: formData.isInterstate
        };

        setCreatedRide(newRide);
        setShowShareModal(true);
        
        // Reset form
        setFormData({
          fromState: '',
          fromArea: '',
          toState: '',
          toArea: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          seats: 1,
          price: '',
          description: '',
          amenities: [],
          allowsLuggage: false,
          luggagePrice: 200,
          isInterstate: false
        });
      }
    } catch (error: any) {
      console.error('Error creating ride:', error);
      setSubmitError(error.message || 'Failed to create ride. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleShowPricingAdvice = () => {
    if (formData.fromState && formData.toState) {
      setShowPricingModal(true);
    }
  };

  const handlePriceSelect = (price: number) => {
    setFormData(prev => ({ ...prev, price: price.toString() }));
  };

  const currentPrice = formData.price ? parseInt(formData.price) : 0;
  const priceWith2Passengers = currentPrice ? calculateDynamicPrice(currentPrice, formData.seats, 1) : 0;
  const priceWith3Passengers = currentPrice ? calculateDynamicPrice(currentPrice, formData.seats, 2) : 0;

  // Calculate estimated earnings after Ridealong.com's 15% commission
  const calculateDriverEarnings = (price: number) => {
    return Math.round(price * 0.85); // 85% goes to driver, 15% to Ridealong.com
  };

  // Determine if it's interstate based on different states
  const isInterstateRoute = formData.fromState && formData.toState && formData.fromState !== formData.toState;

  // Update isInterstate when states change
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, isInterstate: isInterstateRoute }));
  }, [isInterstateRoute]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Publish a ride and
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"> travel for less</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Going somewhere? Create your ride and save money by sharing your journey with passengers along the way.
        </p>
      </div>

      {/* Interstate Detection */}
      {isInterstateRoute && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <Plane className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Interstate Route Detected!</h3>
              <p className="text-blue-700 text-sm">
                You're posting an interstate ride from {formData.fromState} to {formData.toState}. 
                Consider higher pricing for long-distance travel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-xl">
              <Car className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Publish Your Ride</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Route Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Route Details</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Leaving from</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                    <select
                      value={formData.fromState}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        fromState: e.target.value,
                        fromArea: '' // Reset area when state changes
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      required
                    >
                      <option value="">Select departure state</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Area/City</label>
                    <select
                      value={formData.fromArea}
                      onChange={(e) => setFormData(prev => ({ ...prev, fromArea: e.target.value }))}
                      disabled={!formData.fromState}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:opacity-50"
                      required
                    >
                      <option value="">Select departure area</option>
                      {formData.fromState && popularCities[formData.fromState as keyof typeof popularCities]?.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Going to</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                    <select
                      value={formData.toState}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        toState: e.target.value,
                        toArea: '' // Reset area when state changes
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      required
                    >
                      <option value="">Select destination state</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Area/City</label>
                    <select
                      value={formData.toArea}
                      onChange={(e) => setFormData(prev => ({ ...prev, toArea: e.target.value }))}
                      disabled={!formData.toState}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:opacity-50"
                      required
                    >
                      <option value="">Select destination area</option>
                      {formData.toState && popularCities[formData.toState as keyof typeof popularCities]?.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Schedule</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Departure Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seats & Price */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Capacity & Pricing</span>
              </h3>
              <button
                type="button"
                onClick={handleShowPricingAdvice}
                disabled={!formData.fromState || !formData.toState}
                className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl font-medium hover:bg-yellow-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Get Pricing Advice</span>
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Available Seats</label>
                <select
                  value={formData.seats}
                  onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} seat{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Base Price per Seat (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₦</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder={isInterstateRoute ? "5000" : "500"}
                    min="0"
                    step="50"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {isInterstateRoute 
                    ? 'Suggested: ₦3000-₦15000 for interstate travel'
                    : 'Suggested: ₦300-₦1000 depending on distance'
                  }
                </p>
              </div>
            </div>

            {/* Commission Info */}
            {currentPrice > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <div className="flex items-start space-x-2 mb-3">
                  <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Your Earnings Breakdown</h4>
                    <p className="text-sm text-blue-700">Ridealong.com charges 15% commission on completed rides</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-gray-600">Price per seat</div>
                    <div className="text-lg font-bold text-gray-900">₦{currentPrice}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-gray-600">Ridealong.com fee (15%)</div>
                    <div className="text-lg font-bold text-red-600">-₦{Math.round(currentPrice * 0.15)}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-gray-600">You earn per seat</div>
                    <div className="text-lg font-bold text-green-600">₦{calculateDriverEarnings(currentPrice)}</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-green-100 rounded-lg">
                  <div className="text-green-800 font-medium">
                    Total potential earnings: ₦{calculateDriverEarnings(currentPrice) * formData.seats}
                  </div>
                  <div className="text-green-700 text-sm">
                    (If all {formData.seats} seat{formData.seats > 1 ? 's are' : ' is'} booked)
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Pricing Preview - Limited to 5% */}
            {currentPrice > 0 && formData.seats > 1 && (
              <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-start space-x-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Pricing Preview (Max 5% Discount)</h4>
                    <p className="text-sm text-gray-600">See how prices decrease as more passengers join:</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-900">Empty ride</div>
                    <div className="text-lg font-bold text-gray-600">₦{currentPrice}</div>
                    <div className="text-xs text-gray-500">You earn: ₦{calculateDriverEarnings(currentPrice)}</div>
                  </div>
                  {formData.seats > 1 && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-gray-900">1 passenger joins</div>
                      <div className="text-lg font-bold text-green-600">₦{priceWith2Passengers}</div>
                      <div className="text-xs text-green-600">You earn: ₦{calculateDriverEarnings(priceWith2Passengers)}</div>
                    </div>
                  )}
                  {formData.seats > 2 && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-gray-900">2 passengers join</div>
                      <div className="text-lg font-bold text-green-600">₦{priceWith3Passengers}</div>
                      <div className="text-xs text-green-600">You earn: ₦{calculateDriverEarnings(priceWith3Passengers)}</div>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                  <strong>Note:</strong> Maximum discount is limited to 5% to ensure fair pricing for drivers.
                </div>
              </div>
            )}
          </div>

          {/* Luggage Options */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Luggage className="h-5 w-5 text-blue-600" />
              <span>Luggage Policy</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowsLuggage"
                  checked={formData.allowsLuggage}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowsLuggage: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="allowsLuggage" className="text-sm font-medium text-gray-700">
                  I can accommodate passenger luggage
                </label>
              </div>

              {formData.allowsLuggage && (
                <div className="ml-7 space-y-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Additional charge for luggage (₦)
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₦</span>
                      <input
                        type="number"
                        value={formData.luggagePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, luggagePrice: parseInt(e.target.value) || 0 }))}
                        min="0"
                        step="50"
                        className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {isInterstateRoute 
                        ? 'Recommended: ₦500-₦2000 for interstate luggage'
                        : 'Recommended: ₦100-₦500 depending on luggage size'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <span>Car Amenities</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                    formData.amenities.includes(amenity)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isInterstateRoute 
                  ? "Tell passengers about your car, rest stops, pickup points, or any other details for interstate travel. E.g., 'Toyota Camry 2020, comfortable for long distance, AC working, will stop for refreshments...'"
                  : "Tell passengers about your car, music preferences, pickup points, or any other details. E.g., 'Toyota Camry 2020, clean car, good music, pickup from Berger Junction...'"
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publishing Your Ride...</span>
                </div>
              ) : (
                'Publish Your Ride'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Share Modal */}
      {showShareModal && createdRide && (
        <ShareRideModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          ride={createdRide}
        />
      )}

      {/* Pricing Advice Modal */}
      {showPricingModal && (
        <PricingAdviceModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          route={{
            from: `${formData.fromArea}, ${formData.fromState}`,
            to: `${formData.toArea}, ${formData.toState}`,
            distance: isInterstateRoute ? 500 : 15, // Mock distance
            duration: isInterstateRoute ? 360 : 30,  // Mock duration in minutes
            isInterstate: isInterstateRoute
          }}
          onPriceSelect={handlePriceSelect}
        />
      )}
    </div>
  );
};

export default PostRide;