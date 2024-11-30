import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { Wedding } from '../../types';

interface WeddingCardProps {
  wedding: Wedding;
  onClick: () => void;
}

export default function WeddingCard({ wedding, onClick }: WeddingCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-16 h-16 bg-emerald-50 rounded-xl flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-emerald-600">
            {format(wedding.date, 'dd')}
          </span>
          <span className="text-sm text-emerald-600">
            {format(wedding.date, 'MMM')}
          </span>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {wedding.clientName}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(wedding.date, 'h:mm a')}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{wedding.venue}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            <Users className="h-4 w-4 inline mr-1" />
            {wedding.guestCount} guests
          </span>
        </div>
      </div>
    </div>
  );
}