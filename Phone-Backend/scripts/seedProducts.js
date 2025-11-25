const { sequelize, connectDB } = require('../src/config/database');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

const IMAGE_BASE = 'https://example.com/images';

const categories = [
  { name: 'Smartphones', description: 'High-end and mid-range mobile phones' },
  { name: 'Tablets', description: 'Productivity and entertainment tablets' },
  { name: 'Accessories', description: 'Chargers, audio gear, and add-ons' },
  { name: 'Smartwatches', description: 'Wearables and fitness trackers' },
  { name: 'Laptops', description: 'Ultra portable and creator laptops' },
  { name: 'Audio', description: 'Speakers and premium headphones' },
];

const specPresets = {
  smartphoneStorages: ['128GB', '256GB', '512GB', '1TB'],
  smartphoneDisplays: ['6.1" OLED 120Hz', '6.5" AMOLED 120Hz', '6.7" LTPO 1-120Hz', '6.8" Dynamic AMOLED'],
  smartphoneBatteries: ['4600mAh', '4800mAh', '5000mAh', '5200mAh', '5400mAh'],
  tabletDisplays: ['11" Liquid Retina', '12.9" mini-LED', '13" AMOLED 120Hz', '14" LCD 90Hz'],
  tabletChips: ['Apple M2', 'Snapdragon X Elite', 'Tensor G4', 'AMD Ryzen 7'],
  tabletBatteries: ['8600mAh', '9500mAh', '10400mAh'],
  accessoryTypes: ['GaN Charger', 'Power Bank', 'USB-C Hub', 'Wireless Dock', 'Stylus Pen', 'Cooling Pad'],
  accessoryCompatibility: ['Universal USB-C', 'MagSafe devices', 'Qi-enabled phones', 'Laptops & tablets'],
  accessoryFeatures: ['ActiveShield 2.0', 'Smart charge display', 'Foldable prongs', 'Dual-coil wireless', 'Magnetic alignment'],
  smartwatchSizes: ['41mm', '44mm', '45mm', '47mm'],
  smartwatchBatteries: ['24 hours', '36 hours', '48 hours', '72 hours'],
  smartwatchSensors: ['ECG, SpO2, HRV', 'BP, ECG, HR', 'SpO2, HR, Stress'],
  laptopCPUs: ['Intel Core Ultra 7', 'Intel Core Ultra 9', 'AMD Ryzen 9', 'Apple M3 Pro'],
  laptopGPUs: ['RTX 4060', 'RTX 4070', 'Intel Arc', 'Integrated 16-core GPU'],
  laptopDisplays: ['14" OLED 120Hz', '15" IPS 165Hz', '16" mini-LED 120Hz'],
  audioDrivers: ['40mm titanium', '50mm graphene', 'Dual dynamic', 'Planar magnetic'],
  audioConnectivity: ['Bluetooth 5.3', 'Bluetooth LE Audio', 'USB-C + BT', 'Wi-Fi + BT'],
  audioBattery: ['30 hours', '36 hours', '42 hours', '55 hours'],
};

const specBuilders = {
  Smartphones: (template, idx) => [
    {
      key: 'Storage',
      value:
        (template.storageOptions && template.storageOptions[idx % template.storageOptions.length]) ||
        specPresets.smartphoneStorages[idx % specPresets.smartphoneStorages.length],
    },
    {
      key: 'Display',
      value:
        (template.displayOptions && template.displayOptions[idx % template.displayOptions.length]) ||
        specPresets.smartphoneDisplays[(idx + template.specOffset) % specPresets.smartphoneDisplays.length],
    },
    {
      key: 'Battery',
      value: specPresets.smartphoneBatteries[(idx + 2) % specPresets.smartphoneBatteries.length],
    },
  ],
  Tablets: (template, idx) => [
    {
      key: 'Display',
      value: specPresets.tabletDisplays[(idx + template.specOffset) % specPresets.tabletDisplays.length],
    },
    {
      key: 'Chip',
      value: specPresets.tabletChips[idx % specPresets.tabletChips.length],
    },
    {
      key: 'Battery',
      value: specPresets.tabletBatteries[(idx + 1) % specPresets.tabletBatteries.length],
    },
  ],
  Accessories: (template, idx) => [
    {
      key: 'Type',
      value: specPresets.accessoryTypes[(idx + template.specOffset) % specPresets.accessoryTypes.length],
    },
    {
      key: 'Compatibility',
      value:
        specPresets.accessoryCompatibility[(idx + 1) % specPresets.accessoryCompatibility.length],
    },
    {
      key: 'Features',
      value: specPresets.accessoryFeatures[(idx + 2) % specPresets.accessoryFeatures.length],
    },
  ],
  Smartwatches: (template, idx) => [
    {
      key: 'Size',
      value: specPresets.smartwatchSizes[(idx + template.specOffset) % specPresets.smartwatchSizes.length],
    },
    {
      key: 'Battery',
      value: specPresets.smartwatchBatteries[idx % specPresets.smartwatchBatteries.length],
    },
    {
      key: 'Sensors',
      value: specPresets.smartwatchSensors[(idx + 1) % specPresets.smartwatchSensors.length],
    },
  ],
  Laptops: (template, idx) => [
    {
      key: 'Processor',
      value: specPresets.laptopCPUs[(idx + template.specOffset) % specPresets.laptopCPUs.length],
    },
    {
      key: 'GPU',
      value: specPresets.laptopGPUs[idx % specPresets.laptopGPUs.length],
    },
    {
      key: 'Display',
      value: specPresets.laptopDisplays[(idx + 1) % specPresets.laptopDisplays.length],
    },
  ],
  Audio: (template, idx) => [
    {
      key: 'Driver',
      value: specPresets.audioDrivers[(idx + template.specOffset) % specPresets.audioDrivers.length],
    },
    {
      key: 'Connectivity',
      value: specPresets.audioConnectivity[idx % specPresets.audioConnectivity.length],
    },
    {
      key: 'Battery',
      value: specPresets.audioBattery[(idx + 1) % specPresets.audioBattery.length],
    },
  ],
};

