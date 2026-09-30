const router = require('express').Router();
const ctrl = require('../controllers/meeting');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../middleware/dbGuard');

router.use(protect, requireDb);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:meetingId', ctrl.getOne);
router.post('/:meetingId/join', ctrl.join);
router.post('/:meetingId/leave', ctrl.leave);

module.exports = router;
