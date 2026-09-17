import User from '../models/users.model.js';
import { Op } from 'sequelize';

export const getUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

export const getUserByEmailBasic = async (email) => {
  return User.findOne({
    where: { email },
    attributes: ['id', 'name', 'email', 'role'],
  });
};

export const getUserProfile = async (userId) => {
  return User.findByPk(userId, {
    attributes: ['id', 'email', 'role', 'name', 'avatar', 'phone', 'address'],
  });
};

export const getUserById = async (userId) => {
  return User.findByPk(userId, {
    attributes: [
      'id',
      'name',
      'email',
      'role',
      'avatar',
      'created_at',
      'phone',
      'address',
    ],
  });
};

export const getUserRoleByEmail = async (email) => {
  const user = await User.findOne({
    where: { email },
    attributes: ['role'],
    raw: true,
  });
  return user ? user.role : null;
};

export const getAllUsers = async () => {
  return User.findAll();
};

export const getDeletedUsers = async () => {
  return User.findAll({
    where: {
      deleted_at: { [Op.ne]: null },
    },
    paranoid: false,
  });
};

export const createUser = async ({
  fullName,
  email,
  password,
  phone,
  role = 'customer',
}) => {
  const newUser = await User.create({
    name: fullName,
    email,
    password,
    phone,
    role,
  });

  const { password: _, ...userWithoutPassword } = newUser.toJSON();
  return userWithoutPassword;
};

export const findUserForUpdate = async (id) => {
  return User.findByPk(id);
};

export const applyUserUpdate = async (user, updateFields) => {
  await user.update(updateFields);
  return getUserById(user.id);
};

export const softDeleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return user;
};

export const forceDeleteUser = async (id) => {
  const user = await User.findByPk(id, { paranoid: false });
  if (!user) return null;
  await user.destroy({ force: true });
  return user;
};

export const restoreUser = async (id) => {
  const restored = await User.restore({ where: { id } });
  return restored;
};
