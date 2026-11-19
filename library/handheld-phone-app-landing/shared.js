// Frame interactions: setting phone panel height (if shim is above 0, screen-width panel, otherwise screen-height panel) · nav wordmark (white on black sections, hidden in footer) · FAQ open and close
(() => {
  const root = document.documentElement;
  const shim = document.querySelector(".hm-shim");
  const sizeShim = () => {
    const on = shim && shim.offsetHeight > 0;
    root.classList.toggle("shim-not-null", !!on);
    root.classList.toggle("shim-null", !on);
  };
  sizeShim();

  // Wordmark — turns white when its center is over the black section (care top edge ~ shop card top edge), and hides once past the footer top edge
  const logo = document.querySelector(".hm-nav__logo");
  const care = document.querySelector(".hm-care"), shopCard = document.querySelector(".hm-shop__content"), foot = document.querySelector(".hm-footer__top");
  let start = 0, end = 0, footTop = 0;
  const measure = () => {
    sizeShim();
    if (!logo || !care || !shopCard || !foot) return;
    const mid = logo.offsetHeight / 2 + logo.getBoundingClientRect().top, s = scrollY;
    start = care.getBoundingClientRect().top + s - mid;
    end = shopCard.getBoundingClientRect().top + s - mid;
    footTop = foot.getBoundingClientRect().top + s - mid;
  };
  const paint = () => {
    if (!logo) return;
    const s = scrollY;
    logo.classList.toggle("fx", s > start && s < end);
    logo.classList.toggle("hide", s > footTop && !(s > start && s < end));
  };
  let raf = 0;
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); }, { passive: true });
  addEventListener("resize", () => { measure(); paint(); });
  addEventListener("load", () => { measure(); paint(); });
  measure();
  paint();

  // FAQ — only the one clicked opens (clicking again closes), and any other open one closes
  const lis = [...document.querySelectorAll(".hm-faq__li")];
  let open = lis.findIndex((li) => li.classList.contains("on"));
  // Links inside an answer go to an outside page in the original, so they do not toggle the question
  lis.forEach((li, i) => li.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    if (i === open) li.classList.toggle("on");
    else { li.classList.add("on"); lis[open]?.classList.remove("on"); }
    open = i;
  }));
})();
