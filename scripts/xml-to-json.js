/**
 * WordPress XML Export to JSON Converter
 *
 * Converts WordPress WXR (XML) export to JSON format
 * that can be used with wordpress-importer.js
 *
 * Usage: node scripts/xml-to-json.js <path-to-xml-file>
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse PHP serialized array (simple version for image arrays)
 */
function parsePhpSerialized(str) {
  if (!str || typeof str !== 'string') return null;

  // Match serialized array pattern
  // Example: a:5:{i:3851;s:62:"https://...";i:3852;s:62:"https://...";}
  const images = [];
  const urlRegex = /s:\d+:"(https?:\/\/[^"]+)"/g;
  let match;

  while ((match = urlRegex.exec(str)) !== null) {
    images.push(match[1]);
  }

  return images.length > 0 ? images : null;
}

/**
 * Extract categories by domain
 */
function extractCategories(content, domain) {
  const regex = new RegExp(`<category domain="${domain}"[^>]*><!\\[CDATA\\[([^\\]]+)\\]\\]><\\/category>`, 'g');
  const categories = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    categories.push(match[1]);
  }

  return categories.length > 0 ? categories.join(', ') : null;
}

/**
 * Simple XML parser for WordPress WXR format
 * Extracts posts with their metadata
 */
function parseWordPressXML(xmlContent) {
  const posts = [];

  // Extract all items (posts)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xmlContent)) !== null) {
    const itemContent = itemMatch[1];

    // Extract post type (with CDATA support)
    const postType = extractCDATA(itemContent, 'wp:post_type');

    // Only process if it's a car/listing post (or published post)
    const postStatus = extractCDATA(itemContent, 'wp:status');

    if (postStatus !== 'publish') {
      continue; // Skip drafts, trash, etc.
    }

    // Only process 'listing' post type (or 'post' as fallback)
    if (postType !== 'listing' && postType !== 'post') {
      continue;
    }

    // Extract basic post data
    const post = {
      id: extractCDATA(itemContent, 'wp:post_id'),
      title: extractCDATA(itemContent, 'title'),
      post_title: extractCDATA(itemContent, 'title'),
      content: extractCDATA(itemContent, 'content:encoded'),
      post_content: extractCDATA(itemContent, 'content:encoded'),
      excerpt: extractCDATA(itemContent, 'excerpt:encoded'),
      post_date: extractCDATA(itemContent, 'wp:post_date'),
      post_status: postStatus,
      post_type: postType,
      link: extractTag(itemContent, 'link'),
      custom_fields: {},
      meta: {},
      images: [],
      categories: {}
    };

    // Extract taxonomies/categories
    post.categories.make = extractCategories(itemContent, 'listing_make');
    post.categories.model = extractCategories(itemContent, 'listing_model');
    post.categories.fuel_type = extractCategories(itemContent, 'listing_fuel_type');
    post.categories.transmission = extractCategories(itemContent, 'listing_transmission');
    post.categories.color = extractCategories(itemContent, 'listing_color');
    post.categories.drive_type = extractCategories(itemContent, 'listing_drive_type');
    post.categories.condition = extractCategories(itemContent, 'listing_condition');
    post.categories.type = extractCategories(itemContent, 'listing_type');
    post.categories.door = extractCategories(itemContent, 'listing_door');

    // Extract all post meta (custom fields)
    const metaRegex = /<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g;
    let metaMatch;

    while ((metaMatch = metaRegex.exec(itemContent)) !== null) {
      const metaContent = metaMatch[1];
      const metaKey = extractCDATA(metaContent, 'wp:meta_key');
      const metaValue = extractCDATA(metaContent, 'wp:meta_value');

      if (metaKey && metaValue) {
        // Store in both formats for compatibility
        post.custom_fields[metaKey] = metaValue;
        post.meta[metaKey] = metaValue;

        // Parse gallery images from serialized PHP array
        if (metaKey === '_listing_gallery') {
          const galleryImages = parsePhpSerialized(metaValue);
          if (galleryImages && galleryImages.length > 0) {
            post.images.push(...galleryImages);
          }
        }
      }
    }

    // Add processed fields for easier access
    post.meta.brand = post.categories.make;
    post.meta.model = post.categories.model;
    post.meta.fuel = post.categories.fuel_type;
    post.meta.transmission = post.categories.transmission;
    post.meta.color = post.categories.color;
    post.meta.drive = post.categories.drive_type;
    post.meta.condition = post.categories.condition;
    post.meta.type = post.categories.type;
    post.meta.doors = post.categories.door;
    post.meta.price = post.meta._listing_price;
    post.meta.year = post.meta._listing_year;
    post.meta.mileage = post.meta._listing_mileage;
    post.meta.engine = post.meta._listing_engine_size;

    // Extract featured image / attachments
    const attachmentRegex = /<wp:attachment_url>(.*?)<\/wp:attachment_url>/g;
    let attachmentMatch;

    while ((attachmentMatch = attachmentRegex.exec(itemContent)) !== null) {
      if (attachmentMatch[1]) {
        post.images.push(attachmentMatch[1].trim());
      }
    }

    // Look for image URLs in content
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let imgMatch;

    while ((imgMatch = imgRegex.exec(post.content)) !== null) {
      if (imgMatch[1] && !post.images.includes(imgMatch[1])) {
        post.images.push(imgMatch[1].trim());
      }
    }

    // Remove duplicates from images
    post.images = [...new Set(post.images)];

    posts.push(post);
  }

  return posts;
}

