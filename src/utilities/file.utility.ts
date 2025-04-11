import multer = require('multer');
import * as path from 'path';
import * as fs from 'fs';

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const maxFileSize = 5000000; // 5 MB

const fileFilter = (req, file, cb) => {
  // Ext validation
  if (!(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')) {
    req.fileExtError = 'Only JPEG and PNG file types allowed';
    cb(null, false);
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  fileFilter,
  limits: { fileSize: maxFileSize }
}).single('file');

export const uploadArray = multer({
  fileFilter,
  limits: { fileSize: maxFileSize }
}).array('screenshots');