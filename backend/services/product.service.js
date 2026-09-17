import slugify from 'slugify';
import Products from '../models/products.model.js';
import { Sequelize, Op } from 'sequelize';
import { deleteMultipleLocalFiles } from '../middleware/upload.middleware.js';
import {
  uploadToCloudinary,
  deleteMultipleFromCloudinary,
} from '../config/cloudinary.config.js';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ---------- Read ----------

export const getAllProducts = async () => {
  const products = await Products.findAll({ raw: false });
  return products.map((product) => product.toJSON());
};

export const getDeletedProducts = async () => {
  return Products.findAll({
    where: { deleted_at: { [Op.ne]: null } },
    paranoid: false,
  });
};

export const getTrendingProducts = async (limit = 18) => {
  return Products.findAll({
    order: [['star', 'DESC']],
    limit,
  });
};

export const getBrandGroups = async () => {
  const brands = await Products.findAll({
    attributes: [
      'brand',
      [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
    ],
    group: ['brand'],
    order: [['brand', 'ASC']],
  });

  return brands.map((b) => ({
    brand: b.brand,
    product_ids: b
      .get('product_ids')
      .split(',')
      .map((id) => Number(id)),
  }));
};

export const getSizeGroups = async () => {
  const sizes = await Products.findAll({
    attributes: [
      'size',
      [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
    ],
    group: ['size'],
  });

  return sizes.map((b) => ({
    size: b.size,
    product_ids: b
      .get('product_ids')
      .split(',')
      .map((id) => Number(id)),
  }));
};

export const getProductsByPriceRange = async (minPrice, maxPrice) => {
  const allProducts = await Products.findAll();

  const actualPrices = allProducts.map(
    (product) => product.sale_price || product.price || 0,
  );

  const priceRangeFromDB = {
    min_price: Math.min(...actualPrices),
    max_price: Math.max(...actualPrices),
  };

  const products = await Products.findAll({
    where: {
      [Op.or]: [
        {
          sale_price: {
            [Op.not]: null,
            [Op.between]: [Number(minPrice), Number(maxPrice)],
          },
        },
        {
          sale_price: null,
          price: { [Op.between]: [Number(minPrice), Number(maxPrice)] },
        },
      ],
    },
    order: [['created_at', 'DESC']],
  });

  return { products, priceRangeFromDB };
};

export const getNewProducts = async (limit = 8) => {
  return Products.findAll({
    order: [['created_at', 'DESC']],
    limit,
  });
};

export const getProductById = async (id) => {
  return Products.findByPk(id);
};

export const getProductsByCategoryId = async (categoryId) => {
  const products = await Products.findAll({
    where: Sequelize.literal(
      `(JSON_CONTAINS(category_ids, '"${categoryId}"', '$') OR JSON_CONTAINS(category_ids, '${categoryId}', '$'))`,
    ),
    raw: false,
  });
  return products.map((product) => product.toJSON());
};

export const getProductsByCategoryIdList = async (categoryIds) => {
  const conditions = categoryIds.map((id) =>
    Sequelize.literal(
      `(JSON_CONTAINS(category_ids, '"${id}"', '$') OR JSON_CONTAINS(category_ids, '${id}', '$'))`,
    ),
  );

  const products = await Products.findAll({
    where: { [Op.or]: conditions },
    raw: false,
  });
  return products.map((product) => product.toJSON());
};

export const getProductsByCategorySimple = async (categoryId) => {
  const allProducts = await Products.findAll({ raw: false });

  const filtered = allProducts.filter((product) => {
    const categoryIds = product.category_ids || [];
    return (
      categoryIds.includes(categoryId) ||
      categoryIds.includes(parseInt(categoryId)) ||
      categoryIds.includes(categoryId.toString())
    );
  });

  return filtered.map((product) => product.toJSON());
};

// ---------- Parse helpers (dùng cho create/update) ----------

export const parseCategoryIds = (categoryIds) => {
  if (typeof categoryIds === 'string') {
    try {
      return JSON.parse(categoryIds);
    } catch {
      return [categoryIds];
    }
  }
  return categoryIds;
};

export const parseSizes = (size) => {
  if (!size) return DEFAULT_SIZES;

  let parsedSizes;
  if (Array.isArray(size)) {
    parsedSizes = size;
  } else if (typeof size === 'string') {
    try {
      const p = JSON.parse(size);
      parsedSizes = Array.isArray(p) ? p : [String(p)];
    } catch {
      parsedSizes = size
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return parsedSizes && parsedSizes.length > 0 ? parsedSizes : DEFAULT_SIZES;
};

// ---------- Upload ảnh ----------

/**
 * Upload ảnh cho sản phẩm mới. Luôn dọn file tạm local dù thành công hay lỗi.
 */
export const uploadProductImages = async (files) => {
  const uploadedFiles = [];
  let featuredImageData = null;
  const imagesData = [];

  try {
    if (files?.featuredImage?.[0]) {
      const file = files.featuredImage[0];
      uploadedFiles.push(file.path);
      const result = await uploadToCloudinary(file.path, 'products');
      featuredImageData = { url: result.url, publicId: result.publicId };
    }

    if (files?.images?.length > 0) {
      for (const file of files.images) {
        uploadedFiles.push(file.path);
        const result = await uploadToCloudinary(file.path, 'products');
        imagesData.push({ url: result.url, publicId: result.publicId });
      }
    }

    if (!featuredImageData && imagesData.length > 0) {
      featuredImageData = imagesData[0];
    }

    return { featuredImageData, imagesData };
  } finally {
    deleteMultipleLocalFiles(uploadedFiles);
  }
};

/**
 * Upload ảnh mới khi update sản phẩm, đồng thời gom publicId ảnh cũ cần xóa.
 */
export const uploadUpdatedImages = async (product, files) => {
  const uploadedFiles = [];
  const oldPublicIds = [];
  const updateFields = {};

  try {
    if (files?.featuredImage?.[0]) {
      const file = files.featuredImage[0];
      uploadedFiles.push(file.path);
      const result = await uploadToCloudinary(file.path, 'products');

      if (product.featured_image?.publicId) {
        oldPublicIds.push(product.featured_image.publicId);
      }

      updateFields.featured_image = {
        url: result.url,
        publicId: result.publicId,
      };
    }

    if (files?.images?.length > 0) {
      const newImagesData = [];
      for (const file of files.images) {
        uploadedFiles.push(file.path);
        const result = await uploadToCloudinary(file.path, 'products');
        newImagesData.push({ url: result.url, publicId: result.publicId });
      }

      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img) => {
          if (img.publicId) oldPublicIds.push(img.publicId);
        });
      }

      updateFields.images = newImagesData;
    }

    return { updateFields, oldPublicIds };
  } finally {
    deleteMultipleLocalFiles(uploadedFiles);
  }
};

export const cleanupOldProductImages = (oldPublicIds) => {
  if (oldPublicIds.length > 0) {
    deleteMultipleFromCloudinary(oldPublicIds).catch((err) =>
      console.error('Error deleting old images from Cloudinary:', err),
    );
  }
};

// ---------- Create / Update / Delete ----------

export const createProductRecord = async ({
  name,
  description,
  price,
  salePrice,
  categoryIds,
  stockQuantity,
  brand,
  size,
  color,
  featuredImageData,
  imagesData,
}) => {
  return Products.create({
    name,
    slug: slugify(name, { lower: true }),
    description,
    price,
    sale_price: salePrice || null,
    stock_quantity: stockQuantity,
    category_ids: categoryIds,
    brand,
    size,
    color,
    images: imagesData,
    featured_image: featuredImageData,
    status: 'active',
    isNew: true,
    star: 0,
  });
};

export const findProductForUpdate = async (id) => {
  return Products.findByPk(id);
};

/**
 * Dựng object updateFields (chưa gồm ảnh) từ dữ liệu request
 */
export const buildUpdateFields = ({
  name,
  description,
  price,
  salePrice,
  categoryIds,
  stockQuantity,
  brand,
  size,
  color,
}) => {
  return {
    name,
    slug: name ? slugify(name, { lower: true }) : undefined,
    description,
    price,
    sale_price: salePrice,
    stock_quantity: stockQuantity,
    category_ids: categoryIds ? parseCategoryIds(categoryIds) : undefined,
    brand,
    size,
    color,
  };
};

export const applyProductUpdate = async (product, updateFields) => {
  await product.update(updateFields);
  await product.reload();
  return product;
};

export const softDeleteProduct = async (id) => {
  const product = await Products.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return product;
};

export const forceDeleteProduct = async (id) => {
  const product = await Products.findByPk(id, { paranoid: false });
  if (!product) return null;

  const publicIdsToDelete = [];
  if (product.featured_image?.publicId) {
    publicIdsToDelete.push(product.featured_image.publicId);
  }
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img.publicId) publicIdsToDelete.push(img.publicId);
    });
  }

  await product.destroy({ force: true });

  if (publicIdsToDelete.length > 0) {
    deleteMultipleFromCloudinary(publicIdsToDelete).catch((err) =>
      console.error('Error deleting images from Cloudinary:', err),
    );
  }

  return product;
};

export const restoreProduct = async (id) => {
  return Products.restore({ where: { id } });
};
