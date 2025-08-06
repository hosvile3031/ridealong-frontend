import { User, Ride, Location, Passenger } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Kemi Adebayo',
    email: 'kemi@example.com',
    phone: '+234 803 123 4567',
    rating: 4.8,
    avatar: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    verified: true,
    ridesCompleted: 47
  },
  {
    id: '2',
    name: 'Chidi Okonkwo',
    email: 'chidi@example.com',
    phone: '+234 805 234 5678',
    rating: 4.9,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    verified: true,
    ridesCompleted: 63
  },
  {
    id: '3',
    name: 'Fatima Ibrahim',
    email: 'fatima@example.com',
    phone: '+234 807 345 6789',
    rating: 4.7,
    avatar: 'https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    verified: true,
    ridesCompleted: 34
  },
  {
    id: '4',
    name: 'Ahmed Musa',
    email: 'ahmed@example.com',
    phone: '+234 809 456 7890',
    rating: 4.6,
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    verified: true,
    ridesCompleted: 28
  }
];

export const mockLocations: Location[] = [
  // Abuja FCT
  {
    landmark: 'Berger Junction',
    area: 'Wuse',
    state: 'Abuja FCT',
    coordinates: { lat: 9.0579, lng: 7.4951 }
  },
  {
    landmark: 'CBN Headquarters',
    area: 'Central Business District',
    state: 'Abuja FCT',
    coordinates: { lat: 9.0643, lng: 7.4892 }
  },
  {
    landmark: 'Shoprite Mall',
    area: 'Gwarinpa',
    state: 'Abuja FCT',
    coordinates: { lat: 9.1108, lng: 7.4165 }
  },
  {
    landmark: 'NNPC Towers',
    area: 'Central Business District',
    state: 'Abuja FCT',
    coordinates: { lat: 9.0579, lng: 7.4951 }
  },
  {
    landmark: 'University of Abuja',
    area: 'Gwagwalada',
    state: 'Abuja FCT',
    coordinates: { lat: 8.9324, lng: 7.0802 }
  },
  {
    landmark: 'Transcorp Hilton',
    area: 'Maitama',
    state: 'Abuja FCT',
    coordinates: { lat: 9.0765, lng: 7.4986 }
  },
  // Lagos
  {
    landmark: 'Lagos Island',
    area: 'Victoria Island',
    state: 'Lagos',
    coordinates: { lat: 6.4281, lng: 3.4219 }
  },
  {
    landmark: 'Murtala Muhammed Airport',
    area: 'Ikeja',
    state: 'Lagos',
    coordinates: { lat: 6.5774, lng: 3.3213 }
  },
  {
    landmark: 'Lekki Phase 1',
    area: 'Lekki',
    state: 'Lagos',
    coordinates: { lat: 6.4698, lng: 3.5852 }
  },
  // Kano
  {
    landmark: 'Mallam Aminu Kano Airport',
    area: 'Kano Municipal',
    state: 'Kano',
    coordinates: { lat: 12.0476, lng: 8.5264 }
  },
  {
    landmark: 'Kano Central Mosque',
    area: 'Kano Municipal',
    state: 'Kano',
    coordinates: { lat: 12.0022, lng: 8.5920 }
  },
  // Port Harcourt
  {
    landmark: 'Port Harcourt Airport',
    area: 'Omagwa',
    state: 'Rivers',
    coordinates: { lat: 5.0155, lng: 6.9496 }
  },
  {
    landmark: 'University of Port Harcourt',
    area: 'Choba',
    state: 'Rivers',
    coordinates: { lat: 4.8156, lng: 7.0498 }
  }
];

