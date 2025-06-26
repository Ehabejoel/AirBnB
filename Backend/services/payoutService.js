// Handles payout to host after check-in confirmation and 5 minutes delay
const Booking = require('../models/booking');
const Property = require('../models/property');
const campayService = require('./campayService');

async function scheduleHostPayout(bookingId) {
  // Wait 5 minutes, then send payout
  setTimeout(async () => {
    try {
      const booking = await Booking.findById(bookingId).populate('property');
      if (!booking || booking.payoutStatus !== 'pending' || booking.status !== 'confirmed') return;
      const hostMobile = booking.property.hostMobileNumber;
      const amount = booking.totalAmount;
      const description = `Payout for booking ${bookingId}`;
      // Mark payout as processing
      booking.payoutStatus = 'processing';
      await booking.save();
      // Send payout
      const payoutResult = await campayService.sendPayout({ amount, phone: hostMobile, description });
      booking.payoutStatus = 'paid';
      booking.payoutTransactionId = payoutResult.reference || payoutResult.transaction_id || '';
      await booking.save();
    } catch (err) {
      // Mark payout as failed
      await Booking.findByIdAndUpdate(bookingId, { payoutStatus: 'failed' });
    }
  }, 5 * 60 * 1000); // 5 minutes
}

module.exports = { scheduleHostPayout };