const generatorConfigs = [
  {
    category: 'Smartphones',
    target: 35,
    models: [
      {
        label: 'Astra Nova',
        imageBase: 'smartphones/astra-nova',
        basePrice: 999.99,
        priceStep: 25,
        baseStock: 25,
        baseDiscount: 8,
        description: 'Flagship Android with adaptive refresh and periscope zoom.',
      },
      {
        label: 'Vertex Edge',
        imageBase: 'smartphones/vertex-edge',
        basePrice: 899.99,
        priceStep: 22,
        baseStock: 20,
        baseDiscount: 9,
        description: 'Metal unibody phone focused on creators and gamers.',
      },
      {
        label: 'Pulse Fusion',
        imageBase: 'smartphones/pulse-fusion',
        basePrice: 799.99,
        priceStep: 18,
        baseStock: 30,
        baseDiscount: 10,
        description: 'Lightweight flagship with speedy charging support.',
      },
      {
        label: 'Zenith Fold',
        imageBase: 'smartphones/zenith-fold',
        basePrice: 1299.99,
        priceStep: 35,
        baseStock: 15,
        baseDiscount: 6,
        description: 'Premium foldable with crease-free inner display.',
      },
      {
        label: 'Nimbus Lite',
        imageBase: 'smartphones/nimbus-lite',
        basePrice: 649.99,
        priceStep: 15,
        baseStock: 45,
        baseDiscount: 12,
        description: 'Value flagship killer with clean Android build.',
      },
    ],
  },
  {
    category: 'Tablets',
    target: 15,
    models: [
      {
        label: 'Orbit Tab Pro',
        imageBase: 'tablets/orbit-tab-pro',
        basePrice: 899.99,
        priceStep: 20,
        baseStock: 18,
        baseDiscount: 7,
        description: '2-in-1 tablet with detachable keyboard and pen.',
      },
      {
        label: 'PixelView Slate',
        imageBase: 'tablets/pixelview-slate',
        basePrice: 699.99,
        priceStep: 18,
        baseStock: 22,
        baseDiscount: 8,
        description: 'Entertainment tablet tuned for HDR streaming.',
      },
      {
        label: 'FlexPad Studio',
        imageBase: 'tablets/flexpad-studio',
        basePrice: 1099.99,
        priceStep: 28,
        baseStock: 12,
        baseDiscount: 6,
        description: 'Creator-focused tablet with calibrated panel.',
      },
    ],
  },
  {
    category: 'Accessories',
    target: 15,
    models: [
      {
        label: 'PowerLink GaN',
        imageBase: 'accessories/powerlink-gan',
        basePrice: 119.99,
        priceStep: 5,
        baseStock: 60,
        baseDiscount: 10,
        description: 'GaN desktop charger with multi-port balancing.',
      },
      {
        label: 'SonicBuds Air',
        imageBase: 'accessories/sonicbuds-air',
        basePrice: 189.99,
        priceStep: 6,
        baseStock: 55,
        baseDiscount: 11,
        description: 'ANC earbuds with spatial audio projection.',
      },
      {
        label: 'HyperDock Max',
        imageBase: 'accessories/hyperdock-max',
        basePrice: 159.99,
        priceStep: 4,
        baseStock: 48,
        baseDiscount: 9,
        description: 'USB-C docking hub with 8K HDMI and PD passthrough.',
      },
    ],
  },
  {
    category: 'Smartwatches',
    target: 10,
    models: [
      {
        label: 'PulseTrack Elite',
        imageBase: 'wearables/pulsetrack-elite',
        basePrice: 499.99,
        priceStep: 12,
        baseStock: 28,
        baseDiscount: 8,
        description: 'Titanium smartwatch with multi-band GPS.',
      },
      {
        label: 'TerraFit Pro',
        imageBase: 'wearables/terrafit-pro',
        basePrice: 399.99,
        priceStep: 10,
        baseStock: 35,
        baseDiscount: 10,
        description: 'Rugged fitness watch rated for deep water dives.',
      },
    ],
  },
  {
    category: 'Laptops',
    target: 15,
    models: [
      {
        label: 'QuantumBook X',
        imageBase: 'laptops/quantumbook-x',
        basePrice: 1899.99,
        priceStep: 35,
        baseStock: 10,
        baseDiscount: 7,
        description: 'Creator laptop with mini-LED HDR display.',
      },
      {
        label: 'AeroFlex 15',
        imageBase: 'laptops/aeroflex-15',
        basePrice: 1499.99,
        priceStep: 28,
        baseStock: 14,
        baseDiscount: 9,
        description: 'Convertible laptop with 360° hinge and pen.',
      },
      {
        label: 'Nimbus Ultra',
        imageBase: 'laptops/nimbus-ultra',
        basePrice: 1699.99,
        priceStep: 30,
        baseStock: 12,
        baseDiscount: 8,
        description: 'Ultra-thin machine with day-long battery life.',
      },
    ],
  },
  {
    category: 'Audio',
    target: 10,
    models: [
      {
        label: 'EchoSound Studio',
        imageBase: 'audio/echosound-studio',
        basePrice: 349.99,
        priceStep: 8,
        baseStock: 32,
        baseDiscount: 12,
        description: 'Smart speaker with room calibration.',
      },
      {
        label: 'NimbusWave ANC',
        imageBase: 'audio/nimbuswave-anc',
        basePrice: 299.99,
        priceStep: 7,
        baseStock: 40,
        baseDiscount: 11,
        description: 'Over-ear headphones with adaptive ANC.',
      },
      {
        label: 'PulsePods Mini',
        imageBase: 'audio/pulsepods-mini',
        basePrice: 199.99,
        priceStep: 6,
        baseStock: 50,
        baseDiscount: 13,
        description: 'True wireless earbuds tuned for podcasts.',
      },
    ],
  },
];

