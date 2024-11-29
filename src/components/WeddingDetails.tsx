import { format } from 'date-fns';
import { ArrowLeft, MapPin, Users, Bell, Phone, CalendarDays, FileText, Trash2, Edit2, Save, X } from 'lucide-react';
import { Wedding } from '../types';
import { useState } from 'react';

interface WeddingDetailsProps {
  wedding: Wedding;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedWedding: Partial<Wedding>) => void;
}

export default function WeddingDetails({ wedding, onBack, onDelete, onUpdate }: WeddingDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWedding, setEditedWedding] = useState(wedding);

  const handleDelete = () => {
    console.log('Attempting to delete wedding with data:', {
      id: wedding._id,
      clientName: wedding.clientName,
      fullWedding: wedding
    });
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mariage ? Cette action est irréversible.')) {
      onDelete(wedding._id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedWedding(wedding);
  };

  const handleSave = () => {
    console.log('WeddingDetails - Original wedding:', wedding);
    console.log('WeddingDetails - Edited wedding:', editedWedding);
    
    // Ensure we have a valid wedding ID
    if (!wedding._id) {
      console.error('Wedding ID is missing');
      return;
    }

    // Préparer les données pour l'API
    const updatedData: Partial<Wedding> = {
      _id: wedding._id, // Include the ID in the update data
      clientName: editedWedding.clientName ?? '', // Use nullish coalescing to provide empty string if undefined
      date: editedWedding.date 
        ? (editedWedding.date instanceof Date 
          ? editedWedding.date 
          : new Date(editedWedding.date))
        : undefined, // Explicitly handle potential undefined case
      partnerName: editedWedding.partnerName ?? '',
      venue: editedWedding.venue ?? '',
      phoneNumber: editedWedding.phoneNumber ?? '',
      contactEmail: editedWedding.contactEmail ?? '',
      guestCount: editedWedding.guestCount ?? 0,
      notes: editedWedding.notes ?? '',
      notifications: editedWedding.notifications ?? {
        oneWeek: false,
        threeDays: false,
        oneDay: false
      }
    };

    console.log('WeddingDetails - Wedding ID for update:', wedding._id);
    console.log('WeddingDetails - Update data prepared:', updatedData);
    
    onUpdate(wedding._id, updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedWedding(wedding);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Field changed:', name, 'New value:', value);

    // Gérer spécialement le champ date
    if (name === 'date') {
      try {
        const newDate = new Date(value);
        if (!isNaN(newDate.getTime())) {
          setEditedWedding(prev => ({
            ...prev,
            date: newDate
          }));
        }
      } catch (error) {
        console.error('Invalid date format:', error);
      }
      return;
    }

    // Gérer le champ time
    if (name === 'time') {
      try {
        const [hours, minutes] = value.split(':');
        const currentDate = new Date(editedWedding.date);
        currentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        
        if (!isNaN(currentDate.getTime())) {
          setEditedWedding(prev => ({
            ...prev,
            date: currentDate
          }));
        }
      } catch (error) {
        console.error('Invalid time format:', error);
      }
      return;
    }

    // Gérer le champ guestCount
    if (name === 'guestCount') {
      const numberValue = parseInt(value, 10);
      if (!isNaN(numberValue) && numberValue >= 0) {
        setEditedWedding(prev => ({
          ...prev,
          guestCount: numberValue
        }));
      }
      return;
    }

    // Pour les autres champs
    setEditedWedding(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      console.log('Updated wedding state:', updated);
      return updated;
    });
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
                          value={editedWedding.date ? format(new Date(editedWedding.date), 'yyyy-MM-dd') : ''}
                          onChange={handleChange}
                          className="w-full bg-gray-600/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        />
                        <input
                          type="time"
                          name="time"
                          value={editedWedding.date ? format(new Date(editedWedding.date), 'HH:mm') : ''}
                          onChange={handleChange}
                          className="w-full bg-gray-600/50 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <div className="text-white">
                        {format(new Date(wedding.date), 'PPP')}
                        <div className="text-sm text-gray-400">
                          {format(new Date(wedding.date), 'HH:mm')}
                        </div>
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
                        name="oneWeek"
                        checked={editedWedding.notifications?.oneWeek}
                        onChange={(e) => setEditedWedding(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            oneWeek: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                      <span>1 semaine avant</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        name="threeDays"
                        checked={editedWedding.notifications?.threeDays}
                        onChange={(e) => setEditedWedding(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            threeDays: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        disabled={!isEditing}
                      />
                      <span>3 jours avant</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        name="oneDay"
                        checked={editedWedding.notifications?.oneDay}
                        onChange={(e) => setEditedWedding(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            oneDay: e.target.checked
                          }
                        }))}
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