import { filterFields } from '../utils/filterFields.js';
import * as categoryService from '../services/category.service.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được danh mục ' });
  }
};

export const getCategoriesTrash = async (req, res) => {
  try {
    const categories = await categoryService.getDeletedCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được danh mục đã xóa ' });
  }
};

export const createCategories = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const newCategories = await categoryService.createCategory({
      name,
      description,
    });

    res.status(201).json({
      message: 'Thêm danh mục thành công!',
      newCategories,
    });
  } catch (error) {
    console.error('Error creating categories:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors.map((err) => err.message),
      });
    }
    // NOTE: giữ nguyên hành vi gốc — nhánh lỗi khác vẫn chưa có response ở đây.
  }
};

export const softDeleteCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await categoryService.softDeleteCategory(id);
    if (!categories) {
      return res.status(404).json({
        error: 'Danh mục không tồn tại',
      });
    }
    res.json({ message: 'Xóa danh mục thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá mềm danh mục' });
  }
};

export const restoreCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await categoryService.restoreCategory(id);
    console.log(restored);
    if (restored === 0) {
      return res
        .status(404)
        .json({ error: 'Không tìm thấy danh mục để khôi phục' });
    }
    res.json({ message: 'Khôi phục danh mục thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể khôi phục danh mục' });
  }
};

export const forceDeleteCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await categoryService.forceDeleteCategory(id);
    if (!categories) {
      return res.status(404).json({
        error: 'Danh mục không tồn tại',
      });
    }
    res.json({ message: 'Xóa vĩnh viễn danh mục thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá vĩnh viễn danh mục' });
  }
};

export const updateCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.findCategoryById(id);
    if (!category) {
      return res.status(404).json({
        error: 'Danh mục không tồn tại',
      });
    }

    let updateFields = categoryService.buildCategoryUpdateFields(req.body);
    updateFields = filterFields(updateFields);

    const updatedCategory = await categoryService.applyCategoryUpdate(
      category,
      updateFields,
    );

    return res.status(200).json({
      message: 'Cập nhâp danh mục thành công ',
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật danh mục' });
  }
};
