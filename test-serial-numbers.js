import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSerialNumbers() {
  try {
    console.log('Testing serial number functionality...\n');

    // Check existing assets with serial numbers
    const assetsWithSerialNumbers = await prisma.asset.findMany({
      include: {
        serialNumbers: true,
        category: true
      },
      take: 5
    });

    console.log('First 5 assets with serial numbers:');
    assetsWithSerialNumbers.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.itemName}`);
      console.log(`   Category: ${asset.category?.name}`);
      console.log(`   Serial Numbers: ${asset.serialNumbers.length > 0 ? asset.serialNumbers.map(sn => sn.serialNumber).join(', ') : 'None'}`);
      console.log('');
    });

    // Test creating a new asset with serial numbers
    console.log('Creating test asset with serial numbers...');
    const testAsset = await prisma.asset.create({
      data: {
        itemName: 'Test Asset with Multiple Serial Numbers',
        quantity: 1,
        categoryId: 1, // Assuming category 1 exists
        modelBrand: 'Test Brand',
        location: 'Test Location',
        status: 'Available',
        serialNumbers: {
          create: [
            { serialNumber: 'TEST001' },
            { serialNumber: 'TEST002' },
            { serialNumber: 'TEST003' }
          ]
        }
      },
      include: {
        serialNumbers: true,
        category: true
      }
    });

    console.log('Created test asset:');
    console.log(`Name: ${testAsset.itemName}`);
    console.log(`Serial Numbers: ${testAsset.serialNumbers.map(sn => sn.serialNumber).join(', ')}`);
    console.log('');

    // Clean up test asset
    console.log('Cleaning up test asset...');
    await prisma.asset.delete({
      where: { id: testAsset.id }
    });
    console.log('Test asset deleted successfully.');

    console.log('\nSerial number functionality test completed successfully!');
  } catch (error) {
    console.error('Error testing serial numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSerialNumbers(); 