/**
 * Extract content from XML tag
 */
function extractTag(content, tagName) {
  const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Extract CDATA content
 */
function extractCDATA(content, tagName) {
  const regex = new RegExp(`<${tagName}><!\\[CDATA\\[(.*?)\\]\\]><\/${tagName}>`, 's');
  const match = content.match(regex);
  if (match) {
    return match[1].trim();
  }

  // Fallback to regular tag extraction
  return extractTag(content, tagName);
}

/**
 * Main conversion function
 */
function convertXMLToJSON(xmlFilePath) {
  console.log('🔄 WordPress XML to JSON Converter');
  console.log('='.repeat(50));

  // Check if file exists
  if (!fs.existsSync(xmlFilePath)) {
    console.error(`❌ Error: File not found: ${xmlFilePath}`);
    process.exit(1);
  }

  try {
    // Read XML file
    console.log(`📖 Reading XML file: ${xmlFilePath}`);
    const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');

    // Parse XML
    console.log('🔍 Parsing WordPress XML export...');
    const posts = parseWordPressXML(xmlContent);

    console.log(`📦 Found ${posts.length} published posts`);

    if (posts.length === 0) {
      console.warn('⚠️  Warning: No published posts found in the export');
      console.log('This might mean:');
      console.log('  - The export contains no published content');
      console.log('  - The post type filter is too restrictive');
      process.exit(0);
    }

    // Show post types found
    const postTypes = [...new Set(posts.map(p => p.post_type))];
    console.log(`📋 Post types found: ${postTypes.join(', ')}`);

    // Save as JSON
    const outputFile = path.join(__dirname, 'wordpress-export.json');
    console.log(`💾 Saving to: ${outputFile}`);

    fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2), 'utf-8');

    console.log('✅ Conversion completed successfully!');
    console.log(`\n📄 Output file: ${outputFile}`);
    console.log(`📊 Total posts: ${posts.length}`);

    // Show sample of first post
    if (posts.length > 0) {
      console.log('\n📝 Sample of first post:');
      console.log(`   Title: ${posts[0].title}`);
      console.log(`   Type: ${posts[0].post_type}`);
      console.log(`   Custom fields: ${Object.keys(posts[0].meta).length}`);
      console.log(`   Images: ${posts[0].images.length}`);

      // Show available custom fields from first post
      const customFields = Object.keys(posts[0].meta);
      if (customFields.length > 0) {
        console.log('\n🔑 Available custom fields (from first post):');
        customFields.slice(0, 15).forEach(key => {
          const value = posts[0].meta[key];
          const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
          console.log(`   - ${key}: ${displayValue}`);
        });
        if (customFields.length > 15) {
          console.log(`   ... and ${customFields.length - 15} more fields`);
        }
      }
    }

    console.log('\n📌 Next steps:');
    console.log('1. Review the custom fields above');
    console.log('2. Edit scripts/wordpress-importer.js if field names differ');
    console.log('3. Run: node scripts/wordpress-importer.js');

  } catch (error) {
    console.error('❌ Error during conversion:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Get input file from command line or use default
const inputFile = process.argv[2] || path.join(__dirname, 'kroiautocenter.WordPress.2025-11-03.xml');

if (require.main === module) {
  convertXMLToJSON(inputFile);
}

module.exports = { parseWordPressXML, convertXMLToJSON };
