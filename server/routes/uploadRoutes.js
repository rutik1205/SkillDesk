const express = require('express');
const router = express.Router();
const { getAuthParams } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.get('/auth', auth, getAuthParams);

module.exports = router;
