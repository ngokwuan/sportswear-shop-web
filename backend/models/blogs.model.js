// models/Blog.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Blog = sequelize.define(
  'Blog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    featured_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'blogs',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft delete
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: (blog) => {
        if (!blog.slug) {
          blog.slug = blog.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
        if (blog.status === 'published' && !blog.published_at) {
          blog.published_at = new Date();
        }
      },
      beforeUpdate: (blog) => {
        if (blog.status === 'published' && !blog.published_at) {
          blog.published_at = new Date();
        } else if (blog.status !== 'published') {
          blog.published_at = null;
        }
      },
    },
  }
);

// Associations will be defined in models/index.js
export default Blog;
