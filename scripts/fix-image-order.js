/**
 * Fix Image Order to Match WordPress Gallery
 *
 * This script restores the exact image order from WordPress
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  Fixing Image Order to Match WordPress');
console.log('='.repeat(50));

// Read WordPress export with original image order
const wpExportFile = path.join(__dirname, 'wordpress-export.json');
const wpExport = JSON.parse(fs.readFileSync(wpExportFile, 'utf-8'));

console.log(`📦 Found ${wpExport.length} cars in WordPress export`);

// Read image mapping from download
const mappingFile = path.join(__dirname, 'image-mapping.json');
let imageMapping = { downloaded: [] };

if (fs.existsSync(mappingFile)) {
  imageMapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
  console.log(`📸 Found ${imageMapping.downloaded.length} downloaded images`);
}

// Read current cars data
const carsFile = path.join(__dirname, '..', 'app', 'data', 'cars.ts');
const fileContent = fs.readFileSync(carsFile, 'utf-8');

// Extract cars array
const arrayStart = fileContent.indexOf('export const cars: Car[] = [');
const arrayEnd = fileContent.lastIndexOf('];', fileContent.indexOf('export function'));
const carsArrayStr = fileContent.substring(arrayStart + 'export const cars: Car[] = '.length, arrayEnd + 1);
const cars = JSON.parse(carsArrayStr);

console.log(`🚗 Processing ${cars.length} cars...\n`);

// Helper to find downloaded file for a WordPress URL
function findDownloadedFile(wpUrl, carSlug) {
  // Try to find in mapping first
  const mapping = imageMapping.downloaded.find(m => m.url === wpUrl && m.car === carSlug);
  if (mapping) {
    return `/cars/${mapping.filename}`;
  }

  // Fallback: try to match by URL pattern
  const urlFilename = path.basename(wpUrl);
  const carsDir = path.join(__dirname, '..', 'public', 'cars');
  const allFiles = fs.readdirSync(carsDir);

  // Look for file that contains the original filename or slug
  const matches = allFiles.filter(f => {
    const fLower = f.toLowerCase();
    const slugPart = carSlug.split('-').slice(0, 3).join('-');
    return fLower.includes(slugPart) &&
           (fLower.includes(path.parse(urlFilename).name.toLowerCase()) ||
            f.includes(urlFilename.replace(/\.(webp|jpg|jpeg|png)$/i, '')));
  });

  if (matches.length > 0) {
    return `/cars/${matches[0]}`;
  }

  return null;
}

// Process each car
let fixedCount = 0;
let errors = [];

for (const car of cars) {
  // Find corresponding WordPress export
  const wpCar = wpExport.find(wp =>
    wp.id === car.id ||
    wp.title === car.name ||
    wp.post_title === car.name ||
    (wp.meta && wp.meta.price === car.priceEur.toString())
  );

  if (!wpCar) {
    console.log(`⚠️  Could not find WordPress data for: ${car.name}`);
    continue;
  }

  if (!wpCar.images || wpCar.images.length === 0) {
    // No images in WordPress, skip
    continue;
  }

  // Get WordPress images in original order
  const wpImages = wpCar.images;

  // Try to match each WordPress image to downloaded file
  const orderedImages = [];
  const notFound = [];

  for (let i = 0; i < wpImages.length; i++) {
    const wpUrl = wpImages[i];
    const downloadedPath = findDownloadedFile(wpUrl, car.slug);

    if (downloadedPath) {
      // Check if file actually exists
      const filePath = path.join(__dirname, '..', 'public', downloadedPath.replace('/cars/', 'cars/'));
      if (fs.existsSync(filePath)) {
        orderedImages.push({
          url: downloadedPath,
          altText: car.slug,
          order: i + 1,
          isPrimary: i === 0
        });
      } else {
        notFound.push(wpUrl);
      }
    } else {
      notFound.push(wpUrl);
    }
  }

  // Update car images if we found matches
  if (orderedImages.length > 0) {
    const before = car.images.length;
    car.images = orderedImages;
    car.image = orderedImages[0].url;

    if (orderedImages.length !== wpImages.length) {
      console.log(`🚗 ${car.name}`);
      console.log(`   ✓ Fixed order: ${orderedImages.length}/${wpImages.length} images matched`);
      if (notFound.length > 0) {
        console.log(`   ⚠️  Could not find ${notFound.length} images`);
      }
    } else {
      console.log(`✓ ${car.name} - ${orderedImages.length} images in correct order`);
    }
    fixedCount++;
  } else {
    console.log(`❌ ${car.name} - Could not match any images`);
    errors.push(car.name);
  }
}

// Write updated data
const imports = fileContent.substring(0, arrayStart);
const functions = fileContent.substring(arrayEnd + 2);

const newContent = `${imports}export const cars: Car[] = ${JSON.stringify(cars, null, 2)};

${functions}`;

fs.writeFileSync(carsFile, newContent, 'utf-8');

console.log('\n' + '='.repeat(50));
console.log('✅ Image order fixed!');
console.log(`📊 Statistics:`);
console.log(`   Cars processed: ${cars.length}`);
console.log(`   Images reordered: ${fixedCount}`);
console.log(`   Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log(`\n⚠️  Cars with issues:`);
  errors.forEach(name => console.log(`   - ${name}`));
}

console.log(`\n💾 Updated: ${carsFile}`);
console.log('\n📌 Images now match WordPress gallery order!');
console.log('   Restart dev server to see changes.');
