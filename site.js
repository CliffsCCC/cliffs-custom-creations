(() => {
  const GALLERIES = {
    coasters: {
      folder: "assets/coasters/",
      files: [
        "72-TA.jpg","89-TA.jpg","Faith-1.jpg","Faith-2.jpg","FHS-1.jpg",
        "Freedome-set.jpg","LM-1.jpg","LM-2.jpg","LM-3.jpg","LM-4.jpg",
        "riverside-set.jpg","RS-1.jpg","RS-2.jpg","RS-3.jpg","RS-4.jpg",
        "WF-1.jpg","WF-2.jpg","WF-3.jpg","WF-4.jpg","WF-5.jpg","xmas-set-1.jpg"
      ]
    },
    keychains: {
      folder: "assets/keychains/",
      files: [
        "faith-1.jpg","faith-2.jpg","favorvers-1.jpg","favorvers-2.jpg",
        "hisandhers-1.jpg","iloveyou-1.jpg","keychain-1.jpg","lastnames-1.jpg",
        "sheisstrong-1.jpg","teamwork-1.jpg"
      ]
    },
    tumblers: {
      folder: "assets/tumblers/",
      files: [
        "egale-1.jpg","getclean.png","godisright.png","grace.png","happybirthday-1.jpg",
        "iamnotperfict-1.jpg","jesusistheway.png","love-1.jpg","love-2.jpg",
        "skatebording-1.jpg","texastech-1.jpg","tumbler-1.png","tumbler-2.png",
        "tumbler-3.jpg","werstling-1.jpg","wethepeople-1.jpg"
      ]
    },
    wallets: {
      folder: "assets/wallets/",
      files: ["acualhandwriting.jpg","daughterandfather-1.jpg"]
    },
    woodworks: {
      folder: "assets/woodworks/",
      files: [
        "baseballgame-1.jpg","baseballgame-2.jpg","nameplates.jpg",
        "pet-1.jpg","pet-2.jpg","pet-3.jpg","pet-4.jpg","pet-5.jpg","pet-6.jpg",
        "pet-7.jpg","pet-8.jpg","pet-9.jpg","pet-10.jpg","pet-11.jpg",
        "woodenplaques-1.jpg","woodenplaques-2.jpg","woodenplaques-3.jpg",
        "xmas-1.jpg","xmas-2.jpg","xmas-3.jpg","xmas-4.jpg","xmas-5.jpg"
      ]
    }
  };

  const page = document.body?.dataset?.gallery;
  const grid = document.getElementById("gallery-grid");
  const countEl = document.getElementById("page-count");

  // Lightbox
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `
    <div class="lightbox-inner">
      <div class="lightbox-bar">
        <div class="lightbox-title" id="lbTitle"></div>
        <button class="lightbox-close" id="lbClose" type="button">Close ✕</button>
      </div>
      <img class="lightbox-img" id="lbImg" alt="" />
    </div>
  `;
  document.body.appendChild(lb);

  const openLightbox = (src, title) => {
    lb.classList.add("open");
    lb.querySelector("#lbImg").src = src;
    lb.querySelector("#lbImg").alt = title || "";
    lb.querySelector("#lbTitle").textContent = title || "";
  };

  const closeLightbox = () => {
    lb.classList.remove("open");
    lb.querySelector("#lbImg").src = "";
    lb.querySelector("#lbImg").alt = "";
    lb.querySelector("#lbTitle").textContent = "";
  };

  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  lb.querySelector("#lbClose").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  // Render gallery
  if (page && grid && GALLERIES[page]) {
    const g = GALLERIES[page];
    if (countEl) countEl.textContent = `${g.files.length} item(s)`;

    grid.innerHTML = "";
    g.files.forEach((file) => {
      const src = g.folder + file;
      const card = document.createElement("div");
      card.className = "gallery-card";
      card.innerHTML = `
        <img src="${src}" alt="${file}" loading="lazy" />
        <div class="gallery-cap">${file}</div>
      `;
      card.addEventListener("click", () => openLightbox(src, file));
      grid.appendChild(card);
    });
  }
})();
