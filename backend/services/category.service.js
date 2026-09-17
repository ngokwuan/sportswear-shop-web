import Categories from '../models/categories.model.js';
import slugify from 'slugify';
import { Op } from 'sequelize';

export const getAllCategories = async () => {
  return Categories.findAll();
};

export const getDeletedCategories = async () => {
  return Categories.findAll({
    where: {
      deleted_at: { [Op.ne]: null },
    },
    paranoid: false,
  });
};

export const createCategory = async ({ name, description }) => {
  return Categories.create({
    name,
    slug: slugify(name, { lower: true }),
    description,
  });
};

export const findCategoryById = async (id) => {
  return Categories.findByPk(id);
};

export const findCategoryByIdIncludingTrashed = async (id) => {
  return Categories.findByPk(id, { paranoid: false });
};

export const softDeleteCategory = async (id) => {
  const category = await Categories.findByPk(id);
  if (!category) return null;
  await category.destroy();
  return category;
};

export const forceDeleteCategory = async (id) => {
  const category = await Categories.findByPk(id, { paranoid: false });
  if (!category) return null;
  await category.destroy({ force: true });
  return category;
};

/**
 * LƯU Ý: Sequelize's Model.restore() không trả về số dòng bị ảnh hưởng
 * (resolve về undefined), nên không thể dùng giá trị trả về để biết
 * "có tìm thấy bản ghi để khôi phục hay không". Muốn biết chính xác,
 * cần findByPk({ paranoid: false }) trước khi restore để kiểm tra tồn tại.
 */
export const restoreCategory = async (id) => {
  return Categories.restore({ where: { id } });
};

export const buildCategoryUpdateFields = ({ name, description }) => {
  return {
    name,
    slug: name ? slugify(name, { lower: true }) : undefined,
    description,
  };
};

export const applyCategoryUpdate = async (category, updateFields) => {
  await category.update(updateFields);
  return category;
};
