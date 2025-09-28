import dotenv from 'dotenv';
import { createJWT } from '../middleware/JWTActions.js';
import User from '../models/users.model.js';
import { getRoleByEmail } from '../services/jwt.service.js';

dotenv.config();

const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: process.env.COOKIE_HTTP_ONLY !== 'false',
    maxAge: maxAge,
    sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),
    secure: process.env.COOKIE_SECURE === 'true' || isProduction,
    path: '/',
  };
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

    const role = await getRoleByEmail(email);
    const payload = {
      id: existUser.id,
      email: existUser.email,
      role,
      expiresIn: process.env.JWT_EXPIRES_IN,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = createJWT(payload);
    if (!token) {
      return res.status(500).json({
        error: 'Không thể tạo token xác thực',
      });
    }

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    const cookieOptions = getCookieOptions(maxAge);
    res.cookie('jwt', token, cookieOptions);

    const responseData = {
      message: 'Đăng nhập thành công!',
      success: true,
      rememberMe: rememberMe || false,
      accessToken: token,
      user: {
        id: existUser.id,
        email: existUser.email,
        name: existUser.name,
        role: role,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(' Error during login:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng nhập',
    });
  }
};

export const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: process.env.COOKIE_HTTP_ONLY !== 'false',
      sameSite:
        process.env.COOKIE_SAME_SITE ||
        (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
      secure:
        process.env.COOKIE_SECURE === 'true' ||
        process.env.NODE_ENV === 'production',
      path: '/',
    };

    res.clearCookie('jwt', cookieOptions);

    return res.status(200).json({
      message: 'Đăng xuất thành công!',
      success: true,
    });
  } catch (error) {
    console.error(' Error during logout:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng xuất',
    });
  }
};

export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        message: 'Guest user',
        user: null,
        role: 'guest',
        authenticated: false,
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'name', 'avatar', 'phone', 'address'],
    });

    if (!user) {
      res.clearCookie('jwt', getCookieOptions(0));
      return res.status(401).json({
        error: 'Người dùng không tồn tại',
        authenticated: false,
      });
    }

    return res.status(200).json({
      message: 'Authenticated',
      success: true,
      authenticated: true,
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
    console.error('Error in /auth/me:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi xác thực',
      authenticated: false,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Token không hợp lệ',
      });
    }

    const payload = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      expiresIn: process.env.JWT_EXPIRES_IN,
      iat: Math.floor(Date.now() / 1000),
    };

    const newToken = createJWT(payload);
    if (!newToken) {
      return res.status(500).json({
        error: 'Không thể tạo token mới',
      });
    }

    const maxAge = 24 * 60 * 60 * 1000;
    const cookieOptions = getCookieOptions(maxAge);
    res.cookie('jwt', newToken, cookieOptions);

    return res.status(200).json({
      message: 'Token đã được làm mới',
      success: true,
      accessToken: newToken,
    });
  } catch (error) {
    console.error(' Error refreshing token:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi làm mới token',
    });
  }
};
