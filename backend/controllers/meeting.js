const Meeting = require('../models/Meeting');

function generateMeetingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return 'CONNECT-' + id;
}

exports.create = async (req, res, next) => {
  try {
    let meetingId;
    do { meetingId = generateMeetingId(); } while (await Meeting.findOne({ meetingId }));
    const meeting = await Meeting.create({
      meetingId,
      title: (req.body && req.body.title ? String(req.body.title).slice(0, 120) : 'ConnectHub Meeting'),
      host: req.user._id,
      status: 'scheduled',
    });
    res.status(201).json({ success: true, meeting });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { 'participants.user': req.user._id }],
    }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, meetings });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: (req.params.meetingId || '').toUpperCase() });
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    res.json({ success: true, meeting });
  } catch (err) { next(err); }
};

exports.join = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: (req.params.meetingId || '').toUpperCase() });
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    if (meeting.status === 'ended') return res.status(400).json({ success: false, message: 'This meeting has ended' });
    const already = meeting.participants.some(p => p.user && p.user.toString() === req.user._id.toString() && !p.leftAt);
    if (!already) meeting.participants.push({ user: req.user._id, name: req.user.name });
    if (!meeting.startTime) meeting.startTime = new Date();
    meeting.status = 'active';
    await meeting.save();
    res.json({ success: true, meeting });
  } catch (err) { next(err); }
};

exports.leave = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: (req.params.meetingId || '').toUpperCase() });
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    meeting.participants.forEach(p => {
      if (p.user && p.user.toString() === req.user._id.toString() && !p.leftAt) p.leftAt = new Date();
    });
    await meeting.save();
    res.json({ success: true, meeting });
  } catch (err) { next(err); }
};
