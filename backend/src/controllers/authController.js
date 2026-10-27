import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as userModel from '../models/userModel.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

const toToken = (user) =>
  signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    fullName: user.full_name,
  });

const publicUser = (user) => ({
  id: user.id,
  role: user.role,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
});

/** POST /api/auth/register — always creates a patient account. */
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  const existing = await userModel.findByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(password);
  const user = await userModel.createUser({
    role: 'patient',
    fullName,
    email,
    passwordHash,
    phone,
  });

  res.status(201).json({ token: toToken(user), user: publicUser(user) });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user || !user.is_active) throw ApiError.unauthorized('Invalid email or password');

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  res.json({ token: toToken(user), user: publicUser(user) });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user: publicUser(user) });
});
