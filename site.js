(() => {
  // Mobile navigation
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  /*
   * IMPORTANT:
   * Folder names must match GitHub exactly.
   * Netlify is case-sensitive.
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

  const allGalleryItems = Object.entries(GALLERIES).flatMap(
    ([category, gallery]) => {
      return gallery.files.map((file) => ({
        category,
        categoryLabel: gallery.label,
        file,
        src: gallery.folder + file,
        title: prettyName(file)
      }));
    }
  );

  // Lightbox
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  lightbox.innerHTML = `
    <div class="lightbox-inner">
      <div class="lightbox-bar">
        <div class="lightbox-title" id="lbTitle"></div>

        <button
          class="lightbox-close"
          id="lbClose"
          type="button"
          aria-label="Close image"
        >
          Close ✕
        </button>
      </div>

      <img
        class="lightbox-img"
        id="lbImg"
        src=""
        alt=""
      />
    </div>
  `;

  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('#lbImg');
  const lightboxTitle = lightbox.querySelector('#lbTitle');
  const lightboxClose = lightbox.querySelector('#lbClose');

  const openLightbox = (src, title) => {
    lightbox.classList.add('open');
    lightboxImage.src = src;
    lightboxImage.alt = title || '';
    lightboxTitle.textContent = title || '';
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightboxImage.src = '';
    lightboxImage.alt = '';
    lightboxTitle.textContent = '';
    document.body.style.overflow = '';
  };

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  lightboxClose.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });

  const createGalleryCard = (item) => {
    const card = document.createElement('button');
    card.className = 'gallery-card';
    card.type = 'button';
    card.setAttribute(
      'aria-label',
      `View ${item.title} in ${item.categoryLabel}`
    );

    card.innerHTML = `
      <img
        src="${item.src}"
        alt="${item.title}"
        loading="lazy"
      />

      <div class="gallery-cap">
        <span>${item.title}</span>
        <small>${item.categoryLabel}</small>
      </div>
    `;

    card.addEventListener('click', () => {
      openLightbox(item.src, item.title);
    });

    return card;
  };

  const renderGallery = (items, grid, countEl) => {
    grid.innerHTML = '';

    if (countEl) {
      countEl.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
    }

    if (!items.length) {
      grid.innerHTML = `
        <p class="gallery-empty">
          No gallery items were found in this category.
        </p>
      `;

      return;
    }

    items.forEach((item) => {
      grid.appendChild(createGalleryCard(item));
    });
  };

  /*
   * Existing separate gallery pages
   *
   * These pages use:
   * <body data-gallery="tumblers">
   */
  const currentCategory = document.body?.dataset?.gallery;
  const galleryGrid = document.getElementById('gallery-grid');
  const pageCount = document.getElementById('page-count');

  if (
    currentCategory &&
    currentCategory !== 'all' &&
    galleryGrid &&
    GALLERIES[currentCategory]
  ) {
    const categoryItems = allGalleryItems.filter(
      (item) => item.category === currentCategory
    );

    renderGallery(categoryItems, galleryGrid, pageCount);
  }

  /*
   * New unified gallery page
   *
   * It will use:
   * <body data-gallery="all">
   * <div id="gallery-filters"></div>
   * <div id="gallery-grid"></div>
   */
  const filterContainer = document.getElementById('gallery-filters');

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
      ...Object.entries(GALLERIES).map(([value, gallery]) => ({
        value,
        label: gallery.label
      }))
    ];

    let activeCategory = 'all';

    const updateFilterButtons = () => {
      filterContainer
        .querySelectorAll('.gallery-filter')
        .forEach((button) => {
          const isActive = button.dataset.category === activeCategory;

          button.classList.toggle('active', isActive);
          button.setAttribute(
            'aria-pressed',
            isActive ? 'true' : 'false'
          );
        });
    };

    const displayCategory = (category) => {
      activeCategory = GALLERIES[category] ? category : 'all';

      const visibleItems =
        activeCategory === 'all'
          ? allGalleryItems
          : allGalleryItems.filter(
              (item) => item.category === activeCategory
            );

      renderGallery(visibleItems, galleryGrid, pageCount);
      updateFilterButtons();

      const url = new URL(window.location.href);

      if (activeCategory === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', activeCategory);
      }

      window.history.replaceState({}, '', url);
    };

    filterOptions.forEach((option) => {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'gallery-filter';
      button.dataset.category = option.value;
      button.textContent = option.label;
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        displayCategory(option.value);
      });

      filterContainer.appendChild(button);
    });

    const requestedCategory = new URLSearchParams(
      window.location.search
    ).get('category');

    displayCategory(requestedCategory || 'all');
  }
})();