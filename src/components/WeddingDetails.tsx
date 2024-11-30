import { useState } from 'react';
import { format } from 'date-fns';
import type { Wedding, WeddingFormData } from '../types';
import { ArrowLeft, MapPin, Users, Bell, Phone, CalendarDays, FileText, Trash2, Edit2, Save, X } from 'lucide-react';

interface WeddingDetailsProps {
  wedding: Wedding;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (wedding: Wedding) => void;
}

export default function WeddingDetails({ wedding, onBack, onDelete, onUpdate }: WeddingDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWedding, setEditedWedding] = useState<WeddingFormData>({
    clientName: wedding.clientName,
    date: format(new Date(wedding.date), 'yyyy-MM-dd'),
    venue: wedding.venue,
    phoneNumber: wedding.phoneNumber,
    notes: wedding.notes || '',
    guestCount: wedding.guestCount,
    notifications: {
      oneWeek: wedding.notifications?.oneWeek || false,
      threeDays: wedding.notifications?.threeDays || false,
      oneDay: wedding.notifications?.oneDay || false
    }
  });

  const handleDelete = () => {
    if (wedding._id) {
      onDelete(wedding._id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedWedding({
      clientName: wedding.clientName,
      date: format(new Date(wedding.date), 'yyyy-MM-dd'),
      venue: wedding.venue,
      phoneNumber: wedding.phoneNumber,
      notes: wedding.notes || '',
      guestCount: wedding.guestCount,
      notifications: {
        oneWeek: wedding.notifications?.oneWeek || false,
        threeDays: wedding.notifications?.threeDays || false,
        oneDay: wedding.notifications?.oneDay || false
      }
    });
  };

  const handleSave = () => {
    const updatedWedding: Wedding = {
      ...wedding,
      clientName: editedWedding.clientName,
      date: new Date(editedWedding.date),
      venue: editedWedding.venue,
      phoneNumber: editedWedding.phoneNumber,
      notes: editedWedding.notes,
      guestCount: editedWedding.guestCount,
      notifications: {
        oneWeek: editedWedding.notifications.oneWeek,
        threeDays: editedWedding.notifications.threeDays,
        oneDay: editedWedding.notifications.oneDay
      }
    };

    onUpdate(updatedWedding);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedWedding({
      clientName: wedding.clientName,
      date: format(new Date(wedding.date), 'yyyy-MM-dd'),
      venue: wedding.venue,
      phoneNumber: wedding.phoneNumber,
      notes: wedding.notes || '',
      guestCount: wedding.guestCount,
      notifications: {
        oneWeek: wedding.notifications?.oneWeek || false,
        threeDays: wedding.notifications?.threeDays || false,
        oneDay: wedding.notifications?.oneDay || false
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const [parent, child] = name.split('.');
      if (parent === 'notifications') {
        setEditedWedding((prev: WeddingFormData) => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [child]: (e.target as HTMLInputElement).checked
          }
        }));
      }
    } else {
      setEditedWedding((prev: WeddingFormData) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white transition-all transform hover:scale-105 duration-200 ease-in-out"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Retour au Dashboard</span>
        </button>
        <div className="flex gap-3">
          {isEditing ? (
            <>

              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 duration-200 ease-in-out shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 duration-200 ease-in-out shadow-lg"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </button>
            </>
          ) : (
            <>

              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 duration-200 ease-in-out shadow-lg"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 duration-200 ease-in-out shadow-lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
        <div className="p-8 space-y-8">
          <div className="flex flex-col space-y-6">
            <div className="space-y-4">
              {isEditing ? (
                <input
                  type="text"
                  name="clientName"
                  value={editedWedding.clientName}
                  onChange={handleChange}
                  className="text-3xl font-bold bg-gray-700/50 text-white w-full px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="Nom des mariés"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white">
                  {wedding.clientName}
                </h1>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-xl">
                  <CalendarDays className="h-6 w-6 text-blue-400" />
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="date"
                          name="date"
                          value={editedWedding.date}
                          onChange={handleChange}
                          className="w-full bg-gray-600/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <div className="text-white">
                        {format(new Date(wedding.date), 'PPP')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-xl">
                  <MapPin className="h-6 w-6 text-pink-400" />
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="venue"
                        value={editedWedding.venue}
                        onChange={handleChange}
                        className="w-full bg-gray-600/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="Lieu du mariage"
                      />
                    ) : (
                      <span className="text-white">{wedding.venue}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-xl">
                  <Users className="h-6 w-6 text-purple-400" />
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="number"
                        name="guestCount"
                        value={editedWedding.guestCount}
                        onChange={handleChange}
                        min="0"
                        className="w-full bg-gray-600/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="Nombre d'invités"
                      />
                    ) : (
                      <span className="text-white">{wedding.guestCount} invités</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-xl">
                  <Phone className="h-6 w-6 text-green-400" />
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editedWedding.phoneNumber}
                        onChange={handleChange}
                        className="w-full bg-gray-600/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="Numéro de téléphone"
                      />
                    ) : (
                      <span className="text-white">{wedding.phoneNumber}</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-700/30 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-6 w-6 text-yellow-400" />
                    <span className="text-white font-medium">Notifications</span>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        name="notifications.oneWeek"
                        checked={editedWedding.notifications?.oneWeek}
                        onChange={handleChange}

                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                      <span>1 semaine avant</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        name="notifications.threeDays"
                        checked={editedWedding.notifications?.threeDays}
                        onChange={handleChange}

                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                      <span>3 jours avant</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        name="notifications.oneDay"
                        checked={editedWedding.notifications?.oneDay}
                        onChange={handleChange}

                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                      <span>1 jour avant</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-orange-400" />
                <span className="text-white font-medium">Notes</span>
              </div>
              {isEditing ? (
                <textarea
                  name="notes"
                  value={editedWedding.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-gray-600/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Notes additionnelles..."
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">{wedding.notes || 'Aucune note'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}