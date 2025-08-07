import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const createJWT = () => {
  let payload = { name: 'quan', address: 'binh dinh' };
  let key = process.env.JWT_SECRET;
  let token = null;
  try {
    token = jwt.sign(payload, key);
    console.log(token);
  } catch (error) {
    console.log(error);
  }
  return token;
};

export const verifyToken = (token) => {
  let key = process.env.JWT_SECRET;
  let data = null;
  try {
    let decoded = jwt.verify(token, key);
    data = decoded;
  } catch (error) {
    console.log(err);
  }
  return data;
};
