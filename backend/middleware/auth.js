const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Express middleware: verify JWT (Authorization: Bearer <t> OR ?token=<t>) and attach req.user.
async function protect(req, res, next) {
  try {
    let token = '';
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) token = header.split(' ')[1];
    else if (req.query && req.query.token) token = String(req.query.token);
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
}

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

async function verifySocketToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User not found');
  return user;
}

module.exports = { protect, signToken, verifySocketToken };
