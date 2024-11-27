import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Le nom des mariés est requis']
  },
  partnersName: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'La date est requise']
  },
  venue: {
    type: String,
    required: [true, 'Le lieu est requis']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },
  guestCount: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  notifications: {
    oneWeek: {
      type: Boolean,
      default: true
    },
    threeDays: {
      type: Boolean,
      default: true
    },
    oneDay: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Wedding', weddingSchema);
