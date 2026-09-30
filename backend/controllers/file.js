const path = require('path');
const File = require('../models/File');
const { UPLOAD_DIR } = require('../config/upload');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const meetingId = (req.body && req.body.meetingId ? String(req.body.meetingId) : '').toUpperCase();
    if (!meetingId) return res.status(400).json({ success: false, message: 'meetingId is required' });
    const doc = await File.create({
      meetingId,
      uploader: req.user._id,
      uploaderName: req.user.name,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      path: req.file.path,
    });
    res.status(201).json({ success: true, file: doc });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const doc = await File.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'File not found' });
    res.download(path.join(UPLOAD_DIR, doc.fileName), doc.originalName, (err) => {
      if (err && !res.headersSent) next(err);
    });
  } catch (err) { next(err); }
};

exports.listForMeeting = async (req, res, next) => {
  try {
    const files = await File.find({ meetingId: (req.params.meetingId || '').toUpperCase() })
      .sort({ uploadedAt: -1 }).lean();
    res.json({ success: true, files });
  } catch (err) { next(err); }
};
