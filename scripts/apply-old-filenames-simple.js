/**
 * Apply Old Sample Filenames to Matching Cars
 * Simple version using direct mapping
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Applying Old Filenames to Imported Cars');
console.log('='.repeat(50));

// Manual mapping from old samples (name → primary image filename)
const oldImageMapping = {
  'Audi Q5 2.0': '/cars/audi-q5-2-0.jpeg',
  'BMW X5': '/cars/bmw-x5.jpeg',
  'Audi A4 Allroad 2.0': '/cars/audi-a4-allroad-2-0.jpeg',
  'Skoda Octavia 1.6 diesel automaatti 2020': '/cars/skoda-octavia-1-6-diesel-automaatti-2020.jpeg',
  'Seat Tarraco 2.0': '/cars/seat-tarraco-2-0.jpeg',
  'VW Passat 1.6': '/cars/vw-passat-1-6.jpeg',
  'Audi A6': '/cars/audi-a6-2.jpeg',
  'Mercedes Benz E220 AMG Paketti': '/cars/mercedes-benz-e220-amg-paketti.jpeg',
  'Skoda SuperB': '/cars/skoda-superb.jpeg',
  'Mercedes Benz E220': '/cars/mercedes-benz-e220.jpeg',
  'BMW 320': '/cars/bmw-320.jpeg',
  'Audi A6 Sedan Business Sport 3.0 V6 TDI 160 kW quattro': '/cars/audi-a6-sedan-business-sport-3-0-v6-tdi-160-kw-quattro.jpeg',
  'Skoda Superb': '/cars/skoda-superb.jpeg',
  'Audi A6 Avant 40 TDI MHEV quattro S tronic Business Design': '/cars/audi-a6-avant-40-tdi-mhev-quattro-s-tronic-business-design.jpeg',
  'BMW 520 F10 Sedan 520d A xDrive Edition Exclusive': '/cars/bmw-520-f10-sedan-520d-a-xdrive-edition-exclusive.jpeg',
  'Mercedes-Benz E 220d Premium Business': '/cars/mercedes-benz-e-220d-premium-business.jpeg',
  'Volkswagen Golf Allstar': '/cars/volkswagen-golf-allstar.jpeg',
};

// Read current cars data
const carsFile = path.join(__dirname, '..', 'app', 'data', 'cars.ts');
const fileContent = fs.readFileSync(carsFile, 'utf-8');

const arrayStart = fileContent.indexOf('export const cars: Car[] = [');
const arrayEnd = fileContent.lastIndexOf('];', fileContent.indexOf('export function'));
const carsArrayStr = fileContent.substring(arrayStart + 'export const cars: Car[] = '.length, arrayEnd + 1);
const cars = JSON.parse(carsArrayStr);

console.log(`🚗 Processing ${cars.length} imported cars...\n`);

// Helper to check if file exists
function fileExists(filepath) {
  const carsDir = path.join(__dirname, '..', 'public', 'cars');
  const cleanPath = filepath.replace('/cars/', '');
  return fs.existsSync(path.join(carsDir, cleanPath));
}

// Helper to get all images for a specific filename pattern
function getAllImagesForSlug(primaryImage) {
  const carsDir = path.join(__dirname, '..', 'public', 'cars');
  const basename = path.basename(primaryImage, path.extname(primaryImage));
  const ext = path.extname(primaryImage);

  const allFiles = fs.readdirSync(carsDir);
  const matchingFiles = allFiles.filter(f =>
    f === path.basename(primaryImage) ||
    f.startsWith(basename + '-')
  ).sort();

  return matchingFiles.map((filename, idx) => ({
    url: `/cars/${filename}`,
    altText: basename,
    order: idx + 1,
    isPrimary: idx === 0
  }));
}

let updatedCount = 0;

for (const car of cars) {
  // Check if this car has a mapping in old samples
  if (oldImageMapping[car.name]) {
    const oldImage = oldImageMapping[car.name];

    if (fileExists(oldImage)) {
      console.log(`✓ ${car.name}`);
      console.log(`  Old: ${car.image}`);
      console.log(`  New: ${oldImage}`);

      // Update primary image
      car.image = oldImage;

      // Get all related images for this car
      const allImages = getAllImagesForSlug(oldImage);

      if (allImages.length > 0) {
        car.images = allImages;
        console.log(`  Images: ${allImages.length} found`);
      }

      updatedCount++;
    } else {
      console.log(`⚠️  ${car.name} - Old image doesn't exist: ${oldImage}`);
    }
  }
}

// Write updated data
const imports = fileContent.substring(0, arrayStart);
const functions = fileContent.substring(arrayEnd + 2);

const newContent = `${imports}export const cars: Car[] = ${JSON.stringify(cars, null, 2)};

${functions}`;

fs.writeFileSync(carsFile, newContent, 'utf-8');

console.log('\n' + '='.repeat(50));
console.log('✅ Update completed!');
console.log(`📊 Statistics:`);
console.log(`   Total cars: ${cars.length}`);
console.log(`   Updated with old filenames: ${updatedCount}`);
console.log(`   Using new filenames: ${cars.length - updatedCount}`);

console.log(`\n💾 Updated: ${carsFile}`);
console.log('\n📌 Primary images now match live site!');
console.log('   Clear .next cache and restart dev server.');
