import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(request, file, callback) {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
    }
    return callback(null, true);
  },
});

export function uploadCsv(request, response, next) {
  upload.single('file')(request, response, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'CSV files must be 5 MB or smaller.' : 'Only CSV files are allowed.';
      return response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message });
    }
    if (!request.file) {
      return response.status(400).json({ success: false, message: 'A CSV file is required.' });
    }
    return next();
  });
}
