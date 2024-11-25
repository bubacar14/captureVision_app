import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { Event } from '../types';
import { fr } from '../i18n/fr';
import classNames from 'classnames';
import { Calendar, Phone, FileText, Bell, AlertCircle } from 'react-feather';

interface NewEventFormProps {
  isOpen: boolean;
  onSubmit: (event: Omit<Event, 'id'>) => void;
  onCancel: () => void;
}

interface FormData {
  clientName: string;
  date: string;
  venue: string;
  phoneNumber: string;
  notes: string;
  guestCount: number;
  oneWeek: boolean;
  threeDays: boolean;
  oneDay: boolean;
}

interface FormErrors {
  clientName?: string;
  date?: string;
  venue?: string;
  phoneNumber?: string;
  guestCount?: string;
  notes?: string;
  general?: string;
}

const initialFormData: FormData = {
  clientName: '',
  date: '',
  venue: '',
  phoneNumber: '',
  notes: '',
  guestCount: 0,
  oneWeek: false,
  threeDays: false,
  oneDay: false
};

export default function NewEventForm({ isOpen, onSubmit, onCancel }: NewEventFormProps) {
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    date: '',
    venue: '',
    phoneNumber: '',
    notes: '',
    guestCount: 0,
    oneWeek: false,
    threeDays: false,
    oneDay: false
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setFormErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (!formData.clientName.trim()) {
      newErrors.clientName = fr.wedding.form.errors.clientName;
    }

    if (!formData.date) {
      newErrors.date = fr.wedding.form.errors.date;
    } else {
      const selectedDate = new Date(formData.date);
      if (isNaN(selectedDate.getTime()) || selectedDate < currentDate) {
        newErrors.date = fr.wedding.form.errors.pastDate;
      }
    }

    if (!formData.venue.trim()) {
      newErrors.venue = fr.wedding.form.errors.venue;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = fr.wedding.form.errors.phoneNumber;
    } else {
      const phoneRegex = /^(\+\d{1,3}\s?)?(\d{1,4}[-\s]?){1,4}\d{1,4}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = fr.wedding.form.errors.invalidPhone;
      }
    }

    if (formData.guestCount < 0) {
      newErrors.guestCount = fr.wedding.form.errors.guestCount;
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        // Prepare the data
        const weddingData = {
          clientName: formData.clientName.trim(),
          date: new Date(formData.date).toISOString(),
          venue: formData.venue.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          notes: formData.notes?.trim() || '',
          guestCount: Math.max(0, parseInt(formData.guestCount.toString()) || 0),
          notifications: {
            oneWeek: Boolean(formData.oneWeek),
            threeDays: Boolean(formData.threeDays),
            oneDay: Boolean(formData.oneDay)
          }
        };

        console.log('Submitting wedding data:', weddingData);
        await onSubmit(weddingData);
        // Le formulaire sera fermé par le parent après succès
      } catch (error) {
        console.error('Error submitting form:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        
        try {
          const errorData = JSON.parse(errorMessage);
          if (errorData.errors) {
            setFormErrors(errorData.errors);
          } else {
            setFormErrors({ general: errorData.message || errorMessage });
          }
        } catch {
          setFormErrors({ general: errorMessage });
        }
        
        // Afficher l'erreur en haut du formulaire
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      console.log('Form validation errors:', newErrors);
      setFormErrors(newErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const inputClassName = (fieldName: keyof FormErrors) => {
    return classNames(
      'w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl bg-transparent text-white border transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-[#00B09C]/20',
      {
        'border-[#232D36] focus:border-[#00B09C]/50': !formErrors[fieldName],
        'border-red-500 focus:border-red-500 focus:ring-red-500/20': formErrors[fieldName],
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={fr.wedding.form.mainInfo}>
      <form onSubmit={handleSubmit} className="space-y-8 px-6 py-4">
        {formErrors.general && (
          <div className="error-message bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {formErrors.general}
            </p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Section Principale */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#101D25]/80 to-[#101D25]/60 p-6 rounded-2xl border border-[#232D36]/50 backdrop-blur-sm space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[#00B09C]/10 rounded-xl">
                <Calendar className="h-6 w-6 text-[#00B09C]" />
              </div>
              <h2 className="text-[#00B09C] text-lg font-semibold">{fr.wedding.form.mainInfo}</h2>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <label htmlFor="clientName" className="absolute -top-2.5 left-3 px-2 bg-[#101D25] text-[#9FA2A7] text-sm transition-all duration-200 group-focus-within:text-[#00B09C]">
                  {fr.wedding.clientName}
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={`${inputClassName('clientName')} group-hover:border-[#00B09C]/30 group-focus-within:border-[#00B09C]`}
                  placeholder={fr.wedding.form.clientNamePlaceholder}
                />
                {formErrors.clientName && (
                  <p className="text-red-400 text-sm mt-2 ml-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.clientName}
                  </p>
                )}
              </div>

              <div className="relative group">
                <label htmlFor="date" className="absolute -top-2.5 left-3 px-2 bg-[#101D25] text-[#9FA2A7] text-sm transition-all duration-200 group-focus-within:text-[#00B09C]">
                  {fr.wedding.date}
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`${inputClassName('date')} group-hover:border-[#00B09C]/30 group-focus-within:border-[#00B09C]`}
                />
                {formErrors.date && (
                  <p className="text-red-400 text-sm mt-2 ml-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.date}
                  </p>
                )}
              </div>

              <div className="relative group">
                <label htmlFor="venue" className="absolute -top-2.5 left-3 px-2 bg-[#101D25] text-[#9FA2A7] text-sm transition-all duration-200 group-focus-within:text-[#00B09C]">
                  {fr.wedding.venue}
                </label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className={`${inputClassName('venue')} group-hover:border-[#00B09C]/30 group-focus-within:border-[#00B09C]`}
                  placeholder={fr.wedding.form.venuePlaceholder}
                />
                {formErrors.venue && (
                  <p className="text-red-400 text-sm mt-2 ml-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.venue}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div className="bg-gradient-to-br from-[#101D25]/80 to-[#101D25]/60 p-6 rounded-2xl border border-[#232D36]/50 backdrop-blur-sm space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[#00B09C]/10 rounded-xl">
                <Phone className="h-6 w-6 text-[#00B09C]" />
              </div>
              <h2 className="text-[#00B09C] text-lg font-semibold">{fr.wedding.form.contact}</h2>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <label htmlFor="phoneNumber" className="absolute -top-2.5 left-3 px-2 bg-[#101D25] text-[#9FA2A7] text-sm transition-all duration-200 group-focus-within:text-[#00B09C]">
                  {fr.wedding.phoneNumber}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`${inputClassName('phoneNumber')} group-hover:border-[#00B09C]/30 group-focus-within:border-[#00B09C]`}
                  placeholder={fr.wedding.form.phonePlaceholder}
                />
                {formErrors.phoneNumber && (
                  <p className="text-red-400 text-sm mt-2 ml-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="relative group">
                <label htmlFor="guestCount" className="absolute -top-2.5 left-3 px-2 bg-[#101D25] text-[#9FA2A7] text-sm transition-all duration-200 group-focus-within:text-[#00B09C]">
                  {fr.wedding.guestCount}
                </label>
                <input
                  type="number"
                  id="guestCount"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  min="0"
                  className={`${inputClassName('guestCount')} group-hover:border-[#00B09C]/30 group-focus-within:border-[#00B09C]`}
                />
                {formErrors.guestCount && (
                  <p className="text-red-400 text-sm mt-2 ml-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.guestCount}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section Notes */}
          <div className="bg-gradient-to-br from-[#101D25]/80 to-[#101D25]/60 p-6 rounded-2xl border border-[#232D36]/50 backdrop-blur-sm space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[#00B09C]/10 rounded-xl">
                <FileText className="h-6 w-6 text-[#00B09C]" />
              </div>
              <h2 className="text-[#00B09C] text-lg font-semibold">{fr.wedding.form.notes}</h2>
            </div>

            <div className="relative group">
              <label htmlFor="notes" className="absolute -top-2.5 left-3 px-2 bg-[#101D25] text-[#9FA2A7] text-sm transition-all duration-200 group-focus-within:text-[#00B09C]">
                {fr.wedding.notes}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={(formData.notes as string)}
                onChange={handleChange}
                rows={4}
                className={`${inputClassName('notes')} resize-none group-hover:border-[#00B09C]/30 group-focus-within:border-[#00B09C]`}
                placeholder={fr.wedding.form.notesPlaceholder}
              />
            </div>
          </div>

          {/* Section Notifications */}
          <div className="bg-gradient-to-br from-[#101D25]/80 to-[#101D25]/60 p-6 rounded-2xl border border-[#232D36]/50 backdrop-blur-sm space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[#00B09C]/10 rounded-xl">
                <Bell className="h-6 w-6 text-[#00B09C]" />
              </div>
              <h2 className="text-[#00B09C] text-lg font-semibold">{fr.wedding.form.notifications}</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-3 rounded-xl border border-[#232D36] hover:border-[#00B09C]/30 transition-colors cursor-pointer group">
                <input
                  type="checkbox"
                  name="oneWeek"
                  checked={formData.oneWeek}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-[#00B09C] rounded border-[#232D36] focus:ring-[#00B09C] focus:ring-offset-0 bg-transparent"
                />
                <span className="text-[#9FA2A7] group-hover:text-white transition-colors">{fr.wedding.form.oneWeek}</span>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-[#232D36] hover:border-[#00B09C]/30 transition-colors cursor-pointer group">
                <input
                  type="checkbox"
                  name="threeDays"
                  checked={formData.threeDays}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-[#00B09C] rounded border-[#232D36] focus:ring-[#00B09C] focus:ring-offset-0 bg-transparent"
                />
                <span className="text-[#9FA2A7] group-hover:text-white transition-colors">{fr.wedding.form.threeDays}</span>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-[#232D36] hover:border-[#00B09C]/30 transition-colors cursor-pointer group">
                <input
                  type="checkbox"
                  name="oneDay"
                  checked={formData.oneDay}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-[#00B09C] rounded border-[#232D36] focus:ring-[#00B09C] focus:ring-offset-0 bg-transparent"
                />
                <span className="text-[#9FA2A7] group-hover:text-white transition-colors">{fr.wedding.form.oneDay}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-[#232D36] text-[#9FA2A7] hover:bg-[#232D36]/50 hover:text-white transition-all duration-300"
          >
            {fr.common.cancel}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#00B09C] text-white hover:bg-[#00B09C]/90 transition-all duration-300 shadow-lg shadow-[#00B09C]/20"
          >
            {fr.common.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}