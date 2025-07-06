import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import bcrypt from 'bcrypt';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		const { email, password, name, role, department, phone } = await event.request.json();

		if (!email || !password || !name) {
			return json({ error: 'Email, password, and name are required' }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: email.toLowerCase() }
		});

		if (existingUser) {
			return json({ error: 'User with this email already exists' }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const newUser = await prisma.user.create({
			data: {
				email: email.toLowerCase(),
				name,
				passwordHash: hashedPassword,
				role: role || 'user',
				department,
				phone
			}
		});

		// Create user key for authentication
		await prisma.userKey.create({
			data: {
				id: `email:${email.toLowerCase()}`,
				userId: newUser.id,
				hashedPassword
			}
		});

		return json({
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: newUser.role,
				department: newUser.department,
				phone: newUser.phone
			}
		});
	} catch (error) {
		console.error('Create user error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 