const toFixedNumber = (value) => Number(value.toFixed(2));

const buildImageUrl = (template, variantCycle) => {
  const suffix = template.imageBase || `generic/${template.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return `${IMAGE_BASE}/${suffix}-v${variantCycle + 1}.jpg`;
};

const buildDescription = (template, category, variantCycle) => {
  return `${template.description} Variant batch ${variantCycle + 1} optimized for ${category.toLowerCase()} users.`;
};

const generateProducts = () => {
  const output = [];

  generatorConfigs.forEach((config) => {
    for (let i = 0; i < config.target; i += 1) {
      const template = config.models[i % config.models.length];
      const variantCycle = Math.floor(i / config.models.length);
      const name = `${template.label} Series ${variantCycle + 1}.${(i % config.models.length) + 1}`;
      const rawPrice = template.basePrice - variantCycle * template.priceStep;
      const price = toFixedNumber(Math.max(template.minPrice || 49.99, rawPrice));
      const originalPrice = toFixedNumber(price * (1 + (template.originalMarkup || 0.12)));
      const discount = Math.min(35, Math.max(5, Math.round(template.baseDiscount + (variantCycle % 5) * 2)));
      const stock = Math.max(8, template.baseStock + ((variantCycle * 3 + i) % 40) * 2);
      const specifications = specBuilders[config.category]
        ? specBuilders[config.category](template, i)
        : [];

      output.push({
        name,
        category: config.category,
        price,
        originalPrice,
        discount,
        image: buildImageUrl(template, variantCycle),
        description: buildDescription(template, config.category, variantCycle),
        specifications,
        stock,
      });
    }
  });

  return output;
};

const products = generateProducts();

const ensureCategories = async () => {
  for (const category of categories) {
    await Category.findOrCreate({
      where: { name: category.name },
      defaults: category,
    });
  }
};

const upsertProducts = async () => {
  for (const product of products) {
    const [record, created] = await Product.findOrCreate({
      where: { name: product.name },
      defaults: product,
    });

    if (!created) {
      await record.update(product);
    }
  }
};

const seedProducts = async () => {
  try {
    await connectDB();
    console.log('🚀 Connected, seeding categories and products...');

    await ensureCategories();
    console.log(`✅ Ensured ${categories.length} categories`);

    console.log(`↗️  Preparing to upsert ${products.length} products`);
    await upsertProducts();
    console.log(`✅ Upserted ${products.length} products`);

    console.log('🎉 Product catalog seed complete');
  } catch (error) {
    console.error('❌ Product seeding failed:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

seedProducts();
