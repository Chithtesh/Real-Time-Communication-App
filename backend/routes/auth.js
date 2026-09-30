const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/auth');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../middleware/dbGuard');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

router.post('/register', requireDb, authLimiter, ctrl.registerValidators, validate, ctrl.register);
router.post('/login', requireDb, authLimiter, ctrl.loginValidators, validate, ctrl.login);
router.get('/profile', protect, ctrl.profile);

module.exports = router;