// Calculate dynamic pricing with maximum 5% reduction
export const calculateDynamicPrice = (basePricePerSeat: number, totalSeats: number, bookedSeats: number): number => {
  const occupancyRate = bookedSeats / totalSeats;
  
  // Price reduces as more seats are filled, but maximum reduction is 5%
  // 0% occupancy = 100% of base price
  // 25% occupancy = 98.75% of base price
  // 50% occupancy = 97.5% of base price
  // 75% occupancy = 96.25% of base price
  // 100% occupancy = 95% of base price (5% max discount)
  
  const maxDiscountRate = 0.05; // Maximum 5% discount
  const discountRate = occupancyRate * maxDiscountRate;
  const finalPrice = basePricePerSeat * (1 - discountRate);
  
  return Math.round(finalPrice / 50) * 50; // Round to nearest 50 naira
};

const mockPassengers: Passenger[] = [
  {
    id: 'p1',
    user: mockUsers[3],
    seatsBooked: 1,
    amountPaid: 800,
    paymentStatus: 'paid',
    pickupPoint: mockLocations[0],
    dropoffPoint: mockLocations[1],
    bookedAt: '2024-01-10T10:30:00Z',
    hasLuggage: false
  }
];

export const mockRides: Ride[] = [
  {
    id: '1',
    driver: mockUsers[0],
    from: mockLocations[0],
    to: mockLocations[1],
    date: new Date().toISOString().split('T')[0], // Today's date
    time: '08:00',
    totalSeats: 4,
    availableSeats: 3,
    basePricePerSeat: 1000,
    currentPricePerSeat: calculateDynamicPrice(1000, 4, 1),
    duration: '25 min',
    distance: '12 km',
    description: 'Daily commute to CBD. Clean Toyota Camry, AC working perfectly, good music!',
    amenities: ['AC', 'Music', 'Phone Charging'],
    pickupPoints: [mockLocations[0]],
    dropoffPoints: [mockLocations[1]],
    status: 'active',
    passengers: [mockPassengers[0]],
    shareableLink: 'https://ridealong.com/ride/1',
    allowsLuggage: true,
    luggagePrice: 300,
    isInterstate: false
  },
  {
    id: '2',
    driver: mockUsers[1],
    from: mockLocations[2],
    to: mockLocations[3],
    date: new Date().toISOString().split('T')[0], // Today's date
    time: '17:30',
    totalSeats: 3,
    availableSeats: 3,
    basePricePerSeat: 800,
    currentPricePerSeat: calculateDynamicPrice(800, 3, 0),
    duration: '35 min',
    distance: '18 km',
    description: 'Evening commute back home. Honda Accord 2018, comfortable ride, non-smoking car.',
    amenities: ['AC', 'Non-Smoking', 'Phone Charging'],
    pickupPoints: [mockLocations[2]],
    dropoffPoints: [mockLocations[3]],
    status: 'active',
    passengers: [],
    shareableLink: 'https://ridealong.com/ride/2',
    allowsLuggage: false,
    isInterstate: false
  },
  {
    id: '3',
    driver: mockUsers[2],
    from: mockLocations[6], // Lagos
    to: mockLocations[0], // Abuja
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    time: '07:15',
    totalSeats: 4,
    availableSeats: 2,
    basePricePerSeat: 8500,
    currentPricePerSeat: calculateDynamicPrice(8500, 4, 2),
    duration: '6 hours',
    distance: '750 km',
    description: 'Interstate travel Lagos to Abuja. Comfortable SUV, AC, entertainment system. Experienced interstate driver.',
    amenities: ['AC', 'Entertainment', 'Comfortable Seats', 'Refreshments'],
    pickupPoints: [mockLocations[6]],
    dropoffPoints: [mockLocations[0]],
    status: 'active',
    passengers: [{
      id: 'p2',
      user: mockUsers[0],
      seatsBooked: 2,
      amountPaid: 15000,
      paymentStatus: 'paid',
      pickupPoint: mockLocations[6],
      dropoffPoint: mockLocations[0],
      bookedAt: '2024-01-12T14:20:00Z',
      hasLuggage: true,
      luggageDescription: 'Two medium suitcases'
    }],
    shareableLink: 'https://ridealong.com/ride/3',
    allowsLuggage: true,
    luggagePrice: 1000,
    isInterstate: true
  },
  {
    id: '4',
    driver: mockUsers[3],
    from: mockLocations[9], // Kano
    to: mockLocations[0], // Abuja
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
    time: '06:00',
    totalSeats: 5,
    availableSeats: 5,
    basePricePerSeat: 6500,
    currentPricePerSeat: calculateDynamicPrice(6500, 5, 0),
    duration: '4.5 hours',
    distance: '350 km',
    description: 'Early morning interstate ride Kano to Abuja. Toyota Hiace, very comfortable for long distance.',
    amenities: ['AC', 'Comfortable Seats', 'Music', 'Phone Charging'],
    pickupPoints: [mockLocations[9]],
    dropoffPoints: [mockLocations[0]],
    status: 'active',
    passengers: [],
    shareableLink: 'https://ridealong.com/ride/4',
    allowsLuggage: true,
    luggagePrice: 800,
    isInterstate: true
  },
  {
    id: '5',
    driver: mockUsers[1],
    from: mockLocations[4], // Gwagwalada
    to: mockLocations[5], // Maitama
    date: new Date().toISOString().split('T')[0], // Today
    time: '14:00',
    totalSeats: 4,
    availableSeats: 4,
    basePricePerSeat: 1200,
    currentPricePerSeat: calculateDynamicPrice(1200, 4, 0),
    duration: '45 min',
    distance: '25 km',
    description: 'Afternoon ride from University area to Maitama. Clean car, good music.',
    amenities: ['AC', 'Music', 'Phone Charging'],
    pickupPoints: [mockLocations[4]],
    dropoffPoints: [mockLocations[5]],
    status: 'active',
    passengers: [],
    shareableLink: 'https://ridealong.com/ride/5',
    allowsLuggage: true,
    luggagePrice: 250,
    isInterstate: false
  }
];

