import React, { useState } from 'react';
import { WeddingFormData, WeddingInput } from '../types';

interface NewWeddingFormProps {
  onSave: (wedding: WeddingInput) => void;
  onCancel: () => void;
}

const NewWeddingForm: React.FC<NewWeddingFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<WeddingFormData>({
    clientName: '',
    partnersName: '',
    date: '',
    venue: '',
    phoneNumber: '',
    guestCount: 0,
    budget: 0,
    notes: '',
    ceremonyType: '',
    status: 'planned',
    notifications: {
      oneWeek: true,
      threeDays: true,
      oneDay: true
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weddingInput: WeddingInput = {
      ...formData,
      date: formData.date // La date sera convertie côté serveur
    };
    onSave(weddingInput);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else if (type === 'checkbox' && name.startsWith('notifications.')) {
      const notificationKey = name.split('.')[1] as keyof typeof formData.notifications;
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationKey]: (e.target as HTMLInputElement).checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Nouveau Mariage</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-300">
              Nom du client
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="partnersName" className="block text-sm font-medium text-gray-300">
              Nom du/de la partenaire
            </label>
            <input
              type="text"
              id="partnersName"
              name="partnersName"
              value={formData.partnersName}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">
              Date du mariage
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-300">
              Lieu
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
              Numéro de téléphone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.716 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-gray-300">
              Nombre d'invités
            </label>
            <input
              type="number"
              id="guestCount"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              required
              min="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-300">
              Budget
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              min="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="ceremonyType" className="block text-sm font-medium text-gray-300">
              Type de cérémonie
            </label>
            <select
              id="ceremonyType"
              name="ceremonyType"
              value={formData.ceremonyType}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Sélectionnez un type</option>
              <option value="civil">Civil</option>
              <option value="religious">Religieux</option>
              <option value="both">Les deux</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="planned">Prévu</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-300">Notifications</span>
            <div className="space-y-1">
              <div>
                <input
                  type="checkbox"
                  id="notifications.oneWeek"
                  name="notifications.oneWeek"
                  checked={formData.notifications.oneWeek}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="notifications.oneWeek">Une semaine avant</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="notifications.threeDays"
                  name="notifications.threeDays"
                  checked={formData.notifications.threeDays}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="notifications.threeDays">Trois jours avant</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="notifications.oneDay"
                  name="notifications.oneDay"
                  checked={formData.notifications.oneDay}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="notifications.oneDay">Un jour avant</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600"
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