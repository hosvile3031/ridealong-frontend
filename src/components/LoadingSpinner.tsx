import React from 'react';
import { Car } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-xl';
      default:
        return 'text-lg';
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Car Icon */}
      <div className="relative">
        <div className={`${getSizeClasses()} text-blue-600 animate-pulse`}>
          <Car className="w-full h-full" />
        </div>
        
        {/* Rotating Spinner */}
        <div className={`absolute inset-0 ${getSizeClasses()} border-4 border-transparent border-t-blue-600 rounded-full animate-spin`} />
      </div>
      
      {/* Loading Message */}
      <div className="text-center">
        <p className={`font-semibold text-gray-900 ${getTextSize()}`}>
          {message}
        </p>
        <div className="flex items-center justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
