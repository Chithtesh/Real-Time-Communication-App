const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, uppercase: true, index: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
