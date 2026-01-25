/* Year */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* Best Seller buttons -> scroll to form and prefill item */
const itemField = document.getElementById("itemField");
document.querySelectorAll("[data-scroll-contact]").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.getAttribute("data-item") || "";
    if (itemField) itemField.value = item;
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  });
});

/* Netlify form: show thanks */
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

/* Lightbox */
(() => {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCap = document.getElementById("lightboxCap");
  const lbClose = document.getElementById("lightboxClose");
  if (!lb || !lbImg || !lbClose || !lbCap) return;

  function openLightbox(src, alt = "", caption=""){
    lbImg.src = src;
    lbImg.alt = alt;
    lbCap.textContent = caption;
    lb.classList.add("show");
    lb.setAttribute("aria-hidden", "false");
  }
  function closeLightbox(){
    lb.classList.remove("show");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
    lbCap.textContent = "";
  }

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  window.__openLightbox = openLightbox;
})();

/* Gallery loader */
(async () => {
  const grid = document.getElementById("galleryGrid");
  const filters = document.getElementById("filters");
  const featuredImg = document.getElementById("featuredImg");
  if (!grid || !filters) return;

  const CATS = [
    "All",
    "Tumblers",
    "Coasters",
    "Leather Keychains",
    "Wallets",
    "Wood Works"
  ];

  function normCat(cat){
    const c = (cat || "").trim().toLowerCase();
    if (c === "tumblers") return "Tumblers";
    if (c === "coasters") return "Coasters";
    if (c === "leather keychains" || c === "keychains") return "Leather Keychains";
    if (c === "wallets" || c === "wallet") return "Wallets";
    if (c === "wood works" || c === "woodworks") return "Wood Works";
    return cat || "Tumblers";
  }

  function safeUrl(path){
    // encode spaces safely for folders if any still exist
    return encodeURI(path);
  }

  let data;
  try{
    const res = await fetch("content/gallery/gallery.json", { cache: "no-store" });
    data = await res.json();
  } catch (e){
    grid.innerHTML = `<div class="muted">Could not load gallery.json</div>`;
    return;
  }

  const items = Array.isArray(data?.items) ? data.items : [];

  // Featured: first item or any marked featured:true
  const featured = items.find(x => x.featured) || items[0];
  if (featuredImg && featured?.file){
    featuredImg.src = safeUrl(featured.file);
    featuredImg.alt = featured.title || "Featured item";
  }

  // Build filter chips
  let active = "All";
  function renderChips(){
    filters.innerHTML = "";
    CATS.forEach(cat => {
      const b = document.createElement("button");
      b.className = "chip" + (cat === active ? " active" : "");
      b.type = "button";
      b.textContent = cat;
      b.addEventListener("click", () => {
        active = cat;
        renderChips();
        renderGrid();
      });
      filters.appendChild(b);
    });
  }

  function renderGrid(){
    grid.innerHTML = "";
    const filtered = items
      .map(x => ({...x, category: normCat(x.category)}))
      .filter(x => active === "All" ? true : x.category === active);

    filtered.forEach(it => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gitem";

      const thumb = document.createElement("div");
      thumb.className = "gthumb";

      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = safeUrl(it.file);
      img.alt = it.title || it.category || "Gallery item";

      // if broken, show nothing instead of ugly broken icon
      img.onerror = () => {
        img.remove();
        thumb.innerHTML = `<div class="muted" style="padding:12px;">Missing image<br><span style="font-size:12px;opacity:.7;">${it.file}</span></div>`;
      };

      thumb.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "gmeta";

      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "gtitle";
      title.textContent = it.title || it.category;
      left.appendChild(title);

      const right = document.createElement("div");
      right.className = "gcat";
      right.textContent = it.category;

      meta.appendChild(left);
      meta.appendChild(right);

      card.appendChild(thumb);
      card.appendChild(meta);

      card.addEventListener("click", () => {
        window.__openLightbox?.(safeUrl(it.file), it.title || "", `${it.title || ""}  •  ${it.category}`);
      });

      grid.appendChild(card);
    });

    if (filtered.length === 0){
      grid.innerHTML = `<div class="muted">No photos in this category yet.</div>`;
    }
  }

  renderChips();
  renderGrid();
})();
