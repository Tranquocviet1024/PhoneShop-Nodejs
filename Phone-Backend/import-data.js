const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/config/database');
const Product = require('./src/models/Product');

// Silence sequelize unused warning - needed for db connection
void sequelize;

async function importData() {
  try {
    console.log('📥 Starting data import...\n');

    // Read JSON file from downloads
    const filePath = path.join('C:/Users/pc/AppData/Local/Temp/MicrosoftEdgeDownloads/fcb52c63-01f6-4f71-a89e-e19f224110f1/products.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const productsData = JSON.parse(rawData);

    console.log(`📦 Found ${productsData.length} products to import`);

    // Get unique categories from products
    const uniqueCategories = [...new Set(productsData.map(p => p.category))];
    console.log(`📂 Found ${uniqueCategories.length} unique categories: ${uniqueCategories.join(', ')}\n`);

    // Step 2: Import Products
    console.log('📦 Creating products...');
    let createdCount = 0;
    let skippedCount = 0;

    for (const product of productsData) {
      const [, created] = await Product.findOrCreate({
        where: { 
          name: product.name,
          category: product.category
        },
        defaults: {
          name: product.name,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount || 0,
          image: product.image,
          description: product.description,
          specifications: product.specifications || {},
          stock: product.stock || 0
        }
      });

      if (created) {
        createdCount++;
        if (createdCount % 10 === 0) {
          console.log(`✅ Created ${createdCount} products...`);
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`\n✨ Import completed!\n`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Categories created: ${uniqueCategories.length}`);
    console.log(`   ✅ Products created: ${createdCount}`);
    console.log(`   ⏭️  Products skipped: ${skippedCount}`);
    console.log(`   📦 Total products: ${productsData.length}\n`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    process.exit(1);
  }
}

importData();
