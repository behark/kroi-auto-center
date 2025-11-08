/**
 * Download Car Images from WordPress
 *
 * This script downloads all car images from the WordPress site
 * and saves them to the public/cars/ directory
 *
 * Usage: node scripts/download-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create public/cars directory if it doesn't exist
const carsDir = path.join(__dirname, '..', 'public', 'cars');
if (!fs.existsSync(carsDir)) {
  fs.mkdirSync(carsDir, { recursive: true });
}

/**
 * Download a file from URL
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        file.close();
        fs.unlinkSync(filepath);
        downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

/**
 * Generate a safe filename from URL
 */
function getSafeFilename(url, carSlug, index) {
  const urlPath = new URL(url).pathname;
  const extension = path.extname(urlPath) || '.webp';

  // Create filename: carslug-index.ext
  if (index === 0) {
    return `${carSlug}${extension}`;
  } else {
    return `${carSlug}-${index}${extension}`;
  }
}

/**
 * Main download function
 */
async function downloadAllImages() {
  console.log('📸 Car Image Downloader');
  console.log('='.repeat(50));

  // Read imported cars data
  const importedFile = path.join(__dirname, '..', 'app', 'data', 'cars-imported.ts');

  if (!fs.existsSync(importedFile)) {
    console.error('❌ Error: cars-imported.ts not found!');
    console.log('Please run the WordPress importer first.');
    process.exit(1);
  }

  // Parse the TypeScript file to extract image URLs
  const fileContent = fs.readFileSync(importedFile, 'utf-8');

  // Extract all image URLs using regex
  const urlRegex = /"url":\s*"(https?:\/\/[^"]+)"/g;
  const imageUrls = [];
  let match;

  while ((match = urlRegex.exec(fileContent)) !== null) {
    if (!imageUrls.includes(match[1])) {
      imageUrls.push(match[1]);
    }
  }

  console.log(`📦 Found ${imageUrls.length} images to download`);
  console.log(`📁 Saving to: ${carsDir}`);
  console.log('');

  const downloaded = [];
  const failed = [];
  let count = 0;

  // Parse cars to get proper structure
  const carsMatch = fileContent.match(/export const importedCars: Car\[\] = (\[[\s\S]*\]);/);
  if (!carsMatch) {
    console.error('❌ Could not parse cars data');
    process.exit(1);
  }

  // Use eval carefully - only on trusted data we generated
  let cars;
  try {
    // Remove the array and parse as JSON
    const jsonStr = carsMatch[1];
    cars = JSON.parse(jsonStr);
  } catch (e) {
    console.error('❌ Could not parse cars JSON');
    process.exit(1);
  }

  // Download images for each car
  for (const car of cars) {
    console.log(`\n🚗 Processing: ${car.name}`);

    if (!car.images || car.images.length === 0) {
      console.log('   ⚠️  No images found');
      continue;
    }

    for (let i = 0; i < car.images.length; i++) {
      const img = car.images[i];
      const url = img.url;

      if (!url.startsWith('http')) {
        console.log(`   ⏭️  Skipping local path: ${url}`);
        continue;
      }

      const filename = getSafeFilename(url, car.slug, i);
      const filepath = path.join(carsDir, filename);

      // Skip if already exists
      if (fs.existsSync(filepath)) {
        console.log(`   ✓ Already exists: ${filename}`);
        downloaded.push({ car: car.slug, index: i, filename, url });
        continue;
      }

      try {
        count++;
        process.stdout.write(`   📥 [${count}/${imageUrls.length}] Downloading: ${filename}...`);

        await downloadFile(url, filepath);

        console.log(' ✓');
        downloaded.push({ car: car.slug, index: i, filename, url });

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(` ✗ (${error.message})`);
        failed.push({ car: car.slug, index: i, url, error: error.message });
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Download complete!`);
  console.log(`📊 Statistics:`);
  console.log(`   Total images: ${imageUrls.length}`);
  console.log(`   Downloaded: ${downloaded.length}`);
  console.log(`   Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n⚠️  Failed downloads:');
    failed.forEach(f => {
      console.log(`   - ${f.car}: ${f.url}`);
      console.log(`     Error: ${f.error}`);
    });
  }

  // Create a mapping file
  const mappingFile = path.join(__dirname, 'image-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify({
    downloaded,
    failed,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log(`\n📝 Mapping saved to: ${mappingFile}`);
  console.log('\n📌 Next step: Run node scripts/update-image-paths.js');
}

// Run the downloader
downloadAllImages().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
