import { json } from '@sveltejs/kit';
import { checkDatabaseConnection } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const dbStatus = await checkDatabaseConnection();
		
		return json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: dbStatus
		});
	} catch (error) {
		console.error('Health check failed:', error);
		return json({
			status: 'error',
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 