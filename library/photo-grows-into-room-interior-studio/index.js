// Home page motion. Original numbers (moved from Webflow IX3, based on 1440):
// Loading delay 1 → lines ±2.2svw up and down .76s → gather to center from 1.05s at .02s stagger .65s → at 1.9s background clears, center cell 42×28svw .77s → at 2.68s fills screen .76s
// Photo inner -12%/-24% (top 100% → top -100%) · green panel .65→1/1.25/1.5x (top -50% → bottom bottom) · black-and-white veil (top 35% → top 5%)
// Folder card x -60rem·y 50%·scale 0 → 1, then x -120rem (top -30% → bottom bottom, scrub 1) · number columns one cell at a time (top -20% → bottom bottom)
(() => {
  const { reduced, slider, lenis } = window.ST;
  gsap.registerPlugin(CustomEase);
  CustomEase.create("wf4", "0.32,0.72,0,1");
  CustomEase.create("wf6", "0.075,0.82,0.165,1");
  CustomEase.create("wf7", "0.42,0,0.58,1");
  const E = "power2.out";
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ── Build five green panels (same type, so only the data changes) ── */
  const projects = [
    ["Living room with a dining table and a large painting · overcast daylight through the window · landscape 16:10", "00", "000"],
    ["Bedroom · wood wall panels and curtains · afternoon side light · landscape 16:10", "00", "000"],
    ["Cafe with a curved counter · ceiling indirect lighting · landscape 16:10", "00", "000"],
    ["Café hall seen through a dark doorway · symmetrical · landscape 16:10", "00", "000"],
    ["Café with wooden partitions · warm lighting · people · landscape 16:10", "00", "000"],
  ];
  const zoom = $(".st-apart");
  $(".st-apart__track").innerHTML = projects
    .map(([label, days, area], i) => `
      <div class="st-apart__slide swiper-slide">
        <div class="st-apart__panel">
          <div class="st-apart__green"></div>
          <div class="st-apart__back is-second"><div class="wf-img"></div></div>
          <div class="st-apart__back is-first"><div class="wf-img"></div></div>
          <div class="st-apart__photo">
            <div class="wf-img" data-label="${label}"></div>
            <div class="st-apart__shade"></div>
            <p class="st-apart__num">0<b>${i + 1}</b><span>/</span><small>05</small></p>
          </div>
          <div class="st-apart__head"><h2 class="t-h2" data-label="Your project English name here">Project<br>Name 0${i + 1}</h2></div>
          <dl class="st-apart__facts">
            <div><dt class="t-cap">Construction Period</dt><dd>${days}Day</dd></div>
            <div><dt class="t-cap">Area</dt><dd>${area} m²</dd></div>
            <div><dt class="t-cap">City · Country</dt><dd>Your city, country here</dd></div>
          </dl>
          <div class="st-apart__btns">
            <div class="is-anim"><a class="st-btn-link" href="detail.html">View Project</a><a class="st-btn-link is-white" href="works.html">All Projects</a></div>
            <div class="is-main"><a class="st-btn-link" href="detail.html">View Project</a><a class="st-btn-link is-white" href="works.html">All Projects</a></div>
          </div>
        </div>
      </div>`)
    .join("");
  window.ST.fillIcons(zoom);
  slider(zoom, { later: true });

  /* ── Line sketch (the original is an image file) — redrawn at the same place and size ── */
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
  const pl = (pts, j = 1.5) => "M" + pts.map(([x, y]) => `${(x + rnd() * j).toFixed(1)} ${(y + rnd() * j).toFixed(1)}`).join(" L");
  const svg = (vb, paths, w = 1.3) => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
  const right = [];
  [[60, 40], [80, 70], [40, 110]].forEach(([ox, oy]) => {
    right.push(pl([[ox, oy], [ox + 150, oy - 10], [ox + 160, oy + 120], [ox + 8, oy + 128], [ox, oy]]));
    right.push(pl([[ox + 150, oy - 10], [ox + 230, oy + 30], [ox + 236, oy + 150], [ox + 160, oy + 120]]));
  });
  right.push(pl([[30, 250], [190, 228], [360, 260], [200, 300], [30, 250]]), pl([[190, 228], [200, 300]]), pl([[120, 160], [124, 330]]), pl([[300, 120], [304, 280]]));
  $(".st-appr__sketch.is-right").innerHTML = svg("0 0 400 400", right);
  const left = [];
  left.push(pl([[10, 290], [90, 210], [92, 20]]), pl([[90, 210], [250, 214]]), pl([[92, 20], [260, 6]]), pl([[150, 212], [152, 120], [200, 118], [202, 214]]));
  for (let i = 0; i < 7; i++) left.push(pl([[110 + i * 9, 290 - i * 11], [140 + i * 9, 290 - i * 11]], 1));
  left.push(pl([[230, 30], [270, 0]]), pl([[180, 140], [184, 166], [178, 186]], 0.6), pl([[60, 250], [60, 120], [80, 104]]));
  $(".st-appr__sketch.is-left").innerHTML = svg("0 0 276 298", left);
  // Isometric house cross-section (the graphic slot of the original Architecture card)
  const iso = (x, y) => [260 + (x - y) * 0.87, 60 + (x + y) * 0.5];
  const box = (x, y, w, d, h) => {
    const p = [iso(x, y), iso(x + w, y), iso(x + w, y + d), iso(x, y + d)];
    return [pl([...p, p[0]], 0.6), ...(h ? [pl([p[0], [p[0][0], p[0][1] - h], [p[1][0], p[1][1] - h], p[1]], 0.6), pl([[p[1][0], p[1][1] - h], [p[2][0], p[2][1] - h], p[2]], 0.6)] : [])];
  };
  const axo = [...box(0, 0, 240, 180, 26), ...box(10, 10, 220, 160, 0), ...box(90, 10, 4, 100, 26), ...box(10, 100, 120, 4, 26), ...box(150, 60, 4, 110, 26), ...box(30, 120, 50, 36, 8), ...box(170, 20, 50, 28, 10), ...box(170, 110, 40, 40, 12), ...box(110, 130, 24, 24, 6)];
  for (let i = 0; i < 4; i++) { const [tx, ty] = iso(250, 20 + i * 40); axo.push(pl([[tx, ty], [tx + 4, ty - 60], [tx + 14, ty - 20], [tx + 6, ty - 70], [tx + 10, ty]], 3)); }
  for (let i = 0; i < 9; i++) { const [sx, sy] = iso(-10 - i * 6, 40 + i * 12); axo.push(pl([[sx, sy], [sx + 40, sy + 22]], 0.5)); }
  $(".st-fold__mid").innerHTML = svg("0 0 520 360", axo, 1);

  /* ── FAQ ── */
  const faqs = Array.from({ length: 9 }, (_, i) => `A question clients often ask about the work, on one line${i % 3 === 1 ? ", a little longer" : ""}?`);
  $(".st-faq__list").innerHTML = faqs
    .map((q, i) => `<div class="st-faq__item"${i >= 6 ? " hidden" : ""}><button class="st-faq__q" type="button"><h3 class="t-h4">${q}</h3>${window.ST.icon.chevron}</button><div class="st-faq__a"><p class="t-body">Your answer goes here in about three lines. Write in order what is received, how long it takes and who handles it, and end with a one-line next step.</p></div></div>`)
    .join("");
  $(".st-faq__list").addEventListener("click", (e) => {
    const q = e.target.closest(".st-faq__q");
    if (!q) return;
    const item = q.parentElement;
    const open = !item.classList.contains("is-open");
    $$(".st-faq__item.is-open").forEach((o) => { o.classList.remove("is-open"); gsap.to($(".st-faq__a", o), { height: 0, duration: 0.45, ease: E }); });
    if (open) { item.classList.add("is-open"); gsap.to($(".st-faq__a", item), { height: "auto", duration: 0.45, ease: E, onComplete: () => ScrollTrigger.refresh() }); }
  });
  let more = false;
  $("[data-faq-more]").addEventListener("click", (e) => {
    more = !more;
    $$(".st-faq__item").forEach((it, i) => i >= 6 && (it.hidden = !more));
    e.currentTarget.textContent = more ? "Fold" : "See more";
    ScrollTrigger.refresh();
  });

  /* ── Card hover: the view button follows the mouse at a .12 ratio ── */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".st-card").forEach((card) => {
      const b = $(".st-card__view", card);
      // Like the original, the button rests at the card’s top left and follows the cursor position with transform .3s ease-out (it stays at that spot even after the cursor leaves)
      const move = (e) => {
        const r = card.getBoundingClientRect();
        b.style.transform = `translate3d(${e.clientX - r.left - b.offsetWidth / 2}px, ${e.clientY - r.top - b.offsetHeight / 2}px, 0)`;
      };
      card.addEventListener("pointerenter", move);
      card.addEventListener("pointermove", move);
    });
  }

  /* ── Loading ── */
  const root = document.documentElement;
  const pre = $(".st-pre");
  const heroImg = $(".st-hero__img");
  const finishPre = () => {
    try { sessionStorage.setItem("st-pre", "1"); } catch (e) {}
    root.classList.add("pre-skip");
    gsap.set([heroImg, ".st-hero__content", ".st-head"], { clearProps: "all" });
    lenis?.start();
    ScrollTrigger.refresh();
  };
  if (root.classList.contains("pre-skip")) {
    pre.remove();
  } else {
    lenis?.stop();
    $(".st-pre__logo").innerHTML = window.ST.logo();
    const run = () => {
      const tiles = $$(".st-pre__tile");
      const first = tiles.filter((t) => t.classList.contains("first"));
      const second = tiles.filter((t) => t.classList.contains("second"));
      const mobile = innerWidth < 768;
      const tl = gsap.timeline({ delay: 1, onComplete: () => { finishPre(); pre.remove(); } });
      // Paired left and right from the outer cells toward the center: desktop ±30.8 … ±4.4svw (outer two disappear), phone inner six cells ±37.5 … ±12.5svw
      const pairs = mobile ? [[4, 37.5], [5, 25], [6, 12.5]] : [[0, 30.8, 1], [1, 26.4, 1], [2, 22], [3, 17.6], [4, 13.2], [5, 8.8], [6, 4.4]];
      const s = mobile
        ? { shift: 6.25, dur: 0.74, conv: 0.95, text: 1.37, open: 1.74, w: "60svw", h: "45svw", full: 2.29, content: 2.33, head: 2.23, out: 2.25 }
        : { shift: 2.2, dur: 0.76, conv: 1.05, text: 1.53, open: 1.9, w: "42svw", h: "28svw", full: 2.68, content: 2.76, head: 2.76, out: 2.78 };
      tl.to(first, { y: -s.shift + "svw", duration: s.dur, ease: "wf7" }, 0)
        .to(second, { y: s.shift + "svw", duration: s.dur, ease: "wf7" }, 0.07);
      let k = 0;
      pairs.forEach(([i, x, fade]) => {
        [[tiles[i], x], [tiles[14 - i], -x]].forEach(([t, dx]) => {
          tl.to(t, { x: dx + "svw", duration: 0.65, ease: "wf4", ...(fade ? { opacity: 0 } : {}) }, s.conv + k++ * 0.02);
        });
      });
      tl.to(".st-pre__text", { opacity: 0, y: "5%", duration: 0.7, ease: E }, s.text)
        .to(pre, { backgroundColor: window.ST.cssColor("var(--site-preloader)", 0), ease: E }, s.open)
        .to(".st-pre__back", { opacity: 0, ease: E }, s.open)
        .to(".st-pre__row", { opacity: 0, duration: 0.25, ease: "wf4" }, s.open)
        .to(heroImg, { width: s.w, height: s.h, duration: 0.77, ease: "wf4" }, s.open)
        .to(heroImg, { width: "100vw", height: "100vh", duration: 0.76, ease: E }, s.full)
        .to(".st-hero__content", { opacity: 1, y: "0%", duration: 0.45, ease: E }, s.content)
        .to(".st-head", { opacity: 1, duration: 0.6, ease: E }, s.head)
        .to(".st-pre__content", { opacity: 0, duration: 0.25, ease: "wf6" }, s.out);
    };
    document.readyState === "complete" ? run() : addEventListener("load", run, { once: true });
  }

  if (reduced) return;

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    /* Scattered photos: only the inner photo moves up */
    $$(".st-card").forEach((card) => {
      gsap.to($(".st-card__img .wf-img", card), { yPercent: +card.dataset.depth, ease: E, scrollTrigger: { trigger: card, start: "top 100%", end: "top -100%", scrub: 0.8 } });
    });

    /* Green panel zoom */
    const tl = gsap.timeline({ scrollTrigger: { trigger: zoom, start: "top -50%", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true } });
    tl.fromTo($$(".st-apart__photo", zoom), { scale: 0.65 }, { scale: 1, duration: 3, ease: E }, 0.2)
      .fromTo($$(".st-apart__back.is-first", zoom), { scale: 0.65 }, { scale: 1.25, duration: 3, ease: E }, 0.1)
      .fromTo($$(".st-apart__back.is-second", zoom), { scale: 0.65 }, { scale: 1.5, duration: 3, ease: E }, 0)
      .fromTo($$(".st-apart__num", zoom), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E }, 1)
      .fromTo(".st-apart__tools", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E }, 1)
      .to(".st-apart__tools", { opacity: 0, duration: 0.12, ease: E }, 3)
      .fromTo($$(".st-apart__btns", zoom), { y: () => -3 * rem() }, { y: 0, duration: 2, ease: E }, 1)
      .fromTo($$(".st-apart__btns .is-anim", zoom), { height: "auto" }, { height: 0, duration: 0.5, ease: E }, 1)
      .fromTo($$(".st-apart__btns .is-main", zoom), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E }, 1)
      .fromTo($$(".st-apart__head", zoom), { x: () => 2.22222 * rem(), yPercent: -120 }, { x: 0, yPercent: 0, duration: 1, ease: E }, 0.5)
      .fromTo($$(".st-apart__facts", zoom), { x: () => -2.22222 * rem(), yPercent: -85 }, { x: 0, yPercent: 0, duration: 1, ease: E }, 0.5)
      .fromTo($$(".st-apart__shade", zoom), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, 1.5);
    gsap.to($$(".st-apart__panel", zoom), { scale: 1.0075, ease: "none", scrollTrigger: { trigger: zoom, start: "top 0%", end: "top -10%", scrub: 0.8 } });

    /* Black-and-White Curtain Reveal */
    $$(".st-ctrl__card").forEach((card) => {
      gsap.fromTo($(".st-ctrl__gray", card), { opacity: 1 }, { opacity: 0, ease: E, scrollTrigger: { trigger: card, start: "top 35%", end: "top 5%", scrub: 0.8 } });
    });

    /* Navy panel: sketch moves outside the corner, panel grows slightly, folder cards grow and flow */
    const appr = $(".st-appr");
    const st = { trigger: appr, start: "top 0%", end: "bottom bottom", scrub: 0.8 };
    gsap.to(".st-appr__sketch.is-left", { xPercent: -100, yPercent: -100, ease: "none", scrollTrigger: st });
    gsap.to(".st-appr__sketch.is-right", { xPercent: 50, yPercent: 50, ease: "none", scrollTrigger: { ...st } });
    gsap.to(".st-appr__panel", { scale: 1.0075, ease: "none", scrollTrigger: { trigger: appr, start: "top 0%", end: "top -30%", scrub: 0.8 } });
    const strip = $(".st-appr__strip");
    const W = () => $(".st-fold").offsetWidth;
    gsap.timeline({ scrollTrigger: { trigger: appr, start: "top -30%", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } })
      .fromTo(strip, { x: () => -1.5 * W(), yPercent: 50, scale: 0 }, { x: () => -1.5 * W(), yPercent: 0, scale: 1, duration: 1, ease: "none" }, 0)
      .to(strip, { x: () => -3 * W(), duration: 3, ease: "none" }, 1);

    /* Number column: a light curtain lifts one cell at a time and the text turns white */
    const wrap = $(".st-about-wrap");
    const stats = $$(".st-stat");
    const at = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top -20%", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true } });
    const lit = window.ST.cssColor("var(--site-on-photo)"), dim = window.ST.cssColor("var(--site-card-default)");
    stats.forEach((card, k) => {
      const veil = $(".st-stat__veil", card);
      at.to(veil, { opacity: 0, duration: 1, ease: E }, k).to(card, { color: lit, duration: 1, ease: E }, k);
      if (k < stats.length - 1) at.to(veil, { opacity: 1, duration: 1, ease: E }, k + 1).to(card, { color: dim, duration: 1, ease: E }, k + 1);
    });
    // Phone: the pillar row flows sideways so the lit cell comes on screen (original -214.25vw)
    if (innerWidth < 768) {
      const row = $(".st-about__row");
      at.fromTo(row, { x: 0 }, { x: () => -(row.scrollWidth - innerWidth + 2 * rem()), duration: 4, ease: "none" }, 0);
    }
  });
})();
