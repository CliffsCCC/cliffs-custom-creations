(async () => {
  // Mobile navigation
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  /*
   * Existing gallery photos.
   * Folder names must match GitHub exactly because Netlify is case-sensitive.
   */
  const GALLERIES = {
    coasters: {
      label: 'Coasters',
      folder: 'assets/Coasters/',
      files: [
        '72-TA.jpg',
        '89-TA.jpg',
        'Faith-1.jpg',
        'Faith-2.jpg',
        'FHS-1.jpg',
        'Freedome-set.jpg',
        'LM-1.jpg',
        'LM-2.jpg',
        'LM-3.jpg',
        'LM-4.jpg',
        'riverside-set.jpg',
        'RS-1.jpg',
        'RS-2.jpg',
        'RS-3.jpg',
        'RS-4.jpg',
        'WF-1.jpg',
        'WF-2.jpg',
        'WF-3.jpg',
        'WF-4.jpg',
        'WF-5.jpg',
        'xmas-set-1.jpg'
      ]
    },

    keychains: {
      label: 'Keychains',
      folder: 'assets/keychains/',
      files: [
        'faith-1.jpg',
        'faith-2.jpg',
        'favorvers-1.jpg',
        'favorvers-2.jpg',
        'hisandhers-1.jpg',
        'iloveyou-1.jpg',
        'keychain-1.jpg',
        'lastnames-1.jpg',
        'sheisstrong-1.jpg',
        'teamwork-1.jpg'
      ]
    },

    tumblers: {
      label: 'Tumblers',
      folder: 'assets/Tumblers/',
      files: [
        'getclean.png',
        'tumbler-1.png',
        'tumbler-2.png',
        'egale-1.jpg',
        'godisright.png',
        'grace.png',
        'happybirthday-1.jpg',
        'iamnotperfict-1.jpg',
        'jesusistheway.png',
        'love-1.jpg',
        'love-2.jpg',
        'skatebording-1.jpg',
        'texastech-1.jpg',
        'tumbler-3.jpg',
        'werstling-1.jpg',
        'wethepeople-1.jpg'
      ]
    },

    wallets: {
      label: 'Wallets',
      folder: 'assets/wallets/',
      files: [
        'acualhandwriting.jpg',
        'daughterandfather-1.jpg'
      ]
    },

    woodworks: {
      label: 'Woodworks',
      folder: 'assets/woodworks/',
      files: [
        'baseballgame-1.jpg',
        'baseballgame-2.jpg',
        'nameplates.jpg',
        'pet-1.jpg',
        'pet-2.jpg',
        'pet-3.jpg',
        'pet-4.jpg',
        'pet-5.jpg',
        'pet-6.jpg',
        'pet-7.jpg',
        'pet-8.jpg',
        'pet-9.jpg',
        'pet-10.jpg',
        'pet-11.jpg',
        'woodenplaques-1.jpg',
        'woodenplaques-2.jpg',
        'woodenplaques-3.jpg',
        'xmas-1.jpg',
        'xmas-2.jpg',
        'xmas-3.jpg',
        'xmas-4.jpg',
        'xmas-5.jpg'
      ]
    }
  };

  const prettyName = (file) => {
    return file
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const legacyGalleryItems = Object.entries(GALLERIES).flatMap(
    ([category, gallery]) => {
      return gallery.files.map((file) => ({
        id: `legacy-${category}-${file}`,
        category,
        categoryLabel: gallery.label,
        src: gallery.folder + file,
        title: prettyName(file),
        price: '',
        description: '',
        featured: false,
        isDynamic: false
      }));
    }
  );

  const normalizePublishedProduct = (product) => {
    if (!product || typeof product !== 'object') {
      return null;
    }

    const category =
      typeof product.category === 'string'
        ? product.category.trim().toLowerCase()
        : '';

    if (!GALLERIES[category]) {
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

    if (
      !title ||
      !src.startsWith('https://res.cloudinary.com/')
    ) {
      return null;
    }

    return {
      id:
        product.id ||
        `product-${Date.now()}-${Math.random()}`,

      category,
      categoryLabel: GALLERIES[category].label,
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
      isDynamic: true
    };
  };

  const loadPublishedProducts = async () => {
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
        .filter((product) => product.published !== false)
        .map(normalizePublishedProduct)
        .filter(Boolean);
    } catch (error) {
      console.error(
        'Could not load published products:',
        error
      );

      return [];
    }
  };

  const publishedProducts =
    await loadPublishedProducts();

  /*
   * New products are placed first.
   */
  const allGalleryItems = [
    ...publishedProducts,
    ...legacyGalleryItems
  ];

  /*
   * Lightbox
   */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  const lightboxInner =
    document.createElement('div');

  lightboxInner.className = 'lightbox-inner';

  const lightboxBar =
    document.createElement('div');

  lightboxBar.className = 'lightbox-bar';

  const lightboxTitle =
    document.createElement('div');

  lightboxTitle.className = 'lightbox-title';

  const lightboxClose =
    document.createElement('button');

  lightboxClose.className = 'lightbox-close';
  lightboxClose.type = 'button';

  lightboxClose.setAttribute(
    'aria-label',
    'Close image'
  );

  lightboxClose.textContent = 'Close ✕';

  const lightboxImage =
    document.createElement('img');

  lightboxImage.className = 'lightbox-img';
  lightboxImage.alt = '';

  lightboxBar.append(
    lightboxTitle,
    lightboxClose
  );

  lightboxInner.append(
    lightboxBar,
    lightboxImage
  );

  lightbox.appendChild(lightboxInner);
  document.body.appendChild(lightbox);

  const openLightbox = (item) => {
    lightbox.classList.add('open');

    lightboxImage.src = item.src;
    lightboxImage.alt = item.title;

    const details = [item.title];

    if (item.price) {
      details.push(item.price);
    }

    lightboxTitle.textContent =
      details.join(' — ');

    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');

    lightboxImage.src = '';
    lightboxImage.alt = '';
    lightboxTitle.textContent = '';

    document.body.style.overflow = '';
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

    card.className = 'gallery-card';
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

    caption.className = 'gallery-cap';

    const title =
      document.createElement('span');

    title.textContent = item.title;

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

      price.className = 'gallery-price';
      price.textContent = item.price;

      caption.appendChild(price);
    }

    if (item.description) {
      const description =
        document.createElement('p');

      description.className =
        'gallery-description';

      description.textContent =
        item.description;

      caption.appendChild(description);
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
          items.length === 1 ? '' : 's'
        }`;
    }

    if (!items.length) {
      const empty =
        document.createElement('p');

      empty.className = 'gallery-empty';

      empty.textContent =
        'No gallery items were found in this category.';

      grid.appendChild(empty);
      return;
    }

    const fragment =
      document.createDocumentFragment();

    items.forEach((item) => {
      fragment.appendChild(
        createGalleryCard(item)
      );
    });

    grid.appendChild(fragment);
  };

  const currentCategory =
    document.body?.dataset?.gallery;

  const galleryGrid =
    document.getElementById('gallery-grid');

  const pageCount =
    document.getElementById('page-count');

  /*
   * Existing separate category pages
   */
  if (
    currentCategory &&
    currentCategory !== 'all' &&
    galleryGrid &&
    GALLERIES[currentCategory]
  ) {
    const categoryItems =
      allGalleryItems.filter(
        (item) =>
          item.category === currentCategory
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

      ...Object.entries(GALLERIES).map(
        ([value, gallery]) => ({
          value,
          label: gallery.label
        })
      )
    ];

    let activeCategory = 'all';

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
            isActive ? 'true' : 'false'
          );
        });
    };

    const displayCategory = (category) => {
      activeCategory =
        GALLERIES[category]
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
        new URL(window.location.href);

      if (activeCategory === 'all') {
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

    filterOptions.forEach((option) => {
      const button =
        document.createElement('button');

      button.type = 'button';
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
    });

    const requestedCategory =
      new URLSearchParams(
        window.location.search
      ).get('category');

    displayCategory(
      requestedCategory || 'all'
    );
  }
})();