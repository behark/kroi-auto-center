/**
 * WordPress to Next.js Car Listings Importer
 *
 * This script converts WordPress car listings to the Next.js format.
 *
 * Usage:
 * 1. Export your WordPress listings data (see IMPORT_GUIDE.md)
 * 2. Place the exported data in wordpress-export.json
 * 3. Run: node scripts/wordpress-importer.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert WordPress listing to Next.js Car format
 * Adjust the mapping based on your WordPress custom fields/post meta
 */
function convertWordPressListing(wpListing) {
  // Helper function to create slug from title
  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Helper function to extract brand from title or custom field
  const extractBrand = (title, meta) => {
    if (meta?.brand) return meta.brand;

    // Common car brands
    const brands = ['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Skoda', 'Seat', 'Toyota', 'Honda', 'Ford', 'Nissan'];
    const foundBrand = brands.find(brand => title.toLowerCase().includes(brand.toLowerCase()));
    return foundBrand || 'Unknown';
  };

  // Helper function to extract model
  const extractModel = (title, brand, meta) => {
    if (meta?.model) return meta.model;

    // Remove brand from title to get model
    const modelPart = title.replace(brand, '').trim();
    return modelPart.split(' ')[0] || 'Unknown';
  };

  // Map WordPress post data to Next.js Car interface
  const title = wpListing.title?.rendered || wpListing.title || wpListing.post_title || '';
  const content = wpListing.content?.rendered || wpListing.content || wpListing.post_content || '';
  const meta = wpListing.meta || wpListing.custom_fields || {};

  const brand = extractBrand(title, meta);
  const model = extractModel(title, brand, meta);
  const slug = createSlug(title);

  // Extract car details from WordPress custom fields
  // Adjust these field names based on your WordPress setup
  const price = meta.price || meta._price || meta.car_price || '€0';
  const year = meta.year || meta._year || meta.car_year || '2024';
  const fuel = meta.fuel || meta._fuel || meta.fuel_type || 'Diesel';
  const transmission = meta.transmission || meta._transmission || 'Automatic';
  const km = meta.mileage || meta._mileage || meta.kilometers || '0 km';
  const features = meta.features || meta._features || [];
  const images = meta.images || meta._images || wpListing.images || [];

  // Parse price to number
  const priceEur = parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
  const kmNumber = parseInt(km.toString().replace(/[^0-9]/g, '')) || 0;

  // Determine category based on car type
  const determineCategory = (type, model) => {
    const typeStr = (type || model || '').toLowerCase();
    if (typeStr.includes('suv') || typeStr.includes('x5') || typeStr.includes('q5')) return 'suv';
    if (typeStr.includes('sedan') || typeStr.includes('class')) return 'premium';
    if (typeStr.includes('family') || typeStr.includes('golf') || typeStr.includes('passat')) return 'family';
    return 'family';
  };

  const category = determineCategory(meta.type || meta._type, model);

  // Process images
  const processedImages = [];
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img, index) => {
      const imageUrl = typeof img === 'string' ? img : (img.url || img.src || img.guid);
      if (imageUrl) {
        processedImages.push({
          url: imageUrl,
          altText: slug,
          order: index + 1,
          isPrimary: index === 0
        });
      }
    });
  } else if (wpListing.featured_media || wpListing.featured_image) {
    // Use featured image
    const featuredImage = wpListing.featured_media || wpListing.featured_image;
    processedImages.push({
      url: typeof featuredImage === 'string' ? featuredImage : featuredImage.source_url,
      altText: slug,
      order: 1,
      isPrimary: true
    });
  }

  // If no images, use placeholder
  if (processedImages.length === 0) {
    processedImages.push({
      url: `/cars/${slug}.jpeg`,
      altText: slug,
      order: 1,
      isPrimary: true
    });
  }

  // Process features
  let featuresList = [];
  if (typeof features === 'string') {
    featuresList = features.split(',').map(f => f.trim()).filter(f => f);
  } else if (Array.isArray(features)) {
    featuresList = features;
  }

  if (featuresList.length === 0) {
    // Default features
    featuresList = [
      'Airbag Driver',
      'Airbag Passenger',
      'Anti Lock Braking System',
      'Bluetooth',
    ];
  }

  // Create specifications
  const specifications = [
    { label: 'Vuosimalli', value: year.toString() },
    { label: 'Ajetut kilometrit', value: km },
    { label: 'Polttoaine', value: fuel },
    { label: 'Vaihteisto', value: transmission },
    { label: 'Väri', value: meta.color || meta._color || 'N/A' },
    { label: 'Vetotapa', value: meta.drive || meta._drive || 'N/A' },
    { label: 'Ovet', value: meta.doors || meta._doors || '4 ovea' },
    { label: 'Tyyppi', value: meta.type || meta._type || 'Sedan' },
  ];

  // Create the car object
  return {
    id: slug,
    slug: slug,
    name: title,
    brand: brand,
    model: model,
    price: price.includes('€') ? price : `€${priceEur.toLocaleString()}`,
    priceEur: priceEur,
    year: year.toString(),
    fuel: fuel,
    transmission: transmission,
    km: km.includes('km') ? km : `${kmNumber.toLocaleString()} km`,
    kmNumber: kmNumber,
    image: processedImages[0].url,
    description: `${brand} ${model} vuodelta ${year}.`,
    detailedDescription: [
      `Tämä ${brand} ${title} on loistava valinta luotettavasta ja mukavasta kulkuneuvosta.`,
      `Auto on varustettu ${transmission}vaihteistolla ja ${fuel}moottorilla.`,
      'Auto on käyty läpi huolellisesti ja se on valmis uuteen kotiin.',
    ],
    features: featuresList,
    specifications: specifications,
    condition: meta.condition || meta._condition || 'Used kunto. Säännöllisesti huollettu.',
    category: category,
    status: meta.status || 'available',
    featured: meta.featured === true || meta.featured === 'true' || meta._featured === '1',
    images: processedImages
  };
}

