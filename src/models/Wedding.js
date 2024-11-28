import mongoose, { Schema, model } from 'mongoose';

const weddingSchema = new Schema({
  clientName: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  date: {
    type: Date,
    required: [true, 'La date du mariage est requise'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Date invalide'
    }
  },
  venue: {
    type: String,
    required: [true, 'Le lieu du mariage est requis'],
    trim: true,
    minlength: [2, 'Le lieu doit contenir au moins 2 caractères']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^(\+33|0)[1-9](\d{2}){4}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Format de numéro de téléphone invalide'
    }
  },
  notes: {
    type: String,
    trim: true
  },
  notifications: {
    type: {
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
    },
    default: {
      oneWeek: true,
      threeDays: true,
      oneDay: true
    }
  },
  timeline: [{
    time: String,
    event: String
  }],
  services: [String]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  strict: 'throw'
});

// Index pour améliorer les performances des recherches
weddingSchema.index({ clientName: 1 });
weddingSchema.index({ date: 1 });

const Wedding = model('Wedding', weddingSchema);

export default Wedding;
