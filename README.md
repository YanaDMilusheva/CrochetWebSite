# CrochetWebSite

Static English-language crochet catalog website rebuilt from the original Spring Boot + Thymeleaf project.

## What this version keeps

- Home, gallery, category, product, about, and contact pages
- English-only interface
- Product listing from `data/products.json`
- English product names and descriptions
- Product details with tags, quantity, color, material, and image gallery
- Existing reusable images copied under `assets/images/products/`
- Contact flow through a pre-filled `mailto:` draft
- Responsive pink-purple theme inspired by the original site

## What this version intentionally removes

- Java / Spring Boot
- Thymeleaf
- Admin login and dashboard
- Product uploads from the browser
- Order processing and email automation
- Server-side persistence

## Project structure

```text
CrochetWebSite/
  index.html
  gallery.html
  category.html
  product.html
  about.html
  contact.html
  assets/
    css/styles.css
    js/app.js
    js/catalog.js
    js/i18n.js
    js/ui.js
    images/products/
    images/author/YMI1.jpg
  data/
    products.json
    translations.json
```

## Run directly

Open `index.html` in your browser. The site now uses classic browser scripts and embedded data, so it does not need a local web server.

If your file manager supports it, double-click `index.html` or right-click and open it in your browser.

## How to update products

Edit `data/products.json`.

### Important fields

- `id`
- `name`
- `category` (`PULLOVER`, `BAG`, `SCARF`, `GLOVES`)
- `description`
- `price`
- `imageUrl`
- `imageUrls`
- `color`
- `material`
- `quantityAvailable`

### Add images

1. Copy your image into `assets/images/products/`
2. Reference it in `data/products.json`, for example:

```json
{
  "imageUrl": "assets/images/products/my-new-bag.jpg",
  "imageUrls": [
    "assets/images/products/my-new-bag.jpg",
    "assets/images/products/my-new-bag-side.jpg"
  ]
}
```

If `imageUrl` is empty or the file is missing, the site shows a category emoji fallback.

## Language

- The interface and product catalog are in English
- UI labels come from `data/translations.json`

## Notes

- Replace the Facebook and Instagram placeholder URLs in `assets/js/ui.js` with your profile links
- Prices are displayed in EUR formatting in this static version
- The contact form opens the visitor's email application instead of sending data through a backend
- `application.properties` mail credentials from the old Java app are not used here
