import dotenv from 'dotenv';
import { createJWT } from '../middleware/JWTActions.js';
import User from '../models/users.model.js';
import { getRoleByEmail } from '../services/jwt.service.js';
dotenv.config();



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
    const role = await getRoleByEmail(email);
    const payload = {
      id: existUser.id,
      email: existUser.email,
      role,
      expiresIn: process.env.JWT_EXPIRES_IN,
    };
    const token = createJWT(payload);

    //set cookie
    if (isValidPassword) {
      res.cookie('jwt', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    }
    const responseData = {
      message: 'Đăng nhập thành công!',
      rememberMe: rememberMe || false,
      accessToken: token,
      id: existUser.id,
      email: existUser.email,
      name: existUser.name,
      role: role,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng nhập',
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict',
    });
    return res.status(200).json({
      message: 'Đăng xuất thành công!',
    });
  } catch (error) {
    console.error('Có lỗi xảy ra khi đăng xuất:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng xuất',
    });
  }
};
export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(500).json({
        error: 'Không tìm thấy thông tin người dùng',
      });
    }
    const existUser = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'name'],
    });
    if (!existUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại ' });
    }
    return res.status(200).json({
      message: 'Token hợp lệ',
      ...existUser.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi xác thực',
    });
  }
};
