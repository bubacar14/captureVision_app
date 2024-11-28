export interface Wedding {
  _id: string;
  clientName: string;
  partnersName: string;
  date: Date;
  venue: string;
  phoneNumber: string;
  guestCount: number;
  budget: number;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  ceremonyType: string;
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
}

export type WeddingInput = Omit<Wedding, '_id' | 'date'> & {
  date: string; 
};

export type WeddingFormData = {
  clientName: string;
  partnersName: string;
  date: string;
  venue: string;
  phoneNumber: string;
  guestCount: number;
  budget: number;
  notes: string;
  ceremonyType: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  notifications: {
    oneWeek: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
};

export type WeddingData = Omit<Wedding, '_id'>;

export type { Wedding as Event };

export type View = 'dashboard' | 'calendar' | 'details' | 'notifications' | 'settings' | 'newWedding';