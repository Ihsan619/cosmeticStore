# Choicez.lk

**Setup status:** Sanity integration is implemented, but the configured `production` dataset was not found and the CLI requires login. Follow [the setup checklist](docs/SANITY-SETUP.md) before using the live catalogue.

A responsive, high-aesthetic product catalogue for Choicez.lk with search, category filtering, price sorting, detail dialogs, direct product links, and WhatsApp enquiries. Powered by a static HTML/CSS/JS storefront and an authenticated **Sanity Studio** for online product and photo management.

No checkout, payment gateway, or customer accounts—this is a browse-and-enquire catalogue.

---

## Quick Start & Local Development

### 1. Storefront
Run the local static server:
```bash
npm run dev
# or: node serve.cjs
```
Open **http://127.0.0.1:4173** to preview the storefront.

### 2. Sanity Studio
Run the standalone Sanity Studio:
```bash
npm run studio:dev
# or: cd studio && npm run dev
```
Open **http://localhost:3333** to access the local product management dashboard.

### 3. Verify Code & Types
```bash
npm run check
```
This runs syntax validation on `dist/app.js` and `serve.cjs`, and TypeScript type-checking on `studio/`.

---

## Sanity Project & Dataset Configuration

Sanity stores all product documents and photos in a secure cloud dataset.

### Storefront Configuration: `dist/sanity-config.js`
The storefront reads public product records directly via Sanity's high-speed GROQ CDN API:
```javascript
window.CHOICEZ_SANITY_CONFIG = {
  projectId: 'YOUR_PROJECT_ID', // Replace with your Sanity Project ID
  dataset: 'production',        // Default public dataset
  apiVersion: '2024-01-01',
  useCdn: true,                 // Set false for instant cache bypass
};
```
*Note: The storefront only reads published documents. No API write tokens or secret credentials are ever exposed in public frontend code.*

### Studio Configuration: `studio/sanity.config.ts` & `studio/.env.local`
Studio configuration uses environment variables or direct config:
- `SANITY_STUDIO_PROJECT_ID`: Your Sanity project ID
- `SANITY_STUDIO_DATASET`: `production`

An example environment file is provided at `studio/.env.example`.

---

## Deploying Sanity Studio

Sanity provides free managed hosting for Studio:

1. Log into your Sanity account in your terminal:
   ```bash
   npx sanity login
   ```
2. Deploy the Studio:
   ```bash
   npm run studio:deploy
   # or: cd studio && npx sanity deploy
   ```
3. Enter your desired studio hostname (e.g. `choicez-lk` or `choicez-studio`).
4. Once deployed, authorized staff can access Studio directly from desktops and mobile phones at `https://<your-subdomain>.sanity.studio`.

---

## Managing Products in Sanity Studio

### Product Schema Fields
- **Product Name** (required): Maximum 160 characters.
- **Slug** (required): Unique URL identifier generated automatically from the product name.
- **Category** (required): `Cosmetics`, `Creams & skincare`, `Perfumes`, `Gift hampers`, or `Watches`.
- **Brand** (optional): e.g. "VATIKA", "Victoria's Secret".
- **Price in LKR** (optional): Non-negative number. Leave blank to display *"Ask us for the price"*.
- **Description**: Detailed product information or notes.
- **Sizes, shades or options**: e.g. "50ml, 100ml" or "Shade 01 Nude".
- **Main Product Photo** (required): High-resolution photo with interactive hotspot cropping and required accessibility alternative text.
- **Additional Photos**: Optional gallery images.
- **Availability**: `In stock`, `Ask about availability`, `Available to order`, or `Out of stock`.
- **Featured Product**: Toggle to feature in highlight collections.
- **Display Order**: Number determining catalogue order (lower numbers appear first, e.g. 10, 20, 30).

### How to Add & Publish a Product
1. In Studio, click **All Products** or select a category.
2. Click the pencil/create icon in the top right.
3. Fill in the product name and click **Generate** for the slug.
4. Select category, upload a main photo, and provide alt text.
5. Set price and availability.
6. Click the green **Publish** button at the bottom right.

### Drafts vs. Published
- **Drafts**: Any edits or new documents that have not been published remain saved as drafts in Sanity. The storefront queries `!(_id in path("drafts.**"))`, so drafts never appear on the public website.
- **Unpublishing**: To temporarily hide an item from the public site, click the document menu (three dots next to Publish) and choose **Unpublish**.
- **Deleting**: To permanently remove a product, choose **Delete** from the document menu.

---

## Configuring CORS Origins (Allowed Websites)

Sanity requires you to whitelist websites that are allowed to fetch data from your project.

