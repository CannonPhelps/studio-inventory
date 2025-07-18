import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	try {
		await requireAdmin(event);
		
		// Return empty import history for now
		return json({ history: [] });
	} catch (error) {
		console.error('Error loading import history:', error);
		return json({ error: 'Failed to load import history' }, { status: 500 });
	}
};

export const POST = async (event: RequestEvent) => {
	try {
		await requireAdmin(event);
		
		// For now, just return a placeholder response
		return json({ 
			message: 'Import functionality not yet implemented',
			success: false 
		});
	} catch (error) {
		console.error('Error processing import:', error);
		return json({ error: 'Failed to process import' }, { status: 500 });
	}
}; 