// Helper function for category images
export function getCategoryImage(categoryName: string): string {
	const categoryImages: { [key: string]: string } = {
		'Camera': '📷',
		'Video': '📺',
		'Audio': '🎤',
		'Lighting': '💡',
		'Computer': '💻',
		'Display': '🖥️',
		'Network': '🌐',
		'Other': '📦'
	};
	
	return categoryImages[categoryName] || '📦';
} 