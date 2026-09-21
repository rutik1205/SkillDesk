const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }
  return user;
};

const updateProfile = async (userId, updateData) => {
  // Don't allow role or email changes through profile update
  delete updateData.role;
  delete updateData.email;
  delete updateData.password;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found.');
  }
  return user;
};

const getFreelancers = async (query = {}) => {
  const { search, skills, page = 1, limit = 12, sort = '-avgRating' } = query;
  const filter = { role: 'freelancer' };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { professionalTitle: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
  }

  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim());
    filter.skills = { $in: skillList };
  }

  const skip = (page - 1) * limit;
  const [freelancers, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return {
    freelancers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = { getUserById, updateProfile, getFreelancers };
