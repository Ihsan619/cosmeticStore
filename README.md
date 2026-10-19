# Choicez.lk

A responsive, static product catalogue with search, category filters, price sorting, product detail dialogs, direct product links, and WhatsApp enquiries. All five categories, social links, and the supplied logo are included. No checkout, payment gateway, or customer accounts.

## Preview

Run `node serve.cjs` in this directory and open http://127.0.0.1:4173.

## Products

The live catalogue reads `dist/products.json`. It is intentionally empty until actual products and prices are supplied. The storefront shows an honest coming-soon message with working category enquiry links. Illustrations are decorative and do not claim to depict stock.

Open `tools/product-editor.html` in your browser to add products and upload photos. This tool is local only, is not included in the deployed site, and is not an authenticated online admin dashboard. It saves drafts in browser storage; export backups regularly. Export `products.json`, replace `dist/products.json`, and redeploy to update the live website. Embedded photos are resized to 1,000 pixels. For a larger catalogue, store image files in `dist/assets/` and use relative paths instead. A shared online CMS with secure uploads can be added separately.

Product fields: `id` (unique stable string), `name`, `category` (`cosmetics`, `skincare`, `perfumes`, `gifts`, `watches`), `price` (LKR number or null), `brand`, `description`, `variants`, `availability`, `image` (HTTPS URL, assets path, or supported image data URL), `published` (boolean). Keep IDs stable so shared product links continue working.

## Contact

WhatsApp: 94755173371. Instagram and TikTok: choicez.lk_. Facebook: the supplied share URL. Confirm external profiles and enquire details with the store before public launch.

## Hosting

Static directory: `dist`. No runtime packages, backend or database required. Upload this directory to a static host. Publishing the GitHub repository alone does not make the website live. The actual choicez.lk domain is not connected.

The implementation uses HTML, CSS and JavaScript rather than Next.js: this catalogue does not currently need server rendering or server logic. Fonts use Google Fonts with system fallbacks. All other storefront assets are local.
