import User from '../models/users.model.js';
export const getRoleByEmail = async (email) => {
  const role = await User.findOne({
    where: { email },
    attributes: ['role'],
  });
  return role ? role : null;
};
