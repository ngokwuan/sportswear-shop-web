import Users from '../models/users.model.js';
import { Op } from 'sequelize';
import { filterFields } from '../utils/filterFields.js';

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được người dùng' });
  }
};
export const getUserTrash = async (req, res) => {
  try {
    const users = await Users.findAll({
      where: {
        deleted_at: {
          [Op.ne]: null,
        },
      },
      paranoid: false,
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được người dùng' });
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await Users.findOne({
      where: { email: email },
      attributes: ['id', 'name', 'email', 'role'],
    });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await Users.findByPk(userId, {
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
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

export const createUsers = async (req, res) => {
  try {
    const { fullName, email, password, phone, role = 'customer' } = req.body;

    const newUser = await Users.create({
      name: fullName,
      email,
      password,
      phone,
      role,
    });

    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      message: 'Thêm người dùng thành công!',
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
    console.log('=== UPDATE USERS DEBUG ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request user (from JWT):', req.user);

    const { id } = req.params;
    const { name, phone, address, avatar, role } = req.body; // Thêm role vào đây

    if (!id) {
      return res.status(400).json({
        error: 'ID người dùng không được cung cấp',
      });
    }

    console.log('Finding user with ID:', id);
    const user = await Users.findByPk(id);

    if (!user) {
      console.log('User not found with ID:', id);
      return res.status(404).json({
        error: 'Người dùng không tồn tại',
      });
    }

    console.log('Found user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Kiểm tra quyền
    if (req.user && req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      console.log(
        'Permission denied. User ID:',
        req.user.id,
        'Target ID:',
        id,
        'User role:',
        req.user.role
      );
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

    // Thêm role vào updateFields nếu user hiện tại là admin
    if (req.user && req.user.role === 'admin' && role) {
      updateFields.role = role;
    }

    console.log('Update fields before filtering:', updateFields);

    updateFields = filterFields(updateFields);

    console.log('Update fields after filtering:', updateFields);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        error: 'Không có dữ liệu để cập nhật',
      });
    }

    console.log('Updating user...');
    await user.update(updateFields);
    console.log('Update completed successfully');

    const updatedUser = await Users.findByPk(id, {
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

    console.log('Updated user data:', updatedUser.toJSON());

    return res.status(200).json({
      message: 'Cập nhật người dùng thành công',
      user: updatedUser,
    });
  } catch (error) {
    console.error('=== UPDATE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

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

// export const updateUsers = async (req, res) => {
//   try {
//     console.log('=== UPDATE USERS DEBUG ===');
//     console.log('Request params:', req.params);
//     console.log('Request body:', req.body);
//     console.log('Request user (from JWT):', req.user);

//     const { id } = req.params;
//     const { name, phone, address, avatar } = req.body;

//     if (!id) {
//       return res.status(400).json({
//         error: 'ID người dùng không được cung cấp',
//       });
//     }

//     console.log('Finding user with ID:', id);
//     const user = await Users.findByPk(id);

//     if (!user) {
//       console.log('User not found with ID:', id);
//       return res.status(404).json({
//         error: 'Người dùng không tồn tại',
//       });
//     }

//     console.log('Found user:', {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });

//     if (req.user && req.user.id !== parseInt(id) && req.user.role !== 'admin') {
//       console.log(
//         'Permission denied. User ID:',
//         req.user.id,
//         'Target ID:',
//         id,
//         'User role:',
//         req.user.role
//       );
//       return res.status(403).json({
//         error: 'Bạn không có quyền cập nhật thông tin người dùng này',
//       });
//     }

//     let updateFields = {
//       name,
//       phone,
//       address,
//       avatar,
//     };

//     console.log('Update fields before filtering:', updateFields);

//     updateFields = filterFields(updateFields);

//     console.log('Update fields after filtering:', updateFields);

//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({
//         error: 'Không có dữ liệu để cập nhật',
//       });
//     }

//     console.log('Updating user...');
//     await user.update(updateFields);
//     console.log('Update completed successfully');

//     const updatedUser = await Users.findByPk(id, {
//       attributes: [
//         'id',
//         'name',
//         'email',
//         'role',
//         'avatar',
//         'created_at',
//         'phone',
//         'address',
//       ],
//     });

//     console.log('Updated user data:', updatedUser.toJSON());

//     return res.status(200).json({
//       message: 'Cập nhật người dùng thành công',
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error('=== UPDATE ERROR ===');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);

//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         error: 'Dữ liệu không hợp lệ',
//         details: error.errors.map((err) => err.message),
//       });
//     }

//     res.status(500).json({
//       error: 'Không thể cập nhật người dùng',
//       details: error.message,
//     });
//   }
// };
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
