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

/* Lightbox for gallery */
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

  document.querySelectorAll(".gimg").forEach(btn => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-full");
      const img = btn.querySelector("img");
      openLightbox(src, img?.alt || "Gallery image");
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
})();

/* Netlify form submit — show thank you message on same page */
(() => {
  const form = document.getElementById("orderForm");
  const thanks = document.getElementById("thanks");
  if (!form || !thanks) return;

  form.addEventListener("submit", () => {
    // Netlify still submits normally, but we show the message
    setTimeout(() => {
      thanks.hidden = false;
      thanks.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 500);
  });
})();
