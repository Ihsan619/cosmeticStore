import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Catalogue')
    .items([
      S.listItem()
        .title('All Products')
        .schemaType('product')
        .child(
          S.documentTypeList('product')
            .title('All Products')
            .defaultOrdering([
              {field: 'displayOrder', direction: 'asc'},
              {field: '_createdAt', direction: 'desc'},
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Products by Category')
        .child(
          S.list()
            .title('Categories')
            .items([
              S.listItem()
                .title('Cosmetics')
                .child(
                  S.documentList()
                    .title('Cosmetics')
                    .filter('_type == "product" && category == "cosmetics"')
                ),
              S.listItem()
                .title('Creams & Skincare')
                .child(
                  S.documentList()
                    .title('Creams & Skincare')
                    .filter('_type == "product" && category == "skincare"')
                ),
              S.listItem()
                .title('Perfumes')
                .child(
                  S.documentList()
                    .title('Perfumes')
                    .filter('_type == "product" && category == "perfumes"')
                ),
              S.listItem()
                .title('Gift Hampers')
                .child(
                  S.documentList()
                    .title('Gift Hampers')
                    .filter('_type == "product" && category == "gifts"')
                ),
              S.listItem()
                .title('Watches')
                .child(
                  S.documentList()
                    .title('Watches')
                    .filter('_type == "product" && category == "watches"')
                ),
            ])
        ),
      S.listItem()
        .title('Products by Availability')
        .child(
          S.list()
            .title('Availability')
            .items([
              S.listItem()
                .title('In Stock')
                .child(
                  S.documentList()
                    .title('In Stock')
                    .filter('_type == "product" && availability == "In stock"')
                ),
              S.listItem()
                .title('Available to Order')
                .child(
                  S.documentList()
                    .title('Available to Order')
                    .filter('_type == "product" && availability == "Available to order"')
                ),
              S.listItem()
                .title('Ask About Availability')
                .child(
                  S.documentList()
                    .title('Ask About Availability')
                    .filter('_type == "product" && availability == "Ask about availability"')
                ),
              S.listItem()
                .title('Out of Stock')
                .child(
                  S.documentList()
                    .title('Out of Stock')
                    .filter('_type == "product" && availability == "Out of stock"')
                ),
            ])
        ),
      S.listItem()
        .title('Featured Products')
        .child(
          S.documentList()
            .title('Featured Products')
            .filter('_type == "product" && featured == true')
        ),
    ])
