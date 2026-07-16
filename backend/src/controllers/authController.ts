import { Request, Response } from 'express';
import { User } from '../models/User';
import { signToken } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role ?? 'candidate',
    company: input.company,
  });

  const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);

  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user || !(await user.comparePassword(input.password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.auth!.userId);
  if (!user) throw new AppError(404, 'User not found');
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, company: user.company });
}
