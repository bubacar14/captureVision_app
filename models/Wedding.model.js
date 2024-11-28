import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  partnersName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  guestCount: {
    type: Number,
    min: 1,
    max: 1000,
    default: 1
  },
  budget: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  ceremonyType: {
    type: String,
    enum: ['civil', 'religious', 'both'],
    default: 'civil'
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

export const Wedding = mongoose.model('Wedding', weddingSchema);
