/* ============================
   BASIC
============================ */

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

/* Netlify form submit — show thank you message on same page */
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

/* ============================
   LIGHTBOX
============================ */
(() => {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbClose = document.getElementById("lightboxClose");
  if (!lb || !lbImg || !lbClose) return;

  function openLightbox(src, alt = "") {
    lbImg.src = src;
    lbImg.alt = alt;
    lb.classList.add("show");
    lb.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lb.classList.remove("show");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
  }

  // Delegate clicks for dynamically created gallery items
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".gimg");
    if (!btn) return;
    const src = btn.getAttribute("data-full");
    const img = btn.querySelector("img");
    if (src) openLightbox(src, img?.alt || "Gallery image");
  });

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
})();

/* ============================
   AUTO-LOADING GALLERY FROM GITHUB
============================ */
(() => {
  // ✅ CHANGE THESE IF YOUR GITHUB IS DIFFERENT
  const GITHUB_OWNER = "CliffsCCC";
  const GITHUB_REPO  = "cliffs-custom-creations";
  const BRANCH       = "main";

  // These must match folder names in your repo EXACTLY
  const FOLDERS = [
    { key: "tumblers", path: "assets/Tumblers", mountId: "gallery-tumblers", titlePrefix: "Tumbler" },
    { key: "coasters", path: "assets/Coasters", mountId: "gallery-coasters", titlePrefix: "Coaster" },
  ];

  const allowedExt = /\.(png|jpe?g|webp|gif)$/i;

  function niceTitle(filename, prefix = "") {
    const base = filename.replace(/\.[^/.]+$/, "");
    const clean = base
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return prefix ? `${prefix}: ${clean}` : clean;
  }

  async function listRepoFolder(folderPath) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${folderPath}?ref=${BRANCH}`;
    const res = await fetch(url, { headers: { "Accept": "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GitHub load failed: ${folderPath} (${res.status})`);

    const data = await res.json();
    return (Array.isArray(data) ? data : [])
      .filter(item => item.type === "file" && allowedExt.test(item.name))
      .map(item => item.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }

  function renderGrid(mount, folderPath, fileNames, titlePrefix) {
    if (!mount) return;

    if (!fileNames.length) {
      mount.innerHTML = `<div class="muted">No images found in <b>${folderPath}</b>.</div>`;
      return;
    }

    // IMPORTANT: use RELATIVE paths (Netlify serves files from repo)
    const html = fileNames.map(name => {
      const rel = `${folderPath}/${name}`;
      const alt = niceTitle(name, "");
      const label = niceTitle(name, titlePrefix);

      return `
        <button class="gimg" data-full="${rel}" aria-label="${label}">
          <img src="${rel}" alt="${alt}" loading="lazy" />
        </button>
      `;
    }).join("");

    mount.innerHTML = html;
  }

  async function loadAll() {
    for (const f of FOLDERS) {
      const mount = document.getElementById(f.mountId);
      try {
        const names = await listRepoFolder(f.path);
        renderGrid(mount, f.path, names, f.titlePrefix);
      } catch (err) {
        console.error(err);
        if (mount) {
          mount.innerHTML = `
            <div class="muted">
              Could not load <b>${f.path}</b> from GitHub.<br/>
              Make sure the folder exists in the repo and repo is public.
            </div>
          `;
        }
      }
    }
  }

  // Tabs
  function setupTabs() {
    const tabs = document.querySelectorAll(".tab");
    const panelTumblers = document.getElementById("panel-tumblers");
    const panelCoasters = document.getElementById("panel-coasters");
    if (!tabs.length || !panelTumblers || !panelCoasters) return;

    tabs.forEach(t => {
      t.addEventListener("click", () => {
        tabs.forEach(x => x.classList.remove("active"));
        t.classList.add("active");

        const tab = t.getAttribute("data-tab");
        panelTumblers.classList.toggle("show", tab === "tumblers");
        panelCoasters.classList.toggle("show", tab === "coasters");
      });
    });
  }

  setupTabs();
  loadAll();
})();
