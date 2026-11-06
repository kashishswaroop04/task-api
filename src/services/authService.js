import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { create, findByEmail } from '../repositories/userRepo.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export async function signUp(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await create({ email, password: hashedPassword });
  if (newUser) {
    return newUser;
  } else {
    const err = new Error('Email has already been used');
    err.status = 409;
    throw err;
  }
}

export async function logIn(email, password) {
  const user = await findByEmail(email);
  const invalidCredentialsError = new Error('Invalid credentials');
  invalidCredentialsError.status = 401;

  if (!user) {
    throw invalidCredentialsError;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw invalidCredentialsError;
  }

  const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  return accessToken;
}
