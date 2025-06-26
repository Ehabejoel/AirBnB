const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: 20
  },
  location: {
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'condo', 'cabin', 'tiny_house', 'boat', 'camper'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1
  },
  guestCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: {
    wifi: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    washer: { type: Boolean, default: false },
    dryer: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    workspace: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    breakfast: { type: Boolean, default: false },
    evCharging: { type: Boolean, default: false },
    hotTub: { type: Boolean, default: false },
    bbqGrill: { type: Boolean, default: false },
    fireplace: { type: Boolean, default: false },
    patio: { type: Boolean, default: false },
    security: { type: Boolean, default: false }
  },
  hostMobileNumber: {
    type: String,
    required: [true, 'Host mobile money/orange number is required']
  },
  houseRules: [String],
  images: [String],
  availability: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);