import React, { useState } from 'react';
import { X, AlertTriangle, Shield, DollarSign, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { Ride } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  reportType: 'driver' | 'passenger';
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, ride, reportType }) => {
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const reportReasons = reportType === 'driver' ? [
    { id: 'extra_payment', label: 'Requested additional payment during ride', icon: DollarSign },
    { id: 'unsafe_driving', label: 'Unsafe or reckless driving', icon: AlertTriangle },
    { id: 'late_pickup', label: 'Significantly late for pickup', icon: Clock },
    { id: 'inappropriate_behavior', label: 'Inappropriate behavior or comments', icon: MessageCircle },
    { id: 'vehicle_condition', label: 'Vehicle not as described or unsafe', icon: Shield },
    { id: 'route_change', label: 'Changed route without consent', icon: AlertTriangle },
    { id: 'other', label: 'Other (please specify)', icon: MessageCircle }
  ] : [
    { id: 'no_show', label: 'Did not show up for pickup', icon: Clock },
    { id: 'late_arrival', label: 'Significantly late for pickup', icon: Clock },
    { id: 'inappropriate_behavior', label: 'Inappropriate behavior', icon: MessageCircle },
    { id: 'payment_issue', label: 'Payment or booking issues', icon: DollarSign },
    { id: 'other', label: 'Other (please specify)', icon: MessageCircle }
  ];

  const handleSubmit = async () => {
    if (!reportReason || (reportReason === 'other' && !customReason.trim())) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReportReason('');
        setCustomReason('');
      }, 2000);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h3>
          <p className="text-gray-600 mb-4">
            Thank you for your report. Our safety team will review this within 24 hours.
          </p>
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-blue-800 font-medium">Report ID: #{Date.now().toString().slice(-6)}</p>
            <p className="text-blue-600 text-sm">Keep this for your records</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-600" />
            <span>Report {reportType === 'driver' ? 'Driver' : 'Passenger'}</span>
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
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Ride Details</h3>
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
                <span className="text-gray-600">{reportType === 'driver' ? 'Driver' : 'Passenger'}:</span>
                <span className="font-medium">{reportType === 'driver' ? ride.driver.name : 'Passenger Name'}</span>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-900 font-medium text-sm">Safety First</p>
                <p className="text-red-700 text-sm">
                  If you're in immediate danger, please contact emergency services (199) first. 
                  This report helps us maintain a safe community for all users.
                </p>
              </div>
            </div>
          </div>

          {/* Report Reasons */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">What happened?</h4>
            <div className="space-y-3">
              {reportReasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <button
                    key={reason.id}
                    onClick={() => setReportReason(reason.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      reportReason === reason.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${
                        reportReason === reason.id ? 'text-red-600' : 'text-gray-600'
                      }`} />
                      <span className={`font-medium ${
                        reportReason === reason.id ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {reason.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Reason */}
          {reportReason === 'other' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Please describe what happened
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Provide details about the incident..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                required
              />
            </div>
          )}

          {/* Additional Details */}
          {reportReason && reportReason !== 'other' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Any additional information that might help us understand what happened..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reportReason || (reportReason === 'other' && !customReason.trim())}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              False reports may result in account suspension
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;