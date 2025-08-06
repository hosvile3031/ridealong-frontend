import React, { useState } from 'react';
import Header from './components/Header';
import SearchRides from './components/SearchRides';
import PostRide from './components/PostRide';
import MyBookings from './components/MyBookings';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';
import LoadingSpinner from './components/LoadingSpinner';
import { ViewMode } from './types';
import { UserProvider, useUser } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RideProvider } from './contexts/RideContext';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, isLoading, logout } = useUser();

  const handleAuthRequired = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    logout();
    setCurrentView('search');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'search':
        return <SearchRides user={user} onAuthRequired={handleAuthRequired} />;
      case 'post':
        return <PostRide user={user} onAuthRequired={handleAuthRequired} />;
      case 'bookings':
        return <MyBookings user={user} onAuthRequired={handleAuthRequired} />;
      case 'profile':
        return <Profile user={user} onAuthRequired={handleAuthRequired} onSignOut={handleSignOut} />;
      default:
        return <SearchRides user={user} onAuthRequired={handleAuthRequired} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
        onAuthRequired={handleAuthRequired}
        onSignOut={handleSignOut}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onAuthSuccess={handleAuthSuccess}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <RideProvider>
          <AppContent />
        </RideProvider>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
