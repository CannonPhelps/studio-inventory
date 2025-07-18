import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	try {
		console.log('Test users endpoint called');
		await requireAdmin(event);
		return json({ message: 'Test users endpoint working', timestamp: new Date().toISOString() });
	} catch (error) {
		console.error('Test users error:', error);
		return json({ error: 'Test users endpoint error' }, { status: 500 });
	}
};

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Test users POST endpoint called');
		await requireAdmin(event);
		const body = await event.request.json();
		return json({ 
			message: 'Test users POST endpoint working', 
			receivedData: body,
			timestamp: new Date().toISOString() 
		});
	} catch (error) {
		console.error('Test users POST error:', error);
		return json({ error: 'Test users POST endpoint error' }, { status: 500 });
	}
}; 