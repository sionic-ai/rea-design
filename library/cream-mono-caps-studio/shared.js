// Render in one place so all four sections use the same band, header, footer, cursor, flowing rows and entrances. The original is built on a page-builder theme plus its add-on plugin:
// Lenis (duration 1.8) · mouse-follower (speed .55 · expo.out · stickDelta .15, dot .1x · press .5x) · Reeller (+ScrollerPlugin) ·
// Bricks entrance (animate.css fadeIn · fadeInUp 1s, once when entering view, delayed per element) · fixed header slide-up (transform .4s)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGES = [["index.html", "Home"], ["works.html", "Portfolio"], ["#", "The Studio"], ["service.html", "Services"]];
  const here = location.pathname.split("/").pop() || "index.html";
  const CARET = '<svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  const LOGO = '<svg viewBox="0 0 120 30" aria-hidden="true"><text x="0" y="24" font-size="30" style="font-family: var(--kf-font-display); font-weight: 800; letter-spacing: -0.02em">studio</text></svg>';

  // ── Top booking strip (one slot every 5s, pauses on hover)
  const top = document.querySelector('[data-slot="topbar"]');
  if (top) {
    const cell = '<div class="os-top__cell"><span data-label="Booking info, English one line">Now booking month</span><span>0 spot left</span></div>';
    top.innerHTML = `<a class="os-top" href="#" aria-label="Booking info"><div class="os-reel" data-reel data-speed="5" data-pause-hover><div class="os-reel__wrap"><div class="os-reel__item"><div class="os-reel__row">${cell.repeat(1)}</div></div></div></div></a>`;
  }

  // ── Head
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    const link = ([h, t]) => `<a class="os-nav__link" href="${h}"${h === here ? ' aria-current="page"' : ""}>${t}</a>`;
    head.outerHTML = `
<header class="os-head" data-slot="header">
  <div data-slot="topbar-in"></div>
  <div class="os-head__bar">
    <a class="os-head__logo" href="index.html" aria-label="To the first page" data-label="Brand logo (lowercase bold sans-serif)">${LOGO}</a>
    <div class="os-head__right">
      <button class="os-burger" type="button" aria-label="Open and close menu"><i></i><i></i><i></i></button>
      <nav class="os-nav" aria-label="Menu">
        ${PAGES.map(link).join("")}
        <div class="os-nav__drop"><a class="os-nav__link" href="news.html"${here === "news.html" ? ' aria-current="page"' : ""}>Editorial</a><button type="button" aria-label="Submenu">${CARET}</button>
          <div class="os-nav__menu"><a class="os-nav__link" href="#">Case Studies</a><a class="os-nav__link" href="news.html">Journal</a></div>
        </div>
        <a class="os-nav__link" href="#">Contact</a>
        <a class="os-cta is-small" href="#" data-anim="fadeIn" style="animation-delay: .9s" data-label="Script button label in English">start a project</a>
      </nav>
    </div>
  </div>
</header>`;
    const h = document.querySelector(".os-head");
    const bar = document.querySelector('[data-slot="topbar"]');
    if (bar) h.querySelector('[data-slot="topbar-in"]').replaceWith(bar);
    h.querySelector(".os-burger").addEventListener("click", () => h.classList.toggle("is-open"));
    h.querySelector(".os-nav__drop button").addEventListener("click", (e) => e.currentTarget.parentElement.classList.toggle("is-open"));
    // Hide while scrolling down more than 1px, show when scrolling up (Bricks slide-up)
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      if (y > 1 && y > lastY) h.classList.add("is-up");
      else if (y < lastY) h.classList.remove("is-up");
      lastY = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
  }

  // ── Illustrations: spots of the original hand-drawn objects replaced with our own drawings of the same size and same texture (bold lines, fills)
  const ILLO = {
    house: '<path class="il-stroke" d="M10 70 60 30l50 40M20 62v48h80V62M48 110V82h24v28M30 70h12v12H30zM78 70h12v12H78z"/>',
    door: '<path class="il-stroke" d="M20 160V50a40 40 0 0 1 80 0v110zM30 150V58a30 30 0 0 1 60 0v92zM60 28v122M30 90h60M84 104v8"/>',
    lamp: '<path class="il-stroke" d="M40 20h40l14 40H26zM60 60v50M40 110h40M44 110q-6 20 16 26 22-6 16-26M20 136h90M100 80h24v40h-24z"/>',
    plant: '<path class="il-stroke" d="M40 110h40l-6 40H46zM60 110V60M60 80c-30-6-36-30-30-44 18 6 30 20 30 44M60 70c24-10 30-34 22-46-16 8-24 24-22 46"/>',
    sun: '<circle class="il-fill" cx="70" cy="70" r="30"/><path class="il-stroke" d="M70 10v18M70 112v18M10 70h18M112 70h18M28 28l12 12M100 100l12 12M112 28l-12 12M40 100l-12 12"/>',
    blob: '<path class="il-fill" d="M30 40c10-30 60-30 66 0 6 24-14 30 4 48 18 18 4 52-30 50-38-2-54-30-40-56 8-14-6-24 0-42z"/>',
    tree: '<path class="il-stroke" d="M70 150V20M70 40l-40 30M70 40l40 30M70 70l-50 36M70 70l50 36M70 100l-56 34M70 100l56 34"/>',
    bottle: '<path class="il-stroke" d="M50 10h20v30c14 8 18 20 18 34v76H32V74c0-14 4-26 18-34zM32 96h56M32 126h56"/>',
    figure: '<path class="il-fill" d="M60 30a16 16 0 1 1 0 32 16 16 0 0 1 0-32zM38 70h44l14 50-16 4-8-26v52H48V98l-8 26-16-4z"/>',
  };
  const VIEW = { house: "0 0 120 120", door: "0 0 120 170", lamp: "0 0 130 150", plant: "0 0 120 160", sun: "0 0 140 140", blob: "0 0 120 140", tree: "0 0 140 160", bottle: "0 0 120 160", figure: "0 0 120 160" };
  document.querySelectorAll("[data-illo]:empty").forEach((el) => (el.innerHTML = `<svg viewBox="${VIEW[el.dataset.illo]}" aria-hidden="true">${ILLO[el.dataset.illo]}</svg>`));

  // ── Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const rays = Array.from({ length: 14 }, (_, i) => `<rect x="47" y="4" width="6" height="40" rx="3" transform="rotate(${i * (360 / 14)} 50 50)"/>`).join("");
    const icons = ['<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>', '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 7v12" stroke="currentColor" stroke-width="2"/>', '<path d="M5 9v10M5 5v1M10 19v-6a3 3 0 0 1 6 0v6M10 10v9" stroke="currentColor" stroke-width="2.4" fill="none"/>', '<path d="M3 6h7a3 3 0 0 1 0 6H3zm0 6h8a3.5 3.5 0 0 1 0 7H3zM15 8h6" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M3 8l3 9 3-7 3 7 3-9" stroke="currentColor" stroke-width="2" fill="none"/>'];
    foot.outerHTML = `
<footer class="os-foot" data-slot="footer">
  <div class="os-foot__bg wf-img" data-label="Dark brown copperplate landscape texture · full-bleed background photo"></div>
  <div class="os-foot__burst" data-label="Light-ray sentence (white translucent)"><svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">${rays}</svg></div>
  <div class="os-foot__cols">
    <div class="os-foot__col"><p class="os-h" data-label="Footer One Line English">We're visual storytellers</p><div class="os-foot__social">${icons.map((p, i) => `<a href="#" aria-label="Social ${i + 1}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></a>`).join("")}</div></div>
    <div class="os-foot__col"><p class="os-h">Sitemap</p><div class="os-foot__map"><a href="index.html">Home</a><a href="works.html">Portfolio</a><a href="#">The Studio</a><a href="service.html">Services</a><a href="#">Case Studies</a><a href="news.html">Journal</a><a href="#">Contact</a></div></div>
    <div class="os-foot__col"><p class="os-h">Get in touch</p><a class="os-foot__mail" href="#" data-label="Email address">hello@example.com</a></div>
  </div>
