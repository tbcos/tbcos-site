# Product Detail Operation Guide

## Purpose

Product detail pages use `data/products.json` as the public product source and `product.html?slug=...` as the shared detail template.

Catalog files for members should not be placed in public folders. Store catalog PDFs in a private Supabase Storage bucket and expose them only through login-based signed URLs.

## Folder Rules

```text
data/
  products.json

assets/
  products/
    product-card-image.png
    product-main-image.png
  catalogs/
    source/
      original catalog files for internal reference
    extracted/
      web-optimized images extracted from catalogs
```

Use `assets/catalogs/source/` only for source management in the repository. Do not put member-only public download links to these files.

## Product Slug Rules

Use lowercase English words separated by hyphens.

Examples:

```text
luxfollicle-anti-hair-loss-shampoo
luxfollicle-anti-hair-loss-ampoule
luxfollicle-silka-shampoo
luxfollicle-chockchock-body-lotion
```

## Adding A Product

1. Add product images to `assets/products/`.
2. Add a new product object to `data/products.json`.
3. Set a unique `slug`.
4. Link from the product card or product list to `product.html?slug=YOUR-SLUG`.
5. If the catalog PDF is not uploaded yet, keep `catalog.available` as `false`.
6. After uploading the catalog to Supabase private Storage, set `catalog.available` to `true`.

## Catalog Storage Rule

Recommended Supabase Storage bucket:

```text
product-catalogs
```

Recommended path:

```text
brand/product-slug/catalog-ko.pdf
```

Example:

```text
luxfollicle/anti-hair-loss-shampoo/catalog-ko.pdf
```

## Current Implementation

- `product.html` loads `data/products.json`.
- The `slug` URL parameter selects one product.
- The catalog button is disabled while `catalog.available` is `false`.
- When `catalog.available` is `true`, the page checks Supabase Auth session and requests a signed URL from the private Storage bucket.
- Download logging can be added later through a Supabase Edge Function or a dedicated `download_logs` table.

## Later Migration To Supabase DB

When product count grows or admin product editing is needed, migrate the same fields from `data/products.json` to a Supabase `products` table. Keep the existing `slug` values stable so existing product URLs continue to work.
