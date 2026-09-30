const router = require('express').Router();
const ctrl = require('../controllers/file');
const { protect } = require('../middleware/auth');
const { requireDb } = require('../middleware/dbGuard');
const { upload } = require('../config/upload');

router.post('/upload', protect, requireDb, upload.single('file'), ctrl.upload);
router.get('/meeting/:meetingId', protect, requireDb, ctrl.listForMeeting);
router.get('/:id', protect, ctrl.get);

module.exports = router;
