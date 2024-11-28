export interface Wedding {
  _id?: string;
  clientName: string;
  partnersName?: string;
  date: Date;
  venue: string;
  guestCount: number;
  budget?: number;
  phoneNumber: string;
  email?: string;
  notes?: string;
  status?: string;
  services?: string[];
  timeline?: {
    time: string;
    event: string;
    _id?: string;
  }[];
}

export interface Wedding {
  id: string;
  clientName: string;
  partnersName?: string;
  date: string;
  venue: string;
  phoneNumber: string;
  guestCount: number;
  budget: number;
  notes?: string;
  ceremonyType: 'civil' | 'religious' | 'both';
  notifications: {
    oneWeek: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
}

export type WeddingData = Omit<Wedding, 'id'>;

export type { Wedding as Event };

export type View = 'dashboard' | 'calendar' | 'details' | 'notifications' | 'settings' | 'newWedding';