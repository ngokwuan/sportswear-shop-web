// import slugify from 'slugify';
// import Products from '../models/products.model.js';
// import { filterFields } from '../utils/filterFields.js';
// import { Sequelize, Op } from 'sequelize';
// import {
//   deleteLocalFile,
//   deleteMultipleLocalFiles,
// } from '../middleware/upload.middleware.js';
// import {
//   uploadToCloudinary,
//   deleteFromCloudinary,
//   deleteMultipleFromCloudinary,
// } from '../config/cloudinary.config.js';
// export const getProduct = async (req, res) => {
//   try {
//     const products = await Products.findAll();
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: 'Không lấy được sản phẩm' });
//   }
// };
// export const getProductTrash = async (req, res) => {
//   try {
//     const products = await Products.findAll({
//       where: {
//         deleted_at: {
//           [Op.ne]: null,
//         },
//       },
//       paranoid: false,
//     });
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: 'Không lấy được sản phẩm đã xóa ' });
//   }
// };
// export const getTrendingProduct = async (req, res) => {
//   try {
//     const products = await Products.findAll({
//       order: [['star', 'DESC']],
//       limit: 18,
//     });
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: 'Không lấy được sản phẩm' });
//   }
// };
// export const getBrandProduct = async (req, res) => {
//   try {
//     const brands = await Products.findAll({
//       attributes: [
//         'brand',

//         [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
//       ],
//       group: ['brand'],
//       order: [['brand', 'ASC']],
//     });

//     const result = brands.map((b) => ({
//       brand: b.brand,
//       product_ids: b
//         .get('product_ids')
//         .split(',')
//         .map((id) => Number(id)),
//     }));

//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: 'Không lấy được brand và danh sách sản phẩm' });
//   }
// };
// export const getSizeProduct = async (req, res) => {
//   try {
//     const sizes = await Products.findAll({
//       attributes: [
//         'size',

//         [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
//       ],
//       group: ['size'],
//     });

//     // convert chuỗi id thành mảng số
//     const result = sizes.map((b) => ({
//       size: b.size,
//       product_ids: b
//         .get('product_ids')
//         .split(',')
//         .map((id) => Number(id)),
//     }));

//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: 'Không lấy được size và danh sách sản phẩm' });
//   }
// };

// export const getPriceProduct = async (req, res) => {
//   try {
//     const { minPrice = 0, maxPrice = 999999 } = req.query;

//     const allProducts = await Products.findAll();

//     const actualPrices = allProducts.map((product) => {
//       return product.sale_price || product.price || 0;
//     });

//     const minPriceFromDB = Math.min(...actualPrices);
//     const maxPriceFromDB = Math.max(...actualPrices);

//     const products = await Products.findAll({
//       where: {
//         [Sequelize.Op.or]: [
//           {
//             sale_price: {
//               [Sequelize.Op.not]: null,
//               [Sequelize.Op.between]: [Number(minPrice), Number(maxPrice)],
//             },
//           },
//           {
//             sale_price: null,
//             price: {
//               [Sequelize.Op.between]: [Number(minPrice), Number(maxPrice)],
//             },
//           },
//         ],
//       },
//       order: [['created_at', 'DESC']],
//     });

//     res.json({
//       products,
//       count: products.length,
//       priceRange: {
//         min: Number(minPrice),
//         max: Number(maxPrice),
//       },
//       actualPriceRange: {
//         min_price: minPriceFromDB,
//         max_price: maxPriceFromDB,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: 'Không lấy được sản phẩm theo khoảng giá',
//     });
//   }
// };

// export const getNewProduct = async (req, res) => {
//   try {
//     const products = await Products.findAll({
//       order: [['created_at', 'DESC']],
//       limit: 8,
//     });
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: 'Không lấy được sản phẩm' });
//   }
// };

// export const getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Products.findByPk(id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy sản phẩm',
//       });
//     }

//     res.json({
//       success: true,
//       data: product,
//     });
//   } catch (error) {
//     console.error('Error getting product:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Không thể lấy thông tin sản phẩm',
//     });
//   }
// };
// export const createProduct = async (req, res) => {
//   const uploadedFiles = []; // Track các file tạm để cleanup

