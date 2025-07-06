import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import bcrypt from 'bcrypt';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (event: RequestEvent) => {
	try {
		// Check if any users already exist
		const userCount = await prisma.user.count();
		
		if (userCount > 0) {
			return json({ error: 'Admin account already exists' }, { status: 403 });
		}

		const { email, password, name, department, phone } = await event.request.json();

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

		// Check if user already exists (shouldn't happen, but safety check)
		const existingUser = await prisma.user.findUnique({
			where: { email: email.toLowerCase() }
		});

		if (existingUser) {
			return json({ error: 'User with this email already exists' }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create admin user
		const newUser = await prisma.user.create({
			data: {
				email: email.toLowerCase(),
				name,
				passwordHash: hashedPassword,
				role: 'admin', // Always create as admin for first user
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
			},
			message: 'Admin account created successfully'
		});
	} catch (error) {
		console.error('Onboarding error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 