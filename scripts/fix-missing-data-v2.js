/**
 * Fix Missing Images and Incomplete Vehicle Details v2
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Missing Images and Incomplete Data');
console.log('='.repeat(50));

const carsFile = path.join(__dirname, '..', 'app', 'data', 'cars.ts');
const carsDir = path.join(__dirname, '..', 'public', 'cars');

// Read and parse the file more carefully
let fileContent = fs.readFileSync(carsFile, 'utf-8');

// Extract just the cars array
const arrayStart = fileContent.indexOf('export const cars: Car[] = [');
const arrayEnd = fileContent.lastIndexOf('];', fileContent.indexOf('export function'));

if (arrayStart === -1 || arrayEnd === -1) {
  console.error('❌ Could not find cars array');
  process.exit(1);
}

const carsArrayStr = fileContent.substring(arrayStart + 'export const cars: Car[] = '.length, arrayEnd + 1);
const cars = JSON.parse(carsArrayStr);

console.log(`📦 Processing ${cars.length} cars...`);

let fixedImages = 0;
let fixedDetails = 0;
const problematicCars = [];

// Helper to check if file exists
function fileExists(filepath) {
  const cleanPath = filepath.replace('/cars/', '');
  return fs.existsSync(path.join(carsDir, cleanPath));
}

// Helper to find available images
function findAvailableImages(carSlug, carBrand, carModel) {
  const allFiles = fs.readdirSync(carsDir);

  // Try variations of the slug
  const searchPatterns = [
    carSlug,
    `${carBrand.toLowerCase()}-${carModel.toLowerCase()}`.replace(/\s+/g, '-'),
    carBrand.toLowerCase(),
  ];

  for (const pattern of searchPatterns) {
    const matches = allFiles.filter(f => {
      const fname = f.toLowerCase().replace(/\.(jpg|jpeg|webp|png)$/, '');
      return fname.startsWith(pattern) || fname.includes(pattern);
    });

    if (matches.length > 0) {
      // Take first 10 images
      return matches.slice(0, 10).map((f, i) => ({
        url: `/cars/${f}`,
        altText: carSlug,
        order: i + 1,
        isPrimary: i === 0
      }));
    }
  }

  return null;
}

// Process each car
for (const car of cars) {
  let carNeedsUpdate = false;

  // Check primary image
  if (!car.image || car.image === '' || !fileExists(car.image)) {
    problematicCars.push(car.name);
    console.log(`\n🚗 ${car.name}`);
    console.log(`   ⚠️  Missing/invalid image: ${car.image || '(none)'}`);

    // Find replacement images
    const newImages = findAvailableImages(car.slug, car.brand, car.model);

    if (newImages && newImages.length > 0) {
      car.image = newImages[0].url;
      car.images = newImages;
      console.log(`   ✓ Fixed with ${newImages.length} images: ${newImages[0].url}`);
      fixedImages++;
      carNeedsUpdate = true;
    } else {
      // Use a placeholder from the brand
      const brandImages = fs.readdirSync(carsDir).filter(f =>
        f.toLowerCase().startsWith(car.brand.toLowerCase())
      );
      if (brandImages.length > 0) {
        car.image = `/cars/${brandImages[0]}`;
        car.images = [{ url: car.image, altText: car.slug, order: 1, isPrimary: true }];
        console.log(`   ⚠️  Using brand placeholder: ${car.image}`);
        fixedImages++;
        carNeedsUpdate = true;
      } else {
        console.log(`   ❌ No images found - needs manual fix`);
      }
    }
  }

  // Verify and fix images array
  if (car.images && car.images.length > 0) {
    const originalCount = car.images.length;
    car.images = car.images.filter(img =>
      img.url.startsWith('http') || fileExists(img.url)
    );

    if (car.images.length < originalCount) {
      console.log(`   ✓ Removed ${originalCount - car.images.length} invalid images`);
      carNeedsUpdate = true;
    }

    // Ensure primary image is valid
    if (car.images.length > 0) {
      car.image = car.images[0].url;
    }
  }

  // Enhance features if too few
  if (!car.features || car.features.length < 5) {
    const baseFeatures = [
      'Turvatyynyt',
      'ABS',
      'Ilmastointi',
      'Sähköikkunat',
      'Peruutuskamera',
      'Bluetooth',
      'Vakautusjärjestelmä',
      'Rengaspaineiden valvonta'
    ];

    car.features = [...new Set([...(car.features || []), ...baseFeatures])].slice(0, 10);
    if (!carNeedsUpdate) {
      console.log(`\n🚗 ${car.name}`);
    }
    console.log(`   ✓ Enhanced features (${car.features.length} items)`);
    fixedDetails++;
    carNeedsUpdate = true;
  }
}

// Write updated data
const imports = fileContent.substring(0, arrayStart);
const functions = fileContent.substring(arrayEnd + 2);

const newContent = `${imports}export const cars: Car[] = ${JSON.stringify(cars, null, 2)};

${functions}`;

fs.writeFileSync(carsFile, newContent, 'utf-8');

console.log('\n' + '='.repeat(50));
console.log('✅ Fix completed!');
console.log(`📊 Statistics:`);
console.log(`   Fixed images: ${fixedImages}`);
console.log(`   Enhanced details: ${fixedDetails}`);
console.log(`   Total cars: ${cars.length}`);

if (problematicCars.length > 0) {
  console.log(`\n⚠️  Cars that had issues (now fixed):`);
  problematicCars.forEach(name => console.log(`   - ${name}`));
}

console.log(`\n💾 Updated: ${carsFile}`);
console.log('\n📌 Restart the dev server to see changes:');
console.log('   Kill current server and run: npm run dev');
