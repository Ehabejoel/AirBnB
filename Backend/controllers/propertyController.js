const Property = require('../models/property');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/properties');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
}).array('images', 10); // Allow up to 10 images

exports.createProperty = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const images = req.files ? req.files.map(file => `/uploads/properties/${file.filename}`) : [];
        const propertyData = {
        ...req.body,
        owner: req.user.id,
        images,
        location: JSON.parse(req.body.location),
        amenities: JSON.parse(req.body.amenities),
        houseRules: JSON.parse(req.body.houseRules),
        price: Number(req.body.price),
        bedrooms: Number(req.body.bedrooms),
        bathrooms: Number(req.body.bathrooms),
        guestCapacity: Number(req.body.guestCapacity),
        availability: {
          startDate: new Date(req.body.availableFrom),
          endDate: new Date(req.body.availableTo)
        }
      };

      const property = new Property(propertyData);
      await property.save();

      res.status(201).json(property);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'firstName lastName profilePhoto');
    res.json(properties);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName profilePhoto');
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .populate('owner', 'firstName lastName profilePhoto');
    res.json(properties);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found or unauthorized' });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const updates = { ...req.body };
      
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/properties/${file.filename}`);
        updates.images = [...property.images, ...newImages];
      }

      if (updates.amenities) {
        updates.amenities = JSON.parse(updates.amenities);
      }

      if (updates.houseRules) {
        updates.houseRules = JSON.parse(updates.houseRules);
      }

      Object.assign(property, updates);
      await property.save();
      res.json(property);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found or unauthorized' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Update user's wishlist
    await User.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: propertyId }
    });

    res.json({ message: 'Property added to wishlist' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: propertyId }
    });

    res.json({ message: 'Property removed from wishlist' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};