import bcrypt from 'bcrypt';

export async function verifyPassword(password: string, hash: string) {
	return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
	return bcrypt.hash(password, 10);
} 