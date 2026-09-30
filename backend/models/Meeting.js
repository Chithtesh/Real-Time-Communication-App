const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    socketId: { type: String },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, unique: true, uppercase: true, index: true },
    title: { type: String, default: 'ConnectHub Meeting', trim: true, maxlength: 120 },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: { type: [participantSchema], default: [] },
    startTime: { type: Date },
    endTime: { type: Date },
    status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);
