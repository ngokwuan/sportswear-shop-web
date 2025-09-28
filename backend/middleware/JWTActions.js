import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const nonSecurePaths = [
  '/auth/login',
  '/auth/register',
  '/auth/me',
  '/payment/vnpay/return',
  '/health',
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
    console.error(' Error creating JWT:', error);
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
      console.log(' Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log(' Invalid token');
    } else {
      console.error(' Token verification error:', error.message);
    }
    return null;
  }
};

export const checkUserJWT = (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) {
    return next();
  }

  let token = req.cookies?.jwt;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
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

export const optionalUserJWT = (req, res, next) => {
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
