import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Star, MessageCircle, Phone, CheckCircle, XCircle, AlertCircle, CreditCard, Share2, Bell, Navigation } from 'lucide-react';
import { mockRides } from '../utils/data';
import { AuthUser, Ride, Notification } from '../types';
import ShareRideModal from './ShareRideModal';
import NotificationModal from './NotificationModal';
import MapModal from './MapModal';

interface MyBookingsProps {
  user: AuthUser | null;
  onAuthRequired: (mode: 'signin' | 'signup') => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ user, onAuthRequired }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'requests' | 'posted'>('upcoming');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [shareRide, setShareRide] = useState<Ride | null>(null);
  const [notificationRide, setNotificationRide] = useState<Ride | null>(null);
  const [mapRide, setMapRide] = useState<Ride | null>(null);

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your rides</h3>
        <p className="text-gray-600 mb-6">Create an account or sign in to manage your bookings and posted rides.</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onAuthRequired('signin')}
            className="bg-gradient-to-r from-sky-600 to-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-700 hover:to-blue-900 transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => onAuthRequired('signup')}
            className="border border-sky-600 text-sky-600 px-6 py-3 rounded-xl font-semibold hover:bg-sky-50 transition-all duration-200"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  const upcomingRides = mockRides.filter(ride => new Date(ride.date) >= new Date());
  const pastRides = mockRides.filter(ride => new Date(ride.date) < new Date());
  const postedRides = mockRides.filter(ride => ride.driver.name === user.name);

  const mockRequests = [
    {
      id: '1',
      ride: mockRides[0],
      status: 'pending' as const,
      seatsRequested: 2,
      message: 'Hello! I need a ride from Wuse to CBD. I work at the ministry and very punctual.',
      requestedAt: '2024-01-10T10:30:00Z',
      paymentStatus: 'pending' as const,
      amountToPay: mockRides[0].currentPricePerSeat * 2
    },
    {
      id: '2',
      ride: mockRides[1],
      status: 'accepted' as const,
      seatsRequested: 1,
      message: 'Regular commuter, very reliable. I work at CBN headquarters.',
      requestedAt: '2024-01-09T15:20:00Z',
      paymentStatus: 'paid' as const,
      amountPaid: mockRides[1].currentPricePerSeat
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleShareRide = (ride: Ride) => {
    setShareRide(ride);
    setShowShareModal(true);
  };

  const handleNotifyPassengers = (ride: Ride) => {
    setNotificationRide(ride);
    setShowNotificationModal(true);
  };

  const handleViewPickupLocation = (ride: Ride, userType: 'driver' | 'passenger') => {
    setMapRide(ride);
    setShowMapModal(true);
  };

  const handleSendNotification = (notification: Omit<Notification, 'id' | 'sentAt' | 'deliveryStatus'>) => {
    // In a real app, this would send the notification via API
    console.log('Sending notification:', notification);
    
    // Update the ride's last reminder sent timestamp
    if (notificationRide) {
      notificationRide.lastReminderSent = new Date().toISOString();
    }
  };

  const canSendReminder = (ride: Ride) => {
    if (!ride.lastReminderSent) return true;
    
    const lastSent = new Date(ride.lastReminderSent);
    const now = new Date();
    const hoursSinceLastReminder = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastReminder >= 2; // Can send reminder every 2 hours
  };

  const getTimeUntilRide = (ride: Ride) => {
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    const diffMs = rideDateTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMs < 0) return 'Past';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const shouldShowLocationButton = (ride: Ride) => {
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    const diffMinutes = Math.floor((rideDateTime.getTime() - now.getTime()) / (1000 * 60));
    
    return diffMinutes <= 60 && diffMinutes > -30; // Show 1 hour before to 30 minutes after
  };

  const RideCard = ({ ride, isPast = false, isPosted = false }: { ride: any; isPast?: boolean; isPosted?: boolean }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={ride.driver.avatar}
              alt={ride.driver.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-100"
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
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">₦{ride.currentPricePerSeat || ride.pricePerSeat}</div>
            <div className="text-sm text-gray-500">per seat</div>
            {ride.basePricePerSeat && ride.basePricePerSeat > ride.currentPricePerSeat && (
              <div className="text-xs text-gray-400 line-through">₦{ride.basePricePerSeat}</div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
            {isPosted && (
              <div className="flex items-center space-x-3 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{ride.availableSeats} of {ride.totalSeats} seats available</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPast ? 'bg-gray-100 text-gray-600' : 
              isPosted ? 'bg-sky-100 text-sky-700' : 'bg-green-100 text-green-700'
            }`}>
              {isPast ? 'Completed' : isPosted ? 'Posted' : 'Confirmed'}
            </div>
            {!isPosted && <span className="text-sm text-gray-500">• 2 seats booked</span>}
            {isPosted && ride.passengers && ride.passengers.length > 0 && (
              <span className="text-sm text-gray-500">• {ride.passengers.length} passenger{ride.passengers.length > 1 ? 's' : ''}</span>
            )}
            {isPosted && !isPast && (
              <div className="text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded-full">
                {getTimeUntilRide(ride)} to go
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {shouldShowLocationButton(ride) && (
              <button
                onClick={() => handleViewPickupLocation(ride, isPosted ? 'driver' : 'passenger')}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                title="View pickup location"
              >
                <Navigation className="h-5 w-5" />
              </button>
            )}
            {isPosted && !isPast && ride.passengers && ride.passengers.length > 0 && (
              <button
                onClick={() => handleNotifyPassengers(ride)}
                disabled={!canSendReminder(ride)}
                className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
                  canSendReminder(ride)
                    ? 'text-sky-600 hover:text-sky-700 hover:bg-sky-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={canSendReminder(ride) ? 'Notify passengers' : 'Reminder sent recently'}
              >
                <Bell className="h-5 w-5" />
                <span className="text-sm font-medium">Notify</span>
              </button>
            )}
            {isPosted && (
              <button
                onClick={() => handleShareRide(ride)}
                className="p-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                title="Share ride"
              >
                <Share2 className="h-5 w-5" />
              </button>
            )}
            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <MessageCircle className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            {!isPast && (
              <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          My
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-800"> Rides</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your bookings and ride requests across Nigeria.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { id: 'upcoming', label: 'Upcoming Rides', count: upcomingRides.length },
            { id: 'past', label: 'Past Rides', count: pastRides.length },
            { id: 'requests', label: 'Ride Requests', count: mockRequests.length },
            { id: 'posted', label: 'Posted Rides', count: postedRides.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-max px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              {upcomingRides.length > 0 ? (
                upcomingRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming rides</h3>
                  <p className="text-gray-600">Book a ride to see it here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="space-y-6">
              {pastRides.length > 0 ? (
                pastRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} isPast />
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No past rides</h3>
                  <p className="text-gray-600">Your completed rides will appear here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'posted' && (
            <div className="space-y-6">
              {postedRides.length > 0 ? (
                postedRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} isPosted />
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No posted rides</h3>
                  <p className="text-gray-600">Post a ride to start earning and helping commuters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              {mockRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={request.ride.driver.avatar}
                          alt={request.ride.driver.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-100"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.ride.driver.name}</h3>
                          <div className="text-sm text-gray-500">
                            {request.ride.from.area} → {request.ride.to.area}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                        {request.paymentStatus && (
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getPaymentStatusColor(request.paymentStatus)}`}>
                            <CreditCard className="h-4 w-4" />
                            <span className="capitalize">{request.paymentStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 text-sm">{request.message}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>{request.seatsRequested} seat{request.seatsRequested > 1 ? 's' : ''} requested</span>
                        <span>•</span>
                        <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                        {request.amountToPay && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-green-600">₦{request.amountToPay.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {request.status === 'accepted' && request.paymentStatus === 'pending' && (
                          <button className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors">
                            Pay Now
                          </button>
                        )}
                        {request.status === 'pending' && (
                          <button className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-medium hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && shareRide && (
        <ShareRideModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          ride={shareRide}
        />
      )}

      {/* Notification Modal */}
      {showNotificationModal && notificationRide && (
        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          ride={notificationRide}
          onSendNotification={handleSendNotification}
        />
      )}

      {/* Map Modal */}
      {showMapModal && mapRide && (
        <MapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          ride={mapRide}
          userType={activeTab === 'posted' ? 'driver' : 'passenger'}
        />
      )}
    </div>
  );
};

export default MyBookings;