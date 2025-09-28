import User from '../models/users.model.js';

export const getRoleByEmail = async (email) => {
  const user = await User.findOne({
    where: { email },
    attributes: ['role'],
    raw: true,
  });
  return user ? user.role : null;
};
