'use strict';
const categories = [
  {id:'cosmetics',name:'Cosmetics',note:'A little colour. A little confidence.'},
  {id:'skincare',name:'Creams & skincare',note:'Make time for your daily ritual.'},
  {id:'perfumes',name:'Perfumes',note:'Find a scent that feels like you.'},
  {id:'gifts',name:'Gift hampers',note:'Thoughtful little bundles of joy.'},
  {id:'watches',name:'Watches',note:'A lovely detail for every day.'}
];
const $ = s => document.querySelector(s);
const safe = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art = id => `<svg viewBox="0 0 250 250" aria-hidden="true">${window.CHOICEZ_DEFS}${window.CHOICEZ_ART[id] || window.CHOICEZ_ART.gifts}</svg>`;
const money = n => typeof n === 'number' && Number.isFinite(n) ? `LKR ${n.toLocaleString('en-LK',{minimumFractionDigits:2,maximumFractionDigits:2})}` : 'Ask us for the price';
function imageUrl(value){if(!value)return '';try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)||/^data:image\/(png|jpeg|webp);base64,/.test(value)?u.href:''}catch{return ''}}
function enquire(p){const link=new URL(location.href);link.hash=`product=${encodeURIComponent(p.id)}`;return 'https://wa.me/94755173371?text='+encodeURIComponent(`Hi Choicez.lk! I’m interested in ${p.name}. Could you confirm the price, options and availability?\n${link.href}`)}
let products=[], filter='all', query='', sort='featured', loadFailed=false;
const categoryName=id=>categories.find(c=>c.id===id)?.name || 'Collection';
$('#category-grid').innerHTML=categories.map(c=>`<button class="category-card" data-category="${c.id}"><span class="category-picture">${art(c.id)}</span><span class="category-label">${c.name}<span>↗</span></span><small>${c.note}</small></button>`).join('');
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{setFilter(b.dataset.category);$('#collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}));
function setFilter(id){filter=id;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===id);b.setAttribute('aria-pressed',String(b.dataset.filter===id))});render()}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
$('#search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render()});
$('#sort').addEventListener('change',e=>{sort=e.target.value;render()});
$('#clear-filters').addEventListener('click',()=>{query='';$('#search').value='';setFilter('all')});
function render(){
  const list=products.filter(p=>(filter==='all'||p.category===filter)&&`${p.name} ${p.description||''} ${p.brand||''} ${categoryName(p.category)}`.toLowerCase().includes(query));
  if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='price-low'||sort==='price-high')list.sort((a,b)=>{const aValid=typeof a.price==='number',bValid=typeof b.price==='number';if(!aValid)return bValid?1:0;if(!bValid)return -1;return sort==='price-low'?a.price-b.price:b.price-a.price});
  $('#results-count').textContent=products.length?`${list.length} lovely ${list.length===1?'find':'finds'}`:'Our online collection is coming soon';
  $('#product-grid').innerHTML=list.map(p=>{const image=imageUrl(p.image);return `<article class="product-card"><button class="product-image" data-open="${safe(p.id)}" aria-label="View ${safe(p.name)}">${image?`<img src="${safe(image)}" alt="${safe(p.name)}" loading="lazy">`:art(p.category)}</button><p class="product-category">${safe(categoryName(p.category))}</p><h3><button data-open="${safe(p.id)}">${safe(p.name)}</button></h3><p class="product-price">${money(p.price)}</p><p class="stock">${safe(p.availability||'Ask about availability')}</p><a class="product-enquiry" href="${safe(enquire(p))}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp ↗</a></article>`}).join('');
  document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openProduct(b.dataset.open)));
  $('#empty-state').hidden=list.length>0;
  $('#clear-filters').hidden=!query&&filter==='all';
  $('#empty-state h3').textContent=products.length?'A different lovely find awaits.':'Good things are on their way.';
  $('#empty-message').textContent=loadFailed?'We couldn’t load the collection right now. Please try refreshing, or message us for the latest products.':products.length?'No products match your search. Try another word or category, or ask us on WhatsApp.':filter!=='all'?`We’re preparing our ${categoryName(filter).toLowerCase()} collection. Message us to discover what’s available.`:'We’re preparing our online collection. In the meantime, message us to discover what’s available.';
  $('#empty-enquiry').href='https://wa.me/94755173371?text='+encodeURIComponent(`Hi Choicez.lk! Could you share your latest ${filter==='all'?'collection':categoryName(filter).toLowerCase()}${query?`? I’m looking for ${query}`:''}?`);
}
function openProduct(id){const p=products.find(p=>p.id===id);if(!p)return;const image=imageUrl(p.image);$('#dialog-content').innerHTML=`<div class="detail-image">${image?`<img src="${safe(image)}" alt="${safe(p.name)}">`:art(p.category)}</div><div class="detail-copy"><p class="eyebrow">${safe(categoryName(p.category))}</p><h2 id="dialog-title">${safe(p.name)}</h2><p class="product-price">${money(p.price)}</p><p>${safe(p.description||'Message us to learn more about this product.').replace(/\n/g,'<br>')}</p>${p.variants?`<p><strong>Options:</strong> ${safe(p.variants)}</p>`:''}<p>${safe(p.availability||'Please enquire for availability.')}</p><a class="button primary" href="${safe(enquire(p))}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp ↗</a><p>Confirm price, availability and order details with our team.</p></div>`;if(!$('#product-dialog').open)$('#product-dialog').showModal();history.replaceState(null,'',`#product=${encodeURIComponent(id)}`)}
function closeProduct(){if($('#product-dialog').open)$('#product-dialog').close();if(location.hash.startsWith('#product='))history.replaceState(null,'','#collection')}
$('#close-dialog').addEventListener('click',closeProduct);
$('#product-dialog').addEventListener('click',e=>{if(e.target===$('#product-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProduct()}});
$('#product-dialog').addEventListener('close',()=>{if(location.hash.startsWith('#product='))history.replaceState(null,'','#collection')});
function fromHash(){if(location.hash.startsWith('#product=')){try{openProduct(decodeURIComponent(location.hash.slice(9)))}catch{}}}
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#product='))fromHash();else if($('#product-dialog').open)$('#product-dialog').close()});
$('.menu-toggle').addEventListener('click',()=>{const b=$('.menu-toggle'),expanded=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!expanded));b.setAttribute('aria-label',expanded?'Open menu':'Close menu');$('#mobile-nav').hidden=expanded});
$('#mobile-nav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Open menu')}));
$('#year').textContent=new Date().getFullYear();
fetch('products.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('load');return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('format');products=data.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&categories.some(c=>c.id===p.category)&&p.published!==false);render();fromHash()}).catch(()=>{loadFailed=true;render()});
render();
