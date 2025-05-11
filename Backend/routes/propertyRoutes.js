const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');

router.post('/', auth, propertyController.createProperty);
router.get('/', propertyController.getProperties);
router.get('/my-properties', auth, propertyController.getMyProperties);
router.get('/:id', propertyController.getProperty);
router.patch('/:id', auth, propertyController.updateProperty);
router.delete('/:id', auth, propertyController.deleteProperty);

module.exports = router;