import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const nonSecurePath = ['/', '/auth/login', '/auth/register'];

export const createJWT = (payload) => {
  let key = process.env.JWT_SECRET;
  let token = null;
  try {
    token = jwt.sign(payload, key);
  } catch (error) {
    console.log(error);
  }
  return token;
};

export const verifyToken = (token) => {
  const key = process.env.JWT_SECRET;
  let decoded = null;
  try {
    decoded = jwt.verify(token, key);
  } catch (error) {
    console.log(error);
  }
  return decoded;
};

export const checkUserJWT = (req, res, next) => {
  if (nonSecurePath.includes(req.path)) return next();

  let cookies = req.cookies;
  if (cookies && cookies.jwt) {
    let token = cookies.jwt;
    let decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      next();
    } else {
      return res.status(401).json({
        message: 'Không xác thực được người dùng. Vui lòng đăng nhập',
      });
    }
  } else {
    return res.status(401).json({
      message: 'Không xác thực được người dùng. Vui lòng đăng nhập',
    });
  }
};

export const checkUserPermission = (req, res, next) => {
  if (nonSecurePath.includes(req.path) || req.path === '/auth/me')
    return next();

  //req.user dc gui tu middleware checkUserJWT nen co the dung duoc sau khi hoan thanh middleware checkUserJWT
  if (req.user) {
    let email = req.user.email;
    let roles = req.user.role;
    let currentURL = req.path;
    if (!roles || roles.length === 0) {
      return res.status(403).json({
        message: "You don't have permission to access this resource... ",
      });
    }
    if (roles === 'customer') {
      next();
    } else {
      return res.status(403).json({
        message: "You don't have permission to access this resource... ",
      });
    }
  } else {
    return res.status(401).json({
      message: 'Không xác thực được người dùng. Vui lòng đăng nhập',
    });
  }
};
