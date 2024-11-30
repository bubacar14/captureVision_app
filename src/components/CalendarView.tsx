import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Wedding } from '../types';

interface CalendarViewProps {
  weddings: Wedding[];
  onWeddingSelect: (wedding: Wedding) => void;
}

export default function CalendarView({ weddings, onWeddingSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getWeddingsForDay = (date: Date) => {
    return weddings.filter((wedding) => {
      const weddingDate = new Date(wedding.date);
      return isSameDay(weddingDate, date);
    });
  };

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="bg-[#232D36] rounded-2xl p-3 sm:p-6 shadow-xl border border-[#9FA2A7]/10 backdrop-blur-sm">
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-[#3B82F6]/10 p-1.5 sm:p-2 rounded-xl">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#3B82F6]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={previousMonth}
                className="p-2 sm:p-2.5 hover:bg-[#3B82F6]/10 rounded-xl transition-all duration-300 text-[#9FA2A7] hover:text-[#3B82F6]"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 sm:p-2.5 hover:bg-[#3B82F6]/10 rounded-xl transition-all duration-300 text-[#9FA2A7] hover:text-[#3B82F6]"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-3">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center py-1 sm:py-2 text-[#9FA2A7] font-medium text-xs sm:text-sm"
              >
                {day}
              </div>
            ))}

            {days.map((day) => {
              const dayWeddings = getWeddingsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 rounded-xl transition-all duration-300
                    ${isCurrentMonth ? 'bg-[#101D25]' : 'bg-[#101D25]/50'}
                    ${isCurrentDay ? 'ring-2 ring-[#3B82F6]' : 'hover:ring-1 hover:ring-[#3B82F6]/30'}
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  <div className="text-right mb-1 sm:mb-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-lg text-xs sm:text-sm font-medium
                        ${isCurrentDay ? 'bg-[#3B82F6] text-white' : 'text-[#9FA2A7]'}
                        ${dayWeddings.length > 0 && !isCurrentDay ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dayWeddings.map((wedding) => (
                      <button
                        key={wedding._id}
                        onClick={() => onWeddingSelect(wedding)}
                        className="w-full text-left p-1 sm:p-2 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 transition-all duration-300 group"
                      >
                        <div className="text-xs sm:text-sm font-medium text-[#3B82F6] group-hover:text-[#3B82F6] truncate">
                          {wedding.clientName}
                        </div>
                        <div className="text-[10px] sm:text-xs text-[#9FA2A7] group-hover:text-[#9FA2A7] truncate">
                          {format(new Date(wedding.date), 'HH:mm')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {weddings.length === 0 && (
        <div className="text-center bg-[#232D36] rounded-2xl p-4 sm:p-8 shadow-xl border border-[#9FA2A7]/10 backdrop-blur-sm">
          <div className="bg-[#3B82F6]/10 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#3B82F6]" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-white mb-2">Aucun mariage planifié</h3>
          <p className="text-sm sm:text-base text-[#9FA2A7]">
            Ajoutez votre premier mariage pour le voir sur le calendrier
          </p>
        </div>
      )}
    </div>
  );
}