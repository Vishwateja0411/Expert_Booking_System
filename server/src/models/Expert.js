import mongoose from 'mongoose';

const slotGroupSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    times: {
      type: [String],
      required: true,
      validate: {
        validator: (times) => times.length > 0,
        message: 'At least one time slot is required.'
      }
    }
  },
  { _id: false }
);

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    bio: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    availableSlots: { type: [slotGroupSchema], default: [] }
  },
  { timestamps: true }
);

expertSchema.index({ name: 'text', category: 1 });

export const Expert = mongoose.model('Expert', expertSchema);
