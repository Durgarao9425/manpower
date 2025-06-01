const express = require('express');
const router = express.Router();
const sliderImagesController = require('../controllers/sliderImagesController');

// Routes for slider_images CRUD operations
router.get('/', sliderImagesController.getSliderImages);
router.post('/', sliderImagesController.addSliderImage);
router.put('/:id', sliderImagesController.updateSliderImage);
router.delete('/:id', sliderImagesController.deleteSliderImage);

module.exports = router;
