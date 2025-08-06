import React, { useState } from 'react';
import { X, Share2, Copy, MessageCircle, Mail, Facebook, Twitter, Apple as WhatsApp, CheckCircle } from 'lucide-react';
import { Ride } from '../types';

interface ShareRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
}

const ShareRideModal: React.FC<ShareRideModalProps> = ({ isOpen, onClose, ride }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = ride.shareableLink || `https://rideshare-abuja.com/ride/${ride.id}`;
  const shareText = `🚗 Join my ride from ${ride.from.area} to ${ride.to.area} on ${new Date(ride.date).toLocaleDateString()} at ${ride.time}! Only ₦${ride.currentPricePerSeat} per seat. Book now: ${shareUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=Join my ride in Abuja&body=${encodeURIComponent(shareText)}`
    }
  ];

  const savings = ride.basePricePerSeat - ride.currentPricePerSeat;
  const discountPercentage = Math.round((savings / ride.basePricePerSeat) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Share2 className="h-6 w-6 text-green-600" />
            <span>Share Your Ride</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ride Details */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your Ride</h3>
              {savings > 0 && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">{ride.from.area} → {ride.to.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{new Date(ride.date).toLocaleDateString()} at {ride.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Seats:</span>
                <span className="font-medium">{ride.availableSeats} of {ride.totalSeats}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-600">Price per seat:</span>
                <div className="text-right">
                  {savings > 0 && (
                    <span className="text-gray-400 line-through text-xs">₦{ride.basePricePerSeat}</span>
                  )}
                  <span className="font-bold text-green-600 ml-2">₦{ride.currentPricePerSeat}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Pricing Info */}
          <div className="bg-yellow-50 p-4 rounded-xl">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Smart Pricing</h4>
            <p className="text-yellow-700 text-sm">
              The more people join your ride, the cheaper it gets for everyone! 
              {savings > 0 ? (
                <span className="font-medium"> Current savings: ₦{savings} per seat!</span>
              ) : (
                <span> Share to unlock discounts!</span>
              )}
            </p>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Share Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Share via</label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${option.color} text-white p-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{option.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareRideModal;