# Choicez.lk Sanity connection

Project: `3jgxvs45`, public dataset: `production`.
Website: https://cosmeticstore123.vercel.app
Studio hostname: https://choicez-lk.sanity.studio

The inaccessible former project was replaced. The saved VATIKA product and photo were imported on 21 October 2026; its price remains on enquiry.

## Manage products
Open the hosted Studio and sign in with your Sanity GitHub account. Select All Products, create a product, enter its name/category, generate a slug, upload a main photo and alternative text, choose availability, then publish. Prices are optional. Drafts stay hidden. Unpublish to hide a product without deleting it. Refresh the website to see changes; CDN caching can briefly delay updates. Product edits do not need Git pushes or website redeployments.

## Local development and import
Run `npm run dev` for the storefront or `npm run studio:dev` for Studio from the repository root. Validate with `npm run check` and `npm test`.
Sign in using `npx sanity login` from studio/, then use `npm run migrate:login` from the root to rerun the duplicate-safe legacy import. This uses the CLI session without copying tokens into files. Existing IDs are skipped. Original records remain in migration/.

## Access and backups
Use exact CORS origins only. Local Studio localhost:3333 needs credentials; the storefront origins do not. Hosted Studio registration adds its origin as needed. Never expose write tokens in browser code. Public datasets and photos must contain public product information only.
Free-plan editing staff require Administrator access; Viewer is read-only. Editor requires a plan supporting it.
Run `npx sanity dataset export production backup.tar.gz` from studio/ for backups; keep exports outside deployed dist/ and source separately in GitHub.
