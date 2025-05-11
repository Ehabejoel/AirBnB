const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image file'));
    }
  }
});

router.post('/signup', authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.patch('/profile', auth, authController.updateProfile);
router.patch('/profile/photo', auth, upload.single('photo'), authController.updateProfilePhoto);

// Route to become a host
router.post('/become-host', auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.roles.includes('host')) {
      user.roles.push('host');
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;