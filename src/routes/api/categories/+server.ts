import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);

        const categories = await prisma.category.findMany({
            include: {
                _count: { select: { assets: true } }
            }
        });

        // Add asset count to each category without loading full assets
        const categoriesWithCount = categories.map((category) => ({
            id: category.id,
            name: category.name,
            assetCount: category._count.assets
        }));

        return json(categoriesWithCount);
	} catch (error) {
		console.error('Error fetching categories:', error);
		return json(
			{ error: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);

		const data = await event.request.json();

		const category = await prisma.category.create({
			data: {
				name: data.name
			}
		});

		return json(category);
	} catch (error) {
		console.error('Error creating category:', error);
		return json(
			{ error: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
};
