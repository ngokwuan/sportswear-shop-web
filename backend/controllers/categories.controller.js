import Categories from '../models/categories.model.js';
import slugify from 'slugify';
import { filterFields } from '../utils/filterFields.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được danh mục ' });
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
    const newCategories = await Categories.create({
      name,
      slug: slugify(name, { lower: true }),
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
  }
};

export const softDeleteCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await Categories.findByPk(id);
    if (!categories) {
      return res.status(404).json({
        error: 'Danh mục không tồn tại',
      });
    }
    await categories.destroy();
    res.json({ message: 'Xóa danh mục thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá mềm danh mục' });
  }
};

export const restoreCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Categories.restore({ where: { id } });
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
    const categories = await Categories.findByPk(id, { paranoid: false });
    if (!categories) {
      return res.status(404).json({
        error: 'Danh mục không tồn tại',
      });
    }
    await categories.destroy({ force: true });
    res.json({ message: 'Xóa vĩnh viễn danh mục thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá vĩnh viễn danh mục' });
  }
};

export const updateCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Danh mục không tồn tại',
      });
    }
    let updateFields = {
      name,
      slug: name ? slugify(name, { lower: true }) : undefined,
      description,
    };

    updateFields = filterFields(updateFields);

    await category.update(updateFields);
    return res.status(200).json({
      message: 'Cập nhâp danh mục thành công ',
      category,
    });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật danh mục' });
  }
};
