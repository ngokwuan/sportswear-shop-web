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
    category_ids: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidArray(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('Phải chọn ít nhất 1 danh mục');
          }
        },
      },
      get() {
        const rawValue = this.getDataValue('category_ids');
        // Đảm bảo luôn trả về array
        if (!rawValue) return [];
        if (Array.isArray(rawValue)) return rawValue;

        // Nếu là string, parse nó
        if (typeof rawValue === 'string') {
          try {
            const parsed = JSON.parse(rawValue);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }

        return [];
      },
      set(value) {
        if (!value) {
          this.setDataValue('category_ids', []);
          return;
        }

        // Nếu là array, lưu trực tiếp (MySQL sẽ tự convert sang JSON)
        if (Array.isArray(value)) {
          this.setDataValue('category_ids', value);
        } else {
          this.setDataValue('category_ids', []);
        }
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
      get() {
        const rawValue = this.getDataValue('tags');
        if (!rawValue) return [];
        if (Array.isArray(rawValue)) return rawValue;

        if (typeof rawValue === 'string') {
          try {
            const parsed = JSON.parse(rawValue);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }

        return [];
      },
      set(value) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          this.setDataValue('tags', []);
          return;
        }

        if (Array.isArray(value)) {
          this.setDataValue('tags', value);
        } else {
          this.setDataValue('tags', []);
        }
      },
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    paranoid: true,
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: (blog) => {
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

export default Blog;
