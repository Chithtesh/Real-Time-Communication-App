const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.csv', '.ppt', '.pptx', '.xls', '.xlsx'];
const BLOCKED_EXT = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.com', '.scr', '.js', '.jar', '.ps1', '.vbs', '.dll', '.apk'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    cb(null, Date.now() + '-' + crypto.randomBytes(6).toString('hex') + '-' + base + ext);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXT.includes(ext)) return cb(new Error('Executable or script files are not allowed'));
  if (!ALLOWED_EXT.includes(ext)) return cb(new Error('File type not allowed: ' + (ext || 'unknown')));
  cb(null, true);
}

const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10);
const upload = multer({ storage, fileFilter, limits: { fileSize: maxMb * 1024 * 1024 } });

module.exports = { upload, UPLOAD_DIR };
