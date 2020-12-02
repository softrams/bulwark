import multer = require('multer');

const maxFileSize = 5000000; // 5 MB
export const upload = multer({
  fileFilter: (req, file, cb) => {
    // Ext validation
    if (!(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')) {
      req.fileExtError = 'Only JPEG and PNG file types allowed';
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: maxFileSize }
}).single('file');
export const uploadArray = multer({
  fileFilter: (req, file, cb) => {
    // Ext validation
    if (!(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')) {
      req.fileExtError = 'Only JPEG and PNG file types allowed';
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: maxFileSize }
}).array('screenshots');
