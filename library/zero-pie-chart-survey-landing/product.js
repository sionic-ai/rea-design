(() => {
  const { reduce } = window.akSite;
  // Original mineLoader: target % rises as images load, and the bar follows 1% every 5ms. At 100% the html gets a done mark → the curtain lifts in 1s and is removed 1s later.
  // The copy has placeholders instead of images so there is no download time, the target % rises evenly over 1.4s (close to the time the original took to download the first section image)
  const loader = document.getElementById("akLoader");
  if (loader) {
    const bar = loader.firstElementChild;
    let shown = 0, t0 = 0;
    const done = () => { document.documentElement.classList.add("is-load-complete"); scrollTo(0, 0); startAnim(); setTimeout(() => { loader.style.display = "none"; }, 1000); };
    if (reduce) { loader.style.display = "none"; queueMicrotask(() => startAnim()); }
    else {
      // The original preload waits for images after the window load, so the copy also counts from load
      const go = () => { t0 = performance.now(); const timer = setInterval(() => {
        const target = Math.min(100, Math.ceil((performance.now() - t0) / 14));
        if (shown >= 100) { clearInterval(timer); done(); return; }
        if (shown < target) { shown++; bar.style.width = shown + "%"; }
      }, 5); };
      if (document.readyState === "complete") go(); else addEventListener("load", go);
    }
  }
  // Original ScrollAnim: puts is-animate (hidden) on [data-anim], and once scroll position passes (element top − viewport/1.3) it becomes is-animated
  // The original builds ScrollAnim at the moment the curtain lifts (loadComplete)
  const items = [...document.querySelectorAll("[data-anim]")];
  const check = () => {
    const top = scrollY;
    items.forEach((el) => {
      if (el.classList.contains("is-animated")) return;
      const y = el.getBoundingClientRect().top + scrollY;
      if (reduce || top > y - innerHeight / 1.3) el.classList.add("is-animated");
    });
  };
  const startAnim = () => {
    items.forEach((el) => el.classList.add("is-animate", "is-" + el.dataset.anim));
    requestAnimationFrame(check);
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
  };

  // Section move button — 400ms ease-in-out
  document.querySelectorAll('.ak-pv__anchors a[href^="#"], .ak-totop').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id.length > 1 ? document.querySelector(id) : document.body;
    if (!t) return;
    e.preventDefault();
    const y = id.length > 1 ? t.getBoundingClientRect().top + scrollY : 0;
    if (reduce || !window.ScrollToPlugin) { scrollTo(0, y); return; }
    gsap.to(window, { scrollTo: y, duration: 0.4, ease: "power1.inOut" });
  }));

  // TOP button appears once the Hero has scrolled past
  const top = document.querySelector(".ak-totop");
  const showTop = () => top?.classList.toggle("is-show", scrollY > 300);
  showTop();
  addEventListener("scroll", showTop, { passive: true });

  // Phone header — the three-line button unfolds the menu row
  const head = document.querySelector(".ak-ph2"), tog = head?.querySelector(".ak-ph2__toggle");
  tog?.addEventListener("click", () => {
    const on = !head.classList.contains("is-menuopen");
    head.classList.toggle("is-menuopen", on);
    tog.setAttribute("aria-expanded", on);
  });
})();
