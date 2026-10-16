
const state = {
  lang: 'en',
  products: [],
  translations: null
};

const CATEGORY_ORDER = ['PULLOVER', 'BAG', 'SCARF', 'GLOVES'];

const pageRoot = document.querySelector('#page-content');
const currentPage = document.body.dataset.page || 'home';

bootstrap();

async function bootstrap() {
  if (!pageRoot) {
    return;
  }

  pageRoot.innerHTML = '<p class="loading-state">Loading...</p>';

  try {
    const [products, translations] = await Promise.all([loadProducts(), loadTranslations()]);
    state.products = products;
    state.translations = translations;

    renderPage();
  } catch (error) {
    console.error(error);
    pageRoot.innerHTML = `
      <section class="empty-state">
        <h1>Unable to load the catalog</h1>
        <p>Please make sure the site is opened through a local web server.</p>
      </section>
    `;
  }
}

function renderPage() {
  renderShell({ translations: state.translations, lang: state.lang, page: currentPage });
  document.documentElement.lang = state.lang;
  document.title = getPageTitle();

  switch (currentPage) {
    case 'home':
      renderHomePage();
      break;
    case 'gallery':
      renderGalleryPage();
      break;
    case 'category':
      renderCategoryPage();
      break;
    case 'product':
      renderProductPage();
      break;
    case 'about':
      renderAboutPage();
      break;
    case 'contact':
      renderContactPage();
      break;
    default:
      renderHomePage();
  }

  hydrateImageFrames();
  bindPageEvents();
}

function bindPageEvents() {
  if (currentPage === 'gallery') {
    document.querySelectorAll('[data-gallery-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.galleryFilter || 'ALL';
        const url = new URL(window.location.href);

        if (filter === 'ALL') {
          url.searchParams.delete('category');
        } else {
          url.searchParams.set('category', filter);
        }

        history.replaceState({}, '', url);
        renderGalleryPage();
        hydrateImageFrames();
        bindPageEvents();
      });
    });
  }

  if (currentPage === 'product') {
    document.querySelectorAll('[data-thumb-image]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextImage = button.dataset.thumbImage;
        const mainImage = document.querySelector('[data-main-image]');
        const mainFallback = document.querySelector('[data-main-fallback]');

        if (!mainImage || !nextImage) {
          return;
        }

        mainImage.src = nextImage;
        mainImage.hidden = false;
        if (mainFallback) {
          mainFallback.hidden = true;
        }

        document.querySelectorAll('[data-thumb-image]').forEach((thumb) => {
          thumb.classList.toggle('is-active', thumb === button);
          thumb.setAttribute('aria-pressed', thumb === button ? 'true' : 'false');
        });
      });
    });
  }

}

function getPageTitle() {
  const keyByPage = {
    home: 'page.home.title',
    gallery: 'page.gallery.title',
    category: 'page.category.title',
    product: 'page.product.title',
    about: 'page.about.title',
    contact: 'page.contact.title'
  };

  return t(state.translations, keyByPage[currentPage] || 'page.home.title');
}

function renderHomePage() {
  const featuredProducts = state.products.slice(0, 6);
  const categoryCards = CATEGORY_ORDER.filter((category) => getProductsByCategory(state.products, category).length)
    .map((category) => {
      const meta = getCategoryMeta(category);
      const count = getProductsByCategory(state.products, category).length;

      return `
        <a class="category-card" href="category.html?category=${category}">
          <span class="category-card__emoji">${meta.emoji}</span>
          <strong>${t(state.translations, `category.label.${meta.key}`)}</strong>
          <span>${count} ${t(state.translations, 'common.itemsLabel')}</span>
        </a>
      `;
    })
    .join('');

  pageRoot.innerHTML = `
    <section class="hero-section">
      <div class="hero-section__content">
        <p class="eyebrow">Young and Fancy Design Crochet Studio</p>
        <h1>${t(state.translations, 'home.hero.title')}</h1>
        <p class="hero-section__lead">${t(state.translations, 'home.hero.subtitle')}</p>
        <div class="hero-section__actions">
          <a class="btn btn--primary" href="gallery.html">${t(state.translations, 'home.hero.primary')}</a>
          <a class="btn btn--ghost" href="contact.html">${t(state.translations, 'home.hero.secondary')}</a>
        </div>
      </div>
    </section>

    <section class="content-section">
      ${createSectionHeading(
        t(state.translations, 'home.categories'),
        t(state.translations, 'gallery.intro')
      )}
      <div class="category-grid">${categoryCards}</div>
    </section>

    <section class="content-section">
      ${createSectionHeading(
        t(state.translations, 'home.featured'),
        t(state.translations, 'home.featuredSubtitle')
      )}
      ${renderProductGrid(featuredProducts)}
    </section>
  `;
}

