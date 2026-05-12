import mongoose from 'mongoose';
import { z } from 'zod';
import { Expert } from '../models/Expert.js';
import { Booking } from '../models/Booking.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildRollingAvailableSlots } from '../utils/slotAvailability.js';

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(6),
  search: z.string().trim().optional().default(''),
  category: z.string().trim().optional().default('')
});

export const getExperts = asyncHandler(async (req, res) => {
  const { page, limit, search, category } = listQuerySchema.parse(req.query);
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  const [experts, total, categories] = await Promise.all([
    Expert.find(query)
      .select('name category experience rating bio price')
      .sort({ rating: -1, experience: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Expert.countDocuments(query),
    Expert.distinct('category')
  ]);

  res.json({
    data: experts,
    categories: categories.sort(),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  });
});

export const getExpertById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid expert id.' });
  }

  const expert = await Expert.findById(id).lean();
  if (!expert) {
    return res.status(404).json({ message: 'Expert not found.' });
  }

  const bookings = await Booking.find({ expert: id }).select('date timeSlot').lean();
  const bookedSet = new Set(bookings.map((booking) => `${booking.date}|${booking.timeSlot}`));

  const availableSlots = buildRollingAvailableSlots(expert, bookedSet, 3);

  res.json({
    data: {
      ...expert,
      availableSlots
    }
  });
});
