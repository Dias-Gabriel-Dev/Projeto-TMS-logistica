import { prisma } from '../prisma.js';
import { z } from 'zod';
import { registerSchema } from '../schemas/auth.schema.js';
import { loginSchema } from '../schemas/auth.schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

type RegisterInput = z.infer<typeof registerSchema>;

type LoginInput = z.infer<typeof loginSchema>;

const register = async (data: RegisterInput) => {
  const { name, email, password, role } = data;

  const existingEmail = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingEmail) {
    throw new AppError('Email já cadastrado no sistema', 409);
  }

  const hashPassowrd = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassowrd,
      role,
    },
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

const login = async (data: LoginInput) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError('Variável JWT_SECRET não está configurada no ambiente.', 401);
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, {
    expiresIn: '1d',
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export { register, login };
