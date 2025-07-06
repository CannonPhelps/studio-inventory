import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedConnectorInventory() {
	try {
		console.log('Seeding connector inventory...');

		// Sample connector inventory data
		const connectorData = [
			{
				name: 'BNC Male',
				type: 'BNC',
				gender: 'Male',
				description: 'BNC Male connector for coaxial cables',
				color: '#FF6B6B',
				quantity: 50,
				purchasePrice: 2.50,
				supplier: 'DigiKey',
				purchaseDate: new Date('2024-01-15'),
				location: 'Storage Room A',
				notes: 'High quality gold-plated connectors'
			},
			{
				name: 'BNC Female',
				type: 'BNC',
				gender: 'Female',
				description: 'BNC Female connector for coaxial cables',
				color: '#FF6B6B',
				quantity: 45,
				purchasePrice: 2.25,
				supplier: 'DigiKey',
				purchaseDate: new Date('2024-01-15'),
				location: 'Storage Room A',
				notes: 'High quality gold-plated connectors'
			},
			{
				name: 'XLR Male',
				type: 'XLR',
				gender: 'Male',
				description: 'XLR Male connector for audio cables',
				color: '#4ECDC4',
				quantity: 30,
				purchasePrice: 3.75,
				supplier: 'Amazon',
				purchaseDate: new Date('2024-02-01'),
				location: 'Storage Room B',
				notes: 'Neutrik connectors'
			},
			{
				name: 'XLR Female',
				type: 'XLR',
				gender: 'Female',
				description: 'XLR Female connector for audio cables',
				color: '#4ECDC4',
				quantity: 35,
				purchasePrice: 3.50,
				supplier: 'Amazon',
				purchaseDate: new Date('2024-02-01'),
				location: 'Storage Room B',
				notes: 'Neutrik connectors'
			},
			{
				name: 'RCA Male',
				type: 'RCA',
				gender: 'Male',
				description: 'RCA Male connector for audio/video cables',
				color: '#45B7D1',
				quantity: 100,
				purchasePrice: 1.25,
				supplier: 'Mouser',
				purchaseDate: new Date('2024-01-20'),
				location: 'Storage Room A',
				notes: 'Gold-plated connectors'
			},
			{
				name: 'RCA Female',
				type: 'RCA',
				gender: 'Female',
				description: 'RCA Female connector for audio/video cables',
				color: '#45B7D1',
				quantity: 95,
				purchasePrice: 1.15,
				supplier: 'Mouser',
				purchaseDate: new Date('2024-01-20'),
				location: 'Storage Room A',
				notes: 'Gold-plated connectors'
			},
			{
				name: 'HDMI Male',
				type: 'HDMI',
				gender: 'Male',
				description: 'HDMI Male connector for video cables',
				color: '#96CEB4',
				quantity: 25,
				purchasePrice: 4.50,
				supplier: 'Newegg',
				purchaseDate: new Date('2024-02-10'),
				location: 'Storage Room C',
				notes: 'HDMI 2.1 compatible'
			},
			{
				name: 'HDMI Female',
				type: 'HDMI',
				gender: 'Female',
				description: 'HDMI Female connector for video cables',
				color: '#96CEB4',
				quantity: 20,
				purchasePrice: 4.25,
				supplier: 'Newegg',
				purchaseDate: new Date('2024-02-10'),
				location: 'Storage Room C',
				notes: 'HDMI 2.1 compatible'
			},
			{
				name: 'RJ45 Male',
				type: 'RJ45',
				gender: 'Male',
				description: 'RJ45 Male connector for Ethernet cables',
				color: '#FFEAA7',
				quantity: 200,
				purchasePrice: 0.75,
				supplier: 'Monoprice',
				purchaseDate: new Date('2024-01-10'),
				location: 'Storage Room A',
				notes: 'Cat6 compatible'
			},
			{
				name: 'RJ45 Female',
				type: 'RJ45',
				gender: 'Female',
				description: 'RJ45 Female connector for Ethernet cables',
				color: '#FFEAA7',
				quantity: 180,
				purchasePrice: 0.65,
				supplier: 'Monoprice',
				purchaseDate: new Date('2024-01-10'),
				location: 'Storage Room A',
				notes: 'Cat6 compatible'
			}
		];

		// Update existing cable ends with inventory data
		for (const connector of connectorData) {
			await prisma.cableEnd.updateMany({
				where: {
					name: connector.name
				},
				data: {
					quantity: connector.quantity,
					purchasePrice: connector.purchasePrice,
					supplier: connector.supplier,
					purchaseDate: connector.purchaseDate,
					location: connector.location,
					notes: connector.notes
				}
			});
		}

		console.log('Connector inventory seeded successfully!');
	} catch (error) {
		console.error('Error seeding connector inventory:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seedConnectorInventory(); 