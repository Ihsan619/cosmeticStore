const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../dist/app.js'), 'utf8');
const loader = source.slice(source.indexOf('async function loadProductsFromSanity()'), source.indexOf('// Initial render in loading state'));

async function run(response) {
  let request;
  const context = vm.createContext({
    window: {CHOICEZ_SANITY_CONFIG: {projectId: 'testproject', dataset: 'production', apiVersion: '2025-02-19'}},
    categories: [{id: 'skincare'}], products: [], isLoading: true, loadFailed: false,
    errorMessage: '', render() {}, fromHash() {}, encodeURIComponent, AbortSignal,
    console: {error() {}},
    fetch: async (url, options) => {request = {url: new URL(url), options}; return response;},
  });
  await vm.runInContext(loader + '\nloadProductsFromSanity()', context);
  return {context, request};
}

test('public catalogue requests published perspective and stable IDs, never a write credential', async () => {
  const {request, context} = await run({ok: true, json: async () => ({result: [{id: 'stable-id', name: 'Cream', category: 'skincare', price: null}]})});
  assert.equal(request.url.searchParams.get('perspective'), 'published');
  const query = request.url.searchParams.get('query');
  assert.match(query, /"id": _id/);
  assert.match(query, /drafts\.\*\*/);
  assert.match(query, /versions\.\*\*/);
  assert.equal(request.options.headers, undefined);
  assert.ok(request.options.signal);
  assert.equal(context.products[0].id, 'stable-id');
  assert.equal(context.products[0].price, null);
  assert.equal(context.isLoading, false);
});

test('invalid records are excluded and valid empty collections succeed', async () => {
  const {context} = await run({ok: true, json: async () => ({result: [{id: 'bad', name: 'Bad category', category: 'invalid'}, null]})});
  assert.equal(context.products.length, 0);
  assert.equal(context.loadFailed, false);
});

test('dataset errors finish loading and show connection failure', async () => {
  const {context} = await run({ok: false, status: 404});
  assert.equal(context.loadFailed, true);
  assert.equal(context.isLoading, false);
  assert.match(context.errorMessage, /couldn’t connect/);
});
