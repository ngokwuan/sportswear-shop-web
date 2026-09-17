import { Blog, User, Category } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const findUserById = async (userId) => {
  return User.findByPk(userId);
};

export const findCategoriesByIds = async (ids, transaction) => {
  return Category.findAll({ where: { id: ids }, transaction });
};

export const createBlogRecord = async (blogData, transaction) => {
  return Blog.create(blogData, { transaction });
};

export const getBlogWithAuthor = async (id) => {
  return Blog.findByPk(id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
    ],
  });
};

export const getCategoriesForIds = async (categoryIds) => {
  if (!categoryIds || categoryIds.length === 0) return [];
  return Category.findAll({
    where: { id: categoryIds },
    attributes: ['id', 'name', 'slug'],
  });
};

/**
 * Gắn danh sách categories tương ứng vào từng blog (dùng cho các API danh sách)
 */
export const attachCategoriesToBlogs = async (blogs) => {
  const allCategoryIds = [
    ...new Set(blogs.flatMap((blog) => blog.category_ids || [])),
  ];
  const categories = await getCategoriesForIds(allCategoryIds);

  return blogs.map((blog) => {
    const blogCategories = categories.filter((cat) =>
      (blog.category_ids || []).includes(cat.id),
    );
    return { ...blog.toJSON(), categories: blogCategories };
  });
};

const buildCategoryFilter = (categoryId) => {
  return sequelize.literal(
    `JSON_CONTAINS(category_ids, '${parseInt(categoryId)}')`,
  );
};

export const getAllBlogs = async ({
  status,
  categoryId,
  authorId,
  search,
  isFeatured,
  limit,
  offset,
}) => {
  const whereCondition = {};

  if (status) whereCondition.status = status;
  if (authorId) whereCondition.author_id = authorId;
  if (isFeatured !== undefined)
    whereCondition.is_featured = isFeatured === 'true';
  if (categoryId) whereCondition[Op.and] = buildCategoryFilter(categoryId);
  if (search) {
    whereCondition[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
      { excerpt: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows: blogs } = await Blog.findAndCountAll({
    where: whereCondition,
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const blogsWithCategories = await attachCategoriesToBlogs(blogs);
  return { count, blogs: blogsWithCategories };
};

export const getPublishedBlogs = async ({
  categoryId,
  search,
  isFeatured,
  limit,
  offset,
}) => {
  const whereCondition = {
    status: 'published',
    published_at: { [Op.lte]: new Date() },
  };

  if (isFeatured !== undefined)
    whereCondition.is_featured = isFeatured === 'true';
  if (categoryId) whereCondition[Op.and] = buildCategoryFilter(categoryId);
  if (search) {
    whereCondition[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { excerpt: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows: blogs } = await Blog.findAndCountAll({
    where: whereCondition,
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
    order: [['published_at', 'DESC']],
    limit,
    offset,
  });

  const blogsWithCategories = await attachCategoriesToBlogs(blogs);
  return { count, blogs: blogsWithCategories };
};

export const getBlogById = async (id) => {
  return Blog.findByPk(id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
    ],
  });
};

export const getBlogBySlug = async (slug) => {
  return Blog.findOne({
    where: { slug },
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
    ],
  });
};

export const incrementBlogViews = async (blog) => {
  await blog.increment('views');
  return blog.views + 1;
};

export const findBlogForUpdate = async (id, transaction) => {
  return Blog.findByPk(id, { transaction });
};

export const findBlogBySlugExcludingId = async (
  slug,
  excludeId,
  transaction,
) => {
  return Blog.findOne({
    where: { slug, id: { [Op.ne]: excludeId } },
    transaction,
  });
};

export const applyBlogUpdate = async (blog, updateData, transaction) => {
  await blog.update(updateData, { transaction });
  return blog;
};

export const softDeleteBlog = async (id) => {
  const blog = await Blog.findByPk(id);
  if (!blog) return null;
  await blog.destroy();
  return blog;
};

export const getTrashedBlogs = async ({ limit, offset }) => {
  const { count, rows: blogs } = await Blog.findAndCountAll({
    where: { deleted_at: { [Op.ne]: null } },
    paranoid: false,
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
    ],
    order: [['deleted_at', 'DESC']],
    limit,
    offset,
  });

  const blogsWithCategories = await attachCategoriesToBlogs(blogs);
  return { count, blogs: blogsWithCategories };
};

export const findBlogIncludingTrashed = async (id) => {
  return Blog.findByPk(id, { paranoid: false });
};

export const restoreBlogRecord = async (blog) => {
  await blog.restore();
  return blog;
};

export const forceDeleteBlogRecord = async (blog) => {
  await blog.destroy({ force: true });
  return blog;
};
