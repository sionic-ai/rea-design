// Per-page start and teardown — swup does not run the new page’s script, so every page’s part lives in this one file, picked by data-page
(() => {
  const pages = (window.jlPages = window.jlPages || {});
  const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
  const ended = (el, ms) => new Promise((res) => {
    let done = false;
    const fin = () => { if (!done) { done = true; res(); } };
    el.addEventListener("transitionend", function on(e) { if (e.target === el) { el.removeEventListener("transitionend", on); fin(); } });
    setTimeout(fin, ms);
  });

  // Hero photo crossfade — original: every 7s the next photo covers the previous one over 1.5s, and the visible photo scales 1 → 1.1 over 8.5s. Pauses when off screen
  const cover = (box) => {
    const items = [...box.querySelectorAll(".jl-mv__item")];
    if (!items.length) return () => {};
    box.style.setProperty("--mv-cover-fade-duration", "1500ms");
    box.style.setProperty("--mv-cover-current-duration", "8500ms");
    let i = 0, timer = 0, on = false;
    const run = () => {
      const cur = items[i], n = (i + 1) % items.length, next = items[n];
      cur.classList.add("is-current");
      timer = setTimeout(() => {
        next.classList.add("is-next");
        ended(next, 1600).then(() => {
          next.classList.remove("is-next");
          cur.classList.remove("is-current");
          if (on) run();
        });
      }, 7000);
      i = n;
    };
    const start = () => { if (on) return; on = true; run(); };
    const stop = () => { on = false; clearTimeout(timer); items.forEach((it) => it.classList.remove("is-current", "is-next")); };
    if (items.length === 1) { items[0].classList.add("is-current"); return () => stop(); }
    items[0].classList.add("is-current");
    const st = ScrollTrigger.create({ trigger: box.parentElement, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? start() : stop()) });
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", vis);
    return () => { st.kill(); stop(); document.removeEventListener("visibilitychange", vis); };
  };

  pages.top = {
    init(main, { reduce }) {
      const offs = [];
      const header = document.querySelector(".jl-header"), menu = document.querySelector(".jl-menu");
      const chrome = [header, menu].filter(Boolean);
      // Header row and menu button come down in 1s when the Work section header reaches the top of the screen, and go back up when scrolling back
      chrome.forEach((el) => el.classList.add("is-hidden-top"));
      const biz = main.querySelector(".jl-business");
      if (biz) {
        const st = ScrollTrigger.create({
          trigger: biz, start: "top 0%",
          onEnter: () => chrome.forEach((el) => { el.classList.add("is-animating"); el.classList.remove("is-hidden-top"); }),
          onLeaveBack: () => chrome.forEach((el) => { el.classList.add("is-hidden-top"); ended(el, 1100).then(() => el.classList.remove("is-animating")); }),
        });
        offs.push(() => st.kill());
      }
      // While the creed text passes 75 → 25% of the screen, the photo curtain darkens from .25 → .5
      const box = main.querySelector("[data-cover]");
      const philo = main.querySelector(".jl-philosophy");
      if (box && philo) {
        const st = ScrollTrigger.create({ trigger: philo, start: "top 75%", end: "top 25%", onUpdate: (s) => box.style.setProperty("--cover-filter", String(Math.round(s.progress * 1e4) / 1e4)) });
        offs.push(() => { st.kill(); box.style.removeProperty("--cover-filter"); });
      }
      // Final photo section — stays attached while the next photo rises from below, clipped (scrub 0, curve power1.out, one section long)
      const photos = [...main.querySelectorAll(".jl-photo__item")];
      if (photos.length > 1 && !reduce) {
        const tl = gsap.timeline({ defaults: { duration: 1, ease: "power1.out" }, scrollTrigger: { trigger: main.querySelector(".jl-photo"), start: "top top", end: "bottom bottom", scrub: 0 } });
        photos.forEach((p, k) => { if (k) tl.from(p, { clipPath: "inset(100% 0 0 0)" }); });
        offs.push(() => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(photos, { clearProps: "clipPath" }); });
      }
      // Loading — only on the first page opened (when arriving via navigation, the curtain already covers the screen)
      const loading = main.querySelector("[data-loading]");
      let stopCover = () => {};
      const startCover = () => { if (box) stopCover = cover(box); };
      const first = !window.jlBooted;
      window.jlBooted = true;
      if (loading && first && !reduce) {
        document.body.classList.add("is-loading");
        window.jlLenis?.stop();
        (async () => {
          await sleep(0.5);
          loading.classList.add("is-line", "is-text");
          await ended(loading.querySelector(".jl-loading__txt strong"), 2500);
          await sleep(0.3);
          loading.classList.add("is-end");
          loading.classList.remove("is-text");
          startCover();
          await ended(loading, 2400);
          loading.classList.remove("is-end");
          loading.classList.add("is-hide");
          document.body.classList.remove("is-loading");
          window.jlLenis?.start();
        })();
      } else {
        loading?.classList.add("is-hide");
        document.body.classList.remove("is-loading");
        startCover();
      }
      offs.push(() => stopCover());
      this.off = () => {
        offs.forEach((f) => f());
        chrome.forEach((el) => el.classList.remove("is-hidden-top", "is-animating"));
        document.body.classList.remove("is-loading");
      };
    },
    destroy() { this.off?.(); },
  };

  // News list — a category button keeps only that category (the original swaps a swup fragment so only the list changes)
  pages.news = {
    init(main) {
      const tabs = [...main.querySelectorAll("[data-cat]")];
      const rows = [...main.querySelectorAll("[data-cat-of]")];
      const pick = (e) => {
        const c = e.currentTarget.dataset.cat;
        tabs.forEach((t) => t.classList.toggle("is-current", t === e.currentTarget));
        rows.forEach((r) => { r.hidden = c !== "all" && r.dataset.catOf !== c; });
        ScrollTrigger.refresh();
      };
      tabs.forEach((t) => t.addEventListener("click", pick));
      this.off = () => tabs.forEach((t) => t.removeEventListener("click", pick));
    },
    destroy() { this.off?.(); },
  };
})();
