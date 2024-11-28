import mongoose, { Schema, model } from 'mongoose';

const weddingSchema = new Schema({
  clientName: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  partnersName: {
    type: String,
    required: [true, 'Le nom du partenaire est requis'],
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
      message: '{VALUE} n\'est pas un type de cérémonie valide'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['planifié', 'en_cours', 'terminé', 'annulé'],
      message: '{VALUE} n\'est pas un statut valide'
    },
    default: 'planifié'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères']
  },
  services: [{
    name: {
      type: String,
      required: [true, 'Le nom du service est requis'],
      trim: true
    },
    provider: {
      type: String,
      trim: true
    },
    cost: {
      type: Number,
      min: [0, 'Le coût ne peut pas être négatif']
    },
    status: {
      type: String,
      enum: {
        values: ['à_faire', 'en_cours', 'terminé'],
        message: '{VALUE} n\'est pas un statut de service valide'
      },
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
  },
  strict: 'throw'
});

// Middleware pour valider la date avant la sauvegarde
weddingSchema.pre('save', function(next) {
  try {
    if (this.isModified('date')) {
      const weddingDate = new Date(this.date);
      if (isNaN(weddingDate.getTime())) {
        throw new Error('Date de mariage invalide');
      }
      if (weddingDate < new Date()) {
        throw new Error('La date du mariage ne peut pas être dans le passé');
      }
    }

    if (this.isModified('services')) {
      const totalCost = this.services.reduce((sum, service) => sum + (service.cost || 0), 0);
      if (totalCost > this.budget) {
        throw new Error('Le coût total des services dépasse le budget');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour calculer le budget restant
weddingSchema.methods.calculateRemainingBudget = function() {
  const spentBudget = this.services.reduce((total, service) => total + (service.cost || 0), 0);
  return this.budget - spentBudget;
};

// Index pour améliorer les performances des recherches
weddingSchema.index({ clientName: 1, partnersName: 1 });
weddingSchema.index({ date: 1 });
weddingSchema.index({ status: 1 });

const Wedding = model('Wedding', weddingSchema);

export default Wedding;
