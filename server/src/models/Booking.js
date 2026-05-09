import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true
    },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    timeSlot: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  { unique: true, name: 'unique_expert_date_time_slot' }
);
bookingSchema.index({ email: 1, createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
