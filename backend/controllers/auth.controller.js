import User from '../models/users.model.js';

export const create = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const newUser = await User.create({
      name: fullName,
      email,
      password,
      phone,
      role: 'customer',
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

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Vui lòng nhập email và mật khẩu',
      });
    }

    const existUser = await User.findOne({
      where: { email: email },
    });

    if (!existUser) {
      return res.status(401).json({
        error: 'Email hoặc mật khẩu không đúng',
      });
    }

    const isValidPassword = await existUser.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Mật khẩu không chính xác',
      });
    }

    const { password: _, ...userWithoutPassword } = existUser.toJSON();

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      user: userWithoutPassword,
      rememberMe: rememberMe || false,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng nhập',
    });
  }
};
