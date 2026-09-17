import {
  getUserByEmail,
  getUserRoleByEmail,
} from '../services/users.service.js';

export const verifyPassword = async (existUser, password) => {
  return existUser.checkPassword(password);
};

export const loginAccount = async (email, password) => {
  const existUser = await getUserByEmail(email);
  if (!existUser) {
    return { error: 'USER_NOT_FOUND' };
  }

  const isValidPassword = await verifyPassword(existUser, password);
  if (!isValidPassword) {
    return { error: 'INVALID_PASSWORD' };
  }

  const role = await getUserRoleByEmail(email);

  return { user: existUser, role };
};
