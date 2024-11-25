import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value: Date) {
        return !isNaN(value.getTime());
      },
      message: 'Invalid date format'
    }
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  guestCount: {
    type: Number,
    required: true,
    min: [0, 'Guest count cannot be negative'],
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
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Wedding', weddingSchema);
