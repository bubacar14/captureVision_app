import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Users, Clock, Bell, Phone, CalendarDays, FileText } from 'lucide-react';
import { Wedding } from '../types';

interface WeddingDetailsProps {
  wedding: Wedding;
  onBack: () => void;
}

export default function WeddingDetails({ wedding, onBack }: WeddingDetailsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-gray-400 hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 mb-2">
                {wedding.clientName}
              </h1>
              <div className="flex items-center text-gray-400">
                <CalendarDays className="h-5 w-5 mr-2 text-teal-500" />
                <span>{format(new Date(wedding.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-teal-500 bg-opacity-10 rounded-lg">
              <div className="text-sm font-medium text-teal-400">Wedding ID</div>
              <div className="text-lg font-mono text-gray-300">#{wedding.id}</div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Event Details</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-400">
                  <Clock className="h-5 w-5 mr-3 text-teal-500" />
                  <span>{format(new Date(wedding.date), 'h:mm a')}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-5 w-5 mr-3 text-teal-500" />
                  <span>{wedding.venue}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users className="h-5 w-5 mr-3 text-teal-500" />
                  <span>{wedding.guestCount} guests expected</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="h-5 w-5 mr-3 text-teal-500" />
                  <span>{wedding.phoneNumber}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Notes</h2>
              <p className="text-gray-400 whitespace-pre-line">
                {wedding.notes || 'No notes added'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-teal-500" />
                  Notifications
                </div>
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-400">
                  <span>One week before</span>
                  <span className={wedding.notifications.oneWeek ? 'text-teal-400' : 'text-gray-500'}>
                    {wedding.notifications.oneWeek ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Three days before</span>
                  <span className={wedding.notifications.threeDays ? 'text-teal-400' : 'text-gray-500'}>
                    {wedding.notifications.threeDays ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>One day before</span>
                  <span className={wedding.notifications.oneDay ? 'text-teal-400' : 'text-gray-500'}>
                    {wedding.notifications.oneDay ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-teal-500" />
                  Quick Actions
                </div>
              </h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                  Edit Wedding Details
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition-colors">
                  Download Schedule
                </button>
                <button className="w-full px-4 py-2 bg-red-500 bg-opacity-10 text-red-400 rounded-lg hover:bg-opacity-20 transition-colors">
                  Cancel Wedding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}