export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Abuja FCT'
];

export const popularCities = {
  'Lagos': ['Victoria Island', 'Ikeja', 'Lekki', 'Surulere', 'Yaba', 'Ikoyi', 'Ajah', 'Magodo', 'Gbagada', 'Festac'],
  'Abuja FCT': ['Wuse', 'Wuse 2', 'Maitama', 'Asokoro', 'Garki', 'Garki 2', 'Central Business District', 'Gwarinpa', 'Kubwa', 'Karu', 'Nyanya', 'Gwagwalada', 'Lugbe', 'Jahi', 'Utako', 'Gudu', 'Durumi', 'Lokogoma', 'Apo', 'Galadimawa', 'Life Camp', 'Guzape', 'Katampe', 'Mpape', 'Bwari', 'Suleja'],
  'Kano': ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nassarawa', 'Ungogo'],
  'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Ogu–Bolo', 'Eleme', 'Tai', 'Gokana', 'Khana', 'Oyigbo', 'Opobo–Nkoro'],
  'Oyo': ['Ibadan North', 'Ibadan South-West', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Egbeda', 'Akinyele', 'Lagelu', 'Ona Ara', 'Oluyole'],
  'Kaduna': ['Kaduna North', 'Kaduna South', 'Chikun', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kagarko', 'Kajuru'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne'],
  'Anambra': ['Awka North', 'Awka South', 'Anambra East', 'Anambra West', 'Anaocha', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South'],
  'Imo': ['Owerri Municipal', 'Owerri North', 'Owerri West', 'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma'],
  'Plateau': ['Jos North', 'Jos South', 'Jos East', 'Bassa', 'Bokkos', 'Barkin Ladi', 'Riyom', 'Mangu', 'Pankshin', 'Qua\'an Pan']
};

export const amenitiesList = [
  'AC', 'Music', 'Phone Charging', 'Non-Smoking', 'Quiet', 
  'Pet Friendly', 'Snacks', 'Water', 'Leather Seats', 'Bluetooth',
  'Entertainment System', 'Comfortable Seats', 'Refreshments'
];

export const paymentMethods = [
  { id: 'card', name: 'Debit/Credit Card', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'ussd', name: 'USSD (*737#)', icon: '📱' },
  { id: 'wallet', name: 'Digital Wallet', icon: '💰' }
];