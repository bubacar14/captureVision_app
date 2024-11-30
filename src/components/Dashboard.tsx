import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import type { Wedding } from '../types';

interface DashboardProps {
  weddings: Wedding[];
  onWeddingSelect: (wedding: Wedding) => void;
  isLoading?: boolean;
}

export default function Dashboard({ weddings = [], onWeddingSelect, isLoading }: DashboardProps) {
  const sortedWeddings = [...(weddings || [])].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  console.log('Rendering Dashboard with weddings:', weddings);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!weddings || weddings.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Aucun mariage planifié</h2>
        <p className="text-gray-400">Ajoutez votre premier mariage en cliquant sur le bouton "Nouveau mariage"</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Mariages à venir</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedWeddings.map((wedding) => (
          <div
            key={wedding._id}
            onClick={() => onWeddingSelect(wedding)}
            className="bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-gray-100">
                {wedding.clientName}
              </h3>
              <span className="px-3 py-1 bg-blue-500 bg-opacity-10 text-blue-400 text-sm rounded-full">
                {format(new Date(wedding.date), 'dd MMM yyyy')}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                <span>{format(new Date(wedding.date), 'EEEE')}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <span>{wedding.timeline && wedding.timeline[0] ? wedding.timeline[0].time : 'Heure à définir'}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                <span>{wedding.venue}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                <span>{wedding.guestCount} invités</span>
              </div>

              {wedding.services && wedding.services.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {wedding.services?.map((service: string) => (
                      <span 
                        key={`${wedding._id}-${service}`} 
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}