</footer>`;
  }

  // ── Smooth scroll (Lenis duration 1.8)
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.8, smoothTouch: false, wheelMultiplier: 1, touchMultiplier: 1, infinite: false });
    window.OS = { lenis };
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Dot cursor
  if (window.MouseFollower && !reduce && matchMedia("(pointer: fine)").matches) {
    MouseFollower.registerGSAP(gsap);
    // The original (Brand) uses italic 0 as an attribute value "0" Passed through as is — text reads as solid, so stretch stays 0 and the dot rotates in the direction of movement. Keep the same value
    new MouseFollower({ speed: 0.55, ease: "expo.out", skewing: "0", stickDelta: 0.15, hideOnLeave: true, visible: true });
  }

  // ── Flowing line: original marquee settings kept as is — speed (seconds), reverse, pauses/slows on hover, accelerates with scroll (ScrollerPlugin multiplier .5 · expo)
  const reels = [];
  if (window.Reeller) {
    Reeller.Reeller.registerGSAP(gsap);
    document.querySelectorAll("[data-reel]").forEach((el) => {
      const d = el.dataset, speed = parseFloat(d.speed) || 10, reversed = "reversed" in d;
      const r = new Reeller.Reeller({ container: el, wrapper: ".os-reel__wrap", itemSelector: ".os-reel__item", speed, cloneClassName: "-clone", clonesMin: 0, clonesOverflow: true, clonesFinish: false, ease: "none", loop: true, paused: reduce, reversed, autoStop: false, autoUpdate: true, initialSeek: 10 });
      if ("scroller" in d && !reduce) new Reeller.ScrollerPlugin(r, { speed: 1, multiplier: 0.5, threshold: 1, reversed, bothDirection: false, ease: "expo", overwrite: true, stopOnEnd: false, scrollProxy: null });
      const wrap = r.filler.wrapper, dir = reversed ? -1 : 1;
      if (d.hoverSpeed) {
        const slow = parseFloat(d.hoverSpeed) / speed;
        wrap.addEventListener("mouseenter", () => r.tl.timeScale(slow * dir));
        wrap.addEventListener("mouseleave", () => r.tl.timeScale(dir));
      } else if ("pauseHover" in d) {
        wrap.addEventListener("mouseenter", () => r.pause());
        wrap.addEventListener("mouseleave", () => r.resume());
      }
      reels.push(r);
    });
  }

  // ── Reveal: once when it enters the screen
  const anims = document.querySelectorAll("[data-anim]");
  if (reduce) anims.forEach((el) => el.classList.add("is-in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0 });
    anims.forEach((el) => io.observe(el));
  }
})();
