const Booking = require('../models/booking');

// Campay webhook handler
exports.campayWebhook = async (req, res) => {
  try {
    // Campay will POST payment status updates here
    const { reference, status } = req.body;
    // status should be 'SUCCESSFUL' or similar when payment is confirmed
    if (status === 'SUCCESSFUL') {
      // Find the booking by transactionId/reference
      const booking = await Booking.findOne({ 'paymentDetails.transactionId': reference });
      if (booking) {
        booking.paymentStatus = 'paid';
        await booking.save();
        return res.status(200).json({ message: 'Payment status updated to paid.' });
      }
      return res.status(404).json({ error: 'Booking not found for this transaction.' });
    }
    // Optionally handle other statuses (FAILED, etc.)
    res.status(200).json({ message: 'Webhook received.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
