const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  taxes: {
    type: Number,
    default: 0
  },  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['MTN', 'Orange', 'card'],
    required: true
  },
  paymentDetails: {
    phoneNumber: String,
    transactionId: String
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  payoutTransactionId: {
    type: String
  }
}, {
  timestamps: true
});

// Validate that check-out date is after check-in date
bookingSchema.pre('save', function(next) {
  if (this.checkOutDate <= this.checkInDate) {
    next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

// Calculate total amount including fees and taxes
bookingSchema.pre('save', function(next) {
  // Ensure serviceFee and taxes have default values if not set
  if (this.serviceFee === undefined) this.serviceFee = 0;
  if (this.taxes === undefined) this.taxes = 0;
  
  // Calculate total amount
  this.totalAmount = this.totalPrice + this.serviceFee + this.taxes;
  next();
});

// Index for efficient queries
bookingSchema.index({ property: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
