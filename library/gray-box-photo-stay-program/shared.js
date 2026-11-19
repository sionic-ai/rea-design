/* Motion shared by several sections — the original uses jQuery + Velocity + jquery.inview. The same values were moved to GSAP·IntersectionObserver.
   White curtain loader: on the first page it waits 1s then, delayed .4s, lifts over 2.4s easeInOutSine, on subpages it waits .4s then, delayed .4s, .8s.
   Menu: the panel rises in .4s easeOutCirc, and the items slide in from 20px to the left, staggered 75ms apart over 1.2s (UI pack default ease). On close, both fade out in .4s.
   Header: white text (over the photo) until scrolled down by one Hero height, ink color after that. As in the original, scroll is checked once every 500ms. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const circOut = "0.075,0.82,0.165,1";
  const cubicOut = "0.215,0.61,0.355,1";
  const sineInOut = "0.445,0.05,0.55,0.95";
  if (window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("lfCircOut", circOut);
    CustomEase.create("lfCubicOut", cubicOut);
    CustomEase.create("lfSineInOut", sineInOut);
    /* Velocity UI pack’s transition.* ignores the curve passed in and runs on the default ease (.25,.1,.25,1) — measuring the original menu items gives that curve */
    CustomEase.create("lfUiEase", "0.25,0.1,0.25,1");
  }
  const ease = (name, fallback) => (window.CustomEase ? name : fallback);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  const header = document.querySelector(".lf-header");
  const nav = document.querySelector(".lf-nav");
  const pagetop = document.querySelector(".lf-pagetop");
  const isHome = document.body.classList.contains("is-home");
  const hasPhotoHead = !!document.querySelector("[data-photo-head]");

  /* Loader */
  const loading = document.querySelector(".lf-loading");
  if (loading) {
    if (reduce) loading.remove();
    else {
      const wait = isHome ? 1000 : 400;
      setTimeout(() => {
        gsap.to(loading, {
          autoAlpha: 0, duration: isHome ? 2.4 : 0.8, delay: 0.4, ease: ease("lfSineInOut", "sine.inOut"),
          onComplete: () => (loading.style.display = "none"),
        });
        document.dispatchEvent(new CustomEvent("lf:loaded"));
      }, wait);
    }
  }

  /* Header color — only for sections with a photo header. The original checks with $.throttle(500) */
  const over = () => {
    const onPhoto = hasPhotoHead && scrollY < innerHeight;
    const v = onPhoto ? "photo" : "page";
    if (header && header.dataset.over !== v) header.dataset.over = v;
    if (pagetop && pagetop.dataset.over !== v) pagetop.dataset.over = v;
  };
  over();
  let last = 0, timer = 0;
  addEventListener("scroll", () => {
    const now = Date.now();
    if (now - last >= 500) { last = now; over(); }
    else { clearTimeout(timer); timer = setTimeout(() => { last = Date.now(); over(); }, 500 - (now - last)); }
  }, { passive: true });
  addEventListener("resize", over);

  /* Menu Panel */
  const burger = document.querySelector(".lf-burger");
  const items = nav ? [...nav.querySelectorAll("[data-stagger]")] : [];
  /* Velocity only adds the velocity-animating marker the instant it is pressed, paints the exact start value (0%) on the next frame, then moves — in the same order */
  const busy = (els, on) => els.forEach((el) => el.classList.toggle("is-animating", on));
  let raf = 0;
  const open = () => {
    header.dataset.menu = "open";
    burger.querySelector("button").setAttribute("aria-expanded", "true");
    cancelAnimationFrame(raf);
    gsap.killTweensOf([nav, ...items]);
    if (reduce) { gsap.set(nav, { display: "flex", opacity: 1 }); gsap.set(items, { opacity: 1, x: 0 }); return; }
    busy([nav, ...items], true);
    raf = requestAnimationFrame(() => {
      gsap.fromTo(nav, { display: "flex", opacity: 0 }, { opacity: 1, duration: 0.4, ease: ease("lfCircOut", "circ.out"), onComplete: () => busy([nav], false) });
      /* Each item paints its start value (0%) on its own turn (75ms apart) and starts moving from the next frame, the same order as a stagger in an animation library */
      const tl = gsap.timeline({ onComplete: () => busy(items, false) });
      items.forEach((el, i) => {
        tl.set(el, { opacity: 0, x: -20 }, i * 0.075);
        tl.to(el, { opacity: 1, x: 0, duration: 1.2, ease: ease("lfUiEase", "power1.inOut") }, i * 0.075 + 1 / 60);
      });
    });
  };
  const close = () => {
    header.dataset.menu = "close";
    burger.querySelector("button").setAttribute("aria-expanded", "false");
    cancelAnimationFrame(raf);
    gsap.killTweensOf([nav, ...items]);
    if (reduce) { gsap.set(nav, { display: "none" }); return; }
    gsap.to(nav, { opacity: 0, duration: 0.4, ease: ease("lfCircOut", "circ.out"), onComplete: () => gsap.set(nav, { display: "none" }) });
    gsap.to(items, { opacity: 0, duration: 0.4, ease: ease("lfUiEase", "power1.inOut") });
  };
  if (burger && nav) burger.addEventListener("click", () => (header.dataset.menu === "open" ? close() : open()));

  /* Same-section navigation — original Velocity scroll 1.2s easeOutCubic */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#" || id === "" ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    if (header && header.dataset.menu === "open") close();
    const y = target === 0 ? 0 : target.getBoundingClientRect().top + scrollY;
    if (reduce || !window.ScrollToPlugin) scrollTo(0, y);
    else gsap.to(window, { scrollTo: y, duration: 1.2, ease: ease("lfCubicOut", "cubic.out") });
  });
  /* ?scroll=<id> When entered this way, goes to that section after .3s */
  const want = new URLSearchParams(location.search).get("scroll");
  if (want) {
    const t = document.getElementById(want);
    if (t) gsap.to(window, { scrollTo: t.getBoundingClientRect().top + scrollY, duration: reduce ? 0 : 1.2, delay: 0.3, ease: ease("lfCubicOut", "cubic.out") });
  }

  /* Once when visible — gray box expand · photo zoom fade · text fade (animation values in shared.css).
     The original jquery.inview checks the screen once every 250ms — to match even that lag, it is read on the same tempo */
  let pending = [...document.querySelectorAll("[data-inview]")];
  if (reduce) pending.forEach((el) => el.classList.add("is-in"));
  else {
    const check = () => {
      const h = innerHeight, w = innerWidth;
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect();
        const seen = r.bottom > 0 && r.top < h && r.right > 0 && r.left < w && (r.width || r.height);
        if (seen) el.classList.add("is-in");
        return !seen;
      });
      if (!pending.length) clearInterval(poll);
    };
    const poll = setInterval(check, 250);
  }

  root.classList.add("lf-ready");
})();
