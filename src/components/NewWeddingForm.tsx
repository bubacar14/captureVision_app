import React, { useState } from 'react';
import { Wedding } from '../types';
import { X, Phone } from 'lucide-react';

interface NewWeddingFormProps {
  onClose: () => void;
  onSave: (wedding: Omit<Wedding, 'id'>) => void;
}

export default function NewWeddingForm({ onClose, onSave }: NewWeddingFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    partnersName: '',
    date: '',
    time: '',
    venue: '',
    phoneNumber: '',
    guestCount: '',
    budget: '',
    notes: '',
    ceremonyType: 'civil'
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validation des champs requis
      if (!formData.clientName || !formData.date || !formData.venue || !formData.phoneNumber || !formData.ceremonyType) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation de la longueur des champs
      if (formData.clientName.length < 2 || formData.clientName.length > 100) {
        setError('Le nom des mariés doit contenir entre 2 et 100 caractères');
        return;
      }

      if (formData.venue.length < 2 || formData.venue.length > 200) {
        setError('Le lieu doit contenir entre 2 et 200 caractères');
        return;
      }

      // Validation du nombre d'invités
      const guestCount = Number(formData.guestCount);
      if (isNaN(guestCount) || guestCount < 1 || guestCount > 1000) {
        setError('Le nombre d\'invités doit être compris entre 1 et 1000');
        return;
      }

      // Validation du budget
      const budget = Number(formData.budget);
      if (isNaN(budget) || budget < 0) {
        setError('Le budget ne peut pas être négatif');
        return;
      }

      const weddingData = {
        clientName: formData.clientName.trim(),
        partnersName: formData.partnersName.trim() || formData.clientName.trim(),
        date: new Date(formData.date + 'T' + (formData.time || '00:00')).toISOString(),
        venue: formData.venue.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        guestCount: guestCount,
        budget: budget,
        notes: formData.notes.trim() || '',
        ceremonyType: formData.ceremonyType,
        notifications: {
          oneWeek: true,
          threeDays: true,
          oneDay: true
        }
      };

      console.log('Préparation des données du mariage:', weddingData);
      await onSave(weddingData);
      console.log('Mariage enregistré avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (error instanceof Error) {
        // Gestion des messages d'erreur spécifiques
        if (error.message.includes('validation')) {
          setError('Erreur de validation: veuillez vérifier les champs du formulaire');
        } else {
          setError(error.message);
        }
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Nouveau Mariage</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom des mariés *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Nom des mariés"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom des partenaires
              </label>
              <input
                type="text"
                value={formData.partnersName}
                onChange={(e) => setFormData({ ...formData, partnersName: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Nom des partenaires"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Numéro de téléphone *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Lieu *
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Lieu du mariage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Type de cérémonie *
              </label>
              <select
                required
                value={formData.ceremonyType}
                onChange={(e) => setFormData({ ...formData, ceremonyType: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="civil">Civile</option>
                <option value="religious">Religieuse</option>
                <option value="both">Les deux</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre d'invités
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre d'invités"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Budget
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Budget en €"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24 resize-none"
                placeholder="Notes additionnelles"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}