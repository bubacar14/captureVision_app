import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    minlength: [2, 'Client name must be at least 2 characters long'],
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  partnersName: {
    type: String,
    required: [true, 'Partner name is required'],
    trim: true,
    minlength: [2, 'Partner name must be at least 2 characters long'],
    maxlength: [100, 'Partner name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Wedding date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Wedding date must be in the future'
    },
    index: true
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    minlength: [2, 'Venue must be at least 2 characters long'],
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  ceremonyType: {
    type: String,
    required: [true, 'Ceremony type is required'],
    enum: ['civil', 'religious', 'both'],
    default: 'civil'
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[\d\s+()-]+$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guest count must be at least 1'],
    max: [1000, 'Guest count cannot exceed 1000']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  services: {
    catering: {
      type: Boolean,
      default: false
    },
    photography: {
      type: Boolean,
      default: false
    },
    music: {
      type: Boolean,
      default: false
    },
    decoration: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    oneWeek: {
      type: Boolean,
      default: false
    },
    threeDays: {
      type: Boolean,
      default: false
    },
    oneDay: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
weddingSchema.index({ clientName: 'text', partnersName: 'text', venue: 'text' });
weddingSchema.index({ date: 1, status: 1 });

// Pre-save middleware
weddingSchema.pre('save', function(next) {
  if (this.isModified('date')) {
    this.updatedAt = new Date();
  }
  next();
});

const Wedding = mongoose.model('Wedding', weddingSchema);

export default Wedding;
