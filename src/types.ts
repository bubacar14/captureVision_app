export interface Wedding {
  _id?: string;
  id?: string;
  clientName: string;
  partnerName?: string;
  date: Date;
  venue: string;
  phoneNumber: string;
  notes?: string;
  notifications: {
    oneWeek: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
  timeline?: {
    time: string;
    event: string;
    _id?: string;
  }[];
  services?: string[];
  guestCount?: number;
  contactEmail?: string;
}

export type WeddingInput = Omit<Wedding, '_id' | 'date'> & {
  date: string; 
  guestCount?: number;
};

export type WeddingFormData = {
  clientName: string;
  date: string;
  venue: string;
  phoneNumber: string;
  notes: string;
  guestCount?: number;
  notifications: {
    oneWeek: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
};

export type WeddingData = Omit<Wedding, '_id'>;

export type { Wedding as Event };

export type View = 'dashboard' | 'calendar' | 'details' | 'settings' | 'newWedding' | 'notifications';