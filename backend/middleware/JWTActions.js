import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const nonSecurePaths = [
  '/auth/login',
  '/auth/register',
  '/payment/vnpay/return',
];
export const createJWT = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Middleware bắt buộc phải có token
export const checkUserJWT = (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) {
    return next();
  }
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc hết hạn' });
  }

  req.user = decoded;
  next();
};

// Middleware tùy chọn - không bắt buộc phải có token
export const optionalUserJWT = (req, res, next) => {
  const token = req.cookies?.jwt;

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
      return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }

    next();
  };
};
