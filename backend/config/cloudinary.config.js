import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file lên Cloudinary
 * @param {string} filePath - Đường dẫn file local
 * @param {string} folder - Thư mục trên Cloudinary
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = async (filePath, folder = 'products') => {
  try {
    console.log('Starting upload to Cloudinary:', {
      filePath,
      folder,
      fileExists: fs.existsSync(filePath),
    });

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      throw new Error(`File không tồn tại: ${filePath}`);
    }

    // Upload với các options phù hợp
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // Tự động detect loại file
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'], // ADDED AVIF
      transformation: [
        {
          quality: 'auto:good', // Tự động optimize quality
          fetch_format: 'auto', // Tự động chọn format tốt nhất
        },
      ],
    });

    console.log('Upload successful:', {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', {
      message: error.message,
      stack: error.stack,
      filePath,
    });

    // Ném lỗi với thông tin chi tiết hơn
    throw new Error(`Không thể upload ảnh lên Cloudinary: ${error.message}`);
  }
};

/**
 * Xóa file từ Cloudinary
 * @param {string} publicId - Public ID của file trên Cloudinary
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.warn('No publicId provided for deletion');
      return;
    }

    console.log('Deleting from Cloudinary:', publicId);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    console.log('Delete result:', result);

    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', {
      publicId,
      error: error.message,
    });
    // Không throw error để không block các thao tác khác
  }
};

/**
 * Xóa nhiều file từ Cloudinary
 * @param {string[]} publicIds - Mảng các public ID
 * @returns {Promise<void>}
 */
export const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      console.warn('No publicIds provided for deletion');
      return;
    }

    console.log('Deleting multiple files from Cloudinary:', publicIds);

    // Xóa từng file
    const deletePromises = publicIds.map((publicId) =>
      deleteFromCloudinary(publicId)
    );

    await Promise.allSettled(deletePromises);

    console.log('Batch deletion completed');
  } catch (error) {
    console.error('Error in batch deletion:', error.message);
    // Không throw error để không block các thao tác khác
  }
};

export default cloudinary;
