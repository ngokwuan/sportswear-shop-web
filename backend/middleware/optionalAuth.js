import { verifyToken } from './JWTActions.js';
export const optionalAuth = (req, _res, next) => {
  const token = req.cookies?.jwt;
  if (!token) return next();
  const decoded = verifyToken(token);
  if (decoded) req.user = decoded;
  return next();
};
