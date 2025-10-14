import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Products = sequelize.define(
  'Products',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    size: {
      type: DataTypes.ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    featured_image: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('featured_image');
        if (!rawValue) return null;
        if (typeof rawValue === 'object') return rawValue;

        if (typeof rawValue === 'string') {
          if (
            rawValue.startsWith('http://') ||
            rawValue.startsWith('https://')
          ) {
            return { url: rawValue, publicId: null };
          }

          try {
            return JSON.parse(rawValue);
          } catch (error) {
            return { url: rawValue, publicId: null };
          }
        }

        return null;
      },
      set(value) {
        if (!value) {
          this.setDataValue('featured_image', null);
          return;
        }

        if (typeof value === 'object') {
          this.setDataValue('featured_image', value);
        } else if (typeof value === 'string') {
          this.setDataValue('featured_image', value);
        } else {
          this.setDataValue('featured_image', null);
        }
      },
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('images');
        if (!rawValue) return [];
        if (Array.isArray(rawValue)) return rawValue;

        if (typeof rawValue === 'string') {
          try {
            const parsed = JSON.parse(rawValue);
            return Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            return [];
          }
        }

        return [];
      },
      set(value) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          this.setDataValue('images', []);
          return;
        }

        if (Array.isArray(value)) {
          this.setDataValue('images', value);
        } else {
          this.setDataValue('images', []);
        }
      },
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    star: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

export default Products;
