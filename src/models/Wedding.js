import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true
  },
  partnersName: {
    type: String,
    required: [true, 'Le nom du partenaire est requis'],
    trim: true
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
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{8,}$/.test(v);
      },
      message: 'Format de numéro de téléphone invalide'
    }
  },
  guestCount: {
    type: Number,
    required: [true, 'Le nombre d\'invités est requis'],
    min: [1, 'Le nombre d\'invités doit être supérieur à 0'],
    validate: {
      validator: Number.isInteger,
      message: 'Le nombre d\'invités doit être un nombre entier'
    }
  },
  budget: {
    type: Number,
    required: [true, 'Le budget est requis'],
    min: [0, 'Le budget ne peut pas être négatif']
  },
  ceremonyType: {
    type: String,
    required: [true, 'Le type de cérémonie est requis'],
    enum: {
      values: ['civil', 'religieux', 'traditionnel', 'autre'],
      message: 'Type de cérémonie non valide'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['planifié', 'en_cours', 'terminé', 'annulé'],
      message: 'Statut non valide'
    },
    default: 'planifié'
  },
  notes: {
    type: String,
    trim: true
  },
  services: [{
    name: {
      type: String,
      required: [true, 'Le nom du service est requis']
    },
    provider: String,
    cost: {
      type: Number,
      min: [0, 'Le coût ne peut pas être négatif']
    },
    status: {
      type: String,
      enum: ['à_faire', 'en_cours', 'terminé'],
      default: 'à_faire'
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Middleware pour valider la date avant la sauvegarde
weddingSchema.pre('save', function(next) {
  if (this.date && this.date < new Date()) {
    next(new Error('La date du mariage ne peut pas être dans le passé'));
  }
  next();
});

// Méthode pour calculer le budget restant
weddingSchema.methods.calculateRemainingBudget = function() {
  const spentBudget = this.services.reduce((total, service) => total + (service.cost || 0), 0);
  return this.budget - spentBudget;
};

const Wedding = mongoose.model('Wedding', weddingSchema);

export default Wedding;
