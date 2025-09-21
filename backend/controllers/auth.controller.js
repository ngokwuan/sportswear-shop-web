// import dotenv from 'dotenv';
// import { createJWT } from '../middleware/JWTActions.js';
// import User from '../models/users.model.js';
// import { getRoleByEmail } from '../services/jwt.service.js';
// dotenv.config();

// export const login = async (req, res) => {
//   try {
//     const { email, password, rememberMe } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         error: 'Vui lòng nhập email và mật khẩu',
//       });
//     }

//     const existUser = await User.findOne({
//       where: { email: email },
//     });

//     if (!existUser) {
//       return res.status(401).json({
//         error: 'Email hoặc mật khẩu không đúng',
//       });
//     }

//     const isValidPassword = await existUser.checkPassword(password);
//     if (!isValidPassword) {
//       return res.status(401).json({
//         error: 'Mật khẩu không chính xác',
//       });
//     }

//     const role = await getRoleByEmail(email);
//     const payload = {
//       id: existUser.id,
//       email: existUser.email,
//       role,
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     };
//     const token = createJWT(payload);

//     const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
//     res.cookie('jwt', token, {
//       httpOnly: true,
//       maxAge: maxAge,
//       sameSite: 'strict',
//       secure: process.env.NODE_ENV === 'production',
//     });

//     const responseData = {
//       message: 'Đăng nhập thành công!',
//       rememberMe: rememberMe || false,
//       accessToken: token,
//       id: existUser.id,
//       email: existUser.email,
//       name: existUser.name,
//       role: role,
//     };

//     return res.status(200).json(responseData);
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({
//       error: 'Có lỗi xảy ra khi đăng nhập',
//     });
//   }
// };

// export const logout = async (req, res) => {
//   try {
//     res.clearCookie('jwt', {
//       httpOnly: true,
//       sameSite: 'strict',
//     });
//     return res.status(200).json({
//       message: 'Đăng xuất thành công!',
//     });
//   } catch (error) {
//     console.error('Có lỗi xảy ra khi đăng xuất:', error);
//     return res.status(500).json({
//       error: 'Có lỗi xảy ra khi đăng xuất',
//     });
//   }
// };

// export const me = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(200).json({
//         message: 'Guest',
//         user: null,
//         role: 'guest',
//       });
//     }

//     const user = await User.findByPk(req.user.id, {
//       attributes: ['id', 'email', 'role', 'name', 'avatar', 'phone', 'address'],
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'Người dùng không tồn tại' });
//     }

//     return res.status(200).json({
//       message: 'OK',
//       user: {
//         id: user.id,
//         email: user.email,
//         avatar: user.avatar,
//         phone: user.phone,
//         name: user.name,
//         role: user.role,
//         address: user.address,
//       },
//       role: user.role,
//     });
//   } catch (error) {
//     console.error('Error in /auth/me:', error);
//     return res.status(500).json({ error: 'Có lỗi xảy ra khi xác thực' });
//   }
// };

import dotenv from 'dotenv';
import { createJWT } from '../middleware/JWTActions.js';
import User from '../models/users.model.js';
import { getRoleByEmail } from '../services/jwt.service.js';

dotenv.config();

// Helper function để tạo cookie options
const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: process.env.COOKIE_HTTP_ONLY !== 'false', // Default true
    maxAge: maxAge,
    sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),
    secure: process.env.COOKIE_SECURE === 'true' || isProduction,
    // Không set domain để browser tự handle cross-origin
    path: '/', // Explicit path
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
      iat: Math.floor(Date.now() / 1000), // Issued at time
    };

    const token = createJWT(payload);
    if (!token) {
      return res.status(500).json({
        error: 'Không thể tạo token xác thực',
      });
    }

    // Thời gian sống của cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 24 hours

    // Tạo cookie với options phù hợp
    const cookieOptions = getCookieOptions(maxAge);
    res.cookie('jwt', token, cookieOptions);

    // Log để debug (chỉ trong development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🍪 Setting cookie with options:', cookieOptions);
      console.log('🔑 JWT payload:', {
        ...payload,
        token: token.substring(0, 20) + '...',
      });
    }

    const responseData = {
      message: 'Đăng nhập thành công!',
      success: true,
      rememberMe: rememberMe || false,
      accessToken: token, // Gửi token về frontend để có thể lưu vào localStorage nếu cần
      user: {
        id: existUser.id,
        email: existUser.email,
        name: existUser.name,
        role: role,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng nhập',
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear cookie với same options như khi set
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

    // Debug log
    if (process.env.NODE_ENV !== 'production') {
      console.log('🗑️ Clearing cookie with options:', cookieOptions);
    }

    return res.status(200).json({
      message: 'Đăng xuất thành công!',
      success: true,
    });
  } catch (error) {
    console.error('❌ Error during logout:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng xuất',
    });
  }
};

export const me = async (req, res) => {
  try {
    // Debug: Log token từ các nguồn khác nhau
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '🔍 Checking auth - Cookie JWT:',
        req.cookies?.jwt ? 'Present' : 'Missing'
      );
      console.log(
        '🔍 Authorization header:',
        req.headers.authorization ? 'Present' : 'Missing'
      );
      console.log('🔍 User from middleware:', req.user ? 'Present' : 'Missing');
    }

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
      // User không tồn tại trong DB, clear cookie
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
    console.error('❌ Error in /auth/me:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi xác thực',
      authenticated: false,
    });
  }
};

// Endpoint để refresh token
export const refreshToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Token không hợp lệ',
      });
    }

    // Tạo token mới
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

    // Set cookie mới
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cookieOptions = getCookieOptions(maxAge);
    res.cookie('jwt', newToken, cookieOptions);

    return res.status(200).json({
      message: 'Token đã được làm mới',
      success: true,
      accessToken: newToken,
    });
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi làm mới token',
    });
  }
};
