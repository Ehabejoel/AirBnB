const Booking = require('../models/booking');
const Property = require('../models/property');
const User = require('../models/user');
const streamChatService = require('../services/streamChatService');
const campayService = require('../services/campayService');
const payoutService = require('../services/payoutService');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      paymentMethod,
      paymentDetails,
      specialRequests
    } = req.body;

    // Get property details
    const property = await Property.findById(propertyId).populate('owner');
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if property is available for the requested dates
    const existingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkInDate) },
          checkOutDate: { $gt: new Date(checkInDate) }
        },
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkOutDate) }
        },
        {
          checkInDate: { $gte: new Date(checkInDate) },
          checkOutDate: { $lte: new Date(checkOutDate) }
        }
      ]
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ error: 'Property is not available for the selected dates' });
    }

    // Check guest capacity
    if (numberOfGuests > property.guestCapacity) {
      return res.status(400).json({ error: `Property can accommodate maximum ${property.guestCapacity} guests` });
    }

    // Calculate pricing
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price;
    const serviceFee = Math.round(totalPrice * 0.1); // 10% service fee
    const taxes = Math.round(totalPrice * 0.05); // 5% taxes
    const totalAmount = totalPrice + serviceFee + taxes;

    // Initiate payment with Campay
    let paymentResult = null;
    try {
      console.log('[Campay] Initiating payment:', {
        amount: totalAmount,
        phone: paymentDetails.phoneNumber,
        description: `Booking payment for property ${property.title}`
      });
      paymentResult = await campayService.initiatePayment({
        amount: totalAmount,
        phone: paymentDetails.phoneNumber.startsWith('237') ? paymentDetails.phoneNumber : `237${paymentDetails.phoneNumber}`,
        description: `Booking payment for property ${property.title}`
      });
      console.log('[Campay] Payment result:', paymentResult);
    } catch (payErr) {
      console.error('[Campay] Payment initiation failed:', payErr?.response?.data || payErr.message || payErr);
      return res.status(400).json({ error: 'Payment initiation failed', details: payErr?.response?.data || payErr.message });
    }

    // Create booking
    const booking = new Booking({
      property: propertyId,
      guest: req.user.id,
      host: property.owner._id,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      serviceFee,
      taxes,
      paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        transactionId: paymentResult.reference || paymentResult.transaction_id || ''
      },
      specialRequests,
      paymentStatus: 'paid'
    });

    await booking.save();

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location images')
      .populate('guest', 'firstName lastName email')
      .populate('host', 'firstName lastName email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user's bookings (for guests)
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { guest: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('property', 'title location images owner')
      .populate('host', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get bookings for host's properties
exports.getHostBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { host: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('property', 'title location images')
      .populate('guest', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update booking status (for hosts)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      host: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['confirmed', 'rejected'],
      'confirmed': ['cancelled', 'completed'],
      'rejected': [],
      'cancelled': [],
      'completed': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ error: `Cannot change status from ${booking.status} to ${status}` });
    }    booking.status = status;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    await booking.save();

    // If booking is confirmed, create a chat channel
    if (status === 'confirmed') {
      try {
        const populatedBookingForChat = await Booking.findById(booking._id)
          .populate('property', 'title')
          .populate('guest', 'firstName lastName email profilePhoto')
          .populate('host', 'firstName lastName email profilePhoto');

        // Create users in Stream Chat if they don't exist
        await streamChatService.createUser(populatedBookingForChat.host._id.toString(), {
          firstName: populatedBookingForChat.host.firstName,
          lastName: populatedBookingForChat.host.lastName,
          profilePhoto: populatedBookingForChat.host.profilePhoto,
          email: populatedBookingForChat.host.email
        });

        await streamChatService.createUser(populatedBookingForChat.guest._id.toString(), {
          firstName: populatedBookingForChat.guest.firstName,
          lastName: populatedBookingForChat.guest.lastName,
          profilePhoto: populatedBookingForChat.guest.profilePhoto,
          email: populatedBookingForChat.guest.email
        });

        // Create the chat channel
        await streamChatService.createBookingChannel(
          booking._id.toString(),
          populatedBookingForChat.host._id.toString(),
          populatedBookingForChat.guest._id.toString(),
          populatedBookingForChat.property.title
        );

        console.log(`Chat channel created for booking ${booking._id}`);
      } catch (chatError) {
        console.error('Error creating chat channel:', chatError);
        // Don't fail the booking confirmation if chat creation fails
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location images')
      .populate('guest', 'firstName lastName email profilePhoto')
      .populate('host', 'firstName lastName email profilePhoto');

    res.json(populatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cancel booking (for guests)
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      guest: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    // Check cancellation policy (simplified - 24 hours before check-in)
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const hoursBeforeCheckIn = (checkIn - now) / (1000 * 60 * 60);

    if (hoursBeforeCheckIn < 24) {
      return res.status(400).json({ error: 'Booking can only be cancelled 24 hours before check-in' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location images')
      .populate('guest', 'firstName lastName email profilePhoto')
      .populate('host', 'firstName lastName email profilePhoto');

    res.json(populatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get booking details
exports.getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [
        { guest: req.user.id },
        { host: req.user.id }
      ]
    })
      .populate('property', 'title location images amenities')
      .populate('guest', 'firstName lastName email profilePhoto')
      .populate('host', 'firstName lastName email profilePhoto');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get property availability
exports.checkAvailability = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'Check-in and check-out dates are required' });
    }

    const existingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkInDate) },
          checkOutDate: { $gt: new Date(checkInDate) }
        },
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkOutDate) }
        },
        {
          checkInDate: { $gte: new Date(checkInDate) },
          checkOutDate: { $lte: new Date(checkOutDate) }
        }
      ]
    });

    const isAvailable = existingBookings.length === 0;

    res.json({
      available: isAvailable,
      conflictingBookings: existingBookings.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Guest confirms check-in
exports.confirmCheckIn = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, guest: req.user.id });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking is not confirmed' });
    }
    booking.status = 'completed';
    await booking.save();
    // Schedule payout to host after 5 minutes
    payoutService.scheduleHostPayout(bookingId);
    res.json({ message: 'Check-in confirmed. Host payout will be processed in 5 minutes.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
