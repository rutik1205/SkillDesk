const express = require('express');
const router = express.Router();
const { createReview, getServiceReviews, getFreelancerReviews } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, createReview);
router.get('/service/:serviceId', getServiceReviews);
router.get('/freelancer/:freelancerId', getFreelancerReviews);

module.exports = router;
