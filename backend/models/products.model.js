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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('featured_image');

        // If null or undefined, return null
        if (!rawValue) return null;

        // If already an object, return it
        if (typeof rawValue === 'object') {
          return rawValue;
        }

        // If it's a string, try to parse it
        if (typeof rawValue === 'string') {
          // Check if it's already a URL (legacy data)
          if (
            rawValue.startsWith('http://') ||
            rawValue.startsWith('https://')
          ) {
            return { url: rawValue, publicId: null };
          }

          // Try to parse JSON
          try {
            const parsed = JSON.parse(rawValue);
            return parsed;
          } catch (error) {
            // If parsing fails, return as plain URL
            console.warn(
              'Failed to parse featured_image, treating as URL:',
              rawValue
            );
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

        // Store as JSON string
        if (typeof value === 'object') {
          this.setDataValue('featured_image', JSON.stringify(value));
        } else if (typeof value === 'string') {
          this.setDataValue('featured_image', value);
        } else {
          this.setDataValue('featured_image', null);
        }
      },
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('images');

        // If null or undefined, return empty array
        if (!rawValue) return [];

        // If already an array, return it
        if (Array.isArray(rawValue)) {
          return rawValue;
        }

        // If it's a string, try to parse it
        if (typeof rawValue === 'string') {
          // Try to parse JSON
          try {
            const parsed = JSON.parse(rawValue);
            return Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            console.warn('Failed to parse images, returning empty array');
            return [];
          }
        }

        return [];
      },
      set(value) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          this.setDataValue('images', null);
          return;
        }

        // Store as JSON string
        if (Array.isArray(value)) {
          this.setDataValue('images', JSON.stringify(value));
        } else {
          this.setDataValue('images', null);
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
