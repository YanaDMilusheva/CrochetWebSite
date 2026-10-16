const CATEGORY_META = {
  PULLOVER: {
    key: 'pullover',
    emoji: '👕'
  },
  BAG: {
    key: 'bag',
    emoji: '👜'
  },
  SCARF: {
    key: 'scarf',
    emoji: '🧣'
  },
  GLOVES: {
    key: 'gloves',
    emoji: '🧤'
  }
};

function uniqueImages(product) {
  const candidates = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean);
  return [...new Set(candidates)];
}

function normalizeProduct(product) {
  return {
    ...product,
    category: String(product.category || '').toUpperCase(),
    images: uniqueImages(product)
  };
}

function loadProducts() {
  const source = window.CROCHET_DATA?.products || [];
  return Promise.resolve(source.map(normalizeProduct));
}

function getCategoryMeta(category) {
  return CATEGORY_META[String(category || '').toUpperCase()] || {
    key: 'bag',
    emoji: '🧶'
  };
}

function getLocalizedProductField(product, fieldBase) {
  return product[fieldBase] ?? '';
}

function getDisplayImage(product) {
  return product.images[0] || null;
}

function getRelatedProducts(products, currentProduct, maxItems = 3) {
  return products
    .filter((product) => product.id !== currentProduct.id && product.category === currentProduct.category)
    .slice(0, maxItems);
}

function getStockState(quantity) {
  if (quantity <= 0) {
    return 'out';
  }

  if (quantity <= 3) {
    return 'low';
  }

  return 'in';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(Number(price || 0));
}

function getProductById(products, id) {
  const numericId = Number(id);
  return products.find((product) => product.id === numericId) || null;
}

function getProductsByCategory(products, category) {
  const normalizedCategory = String(category || '').toUpperCase();
  return products.filter((product) => product.category === normalizedCategory);
}

function getAvailableCategories(products) {
  return [...new Set(products.map((product) => product.category))];
}

window.loadProducts = loadProducts;
window.getCategoryMeta = getCategoryMeta;
window.getLocalizedProductField = getLocalizedProductField;
window.getDisplayImage = getDisplayImage;
window.getRelatedProducts = getRelatedProducts;
window.getStockState = getStockState;
window.formatPrice = formatPrice;
window.getProductById = getProductById;
window.getProductsByCategory = getProductsByCategory;
window.getAvailableCategories = getAvailableCategories;
