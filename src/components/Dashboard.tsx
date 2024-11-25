import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Wedding } from '../types';

interface DashboardProps {
  weddings: Wedding[];
  onWeddingSelect: (wedding: Wedding) => void;
}

export default function Dashboard({ weddings, onWeddingSelect }: DashboardProps) {
  const sortedWeddings = [...weddings].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedWeddings.map((wedding) => (
          <div
            key={wedding.id}
            onClick={() => onWeddingSelect(wedding)}
            className="bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-gray-100">
                {wedding.clientName}
              </h3>
              <span className="px-3 py-1 bg-teal-500 bg-opacity-10 text-teal-400 text-sm rounded-full">
                {format(new Date(wedding.date), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center text-gray-400">
                <Clock className="h-5 w-5 mr-2 text-teal-500" />
                <span>{format(new Date(wedding.date), 'h:mm a')}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-2 text-teal-500" />
                <span>{wedding.venue}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <Users className="h-5 w-5 mr-2 text-teal-500" />
                <span>{wedding.guestCount} guests</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Notifications</h4>
                <div className="flex gap-2">
                  {wedding.notifications.oneWeek && (
                    <span className="px-2 py-1 bg-teal-500 bg-opacity-10 text-teal-400 text-xs rounded">
                      1 week
                    </span>
                  )}
                  {wedding.notifications.threeDays && (
                    <span className="px-2 py-1 bg-teal-500 bg-opacity-10 text-teal-400 text-xs rounded">
                      3 days
                    </span>
                  )}
                  {wedding.notifications.oneDay && (
                    <span className="px-2 py-1 bg-teal-500 bg-opacity-10 text-teal-400 text-xs rounded">
                      1 day
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {weddings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Weddings Yet</h3>
          <p className="text-gray-400">
            Click the + button to add your first wedding event.
          </p>
        </div>
      )}
    </div>
  );
}