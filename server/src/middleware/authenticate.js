import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticate(request, response, next) {
  try {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      return response.status(401).json({ success: false, message: 'Authentication is required.' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured. Add it to server/.env.');
    }

    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(sub);

    if (!user) {
      return response.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    request.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    return next(error);
  }
}
