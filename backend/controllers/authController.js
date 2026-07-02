import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

function createToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
    process.env.JWT_SECRET || 'carimakan_dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ? LIMIT 1', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const admin = rows[0];
    const passwordHash = admin.password_hash || '';
    const validPassword = passwordHash.startsWith('$2')
      ? await bcrypt.compare(password, passwordHash)
      : password === passwordHash;

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const token = createToken(admin);

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function profile(req, res) {
  res.json({
    success: true,
    data: req.admin,
  });
}
