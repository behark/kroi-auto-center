/**
 * Fix Primary Images to Match WordPress
 *
 * Ensures the primary/thumbnail image on each card matches
 * what WordPress shows as the first image
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  Fixing Primary Images to Match WordPress');
console.log('='.repeat(50));

// Read WordPress export
const wpExportFile = path.join(__dirname, 'wordpress-export.json');
const wpExport = JSON.parse(fs.readFileSync(wpExportFile, 'utf-8'));

console.log(`📦 Loaded ${wpExport.length} cars from WordPress`);

// Read image mapping
const mappingFile = path.join(__dirname, 'image-mapping.json');
let imageMapping = { downloaded: [] };
if (fs.existsSync(mappingFile)) {
  imageMapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
}

// Read current cars data
const carsFile = path.join(__dirname, '..', 'app', 'data', 'cars.ts');
const fileContent = fs.readFileSync(carsFile, 'utf-8');

const arrayStart = fileContent.indexOf('export const cars: Car[] = [');
const arrayEnd = fileContent.lastIndexOf('];', fileContent.indexOf('export function'));
const carsArrayStr = fileContent.substring(arrayStart + 'export const cars: Car[] = '.length, arrayEnd + 1);
const cars = JSON.parse(carsArrayStr);

console.log(`🚗 Processing ${cars.length} cars...\n`);

// Helper to find downloaded file for WordPress URL
function findDownloadedImage(wpUrl, carSlug) {
  // Try mapping first
  const mapping = imageMapping.downloaded.find(m => m.url === wpUrl);
  if (mapping) {
    return `/cars/${mapping.filename}`;
  }

  // Extract filename from URL
  const urlFilename = path.basename(wpUrl).replace(/\.(webp|jpg|jpeg|png)$/i, '');
  const carsDir = path.join(__dirname, '..', 'public', 'cars');

  if (!fs.existsSync(carsDir)) {
    return null;
  }

  const allFiles = fs.readdirSync(carsDir);

  // Try to find matching file
  const matches = allFiles.filter(f => {
    const fName = f.toLowerCase();
    const slug = carSlug.toLowerCase();

    // Check if filename contains the original name or slug
    return (fName.includes(urlFilename.toLowerCase()) ||
            (fName.startsWith(slug) && fName.match(/\.(webp|jpg|jpeg|png)$/i)));
  });

  if (matches.length > 0) {
    // Prefer exact match
    const exactMatch = matches.find(f => f.toLowerCase().includes(urlFilename.toLowerCase()));
    return `/cars/${exactMatch || matches[0]}`;
  }

  return null;
}

let fixedCount = 0;
let errors = [];

for (const car of cars) {
  // Find WordPress car
  const wpCar = wpExport.find(wp =>
    wp.title === car.name ||
    wp.post_title === car.name ||
    (wp.meta && wp.meta.price === car.priceEur.toString())
  );

  if (!wpCar || !wpCar.images || wpCar.images.length === 0) {
    continue;
  }

  // Get the FIRST image from WordPress (this is the primary)
  const wpPrimaryImageUrl = wpCar.images[0];

  // Find the corresponding downloaded file
  const localPrimaryImage = findDownloadedImage(wpPrimaryImageUrl, car.slug);

  if (!localPrimaryImage) {
    console.log(`⚠️  ${car.name} - Could not find primary image locally`);
    errors.push(car.name);
    continue;
  }

  // Check if current primary is different
  if (car.image !== localPrimaryImage) {
    console.log(`✓ ${car.name}`);
    console.log(`  Old primary: ${car.image}`);
    console.log(`  New primary: ${localPrimaryImage}`);

    // Update main image
    car.image = localPrimaryImage;

    // Update images array - make sure the primary image is first
    if (car.images && car.images.length > 0) {
      // Remove the new primary from wherever it is
      car.images = car.images.filter(img => img.url !== localPrimaryImage);

      // Add it as the first image
      car.images.unshift({
        url: localPrimaryImage,
        altText: car.slug,
        order: 1,
        isPrimary: true
      });

      // Update order numbers and isPrimary for remaining images
      car.images.forEach((img, idx) => {
        img.order = idx + 1;
        img.isPrimary = idx === 0;
      });
    }

    fixedCount++;
  } else {
    console.log(`  ${car.name} - Already correct`);
  }
}

// Write updated data
const imports = fileContent.substring(0, arrayStart);
const functions = fileContent.substring(arrayEnd + 2);

const newContent = `${imports}export const cars: Car[] = ${JSON.stringify(cars, null, 2)};

${functions}`;

fs.writeFileSync(carsFile, newContent, 'utf-8');

console.log('\n' + '='.repeat(50));
console.log('✅ Primary images fixed!');
console.log(`📊 Statistics:`);
console.log(`   Cars processed: ${cars.length}`);
console.log(`   Primary images fixed: ${fixedCount}`);
console.log(`   Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log(`\n⚠️  Cars with issues:`);
  errors.forEach(name => console.log(`   - ${name}`));
}

console.log(`\n💾 Updated: ${carsFile}`);
console.log('\n📌 Primary images now match WordPress!');
console.log('   Restart dev server and hard refresh browser to see changes.');