function renderGalleryPage() {
  const activeCategory = (new URLSearchParams(window.location.search).get('category') || 'ALL').toUpperCase();
  const availableCategories = getAvailableCategories(state.products);
  const filterButtons = ['ALL', ...CATEGORY_ORDER.filter((category) => availableCategories.includes(category))]
    .map((category) => {
      const isActive = category === activeCategory;
      const label = category === 'ALL'
        ? t(state.translations, 'gallery.all')
        : t(state.translations, `category.label.${getCategoryMeta(category).key}`);

      return `
        <button class="filter-chip ${isActive ? 'is-active' : ''}" type="button" data-gallery-filter="${category}">
          ${label}
        </button>
      `;
    })
    .join('');

  const products = activeCategory === 'ALL'
    ? state.products
    : getProductsByCategory(state.products, activeCategory);

  pageRoot.innerHTML = `
    <section class="content-section content-section--compact">
      ${createSectionHeading(
        t(state.translations, 'gallery.heading'),
        t(state.translations, 'gallery.intro')
      )}
      <div class="filter-bar">
        <span class="filter-bar__label">${t(state.translations, 'common.filters')}</span>
        <div class="filter-bar__chips">${filterButtons}</div>
      </div>
      ${renderProductGrid(products)}
    </section>
  `;
}

function renderCategoryPage() {
  const category = (new URLSearchParams(window.location.search).get('category') || '').toUpperCase();
  const meta = getCategoryMeta(category);
  const products = getProductsByCategory(state.products, category);

  pageRoot.innerHTML = `
    <section class="hero-strip">
      <div>
        <p class="eyebrow">${meta.emoji}</p>
        <h1>${t(state.translations, `category.title.${meta.key}`)}</h1>
        <p>${t(state.translations, `category.desc.${meta.key}`)}</p>
      </div>
      <a class="btn btn--ghost" href="gallery.html">${t(state.translations, 'common.browseAll')}</a>
    </section>
    <section class="content-section content-section--compact">
      ${products.length
        ? renderProductGrid(products)
        : `
          <div class="empty-state">
            <h2>${t(state.translations, 'category.empty.title')}</h2>
            <p>${t(state.translations, 'category.empty.desc')}</p>
            <a class="btn btn--primary" href="gallery.html">${t(state.translations, 'common.browseAll')}</a>
          </div>
        `}
    </section>
  `;
}

function renderProductPage() {
  const productId = new URLSearchParams(window.location.search).get('id');
  const product = getProductById(state.products, productId);

  if (!product) {
    pageRoot.innerHTML = `
      <section class="empty-state">
        <h1>${t(state.translations, 'product.notFound')}</h1>
        <a class="btn btn--primary" href="gallery.html">${t(state.translations, 'product.backToGallery')}</a>
      </section>
    `;
    return;
  }

  const productName = getLocalizedProductField(product, 'name', state.lang);
  const productDescription = getLocalizedProductField(product, 'description', state.lang);
  const productColor = getLocalizedProductField(product, 'color', state.lang);
  const productMaterial = getLocalizedProductField(product, 'material', state.lang);
  const categoryMeta = getCategoryMeta(product.category);
  const images = product.images;
  const relatedProducts = getRelatedProducts(state.products, product, 3);
  const firstImage = images[0] || null;

  pageRoot.innerHTML = `
    <section class="content-section content-section--compact">
      <a class="back-link" href="gallery.html">← ${t(state.translations, 'product.backToGallery')}</a>
      <div class="product-layout">
        <div class="product-layout__media">
          <div class="image-frame image-frame--detail" data-image-frame data-emoji="${categoryMeta.emoji}">
            ${firstImage ? `<img src="${firstImage}" alt="${productName}" data-main-image>` : ''}
            <div class="image-frame__fallback" data-main-fallback ${firstImage ? 'hidden' : ''}>${categoryMeta.emoji}</div>
          </div>
          ${images.length > 1
            ? `
              <div class="thumb-grid">
                ${images
                  .map(
                    (image, index) => `
                      <button type="button" class="thumb-button ${index === 0 ? 'is-active' : ''}" data-thumb-image="${image}" aria-pressed="${index === 0 ? 'true' : 'false'}">
                        <img src="${image}" alt="${productName} ${index + 1}">
                      </button>
                    `
                  )
                  .join('')}
              </div>
            `
            : ''}
        </div>
        <div class="product-layout__info">
          <span class="category-pill">${categoryMeta.emoji} ${t(state.translations, `category.label.${categoryMeta.key}`)}</span>
          <h1>${productName}</h1>
          <p class="product-price">${formatPrice(product.price, state.lang)}</p>
          ${availabilityMarkup(product, state.translations, state.lang)}
          <p class="product-description">${productDescription}</p>
          <dl class="spec-list">
            <div>
              <dt>${t(state.translations, 'product.category')}</dt>
              <dd>${t(state.translations, `category.label.${categoryMeta.key}`)}</dd>
            </div>
            <div>
              <dt>${t(state.translations, 'product.material')}</dt>
              <dd>${productMaterial}</dd>
            </div>
            <div>
              <dt>${t(state.translations, 'product.color')}</dt>
              <dd>${productColor}</dd>
            </div>
            <div>
              <dt>${t(state.translations, 'product.availableQuantity')}</dt>
              <dd>${product.quantityAvailable}</dd>
            </div>
          </dl>
          <div class="stack-actions">
            <a class="btn btn--primary" href="contact.html?product=${product.id}">${t(state.translations, 'product.askAbout')}</a>
            <a class="btn btn--ghost" href="category.html?category=${product.category}">${t(state.translations, `category.label.${categoryMeta.key}`)}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section content-section--compact">
      ${createSectionHeading(t(state.translations, 'product.related'))}
      ${renderProductGrid(relatedProducts)}
    </section>
  `;
}

