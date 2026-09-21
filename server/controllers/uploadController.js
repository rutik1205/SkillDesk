const asyncHandler = require('../utils/asyncHandler');
const imagekit = require('../config/imagekit');

const getAuthParams = asyncHandler(async (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.json({ success: true, data: result });
});

module.exports = { getAuthParams };
