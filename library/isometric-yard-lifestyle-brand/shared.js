// Shared by all pages — hand-drawn bundle, loading veil lift, scroll indicator (wordmark shrinking), mega menu · drawer · accordion, section entrance (is-inview), back to top
(() => {
  const SPRITE = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"n-sprite\" aria-hidden=\"true\" focusable=\"false\"><symbol id=\"n-pa\" viewBox=\"0 0 40 80\"><path class=\"c-leaf\" d=\"M13 48l-1 26h7l1-16 1 16h7l-1-26z\"/><path class=\"c-ink\" d=\"M11 74h8v4h-9zM21 74h8l1 4h-9z\"/><path class=\"c-sky\" d=\"M11 26q9-6 18 0l2 24H9z\"/><path class=\"c-none\" d=\"M11 29L6 44l4 2M29 29l5 15-4 2\"/><circle class=\"c-skin\" cx=\"20\" cy=\"14\" r=\"8.5\"/><path class=\"c-ink\" d=\"M11.5 13q0-9 8.5-9t8.5 9q-4-4-9-3t-8 3z\"/><circle class=\"c-ink\" cx=\"17.5\" cy=\"15\" r=\"1\"/><circle class=\"c-ink\" cx=\"22.5\" cy=\"15\" r=\"1\"/></symbol><symbol id=\"n-pb\" viewBox=\"0 0 40 80\"><path class=\"c-ink2\" d=\"M13 48l-1 26h7l1-16 1 16h7l-1-26z\"/><path class=\"c-ink\" d=\"M11 74h8v4h-9zM21 74h8l1 4h-9z\"/><path class=\"c-paper\" d=\"M11 26q9-6 18 0l2 24H9z\"/><path class=\"c-none\" d=\"M11 29L6 44l4 2M29 29l5 15-4 2\"/><circle class=\"c-skin\" cx=\"20\" cy=\"14\" r=\"8.5\"/><path class=\"c-hair\" d=\"M11 20q-2-16 9-16t9 16q-3-8-9-10-6 2-9 10z\"/><circle class=\"c-ink\" cx=\"17.5\" cy=\"15\" r=\"1\"/><circle class=\"c-ink\" cx=\"22.5\" cy=\"15\" r=\"1\"/></symbol><symbol id=\"n-pc\" viewBox=\"0 0 40 80\"><path class=\"c-sky\" d=\"M13 48l-1 26h7l1-16 1 16h7l-1-26z\"/><path class=\"c-ink\" d=\"M11 74h8v4h-9zM21 74h8l1 4h-9z\"/><path class=\"c-red\" d=\"M11 26q9-6 18 0l2 24H9z\"/><path class=\"c-none\" d=\"M11 29L6 44l4 2M29 29l5 15-4 2\"/><circle class=\"c-skin\" cx=\"20\" cy=\"14\" r=\"8.5\"/><path class=\"c-ink\" d=\"M11.5 13q0-9 8.5-9t8.5 9q-4-4-9-3t-8 3z\"/><path class=\"c-lime\" d=\"M11 9q2-7 9-7t9 7zM28 8l7 1-6 1\"/><circle class=\"c-ink\" cx=\"17.5\" cy=\"15\" r=\"1\"/><circle class=\"c-ink\" cx=\"22.5\" cy=\"15\" r=\"1\"/></symbol><symbol id=\"n-pd\" viewBox=\"0 0 40 80\"><path class=\"c-wood\" d=\"M13 48l-1 26h7l1-16 1 16h7l-1-26z\"/><path class=\"c-ink\" d=\"M11 74h8v4h-9zM21 74h8l1 4h-9z\"/><path class=\"c-leaf\" d=\"M11 26q9-6 18 0l2 24H9z\"/><path class=\"c-none\" d=\"M11 29L6 44l4 2M29 29l5 15-4 2\"/><circle class=\"c-skin\" cx=\"20\" cy=\"14\" r=\"8.5\"/><path class=\"c-ink\" d=\"M11.5 13q0-9 8.5-9t8.5 9q-4-4-9-3t-8 3z\"/><circle class=\"c-ink\" cx=\"17.5\" cy=\"15\" r=\"1\"/><circle class=\"c-ink\" cx=\"22.5\" cy=\"15\" r=\"1\"/></symbol><symbol id=\"n-sa\" viewBox=\"0 0 40 80\"><path class=\"c-sky\" d=\"M12 48h18l10 6v18h-7V60H12z\"/><path class=\"c-ink\" d=\"M33 72h8v4h-9zM12 50h-2v6h2z\"/><path class=\"c-paper\" d=\"M11 26q9-6 18 0l2 24H9z\"/><path class=\"c-none\" d=\"M11 29L6 44l4 2M29 29l5 15-4 2\"/><circle class=\"c-skin\" cx=\"20\" cy=\"14\" r=\"8.5\"/><path class=\"c-ink\" d=\"M11.5 13q0-9 8.5-9t8.5 9q-4-4-9-3t-8 3z\"/><circle class=\"c-ink\" cx=\"17.5\" cy=\"15\" r=\"1\"/><circle class=\"c-ink\" cx=\"22.5\" cy=\"15\" r=\"1\"/></symbol><symbol id=\"n-sb\" viewBox=\"0 0 40 80\"><path class=\"c-ink2\" d=\"M12 48h18l10 6v18h-7V60H12z\"/><path class=\"c-ink\" d=\"M33 72h8v4h-9zM12 50h-2v6h2z\"/><path class=\"c-red\" d=\"M11 26q9-6 18 0l2 24H9z\"/><path class=\"c-none\" d=\"M11 29L6 44l4 2M29 29l5 15-4 2\"/><circle class=\"c-skin\" cx=\"20\" cy=\"14\" r=\"8.5\"/><path class=\"c-hair\" d=\"M11 20q-2-16 9-16t9 16q-3-8-9-10-6 2-9 10z\"/><circle class=\"c-ink\" cx=\"17.5\" cy=\"15\" r=\"1\"/><circle class=\"c-ink\" cx=\"22.5\" cy=\"15\" r=\"1\"/></symbol><symbol id=\"n-plant\" viewBox=\"0 0 40 60\"><path class=\"c-ink2\" d=\"M10 38h20l-3 20H13z\"/><path class=\"c-leaf\" d=\"M20 40Q2 34 4 14q12 6 16 26zM20 40q18-6 16-26-12 6-16 26zM20 38Q14 16 20 2q6 14 0 36z\"/></symbol><symbol id=\"n-palm\" viewBox=\"0 0 50 80\"><path class=\"c-paper\" d=\"M14 60h22v18H14z\"/><path class=\"c-none\" d=\"M25 60V24\"/><path class=\"c-leaf\" d=\"M25 26Q6 18 2 30q10-12 23-4zM25 26q19-8 23 4-10-12-23-4zM25 24Q14 6 4 8q14 0 21 16zM25 24q11-18 21-16-14 0-21 16zM25 24q-2-18 6-22-4 10-6 22z\"/></symbol><symbol id=\"n-chair\" viewBox=\"0 0 50 50\"><path class=\"c-wood\" d=\"M10 4h16l-4 26H8zM8 30h30l4 6H6zM34 22h12l-2 8H32z\"/><path class=\"c-none\" d=\"M10 36l-2 12M38 36l2 12M24 36v10\"/></symbol><symbol id=\"n-table\" viewBox=\"0 0 80 50\"><path class=\"c-wood\" d=\"M40 4l36 14-36 14L4 18z\"/><path class=\"c-none\" d=\"M12 22v20M68 22v20M40 32v16\"/><circle class=\"c-red\" cx=\"34\" cy=\"16\" r=\"5\"/><circle class=\"c-lime\" cx=\"48\" cy=\"18\" r=\"4\"/><path class=\"c-paper\" d=\"M24 16h6v4h-6zM52 12h6v4h-6z\"/></symbol><symbol id=\"n-tent\" viewBox=\"0 0 80 80\"><path class=\"c-paper\" d=\"M40 6L8 74h64z\"/><path class=\"c-none\" d=\"M40 6L32 74M40 6l8 68M40 6l-6-6M40 6l6-6\"/><path class=\"c-sky\" d=\"M40 40l-8 34h16z\"/></symbol><symbol id=\"n-rug\" viewBox=\"0 0 120 70\"><path class=\"c-paper\" d=\"M60 2l58 22-58 44L2 46z\"/><path class=\"c-lime\" d=\"M48 6.6l58 22-6 4.6-58-22zM30 13.4l58 22-6 4.6-58-22zM14 22l58 22-6 4.6-58-22zM6 34l58 22-6 4.6-56-21.2z\"/></symbol><symbol id=\"n-hammock\" viewBox=\"0 0 90 70\"><path class=\"c-none\" d=\"M6 68L18 8M84 68L72 8M18 8h54\"/><path class=\"c-paper\" d=\"M18 14q27 40 54 0z\"/></symbol><symbol id=\"n-car\" viewBox=\"0 0 160 90\"><path class=\"c-wood\" d=\"M10 40l14-26h80l26 26h20v30H6V40z\"/><path class=\"c-paper\" d=\"M30 18h30v20H20zM66 18h34l20 20H66z\"/><path class=\"c-ink2\" d=\"M4 64h152v8H4z\"/><circle class=\"c-ink\" cx=\"40\" cy=\"74\" r=\"14\"/><circle class=\"c-paper\" cx=\"40\" cy=\"74\" r=\"6\"/><circle class=\"c-ink\" cx=\"122\" cy=\"74\" r=\"14\"/><circle class=\"c-paper\" cx=\"122\" cy=\"74\" r=\"6\"/><path class=\"c-paper\" d=\"M140 46h12v8h-12z\"/></symbol><symbol id=\"n-bike\" viewBox=\"0 0 70 46\"><circle class=\"c-none\" cx=\"14\" cy=\"32\" r=\"12\"/><circle class=\"c-none\" cx=\"56\" cy=\"32\" r=\"12\"/><path class=\"c-none\" d=\"M14 32l14-18h20l8 18M28 14l6 18 14-18M24 8h8M48 14l-2-6h6\"/></symbol><symbol id=\"n-skate\" viewBox=\"0 0 60 80\"><path class=\"c-ink2\" d=\"M6 72h46l-4 4H10z\"/><circle class=\"c-ink\" cx=\"14\" cy=\"78\" r=\"2\"/><circle class=\"c-ink\" cx=\"44\" cy=\"78\" r=\"2\"/><path class=\"c-sky\" d=\"M18 46l-6 24h7l6-16 6 16h7l-5-24z\"/><path class=\"c-paper\" d=\"M16 24q11-7 20 0l3 24H15z\"/><path class=\"c-none\" d=\"M16 28L4 30M36 28l14-6\"/><circle class=\"c-skin\" cx=\"26\" cy=\"13\" r=\"8.5\"/><path class=\"c-hair\" d=\"M17 14q-1-12 9-12t9 12q-4-6-9-6t-9 6z\"/></symbol><symbol id=\"n-cactus\" viewBox=\"0 0 30 60\"><path class=\"c-wood\" d=\"M6 46h18l-2 13H8z\"/><path class=\"c-leaf\" d=\"M11 46V10q4-8 8 0v36zM11 28H5V16q3-5 6 0zM19 22h6v-8q-3-5-6 0z\"/></symbol><symbol id=\"n-dog\" viewBox=\"0 0 44 30\"><path class=\"c-paper\" d=\"M8 12h22q6 0 6 6v4H6v-4q0-6 2-6z\"/><path class=\"c-none\" d=\"M10 22v7M16 22v7M28 22v7M33 22v7M8 13Q2 10 4 6\"/><circle class=\"c-paper\" cx=\"34\" cy=\"9\" r=\"7\"/><path class=\"c-wood\" d=\"M36 3q6-1 6 6l-4-2z\"/><circle class=\"c-ink\" cx=\"36\" cy=\"9\" r=\"1\"/></symbol><symbol id=\"n-planter\" viewBox=\"0 0 80 50\"><path class=\"c-paper\" d=\"M40 18l36 12-36 12L4 30z\"/><path class=\"c-paper\" d=\"M4 30v10l36 12V42zM76 30v10L40 52V42z\"/><path class=\"c-leaf\" d=\"M14 26q4-12 8 0 4-14 9 0 4-12 9 0 4-14 9 0 4-12 8 0 4-12 8 2z\"/></symbol><symbol id=\"n-cloud\" viewBox=\"0 0 120 50\"><path class=\"c-paper\" d=\"M14 46q-12 0-12-10t14-10q2-16 20-16 10-10 26-4 14-8 26 4 18-2 20 14 12 2 10 14 0 8-12 8z\"/></symbol><symbol id=\"n-lantern\" viewBox=\"0 0 20 60\"><path class=\"c-none\" d=\"M10 0v20M4 4h6\"/><path class=\"c-red\" d=\"M5 22h10l2 14q-7 6-14 0z\"/></symbol><symbol id=\"i-arrow\" viewBox=\"0 0 24 24\"><path d=\"M4 12h16M14 6l6 6-6 6\"/></symbol><symbol id=\"i-left\" viewBox=\"0 0 24 24\"><path d=\"M20 12H4M10 6l-6 6 6 6\"/></symbol><symbol id=\"i-up\" viewBox=\"0 0 22 27\"><path d=\"M11 25V3M3 11l8-8 8 8\"/></symbol><symbol id=\"i-down\" viewBox=\"0 0 24 24\"><path d=\"M5 9l7 7 7-7\"/></symbol><symbol id=\"i-user\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"8\" r=\"4.5\"/><path d=\"M3.5 21q1-7 8.5-7t8.5 7\"/></symbol><symbol id=\"i-cart\" viewBox=\"0 0 24 24\"><path d=\"M2 4h3l2.5 11h11L21 7H6.2M9 20.5a1 1 0 1 0 0-.01M17 20.5a1 1 0 1 0 0-.01\"/></symbol><symbol id=\"i-insta\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4.2\"/><circle cx=\"17.3\" cy=\"6.7\" r=\".6\"/></symbol><symbol id=\"i-pin\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9.5\"/><path d=\"M11 8.5c4-1.5 6.5 3 3 5.5-1.6 1.1-3.4.6-3.4.6L9.5 19\"/></symbol><symbol id=\"i-plus\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 7.5v9M7.5 12h9\"/></symbol></svg>";
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  // The original sets body.--loaded on the next tick after everything, including images, has loaded — the loading curtain lifts .32s after .48s and the Hero then stands up in order
  const loaded = () => setTimeout(() => document.body.classList.add("--loaded"), 0);
  if (document.readyState === "complete") loaded();
  else addEventListener("load", loaded, { once: true });

  // When the top cover (#page-start) leaves the screen html[data-scrolled=true] — the first page wordmark shrinks to 164px at .24s
  const start = document.getElementById("page-start");
  if (start) new IntersectionObserver((es) => es.forEach((e) => document.documentElement.setAttribute("data-scrolled", String(!e.isIntersecting)))).observe(start);

  const header = document.querySelector(".js-header");
  const megaBtns = [...document.querySelectorAll(".js-btn__mega-menu")];
  const menuBtn = document.querySelector(".n-menu-btn");
  const drawer = document.getElementById("drawer");
  const closeMega = () => {
    header?.classList.remove("--active");
    megaBtns.forEach((b) => { b.classList.remove("--active"); b.setAttribute("aria-expanded", "false"); document.getElementById(b.getAttribute("aria-controls"))?.classList.remove("--active"); });
  };
  const setDrawer = (open) => {
    menuBtn?.setAttribute("aria-expanded", String(open));
    header?.classList.toggle("--drawer-opened", open);
    drawer?.classList.toggle("--drawer-opened", open);
  };
  megaBtns.forEach((b) => b.addEventListener("click", () => {
    const block = document.getElementById(b.getAttribute("aria-controls"));
    const was = block?.classList.contains("--active");
    setDrawer(false);
    closeMega();
    if (!block || was) return;
    block.classList.add("--active");
    b.classList.add("--active");
    b.setAttribute("aria-expanded", "true");
    header?.classList.add("--active");
  }));
  document.querySelectorAll(".js-mega-menu__overlay").forEach((o) => o.addEventListener("click", closeMega));
  const toggleDrawer = () => { closeMega(); setDrawer(menuBtn.getAttribute("aria-expanded") !== "true"); };
  menuBtn?.addEventListener("click", toggleDrawer);
  menuBtn?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDrawer(); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMega(); setDrawer(false); } });
  document.querySelectorAll(".js-acc__trigger").forEach((t) => t.addEventListener("click", () => t.classList.toggle("--active")));

  // Section entrance — is-inview once the top edge crosses the 25% line from the screen bottom (original rootMargin 0 0 -25% 0)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-inview");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -25% 0px", threshold: 0 });
  document.querySelectorAll(".js-inview").forEach((el) => io.observe(el));

  // Back to top: 640ms, original curve (easeInOutQuad)
  const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  document.getElementById("js-pagetop")?.addEventListener("click", () => {
    const from = scrollY, t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / 640, 1);
      scrollTo(0, from * (1 - ease(p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();
