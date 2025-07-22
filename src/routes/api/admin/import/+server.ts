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
		
		// Forward to the main import endpoint
		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		const importType = formData.get('importType') as string;

		if (!file || !importType) {
			return json({ error: 'File and import type are required' }, { status: 400 });
		}

		// Create a new request to the main import endpoint
		const importFormData = new FormData();
		importFormData.append('file', file);
		importFormData.append('importType', importType);

		const response = await fetch(`${event.url.origin}/api/import`, {
			method: 'POST',
			body: importFormData
		});

		const result = await response.json();
		return json(result, { status: response.status });
	} catch (error) {
		console.error('Error processing import:', error);
		return json({ error: 'Failed to process import' }, { status: 500 });
	}
}; 