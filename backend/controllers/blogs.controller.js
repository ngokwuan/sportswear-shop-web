// controllers/blog.controller.js
import { Blog, User, Category } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// Tạo bài viết mới
export const createBlog = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      category_id,
      status = 'draft',
      tags = [],
      meta_title,
      meta_description,
      is_featured = false,
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: title, content',
      });
    }

    // Get author_id from authenticated user
    const author_id = req.user?.id;
    if (!author_id) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để tạo bài viết',
      });
    }

    // Check if user exists and is admin
    const author = await User.findByPk(author_id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    // Check if category exists (if provided)
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Danh mục không tồn tại',
        });
      }
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    // Check slug uniqueness
    const existingBlog = await Blog.findOne({ where: { slug: finalSlug } });
    if (existingBlog) {
      finalSlug += `-${Date.now()}`;
    }

    const blogData = {
      title,
      slug: finalSlug,
      excerpt,
      content,
      featured_image,
      author_id,
      category_id,
      status,
      tags: Array.isArray(tags) ? tags : [],
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt,
      is_featured,
    };

    // Set published_at if status is published
    if (status === 'published') {
      blogData.published_at = new Date();
    }

    const blog = await Blog.create(blogData, { transaction });

    await transaction.commit();

    // Fetch the created blog with associations
    const createdBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: createdBlog,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo bài viết',
      error: error.message,
    });
  }
};

// Lấy danh sách tất cả bài viết (admin)
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category_id,
      author_id,
      search,
      is_featured,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {};

    if (status) whereCondition.status = status;
    if (category_id) whereCondition.category_id = category_id;
    if (author_id) whereCondition.author_id = author_id;
    if (is_featured !== undefined)
      whereCondition.is_featured = is_featured === 'true';

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
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách bài viết',
      error: error.message,
    });
  }
};

// Lấy danh sách bài viết công khai (published)
export const getPublishedBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      search,
      is_featured,
      tags,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {
      status: 'published',
      published_at: { [Op.lte]: new Date() },
    };

    if (category_id) whereCondition.category_id = category_id;
    if (is_featured !== undefined)
      whereCondition.is_featured = is_featured === 'true';

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } },
      ];
    }

    if (tags) {
      whereCondition.tags = { [Op.like]: `%${tags}%` };
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['published_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get published blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách bài viết',
      error: error.message,
    });
  }
};

// Lấy chi tiết bài viết
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment_view = 'false' } = req.query;

    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    // Increment view count if requested
    if (increment_view === 'true') {
      await blog.increment('views');
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Get blog by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết bài viết',
      error: error.message,
    });
  }
};

// Lấy bài viết theo slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { increment_view = 'true' } = req.query;

    const blog = await Blog.findOne({
      where: {
        slug,
        status: 'published',
        published_at: { [Op.lte]: new Date() },
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    // Increment view count
    if (increment_view === 'true') {
      await blog.increment('views');
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết bài viết',
      error: error.message,
    });
  }
};

// Cập nhật bài viết
export const updateBlog = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get current user from token
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để cập nhật bài viết',
      });
    }

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    // Optional: Check if user can only edit their own blogs
    // Comment out if admin can edit any blog
    /*
    if (blog.author_id !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể chỉnh sửa bài viết của mình',
      });
    }
    */

    // Remove author_id from updateData to prevent changing author
    delete updateData.author_id;

    // Check if category exists (if updating)
    if (updateData.category_id) {
      const category = await Category.findByPk(updateData.category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Danh mục không tồn tại',
        });
      }
    }

    // Handle slug update
    if (
      updateData.title &&
      (!updateData.slug || updateData.slug === blog.slug)
    ) {
      const newSlug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      const existingBlog = await Blog.findOne({
        where: {
          slug: newSlug,
          id: { [Op.ne]: id },
        },
      });

      if (existingBlog) {
        updateData.slug = `${newSlug}-${Date.now()}`;
      } else {
        updateData.slug = newSlug;
      }
    }

    // Handle published_at
    if (updateData.status === 'published' && !blog.published_at) {
      updateData.published_at = new Date();
    } else if (updateData.status !== 'published' && updateData.status) {
      updateData.published_at = null;
    }

    await blog.update(updateData, { transaction });

    await transaction.commit();

    // Fetch updated blog with associations
    const updatedBlog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: updatedBlog,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật bài viết',
      error: error.message,
    });
  }
};

// Xóa bài viết (soft delete)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    await blog.destroy(); // Soft delete

    return res.status(200).json({
      success: true,
      message: 'Đã chuyển bài viết vào thùng rác',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa bài viết',
      error: error.message,
    });
  }
};

// Lấy bài viết từ thùng rác
export const getTrashedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: {},
      paranoid: false, // Include soft deleted records
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['deleted_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Filter only trashed blogs
    const trashedBlogs = blogs.filter((blog) => blog.deleted_at !== null);
    const trashedCount = trashedBlogs.length;

    return res.status(200).json({
      success: true,
      data: {
        blogs: trashedBlogs,
        pagination: {
          total: trashedCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(trashedCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get trashed blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách bài viết đã xóa',
      error: error.message,
    });
  }
};

// Khôi phục bài viết từ thùng rác
export const restoreBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id, { paranoid: false });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    if (!blog.deleted_at) {
      return res.status(400).json({
        success: false,
        message: 'Bài viết không ở trong thùng rác',
      });
    }

    await blog.restore();

    return res.status(200).json({
      success: true,
      message: 'Khôi phục bài viết thành công',
    });
  } catch (error) {
    console.error('Restore blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khôi phục bài viết',
      error: error.message,
    });
  }
};

// Xóa vĩnh viễn bài viết
export const forceDeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id, { paranoid: false });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    await blog.destroy({ force: true }); // Force delete

    return res.status(200).json({
      success: true,
      message: 'Xóa bài viết vĩnh viễn thành công',
    });
  } catch (error) {
    console.error('Force delete blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa vĩnh viễn bài viết',
      error: error.message,
    });
  }
};

// Lấy bài viết nổi bật
export const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.findAll({
      where: {
        status: 'published',
        is_featured: true,
        published_at: { [Op.lte]: new Date() },
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['published_at', 'DESC']],
      limit: parseInt(limit),
    });

    return res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy bài viết nổi bật',
      error: error.message,
    });
  }
};
