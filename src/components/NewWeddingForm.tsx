import React, { useState } from 'react';
import { WeddingFormData, WeddingInput } from '../types';
import { Calendar, MapPin, Phone, FileText, Bell, X, User } from 'lucide-react';

interface NewWeddingFormProps {
  onSave: (wedding: WeddingInput) => void;
  onCancel: () => void;
}

const NewWeddingForm: React.FC<NewWeddingFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<WeddingFormData>({
    clientName: '',
    date: '',
    venue: '',
    phoneNumber: '',
    notes: '',
    notifications: {
      oneWeek: false,
      threeDays: false,
      oneDay: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weddingInput: WeddingInput = {
      ...formData,
      date: formData.date
    };
    onSave(weddingInput);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const [parent, child] = name.split('.');
      if (parent === 'notifications') {
        setFormData(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [child]: (e.target as HTMLInputElement).checked
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto transition-opacity duration-300">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md mx-auto p-4 sm:p-6 shadow-2xl transform transition-all duration-300 scale-100 my-2 sm:my-4">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            Nouveau Mariage
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 sm:p-2 hover:bg-gray-700/50 rounded-full transition-colors duration-200 group"
            aria-label="Fermer"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-1.5">
                Nom du client
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-600"
                  placeholder="Nom complet"
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-1.5">
                Date du mariage
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-7 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-600 [&::-webkit-calendar-picker-indicator]:bg-white/10 [&::-webkit-calendar-picker-indicator]:hover:bg-white/20 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-0.5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:transition-colors [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 sm:[&::-webkit-calendar-picker-indicator]:w-5 sm:[&::-webkit-calendar-picker-indicator]:h-5"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="venue" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-1.5">
                Lieu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-600"
                  placeholder="Lieu du mariage"
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-1.5">
                Numéro de téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-600"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-1.5">
                Notes
              </label>
              <div className="relative">
                <div className="absolute top-2 sm:top-3 left-2.5 sm:left-3 pointer-events-none">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-600 resize-none"
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <span>Notifications</span>
                </div>
              </label>
              <div className="space-y-2 bg-gray-800/30 p-2.5 sm:p-3.5 rounded-xl border border-gray-700">
                <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications.oneWeek"
                    checked={formData.notifications.oneWeek}
                    onChange={handleChange}
                    className="form-checkbox h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 rounded border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <span>Une semaine avant</span>
                </label>
                <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications.threeDays"
                    checked={formData.notifications.threeDays}
                    onChange={handleChange}
                    className="form-checkbox h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 rounded border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <span>Trois jours avant</span>
                </label>
                <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications.oneDay"
                    checked={formData.notifications.oneDay}
                    onChange={handleChange}
                    className="form-checkbox h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 rounded border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <span>Un jour avant</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all duration-200 hover:text-white border border-gray-700 hover:border-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2.5 sm:py-3 rounded-xl font-medium hover:bg-blue-400 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewWeddingForm;