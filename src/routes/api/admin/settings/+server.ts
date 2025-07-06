import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import type { RequestEvent } from '@sveltejs/kit';

// For now, we'll store settings in memory. In production, you'd want to store these in the database
let systemSettings = {
	systemName: 'Studio Inventory',
	defaultCheckoutDuration: 7,
	enableEmailNotifications: false,
	requireApprovalForCheckouts: false,
	maxCheckoutsPerUser: 5
};

export const GET = async ({ cookies }: RequestEvent) => {
	try {
		// Get the session from cookies
		const sessionId = cookies.get('auth_session');
		if (!sessionId) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		// Find the session and user
		const session = await prisma.userSession.findUnique({
			where: { id: sessionId },
			include: { user: true }
		});

		if (!session || session.expiresAt < new Date()) {
			return json({ error: 'Session expired' }, { status: 401 });
		}

		// Check if user is admin
		if (session.user.role !== 'admin') {
			return json({ error: 'Admin access required' }, { status: 403 });
		}

		return json(systemSettings);
	} catch (error) {
		console.error('Error loading admin settings:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PUT = async ({ request, cookies }: RequestEvent) => {
	try {
		const settings = await request.json();

		// Get the session from cookies
		const sessionId = cookies.get('auth_session');
		if (!sessionId) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		// Find the session and user
		const session = await prisma.userSession.findUnique({
			where: { id: sessionId },
			include: { user: true }
		});

		if (!session || session.expiresAt < new Date()) {
			return json({ error: 'Session expired' }, { status: 401 });
		}

		// Check if user is admin
		if (session.user.role !== 'admin') {
			return json({ error: 'Admin access required' }, { status: 403 });
		}

		// Validate settings
		if (settings.defaultCheckoutDuration < 1 || settings.defaultCheckoutDuration > 30) {
			return json({ error: 'Default checkout duration must be between 1 and 30 days' }, { status: 400 });
		}

		if (settings.maxCheckoutsPerUser < 1 || settings.maxCheckoutsPerUser > 20) {
			return json({ error: 'Max checkouts per user must be between 1 and 20' }, { status: 400 });
		}

		// Update settings
		systemSettings = {
			...systemSettings,
			...settings
		};

		// In production, you would save these to the database
		// await prisma.systemSettings.upsert({
		//   where: { id: 1 },
		//   update: systemSettings,
		//   create: { id: 1, ...systemSettings }
		// });

		return json({ message: 'Settings updated successfully', settings: systemSettings });
	} catch (error) {
		console.error('Error updating admin settings:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 