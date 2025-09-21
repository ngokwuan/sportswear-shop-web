// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// dotenv.config();
// const nonSecurePaths = [
//   '/auth/login',
//   '/auth/register',
//   '/payment/vnpay/return',
// ];
// export const createJWT = (payload) => {
//   try {
//     return jwt.sign(payload, process.env.JWT_SECRET);
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };

// export const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET);
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };

// // Middleware bắt buộc phải có token
// export const checkUserJWT = (req, res, next) => {
//   if (nonSecurePaths.includes(req.path)) {
//     return next();
//   }
//   const token = req.cookies?.jwt;
//   if (!token) {
//     return res.status(401).json({ error: 'Vui lòng đăng nhập' });
//   }

//   const decoded = verifyToken(token);
//   if (!decoded) {
//     return res.status(401).json({ error: 'Token không hợp lệ hoặc hết hạn' });
//   }

//   req.user = decoded;
//   next();
// };

// // Middleware tùy chọn - không bắt buộc phải có token
// export const optionalUserJWT = (req, res, next) => {
//   const token = req.cookies?.jwt;

//   if (token) {
//     const decoded = verifyToken(token);
//     if (decoded) {
//       req.user = decoded;
//     }
//   }

//   next();
// };

// export const checkUserPermission = (roles = []) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Vui lòng đăng nhập' });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
//     }

//     next();
//   };
// };

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const nonSecurePaths = [
  '/auth/login',
  '/auth/register',
  '/auth/me', // Cho phép truy cập /me để check auth status
  '/payment/vnpay/return',
  '/health', // Health check endpoint
];

export const createJWT = (payload) => {
  try {
    const options = {
      expiresIn: payload.expiresIn || process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'sportswear-shop',
      audience: 'sportswear-users',
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
  } catch (error) {
    console.error('❌ Error creating JWT:', error);
    return null;
  }
};

export const verifyToken = (token) => {
  try {
    const options = {
      issuer: 'sportswear-shop',
      audience: 'sportswear-users',
    };

    return jwt.verify(token, process.env.JWT_SECRET, options);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('⏰ Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('🔒 Invalid token');
    } else {
      console.error('❌ Token verification error:', error.message);
    }
    return null;
  }
};

// Middleware bắt buộc phải có token
export const checkUserJWT = (req, res, next) => {
  // Skip authentication cho các path không cần bảo mật
  if (nonSecurePaths.includes(req.path)) {
    return next();
  }

  // Lấy token từ cookie hoặc Authorization header
  let token = req.cookies?.jwt;

  // Fallback: lấy từ Authorization header nếu không có cookie
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Debug log
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 Auth check for:', req.path);
    console.log('🍪 Cookie token:', req.cookies?.jwt ? 'Present' : 'Missing');
    console.log(
      '📋 Auth header:',
      req.headers.authorization ? 'Present' : 'Missing'
    );
    console.log('🎫 Final token:', token ? 'Present' : 'Missing');
  }

  if (!token) {
    return res.status(401).json({
      error: 'Vui lòng đăng nhập',
      code: 'NO_TOKEN',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: 'Token không hợp lệ hoặc hết hạn',
      code: 'INVALID_TOKEN',
    });
  }

  req.user = decoded;
  next();
};

// Middleware tùy chọn - không bắt buộc phải có token
export const optionalUserJWT = (req, res, next) => {
  // Lấy token từ cookie hoặc Authorization header
  let token = req.cookies?.jwt;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

export const checkUserPermission = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Vui lòng đăng nhập',
        code: 'NO_USER',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập',
        code: 'INSUFFICIENT_PERMISSION',
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Middleware để log JWT info (debug purposes)
export const logJWTInfo = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && req.user) {
    console.log('👤 User info from JWT:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      iat: new Date(req.user.iat * 1000).toISOString(),
      exp: req.user.exp
        ? new Date(req.user.exp * 1000).toISOString()
        : 'No expiry',
    });
  }
  next();
};
