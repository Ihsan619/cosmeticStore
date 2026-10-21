/**
 * Choicez.lk - Sanity Storefront Configuration
 *
 * Update `projectId` with your Sanity project ID from https://www.sanity.io/manage
 * Public dataset contains published product records and photos only.
 * No private tokens or write keys are ever exposed here.
 */
window.CHOICEZ_SANITY_CONFIG = {
  // Your Sanity project ID
  projectId: '3jgxvs45',

  // Dataset name (default: production)
  dataset: 'production',

  // Sanity API version (YYYY-MM-DD format)
  apiVersion: '2025-02-19',

  // Use Sanity's global CDN (apicdn.sanity.io) for ultra-fast, cached responses.
  // Set to false if you need instantaneous preview of publishes without CDN cache delay.
  useCdn: true,
};

