const { body } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

exports.registerValidators = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 80 }).withMessage('Name is too long'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

exports.loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

exports.profile = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};
