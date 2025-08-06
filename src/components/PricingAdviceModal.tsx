import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Users, MapPin, Clock, Lightbulb, BarChart3, Plane } from 'lucide-react';

interface PricingAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: {
    from: string;
    to: string;
    distance: number;
    duration: number;
    isInterstate?: boolean;
  };
  onPriceSelect: (price: number) => void;
}

const PricingAdviceModal: React.FC<PricingAdviceModalProps> = ({
  isOpen,
  onClose,
  route,
  onPriceSelect
}) => {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  if (!isOpen) return null;

  // Calculate pricing recommendations based on route
  const baseFuelCost = route.distance * (route.isInterstate ? 25 : 15); // Higher fuel cost for interstate
  const timeValue = route.duration * (route.isInterstate ? 15 : 8); // Higher time value for interstate
  const platformFee = 0.15; // 15% MOBIRIDE.NG commission
  
  const economyPrice = Math.round((baseFuelCost + timeValue) * (route.isInterstate ? 1.8 : 1.2) / 50) * 50;
  const standardPrice = Math.round((baseFuelCost + timeValue) * (route.isInterstate ? 2.2 : 1.5) / 50) * 50;
  const premiumPrice = Math.round((baseFuelCost + timeValue) * (route.isInterstate ? 2.8 : 2.0) / 50) * 50;

  const calculateDriverEarnings = (price: number) => {
    return Math.round(price * (1 - platformFee));
  };

  const pricingOptions = [
    {
      type: 'Economy',
      price: economyPrice,
      description: route.isInterstate ? 'Budget interstate travel' : 'Budget-friendly option',
      icon: DollarSign,
      color: 'bg-green-50 border-green-200 text-green-800',
      demand: 'High',
      demandColor: 'text-green-600',
      tips: route.isInterstate 
        ? ['Attracts budget travelers', 'Quick bookings for long distance', 'Good for regular interstate routes']
        : ['Attracts more passengers', 'Quick bookings', 'Good for regular commuters']
    },
    {
      type: 'Standard',
      price: standardPrice,
      description: route.isInterstate ? 'Comfortable interstate pricing' : 'Balanced pricing',
      icon: BarChart3,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      demand: 'Medium',
      demandColor: 'text-blue-600',
      tips: route.isInterstate
        ? ['Best value for interstate', 'Moderate demand', 'Recommended for most long routes']
        : ['Best value proposition', 'Moderate demand', 'Recommended for most routes']
    },
    {
      type: 'Premium',
      price: premiumPrice,
      description: route.isInterstate ? 'Luxury interstate experience' : 'Higher earnings',
      icon: TrendingUp,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      demand: 'Low',
      demandColor: 'text-orange-600',
      tips: route.isInterstate
        ? ['Higher profit margins', 'Luxury interstate travel', 'Premium vehicles only']
        : ['Higher profit margins', 'Luxury experience', 'Fewer but quality passengers']
    }
  ];

  const marketInsights = [
    { 
      label: 'Average route price', 
      value: `₦${standardPrice}`, 
      icon: BarChart3 
    },
    { 
      label: 'Peak demand times', 
      value: route.isInterstate ? '6-8 AM, 4-6 PM' : '7-9 AM, 5-7 PM', 
      icon: Clock 
    },
    { 
      label: 'Route popularity', 
      value: route.distance > (route.isInterstate ? 300 : 15) ? 'High' : 'Medium', 
      icon: MapPin 
    },
    { 
      label: 'Competition level', 
      value: route.isInterstate ? 'Low' : 'Medium', 
      icon: Users 
    }
  ];

  const handleSelectPrice = (price: number) => {
    setSelectedPrice(price);
    onPriceSelect(price);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <span>Smart Pricing Advice</span>
            {route.isInterstate && (
              <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Plane className="h-3 w-3" />
                <span>Interstate</span>
              </div>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Route Summary */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>Route Analysis</span>
              {route.isInterstate && <Plane className="h-4 w-4 text-sky-600" />}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{route.from} → {route.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{route.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{Math.floor(route.duration / 60)}h {route.duration % 60}m</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Cost:</span>
                  <span className="font-medium">₦{baseFuelCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Value:</span>
                  <span className="font-medium">₦{timeValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MOBIRIDE.NG Fee:</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interstate Notice */}
          {route.isInterstate && (
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl">
              <h4 className="font-semibold text-sky-800 mb-2 flex items-center space-x-2">
                <Plane className="h-5 w-5" />
                <span>Interstate Travel Considerations</span>
              </h4>
              <div className="space-y-2 text-sky-700 text-sm">
                <div>• Higher fuel costs and vehicle wear for long-distance travel</div>
                <div>• Premium pricing justified by comfort and time savings</div>
                <div>• Consider rest stops, refreshments, and passenger comfort</div>
                <div>• Lower competition but higher passenger expectations</div>
              </div>
            </div>
          )}

          {/* Market Insights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-sky-600" />
                  <div className="text-sm text-gray-600 mb-1">{insight.label}</div>
                  <div className="font-semibold text-gray-900">{insight.value}</div>
                </div>
              );
            })}
          </div>

          {/* Pricing Options */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recommended Pricing</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingOptions.map((option) => {
                const Icon = option.icon;
                const driverEarnings = calculateDriverEarnings(option.price);
                
                return (
                  <div
                    key={option.type}
                    className={`border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${option.color}`}
                  >
                    <div className="text-center mb-4">
                      <Icon className="h-8 w-8 mx-auto mb-2" />
                      <h4 className="text-xl font-bold mb-1">{option.type}</h4>
                      <p className="text-sm opacity-80">{option.description}</p>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold mb-1">₦{option.price}</div>
                      <div className="text-sm opacity-80">per seat</div>
                      <div className="text-sm font-medium mt-2">
                        You earn: ₦{driverEarnings}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Demand Level:</span>
                        <span className={`font-medium ${option.demandColor}`}>{option.demand}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {option.tips.map((tip, index) => (
                        <div key={index} className="text-xs opacity-80 flex items-start space-x-1">
                          <span className="text-green-600">•</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSelectPrice(option.price)}
                      className="w-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                    >
                      Select ₦{option.price}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Commission Breakdown */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
            <h4 className="font-semibold text-yellow-800 mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Commission Breakdown</span>
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {pricingOptions.map((option) => (
                <div key={option.type} className="bg-white p-4 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">{option.type} - ₦{option.price}</div>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>MOBIRIDE.NG Fee (15%):</span>
                      <span>₦{Math.round(option.price * 0.15)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-green-600 border-t pt-1">
                      <span>You receive:</span>
                      <span>₦{calculateDriverEarnings(option.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-sky-50 border border-sky-200 p-6 rounded-xl">
            <h4 className="font-semibold text-sky-800 mb-4">💡 Pricing Tips</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-sky-700">
              <div className="space-y-2">
                {route.isInterstate ? (
                  <>
                    <div>• Interstate rates are typically 3-5x local rates</div>
                    <div>• Premium pricing justified for long-distance comfort</div>
                    <div>• Consider vehicle type and amenities for pricing</div>
                  </>
                ) : (
                  <>
                    <div>• Lower prices during off-peak hours attract more passengers</div>
                    <div>• Premium pricing works best for luxury vehicles</div>
                    <div>• Consider traffic conditions when setting prices</div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                {route.isInterstate ? (
                  <>
                    <div>• Early morning departures are most popular</div>
                    <div>• Include rest stops and refreshments in premium pricing</div>
                    <div>• Weekend interstate rates can be 20-30% higher</div>
                  </>
                ) : (
                  <>
                    <div>• Dynamic pricing helps maximize occupancy</div>
                    <div>• Regular routes can use competitive pricing</div>
                    <div>• Weekend rates can be slightly higher</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingAdviceModal;