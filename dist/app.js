'use strict';

const categories = [
  {id: 'cosmetics', name: 'Cosmetics', note: 'A little colour. A little confidence.'},
  {id: 'skincare', name: 'Creams & skincare', note: 'Make time for your daily ritual.'},
  {id: 'perfumes', name: 'Perfumes', note: 'Find a scent that feels like you.'},
  {id: 'gifts', name: 'Gift hampers', note: 'Thoughtful little bundles of joy.'},
  {id: 'watches', name: 'Watches', note: 'A lovely detail for every day.'}
];

const $ = s => document.querySelector(s);
const safe = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const art = id => `<svg viewBox="0 0 250 250" aria-hidden="true">${window.CHOICEZ_DEFS}${window.CHOICEZ_ART[id] || window.CHOICEZ_ART.gifts}</svg>`;
const money = n => typeof n === 'number' && Number.isFinite(n) ? `LKR ${n.toLocaleString('en-LK', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'Ask us for the price';

function imageUrl(value, width = 800) {
  if (!value) return '';
  try {
    const u = new URL(value, location.href);
    if (u.hostname.includes('sanity.io')) {
      u.searchParams.set('w', String(width));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('q', '80');
      return u.href;
    }
    return ['http:', 'https:'].includes(u.protocol) || /^data:image\/(png|jpeg|webp);base64,/.test(value) ? u.href : '';
  } catch {
    return '';
  }
}

function enquire(p) {
  const link = new URL(location.href);
  link.hash = `product=${encodeURIComponent(p.id)}`;
  return 'https://wa.me/94755173371?text=' + encodeURIComponent(`Hi Choicez.lk! I’m interested in ${p.name}. Could you confirm the price, options and availability?\n${link.href}`);
}

let products = [], filter = 'all', query = '', sort = 'featured', loadFailed = false, isLoading = true, errorMessage = '';

const categoryName = id => categories.find(c => c.id === id)?.name || 'Collection';

$('#category-grid').innerHTML = categories.map(c =>
  `<button class="category-card" data-category="${c.id}"><span class="category-picture">${art(c.id)}</span><span class="category-label">${c.name}<span>↗</span></span><small>${c.note}</small></button>`
).join('');

document.querySelectorAll('[data-category]').forEach(b =>
  b.addEventListener('click', () => {
    setFilter(b.dataset.category);
    $('#collection').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  })
);

function setFilter(id) {
  filter = id;
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === id);
    b.setAttribute('aria-pressed', String(b.dataset.filter === id));
  });
  render();
}

document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));
$('#search').addEventListener('input', e => {
  query = e.target.value.trim().toLowerCase();
  render();
});
$('#sort').addEventListener('change', e => {
  sort = e.target.value;
  render();
});
$('#clear-filters').addEventListener('click', () => {
  query = '';
  $('#search').value = '';
  setFilter('all');
});

function render() {
  if (isLoading) {
    $('#results-count').textContent = 'Loading our collection…';
    $('#product-grid').innerHTML = '<div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #776f68;">Looking for lovely finds…</div>';
    $('#empty-state').hidden = true;
    $('#clear-filters').hidden = true;
    return;
  }

  if (loadFailed) {
    $('#results-count').textContent = 'Connection error';
    $('#product-grid').innerHTML = '';
    $('#empty-state').hidden = false;
    $('#clear-filters').hidden = true;
    $('#empty-state h3').textContent = 'We couldn’t connect to the catalogue.';
    $('#empty-message').textContent = errorMessage || 'We’re having trouble loading the latest collection right now. Please refresh the page, or message us directly on WhatsApp for our latest products.';
    $('#empty-enquiry').href = 'https://wa.me/94755173371?text=' + encodeURIComponent('Hi Choicez.lk! I could not load the online catalogue. Could you share your latest collection and prices?');
    return;
  }

  const list = products.filter(p =>
    (filter === 'all' || p.category === filter) &&
    `${p.name} ${p.description || ''} ${p.brand || ''} ${categoryName(p.category)}`.toLowerCase().includes(query)
  );

  if (sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'price-low' || sort === 'price-high') {
    list.sort((a, b) => {
      const aValid = typeof a.price === 'number', bValid = typeof b.price === 'number';
      if (!aValid) return bValid ? 1 : 0;
      if (!bValid) return -1;
      return sort === 'price-low' ? a.price - b.price : b.price - a.price;
    });
  } else if (sort === 'featured') {
    list.sort((a, b) => {
      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 100;
      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 100;
      return orderA - orderB;
    });
  }

  $('#results-count').textContent = products.length
    ? `${list.length} lovely ${list.length === 1 ? 'find' : 'finds'}`
    : 'Our online collection is coming soon';

  $('#product-grid').innerHTML = list.map(p => {
    const image = imageUrl(p.image, 600);
    const altText = safe(p.imageAlt || p.name);
    return `<article class="product-card">
      <button class="product-image" data-open="${safe(p.id)}" aria-label="View ${safe(p.name)}">
        ${image ? `<img src="${safe(image)}" alt="${altText}" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML=art('${safe(p.category)}');">` : art(p.category)}
      </button>
      <p class="product-category">${safe(categoryName(p.category))}</p>
      <h3><button data-open="${safe(p.id)}">${safe(p.name)}</button></h3>
      <p class="product-price">${money(p.price)}</p>
      <p class="stock">${safe(p.availability || 'Ask about availability')}</p>
      <a class="product-enquiry" href="${safe(enquire(p))}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp ↗</a>
    </article>`;
  }).join('');

  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openProduct(b.dataset.open)));

  $('#empty-state').hidden = list.length > 0;
  $('#clear-filters').hidden = !query && filter === 'all';

  if (list.length === 0) {
    $('#empty-state h3').textContent = products.length ? 'A different lovely find awaits.' : 'Good things are on their way.';
    $('#empty-message').textContent = products.length
      ? 'No products match your search. Try another word or category, or ask us on WhatsApp.'
      : filter !== 'all'
      ? `We’re preparing our ${categoryName(filter).toLowerCase()} collection. Message us to discover what’s available.`
      : 'We’re preparing our online collection. In the meantime, message us to discover what’s available.';
    $('#empty-enquiry').href = 'https://wa.me/94755173371?text=' + encodeURIComponent(`Hi Choicez.lk! Could you share your latest ${filter === 'all' ? 'collection' : categoryName(filter).toLowerCase()}${query ? `? I’m looking for ${query}` : ''}?`);
  }
}

function openProduct(id) {
  const p = products.find(p => p.id === id);
  if (!p) return;
  const image = imageUrl(p.image, 1000);
  const altText = safe(p.imageAlt || p.name);

  const additionalThumbs = (p.additionalImages || [])
    .filter(Boolean)
    .map(img => `<button type="button" class="thumb-btn" style="border:1px solid #dacdc1;padding:2px;background:none;cursor:pointer;border-radius:4px" onclick="document.getElementById('dialog-main-img').src='${safe(imageUrl(img, 1000))}';"><img src="${safe(imageUrl(img, 160))}" alt="" style="width:50px;height:50px;object-fit:cover;display:block;border-radius:2px"></button>`)
    .join('');

  $('#dialog-content').innerHTML = `
    <div class="detail-image">
      ${image ? `<img id="dialog-main-img" src="${safe(image)}" alt="${altText}" onerror="this.onerror=null;this.parentElement.innerHTML=art('${safe(p.category)}');">` : art(p.category)}
      ${additionalThumbs ? `<div class="detail-thumbnails" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">${image ? `<button type="button" class="thumb-btn" style="border:1px solid #dacdc1;padding:2px;background:none;cursor:pointer;border-radius:4px" onclick="document.getElementById('dialog-main-img').src='${safe(image)}';"><img src="${safe(imageUrl(p.image, 160))}" alt="" style="width:50px;height:50px;object-fit:cover;display:block;border-radius:2px"></button>` : ''}${additionalThumbs}</div>` : ''}
    </div>
    <div class="detail-copy">
      <p class="eyebrow">${safe(categoryName(p.category))}</p>
      <h2 id="dialog-title">${safe(p.name)}</h2>
      ${p.brand ? `<p class="detail-brand" style="margin:-10px 0 10px;font-size:14px;color:#776f68;">${safe(p.brand)}</p>` : ''}
      <p class="product-price">${money(p.price)}</p>
      <p>${safe(p.description || 'Message us to learn more about this product.').replace(/\n/g, '<br>')}</p>
      ${p.variants ? `<p><strong>Options:</strong> ${safe(p.variants)}</p>` : ''}
      <p class="stock"><strong>Availability:</strong> ${safe(p.availability || 'Please enquire for availability.')}</p>
      <a class="button primary" href="${safe(enquire(p))}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp ↗</a>
      <p class="small-note" style="margin-top:10px;font-size:12px;color:#776f68;">Confirm price, availability and order details with our team.</p>
    </div>
  `;

  if (!$('#product-dialog').open) $('#product-dialog').showModal();
  history.replaceState(null, '', `#product=${encodeURIComponent(id)}`);
}

function closeProduct() {
  if ($('#product-dialog').open) $('#product-dialog').close();
  if (location.hash.startsWith('#product=')) history.replaceState(null, '', '#collection');
}

$('#close-dialog').addEventListener('click', closeProduct);
$('#product-dialog').addEventListener('click', e => {
  if (e.target === $('#product-dialog')) {
    const r = e.target.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeProduct();
  }
});
$('#product-dialog').addEventListener('close', () => {
  if (location.hash.startsWith('#product=')) history.replaceState(null, '', '#collection');
});

function fromHash() {
  if (location.hash.startsWith('#product=')) {
    try {
      openProduct(decodeURIComponent(location.hash.slice(9)));
    } catch {}
  }
}

window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#product=')) fromHash();
  else if ($('#product-dialog').open) $('#product-dialog').close();
});

$('.menu-toggle').addEventListener('click', () => {
  const b = $('.menu-toggle'), expanded = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', String(!expanded));
  b.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
  $('#mobile-nav').hidden = expanded;
});

$('#mobile-nav').querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    $('#mobile-nav').hidden = true;
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').setAttribute('aria-label', 'Open menu');
  })
);

$('#year').textContent = new Date().getFullYear();

// Sanity Data Loading
async function loadProductsFromSanity() {
  const cfg = window.CHOICEZ_SANITY_CONFIG || {};
  const projectId = cfg.projectId;
  const dataset = cfg.dataset || 'production';
  const apiVersion = cfg.apiVersion || '2024-01-01';
  const useCdn = cfg.useCdn !== false;

  if (!projectId || projectId === 'your_actual_project_id') {
    isLoading = false;
    loadFailed = true;
    errorMessage = 'Sanity project ID is not configured. Please set window.CHOICEZ_SANITY_CONFIG.projectId in dist/sanity-config.js.';
    render();
    return;
  }

  // GROQ query fetching only published products and only fields the storefront needs
  const groq = `*[_type == "product" && !(_id in path("drafts.**"))] | order(displayOrder asc, _createdAt desc) {
    "id": coalesce(slug.current, _id),
    "_id": _id,
    name,
    category,
    brand,
    price,
    description,
    variants,
    availability,
    featured,
    displayOrder,
    "image": mainPhoto.asset->url,
    "imageAlt": mainPhoto.alt,
    "additionalImages": additionalPhotos[].asset->url
  }`;

  const host = useCdn ? `${projectId}.apicdn.sanity.io` : `${projectId}.api.sanity.io`;
  const url = `https://${host}/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(groq)}`;

  try {
    const res = await fetch(url, {cache: useCdn ? 'default' : 'no-cache'});
    if (!res.ok) {
      throw new Error(`Sanity query returned HTTP status ${res.status}`);
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.result)) {
      throw new Error('Unexpected response format from Sanity API');
    }

    products = data.result.filter(p =>
      p &&
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      categories.some(c => c.id === p.category)
    );

    isLoading = false;
    loadFailed = false;
    render();
    fromHash();
  } catch (err) {
    console.error('Failed to load products from Sanity:', err);
    isLoading = false;
    loadFailed = true;
    errorMessage = 'We couldn’t connect to the product catalogue. Please check your connection and refresh.';
    render();
  }
}

// Initial render in loading state, then fetch
render();
loadProductsFromSanity();
