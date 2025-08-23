import slugify from 'slugify';
import Users from '../models/users.model.js';
import { filterFields } from '../utils/filterFields.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được người dùng' });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, address, role, avatar } = req.body;
    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Người dùng không tồn tại',
      });
    }
    let updateFields = {
      name,
      email,
      password,
      phone,
      address,
      role,
      avatar,
    };

    updateFields = filterFields(updateFields);

    await user.update(updateFields);
    return res.status(200).json({
      message: 'Cập nhâp người dùng thành công ',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật người dùng' });
  }
};

export const softDeleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Người dùng không tồn tại',
      });
    }
    await user.destroy();
    res.json({ message: 'Xóa người dùng thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá mềm người dùng' });
  }
};

export const forceDeleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id, { paranoid: false });
    if (!user) {
      return res.status(404).json({
        error: 'Người dùng không tồn tại',
      });
    }
    await user.destroy({ force: true });
    res.json({ message: 'Xóa vĩnh viễn người dùng thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá vĩnh viễn người dùng' });
  }
};

export const restoreUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Users.restore({ where: { id } });
    if (!restored) {
      return res
        .status(404)
        .json({ error: 'Không tìm thấy người dùng để khôi phục' });
    }
    res.json({ message: 'Khôi phục người dùng thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể khôi phục người dùng' });
  }
};
