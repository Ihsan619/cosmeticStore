# Finish connecting Sanity

The storefront and Studio use existing project `b8e94h7q` and dataset `production`. On 21 October 2026, the public API returned “Dataset not found”, and the local CLI required login. No new project was created and no live import has been run.

1. From `studio/`, run `npx sanity login` using the account that owns this project.
2. Run `npx sanity projects list` and confirm the selected project belongs to you. If it does not, update the project ID in `dist/sanity-config.js`, `studio/sanity.config.ts` and `studio/sanity.cli.ts` before proceeding.
3. Run `npx sanity dataset list`. If `production` is absent, run `npx sanity dataset create production --visibility public`. Store only public product information in it.
4. Run `npm run studio:dev` from the repository root. Follow the Studio login/CORS instructions for the exact local origin. Do not add wildcard credentialed origins.
5. Add a product, upload the main photo, enter alternative text and generate its slug. Publish when ready. The storefront uses the immutable document ID for links, and also accepts existing slug links.
6. To import the preserved VATIKA record, either add it manually using `migration/vatika-styling-hair-cream.jpg`, or use `npm run migrate`. The importer needs a write token in the terminal environment (`SANITY_WRITE_TOKEN`), never in browser code or Git. `npm run migrate -- --dry-run` makes no network changes. The importer skips matching products and uses create-if-not-exists mutations.
7. In `studio/`, run `npx sanity deploy` and choose an available Studio hostname. Keep Studio separate from Vercel's `dist/` storefront. The CLI will guide required origin registration.
8. Add only your actual storefront origin in the project's API CORS settings if browser queries require it. Public storefront queries must not carry write tokens or credentials.

The existing file editor has been removed. Publishing in Studio updates the public catalogue after a refresh; CDN caching may briefly delay changes. No Git push is required for product content updates. Sanity's Free plan supports Administrator and Viewer roles; Editor is a paid-plan role. Only invite trusted administrators when using Free.

Verification still needed after account connection: authenticated uploads and publishing, anonymous read-only access, actual deployed origins, and hosted Studio access from a phone.