//   try {
//     const {
//       name,
//       description,
//       price,
//       salePrice,
//       categoryId,
//       stockQuantity,
//       brand,
//       size,
//       color,
//     } = req.body;

//     // Validate required fields
//     const requiredFields = {
//       name,
//       description,
//       price,
//       categoryId,
//       stockQuantity,
//       brand,
//       size,
//       color,
//     };

//     for (const [key, value] of Object.entries(requiredFields)) {
//       if (!value) {
//         return res.status(400).json({
//           message: `Trường ${key} là bắt buộc`,
//         });
//       }
//     }

//     // Xử lý upload ảnh lên Cloudinary
//     let featuredImageData = null;
//     let imagesData = [];

//     if (req.files) {
//       // Upload featured image
//       if (req.files.featuredImage && req.files.featuredImage[0]) {
//         const file = req.files.featuredImage[0];
//         uploadedFiles.push(file.path);

//         const result = await uploadToCloudinary(file.path, 'products');
//         featuredImageData = {
//           url: result.url,
//           publicId: result.publicId,
//         };
//       }

//       // Upload danh sách images
//       if (req.files.images && req.files.images.length > 0) {
//         for (const file of req.files.images) {
//           uploadedFiles.push(file.path);
//           const result = await uploadToCloudinary(file.path, 'products');
//           imagesData.push({
//             url: result.url,
//             publicId: result.publicId,
//           });
//         }
//       }
//     }

//     // Nếu không có featured image, lấy ảnh đầu tiên từ images
//     if (!featuredImageData && imagesData.length > 0) {
//       featuredImageData = imagesData[0];
//     }

//     // Tạo sản phẩm
//     const newProduct = await Products.create({
//       name,
//       slug: slugify(name, { lower: true }),
//       description,
//       price,
//       sale_price: salePrice || null,
//       stock_quantity: stockQuantity,
//       category_id: categoryId,
//       brand,
//       size,
//       color,
//       images: imagesData, // Lưu array of objects {url, publicId}
//       featured_image: featuredImageData, // Lưu object {url, publicId}
//       status: 'active',
//       isNew: true,
//       star: 0,
//     });

//     // Cleanup: Xóa các file tạm
//     deleteMultipleLocalFiles(uploadedFiles);

//     res.status(201).json({
//       message: 'Thêm sản phẩm thành công!',
//       product: newProduct,
//     });
//   } catch (error) {
//     console.error('Lỗi thêm sản phẩm:', error);

//     // Cleanup: Xóa các file tạm nếu có lỗi
//     deleteMultipleLocalFiles(uploadedFiles);

//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         error: 'Dữ liệu không hợp lệ',
//         details: error.errors.map((err) => err.message),
//       });
//     }

//     res.status(500).json({
//       error: 'Không thể thêm sản phẩm',
//       details: error.message,
//     });
//   }
// };

import slugify from 'slugify';
import Products from '../models/products.model.js';
import { filterFields } from '../utils/filterFields.js';
import { Sequelize, Op } from 'sequelize';
import {
  deleteLocalFile,
  deleteMultipleLocalFiles,
} from '../middleware/upload.middleware.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from '../config/cloudinary.config.js';

export const getProduct = async (req, res) => {
  try {
    console.log('Fetching products...');
    const products = await Products.findAll({
      raw: false, // Important: get Sequelize instances with getters
    });

    console.log(`Found ${products.length} products`);

    // Serialize products to plain objects
    const serializedProducts = products.map((product) => product.toJSON());

    res.json(serializedProducts);
  } catch (error) {
    console.error('Error in getProduct:', error);
    res.status(500).json({
      error: 'Không lấy được sản phẩm',
      details: error.message,
    });
  }
};

export const getProductTrash = async (req, res) => {
  try {
    const products = await Products.findAll({
      where: {
        deleted_at: {
          [Op.ne]: null,
        },
      },
      paranoid: false,
    });
    res.json(products);
  } catch (error) {
    console.error('Error in getProductTrash:', error);
    res.status(500).json({ error: 'Không lấy được sản phẩm đã xóa ' });
  }
};

