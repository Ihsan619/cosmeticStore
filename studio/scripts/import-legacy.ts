import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

// Run from studio/: npx sanity exec scripts/import-legacy.ts --with-user-token
async function main() {
  const client = getCliClient({apiVersion: '2025-02-19'})
  const rows = JSON.parse(readFileSync(resolve(process.cwd(), '../migration/backup-products.json'), 'utf8'))
  for (const p of rows) {
    if (await client.getDocument(p.id)) { console.log(`Already imported: ${p.name}`); continue }
    let mainPhoto
    if (p.image?.startsWith('data:image/')) {
      const photo = Buffer.from(p.image.slice(p.image.indexOf(',') + 1), 'base64')
      const asset = await client.assets.upload('image', photo, {filename: `${p.id}.jpg`})
      mainPhoto = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}, alt: `${p.name} product photo`}
    }
    await client.createIfNotExists({
      _id: p.id, _type: 'product', name: p.name,
      slug: {_type: 'slug', current: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')},
      category: p.category, brand: p.brand || '', price: p.price ?? undefined,
      description: p.description || '', variants: p.variants || '',
      availability: p.availability || 'Ask about availability',
      featured: false, displayOrder: 10, mainPhoto,
    })
    console.log(`Imported: ${p.name}`)
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
