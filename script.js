/* Year */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* Best Seller buttons scroll to contact + prefill item */
const itemField = document.getElementById("itemField");
document.querySelectorAll("[data-scroll-contact]").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.getAttribute("data-item") || "";
    if (itemField) itemField.value = item;
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  });
});

/* Featured image (optional) */
(() => {
  const img = document.getElementById("featuredImg");
  if (!img) return;
  const test = new Image();
  test.onload = () => {
    img.src = "assets/featured.jpg";
    img.alt = "Featured work by Cliff’s Custom Creations";
    img.style.display = "block";
  };
  test.onerror = () => { /* ignore */ };
  test.src = "assets/featured.jpg";
})();

/* Lightbox */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxCap = document.getElementById("lightboxCap");

function openLightbox(src, caption = "") {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = caption || "Gallery image";
  if (lightboxCap) lightboxCap.textContent = caption || "";
  lightbox.classList.add("show");
  lightbox.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  if (!lightbox || !lightboxImg) return;
  lightbox.classList.remove("show");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  if (lightboxCap) lightboxCap.textContent = "";
}
lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* Netlify thank-you */
(() => {
  const form = document.getElementById("orderForm");
  const thanks = document.getElementById("thanks");
  if (!form || !thanks) return;

  form.addEventListener("submit", () => {
    setTimeout(() => {
      thanks.hidden = false;
      thanks.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 500);
  });
})();

/* Gallery from manifest.json */
const grid = document.getElementById("galleryGrid");
const empty = document.getElementById("galleryEmpty");
const filters = document.querySelectorAll(".filter");

let manifest = null;
let activeCategory = "tumblers";

async function loadManifest() {
  const res = await fetch("assets/manifest.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load manifest.json");
  return await res.json();
}

function prettyName(category) {
  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderCategory(category) {
  if (!grid || !manifest) return;
  activeCategory = category;

  // set active button
  filters.forEach(b => b.classList.toggle("is-active", b.dataset.category === category));

  // clear
  grid.innerHTML = "";

  const list = manifest[category] || [];
  if (!list.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  list.forEach((filename) => {
    const src = `assets/${category}/${filename}`;
    const caption = `${prettyName(category)} • ${filename}`;

    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = src;
    img.alt = caption;

    // If an image 404s, hide it (so broken links don’t look ugly)
    img.onerror = () => { tile.style.display = "none"; };

    const cap = document.createElement("div");
    cap.className = "cap";
    cap.textContent = filename;

    tile.appendChild(img);
    tile.appendChild(cap);

    tile.addEventListener("click", () => openLightbox(src, caption));

    grid.appendChild(tile);
  });
}

filters.forEach(btn => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.category;
    if (!cat) return;
    renderCategory(cat);
  });
});

// boot
(async () => {
  try {
    manifest = await loadManifest();
    renderCategory(activeCategory);
  } catch (err) {
    console.error(err);
    if (empty) {
      empty.hidden = false;
      empty.innerHTML = `Could not load <code>assets/manifest.json</code>. Make sure it exists and is committed.`;
    }
  }
})();