export const getTrendingProduct = async (req, res) => {
  try {
    const products = await Products.findAll({
      order: [['star', 'DESC']],
      limit: 18,
    });
    res.json(products);
  } catch (error) {
    console.error('Error in getTrendingProduct:', error);
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};

export const getBrandProduct = async (req, res) => {
  try {
    const brands = await Products.findAll({
      attributes: [
        'brand',
        [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
      ],
      group: ['brand'],
      order: [['brand', 'ASC']],
    });

    const result = brands.map((b) => ({
      brand: b.brand,
      product_ids: b
        .get('product_ids')
        .split(',')
        .map((id) => Number(id)),
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in getBrandProduct:', error);
    res
      .status(500)
      .json({ error: 'Không lấy được brand và danh sách sản phẩm' });
  }
};

export const getSizeProduct = async (req, res) => {
  try {
    const sizes = await Products.findAll({
      attributes: [
        'size',
        [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
      ],
      group: ['size'],
    });

    const result = sizes.map((b) => ({
      size: b.size,
      product_ids: b
        .get('product_ids')
        .split(',')
        .map((id) => Number(id)),
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in getSizeProduct:', error);
    res
      .status(500)
      .json({ error: 'Không lấy được size và danh sách sản phẩm' });
  }
};

export const getPriceProduct = async (req, res) => {
  try {
    const { minPrice = 0, maxPrice = 999999 } = req.query;

    const allProducts = await Products.findAll();

    const actualPrices = allProducts.map((product) => {
      return product.sale_price || product.price || 0;
    });

    const minPriceFromDB = Math.min(...actualPrices);
    const maxPriceFromDB = Math.max(...actualPrices);

    const products = await Products.findAll({
      where: {
        [Sequelize.Op.or]: [
          {
            sale_price: {
              [Sequelize.Op.not]: null,
              [Sequelize.Op.between]: [Number(minPrice), Number(maxPrice)],
            },
          },
          {
            sale_price: null,
            price: {
              [Sequelize.Op.between]: [Number(minPrice), Number(maxPrice)],
            },
          },
        ],
      },
      order: [['created_at', 'DESC']],
    });

    res.json({
      products,
      count: products.length,
      priceRange: {
        min: Number(minPrice),
        max: Number(maxPrice),
      },
      actualPriceRange: {
        min_price: minPriceFromDB,
        max_price: maxPriceFromDB,
      },
    });
  } catch (error) {
    console.error('Error in getPriceProduct:', error);
    res.status(500).json({
      error: 'Không lấy được sản phẩm theo khoảng giá',
    });
  }
};

export const getNewProduct = async (req, res) => {
  try {
    const products = await Products.findAll({
      order: [['created_at', 'DESC']],
      limit: 8,
    });
    res.json(products);
  } catch (error) {
    console.error('Error in getNewProduct:', error);
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin sản phẩm',
    });
  }
};

export const createProduct = async (req, res) => {
  const uploadedFiles = [];

  try {
    const {
      name,
      description,
      price,
      salePrice,
      categoryId,
      stockQuantity,
      brand,
      size,
      color,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      name,
      description,
      price,
      categoryId,
      stockQuantity,
      brand,
      size,
      color,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({
          message: `Trường ${key} là bắt buộc`,
        });
      }
    }

    // Xử lý upload ảnh lên Cloudinary
    let featuredImageData = null;
    let imagesData = [];

    if (req.files) {
      // Upload featured image
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        const file = req.files.featuredImage[0];
        uploadedFiles.push(file.path);

        const result = await uploadToCloudinary(file.path, 'products');
        featuredImageData = {
          url: result.url,
          publicId: result.publicId,
        };
      }

      // Upload danh sách images
      if (req.files.images && req.files.images.length > 0) {
        for (const file of req.files.images) {
          uploadedFiles.push(file.path);
          const result = await uploadToCloudinary(file.path, 'products');
          imagesData.push({
            url: result.url,
            publicId: result.publicId,
          });
        }
      }
    }

    // Nếu không có featured image, lấy ảnh đầu tiên từ images
    if (!featuredImageData && imagesData.length > 0) {
      featuredImageData = imagesData[0];
    }

    // Tạo sản phẩm
    const newProduct = await Products.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      price,
      sale_price: salePrice || null,
      stock_quantity: stockQuantity,
      category_id: categoryId,
      brand,
      size,
      color,
      images: imagesData,
      featured_image: featuredImageData,
      status: 'active',
      isNew: true,
      star: 0,
    });

    // Cleanup: Xóa các file tạm
    deleteMultipleLocalFiles(uploadedFiles);

    res.status(201).json({
      message: 'Thêm sản phẩm thành công!',
      product: newProduct,
    });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);

    // Cleanup: Xóa các file tạm nếu có lỗi
    deleteMultipleLocalFiles(uploadedFiles);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors.map((err) => err.message),
      });
    }

    res.status(500).json({
      error: 'Không thể thêm sản phẩm',
      details: error.message,
    });
  }
};

