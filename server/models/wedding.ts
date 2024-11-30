import mongoose, { Document, Schema } from 'mongoose';

export interface IWedding extends Document {
  date: Date;
  groomName: string;
  brideName: string;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const weddingSchema = new Schema<IWedding>({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  groomName: {
    type: String,
    required: [true, 'Groom name is required'],
    trim: true,
  },
  brideName: {
    type: String,
    required: [true, 'Bride name is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Add indexes for common queries
weddingSchema.index({ date: 1 });
weddingSchema.index({ status: 1 });
weddingSchema.index({ groomName: 'text', brideName: 'text' });

// Pre-save middleware to ensure date is a valid Date object
weddingSchema.pre('save', function(next) {
  if (this.isModified('date')) {
    const date = new Date(this.date);
    if (isNaN(date.getTime())) {
      next(new Error('Invalid date format'));
    } else {
      this.date = date;
      next();
    }
  } else {
    next();
  }
});

// Virtual for full names
weddingSchema.virtual('fullNames').get(function() {
  return `${this.groomName} & ${this.brideName}`;
});

export const Wedding = mongoose.model<IWedding>('Wedding', weddingSchema);

export default Wedding;
