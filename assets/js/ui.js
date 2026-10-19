const CONTACT_DETAILS = {
  email: 'yana.milusheva@yahoo.com',
  phone: '+359 899171335',
  facebook: 'https://www.facebook.com/share/1EsxQGUiAW/',
  instagram: 'https://www.instagram.com/yana.milusheva/'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderShell({ translations, lang, page }) {
  const headerTarget = document.querySelector('[data-site-header]');
  const footerTarget = document.querySelector('[data-site-footer]');

  const navItems = [
    { href: 'index.html', page: 'home', label: t(translations, 'nav.home') },
    { href: 'gallery.html', page: 'gallery', label: t(translations, 'nav.gallery') },
    { href: 'about.html', page: 'about', label: t(translations, 'nav.about') },
    { href: 'contact.html', page: 'contact', label: t(translations, 'nav.contact') }
  ];

  headerTarget.innerHTML = `
    <div class="site-header__inner">
      <a class="brand" href="index.html">
        <span class="brand__title">${escapeHtml(t(translations, 'site.brand'))}</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        ${navItems
          .map(
            (item) => `
              <a class="site-nav__link ${page === item.page ? 'is-active' : ''}" href="${item.href}">
                ${escapeHtml(item.label)}
              </a>
            `
          )
          .join('')}
      </nav>
    </div>
  `;

  footerTarget.innerHTML = `
    <div class="site-footer__inner">
      <p>${escapeHtml(t(translations, 'footer.rights'))}</p>
    </div>
  `;
}

function renderImageFrame({ product, lang, className = '', image = null, eager = false }) {
  const meta = getCategoryMeta(product.category);
  const src = image || getDisplayImage(product);
  const alt = escapeHtml(getLocalizedProductField(product, 'name', lang));
  const loading = eager ? 'eager' : 'lazy';

  return `
    <div class="image-frame ${className}" data-image-frame data-emoji="${meta.emoji}">
      ${src ? `<img src="${src}" alt="${alt}" loading="${loading}">` : ''}
      <div class="image-frame__fallback" ${src ? 'hidden' : ''} aria-hidden="true">${meta.emoji}</div>
    </div>
  `;
}

function renderProductCard(product, translations, lang) {
  const title = getLocalizedProductField(product, 'name', lang);
  const description = getLocalizedProductField(product, 'description', lang);
  const categoryMeta = getCategoryMeta(product.category);

  return `
    <article class="product-card">
      <a class="product-card__media-link" href="product.html?id=${product.id}" aria-label="${escapeHtml(title)}">
        ${renderImageFrame({ product, lang, className: 'product-card__media' })}
      </a>
      <div class="product-card__body">
        <div class="product-card__meta">
          <span class="category-pill">${categoryMeta.emoji} ${escapeHtml(t(translations, `category.label.${categoryMeta.key}`))}</span>
          <strong class="product-card__price">${escapeHtml(formatPrice(product.price, lang))}</strong>
        </div>
        <h3 class="product-card__title">${escapeHtml(title)}</h3>
        <p class="product-card__description">${escapeHtml(description)}</p>
        <div class="product-card__actions">
          <a class="btn btn--primary" href="product.html?id=${product.id}">${escapeHtml(t(translations, 'product.viewDetails'))}</a>
          <a class="btn btn--ghost" href="contact.html?product=${product.id}">${escapeHtml(t(translations, 'common.contactNow'))}</a>
        </div>
      </div>
    </article>
  `;
}

function availabilityMarkup(product, translations, lang) {
  const stockState = getStockState(product.quantityAvailable);
  const keyByState = {
    in: 'product.inStock',
    low: 'product.lowStock',
    out: 'product.outOfStock'
  };

  return `
    <p class="availability availability--${stockState}">
      ${escapeHtml(t(translations, keyByState[stockState], [String(product.quantityAvailable)]))}
    </p>
  `;
}

function hydrateImageFrames() {
  document.querySelectorAll('[data-image-frame]').forEach((frame) => {
    const image = frame.querySelector('img');
    const fallback = frame.querySelector('.image-frame__fallback');

    if (!image) {
      if (fallback) {
        fallback.hidden = false;
      }
      return;
    }

    image.addEventListener('error', () => {
      image.hidden = true;
      if (fallback) {
        fallback.hidden = false;
      }
    });

    image.addEventListener('load', () => {
      image.hidden = false;
      if (fallback) {
        fallback.hidden = true;
      }
    });
  });
}

function createSectionHeading(title, description = '') {
  return `
    <div class="section-heading">
      <h1>${escapeHtml(title)}</h1>
      ${description ? `<p>${escapeHtml(description)}</p>` : ''}
    </div>
  `;
}

function getContactHref(productName = '') {
  const subject = productName
    ? `Inquiry about ${productName}`
    : 'Inquiry from Crochet Studio website';

  return `mailto:${CONTACT_DETAILS.email}?subject=${encodeURIComponent(subject)}`;
}

window.CONTACT_DETAILS = CONTACT_DETAILS;
window.renderShell = renderShell;
window.renderImageFrame = renderImageFrame;
window.renderProductCard = renderProductCard;
window.availabilityMarkup = availabilityMarkup;
window.hydrateImageFrames = hydrateImageFrames;
window.createSectionHeading = createSectionHeading;
window.getContactHref = getContactHref;
