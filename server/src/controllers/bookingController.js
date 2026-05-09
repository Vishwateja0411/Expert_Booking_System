import mongoose from 'mongoose';
import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { Expert } from '../models/Expert.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const bookingSchema = z.object({
  expertId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), 'Invalid expert id.'),
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().trim().email('Please enter a valid email address.').transform((value) => value.toLowerCase()),
  phone: z.string().trim().regex(phoneRegex, 'Please enter a valid phone number.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.'),
  timeSlot: z.string().trim().min(1, 'Time slot is required.'),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional().default('')
});

const statusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Completed'])
});

export const createBooking = asyncHandler(async (req, res) => {
  const payload = bookingSchema.parse(req.body);

  const expert = await Expert.findById(payload.expertId);
  if (!expert) {
    return res.status(404).json({ message: 'Expert not found.' });
  }

  const slotGroup = expert.availableSlots.find((group) => group.date === payload.date);
  const slotExists = slotGroup?.times.includes(payload.timeSlot);

  if (!slotExists) {
    return res.status(400).json({
      message: 'Selected slot is not available for this expert.'
    });
  }

  const booking = await Booking.create({
    expert: payload.expertId,
    customerName: payload.customerName,
    email: payload.email,
    phone: payload.phone,
    date: payload.date,
    timeSlot: payload.timeSlot,
    notes: payload.notes
  });

  const populatedBooking = await booking.populate('expert', 'name category');
  const io = req.app.get('io');

  io?.to(`expert:${payload.expertId}`).emit('slotBooked', {
    expertId: payload.expertId,
    date: payload.date,
    timeSlot: payload.timeSlot,
    bookingId: booking._id
  });

  res.status(201).json({
    message: 'Booking created successfully.',
    data: populatedBooking
  });
});

export const getBookings = asyncHandler(async (req, res) => {
  const email = z.string().trim().email().transform((value) => value.toLowerCase()).parse(req.query.email);

  const bookings = await Booking.find({ email })
    .populate('expert', 'name category')
    .sort({ createdAt: -1 });

  res.json({ data: bookings });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = statusSchema.parse(req.body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid booking id.' });
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('expert', 'name category');

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  req.app.get('io')?.emit('bookingStatusUpdated', {
    bookingId: booking._id,
    status: booking.status
  });

  res.json({
    message: 'Booking status updated.',
    data: booking
  });
});