1. Go to **[https://www.sanity.io/manage](https://www.sanity.io/manage)**.
2. Select your project (**Choicez.lk**).
3. Navigate to **API** &rarr; **CORS Origins**.
4. Click **Add CORS origin** and add:
   - `http://localhost:4173` (for local storefront testing)
   - `http://127.0.0.1:4173` (for local storefront testing)
   - `https://your-choicez-store.vercel.app` (your Vercel production domain)
   - `https://choicez.lk` (custom domain, when connected)
5. Keep **Allow credentials** unchecked (the storefront uses public read-only requests).

---

## Inviting Staff & Role Permissions

1. Visit **[https://www.sanity.io/manage](https://www.sanity.io/manage)** and select your project.
2. Click **Members** &rarr; **Invite members**.
3. Enter the staff member's email address.
4. On the **Free Plan**, you can assign:
   - **Administrator**: Full access to project settings, billing, API tokens, and dataset management.
   - **Viewer**: Read-only access. Free-plan editing users require Administrator access. Choose a plan with an Editor role if staff should edit products without administering the project.

Staff can log into Studio using Google, GitHub, or email-based magic links directly on their mobile phone or laptop.

---

## Backups & Safe Migration

A documented pre-migration backup of the legacy product catalogue is saved in:
- `migration/backup-products.json`
- `migration/vatika-styling-hair-cream.jpg`
- `migration/MIGRATION.md`

### To Import / Migrate Products into Sanity:
```bash
# Test migration mapping in dry-run mode (no network calls):
npm run migrate -- --dry-run

# Run live migration:
# Set SANITY_WRITE_TOKEN in your local terminal environment; never commit it.
npm run migrate -- --project <PROJECT_ID>
```
The migration script ensures:
- Existing product IDs and names are checked to prevent duplicate creation.
- Photos are uploaded to Sanity Asset Storage and linked to `mainPhoto`.
- Stable IDs (`cz-14da95ef-ea94-4a0f-a078-783f087d738f`) and slugs are preserved so existing WhatsApp links continue working.

### Exporting Backups from Sanity:
To download a complete JSON export of your dataset at any time:
```bash
npx sanity dataset export production backup.tar.gz
```

---

## Free Plan Limits & What They Mean

Sanity's standard Free tier includes generous allowances for a browse-and-enquire catalogue:
- **Users**: Up to 20 user seats included.
- **Datasets**: 2 datasets (e.g. `production` and a staging/test dataset).
- **Documents**: Up to 100,000 documents (sufficient for thousands of catalogue items).
- **Bandwidth**: 100 GB / month included.
- **API requests**: 500,000 requests / month included.
- **Asset storage**: 100 GB for images and assets.

For a boutique catalogue of beauty, fragrances, and gift hampers, the Free plan provides ample capacity without incurring costs.

---

## Troubleshooting

### Product Does Not Appear in Storefront
1. **Check Publish status**: Verify in Sanity Studio that the document shows as **Published** (green checkmark), not **Draft** (yellow badge).
2. **Check Project ID**: Verify that `projectId` in `dist/sanity-config.js` matches your project ID in [sanity.io/manage](https://www.sanity.io/manage).
3. **Check CORS**: Ensure your current URL (e.g. `http://127.0.0.1:4173` or your Vercel URL) is added under **API &rarr; CORS Origins** in the Sanity management dashboard.
4. **CDN Caching**: By default, `useCdn: true` serves cached data from edge nodes. CDN caches purge within a few seconds, but if you require instantaneous updates upon refresh, you can temporarily set `useCdn: false` in `dist/sanity-config.js`.

---

## Storefront Details & Contact

- **WhatsApp Enquiry Number**: `+94 75 517 3371`
- **Social Links**:
  - Instagram: `https://www.instagram.com/choicez.lk_/`
  - TikTok: `https://www.tiktok.com/@choicez.lk_`
  - Facebook: `https://www.facebook.com/share/18k9sZaYo7/`
- **Hosting**: Deployed from `dist/` on Vercel.

## Folder organization

- `dist/`: deployed storefront, styles, scripts and website assets. Keep this folder; Vercel serves it directly.
- `studio/`: Sanity Studio source and its installed dependencies.
- `tools/`: catalogue migration utilities.
- `migration/`: preserved original product data and migration documentation.
- `create-art.cjs`: source generator for the storefront illustrations.
- `serve.cjs`, `package.json`, `vercel.json`: development and hosting configuration.

The retired local product editor has been removed. Use Sanity Studio for product management.
Outside this repository, `../source-media/` contains original branding and product photos, and `../archive/` contains older website exports. These are not deployed or uploaded automatically.

