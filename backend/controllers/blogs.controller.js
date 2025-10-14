import { Blog, User, Category } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import slugify from 'slugify';

export const createBlog = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      excerpt,
      content,
      featured_image,
      category_ids, // Đổi từ category_id sang category_ids
      status = 'draft',
      meta_title,
      meta_description,
      tags,
      is_featured = false,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: title, content',
      });
    }

    // Validate category_ids
    if (
      !category_ids ||
      !Array.isArray(category_ids) ||
      category_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Phải chọn ít nhất 1 danh mục',
      });
    }

    const author_id = req.user?.id;
    if (!author_id) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để tạo bài viết',
      });
    }

    const author = await User.findByPk(author_id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    // Validate tất cả categories có tồn tại không
    const categories = await Category.findAll({
      where: { id: category_ids },
    });

    if (categories.length !== category_ids.length) {
      return res.status(404).json({
        success: false,
        message: 'Một hoặc nhiều danh mục không tồn tại',
      });
    }

    const blogData = {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      excerpt,
      content,
      featured_image,
      author_id,
      category_ids, // JSON array
      status,
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt,
      tags: tags || [],
      is_featured,
    };

    if (status === 'published') {
      blogData.published_at = new Date();
    }

    const blog = await Blog.create(blogData, { transaction });

    await transaction.commit();

    // Lấy thông tin blog vừa tạo
    const createdBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    // Lấy categories thủ công
    const blogCategories = await Category.findAll({
      where: { id: createdBlog.category_ids },
      attributes: ['id', 'name', 'slug'],
    });

    const response = {
      ...createdBlog.toJSON(),
      categories: blogCategories,
    };

    return res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: response,
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
    if (author_id) whereCondition.author_id = author_id;
    if (is_featured !== undefined)
      whereCondition.is_featured = is_featured === 'true';

    // Tìm kiếm theo category_id trong JSON array
    if (category_id) {
      whereCondition[Op.and] = sequelize.literal(
        `JSON_CONTAINS(category_ids, '${parseInt(category_id)}')`
      );
    }

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
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Lấy tất cả category_ids từ blogs
    const allCategoryIds = [
      ...new Set(blogs.flatMap((blog) => blog.category_ids || [])),
    ];

    // Lấy thông tin categories
    const categories =
      allCategoryIds.length > 0
        ? await Category.findAll({
            where: { id: allCategoryIds },
            attributes: ['id', 'name', 'slug'],
          })
        : [];

    // Map categories vào từng blog
    const blogsWithCategories = blogs.map((blog) => {
      const blogCategories = categories.filter((cat) =>
        (blog.category_ids || []).includes(cat.id)
      );

      return {
        ...blog.toJSON(),
        categories: blogCategories,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        blogs: blogsWithCategories,
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

export const getPublishedBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      search,
      is_featured,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {
      status: 'published',
      published_at: { [Op.lte]: new Date() },
    };

    if (is_featured !== undefined)
      whereCondition.is_featured = is_featured === 'true';

    // Tìm kiếm theo category_id trong JSON array
    if (category_id) {
      whereCondition[Op.and] = sequelize.literal(
        `JSON_CONTAINS(category_ids, '${parseInt(category_id)}')`
      );
    }

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
      ],
      order: [['published_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Lấy tất cả category_ids từ blogs
    const allCategoryIds = [
      ...new Set(blogs.flatMap((blog) => blog.category_ids || [])),
    ];

    // Lấy thông tin categories
    const categories =
      allCategoryIds.length > 0
        ? await Category.findAll({
            where: { id: allCategoryIds },
            attributes: ['id', 'name', 'slug'],
          })
        : [];

    // Map categories vào từng blog
    const blogsWithCategories = blogs.map((blog) => {
      const blogCategories = categories.filter((cat) =>
        (blog.category_ids || []).includes(cat.id)
      );

      return {
        ...blog.toJSON(),
        categories: blogCategories,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        blogs: blogsWithCategories,
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
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    // Lấy thông tin categories
    const categories =
      blog.category_ids && blog.category_ids.length > 0
        ? await Category.findAll({
            where: { id: blog.category_ids },
            attributes: ['id', 'name', 'slug'],
          })
        : [];

    const response = {
      ...blog.toJSON(),
      categories,
    };

    if (increment_view === 'true') {
      await blog.increment('views');
      response.views = blog.views + 1;
    }

    return res.status(200).json({
      success: true,
      data: response,
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

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { increment_view = 'false' } = req.query;

    const blog = await Blog.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    // Lấy thông tin categories
    const categories =
      blog.category_ids && blog.category_ids.length > 0
        ? await Category.findAll({
            where: { id: blog.category_ids },
            attributes: ['id', 'name', 'slug'],
          })
        : [];

    const response = {
      ...blog.toJSON(),
      categories,
    };

    if (increment_view === 'true') {
      await blog.increment('views');
      response.views = blog.views + 1;
    }

    return res.status(200).json({
      success: true,
      data: response,
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

export const updateBlog = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

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

    // Không cho phép update author_id
    delete updateData.author_id;

    // Validate category_ids nếu có trong update
    if (updateData.category_ids) {
      if (
        !Array.isArray(updateData.category_ids) ||
        updateData.category_ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Phải chọn ít nhất 1 danh mục',
        });
      }

      const categories = await Category.findAll({
        where: { id: updateData.category_ids },
      });

      if (categories.length !== updateData.category_ids.length) {
        return res.status(404).json({
          success: false,
          message: 'Một hoặc nhiều danh mục không tồn tại',
        });
      }
    }

    // Tự động tạo slug mới nếu title thay đổi
    if (
      updateData.title &&
      (!updateData.slug || updateData.slug === blog.slug)
    ) {
      const newSlug = slugify(updateData.title, { lower: true, strict: true });

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

    // Xử lý published_at
    if (updateData.status === 'published' && !blog.published_at) {
      updateData.published_at = new Date();
    } else if (updateData.status !== 'published' && updateData.status) {
      updateData.published_at = null;
    }

    await blog.update(updateData, { transaction });

    await transaction.commit();

    const updatedBlog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    // Lấy thông tin categories
    const categories =
      updatedBlog.category_ids && updatedBlog.category_ids.length > 0
        ? await Category.findAll({
            where: { id: updatedBlog.category_ids },
            attributes: ['id', 'name', 'slug'],
          })
        : [];

    const response = {
      ...updatedBlog.toJSON(),
      categories,
    };

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: response,
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

    await blog.destroy();

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

export const getTrashedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: {
        deleted_at: { [Op.ne]: null },
      },
      paranoid: false,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['deleted_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Lấy tất cả category_ids từ blogs
    const allCategoryIds = [
      ...new Set(blogs.flatMap((blog) => blog.category_ids || [])),
    ];

    // Lấy thông tin categories
    const categories =
      allCategoryIds.length > 0
        ? await Category.findAll({
            where: { id: allCategoryIds },
            attributes: ['id', 'name', 'slug'],
          })
        : [];

    // Map categories vào từng blog
    const blogsWithCategories = blogs.map((blog) => {
      const blogCategories = categories.filter((cat) =>
        (blog.category_ids || []).includes(cat.id)
      );

      return {
        ...blog.toJSON(),
        categories: blogCategories,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        blogs: blogsWithCategories,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
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

    await blog.destroy({ force: true });

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
