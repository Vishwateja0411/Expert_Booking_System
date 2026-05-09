import { Router } from 'express';
import {
  createBooking,
  getBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';

const router = Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.patch('/:id/status', updateBookingStatus);

export default router;
