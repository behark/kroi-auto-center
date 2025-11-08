/**
 * Merge WordPress Import with Old Sample Filenames
 *
 * This ensures imported cars use the same image filenames
 * as the old sample data where they match
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Merging WordPress Data with Old Sample Filenames');
console.log('='.repeat(50));

// Read old sample data
const oldSamplesFile = path.join(__dirname, '..', 'app', 'data', 'cars-old-samples.ts.backup');
const oldContent = fs.readFileSync(oldSamplesFile, 'utf-8');

// Convert TypeScript to JSON-parseable format
let oldDataStr = oldContent
  .replace(/export const cars: Car\[\] = /, '')
  .replace(/export function.*/s, '')
  .trim();

// Remove trailing semicolon and functions
if (oldDataStr.endsWith(';')) {
  oldDataStr = oldDataStr.slice(0, -1);
}

// Find the actual array
const arrayMatch = oldDataStr.match(/\[([\s\S]*)\]/);
if (!arrayMatch) {
  console.error('❌ Could not find array in old samples');
  process.exit(1);
}

// Replace single quotes with double quotes for JSON compatibility
let jsonStr = '[' + arrayMatch[1] + ']';
jsonStr = jsonStr.replace(/'/g, '"');
jsonStr = jsonStr.replace(/(\w+):/g, '"$1":'); // Add quotes to keys

const oldCars = JSON.parse(jsonStr);
console.log(`📦 Loaded ${oldCars.length} cars from old samples`);

// Read current imported data
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

// Helper to match cars
function findMatchingOldCar(newCar, oldCars) {
  // Try exact name match
  let match = oldCars.find(old => old.name === newCar.name);
  if (match) return match;

  // Try brand + model match
  match = oldCars.find(old =>
    old.brand === newCar.brand &&
    old.model === newCar.model
  );
  if (match) return match;

  // Try partial name match
  const newCarWords = newCar.name.toLowerCase().split(' ').filter(w => w.length > 2);
  match = oldCars.find(old => {
    const oldWords = old.name.toLowerCase().split(' ').filter(w => w.length > 2);
    const commonWords = newCarWords.filter(w => oldWords.includes(w));
    return commonWords.length >= 2; // At least 2 words in common
  });

  return match;
}

let mergedCount = 0;
let notMerged = [];

for (const car of cars) {
  const oldCar = findMatchingOldCar(car, oldCars);

  if (oldCar && oldCar.image && fileExists(oldCar.image)) {
    console.log(`✓ ${car.name}`);
    console.log(`  Matched with: ${oldCar.name}`);
    console.log(`  Using old filename: ${oldCar.image}`);

    // Use old car's image filename
    car.image = oldCar.image;

    // Update images array if the old car had images
    if (oldCar.images && oldCar.images.length > 0) {
      // Filter old images to only those that exist
      const validOldImages = oldCar.images.filter(img => fileExists(img.url));

      if (validOldImages.length > 0) {
        // Keep any NEW images that weren't in the old data
        const oldImageUrls = validOldImages.map(img => img.url);
        const newUniqueImages = car.images.filter(img =>
          !oldImageUrls.includes(img.url) && fileExists(img.url)
        );

        // Merge: old images first (maintaining order), then new unique ones
        car.images = [...validOldImages, ...newUniqueImages];

        // Update order numbers
        car.images.forEach((img, idx) => {
          img.order = idx + 1;
          img.isPrimary = idx === 0;
          img.altText = car.slug; // Update alt text to new slug
        });

        console.log(`  Images: ${validOldImages.length} from old + ${newUniqueImages.length} new = ${car.images.length} total`);
      }
    }

    mergedCount++;
  } else {
    notMerged.push(car.name);
  }
}

// Write updated data
const imports = fileContent.substring(0, arrayStart);
const functions = fileContent.substring(arrayEnd + 2);

const newContent = `${imports}export const cars: Car[] = ${JSON.stringify(cars, null, 2)};

${functions}`;

fs.writeFileSync(carsFile, newContent, 'utf-8');

console.log('\n' + '='.repeat(50));
console.log('✅ Merge completed!');
console.log(`📊 Statistics:`);
console.log(`   Total cars: ${cars.length}`);
console.log(`   Merged with old filenames: ${mergedCount}`);
console.log(`   Using new filenames: ${notMerged.length}`);

if (notMerged.length > 0 && notMerged.length < 20) {
  console.log(`\n📝 Cars using new filenames (no old match):`);
  notMerged.forEach(name => console.log(`   - ${name}`));
}

console.log(`\n💾 Updated: ${carsFile}`);
console.log('\n📌 Images now use old sample filenames where they match!');
console.log('   This should match the live WordPress site.');
