import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		const categoryId = parseInt(event.params.id);
		
		const category = await prisma.category.findUnique({
			where: { id: categoryId },
			include: {
				assets: true
			}
		});

		if (!category) {
			return json({ error: 'Category not found' }, { status: 404 });
		}

		// Add asset count
		const categoryWithCount = {
			...category,
			assetCount: category.assets.length
		};

		return json(categoryWithCount);
	} catch (error) {
		console.error('Get category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		const categoryId = parseInt(event.params.id);
		const updateData = await event.request.json();

		// Check if category exists
		const existingCategory = await prisma.category.findUnique({
			where: { id: categoryId }
		});

		if (!existingCategory) {
			return json({ error: 'Category not found' }, { status: 404 });
		}

		// Update category - only allow name field
		const updatedCategory = await prisma.category.update({
			where: { id: categoryId },
			data: {
				name: updateData.name
			},
			include: {
				assets: true
			}
		});

		// Add asset count
		const categoryWithCount = {
			...updatedCategory,
			assetCount: updatedCategory.assets.length
		};

		return json(categoryWithCount);
	} catch (error) {
		console.error('Update category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		const categoryId = parseInt(event.params.id);

		// Check if category exists
		const existingCategory = await prisma.category.findUnique({
			where: { id: categoryId },
			include: {
				assets: true
			}
		});

		if (!existingCategory) {
			return json({ error: 'Category not found' }, { status: 404 });
		}

		// Check if category has assets
		if (existingCategory.assets.length > 0) {
			return json({ 
				error: 'Cannot delete category with assets. Please move or delete all assets first.' 
			}, { status: 400 });
		}

		// Delete category
		await prisma.category.delete({
			where: { id: categoryId }
		});

		return json({ message: 'Category deleted successfully' });
	} catch (error) {
		console.error('Delete category error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 