import multer from 'multer';
import { env } from '../config/env';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]);

export const resumeUpload = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Only PDF and DOCX files are allowed'));
      return;
    }
    cb(null, true);
  },
});
