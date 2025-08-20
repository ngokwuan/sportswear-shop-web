import User from '../models/users.model.js';

export const show = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Không lấy được người dùng' });
  }
};
