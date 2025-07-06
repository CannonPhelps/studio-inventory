import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import bcrypt from 'bcrypt';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		const userId = event.params.id;
		const { email, name, role, department, phone, password } = await event.request.json();

		if (!email || !name) {
			return json({ error: 'Email and name are required' }, { status: 400 });
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!existingUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check if email is already taken by another user
		const emailExists = await prisma.user.findFirst({
			where: {
				email: email.toLowerCase(),
				id: { not: userId }
			}
		});

		if (emailExists) {
			return json({ error: 'Email is already taken by another user' }, { status: 400 });
		}

		// Prepare update data
		const updateData: {
			email: string;
			name: string;
			role: string;
			department?: string;
			phone?: string;
			passwordHash?: string;
		} = {
			email: email.toLowerCase(),
			name,
			role: role || 'user',
			department,
			phone
		};

		// Hash password if provided
		if (password) {
			updateData.passwordHash = await bcrypt.hash(password, 10);
		}

		// Update user
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: updateData
		});

		// Update user key if password was changed
		if (password) {
			const hashedPassword = await bcrypt.hash(password, 10);
			await prisma.userKey.upsert({
				where: { id: `email:${email.toLowerCase()}` },
				update: { hashedPassword },
				create: {
					id: `email:${email.toLowerCase()}`,
					userId: updatedUser.id,
					hashedPassword
				}
			});
		}

		return json({
			user: {
				id: updatedUser.id,
				email: updatedUser.email,
				name: updatedUser.name,
				role: updatedUser.role,
				department: updatedUser.department,
				phone: updatedUser.phone
			}
		});
	} catch (error) {
		console.error('Update user error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		const userId = event.params.id;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!existingUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check if user has active checkouts
		const activeCheckouts = await prisma.checkout.findMany({
			where: {
				user: existingUser.name,
				returnedAt: null
			}
		});

		if (activeCheckouts.length > 0) {
			return json({ 
				error: 'Cannot delete user with active checkouts. Please return all items first.' 
			}, { status: 400 });
		}

		// Delete user's checkouts first
		await prisma.checkout.deleteMany({
			where: { user: existingUser.name }
		});

		// Delete user's sessions
		await prisma.userSession.deleteMany({
			where: { userId: userId }
		});

		// Delete user's keys
		await prisma.userKey.deleteMany({
			where: { userId: userId }
		});

		// Delete user
		await prisma.user.delete({
			where: { id: userId }
		});

		return json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Delete user error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 