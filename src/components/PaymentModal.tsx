import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Wallet, Lock, CheckCircle, Luggage, Users, Minus, Plus } from 'lucide-react';
import { Payment, Ride } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  rideDetails: {
    from: string;
    to: string;
    date: string;
    time: string;
    seats: number;
  };
  onPaymentComplete: (payment: Payment) => void;
  hasLuggage?: boolean;
  luggagePrice?: number;
  selectedRide: Ride;
  seatsToBook: number;
  onSeatsChange: (seats: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  rideDetails,
  onPaymentComplete,
  hasLuggage = false,
  luggagePrice = 0,
  selectedRide,
  seatsToBook,
  onSeatsChange
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, description: 'Visa, Mastercard, Verve' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Building, description: 'Direct bank transfer' },
    { id: 'ussd', name: 'USSD Code', icon: Smartphone, description: '*737# or *966#' },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet, description: 'Paystack, Flutterwave' }
  ];

  const baseAmount = selectedRide.currentPricePerSeat * seatsToBook;
  const luggageFee = hasLuggage && luggagePrice ? luggagePrice : 0;
  const totalAmount = baseAmount + luggageFee;
  const mobirideFee = Math.round(totalAmount * 0.15);
  const driverEarnings = totalAmount - mobirideFee;

  const handleSeatsChange = (newSeats: number) => {
    if (newSeats >= 1 && newSeats <= selectedRide.availableSeats) {
      onSeatsChange(newSeats);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const payment: Payment = {
        id: `pay_${Date.now()}`,
        bookingId: `booking_${Date.now()}`,
        amount: totalAmount,
        currency: 'NGN',
        status: 'completed',
        paymentMethod: selectedMethod as any,
        transactionId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        mobirideFee,
        driverEarnings
      };
      
      setIsProcessing(false);
      setPaymentComplete(true);
      
      setTimeout(() => {
        onPaymentComplete(payment);
        onClose();
        setPaymentComplete(false);
      }, 2000);
    }, 3000);
  };

  if (paymentComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your ride has been booked successfully.</p>
          <div className="bg-green-50 p-4 rounded-xl space-y-2">
            <p className="text-green-800 font-medium">₦{totalAmount.toLocaleString()} paid</p>
            <p className="text-green-600 text-sm">Transaction ID: txn_{Date.now()}</p>
            <div className="text-xs text-green-600 pt-2 border-t border-green-200">
              <p>Driver will be paid ₦{driverEarnings.toLocaleString()} after ride completion</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seat Selection */}
          <div className="bg-sky-50 p-4 rounded-xl">
            <h3 className="font-semibold text-sky-900 mb-3 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Select Number of Seats</span>
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleSeatsChange(seatsToBook - 1)}
                  disabled={seatsToBook <= 1}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-900">{seatsToBook}</div>
                  <div className="text-sm text-sky-700">seat{seatsToBook > 1 ? 's' : ''}</div>
                </div>
                <button
                  onClick={() => handleSeatsChange(seatsToBook + 1)}
                  disabled={seatsToBook >= selectedRide.availableSeats}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-right">
                <div className="text-sm text-sky-700">Available seats</div>
                <div className="text-lg font-bold text-sky-900">{selectedRide.availableSeats}</div>
              </div>
            </div>
          </div>

          {/* Ride Summary */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Ride Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">{rideDetails.from} → {rideDetails.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{rideDetails.date} at {rideDetails.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seats:</span>
                <span className="font-medium">{seatsToBook} seat{seatsToBook > 1 ? 's' : ''}</span>
              </div>
              {hasLuggage && luggagePrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <Luggage className="h-4 w-4" />
                    <span>Luggage:</span>
                  </span>
                  <span className="font-medium">₦{luggagePrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-3">Payment Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Ride cost ({seatsToBook} seat{seatsToBook > 1 ? 's' : ''}):</span>
                <span className="font-medium">₦{baseAmount.toLocaleString()}</span>
              </div>
              {hasLuggage && luggagePrice && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Luggage fee:</span>
                  <span className="font-medium">₦{luggagePrice.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="font-semibold text-blue-900">Total Amount:</span>
                <span className="font-bold text-green-600 text-lg">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Commission Info */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <h4 className="font-semibold text-yellow-800 mb-2">Payment Distribution</h4>
            <div className="space-y-2 text-sm text-yellow-700">
              <div className="flex justify-between">
                <span>Mobiride service fee (15%):</span>
                <span>₦{mobirideFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-yellow-200 pt-2">
                <span>Driver receives:</span>
                <span>₦{driverEarnings.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              Driver payment is released after ride completion
            </p>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-6 w-6 ${
                        selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          selectedMethod === method.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {method.name}
                        </div>
                        <div className={`text-sm ${
                          selectedMethod === method.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium text-sm">Secure Payment</p>
              <p className="text-blue-700 text-sm">Your payment information is encrypted and secure. Driver will only be paid after the ride is completed.</p>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `Pay ₦${totalAmount.toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;