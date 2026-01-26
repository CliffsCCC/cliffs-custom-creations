(function () {
  // ---- EDIT HERE if you add new images later ----
  const GALLERIES = {
    coasters: {
      title: "Coasters",
      folder: "assets/coasters/",
      files: [
        "72-TA.jpg",
        "89-TA.jpg",
        "Faith-1.jpg",
        "Faith-2.jpg",
        "FHS-1.jpg",
        "Freedome-set.jpg",
        "LM-1.jpg",
        "LM-2.jpg",
        "LM-3.jpg",
        "LM-4.jpg",
        "riverside-set.jpg",
        "RS-1.jpg",
        "RS-2.jpg",
        "RS-3.jpg",
        "RS-4.jpg",
        "WF-1.jpg",
        "WF-2.jpg",
        "WF-3.jpg",
        "WF-4.jpg",
        "WF-5.jpg",
        "Xmas-set-1.jpg"
      ]
    },

    keychains: {
      title: "Keychains",
      folder: "assets/keychains/",
      files: [
        "faith-1.jpg",
        "faith-2.jpg",
        "favorvers-1.jpg",
        "favorvers-2.jpg",
        "hisandhers-1.jpg",
        "iloveyou-1.jpg",
        "keychain-1.jpg",
        "lastnames-1.jpg",
        "sheisstrong-1.jpg",
        "teamwork-1.jpg"
      ]
    },

    tumblers: {
      title: "Tumblers",
      folder: "assets/tumblers/",
      files: [
        "egale-1.jpg",
        "getclean.png",
        "godisright.png",
        "grace.png",
        "happybirthday-1.jpg",
        "iamnotperfict-1.jpg",
        "jesusistheway.png",
        "love-1.jpg",
        "love-2.jpg",
        "skatebording-1.jpg",
        "texastech-1.jpg",
        "tumbler-1.png",
        "tumbler-2.png",
        "tumbler-3.jpg",
        "werstling-1.jpg",
        "wethepeople-1.jpg"
      ]
    },

    wallets: {
      title: "Wallets",
      folder: "assets/wallets/",
      files: [
        "acualhandwriting.jpg",
        "daughterandfather-1.jpg"
      ]
    },

    woodworks: {
      title: "Woodworks",
      folder: "assets/woodworks/",
      files: [
        "baseballgame-1.jpg",
        "baseballgame-2.jpg",
        "nameplates.jpg",
        "pet-1.jpg",
        "pet-2.jpg",
        "pet-3.jpg",
        "pet-4.jpg",
        "pet-5.jpg",
        "pet-6.jpg",
        "pet-7.jpg",
        "pet-8.jpg",
        "pet-9.jpg",
        "pet-10.jpg",
        "pet-11.jpg",
        "woodenplaques-1.jpg",
        "woodenplaques-2.jpg",
        "woodenplaques-3.jpg",
        "xmas-1.jpg",
        "xmas-2.jpg",
        "xmas-3.jpg",
        "xmas-4.jpg",
        "xmas-5.jpg"
      ]
    }
  };
  // ---------------------------------------------

  const page = document.body?.dataset?.page || "";

  // Build lightbox once
  const lightbox = createLightbox();

  // If we’re on a gallery page, render the grid
  if (["coasters", "keychains", "tumblers", "wallets", "woodworks"].includes(page)) {
    const data = GALLERIES[page];
    const grid = document.getElementById("gallery-grid");
    const titleEl = document.getElementById("page-title");
    const countEl = document.getElementById("page-count");

    if (titleEl) titleEl.textContent = data.title;
    if (countEl) countEl.textContent = `${data.files.length} items`;

    if (grid) {
      grid.innerHTML = "";
      data.files.forEach((file) => {
        const src = data.folder + file;
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.innerHTML = `
          <img src="${src}" alt="${file}" loading="lazy" />
          <div class="gallery-cap">${prettyName(file)}</div>
        `;
        item.addEventListener("click", () => openLightbox(src, prettyName(file)));
        grid.appendChild(item);
      });
    }
  }

  // helpers
  function prettyName(filename) {
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function createLightbox() {
    const el = document.createElement("div");
    el.className = "lightbox";
    el.innerHTML = `
      <div class="lightbox-inner" role="dialog" aria-modal="true">
        <div class="lightbox-bar">
          <div class="lightbox-title" id="lbTitle"></div>
          <button class="lightbox-close" id="lbClose" type="button">Close ✕</button>
        </div>
        <img class="lightbox-img" id="lbImg" alt="" />
      </div>
    `;
    document.body.appendChild(el);

    el.addEventListener("click", (e) => {
      if (e.target === el) closeLightbox();
    });
    el.querySelector("#lbClose").addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });

    return el;
  }

  function openLightbox(src, title) {
    lightbox.classList.add("open");
    const img = lightbox.querySelector("#lbImg");
    const t = lightbox.querySelector("#lbTitle");
    img.src = src;
    img.alt = title;
    t.textContent = title;
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    const img = lightbox.querySelector("#lbImg");
    img.src = "";
    img.alt = "";
  }
})();