// ... rest of the controller methods remain the same
export const updateProduct = async (req, res) => {
  const uploadedFiles = [];

  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      salePrice,
      stockQuantity,
      brand,
      size,
      color,
    } = req.body;

    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }

    let updateFields = {
      name,
      slug: name ? slugify(name, { lower: true }) : undefined,
      description,
      price,
      sale_price: salePrice,
      stock_quantity: stockQuantity,
      brand,
      size,
      color,
    };

    const oldPublicIds = []; // Track các ảnh cũ cần xóa

    // Xử lý upload ảnh mới
    if (req.files) {
      // Cập nhật featured image
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        const file = req.files.featuredImage[0];
        uploadedFiles.push(file.path);

        // Upload ảnh mới
        const result = await uploadToCloudinary(file.path, 'products');

        // Lưu publicId của ảnh cũ để xóa
        if (product.featured_image?.publicId) {
          oldPublicIds.push(product.featured_image.publicId);
        }

        updateFields.featured_image = {
          url: result.url,
          publicId: result.publicId,
        };
      }

      // Cập nhật images
      if (req.files.images && req.files.images.length > 0) {
        const newImagesData = [];

        for (const file of req.files.images) {
          uploadedFiles.push(file.path);
          const result = await uploadToCloudinary(file.path, 'products');
          newImagesData.push({
            url: result.url,
            publicId: result.publicId,
          });
        }

        // Lưu publicId của các ảnh cũ để xóa
        if (product.images && Array.isArray(product.images)) {
          product.images.forEach((img) => {
            if (img.publicId) {
              oldPublicIds.push(img.publicId);
            }
          });
        }

        updateFields.images = newImagesData;
      }
    }

    // Cleanup: Xóa các file tạm
    deleteMultipleLocalFiles(uploadedFiles);

    // Filter và update
    updateFields = filterFields(updateFields);
    await product.update(updateFields);

    // Xóa các ảnh cũ từ Cloudinary (async, không block response)
    if (oldPublicIds.length > 0) {
      deleteMultipleFromCloudinary(oldPublicIds).catch((err) =>
        console.error('Error deleting old images from Cloudinary:', err)
      );
    }

    return res.status(200).json({
      message: 'Cập nhật sản phẩm thành công',
      product,
    });
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);

    // Cleanup: Xóa các file tạm
    deleteMultipleLocalFiles(uploadedFiles);

    res.status(500).json({
      error: 'Không thể cập nhật sản phẩm',
      details: error.message,
    });
  }
};

export const forceDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByPk(id, { paranoid: false });

    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }

    const publicIdsToDelete = [];

    // Lấy publicId của featured image
    if (product.featured_image?.publicId) {
      publicIdsToDelete.push(product.featured_image.publicId);
    }

    // Lấy publicId của các images
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img.publicId) {
          publicIdsToDelete.push(img.publicId);
        }
      });
    }

    // Xóa sản phẩm khỏi database
    await product.destroy({ force: true });

    // Xóa ảnh từ Cloudinary (async)
    if (publicIdsToDelete.length > 0) {
      deleteMultipleFromCloudinary(publicIdsToDelete).catch((err) =>
        console.error('Error deleting images from Cloudinary:', err)
      );
    }

    res.json({ message: 'Xóa vĩnh viễn sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    res.status(500).json({
      error: 'Không thể xóa vĩnh viễn sản phẩm',
      details: error.message,
    });
  }
};
export const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }
    await product.destroy();
    res.json({ message: 'Xóa sản phẩm thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá mềm sản phẩm' });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Products.restore({ where: { id } });
    if (!restored) {
      return res
        .status(404)
        .json({ error: 'Không tìm thấy sản phẩm để khôi phục' });
    }
    res.json({ message: 'Khôi phục sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể khôi phục sản phẩm' });
  }
};
