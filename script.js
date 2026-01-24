/* Year */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* Best Seller buttons scroll to email form and prefill item */
const itemField = document.getElementById("itemField");
document.querySelectorAll("[data-scroll-contact]").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.getAttribute("data-item") || "";
    if (itemField) itemField.value = item;
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  });
});

/* Lightbox */
(() => {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbClose = document.getElementById("lightboxClose");
  const lbCap = document.getElementById("lightboxCap");
  if (!lb || !lbImg || !lbClose) return;

  function openLightbox(src, cap=""){
    lbImg.src = src;
    lb.classList.add("show");
    lb.setAttribute("aria-hidden", "false");
    if (lbCap) lbCap.textContent = cap;
  }
  function closeLightbox(){
    lb.classList.remove("show");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
    if (lbCap) lbCap.textContent = "";
  }

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  // expose for gallery clicks
  window.__openCCC = openLightbox;
})();

/* Netlify form submit — show thank you message */
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

/* Gallery loader (reads content/gallery/gallery.json) */
async function loadGallery(){
  const grid = document.getElementById("galleryGrid");
  const hero = document.getElementById("heroPreview");
  if (!grid) return;

  try{
    const res = await fetch("content/gallery/gallery.json", { cache: "no-store" });
    if (!res.ok) throw new Error("gallery.json not found");
    const data = await res.json();

    // data = [{ category, file, title }]
    // Build UI
    window.__CCC_ITEMS = Array.isArray(data) ? data : [];

    renderGallery("all");

    // Put a hero image if first exists
    const first = window.__CCC_ITEMS[0];
    if (hero && first){
      hero.innerHTML = `<img src="${first.file}" alt="${first.title || "Featured"}">`;
    }
  }catch(err){
    grid.innerHTML = `<div class="muted">Gallery list missing. Add <b>content/gallery/gallery.json</b> and commit/push.</div>`;
    console.warn(err);
  }
}

function renderGallery(filter){
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const items = (window.__CCC_ITEMS || []).filter(it => {
    if (filter === "all") return true;
    return (it.category || "") === filter;
  });

  if (!items.length){
    grid.innerHTML = `<div class="muted">No images found for this category yet.</div>`;
    return;
  }

  grid.innerHTML = items.map((it, idx) => {
    const title = it.title || it.file.split("/").pop();
    const cat = it.category || "Gallery";
    return `
      <div class="gitem" data-src="${it.file}" data-cap="${cat} • ${title}">
        <div class="gthumb"><img src="${it.file}" alt="${title}" loading="lazy"></div>
        <div class="gmeta">
          <div class="gtitle">${title}</div>
          <div class="gcat">${cat}</div>
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".gitem").forEach(el => {
    el.addEventListener("click", () => {
      const src = el.getAttribute("data-src");
      const cap = el.getAttribute("data-cap") || "";
      window.__openCCC?.(src, cap);
    });
  });
}

/* Filter chips */
document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter") || "all";
    renderGallery(filter);
  });
});

loadGallery();
