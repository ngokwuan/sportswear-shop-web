import sequelize from '../config/database.js';
import slugify from 'slugify';
import * as blogService from '../services/blog.service.js';

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
      await transaction.rollback();
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
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Phải chọn ít nhất 1 danh mục',
      });
    }

    const author_id = req.user?.id;
    if (!author_id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để tạo bài viết',
      });
    }

    const author = await blogService.findUserById(author_id);
    if (!author) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    // Validate tất cả categories có tồn tại không
    const categories = await blogService.findCategoriesByIds(category_ids);

    if (categories.length !== category_ids.length) {
      await transaction.rollback();
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

    const blog = await blogService.createBlogRecord(blogData, transaction);

    await transaction.commit();

    // Lấy thông tin blog vừa tạo
    const createdBlog = await blogService.getBlogWithAuthor(blog.id);

    // Lấy categories
    const blogCategories = await blogService.getCategoriesForIds(
      createdBlog.category_ids,
    );

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
    if (!transaction.finished) {
      await transaction.rollback();
    }
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

    const { count, blogs } = await blogService.getAllBlogs({
      status,
      categoryId: category_id,
      authorId: author_id,
      search,
      isFeatured: is_featured,
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

    const { count, blogs } = await blogService.getPublishedBlogs({
      categoryId: category_id,
      search,
      isFeatured: is_featured,
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

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment_view = 'false' } = req.query;

    const blog = await blogService.getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    const categories = await blogService.getCategoriesForIds(blog.category_ids);

    const response = {
      ...blog.toJSON(),
      categories,
    };

    if (increment_view === 'true') {
      response.views = await blogService.incrementBlogViews(blog);
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

    const blog = await blogService.getBlogBySlug(slug);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    const categories = await blogService.getCategoriesForIds(blog.category_ids);

    const response = {
      ...blog.toJSON(),
      categories,
    };

    if (increment_view === 'true') {
      response.views = await blogService.incrementBlogViews(blog);
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
    const updateData = { ...req.body };

    const currentUserId = req.user?.id;
    if (!currentUserId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để cập nhật bài viết',
      });
    }

    const blog = await blogService.findBlogForUpdate(id, transaction);
    if (!blog) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    delete updateData.author_id;

    // ✅ Parse category_ids thành integer array
    if (updateData.category_ids) {
      updateData.category_ids = updateData.category_ids.map((cid) =>
        parseInt(cid),
      );

      if (
        !Array.isArray(updateData.category_ids) ||
        updateData.category_ids.length === 0 ||
        updateData.category_ids.some(isNaN)
      ) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Phải chọn ít nhất 1 danh mục hợp lệ',
        });
      }

      const foundCategories = await blogService.findCategoriesByIds(
        updateData.category_ids,
        transaction,
      );

      if (foundCategories.length !== updateData.category_ids.length) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Một hoặc nhiều danh mục không tồn tại',
        });
      }
    }

    if (
      updateData.title &&
      (!updateData.slug || updateData.slug === blog.slug)
    ) {
      const newSlug = slugify(updateData.title, {
        lower: true,
        strict: true,
      });
      const existingBlog = await blogService.findBlogBySlugExcludingId(
        newSlug,
        id,
        transaction,
      );
      updateData.slug = existingBlog ? `${newSlug}-${Date.now()}` : newSlug;
    }

    if (updateData.status === 'published' && !blog.published_at) {
      updateData.published_at = new Date();
    } else if (updateData.status && updateData.status !== 'published') {
      updateData.published_at = null;
    }

    await blogService.applyBlogUpdate(blog, updateData, transaction);
    await transaction.commit();

    const updatedBlog = await blogService.getBlogWithAuthor(id);

    const categories = await blogService.getCategoriesForIds(
      updatedBlog.category_ids,
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: { ...updatedBlog.toJSON(), categories },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
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

    const blog = await blogService.softDeleteBlog(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

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

    const { count, blogs } = await blogService.getTrashedBlogs({
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

    const blog = await blogService.findBlogIncludingTrashed(id);
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

    await blogService.restoreBlogRecord(blog);

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

    const blog = await blogService.findBlogIncludingTrashed(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    await blogService.forceDeleteBlogRecord(blog);

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
