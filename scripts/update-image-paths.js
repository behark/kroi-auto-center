/**
 * Update Image Paths in Imported Cars
 *
 * Updates WordPress image URLs to local paths after downloading
 *
 * Usage: node scripts/update-image-paths.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate local path from WordPress URL
 */
function getLocalPath(url, carSlug, index) {
  if (!url.startsWith('http')) {
    return url; // Already a local path
  }

  const urlPath = new URL(url).pathname;
  const extension = path.extname(urlPath) || '.webp';

  if (index === 0) {
    return `/cars/${carSlug}${extension}`;
  } else {
    return `/cars/${carSlug}-${index}${extension}`;
  }
}

/**
 * Main update function
 */
function updateImagePaths() {
  console.log('🔧 Updating Image Paths');
  console.log('='.repeat(50));

  const importedFile = path.join(__dirname, '..', 'app', 'data', 'cars-imported.ts');

  if (!fs.existsSync(importedFile)) {
    console.error('❌ Error: cars-imported.ts not found!');
    process.exit(1);
  }

  // Read the file
  let fileContent = fs.readFileSync(importedFile, 'utf-8');

  // Parse cars data
  const carsMatch = fileContent.match(/export const importedCars: Car\[\] = (\[[\s\S]*\]);/);
  if (!carsMatch) {
    console.error('❌ Could not parse cars data');
    process.exit(1);
  }

  let cars;
  try {
    cars = JSON.parse(carsMatch[1]);
  } catch (e) {
    console.error('❌ Could not parse cars JSON:', e.message);
    process.exit(1);
  }

  console.log(`📦 Processing ${cars.length} cars...`);

  let updatedCount = 0;

  // Update image paths for each car
  for (const car of cars) {
    if (!car.images || car.images.length === 0) continue;

    let carUpdated = false;

    for (let i = 0; i < car.images.length; i++) {
      const img = car.images[i];

      if (img.url.startsWith('http')) {
        const localPath = getLocalPath(img.url, car.slug, i);
        img.url = localPath;
        carUpdated = true;

        // Update primary image too
        if (img.isPrimary) {
          car.image = localPath;
        }
      }
    }

    if (carUpdated) {
      updatedCount++;
    }
  }

  console.log(`✓ Updated ${updatedCount} cars`);

  // Generate updated TypeScript file
  const tsContent = `// Auto-generated from WordPress import
// Generated on: ${new Date().toISOString()}
// Total cars: ${cars.length}
// Images updated to local paths

import { Car } from './cars';

export const importedCars: Car[] = ${JSON.stringify(cars, null, 2)};
`;

  // Save the updated file
  fs.writeFileSync(importedFile, tsContent, 'utf-8');

  console.log(`✅ Updated file saved: ${importedFile}`);
  console.log('\n📌 Next step: Replace cars.ts with imported data');
}

// Run the updater
try {
  updateImagePaths();
} catch (error) {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}
