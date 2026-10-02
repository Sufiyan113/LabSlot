/**
 * Authentication Controller
 * Handles register, login, and get current user.
 */
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user (students only via public endpoint)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, studentId, department, phone, role } = req.body;

  // Basic presence checks (detailed validation can be added with express-validator later)
  if (!name || !email || !password) {
    return next(new AppError('Name, email and password are required.', 400));
  }

  // Public registration is restricted to students only.
  // Admins and assistants must be created by an existing admin.
  const allowedRole = 'student';
  if (role && role !== 'student') {
    return next(
      new AppError(
        'You can only register as a student. Contact admin for other roles.',
        403
      )
    );
  }

  // Check for existing email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('Email is already registered.', 409));
  }

  // Check for existing studentId if provided
  if (studentId) {
    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      return next(new AppError('Student ID is already registered.', 409));
    }
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    role: allowedRole,
    studentId: studentId || undefined,
    department: department || undefined,
    phone: phone || undefined,
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  sendSuccess(res, 201, 'Registration successful', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      phone: user.phone,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // Explicitly select password because it has select: false
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact admin.', 401));
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const token = generateToken(user._id, user.role);

  sendSuccess(res, 200, 'Login successful', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      phone: user.phone,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached by the protect middleware
  sendSuccess(res, 200, 'User profile retrieved', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      studentId: req.user.studentId,
      department: req.user.department,
      phone: req.user.phone,
      profileImage: req.user.profileImage,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    },
  });
});

/**
 * @desc    Update own profile (name, phone, department, profileImage)
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateMe = asyncHandler(async (req, res, next) => {
  const allowedFields = ['name', 'phone', 'department', 'profileImage'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Prevent role / email / password changes through this endpoint
  if (req.body.role || req.body.email || req.body.password) {
    return next(
      new AppError(
        'This endpoint cannot change email, password or role. Use dedicated endpoints.',
        400
      )
    );
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Profile updated successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      phone: user.phone,
      profileImage: user.profileImage,
      updatedAt: user.updatedAt,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
};
