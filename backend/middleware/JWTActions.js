import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// const nonSecurePath = ['/auth/login', '/auth/register', '/auth/me'];

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

export const checkUserJWT = (req, res, next) => {
  // if (nonSecurePath.some((path) => req.originalUrl.startsWith(path))) {
  //   return next();
  // }

  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }

  req.user = decoded;
  next();
};

export const checkUserPermission = (roles = []) => {
  return (req, res, next) => {
    // if (nonSecurePath.some((path) => req.originalUrl.startsWith(path))) {
    //   return next();
    // }

    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    next();
  };
};