/**
 * Main import function
 */
function importWordPressListings() {
  const inputFile = path.join(__dirname, 'wordpress-export.json');
  const outputFile = path.join(__dirname, '..', 'app', 'data', 'cars-imported.ts');

  console.log('🚗 WordPress to Next.js Car Listings Importer');
  console.log('='.repeat(50));

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error('❌ Error: wordpress-export.json not found!');
    console.log('\nPlease create scripts/wordpress-export.json with your WordPress data.');
    console.log('See IMPORT_GUIDE.md for instructions on how to export from WordPress.');
    process.exit(1);
  }

  try {
    // Read WordPress export
    console.log('📖 Reading WordPress export...');
    const wpData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    let listings = [];

    // Handle different WordPress export formats
    if (Array.isArray(wpData)) {
      listings = wpData;
    } else if (wpData.posts || wpData.listings) {
      listings = wpData.posts || wpData.listings;
    } else if (wpData.data) {
      listings = wpData.data;
    } else {
      console.error('❌ Error: Could not find listings in the export file.');
      console.log('Expected an array of posts or an object with posts/listings/data property.');
      process.exit(1);
    }

    console.log(`📦 Found ${listings.length} listings to import`);

    // Convert all listings
    console.log('🔄 Converting listings...');
    const convertedCars = listings.map((listing, index) => {
      console.log(`  Processing ${index + 1}/${listings.length}: ${listing.title?.rendered || listing.title || listing.post_title || 'Untitled'}`);
      return convertWordPressListing(listing);
    });

    // Generate TypeScript file
    console.log('📝 Generating TypeScript file...');
    const tsContent = `// Auto-generated from WordPress import
// Generated on: ${new Date().toISOString()}
// Total cars: ${convertedCars.length}

import { Car } from './cars';

export const importedCars: Car[] = ${JSON.stringify(convertedCars, null, 2)};
`;

    fs.writeFileSync(outputFile, tsContent, 'utf-8');

    console.log('✅ Import completed successfully!');
    console.log(`📄 Generated: ${outputFile}`);
    console.log(`🚗 Total cars imported: ${convertedCars.length}`);
    console.log('\nNext steps:');
    console.log('1. Review the imported data in app/data/cars-imported.ts');
    console.log('2. Download and organize images (see IMPORT_GUIDE.md)');
    console.log('3. Merge with existing cars.ts or replace it');
    console.log('4. Update image paths to match your public/cars/ directory');

  } catch (error) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  }
}

// Run the importer
if (require.main === module) {
  importWordPressListings();
}

module.exports = { convertWordPressListing, importWordPressListings };
