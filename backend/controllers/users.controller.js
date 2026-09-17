import * as userService from '../services/users.service.js';
import { filterFields } from '../utils/filterFields.js';

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được người dùng' });
  }
};

export const getUserTrash = async (req, res) => {
  try {
    const users = await userService.getDeletedUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được người dùng' });
  }
};

export const createUsers = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    const userWithoutPassword = await userService.createUser({
      fullName,
      email,
      password,
      phone,
      role,
    });

    res.status(201).json({
      message: 'Đăng kí thành công!',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors.map((err) => err.message),
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Email này đã được sử dụng',
      });
    }

    res.status(500).json({
      error: 'Có lỗi xảy ra khi thêm người dùng',
    });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, avatar, role } = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'ID người dùng không được cung cấp',
      });
    }

    const user = await userService.findUserForUpdate(id);

    if (!user) {
      return res.status(404).json({
        error: 'Người dùng không tồn tại',
      });
    }

    // Kiểm tra quyền
    if (req.user && req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Bạn không có quyền cập nhật thông tin người dùng này',
      });
    }

    // Chỉ admin mới được thay đổi role
    let updateFields = {
      name,
      phone,
      address,
      avatar,
    };

    if (req.user && req.user.role === 'admin' && role) {
      updateFields.role = role;
    }

    updateFields = filterFields(updateFields);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        error: 'Không có dữ liệu để cập nhật',
      });
    }

    const updatedUser = await userService.applyUserUpdate(user, updateFields);

    return res.status(200).json({
      message: 'Cập nhật người dùng thành công',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors.map((err) => err.message),
      });
    }

    res.status(500).json({
      error: 'Không thể cập nhật người dùng',
      details: error.message,
    });
  }
};

export const softDeleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.softDeleteUser(id);
    if (!user) {
      return res.status(404).json({
        error: 'Người dùng không tồn tại',
      });
    }
    res.json({ message: 'Xóa người dùng thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá mềm người dùng' });
  }
};

export const forceDeleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.forceDeleteUser(id);
    if (!user) {
      return res.status(404).json({
        error: 'Người dùng không tồn tại',
      });
    }
    res.json({ message: 'Xóa vĩnh viễn người dùng thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá vĩnh viễn người dùng' });
  }
};

export const restoreUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await userService.restoreUser(id);
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
