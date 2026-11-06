import prisma from '../config/db.js';

export async function create(data) {
  try {
    const newUser = await prisma.user.create({
      data: data,
      omit: { password: true },
    });
    return newUser;
  } catch (error) {
    if (error.code === 'P2002') {
      return null;
    }
    throw error;
  }
}

export async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}
