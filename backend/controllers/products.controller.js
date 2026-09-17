import { filterFields } from '../utils/filterFields.js';
import * as productService from '../services/product.service.js';

export const getProduct = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
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
    const products = await productService.getDeletedProducts();
    res.json(products);
  } catch (error) {
    console.error('Error in getProductTrash:', error);
    res.status(500).json({ error: 'Không lấy được sản phẩm đã xóa ' });
  }
};

export const getTrendingProduct = async (req, res) => {
  try {
    const products = await productService.getTrendingProducts();
    res.json(products);
  } catch (error) {
    console.error('Error in getTrendingProduct:', error);
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};

export const getBrandProduct = async (req, res) => {
  try {
    const result = await productService.getBrandGroups();
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
    const result = await productService.getSizeGroups();
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

    const { products, priceRangeFromDB } =
      await productService.getProductsByPriceRange(minPrice, maxPrice);

    res.json({
      products,
      count: products.length,
      priceRange: {
        min: Number(minPrice),
        max: Number(maxPrice),
      },
      actualPriceRange: priceRangeFromDB,
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
    const products = await productService.getNewProducts();
    res.json(products);
  } catch (error) {
    console.error('Error in getNewProduct:', error);
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin sản phẩm',
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.query;

    if (!category_id) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp category_id',
      });
    }

    const products = await productService.getProductsByCategoryId(category_id);
    res.json(products);
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({
      error: 'Không lấy được sản phẩm theo danh mục',
      details: error.message,
    });
  }
};

export const getProductsByCategoryIds = async (req, res) => {
  try {
    const { category_ids } = req.query; // "1,2,3"

    if (!category_ids) {
      return getProduct(req, res);
    }

    const categoryIdArray = category_ids.split(',');
    const products =
      await productService.getProductsByCategoryIdList(categoryIdArray);
    res.json(products);
  } catch (error) {
    console.error('Error in getProductsByCategoryIds:', error);
    res.status(500).json({
      error: 'Không lấy được sản phẩm theo danh mục',
      details: error.message,
    });
  }
};

export const getProductsByCategorySimple = async (req, res) => {
  try {
    const { category_id } = req.query;

    if (!category_id) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp category_id',
      });
    }

    const products =
      await productService.getProductsByCategorySimple(category_id);
    res.json(products);
  } catch (error) {
    console.error('Error in getProductsByCategorySimple:', error);
    res.status(500).json({
      error: 'Không lấy được sản phẩm theo danh mục',
      details: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      categoryIds,
      stockQuantity,
      brand,
      size,
      color,
    } = req.body;

    const parsedCategoryIds = productService.parseCategoryIds(categoryIds);

    const requiredFields = {
      name,
      description,
      price,
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

    if (!parsedCategoryIds || parsedCategoryIds.length === 0) {
      return res.status(400).json({
        message: 'Vui lòng chọn ít nhất 1 danh mục',
      });
    }

    const parsedSizes = productService.parseSizes(size);

    const { featuredImageData, imagesData } =
      await productService.uploadProductImages(req.files);

    const newProduct = await productService.createProductRecord({
      name,
      description,
      price,
      salePrice,
      categoryIds: parsedCategoryIds,
      stockQuantity,
      brand,
      size: parsedSizes,
      color,
      featuredImageData,
      imagesData,
    });

    res.status(201).json({
      message: 'Thêm sản phẩm thành công!',
      product: newProduct,
    });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);

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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.findProductForUpdate(id);
    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }

    let updateFields = productService.buildUpdateFields(req.body);

    const { updateFields: imageFields, oldPublicIds } =
      await productService.uploadUpdatedImages(product, req.files);

    updateFields = { ...updateFields, ...imageFields };
    updateFields = filterFields(updateFields);

    const updatedProduct = await productService.applyProductUpdate(
      product,
      updateFields,
    );

    productService.cleanupOldProductImages(oldPublicIds);

    return res.status(200).json({
      message: 'Cập nhật sản phẩm thành công',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).json({
      error: 'Không thể cập nhật sản phẩm',
      details: error.message,
    });
  }
};

export const forceDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.forceDeleteProduct(id);

    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
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
    const product = await productService.softDeleteProduct(id);
    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }
    res.json({ message: 'Xóa sản phẩm thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá mềm sản phẩm' });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await productService.restoreProduct(id);
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
