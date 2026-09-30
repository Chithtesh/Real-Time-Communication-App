const Message = require('../models/Message');

exports.list = async (req, res, next) => {
  try {
    const messages = await Message.find({ meetingId: (req.params.meetingId || '').toUpperCase() })
      .sort({ timestamp: 1 }).limit(500).lean();
    res.json({ success: true, messages });
  } catch (err) { next(err); }
};
