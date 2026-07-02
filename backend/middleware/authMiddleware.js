import jwt from 'jsonwebtoken';

export function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token admin tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carimakan_dev_secret');
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token admin tidak valid atau sudah expired' });
  }
}
