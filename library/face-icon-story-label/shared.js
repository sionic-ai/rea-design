// Motion shared by all sections — the values of the original Nuxt app (layouts/default · Loading · Transition · Ticker) carried over into several html files.
// Loader: 3.5s progress (bar easeOutQuart, Lottie 0→300f) → continue playing from 300f → info blurs after 1s → ends after 1.5s (loader .5s fade).
// Transition: on click the body slides out 20px to the right .8s (power4.out), and if triggered from the menu, after .2s a color panel enters from the left .6s (expo.out), stays 1.6s, then exits right.
//       the new section body slides in from 20px left over .8s, after 1.4s when going to a list (work · people · careers), otherwise after .2s (original router.afterEach).
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DATA = window.NM_LOTTIE || {};
  const anims = new WeakMap();

  // Lottie slot — original Lottie part (loop false, autoplay true by default)
  const mount = (el) => {
    if (!window.lottie || anims.has(el)) return anims.get(el);
    const data = DATA[el.dataset.lottie];
    if (!data) return null;
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: el.dataset.loop === "1", autoplay: el.dataset.autoplay !== "0" && !reduce, animationData: data });
    if (reduce) a.goToAndStop(a.totalFrames - 1, true);
    anims.set(el, a);
    return a;
  };
  // Loader Lottie and height are attached after first paint (hydration, original measured 150ms) like the original — first paint has only the LOADING letter line
  document.querySelectorAll("[data-lottie]:not(.nm-loading__lottie)").forEach(mount);
  window.nmLottie = (el) => anims.get(el) || mount(el);

  // Once visible on screen, add is-visible once (shared mixin of the original v-observe-visibility) — lighting header tag and rise
  const seen = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); seen.unobserve(e.target); } }));
  const watchInview = () => document.querySelectorAll(".nm-lamp, [data-inview-anim]").forEach((el) => seen.observe(el));

  // ── Vertical strip: original vue-dynamic-marquee (row·reverse) — enters from beyond the right edge and moves left at 100px per second, repeating with a 10px gap, and pauses on hover ──
  const tickers = [];
  document.querySelectorAll("[data-ticker]").forEach((box) => {
    const track = box.querySelector(".nm-ticker__track");
    const unit = track.firstElementChild;
    const t = { box, track, unit, x: null, w: 0, pause: false };
    const fill = () => {
      t.w = unit.getBoundingClientRect().width;
      const boxW = box.clientWidth;
      if (!t.w || !boxW) return;
      const need = Math.ceil(boxW / t.w) + 1;
      while (track.children.length < need) track.append(unit.cloneNode(true));
      if (t.x === null) t.x = boxW;
    };
    t.fill = fill;
    box.addEventListener("mouseenter", () => { t.pause = true; });
    box.addEventListener("mouseleave", () => { t.pause = false; });
    new ResizeObserver(fill).observe(box);
    tickers.push(t);
  });
  let last = 0;
  const tick = (now) => {
    const dt = last ? Math.max(0, Math.min(100, now - last)) : 0;
    last = now;
    tickers.forEach((t) => {
      if (!t.w || t.x === null) return;
      if (!t.pause && !reduce) t.x -= dt * 0.1;
      if (t.x <= -t.w) t.x += t.w * Math.floor(-t.x / t.w);
      t.track.style.transform = `translateX(${t.x}px)`;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // ── Phone menu ──
  const trigger = document.querySelector(".nm-header-sp__trigger");
  const spnav = document.querySelector(".nm-sp-gnav");
  const setNav = (open) => {
    if (!trigger || !spnav) return;
    trigger.setAttribute("aria-expanded", String(open));
    spnav.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  trigger?.addEventListener("click", () => setNav(trigger.getAttribute("aria-expanded") !== "true"));

  // ── Back to Top ──
  document.querySelector(".nm-btt")?.addEventListener("click", () => window.scroll({ left: 0, top: 0, behavior: "smooth" }));

  // ── Section Transition ──
  const main = document.querySelector(".nm-main");
  const sheet = document.querySelector(".nm-transition");
  const LISTS = ["list", "about", "recruit"];
  const pageOf = (href) => ({ "index.html": "home", "list.html": "list", "about.html": "about", "recruit.html": "recruit", "detail.html": "detail" })[href.split("#")[0]] || "home";
  const showIcon = (name) => {
    sheet.dataset.name = name;
    sheet.querySelectorAll(".nm-transition__icon").forEach((el) => {
      const on = el.dataset.icon === name;
      el.classList.toggle("is-current", on);
      const a = window.nmLottie(el);
      if (a) on ? a.play() : a.stop();
    });
  };
  const sheetOut = (delay) => {
    gsap.to(sheet, { x: "100%", duration: 0.6, ease: "expo.out", delay: delay / 1000, startAt: { x: 0 }, onComplete: () => {
      gsap.set(sheet, { opacity: 0 });
      sheet.querySelectorAll(".nm-transition__icon").forEach((el) => window.nmLottie(el)?.stop());
      sheet.classList.remove("is-show");
      gsap.set(sheet, { x: "-100%" });
    } });
  };
  const sheetIn = (name) => {
    sheet.classList.add("is-show");
    showIcon(name);
    gsap.to(sheet, { x: 0, opacity: 1, duration: 0.6, ease: "expo.out", delay: 0.2, startAt: { x: "-100%", opacity: 0 } });
  };
  let leaving = false;
  const go = (href, name) => {
    if (leaving) return;
    const target = pageOf(href);
    const same = target === page && !href.includes("#");
    if (same) {
      // Menu links to the same section (the original vue-router blocks the same path) — the body stays put and only the color panel slides in and out
      if (name) { sheetIn(name); sheetOut(1800); }
      setNav(false);
      return;
    }
    leaving = true;
    sessionStorage.setItem("nm-nav", JSON.stringify({ name: name || "", t: Date.now(), from: page, to: target }));
    if (name) sheetIn(name);
    gsap.to(main, { opacity: 0, x: 20, duration: 0.8, ease: "power4.out", startAt: { x: 0, opacity: 1 }, onComplete: () => { location.href = href; } });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[a-z]+\.html(#[\w-]+)?$/.test(href)) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    go(href, a.dataset.nav || "");
  });
  // So nothing stays missing when returning via the back button
  addEventListener("pageshow", (e) => { if (e.persisted) { leaving = false; gsap.set(main, { opacity: 1, x: 0 }); } });

  // ── Loader · entering ──
  const finish = () => {
    root.classList.add("is-loading-finished");
    watchInview();
    document.dispatchEvent(new CustomEvent("nm:ready"));
  };
  const arrive = (nav) => {
    root.style.setProperty("--inner-height", innerHeight);
    root.style.setProperty("--inner-height-initial", innerHeight);
    document.querySelector(".nm-loading")?.remove();
    const elapsed = Date.now() - nav.t;
    // The original changes length .8s after the advance is pressed, then the body enters at 1.4s for lists and .2s otherwise
    const wait = LISTS.includes(nav.to) && nav.from !== "detail" ? 1400 : 200;
    const enterAt = Math.max(0, 800 + wait - elapsed);
    if (nav.name) {
      sheet.classList.add("is-show");
      showIcon(nav.name);
      gsap.set(sheet, { x: 0, opacity: 1 });
      root.classList.remove("nm-arrive");
      delete root.dataset.nmArrive;
      sheetOut(Math.max(0, 1800 - elapsed));
    }
    gsap.set(main, { opacity: 0, x: -20 });
    root.classList.remove("nm-arrive-plain");
    finish();
    gsap.to(main, { opacity: 1, x: 0, duration: 0.8, ease: "power4.out", delay: enterAt / 1000 });
  };
  const loader = () => {
    const el = document.querySelector(".nm-loading");
    if (!el) { root.style.setProperty("--inner-height-initial", innerHeight); finish(); return; }
    if (reduce) { root.style.setProperty("--inner-height-initial", innerHeight); el.remove(); finish(); return; }
    // Count from after the first paint (if the font @import delays the first paint, it gets covered before then)
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => run(el), 150)));
  };
  const run = (el) => {
    root.style.setProperty("--inner-height", innerHeight);
    root.style.setProperty("--inner-height-initial", innerHeight);
    const lot = mount(el.querySelector(".nm-loading__lottie"));
    const bar = el.querySelector(".nm-loading__bar");
    const text = el.querySelector(".nm-loading__text");
    const wave = setInterval(() => { text.classList.add("is-anim"); setTimeout(() => text.classList.remove("is-anim"), 1200); }, 1500);
    const t0 = Date.now(), DUR = 3500;
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / DUR);
      bar.style.backgroundSize = 100 * (1 - Math.pow(1 - p, 4)) + "%";
      if (p < 1) { lot?.goToAndStop(Math.floor(300 * p), true); requestAnimationFrame(step); return; }
      lot?.playSegments([300, 1800], true);
      setTimeout(() => el.classList.add("is-loaded"), 1000);
      clearInterval(wave);
      setTimeout(() => {
        finish();
        el.classList.add("is-leave");
        setTimeout(() => el.remove(), 500);
      }, 1500);
    };
    requestAnimationFrame(step);
  };
  let nav = null;
  try { nav = JSON.parse(sessionStorage.getItem("nm-nav") || "null"); } catch (e) { nav = null; }
  sessionStorage.removeItem("nm-nav");
  if (nav && Date.now() - nav.t < 4000) arrive(nav);
  else loader();
})();