function renderAboutPage() {
  const values = ['quality', 'sustainable', 'love', 'custom', 'satisfaction', 'community'];

  pageRoot.innerHTML = `
    <section class="content-section">
      <div class="about-layout">
        <div class="about-card about-card--story">
          ${createSectionHeading(t(state.translations, 'about.heading'))}
          <div class="copy-stack">
            <p>${t(state.translations, 'about.p1')}</p>
            <p>${t(state.translations, 'about.p2')}</p>
            <p>${t(state.translations, 'about.p3')}</p>
          </div>
        </div>
        <div class="about-card about-card--visual">
          <img class="about-portrait" src="assets/images/author/YMI1.jpg" alt="Portrait of the crochet studio creator">
        </div>
      </div>
    </section>

    <section class="content-section content-section--compact">
      ${createSectionHeading(t(state.translations, 'about.values'))}
      <div class="value-grid">
        ${values
          .map(
            (value) => `
              <article class="value-card">
                <h3>${t(state.translations, `about.value.${value}.title`)}</h3>
                <p>${t(state.translations, `about.value.${value}.desc`)}</p>
              </article>
            `
          )
          .join('')}
      </div>
    </section>

    <section class="cta-panel">
      <div>
        <h2>${t(state.translations, 'about.cta.title')}</h2>
        <p>${t(state.translations, 'about.cta.desc')}</p>
      </div>
      <div class="hero-section__actions">
        <a class="btn btn--primary" href="gallery.html">${t(state.translations, 'about.cta.shop')}</a>
        <a class="btn btn--ghost" href="contact.html">${t(state.translations, 'about.cta.custom')}</a>
      </div>
    </section>
  `;
}

function renderContactPage() {
  pageRoot.innerHTML = `
    <section class="content-section">
      <div class="about-card contact-card">
        ${createSectionHeading(t(state.translations, 'contact.heading'), t(state.translations, 'contact.intro'))}
        <div class="contact-methods">
          <a href="mailto:${CONTACT_DETAILS.email}">
            <strong>${t(state.translations, 'contact.emailLabel')}</strong>
            <span>${CONTACT_DETAILS.email}</span>
          </a>
          <a href="tel:${CONTACT_DETAILS.phone.replace(/\s+/g, '')}">
            <strong>${t(state.translations, 'contact.phoneLabel')}</strong>
            <span>${CONTACT_DETAILS.phone}</span>
          </a>
          <a href="${CONTACT_DETAILS.facebook}" target="_blank" rel="noopener noreferrer">
            <strong>${t(state.translations, 'contact.facebookLabel')}</strong>
            <span>${t(state.translations, 'contact.facebookLink')}</span>
          </a>
          <a href="${CONTACT_DETAILS.instagram}" target="_blank" rel="noopener noreferrer">
            <strong>${t(state.translations, 'contact.instagramLabel')}</strong>
            <span>${t(state.translations, 'contact.instagramLink')}</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

function renderProductGrid(products) {
  if (!products.length) {
    return `
      <div class="empty-state">
        <p>${t(state.translations, 'common.empty')}</p>
      </div>
    `;
  }

  return `
    <div class="product-grid">
      ${products.map((product) => renderProductCard(product, state.translations, state.lang)).join('')}
    </div>
  `;
}
