(async () => {
  // Mobile navigation
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const CATEGORY_LABELS = {
    coasters: 'Coasters',
    keychains: 'Keychains',
    tumblers: 'Tumblers',
    wallets: 'Wallets',
    woodworks: 'Woodworks'
  };

  const normalizeProduct = (product) => {
    if (!product || typeof product !== 'object') {
      return null;
    }

    const category =
      typeof product.category === 'string'
        ? product.category.trim().toLowerCase()
        : '';

    if (!CATEGORY_LABELS[category]) {
      return null;
    }

    const title =
      typeof product.title === 'string'
        ? product.title.trim()
        : '';

    const src =
      typeof product.imageUrl === 'string'
        ? product.imageUrl.trim()
        : '';

    if (!title || !src) {
      return null;
    }

    return {
      id: String(product.id || ''),
      category,
      categoryLabel: CATEGORY_LABELS[category],
      src,
      title,

      price:
        typeof product.price === 'string'
          ? product.price.trim()
          : '',

      description:
        typeof product.description === 'string'
          ? product.description.trim()
          : '',

      featured: Boolean(product.featured),

      published:
        product.published !== false,

      createdAt:
        typeof product.createdAt === 'string'
          ? product.createdAt
          : ''
    };
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(
        `products.json?v=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error(
          `products.json returned ${response.status}`
        );
      }

      const products = await response.json();

      if (!Array.isArray(products)) {
        throw new Error(
          'products.json must contain an array.'
        );
      }

      return products
        .map(normalizeProduct)
        .filter(Boolean)
        .filter((product) => product.published);
    } catch (error) {
      console.error(
        'Could not load products:',
        error
      );

      return [];
    }
  };

  const allGalleryItems =
    await loadProducts();

  /*
   * Lightbox
   */
  const lightbox =
    document.createElement('div');

  lightbox.className = 'lightbox';

  const lightboxInner =
    document.createElement('div');

  lightboxInner.className =
    'lightbox-inner';

  const lightboxBar =
    document.createElement('div');

  lightboxBar.className =
    'lightbox-bar';

  const lightboxTitle =
    document.createElement('div');

  lightboxTitle.className =
    'lightbox-title';

  const lightboxClose =
    document.createElement('button');

  lightboxClose.className =
    'lightbox-close';

  lightboxClose.type = 'button';

  lightboxClose.setAttribute(
    'aria-label',
    'Close image'
  );

  lightboxClose.textContent =
    'Close ✕';

  const lightboxImage =
    document.createElement('img');

  lightboxImage.className =
    'lightbox-img';

  lightboxImage.alt = '';

  lightboxBar.append(
    lightboxTitle,
    lightboxClose
  );

  lightboxInner.append(
    lightboxBar,
    lightboxImage
  );

  lightbox.appendChild(
    lightboxInner
  );

  document.body.appendChild(
    lightbox
  );

  const openLightbox = (item) => {
    lightbox.classList.add('open');

    lightboxImage.src = item.src;
    lightboxImage.alt = item.title;

    const details = [
      item.title
    ];

    if (item.price) {
      details.push(
        item.price
      );
    }

    lightboxTitle.textContent =
      details.join(' — ');

    document.body.style.overflow =
      'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');

    lightboxImage.src = '';
    lightboxImage.alt = '';
    lightboxTitle.textContent = '';

    document.body.style.overflow =
      '';
  };

  lightbox.addEventListener(
    'click',
    (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    }
  );

  lightboxClose.addEventListener(
    'click',
    closeLightbox
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    }
  );

  const createGalleryCard = (item) => {
    const card =
      document.createElement('button');

    card.className =
      'gallery-card';

    card.type = 'button';

    card.setAttribute(
      'aria-label',
      `View ${item.title} in ${item.categoryLabel}`
    );

    const image =
      document.createElement('img');

    image.src = item.src;
    image.alt = item.title;
    image.loading = 'lazy';

    image.addEventListener(
      'error',
      () => {
        card.remove();
      }
    );

    const caption =
      document.createElement('div');

    caption.className =
      'gallery-cap';

    const title =
      document.createElement('span');

    title.textContent =
      item.title;

    const category =
      document.createElement('small');

    category.textContent =
      item.categoryLabel;

    caption.append(
      title,
      category
    );

    if (item.price) {
      const price =
        document.createElement('strong');

      price.className =
        'gallery-price';

      price.textContent =
        item.price;

      caption.appendChild(
        price
      );
    }

    if (item.description) {
      const description =
        document.createElement('p');

      description.className =
        'gallery-description';

      description.textContent =
        item.description;

      caption.appendChild(
        description
      );
    }

    card.append(
      image,
      caption
    );

    card.addEventListener(
      'click',
      () => {
        openLightbox(item);
      }
    );

    return card;
  };

  const renderGallery = (
    items,
    grid,
    countEl
  ) => {
    grid.innerHTML = '';

    if (countEl) {
      countEl.textContent =
        `${items.length} item${
          items.length === 1
            ? ''
            : 's'
        }`;
    }

    if (!items.length) {
      const empty =
        document.createElement('p');

      empty.className =
        'gallery-empty';

      empty.textContent =
        'No gallery items were found in this category.';

      grid.appendChild(
        empty
      );

      return;
    }

    const fragment =
      document.createDocumentFragment();

    items.forEach((item) => {
      fragment.appendChild(
        createGalleryCard(item)
      );
    });

    grid.appendChild(
      fragment
    );
  };

  const currentCategory =
    document.body?.dataset?.gallery;

  const galleryGrid =
    document.getElementById(
      'gallery-grid'
    );

  const pageCount =
    document.getElementById(
      'page-count'
    );

  /*
   * Separate category pages
   */
  if (
    currentCategory &&
    currentCategory !== 'all' &&
    galleryGrid &&
    CATEGORY_LABELS[currentCategory]
  ) {
    const categoryItems =
      allGalleryItems.filter(
        (item) =>
          item.category ===
          currentCategory
      );

    renderGallery(
      categoryItems,
      galleryGrid,
      pageCount
    );
  }

  /*
   * Unified gallery page
   */
  const filterContainer =
    document.getElementById(
      'gallery-filters'
    );

  if (
    currentCategory === 'all' &&
    galleryGrid &&
    filterContainer
  ) {
    const filterOptions = [
      {
        value: 'all',
        label: 'All'
      },

      ...Object.entries(
        CATEGORY_LABELS
      ).map(
        ([value, label]) => ({
          value,
          label
        })
      )
    ];

    let activeCategory =
      'all';

    const updateFilterButtons = () => {
      filterContainer
        .querySelectorAll(
          '.gallery-filter'
        )
        .forEach((button) => {
          const isActive =
            button.dataset.category ===
            activeCategory;

          button.classList.toggle(
            'active',
            isActive
          );

          button.setAttribute(
            'aria-pressed',
            isActive
              ? 'true'
              : 'false'
          );
        });
    };

    const displayCategory = (
      category
    ) => {
      activeCategory =
        CATEGORY_LABELS[category]
          ? category
          : 'all';

      const visibleItems =
        activeCategory === 'all'
          ? allGalleryItems
          : allGalleryItems.filter(
              (item) =>
                item.category ===
                activeCategory
            );

      renderGallery(
        visibleItems,
        galleryGrid,
        pageCount
      );

      updateFilterButtons();

      const url =
        new URL(
          window.location.href
        );

      if (
        activeCategory === 'all'
      ) {
        url.searchParams.delete(
          'category'
        );
      } else {
        url.searchParams.set(
          'category',
          activeCategory
        );
      }

      window.history.replaceState(
        {},
        '',
        url
      );
    };

    filterOptions.forEach(
      (option) => {
        const button =
          document.createElement(
            'button'
          );

        button.type =
          'button';

        button.className =
          'gallery-filter';

        button.dataset.category =
          option.value;

        button.textContent =
          option.label;

        button.setAttribute(
          'aria-pressed',
          'false'
        );

        button.addEventListener(
          'click',
          () => {
            displayCategory(
              option.value
            );
          }
        );

        filterContainer.appendChild(
          button
        );
      }
    );

    const requestedCategory =
      new URLSearchParams(
        window.location.search
      ).get('category');

    displayCategory(
      requestedCategory ||
      'all'
    );
  }
})();