const router = require('express').Router();
const ctrl = require('../controllers/message');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../middleware/dbGuard');

router.get('/:meetingId', protect, requireDb, ctrl.list);

module.exports = router;
