# Choicez.lk - Product Migration Documentation

## Pre-Migration Backup Summary
- **Source file**: `dist/products.json`
- **Backup location**: `migration/backup-products.json`
- **Extracted assets**: `migration/vatika-styling-hair-cream.jpg`
- **Timestamp**: 2026-10-20
- **Total products**: 1

### Product Record:
- **ID**: `cz-14da95ef-ea94-4a0f-a078-783f087d738f`
- **Name**: VATIKA Styling Hair cream
- **Category**: skincare (`Creams & skincare`)
- **Brand**: VATIKA
- **Price**: null (Display: "Ask us for the price")
- **Description**: ""
- **Variants/Options**: ""
- **Availability**: "In stock"
- **Published**: true
- **Photo**: Base64 JPEG (extracted to `migration/vatika-styling-hair-cream.jpg`)

## Migration Strategy
1. The backup file is maintained in this directory (`migration/`), which is outside the deployed storefront (`dist/`).
2. When Sanity Studio is initialized with the project ID and dataset, a migration script `tools/migrate-to-sanity.cjs` will safely upload the product document and photo asset into Sanity using the official Sanity client, preserving the stable slug / ID `cz-14da95ef-ea94-4a0f-a078-783f087d738f`.
3. The storefront reads directly from Sanity via GROQ CDN query.
4. Old dependency on `dist/products.json` and local browser editor `tools/product-editor.html` are retired.
