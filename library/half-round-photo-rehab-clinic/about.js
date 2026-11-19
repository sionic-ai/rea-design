// Facility intro — side nav sticking (same StickySidebar 3.3.1 as the original, header height + 26 + 60 top gap), current section indicator, inner links scroll .4s ease-in-out (original velocity), facility photo Swiper 8.4.7
(() => {
  const side = document.querySelector(".rr-side");
  const wide = matchMedia("(min-width: 768px)");
  let sticky = null;
  const setSticky = () => {
    if (!window.StickySidebar || !side) return;
    if (wide.matches && !sticky) sticky = new StickySidebar(side, { containerSelector: ".rr-contents", innerWrapperSelector: ".rr-side__nav", topSpacing: 100 + 26 + 60 });
    else if (!wide.matches && sticky) { sticky.destroy(); sticky = null; }
  };
  setSticky();
  wide.addEventListener("change", setSticky);

  const links = [...document.querySelectorAll(".rr-side__nav a")];
  const boxes = links.map((a) => document.querySelector(a.getAttribute("href")));
  const mark = () => {
    const y = innerHeight * 0.4;
    let cur = 0;
    boxes.forEach((b, i) => { if (b && b.getBoundingClientRect().top < y) cur = i; });
    links.forEach((a, i) => a.classList.toggle("is-current", i === cur));
  };
  addEventListener("scroll", mark, { passive: true });
  mark();

  // Original JsScroll: 400ms ease-in-out, stops at header height + 26px above the target
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  links.forEach((a) => a.addEventListener("click", (e) => {
    const box = document.querySelector(a.getAttribute("href"));
    if (!box) return;
    e.preventDefault();
    const from = scrollY, to = box.getBoundingClientRect().top + scrollY - 126, t0 = performance.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return scrollTo(0, to);
    const step = (now) => { const p = Math.min(1, (now - t0) / 400); scrollTo(0, from + (to - from) * ease(p)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }));

  if (window.Swiper) {
    new Swiper(".rr-fac", {
      loop: false, speed: 600, slidesPerView: "auto", spaceBetween: 20,
      navigation: { nextEl: ".rr-fac__next", prevEl: ".rr-fac__prev" },
      pagination: { el: ".rr-fac__bar .swiper-scrollbar", type: "progressbar" },
      breakpoints: { 768: { spaceBetween: "2%" } },
    });
  }
})();
// Directions-from-the-entrance window — open it with the button, close it by pressing close or the curtain
(() => {
  const dlg = document.getElementById("direction");
  if (!dlg) return;
  const set = (open) => { dlg.classList.toggle("is-show", open); dlg.setAttribute("aria-hidden", String(!open)); };
  document.querySelectorAll("[data-open-direction]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); set(true); }));
  dlg.querySelector(".rr-dir__close").addEventListener("click", () => set(false));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();

// Car route collapsible — pressing the pill opens and closes the detail steps height in .3s (original AboutRoute)
(() => {
  document.querySelectorAll(".rr-route__acc").forEach((acc) => {
    const pill = acc.querySelector(".rr-route__pill.is-acc"), sub = acc.querySelector(".rr-route__sub");
    const fit = () => { sub.style.height = acc.classList.contains("is-show") ? sub.scrollHeight + "px" : "0px"; };
    const toggle = () => { acc.classList.toggle("is-show"); pill.setAttribute("aria-expanded", String(acc.classList.contains("is-show"))); fit(); };
    pill.addEventListener("click", toggle);
    pill.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    addEventListener("resize", fit);
  });
})();
