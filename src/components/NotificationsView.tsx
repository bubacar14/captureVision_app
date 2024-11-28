import { Bell, Calendar, Clock, MapPin } from 'lucide-react';
import { Wedding, View } from '../types';
import { format, isAfter, addDays, addWeeks } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import { fr } from '../i18n/fr';

interface NotificationsViewProps {
  weddings: Wedding[];
  onViewChange: (view: View) => void;
}

type NotificationType = 'oneWeek' | 'threeDays' | 'oneDay';

interface NotificationItem {
  id: string;
  wedding: Wedding;
  type: NotificationType;
  notifyDate: Date;
}

export default function NotificationsView({ weddings, onViewChange }: NotificationsViewProps) {
  const today = new Date();

  const getNotificationMessage = (type: NotificationType): string => {
    switch (type) {
      case 'oneWeek':
        return fr.notifications.timing.oneWeek;
      case 'threeDays':
        return fr.notifications.timing.threeDays;
      case 'oneDay':
        return fr.notifications.timing.oneDay;
      default:
        return '';
    }
  };

  const getUpcomingNotifications = (): NotificationItem[] => {
    return weddings
      .filter(wedding => isAfter(new Date(wedding.date), today))
      .flatMap(wedding => {
        const notifications: NotificationItem[] = [];
        const weddingDate = new Date(wedding.date);

        // Vérifier si les notifications sont définies
        if (!wedding.notifications) {
          return notifications;
        }

        if (wedding.notifications.oneWeek) {
          const oneWeekBefore = addWeeks(weddingDate, -1);
          if (isAfter(oneWeekBefore, today)) {
            notifications.push({
              id: `${wedding._id}-week`,
              wedding,
              type: 'oneWeek',
              notifyDate: oneWeekBefore,
            });
          }
        }

        if (wedding.notifications.threeDays) {
          const threeDaysBefore = addDays(weddingDate, -3);
          if (isAfter(threeDaysBefore, today)) {
            notifications.push({
              id: `${wedding._id}-3days`,
              wedding,
              type: 'threeDays',
              notifyDate: threeDaysBefore,
            });
          }
        }

        if (wedding.notifications.oneDay) {
          const oneDayBefore = addDays(weddingDate, -1);
          if (isAfter(oneDayBefore, today)) {
            notifications.push({
              id: `${wedding._id}-day`,
              wedding,
              type: 'oneDay',
              notifyDate: oneDayBefore,
            });
          }
        }

        return notifications;
      })
      .sort((a, b) => a.notifyDate.getTime() - b.notifyDate.getTime());
  };

  const notifications = getUpcomingNotifications();

  if (notifications.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">
          {fr.notifications.empty.title}
        </h3>
        <p className="text-gray-400">
          {fr.notifications.empty.description}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-100">
            {fr.notifications.title}
          </h2>
        </div>

        <div className="space-y-4">
          {notifications.map(({ wedding, type, notifyDate }) => (
            <div
              key={`${wedding._id}-${type}`}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onViewChange('calendar');
                      }}
                      className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                    >
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-blue-400">
                        {format(notifyDate, "d MMMM yyyy 'à' HH'h'mm", { locale: frLocale })}
                      </span>
                    </button>
                  </div>

                  <div className="text-lg font-semibold text-gray-100">
                    {wedding.clientName}
                  </div>

                  <div className="flex items-center space-x-4 text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(wedding.date), "HH'h'mm", { locale: frLocale })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{wedding.venue}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400">
                    {getNotificationMessage(type)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}