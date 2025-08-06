export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  avatar: string;
  verified: boolean;
  ridesCompleted: number;
}

export interface Location {
  landmark: string;
  area: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Ride {
  id: string;
  driver: User;
  from: Location;
  to: Location;
  date: string;
  time: string;
  totalSeats: number;
  availableSeats: number;
  basePricePerSeat: number;
  currentPricePerSeat: number;
  duration: string;
  distance: string;
  description?: string;
  amenities: string[];
  pickupPoints: Location[];
  dropoffPoints: Location[];
  status: 'active' | 'full' | 'cancelled' | 'completed';
  passengers: Passenger[];
  shareableLink?: string;
  lastReminderSent?: string;
  allowsLuggage?: boolean;
  luggagePrice?: number;
  isInterstate?: boolean;
}

export interface Passenger {
  id: string;
  user: User;
  seatsBooked: number;
  amountPaid: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  pickupPoint: Location;
  dropoffPoint: Location;
  bookedAt: string;
  notificationPreferences?: NotificationPreferences;
  hasLuggage?: boolean;
  luggageDescription?: string;
}

export interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
  inApp: boolean;
}

export interface Notification {
  id: string;
  rideId: string;
  type: 'reminder' | 'update' | 'cancellation' | 'payment';
  title: string;
  message: string;
  recipients: string[]; // passenger IDs
  sentAt: string;
  deliveryStatus: {
    [passengerId: string]: 'sent' | 'delivered' | 'failed';
  };
  channels: ('sms' | 'email' | 'whatsapp' | 'push')[];
}

export interface BookingRequest {
  id: string;
  rideId: string;
  passenger: User;
  seatsRequested: number;
  pickupPoint: Location;
  dropoffPoint: Location;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  paymentRequired: boolean;
  hasLuggage?: boolean;
  luggageDescription?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'ussd' | 'wallet';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  mobirideFee?: number;
  driverEarnings?: number;
}

export interface Report {
  id: string;
  rideId: string;
  reporterId: string;
  reportedUserId: string;
  reportType: 'driver' | 'passenger';
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

export type ViewMode = 'search' | 'post' | 'profile' | 'bookings';

export interface AuthUser extends User {
  location?: string;
}