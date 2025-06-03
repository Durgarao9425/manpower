const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderImagesController');

// Get all slider images
router.get('/', sliderController.getSliderImages);

// Get active sliders only
router.get('/active', sliderController.getActiveSliders);

// Get single slider image
router.get('/:id', sliderController.getSliderImageById);

// Add new slider image
router.post('/', sliderController.addSliderImage);

// Update slider image
router.put('/:id', sliderController.updateSliderImage);

// Toggle slider status
router.patch('/:id/status', sliderController.toggleSliderStatus);

// Delete slider image
router.delete('/:id', sliderController.deleteSliderImage);

module.exports = router;