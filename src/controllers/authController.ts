import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { poolPromise } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN! as jwt.SignOptions['expiresIn'];

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const pool = await poolPromise;
  const { recordset } = await pool.request()
    .input('email', email)
    .query(`SELECT id, name, email, password_hash, role FROM users WHERE email=@email`);
  const user = recordset[0];
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }
  const payload = { sub: user.id, name: user.name, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
  res.json({ token });
};

export const me: RequestHandler = (_req, res) => {
  const { sub: id, name, role } = (_req as any).user;
  res.json({ id, name, role });
};