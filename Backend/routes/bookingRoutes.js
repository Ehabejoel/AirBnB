const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Guest routes
router.post('/', auth, bookingController.createBooking);
router.get('/my-bookings', auth, bookingController.getMyBookings);
router.patch('/:bookingId/cancel', auth, bookingController.cancelBooking);

// Host routes
router.get('/host-bookings', auth, bookingController.getHostBookings);
router.patch('/:bookingId/status', auth, bookingController.updateBookingStatus);

// Common routes
router.get('/:bookingId', auth, bookingController.getBooking);
router.get('/property/:propertyId/availability', bookingController.checkAvailability);

module.exports = router;
