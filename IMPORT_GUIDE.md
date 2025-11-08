# WordPress to Next.js Car Listings Import Guide

This guide will help you import car listings from your WordPress website to this Next.js application.

## Table of Contents

1. [Export Data from WordPress](#1-export-data-from-wordpress)
2. [Prepare the Data](#2-prepare-the-data)
3. [Run the Import Script](#3-run-the-import-script)
4. [Import Images](#4-import-images)
5. [Update the Application](#5-update-the-application)
6. [Troubleshooting](#troubleshooting)

---

## 1. Export Data from WordPress

You have several options to export your car listings from WordPress:

### Option A: Using WordPress REST API (Recommended)

If your WordPress site is still online, you can use the REST API to export listings:

```bash
# Export all car posts (replace 'cars' with your post type)
curl "https://your-wordpress-site.com/wp-json/wp/v2/cars?per_page=100" > wordpress-export.json

# If you have more than 100 listings, paginate:
curl "https://your-wordpress-site.com/wp-json/wp/v2/cars?per_page=100&page=1" > wordpress-export-1.json
curl "https://your-wordpress-site.com/wp-json/wp/v2/cars?per_page=100&page=2" > wordpress-export-2.json
```

### Option B: Using a WordPress Plugin

1. **Install WP All Export or WP All Import/Export**
   - Go to WordPress Admin → Plugins → Add New
   - Search for "WP All Export"
   - Install and activate

2. **Export to JSON**
   - Go to All Export → New Export
   - Select your car listings post type
   - Choose "JSON" as export format
   - Select all custom fields (price, year, mileage, etc.)
   - Download the JSON file

3. **Save the file as `wordpress-export.json` in the `scripts/` folder**

### Option C: Direct Database Export

If you have database access:

```sql
-- Export car listings with metadata
SELECT
    p.ID,
    p.post_title as title,
    p.post_content as content,
    GROUP_CONCAT(
        CONCAT('"', pm.meta_key, '":"', pm.meta_value, '"')
    ) as custom_fields
FROM wp_posts p
LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE p.post_type = 'cars' -- Replace with your post type
  AND p.post_status = 'publish'
GROUP BY p.ID;
```

Export this as JSON and format it as an array of objects.

### Option D: Manual Export via WordPress Admin

1. Go to your WordPress listings management page
2. Look for an "Export" button in your listing plugin
3. Common plugins with export features:
   - **DirectoryPress**: Tools → Export Listings
   - **WP Car Manager**: Cars → Export
   - **Auto Listings**: Listings → Export
   - **Car Dealer**: Inventory → Export

---

## 2. Prepare the Data

### WordPress Data Structure

The importer expects data in one of these formats:

**Format 1: Array of posts**
```json
[
  {
    "id": 123,
    "title": "Audi A6 2020",
    "content": "Description here...",
    "meta": {
      "price": "€15000",
      "year": "2020",
      "mileage": "50000",
      "fuel": "Diesel",
      "transmission": "Automatic",
      "brand": "Audi",
      "model": "A6",
      "features": ["ABS", "Airbags", "Climate Control"],
      "images": ["url1", "url2"]
    }
  }
]
```

**Format 2: WordPress REST API format**
```json
[
  {
    "id": 123,
    "title": {
      "rendered": "Audi A6 2020"
    },
    "content": {
      "rendered": "<p>Description...</p>"
    },
    "meta": {
      "price": "€15000",
      "year": "2020"
    },
    "featured_media": "https://..."
  }
]
```

**Format 3: Object with posts property**
```json
{
  "posts": [
    { /* post data */ }
  ]
}
```

### Custom Field Mapping

The importer looks for these field names (adjust in the script if yours are different):

| Car Property | WordPress Meta Keys (in order of preference) |
|--------------|---------------------------------------------|
| Price        | `price`, `_price`, `car_price`             |
| Year         | `year`, `_year`, `car_year`                |
| Mileage      | `mileage`, `_mileage`, `kilometers`        |
| Fuel Type    | `fuel`, `_fuel`, `fuel_type`               |
| Transmission | `transmission`, `_transmission`            |
| Brand        | `brand`, `_brand`, `car_brand`             |
| Model        | `model`, `_model`, `car_model`             |
| Features     | `features`, `_features`                    |
| Images       | `images`, `_images`, `gallery`             |
| Color        | `color`, `_color`                          |

### Customize Field Mapping

If your WordPress uses different field names, edit `scripts/wordpress-importer.js`:

```javascript
// Find this section and update the field names:
const price = meta.YOUR_PRICE_FIELD || '€0';
const year = meta.YOUR_YEAR_FIELD || '2024';
// etc.
```

---

## 3. Run the Import Script

1. **Place your export file**:
   ```bash
   # Make sure wordpress-export.json is in the scripts folder
   ls scripts/wordpress-export.json
   ```

2. **Run the importer**:
   ```bash
   cd kroi-auto-center
   node scripts/wordpress-importer.js
   ```

3. **Review the output**:
   - The script will create `app/data/cars-imported.ts`
   - Check this file to ensure data looks correct
   - The console will show statistics about the import

---

## 4. Import Images

### Download Images from WordPress

You need to download all car images from your WordPress media library.

#### Method 1: Manual Download

1. Go to WordPress Media Library
2. Download all car images
3. Save them to `public/cars/` folder
4. Rename files to match the slugs (e.g., `audi-a6.jpeg`)

#### Method 2: Using wget (Linux/Mac)

Create a script to download images:

```bash
#!/bin/bash
# Save as scripts/download-images.sh

mkdir -p public/cars

# Read image URLs from wordpress-export.json and download
# Adjust based on your JSON structure
cat scripts/wordpress-export.json | jq -r '.[] | .featured_media' | while read url; do
  wget -P public/cars/ "$url"
done
```

#### Method 3: WordPress Plugin

Use a plugin like "Export Media Library" to download all media files at once.

### Update Image Paths

After downloading images:

1. Rename images to match car slugs
2. Update `cars-imported.ts` with correct paths:

```typescript
// Before:
image: 'https://old-wordpress-site.com/wp-content/uploads/2024/01/car.jpg'

// After:
image: '/cars/audi-a6.jpeg'
```

You can use find-replace in your editor or create a script:

```bash
# Replace old URLs with local paths
sed -i 's|https://old-wordpress-site.com/wp-content/uploads/.*/||g' app/data/cars-imported.ts
```

---

## 5. Update the Application

### Option A: Replace Existing Cars

If you want to completely replace existing car data:

```bash
# Backup current data
cp app/data/cars.ts app/data/cars-backup.ts

# Replace with imported data
cp app/data/cars-imported.ts app/data/cars.ts
```

### Option B: Merge with Existing Cars

If you want to keep some existing cars and add imported ones:

1. Open `app/data/cars.ts`
2. Open `app/data/cars-imported.ts`
3. Copy the car objects from `importedCars` array
4. Paste them into the `cars` array in `cars.ts`
5. Remove duplicates if any

### Option C: Use Both Sources

Update `app/page.tsx` to use both:

```typescript
import { cars } from '@/app/data/cars';
import { importedCars } from '@/app/data/cars-imported';

const allCars = [...cars, ...importedCars];
```

### Test the Application

```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- [ ] All cars are displayed
- [ ] Images load correctly
- [ ] Car details are accurate
- [ ] Prices are formatted correctly
- [ ] Links work properly

---

## 6. Troubleshooting

### Issue: "wordpress-export.json not found"

**Solution**: Make sure the file is in the `scripts/` folder:
```bash
ls scripts/wordpress-export.json
```

### Issue: "Could not find listings in the export file"

**Solution**: Check your JSON structure. The importer expects:
- An array: `[{...}, {...}]`
- Or an object: `{"posts": [{...}]}`

### Issue: Images not loading

**Solutions**:
1. Check image paths in the generated file
2. Ensure images are in `public/cars/` folder
3. Use browser DevTools to see which URLs are failing
4. Update the image URLs in the data file

### Issue: Missing data fields

**Solution**: Update field mapping in `scripts/wordpress-importer.js`:

```javascript
// Add your custom fields
const customField = meta.your_field_name || meta._your_field_name || 'default';
```

### Issue: Incorrect car brands/models

**Solution**: If auto-extraction doesn't work, provide them in WordPress meta:
- Add `brand` and `model` custom fields in WordPress
- Re-export and run importer again

### Issue: Special characters in titles

**Solution**: The slug generator handles most cases, but you can manually fix:

```typescript
// In the generated file, search and replace:
slug: 'audi-a-4'  // Wrong
slug: 'audi-a4'   // Correct
```

---

## Advanced: Automated Import Pipeline

For regular imports, create an automated pipeline:

**scripts/import-pipeline.sh**:
```bash
#!/bin/bash
set -e

echo "🚗 Starting import pipeline..."

# Step 1: Export from WordPress
echo "📤 Exporting from WordPress..."
curl "https://your-site.com/wp-json/wp/v2/cars?per_page=100" > scripts/wordpress-export.json

# Step 2: Run importer
echo "🔄 Converting data..."
node scripts/wordpress-importer.js

# Step 3: Download images
echo "📸 Downloading images..."
./scripts/download-images.sh

# Step 4: Update paths
echo "🔧 Updating image paths..."
sed -i 's|https://your-site.com/wp-content/uploads/[^"]*||g' app/data/cars-imported.ts

echo "✅ Import complete! Review app/data/cars-imported.ts"
```

Make it executable:
```bash
chmod +x scripts/import-pipeline.sh
./scripts/import-pipeline.sh
```

---

## Field Reference

Here's a complete mapping of WordPress fields to Next.js Car interface:

| Next.js Property      | WordPress Source                           |
|-----------------------|-------------------------------------------|
| id                    | Generated from slug                       |
| slug                  | Generated from title                      |
| name                  | post_title / title                        |
| brand                 | meta.brand (or extracted from title)      |
| model                 | meta.model (or extracted from title)      |
| price                 | meta.price / meta._price                  |
| priceEur              | Parsed from price                         |
| year                  | meta.year / meta._year                    |
| fuel                  | meta.fuel / meta.fuel_type                |
| transmission          | meta.transmission                         |
| km                    | meta.mileage / meta.kilometers            |
| kmNumber              | Parsed from km                            |
| image                 | First image or featured_media             |
| description           | Auto-generated                            |
| detailedDescription   | Auto-generated (or use post_content)      |
| features              | meta.features (comma-separated or array)  |
| specifications        | Various meta fields                       |
| condition             | meta.condition                            |
| category              | Auto-determined or meta.category          |
| status                | meta.status (default: 'available')        |
| featured              | meta.featured                             |
| images                | meta.images / meta.gallery array          |

---

## Need Help?

If you encounter issues:

1. Check the console output for error messages
2. Verify your JSON file structure
3. Review the field mapping in the importer script
4. Check WordPress custom field names in your database
5. Look at one example car in your WordPress admin to see exact field names

For custom WordPress setups, you may need to modify the `convertWordPressListing` function in `scripts/wordpress-importer.js` to match your specific data structure.
