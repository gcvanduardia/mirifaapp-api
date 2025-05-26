import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { poolPromise } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN! as jwt.SignOptions['expiresIn'];

export const register: RequestHandler = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Faltan campos requeridos' });
    return;
  }
  const pool = await poolPromise;
  // Verifica si el usuario ya existe
  const { recordset } = await pool.request()
    .input('email', email)
    .query('SELECT id FROM users WHERE email=@email');
  if (recordset.length > 0) {
    res.status(409).json({ error: 'El usuario ya existe' });
    return;
  }
  const password_hash = await bcrypt.hash(password, 10);
  await pool.request()
    .input('name', name)
    .input('email', email)
    .input('password_hash', password_hash)
    .input('role', role || 'user')
    .query('INSERT INTO users (name, email, password_hash, role) VALUES (@name, @email, @password_hash, @role)');
  res.status(201).json({ message: 'Usuario creado correctamente' });
  return;
};

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