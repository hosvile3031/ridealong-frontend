import React, { useState } from 'react';
import { User2, Star, Car, Shield, Phone, Mail, MapPin, Edit3, Camera, Award, TrendingUp, LogOut } from 'lucide-react';
import { AuthUser } from '../types';

interface ProfileProps {
  user: AuthUser | null;
  onAuthRequired: (mode: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onAuthRequired, onSignOut }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User2 className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your profile</h3>
        <p className="text-gray-600 mb-6">Create an account or sign in to manage your profile and track your rides.</p>
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

  const stats = [
    { label: 'Rides Completed', value: user.ridesCompleted.toString(), icon: Car, color: 'text-green-600' },
    { label: 'Average Rating', value: user.rating.toString(), icon: Star, color: 'text-yellow-500' },
    { label: 'CO₂ Saved', value: '1.8t', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Money Saved', value: '₦85k', icon: Award, color: 'text-sky-600' }
  ];

  const achievements = [
    { title: 'Eco Warrior', description: 'Saved over 1 ton of CO₂', icon: '🌱', earned: true },
    { title: 'Super Host', description: '50+ successful rides', icon: '⭐', earned: user.ridesCompleted >= 50 },
    { title: 'Early Bird', description: 'Consistent morning commuter', icon: '🌅', earned: true },
    { title: 'Social Butterfly', description: 'High passenger ratings', icon: '🦋', earned: user.rating >= 4.5 }
  ];

  const recentActivity = [
    { type: 'ride', description: 'Completed ride to Maitama', date: '2 days ago', rating: 5 },
    { type: 'review', description: 'Received 5-star review from Kemi', date: '3 days ago', rating: 5 },
    { type: 'ride', description: 'Posted new ride for tomorrow', date: '1 week ago', rating: null }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          My
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-800"> Profile</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your profile and track your carpooling journey across Nigeria.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-24"></div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col items-center -mt-12">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 bg-sky-600 text-white p-2 rounded-full shadow-lg hover:bg-sky-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-center mt-4 space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      {user.verified ? 'Verified User' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{user.rating}</span>
                    <span className="text-gray-500 text-sm">({user.ridesCompleted} rides)</span>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full bg-gradient-to-r from-sky-600 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-sky-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                  
                  <button
                    onClick={onSignOut}
                    className="w-full bg-red-50 text-red-600 py-3 px-6 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-all duration-300">
                  <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
            <p className="text-gray-600 leading-relaxed">
              Daily commuter and MOBIRIDE.NG enthusiast from {user.location}. 
              Love meeting new people and sharing rides to reduce traffic across Nigeria! 
              Always punctual and enjoy good conversations during rides.
            </p>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.earned
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className={`font-semibold ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'ride' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  {activity.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{activity.rating}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;