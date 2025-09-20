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

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

    // Cookie config cho cross-origin
    const cookieOptions = {
      httpOnly: true,
      maxAge: maxAge,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Quan trọng!
      path: '/',
    };

    res.cookie('jwt', token, cookieOptions);

    console.log(`✅ Login successful: ${email}`);
    console.log('🍪 Cookie options:', cookieOptions);

    const responseData = {
      message: 'Đăng nhập thành công!',
      rememberMe: rememberMe || false,
      accessToken: token, // Backup cho trường hợp cookie không work
      id: existUser.id,
      email: existUser.email,
      name: existUser.name,
      role: role,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng nhập',
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    console.log('✅ Logout successful');

    return res.status(200).json({
      message: 'Đăng xuất thành công!',
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng xuất',
    });
  }
};

export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        message: 'Guest',
        user: null,
        role: 'guest',
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'name', 'avatar', 'phone', 'address'],
    });

    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    return res.status(200).json({
      message: 'OK',
      user: {
        id: user.id,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        name: user.name,
        role: user.role,
        address: user.address,
      },
      role: user.role,
    });
  } catch (error) {
    console.error('❌ /auth/me error:', error);
    return res.status(500).json({ error: 'Có lỗi xảy ra khi xác thực' });
  }
};
