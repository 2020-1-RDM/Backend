import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import jwtAuth from '../configs/jwt/auth';

// eslint-disable-next-line consistent-return
export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token needs to pass' });
  }

  const [, token] = authHeader.split(' ');
  try {
    const decoded = await promisify(jwt.verify)(token, jwtAuth.secret);
    req.cpf = decoded.cpf;
    req.email = decoded.email;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Token invalid' });
  }
};
