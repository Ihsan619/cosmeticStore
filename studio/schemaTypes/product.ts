import {defineField, defineType} from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) =>
        Rule.required().max(160).error('Product name is required (max 160 characters)'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Unique URL identifier for this product. Click "Generate" to create from product name.',
      options: {
        source: 'name',
        maxLength: 160,
      },
      validation: (Rule) => Rule.required().error('Slug is required for product linking'),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Cosmetics', value: 'cosmetics'},
          {title: 'Creams & skincare', value: 'skincare'},
          {title: 'Perfumes', value: 'perfumes'},
          {title: 'Gift hampers', value: 'gifts'},
          {title: 'Watches', value: 'watches'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Category is required'),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      description: 'Optional brand name (e.g. VATIKA, Victoria’s Secret)',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'price',
      title: 'Price in LKR',
      type: 'number',
      description: 'Optional price in Sri Lankan Rupees. Leave blank to display "Ask us for the price".',
      validation: (Rule) =>
        Rule.min(0).error('Price must be non-negative (zero or greater)'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Detailed product description or notes.',
      validation: (Rule) => Rule.max(4000),
    }),
    defineField({
      name: 'variants',
      title: 'Sizes, shades or options',
      type: 'string',
      description: 'e.g. "50ml, 100ml" or "Shade 01 Nude, Shade 02 Rose"',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      options: {
        list: [
          {title: 'Ask about availability', value: 'Ask about availability'},
          {title: 'In stock', value: 'In stock'},
          {title: 'Out of stock', value: 'Out of stock'},
          {title: 'Available to order', value: 'Available to order'},
        ],
      },
      initialValue: 'Ask about availability',
      validation: (Rule) => Rule.required().error('Availability status is required'),
    }),
    defineField({
      name: 'mainPhoto',
      title: 'Main Product Photo',
      type: 'image',
      description: 'The primary photo shown on product cards and in detail dialogs.',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Required description of the photo for screen readers and accessibility.',
          validation: (Rule) =>
            Rule.required().error('Alternative text is required for the main photo'),
        }),
      ],
      validation: (Rule) => Rule.required().error('Main photo is required'),
    }),
    defineField({
      name: 'additionalPhotos',
      title: 'Additional Photos',
      type: 'array',
      description: 'Optional extra photos showing details, angles, or packaging.',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
              description: 'Description of this additional photo.',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'If checked, this product is highlighted in featured collections.',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Order weight in the catalogue. Lower numbers appear first (e.g. 10, 20, 30).',
      initialValue: 100,
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      category: 'category',
      availability: 'availability',
      price: 'price',
      media: 'mainPhoto',
    },
    prepare({title, category, availability, price, media}) {
      const categoryLabels: Record<string, string> = {
        cosmetics: 'Cosmetics',
        skincare: 'Creams & skincare',
        perfumes: 'Perfumes',
        gifts: 'Gift hampers',
        watches: 'Watches',
      }
      const formattedPrice =
        typeof price === 'number'
          ? `LKR ${price.toLocaleString('en-LK', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
          : 'Ask us for price'
      const cat = categoryLabels[category] || category || 'No category'
      const avail = availability || 'Ask about availability'
      return {
        title: title || 'Untitled product',
        subtitle: `${cat} • ${avail} • ${formattedPrice}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Display Order, Low to High',
      name: 'displayOrderAsc',
      by: [
        {field: 'displayOrder', direction: 'asc'},
        {field: '_createdAt', direction: 'desc'},
      ],
    },
    {
      title: 'Name, A-Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
    {
      title: 'Price, Low to High',
      name: 'priceAsc',
      by: [{field: 'price', direction: 'asc'}],
    },
    {
      title: 'Price, High to Low',
      name: 'priceDesc',
      by: [{field: 'price', direction: 'desc'}],
    },
  ],
})
