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
  if (!lb || !lbImg || !lbClose) return;

  function openLightbox(src, alt=""){
    lbImg.src = src;
    lbImg.alt = alt;
    lb.classList.add("show");
    lb.setAttribute("aria-hidden", "false");
  }
  function closeLightbox(){
    lb.classList.remove("show");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
  }

  window.__openLightbox = openLightbox;

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
})();

/* Gallery loader */
const grid = document.getElementById("galleryGrid");
const empty = document.getElementById("galleryEmpty");
const filters = document.getElementById("filters");
const featuredImg = document.getElementById("featuredImg");
const featuredTitle = document.getElementById("featuredTitle");
const featuredCat = document.getElementById("featuredCat");
const featuredCard = document.getElementById("featuredCard");

let ITEMS = [];
let ACTIVE = "all";

function normalizePath(p){
  // ensure no leading slash differences
  return (p || "").replace(/^\/+/, "");
}

function card(item){
  const btn = document.createElement("button");
  btn.className = "gitem gimg";
  btn.type = "button";
  btn.dataset.category = item.category;
  btn.dataset.full = normalizePath(item.src);

  btn.innerHTML = `
    <img loading="lazy" src="${normalizePath(item.src)}" alt="${item.title}">
    <div class="gmeta">
      <div class="gtitle">${item.title}</div>
      <div class="gcat">${item.category}</div>
    </div>
  `;

  btn.addEventListener("click", () => {
    window.__openLightbox?.(normalizePath(item.src), item.title);
  });

  // helpful debug if path wrong
  btn.querySelector("img").addEventListener("error", () => {
    btn.querySelector("img").alt = `Missing image: ${normalizePath(item.src)}`;
  });

  return btn;
}

function render(){
  if (!grid) return;
  grid.innerHTML = "";

  const show = (ACTIVE === "all")
    ? ITEMS
    : ITEMS.filter(x => x.category === ACTIVE);

  if (!show.length){
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  show.forEach(i => grid.appendChild(card(i)));
}

function setActiveChip(value){
  ACTIVE = value;
  document.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("active", c.dataset.filter === value);
  });
  render();
}

async function loadGallery(){
  try{
    const res = await fetch("content/gallery/gallery.json", { cache: "no-store" });
    if (!res.ok) throw new Error("gallery.json not found");
    const data = await res.json();

    // Expect: [{title,category,src}]
    ITEMS = Array.isArray(data) ? data.map(x => ({
      title: x.title || "Untitled",
      category: (x.category || "other").toLowerCase(),
      src: normalizePath(x.src || "")
    })).filter(x => x.src) : [];

    // Featured
    if (ITEMS.length && featuredImg){
      const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      featuredImg.src = pick.src;
      featuredTitle.textContent = pick.title;
      featuredCat.textContent = pick.category;
      if (featuredCard){
        featuredCard.dataset.full = pick.src;
        featuredCard.addEventListener("click", () => {
          window.__openLightbox?.(pick.src, pick.title);
        });
      }
      featuredImg.addEventListener("error", () => {
        featuredTitle.textContent = "Featured image missing";
        featuredCat.textContent = pick.src;
      });
    }

    render();
  }catch(err){
    console.error(err);
    if (empty) empty.hidden = false;
  }
}

if (filters){
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    setActiveChip(btn.dataset.filter);
  });
}

loadGallery();

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

// =============================
// GALLERY LOADER (FINAL VERSION)
// =============================
fetch("/content/gallery/gallery.json")
  .then(res => {
    if (!res.ok) throw new Error("Gallery JSON not found");
    return res.json();
  })
  .then(items => {
    const grid = document.getElementById("galleryGrid");
    if (!grid) {
      console.warn("galleryGrid not found in HTML");
      return;
    }

    grid.innerHTML = "";

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "gallery-card";

      card.innerHTML = `
        <img src="${item.src}" alt="${item.title}" loading="lazy">
        <div class="caption">
          <strong>${item.title}</strong>
          <span>${item.category}</span>
        </div>
      `;

      grid.appendChild(card);
    });
  })
  .catch(err => console.error("Gallery load error:", err));

