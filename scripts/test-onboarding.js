import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOnboarding() {
	try {
		console.log('🧪 Testing onboarding process...\n');

		// Check if any users exist
		const userCount = await prisma.user.count();
		console.log(`📊 Current user count: ${userCount}`);

		if (userCount === 0) {
			console.log('✅ No users found - onboarding should be accessible');
			console.log('🌐 Visit http://localhost:5173/onboarding to create first admin');
		} else {
			console.log('❌ Users already exist - onboarding should redirect to login');
			console.log('🌐 Visit http://localhost:5173/onboarding to verify redirect');
		}

		// List existing users if any
		if (userCount > 0) {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					createdAt: true
				}
			});

			console.log('\n👥 Existing users:');
			users.forEach(user => {
				console.log(`  - ${user.name} (${user.email}) - ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
			});
		}

		console.log('\n🎯 Onboarding test complete!');
	} catch (error) {
		console.error('❌ Error testing onboarding:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testOnboarding(); 