import React, { useState } from 'react';
import { X, Bell, MessageCircle, Mail, Smartphone, Send, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { Ride, Notification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  onSendNotification: (notification: Omit<Notification, 'id' | 'sentAt' | 'deliveryStatus'>) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  ride,
  onSendNotification
}) => {
  const [notificationType, setNotificationType] = useState<'reminder' | 'update' | 'cancellation'>('reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<('sms' | 'email' | 'whatsapp' | 'push')[]>(['sms', 'whatsapp']);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const notificationTemplates = {
    reminder: {
      title: 'Ride Reminder - Be Ready!',
      message: `🚗 Reminder: Your ride from ${ride.from.area} to ${ride.to.area} is scheduled for ${new Date(ride.date).toLocaleDateString()} at ${ride.time}.\n\n📍 Pickup Point: ${ride.from.landmark}\n⏰ Please be ready 5 minutes early\n📱 Contact: ${ride.driver.phone}\n\nSafe travels! - ${ride.driver.name}`
    },
    update: {
      title: 'Ride Update',
      message: `📢 Update for your ride from ${ride.from.area} to ${ride.to.area} on ${new Date(ride.date).toLocaleDateString()} at ${ride.time}.\n\n${customMessage || 'Please check the app for latest details.'}\n\n📱 Contact: ${ride.driver.phone}\n\n- ${ride.driver.name}`
    },
    cancellation: {
      title: 'Ride Cancellation Notice',
      message: `❌ Unfortunately, your ride from ${ride.from.area} to ${ride.to.area} scheduled for ${new Date(ride.date).toLocaleDateString()} at ${ride.time} has been cancelled.\n\n${customMessage || 'We apologize for any inconvenience. Your payment will be refunded within 24 hours.'}\n\n📱 Contact: ${ride.driver.phone}\n\n- ${ride.driver.name}`
    }
  };

  const channels = [
    { id: 'sms' as const, name: 'SMS', icon: Smartphone, description: 'Text message to phone' },
    { id: 'whatsapp' as const, name: 'WhatsApp', icon: MessageCircle, description: 'WhatsApp message' },
    { id: 'email' as const, name: 'Email', icon: Mail, description: 'Email notification' },
    { id: 'push' as const, name: 'Push', icon: Bell, description: 'App notification' }
  ];

  const toggleChannel = (channel: 'sms' | 'email' | 'whatsapp' | 'push') => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSend = async () => {
    setIsSending(true);
    
    const template = notificationTemplates[notificationType];
    const finalMessage = notificationType === 'reminder' ? template.message : 
                        (customMessage || template.message);

    const notification: Omit<Notification, 'id' | 'sentAt' | 'deliveryStatus'> = {
      rideId: ride.id,
      type: notificationType,
      title: template.title,
      message: finalMessage,
      recipients: ride.passengers.map(p => p.user.id),
      channels: selectedChannels
    };

    // Simulate sending delay
    setTimeout(() => {
      onSendNotification(notification);
      setIsSending(false);
      setSent(true);
      
      setTimeout(() => {
        onClose();
        setSent(false);
        setCustomMessage('');
        setNotificationType('reminder');
      }, 2000);
    }, 2000);
  };

  const getTimeUntilRide = () => {
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    const diffMs = rideDateTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) return 'Ride time has passed';
    if (diffHours < 1) return `${diffMins} minutes`;
    return `${diffHours}h ${diffMins}m`;
  };

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Notifications Sent!</h3>
          <p className="text-gray-600 mb-4">All passengers have been notified via {selectedChannels.join(', ')}.</p>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-green-800 font-medium">{ride.passengers.length} passenger{ride.passengers.length > 1 ? 's' : ''} notified</p>
            <p className="text-green-600 text-sm">Delivery confirmations will appear in your notifications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <span>Notify Passengers</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ride Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Ride Details</h3>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-medium">{getTimeUntilRide()} until ride</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{ride.from.area} → {ride.to.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{new Date(ride.date).toLocaleDateString()} at {ride.time}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{ride.passengers.length}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup:</span>
                  <span className="font-medium">{ride.from.landmark}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger List */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Passengers to Notify</h4>
            <div className="space-y-2">
              {ride.passengers.map((passenger) => (
                <div key={passenger.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={passenger.user.avatar}
                      alt={passenger.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{passenger.user.name}</div>
                      <div className="text-sm text-gray-500">{passenger.seatsBooked} seat{passenger.seatsBooked > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{passenger.user.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Notification Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'reminder', name: 'Ride Reminder', icon: Clock, description: 'Remind passengers to be ready' },
                { id: 'update', name: 'Ride Update', icon: AlertCircle, description: 'Share important updates' },
                { id: 'cancellation', name: 'Cancellation', icon: X, description: 'Cancel the ride' }
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setNotificationType(type.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      notificationType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${
                      notificationType === type.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className={`font-medium ${
                      notificationType === type.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {type.name}
                    </div>
                    <div className={`text-sm ${
                      notificationType === type.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Message */}
          {(notificationType === 'update' || notificationType === 'cancellation') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {notificationType === 'update' ? 'Update Message' : 'Cancellation Reason'}
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={notificationType === 'update' 
                  ? 'e.g., Running 10 minutes late due to traffic...'
                  : 'e.g., Car breakdown, emergency situation...'
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          )}

          {/* Message Preview */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Message Preview</h4>
            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-blue-500">
              <div className="font-medium text-gray-900 mb-2">{notificationTemplates[notificationType].title}</div>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {notificationType === 'reminder' 
                  ? notificationTemplates[notificationType].message
                  : (customMessage || notificationTemplates[notificationType].message)
                }
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Send Via</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedChannels.includes(channel.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-2 ${
                      selectedChannels.includes(channel.id) ? 'text-green-600' : 'text-gray-600'
                    }`} />
                    <div className={`font-medium text-sm ${
                      selectedChannels.includes(channel.id) ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {channel.name}
                    </div>
                    <div className={`text-xs ${
                      selectedChannels.includes(channel.id) ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {channel.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Send Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleSend}
              disabled={isSending || selectedChannels.length === 0 || ride.passengers.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Notifications...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send to {ride.passengers.length} Passenger{ride.passengers.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
            {selectedChannels.length === 0 && (
              <p className="text-red-600 text-sm mt-2 text-center">Please select at least one notification channel</p>
            )}
            {ride.passengers.length === 0 && (
              <p className="text-yellow-600 text-sm mt-2 text-center">No passengers to notify for this ride</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;