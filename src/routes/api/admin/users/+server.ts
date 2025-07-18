import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import bcrypt from 'bcrypt';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		console.log('GET /api/admin/users called');
		
		// Check if current user is admin
		await requireAdmin(event);

		// Get all users
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				department: true,
				phone: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		console.log('Found users:', users.length);
		return json(users);
	} catch (error) {
		console.error('Get users error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		const body = await event.request.json();
		console.log('Received user creation request:', body);

		const { email, password, name, role, department, phone } = body;

		if (!email || !password || !name) {
			return json({ error: 'Email, password, and name are required' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate password strength
		if (password.length < 8) {
			return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
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

		console.log('User created successfully:', newUser.id);

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