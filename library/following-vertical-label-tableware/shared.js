// Used across the whole set: loading (download progress bar → grows to 1.08 and fades), barba transition (curtain covers in .3s, lifts .3s after .5s · prefetch),
// Header (white-text switch · submenu · phone drawer), vertical section names, footer video panel when the end spot is visible, and per section Embla · masked photo transition · parallax.
// As in the original, keep one page script and set up sections by barba namespace — hooked again to the new body after a transition.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mbq = matchMedia("(max-width: 949px)");
  const isMb = () => mbq.matches;

  // Original curves — Cubic/Sine/Expo are GSAP names, the second is the site curve mixing expo and quint half and half, the third is a curve of sine wrapped twice
  const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const expoInOut = (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2);
  const quintOut = (t) => 1 - Math.pow(1 - t, 5);
  const quintInOut = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);
  const mix = { out: (t) => 0.5 * expoOut(t) + 0.5 * quintOut(t), inOut: (t) => 0.5 * expoInOut(t) + 0.5 * quintInOut(t) };
  const sineOut = (t) => Math.sin((t * Math.PI) / 2);
  const sine2 = { out: (t) => sineOut(sineOut(t)) };

  const header = document.querySelector(".tk-head");
  const loading = document.querySelector(".tk-loading");
  const secTitle = document.querySelector("[data-sectitle]");
  let ns = document.querySelector("[data-barba=container]")?.dataset.barbaNamespace || "";

  // ───────── Loading — the bar shrinks with the progress of what must be loaded (fonts·scripts·css), and once all is loaded the group scales up to 1.08 and blurs out in .8s ─────────
  const progress = document.querySelector("[data-loading-progress]");
  const group = document.querySelector("[data-loading-group]");
  if (progress) {
    const urls = [...document.querySelectorAll("script[src], link[rel=stylesheet]")].map((n) => n.src || n.href);
    const seen = new Set(performance.getEntriesByType("resource").map((e) => e.name));
    const done = urls.filter((u) => seen.has(u)).length;
    gsap.set(progress, { scaleX: 1 - done / Math.max(urls.length, 1) });
  }
  addEventListener("load", () => {
    document.querySelector("[data-foot-video]")?.classList.add("is-playing");
    if (!loading) return;
    if (progress) gsap.set(progress, { scaleX: 0 });
    if (reduce) { gsap.set(loading, { autoAlpha: 0 }); if (group) group.style.display = "none"; return; }
    if (group) gsap.to(group, { scale: 1.08, opacity: 0, duration: 0.8, ease: "expo.in" });
    gsap.to(loading, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut", delay: 0.82, onComplete: () => { if (group) group.style.display = "none"; } });
    if (ns === "top_page") {
      gsap.fromTo(header, { y: -80 }, { y: 0, duration: 1.16, ease: mix.inOut, delay: 0.88 });
      const copy = document.querySelector("[data-intro-copy]");
      if (copy) gsap.fromTo(copy, { y: 170 }, { y: 0, duration: 1.46, ease: mix.inOut, delay: 0.89 });
    }
  });

  // ───────── Header — submenu (opens on hover in .6s), phone drawer (from -100lvh above in .62s) ─────────
  document.querySelectorAll(".tk-head .has-sub").forEach((li) => {
    const a = li.querySelector(":scope > a");
    const sub = li.querySelector(":scope > .tk-sub");
    if (!a || !sub) return;
    a.setAttribute("aria-expanded", "false");
    const open = () => { if (isMb()) return; li.classList.add("is-open"); a.setAttribute("aria-expanded", "true"); };
    const close = () => { li.classList.remove("is-open"); a.setAttribute("aria-expanded", "false"); };
    a.addEventListener("mouseenter", open);
    a.addEventListener("focus", open);
    li.addEventListener("mouseleave", close);
    li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) close(); });
    a.addEventListener("click", (e) => { if (a.getAttribute("href") === "#") e.preventDefault(); });
  });
  const menuBtn = document.querySelector("[data-menu]");
  const gnav = document.querySelector(".tk-gnav");
  const gbox = document.querySelector(".tk-gnav__box");
  const logo = document.querySelector(".tk-logo");
  function showMenu(on) {
    if (!gnav) return;
    menuBtn?.classList.toggle("is-open", on);
    logo?.classList.toggle("is-open", on);
    if (on) {
      gsap.fromTo(gnav, { opacity: 0, display: "none" }, { opacity: 1, display: "block", ease: "power2.out", duration: 0.32 });
      gsap.fromTo(gbox, { top: "-100lvh" }, { top: 0, ease: mix.out, duration: 0.62 });
    } else {
      gsap.to(gnav, { opacity: 0, ease: "power2.inOut", duration: 0.32, onComplete: () => { gnav.style.display = ""; } });
      gsap.fromTo(gbox, { top: 0 }, { top: "-100lvh", ease: mix.inOut, duration: 0.42 });
    }
  }
  [menuBtn, ...document.querySelectorAll("[data-menu-close]")].forEach((b) => b?.addEventListener("click", () => {
    showMenu(getComputedStyle(gnav).display === "none");
  }));
  mbq.addEventListener("change", () => { if (!isMb()) { gsap.set([gnav, gbox], { clearProps: "all" }); menuBtn?.classList.remove("is-open"); logo?.classList.remove("is-open"); } });

  // ───────── When the end is visible the footer panel shrinks to 720px and text floats up, if the body is taller than the screen the header hides at -20px in .32s ─────────
  const dummy = document.querySelector("[data-foot-dummy]");
  const foot = document.querySelector(".tk-foot");
  let footOn = false;
  function footState(on) {
    footOn = on;
    foot?.classList.toggle("is-show", on);
    dummy?.classList.toggle("is-show", on);
    document.querySelector("[data-summary]")?.classList.toggle("is-hidden", on);
    const bg = document.querySelector("[data-bg]");
    if (on && (bg?.clientHeight ?? 0) > innerHeight) gsap.to(header, { y: -20, opacity: 0, ease: "power2.in", duration: 0.32 });
    else gsap.to(header, { y: 0, opacity: 1, ease: "power2.out", duration: 0.32 });
  }
  if (dummy) new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting !== footOn) footState(e.isIntersecting); }), { rootMargin: "0px 0px 50px 0px" }).observe(dummy);

  // ───────── White header text — when the hero top and the brand story (dark section) sit under the header ─────────
  function headTone() {
    if (!header) return;
    let white = false;
    const bg = document.querySelector("[data-bg]");
    if (ns === "top_page" && bg) white = bg.getBoundingClientRect().top > 0;
    const mid = innerHeight / 2;
    let underTop = false, atMid = false;
    document.querySelectorAll(".tk-story").forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top <= 0 && r.bottom > 0) underTop = true;
      if (r.top <= mid && r.bottom > mid) atMid = true;
    });
    if (underTop) white = true;
    header.classList.toggle("is-white", white);
    let over = false;
    if (white && bg) {
      const h = header.getBoundingClientRect(), b = bg.getBoundingClientRect();
      over = h.bottom > b.top && h.top < b.bottom;
    }
    header.classList.toggle("is-over", over);
    secTitle?.classList.toggle("is-white", atMid);
  }

  // ───────── Vertical section name — name of the section across the screen center. If none, it vanishes by -5px over .32s ─────────
  let titleIO = null;
  function watchTitles(container) {
    titleIO?.disconnect();
    if (!secTitle) return;
    const secs = [...container.querySelectorAll("[data-bg] section[data-heading]")];
    if (!secs.length) { secTitle.style.display = "none"; return; }
    secTitle.style.display = "none";
    secTitle.textContent = "";
    const hide = () => {
      if (secTitle.style.display === "none") return;
      gsap.killTweensOf(secTitle);
      gsap.fromTo(secTitle, { opacity: 1, x: 0 }, { opacity: 0, x: -5, duration: 0.32, ease: mix.out, onComplete: () => { secTitle.style.display = "none"; secTitle.textContent = ""; } });
    };
    const pick = () => {
      const mid = innerHeight / 2;
      let best = null, dist = Infinity;
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < dist) { dist = d; best = s; } }
      });
      if (!best) { hide(); return; }
      secTitle.textContent = best.dataset.heading;
      if (secTitle.style.display === "none" || secTitle.style.opacity === "0") {
        secTitle.style.display = "";
        gsap.killTweensOf(secTitle);
        gsap.fromTo(secTitle, { opacity: 0, x: -5 }, { opacity: 1, x: 0, duration: 0.32, ease: mix.out });
      }
    };
    titleIO = new IntersectionObserver(pick, { rootMargin: "-50% 0px", threshold: 0 });
    secs.forEach((s) => titleIO.observe(s));
  }

  // ───────── Set up and tear down per section ─────────
  let cleanups = [];
  const later = (fn) => cleanups.push(fn);

  // Next photo with a mask that clears from the bottom (1.2s expo.out, .2s late, every 4 seconds). The large background behind goes in the same order, .5→1 and 1.08→1
  function maskSlider(container) {
    const box = container.querySelector("[data-mask-slider]");
    if (!box) return;
    const imgs = [...box.children];
    const bgs = [...container.querySelectorAll("[data-story-bg] > *")];
    const size = (p) => ({ maskImage: "linear-gradient(to top, currentColor 0%, currentColor 100%)", maskSize: `100% ${p}%`, maskRepeat: "no-repeat", maskPosition: "bottom" });
    const style = (el, z) => gsap.set(el, { zIndex: z, ...size(100) });
    imgs.forEach((el, i) => style(el, i === 0 ? 1 : -1));
    if (imgs.length < 2 || reduce) return;
    let at = 0;
    const timer = setInterval(() => {
      const cur = imgs[at], next = (at + 1) % imgs.length;
      style(imgs[next], 0);
      gsap.to(cur, {
        ...size(0), duration: 1.2, ease: "expo.out", delay: 0.2,
        onStart: () => {
          bgs.forEach((b, i) => { b.style.zIndex = i === next ? "10" : "0"; if (i !== next) b.style.opacity = "0"; });
          const b = bgs[next];
          if (b) { gsap.fromTo(b, { opacity: 0.5 }, { opacity: 1, duration: 0.8, ease: "power2.out" }); gsap.fromTo(b, { scale: 1.08 }, { scale: 1, duration: 4, ease: "none" }); }
        },
        onComplete: () => { style(cur, -1); style(imgs[next], 1); at = next; },
      });
    }, 4000);
    later(() => { clearInterval(timer); gsap.killTweensOf([...imgs, ...bgs]); });
  }

  // Photo inside a slot flows upward with scroll (by the overflowing height)
  function parallax(container) {
    container.querySelectorAll("[data-parallax-box]").forEach((box) => {
      const target = box.querySelector("[data-parallax-target]");
      if (!target || reduce) return;
      const st = ScrollTrigger.create({
        trigger: box, start: "top bottom", end: "bottom top",
        onUpdate: (s) => gsap.set(target, { y: -(target.offsetHeight - box.offsetHeight) * s.progress }),
      });
      later(() => st.kill());
    });
  }

  // Brand photos — auto-advance every 5s, the thumb strip follows along and tapping jumps to that photo
  function brands(container) {
    if (!window.EmblaCarousel) return;
    container.querySelectorAll(".tk-brand__row").forEach((row) => {
      const vp = row.querySelector("[data-brand-embla] .embla__viewport");
      const tvp = row.querySelector("[data-brand-thumbs] .embla-thumbs__viewport");
      if (!vp || !tvp) return;
      const main = EmblaCarousel(vp, { align: "start", loop: true }, window.EmblaCarouselAutoplay && !reduce ? [EmblaCarouselAutoplay({ delay: 5000 })] : []);
      const thumbs = EmblaCarousel(tvp, { containScroll: "keepSnaps", dragFree: true });
      const nodes = thumbs.slideNodes();
      const clicks = nodes.map((n, i) => { const f = () => { main.reInit(); main.scrollTo(i); }; n.addEventListener("click", f); return f; });
      const sync = () => {
        thumbs.scrollTo(main.selectedScrollSnap());
        nodes[main.previousScrollSnap()]?.classList.remove("embla-thumbs__slide--selected");
        nodes[main.selectedScrollSnap()]?.classList.add("embla-thumbs__slide--selected");
      };
      main.on("select", sync);
      thumbs.on("init", sync);
      sync();
      later(() => { nodes.forEach((n, i) => n.removeEventListener("click", clicks[i])); main.destroy(); thumbs.destroy(); });
    });
  }

  // Recommended product strip — flows continuously (speed 1.2, phone .6), prev·next pause the flow briefly and then resume. The progress bar follows
  function recommend(container) {
    const root = container.querySelector("[data-rec-embla]");
    if (!root || !window.EmblaCarousel) return;
    const vp = root.querySelector(".embla__viewport");
    const bar = root.querySelector("[data-rec-progress]");
    const plugins = window.EmblaCarouselAutoScroll && !reduce ? [EmblaCarouselAutoScroll({ speed: isMb() ? 0.6 : 1.2, stopOnInteraction: false })] : [];
    const em = EmblaCarousel(vp, { align: "center", loop: true, watchDrag: false }, plugins);
    const paint = () => { const p = Math.max(0, Math.min(1, em.scrollProgress())); bar.style.transform = `translate3d(${p * 100}%,0px,0px)`; };
    em.on("scroll", paint).on("reInit", paint);
    paint();
    const auto = em.plugins()?.autoScroll;
    const step = (go) => { auto?.stop?.(); go(); auto?.play?.(); };
    const prev = () => step(() => em.scrollPrev()), next = () => step(() => em.scrollNext());
    root.querySelector(".embla__button--prev")?.addEventListener("click", prev);
    root.querySelector(".embla__button--next")?.addEventListener("click", next);
    later(() => { em.destroy(); bar.removeAttribute("style"); });
  }

  function aboutPage(container) {
    container.querySelector("[data-about-video]")?.classList.add("is-playing");
    const dlg = container.querySelector("[data-dialog]");
    if (dlg) {
      container.querySelector("[data-dialog-open]")?.addEventListener("click", () => dlg.showModal());
      dlg.querySelector("[data-dialog-close]")?.addEventListener("click", () => dlg.close());
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    }
    // On phone, the body is pushed down by the height of the fixed header panel
    const fit = () => {
      const s = container.querySelector("[data-summary] .tk-grid");
      if (s && isMb()) document.documentElement.style.setProperty("--about-bg-margin-top", `${s.offsetHeight + 252}px`);
    };
    fit();
    addEventListener("resize", fit);
    later(() => removeEventListener("resize", fit));
  }

  function mount(container) {
    ns = container.dataset.barbaNamespace;
    document.body.dataset.ns = ns;
    maskSlider(container);
    parallax(container);
    if (ns === "top_page") { brands(container); recommend(container); }
    if (ns === "about_page") aboutPage(container);
    watchTitles(container);
    document.querySelectorAll(".tk-gnav__list a").forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("is-active", (ns === "about_page" && href === "about.html") || ((ns === "news_page" || ns === "news_single") && href === "news.html"));
    });
    headTone();
    if (ns === "top_page") setTimeout(() => header?.classList.add("is-white"), 100);
    const show = ns !== "error_page";
    if (dummy) dummy.style.display = show ? "block" : "none";
    if (foot) foot.style.display = show ? "flex" : "none";
  }
  function unmount() {
    cleanups.forEach((f) => f());
    cleanups = [];
  }

  // Scroll direction indicator (when moved more than 8px) and head color
  let lastY = scrollY, dir = "none";
  addEventListener("scroll", () => {
    const y = scrollY, d = y - lastY;
    if (Math.abs(d) >= 8) {
      const now = d > 0 ? "down" : "up";
      if (now !== dir) { document.body.classList.remove("is-scroll-down", "is-scroll-up"); document.body.classList.add(`is-scroll-${now}`); dir = now; }
      lastY = y;
    }
    headTone();
  }, { passive: true });

  // ───────── barba — original default-transition. On back navigation the cover curtain is .02s ─────────
  const scrolls = {};
  const container = document.querySelector("[data-barba=container]");
  if (container) mount(container);
  if (window.barba && location.protocol !== "file:") {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.hooks.beforeLeave(() => { if (isMb() && getComputedStyle(gnav).display !== "none") showMenu(false); });
    barba.hooks.enter(({ next }) => mount(next.container));
    barba.hooks.afterEnter(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    barba.init({
      debug: false,
      timeout: 8000,
      preventRunning: true,
      transitions: [{
        name: "default-transition",
        sync: false,
        leave(data) {
          scrolls[data.current.namespace] = scrollY;
          unmount();
          return gsap.to(loading, { autoAlpha: 1, ease: "power2.out", duration: data.trigger === "back" ? 0.02 : 0.3 });
        },
        enter(data) {
          if (data.trigger !== "back") { data.current.container.style.display = "none"; (document.scrollingElement || document.documentElement).scrollTop = 0; }
          return gsap.fromTo(loading, { autoAlpha: 1 }, { autoAlpha: 0, ease: "power2.out", duration: 0.3, delay: 0.5 });
        },
        after(data) {
          if (data.trigger === "back") scrollTo(0, scrolls[data.next.namespace] ?? 0);
          const hash = location.hash.slice(1);
          if (hash) setTimeout(() => document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        },
      }],
    });
  }
  window.tkSite = { showMenu, mix, sine2 };
})();
