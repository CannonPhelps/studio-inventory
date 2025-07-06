import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cableEnds = [
	// BNC Connectors (for SDI, video, RF)
	{ name: 'BNC Male', type: 'BNC', gender: 'Male', description: 'BNC Male connector for SDI and video applications', color: '#FF6B6B' },
	{ name: 'BNC Female', type: 'BNC', gender: 'Female', description: 'BNC Female connector for SDI and video applications', color: '#FF6B6B' },
	
	// XLR Connectors (for audio)
	{ name: 'XLR Male', type: 'XLR', gender: 'Male', description: 'XLR Male connector for professional audio', color: '#4ECDC4' },
	{ name: 'XLR Female', type: 'XLR', gender: 'Female', description: 'XLR Female connector for professional audio', color: '#4ECDC4' },
	
	// RCA Connectors (for audio/video)
	{ name: 'RCA Male', type: 'RCA', gender: 'Male', description: 'RCA Male connector for audio and video', color: '#45B7D1' },
	{ name: 'RCA Female', type: 'RCA', gender: 'Female', description: 'RCA Female connector for audio and video', color: '#45B7D1' },
	
	// HDMI Connectors (for video)
	{ name: 'HDMI Male', type: 'HDMI', gender: 'Male', description: 'HDMI Male connector for digital video and audio', color: '#96CEB4' },
	{ name: 'HDMI Female', type: 'HDMI', gender: 'Female', description: 'HDMI Female connector for digital video and audio', color: '#96CEB4' },
	
	// RJ45 Connectors (for Ethernet)
	{ name: 'RJ45 Male', type: 'RJ45', gender: 'Male', description: 'RJ45 Male connector for Ethernet networking', color: '#FFEAA7' },
	{ name: 'RJ45 Female', type: 'RJ45', gender: 'Female', description: 'RJ45 Female connector for Ethernet networking', color: '#FFEAA7' },
	
	// USB Connectors
	{ name: 'USB-A Male', type: 'USB-A', gender: 'Male', description: 'USB-A Male connector', color: '#DDA0DD' },
	{ name: 'USB-A Female', type: 'USB-A', gender: 'Female', description: 'USB-A Female connector', color: '#DDA0DD' },
	{ name: 'USB-B Male', type: 'USB-B', gender: 'Male', description: 'USB-B Male connector', color: '#98D8C8' },
	{ name: 'USB-B Female', type: 'USB-B', gender: 'Female', description: 'USB-B Female connector', color: '#98D8C8' },
	{ name: 'USB-C Male', type: 'USB-C', gender: 'Male', description: 'USB-C Male connector', color: '#F7DC6F' },
	{ name: 'USB-C Female', type: 'USB-C', gender: 'Female', description: 'USB-C Female connector', color: '#F7DC6F' },
	
	// Power Connectors
	{ name: 'IEC Male', type: 'IEC', gender: 'Male', description: 'IEC Male power connector', color: '#BB8FCE' },
	{ name: 'IEC Female', type: 'IEC', gender: 'Female', description: 'IEC Female power connector', color: '#BB8FCE' },
	{ name: 'Edison Male', type: 'Edison', gender: 'Male', description: 'Edison Male power connector', color: '#85C1E9' },
	{ name: 'Edison Female', type: 'Edison', gender: 'Female', description: 'Edison Female power connector', color: '#85C1E9' },
	
	// Audio Connectors
	{ name: '1/4" TRS Male', type: '1/4" TRS', gender: 'Male', description: '1/4 inch TRS Male connector for balanced audio', color: '#F8C471' },
	{ name: '1/4" TRS Female', type: '1/4" TRS', gender: 'Female', description: '1/4 inch TRS Female connector for balanced audio', color: '#F8C471' },
	{ name: '1/4" TS Male', type: '1/4" TS', gender: 'Male', description: '1/4 inch TS Male connector for unbalanced audio', color: '#F8C471' },
	{ name: '1/4" TS Female', type: '1/4" TS', gender: 'Female', description: '1/4 inch TS Female connector for unbalanced audio', color: '#F8C471' },
	{ name: '3.5mm Male', type: '3.5mm', gender: 'Male', description: '3.5mm Male connector for consumer audio', color: '#F8C471' },
	{ name: '3.5mm Female', type: '3.5mm', gender: 'Female', description: '3.5mm Female connector for consumer audio', color: '#F8C471' },
	
	// Video Connectors
	{ name: 'VGA Male', type: 'VGA', gender: 'Male', description: 'VGA Male connector for analog video', color: '#96CEB4' },
	{ name: 'VGA Female', type: 'VGA', gender: 'Female', description: 'VGA Female connector for analog video', color: '#96CEB4' },
	{ name: 'DVI Male', type: 'DVI', gender: 'Male', description: 'DVI Male connector for digital video', color: '#96CEB4' },
	{ name: 'DVI Female', type: 'DVI', gender: 'Female', description: 'DVI Female connector for digital video', color: '#96CEB4' },
	{ name: 'DisplayPort Male', type: 'DisplayPort', gender: 'Male', description: 'DisplayPort Male connector for digital video', color: '#96CEB4' },
	{ name: 'DisplayPort Female', type: 'DisplayPort', gender: 'Female', description: 'DisplayPort Female connector for digital video', color: '#96CEB4' }
];

async function seedCableEnds() {
	try {
		console.log('Starting to seed cable ends...');
		
		for (const cableEnd of cableEnds) {
			const existing = await prisma.cableEnd.findFirst({
				where: {
					name: cableEnd.name
				}
			});
			
			if (existing) {
				console.log(`Cable end "${cableEnd.name}" already exists, skipping...`);
			} else {
				const created = await prisma.cableEnd.create({
					data: cableEnd
				});
				console.log(`Created cable end: ${created.name}`);
			}
		}
		
		console.log('Cable ends seeding completed!');
	} catch (error) {
		console.error('Error seeding cable ends:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seedCableEnds(); 