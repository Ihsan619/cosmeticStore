/**
 * Choicez.lk - Sanity Product Migration Script
 * Safe import process that preserves stable product IDs, uploads images, and avoids duplicates.
 *
 * Usage:
 *   node tools/migrate-to-sanity.cjs --dry-run
 *   node tools/migrate-to-sanity.cjs --token <SANITY_WRITE_TOKEN> [--project <PROJECT_ID>] [--dataset <DATASET>]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

function getArg(name, fallback) {
  const index = args.indexOf(name);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return fallback;
}

const projectId = getArg('--project', process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID);
const dataset = getArg('--dataset', process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production');
const token = getArg('--token', process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN);

const backupFile = path.resolve(__dirname, '../migration/backup-products.json');

if (!fs.existsSync(backupFile)) {
  console.error(`[ERROR] Backup file not found at ${backupFile}`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

console.log('=== Choicez.lk Sanity Product Migration ===');
console.log(`Found ${products.length} product(s) in migration backup.`);
console.log(`Target: Project [${projectId || 'NOT_CONFIGURED'}], Dataset [${dataset}]`);
console.log(`Mode: ${isDryRun ? 'DRY RUN (no network changes)' : 'LIVE IMPORT'}\n`);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function request(method, urlPath, headers, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectId}.api.sanity.io`,
      port: 443,
      path: urlPath,
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error (${res.statusCode}): ${JSON.stringify(parsed)}`));
          }
        } catch (err) {
          reject(new Error(`Response parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function uploadImageAsset(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectId}.api.sanity.io`,
      port: 443,
      path: `/v2024-01-01/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
        'Content-Length': imageBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed.document);
          } else {
            reject(new Error(`Upload Error (${res.statusCode}): ${JSON.stringify(parsed)}`));
          }
        } catch (err) {
          reject(new Error(`Upload parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(imageBuffer);
    req.end();
  });
}

async function run() {
  if (isDryRun) {
    for (const [i, p] of products.entries()) {
      const slug = slugify(p.name);
      console.log(`[DRY-RUN] Product ${i + 1}/${products.length}:`);
      console.log(`  - Name: "${p.name}"`);
      console.log(`  - Category: ${p.category}`);
      console.log(`  - Slug: ${slug}`);
      console.log(`  - Stable ID: ${p.id}`);
      console.log(`  - Price: ${p.price !== null ? 'LKR ' + p.price : 'null (Ask us for price)'}`);
      console.log(`  - Availability: ${p.availability}`);
      console.log(`  - Image present: ${Boolean(p.image)}`);
    }
    console.log('\nDry run completed successfully. No changes were made to Sanity.');
    return;
  }

  if (!projectId || projectId === 'your_project_id_here' || projectId === 'b8e94h7q') {
    console.error('[ERROR] Please specify a valid --project <ID> or set SANITY_PROJECT_ID');
    process.exit(1);
  }

  if (!token) {
    console.error('[ERROR] A Sanity write token is required for live migration.');
    console.error('Run: node tools/migrate-to-sanity.cjs --token <YOUR_SANITY_TOKEN>');
    console.error('Or test the mapping first with: node tools/migrate-to-sanity.cjs --dry-run');
    process.exit(1);
  }

  // Check existing products in Sanity to prevent duplicate import
  console.log('Checking for existing products in Sanity...');
  const query = encodeURIComponent('*[_type == "product"]{_id, slug, name}');
  const existing = await request('GET', `/v2024-01-01/data/query/${dataset}?query=${query}`);
  const existingList = existing.result || [];
  console.log(`Found ${existingList.length} existing product(s) in Sanity.\n`);

  for (const [i, p] of products.entries()) {
    const slug = slugify(p.name);
    const docId = p.id || `product-${slug}`;

    const alreadyExists = existingList.some(
      (e) => e._id === docId || (e.slug && e.slug.current === slug) || e.name === p.name
    );

    if (alreadyExists) {
      console.log(`[SKIP] "${p.name}" already exists in Sanity. Skipping duplicate.`);
      continue;
    }

    console.log(`[IMPORTING] ${i + 1}/${products.length}: "${p.name}"...`);

    let mainPhoto = undefined;

    if (p.image) {
      let buffer = null;
      let filename = `${slug}.jpg`;

      if (p.image.startsWith('data:image/')) {
        const base64Data = p.image.replace(/^data:image\/\w+;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        const localImagePath = path.resolve(__dirname, '../dist', p.image);
        if (fs.existsSync(localImagePath)) {
          buffer = fs.readFileSync(localImagePath);
          filename = path.basename(localImagePath);
        }
      }

      if (buffer) {
        console.log(`  Uploading photo (${(buffer.length / 1024).toFixed(1)} KB)...`);
        const assetDoc = await uploadImageAsset(buffer, filename);
        mainPhoto = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetDoc._id,
          },
          alt: `${p.name} product photo`,
        };
        console.log(`  Photo uploaded with asset ID: ${assetDoc._id}`);
      }
    }

    const doc = {
      _id: docId,
      _type: 'product',
      name: p.name,
      slug: {
        _type: 'slug',
        current: slug,
      },
      category: p.category,
      brand: p.brand || undefined,
      price: typeof p.price === 'number' ? p.price : undefined,
      description: p.description || undefined,
      variants: p.variants || undefined,
      availability: p.availability || 'In stock',
      featured: false,
      displayOrder: (i + 1) * 10,
      mainPhoto,
    };

    const mutations = [{createOrReplace: doc}];
    await request('POST', `/v2024-01-01/data/mutate/${dataset}`, {'Content-Type': 'application/json'}, JSON.stringify({mutations}));
    console.log(`[SUCCESS] Imported "${p.name}" with ID: ${docId}\n`);
  }

  console.log('Migration complete!');
}

run().catch((err) => {
  console.error('\n[MIGRATION FAILED]', err.message);
  process.exit(1);
});
