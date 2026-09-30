const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, uppercase: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
