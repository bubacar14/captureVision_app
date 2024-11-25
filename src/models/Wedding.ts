import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  guestCount: {
    type: Number,
    required: true,
    min: 0,
  },
  notifications: {
    oneWeek: {
      type: Boolean,
      default: false,
    },
    threeDays: {
      type: Boolean,
      default: false,
    },
    oneDay: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.model('Wedding', weddingSchema);
