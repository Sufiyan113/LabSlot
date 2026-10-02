const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    List users (admin)
 * @route   GET /api/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { studentId: new RegExp(search, 'i') },
    ];
  }
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
  sendSuccess(res, 200, 'Users retrieved', { users });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, 'User retrieved', { user });
});

/**
 * @desc    Create assistant or student (admin only — never public admin creation)
 * @route   POST /api/users
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, studentId, department, phone } = req.body;
  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }
  // Only allow assistant or student via this endpoint
  const allowed = ['student', 'assistant'];
  if (role && !allowed.includes(role)) {
    throw new AppError('Admin can only create student or assistant accounts via this endpoint', 403);
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError('Email already registered', 409);

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    studentId: studentId || undefined,
    department,
    phone,
  });

  sendSuccess(res, 201, 'User created', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      isActive: user.isActive,
    },
  });
});

/**
 * @desc    Update user (admin) — activate/deactivate, role change limited
 * @route   PUT /api/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  const { name, department, phone, isActive, role, studentId } = req.body;

  if (name !== undefined) user.name = name;
  if (department !== undefined) user.department = department;
  if (phone !== undefined) user.phone = phone;
  if (studentId !== undefined) user.studentId = studentId;
  if (isActive !== undefined) user.isActive = Boolean(isActive);

  // Role change: prevent demoting last admin or elevating to admin carelessly
  if (role !== undefined && role !== user.role) {
    if (role === 'admin') {
      throw new AppError('Cannot promote users to admin via API. Create admin with seed script.', 403);
    }
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        throw new AppError('Cannot demote the last active admin', 400);
      }
    }
    if (['student', 'assistant'].includes(role)) {
      user.role = role;
    }
  }

  await user.save();
  const safe = user.toJSON();
  sendSuccess(res, 200, 'User updated', { user: safe });
});

/**
 * @desc    Soft-deactivate user (preferred over hard delete)
 * @route   DELETE /api/users/:id
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
    if (adminCount <= 1) throw new AppError('Cannot deactivate the last active admin', 400);
  }
  user.isActive = false;
  await user.save();
  sendSuccess(res, 200, 'User deactivated', { user: user.toJSON() });
});

module.exports = { getUsers, getUser, createUser, updateUser, deactivateUser };
