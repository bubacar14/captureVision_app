import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Le nom des mariés est requis']
  },
  partnersName: {
    type: String,
    required: [true, 'Le nom des partenaires est requis']
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
    required: [true, 'Le nombre d\'invités est requis'],
    min: [0, 'Le nombre d\'invités ne peut pas être négatif']
  },
  budget: {
    type: Number,
    required: [true, 'Le budget est requis'],
    min: [0, 'Le budget ne peut pas être négatif']
  },
  notes: {
    type: String,
    default: ''
  },
  ceremonyType: {
    type: String,
    required: [true, 'Le type de cérémonie est requis']
  },
  status: {
    type: String,
    enum: ['planned', 'confirmed', 'completed', 'cancelled'],
    default: 'planned',
    required: true
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

const Wedding = mongoose.model('Wedding', weddingSchema);

export default Wedding;
