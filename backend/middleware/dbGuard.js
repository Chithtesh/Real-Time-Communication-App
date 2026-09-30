const { dbState } = require('../config/db');

// Returns 503 if MongoDB is not currently connected.
function requireDb(req, res, next) {
  if (!dbState.connected) {
    return res.status(503).json({ success: false, message: 'Database unavailable. Start MongoDB or set MONGODB_URI in backend/.env.' });
  }
  next();
}

module.exports = { requireDb };
