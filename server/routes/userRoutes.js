const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getFreelancers } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/freelancers', getFreelancers);
router.get('/:id', getUserProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
