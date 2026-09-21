const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, data: { categories } });
});

module.exports = { getCategories };
