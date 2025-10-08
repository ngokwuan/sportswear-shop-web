import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// File filter - UPDATED to support AVIF
const fileFilter = (req, file, cb) => {
  console.log('File being uploaded:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Allowed extensions - ADDED .avif
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|avif)$/i;

  // Allowed MIME types - ADDED image/avif
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ];

  const extname = path.extname(file.originalname).toLowerCase();
  const isValidExtension = allowedExtensions.test(extname);
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);

  console.log('Validation result:', {
    extname,
    isValidMimeType,
    isValidExtension,
  });

  if (isValidExtension && isValidMimeType) {
    return cb(null, true);
  }

  // Reject file with error
  cb(
    new Error(
      `File không hợp lệ: ${file.originalname}. Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp, avif)`
    ),
    false
  );
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// Middleware for product images upload
export const uploadProductImages = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// Helper functions to delete local files
export const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted local file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

export const deleteMultipleLocalFiles = (filePaths) => {
  if (!Array.isArray(filePaths)) return;

  filePaths.forEach((filePath) => {
    deleteLocalFile(filePath);
  });
};
