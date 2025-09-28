import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 30000,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('cod', 'bank_transfer', 'momo'),
      defaultValue: 'cod',
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['order_number'] },
    ],
  }
);

Order.beforeCreate(async (order) => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  order.order_number = `SW${timestamp}${randomNum}`;
});

export default Order;
