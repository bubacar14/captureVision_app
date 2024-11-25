export interface Wedding {
  id?: string;
  clientName: string;
  date: Date;
  venue: string;
  phoneNumber: string;
  notes: string;
  guestCount: number;
  notifications: {
    oneWeek: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
}

export type { Wedding as Event };

export type View = 'dashboard' | 'calendar' | 'details' | 'notifications' | 'settings' | 'newWedding';