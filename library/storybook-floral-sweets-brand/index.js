// First page: draws in the graphics and moves with the original values.
// Hero mouse parallax (follow 0.06 · 0.035/0.02/0.015 · ±40) · logo yPercent 200 · house props sway 0.5~2s · sparkle 0.2~0.6s ·
// Product parallax 0→3 · 25→-20 · 50→-35 · box row y (1440/width)×600~750px → 0 scrub (circle after 80%, 3D box hover rotateY -38.2→-77.2°) ·
// Second product circles yPercent 0→30·35·40·15·20 · store illustration yPercent -20→20 · store photo swiper (850ms · 3.5s autoplay · loop) · phone hero x -18% 7s → 4.7% 10s back and forth.
(() => {
  const { reduced, isSP, rnd } = GM;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  $$("[data-ribbon]").forEach((el) => (el.outerHTML = GM.ribbon(el.dataset.ribbon)));

  // ── Hero background: flower-pattern boxes floating among silver roots ──
  const boxes = [
    [150, 90, 150, 180, 60, 0, -12], [400, 30, 120, 110, 50, 2, 8], [640, 120, 96, 200, 40, 1, -6], [900, 40, 150, 140, 60, 3, 14], [1200, 120, 120, 170, 50, 0, -10],
    [60, 470, 140, 130, 56, 3, 10], [330, 380, 190, 150, 70, 1, -4], [600, 520, 120, 190, 50, 0, 12], [860, 380, 170, 160, 64, 2, -14], [1130, 470, 140, 200, 56, 1, 6],
    [1330, 720, 120, 110, 50, 2, -8], [220, 760, 130, 160, 54, 2, 4], [740, 800, 170, 130, 64, 3, -10], [1010, 820, 110, 150, 48, 0, 16], [500, 900, 100, 100, 44, 1, 20],
  ];
  $("[data-kv-base]").innerHTML = `<svg class="gm-ill" viewBox="0 0 1520 1100" aria-hidden="true">
    ${boxes.map(([x, y, w, h, d, k, r]) => `<g transform="rotate(${r} ${x + w / 2} ${y + h / 2}) translate(${x + w / 2} ${y + h / 2}) scale(1.2) translate(${-x - w / 2} ${-y - h / 2})">${GM.box(x, y, w, h, d, k)}</g>`).join("")}
  </svg>`;
  $("[data-kv-base]").insertAdjacentHTML("afterbegin", `<div class="kv__roots-mid">${GM.rootBand(1520, 1100, 2, 43)}</div><div class="kv__roots-mid">${GM.roots(1520, 1100, 70, { s: 17, op: 0.95 })}</div>`);
  $("[data-risu]").innerHTML = GM.risu();
  $("[data-hato]").innerHTML = `<div>${GM.hato()}</div>`;
  if (!isSP && !reduced) {
    const kv = $(".kv");
    kv.dataset.fx = "depth-follow";
    kv.setAttribute("data-fx-depth-follow", "lerp: .06; axis: x; rest-x: 0");
    [[".kv__base-wrap", -0.035, 40], [".kv__ne-top", -0.02], [".kv__hato > div", -0.015]].forEach(([s, k, c]) => { const l = $(s); l.dataset.fxPart = "layer"; l.dataset.depth = k; if (c) l.dataset.clamp = c; });
  }
  $('[data-roots="top"]').innerHTML = GM.roots(1600, 420, 34, { s: 29 });
  $('[data-roots="bottom"]').innerHTML = GM.roots(1600, 360, 30, { from: "bottom", s: 31 });

  // ── Treehouse cross-section ──
  const shelf = (x, y, n, k0) => Array.from({ length: n }, (_, i) => `<g data-fx-part="item">${GM.box(x + i * 46, y - 40, 34, 40, 14, (k0 + i) % 4)}</g>`).join("");
  const sparks = Array.from({ length: 21 }, (_, i) => { const x = rnd(80, 1020), y = rnd(40, 1500); return `<g class="gm-spark" style="transform-origin:${x.toFixed(0)}px ${y.toFixed(0)}px"><path d="M${x} ${y - 9}l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="var(--site-white)"/></g>`; }).join("");
  $("[data-house]").innerHTML = `<svg class="gm-ill" viewBox="0 0 1100 1560" aria-hidden="true">
    <path d="M550 0v200" stroke="url(#gm-silver)" stroke-width="40"/>
    <path d="M550 120c-80-60-160-60-240-20M550 90c90-70 180-60 250-10M560 60c40-40 90-50 140-30" stroke="url(#gm-silver)" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M190 260L550 120l360 140z" fill="url(#gm-navy)" stroke="var(--site-silver-mid)" stroke-width="2"/>
    ${Array.from({ length: 7 }, (_, i) => `<path d="M${230 + i * 2} ${250 - i * 18}h${640 - i * 4}" stroke="var(--site-silver-mid)" stroke-width="1" opacity=".5"/>`).join("")}
    <rect x="210" y="260" width="680" height="440" fill="url(#gm-navy)" stroke="var(--site-silver-mid)" stroke-width="2"/>
    <path d="M370 280c80-24 280-24 360 0v44c-80-22-280-22-360 0z" fill="var(--site-silver-white)"/><text x="550" y="314" text-anchor="middle" style="font-family:var(--kf-font-display)" font-weight="800" font-size="26" letter-spacing="6" fill="var(--kf-accent-text)">WORD MARK</text>
    <rect x="250" y="360" width="180" height="300" rx="90" fill="var(--site-navy-door)" stroke="var(--site-silver-mid)"/><rect x="670" y="360" width="180" height="300" rx="90" fill="var(--site-navy-door)" stroke="var(--site-silver-mid)"/>
    <path d="M490 700V420c0-40 120-40 120 0v280z" fill="var(--site-navy-ground)" stroke="var(--site-silver-mid)"/>
    <path d="M550 260v440" stroke="url(#gm-silver)" stroke-width="30"/>
    <g class="house__ue" data-fx="random-jiggle" data-fx-random-jiggle="angle: 5-10">${shelf(266, 470, 3, 0)}${shelf(266, 560, 3, 2)}${shelf(686, 470, 3, 1)}${shelf(686, 560, 3, 3)}
    <g data-fx-part="item"><g transform="translate(470 560) scale(.55)">${GM.risu().replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></g></g>
    <path d="M60 700h980" stroke="var(--site-navy-ground)" stroke-width="6"/>
    ${Array.from({ length: 40 }, (_, i) => `<path d="M${70 + i * 24} 700l4 -${10 + (i % 3) * 8}l4 ${10 + (i % 3) * 8}" stroke="var(--site-navy-ground)" stroke-width="2" fill="none"/>`).join("")}
    <path d="M110 740c140 40 740 40 880 0v540c0 140-880 140-880 0z" fill="var(--site-navy-under)" opacity=".92"/>
    <path d="M550 700c0 120-40 200-150 260M550 700c10 130 60 220 170 270M550 700v420" stroke="url(#gm-silver)" stroke-width="18" fill="none" stroke-linecap="round"/>
    <path d="M400 960c-60 30-120 40-200 30M720 970c60 20 120 20 180 0M550 1120c-20 60-60 100-120 120" stroke="url(#gm-silver)" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="190" y="1010" width="300" height="12" fill="var(--site-silver-line)"/><rect x="610" y="1010" width="300" height="12" fill="var(--site-silver-line)"/><rect x="250" y="1190" width="600" height="12" fill="var(--site-silver-line)"/>
    <g class="house__shita" data-fx="random-jiggle" data-fx-random-jiggle="angle: 7-12">${shelf(200, 1010, 6, 1)}${shelf(620, 1010, 6, 2)}${shelf(270, 1190, 12, 0)}
    <g data-fx-part="item"><g transform="translate(640 1060) scale(.5)">${GM.risu("", true).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></g></g>
    <circle cx="550" cy="1100" r="46" fill="var(--site-glow)" opacity=".25"/><circle cx="550" cy="1100" r="18" fill="var(--site-glow)" opacity=".7"/>
    ${sparks}
  </svg>`;

  const houseSvg = $("[data-house] svg").innerHTML.replace(/ data-fx(-[\w-]+)?="[^"]*"/g, "").replace(/gm-spark/g, "");
  $("[data-house]").insertAdjacentHTML("beforeend", `<div class="house__zoom is-ue" aria-hidden="true"><svg viewBox="230 380 420 420">${houseSvg}</svg></div><div class="house__zoom is-shita" aria-hidden="true"><svg viewBox="560 900 420 420">${houseSvg}</svg></div>`);

  // ── Art beside the product intro: paper plane, dove, squirrel and small squirrel ──
  $("[data-plane]").innerHTML = `<svg class="gm-ill" viewBox="0 0 300 140" aria-hidden="true"><path d="M2 90L298 10 150 136l-20-46z" fill="var(--site-silver-white)" stroke="var(--site-silver-line)" stroke-width="2"/><path d="M130 90L298 10" stroke="var(--site-silver-line)" stroke-width="1.5"/></svg>`;
  $("[data-pair]").innerHTML = `<div class="pair">${GM.risu("pair__risu")}${GM.hato("pair__hato")}</div>`;
  $("[data-risu-small]").innerHTML = GM.risu("", true);
  document.querySelector(".coffret1").insertAdjacentHTML("afterbegin", `<div class="coffret1__band">${GM.rootBand(1600, 700, 1, 47)}</div>`);
  document.querySelector(".bois").insertAdjacentHTML("afterbegin", `<div class="bois__band">${GM.rootBand(1600, 900, 2, 53)}</div>`);
  $("[data-risu-bois]").innerHTML = GM.risu();
  $("[data-cans]").innerHTML = `<svg class="gm-ill" viewBox="0 0 520 260" aria-hidden="true">${[0, 1, 2, 3].map((k) => `<g transform="translate(${20 + k * 125} ${40 + (k % 2) * 30})"><rect width="100" height="160" rx="10" fill="url(#gm-flor${k})"/><ellipse cx="50" cy="0" rx="50" ry="14" fill="url(#gm-flor${(k + 1) % 4})"/><ellipse cx="50" cy="0" rx="50" ry="14" fill="var(--site-white)" opacity=".35"/><rect width="100" height="160" rx="10" fill="none" stroke="var(--site-white)" stroke-opacity=".6"/></g>`).join("")}</svg>`;

  // ── Six box rows + name circles ──
  const names = [["le mariage", "Your flavor name 1 here", 1, "l"], ["le thé", "Your flavor name 2 here", 2, "r"], ["les rectangulaires", "Your flavor name 3 here", 3, "l"], ["le parfum", "Your flavor name 4 here", 4, "r"], ["cube moelleux", "Your flavor name 5 here", 5, "l"], ["la tarte", "Your flavor name 6 here", 6, "r"]];
  // Drawn at the face size (rem×10) so the floral pattern spreads at the same size on every face
  const face = (cls, k, w, h) => `<div class="${cls}"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" fill="url(#gm-flor${k})"/></svg></div>`;
  const cube = (k) => `<div class="box3d">${face("top", k, 149, 118)}${face("side", (k + 1) % 4, 118, 223)}${face("front", k, 149, 223)}</div>`;
  $("[data-lines]").innerHTML = names.map(([en, ja, c, side], i) => {
    const n = i === 3 ? 6 : 5, turn = i % 2 ? 1 : 2;
    const items = Array.from({ length: n }, (_, k) => `<div class="lb${k === turn ? " is-turn" : k < turn ? " is-down" : " is-up"}" style="--k:${k};z-index:${n - k}">${cube((k + i) % 4)}</div>`).join("");
    return `<div class="line is-${side}" data-line="${i}">
      <span class="line__block"></span>
      <div class="line__boxes" style="--n:${n}">${items}</div>
      <button class="circle" type="button" style="--circle-color:var(--site-c${c})" data-name="${en}" data-ja="${ja}"><span class="circle__in"><span class="circle__name gm-script">${en}</span><span class="circle__ja">${ja}</span><span class="circle__txt">Your one-line flavor intro here</span><span class="circle__arrow">→</span></span></button>
    </div>`;
  }).join("");

  // Box photo strip: each cell’s floating start is random within 0–10s (clones get the same value — set before the part clones them)
  $$(".pkg__set").forEach((set) => set.querySelectorAll(".pkg__item").forEach((it) => (it.style.animationDelay = `-${rnd(0, 10).toFixed(3)}s`)));

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero: logo drops late + mouse parallax
    if (!isSP) {
      gsap.fromTo(".kv__logo", { yPercent: 0 }, { yPercent: 200, ease: "none", scrollTrigger: { trigger: ".kv", start: "top top", end: "bottom top", scrub: true } });
      if (matchMedia("(hover: hover)").matches) {
        let mx = innerWidth / 2, cur = mx;
        const onMove = (e) => (mx = e.clientX);
        addEventListener("mousemove", onMove);
        const tick = () => {
          cur += (mx - cur) * 0.06;
          const d = innerWidth / 2 - cur;
          gsap.set(".kv__base-wrap", { x: gsap.utils.clamp(-40, 40, d * 0.035) });
          gsap.set(".kv__ne-top", { x: d * 0.02 });
          gsap.set(".kv__hato > div", { x: d * 0.015 });
        };
        gsap.ticker.add(tick);
        return () => { gsap.ticker.remove(tick); removeEventListener("mousemove", onMove); };
      }
    } else {
      const tl = gsap.timeline().to(".kv__base-wrap", { x: "-18%", ease: "sine.inOut", duration: 7 }).to(".kv__base-wrap", { x: "4.7%", ease: "sine.inOut", duration: 10, repeat: -1, yoyo: true });
      new IntersectionObserver(([en]) => (en.isIntersecting ? tl.play() : tl.pause())).observe($(".kv"));
    }
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const st = (trigger, start, end, extra = {}) => ({ trigger, start, end, scrub: true, ...extra });
    const liquid = (px, base = 1440) => (base / innerWidth) * px;
    // Product intro parallax (original coffret1)
    gsap.fromTo(".coffret1__title", { yPercent: -25 }, { yPercent: 8, ease: "none", scrollTrigger: st(".coffret1__title", "top bottom", "bottom top") });
    $$(".coffret1__obj").forEach((o) => {
      const inner = o.querySelector(".inner"), [a, b] = o.dataset.obj.split(",").map(Number);
      if (!isSP) return gsap.fromTo(inner, { yPercent: a }, { yPercent: b, ease: "none", scrollTrigger: st(o, "top bottom", "bottom top") });
      if (o.classList.contains("is-1")) gsap.fromTo(inner, { yPercent: 20 }, { yPercent: 0, ease: "sine", scrollTrigger: st(o, "top bottom", "top 50%") });
      if (o.classList.contains("is-2")) gsap.fromTo(inner, { y: () => liquid(150, 375) }, { y: 0, ease: "sine.out", scrollTrigger: st(o, "top bottom", "top 30%", { invalidateOnRefresh: true }) });
    });
    // Box rows: rise from below into place, and past 80% progress (the last row at the end) become circles — each row with the original’s distance and end position
    const PC = [[600, "top 50%", 0.8], [750, "top 30%", 0.8], [550, "top 60%", 0.8], [750, "top 35%", 0.8], [600, "top 60%", 0.8], [750, "top 30%", 1]];
    const SPV = [[150, "top 45%", 0.8], [250, "top 45%", 0.9], [120, "top 62%", 0.9], [150, "top 50%", 0.9], [120, "top 60%", 0.9], [150, "top 50%", 1]];
    $$(".line").forEach((ln, i) => {
      const c = ln.querySelector(".circle"), [d, end, at] = (isSP ? SPV : PC)[i];
      gsap.fromTo(ln.querySelector(".line__boxes"), { y: () => (isSP ? liquid(d, 750) : liquid(d)) }, { y: 0, ease: "none", scrollTrigger: st(ln.querySelector(".line__block"), i ? "top 100%" : "top bottom", end, { invalidateOnRefresh: true, onUpdate: (s) => c.classList.toggle("is-show", at === 1 ? s.progress === 1 : s.progress > at) }) });
      // On phone, instead of hand input, the box spins during 48~95% of scroll progress (50% for even rows)
      if (isSP) ScrollTrigger.create({ trigger: ln.querySelector(".line__block"), start: "top bottom", end: "bottom top", onUpdate: (s) => ln.classList.toggle("is-hover", s.progress > (i % 2 ? 0.5 : 0.48) && s.progress < 0.95) });
    });
    // Second product: title and circle parallax, the circle grows when it enters
    gsap.fromTo(".bois__title-in", { yPercent: isSP ? -20 : -35 }, { yPercent: isSP ? 0 : 3, ease: "none", scrollTrigger: st(".bois__title", "top bottom", "bottom top") });
    $$(".bois__circle").forEach((c, i) => gsap.fromTo(c.querySelector(".bois__circle-in"), { yPercent: 0 }, { yPercent: [30, 35, 40, 15, 20][i], ease: "none", scrollTrigger: st(c, "top bottom", "bottom top", { onEnter: () => c.classList.add("is-show"), onLeaveBack: () => c.classList.remove("is-show") }) }));
    gsap.fromTo("[data-shop-visual]", { yPercent: -20 }, { yPercent: 20, ease: "none", scrollTrigger: st(".shop__visual", "top bottom", "bottom top") });
    // Phone zoom circle: house progress 34.5~46.3% above ground, after 53% below ground
    if (isSP) {
      const [ue, shita] = $$(".house__zoom");
      ScrollTrigger.create({ trigger: ".house", start: "top bottom", end: "bottom top", onUpdate: ({ progress: p }) => { ue.classList.toggle("is-show", p >= 0.345 && p < 0.463); shita.classList.toggle("is-show", p >= 0.53); } });
    }
  });
  if (reduced) $$(".circle, .bois__circle").forEach((c) => c.classList.add("is-show"));

  // Mouse over the box row = One box spins while the neighboring box steps aside (original only on wide screens)
  if (!isSP) $$(".line").forEach((ln) => { ln.addEventListener("mouseenter", () => ln.classList.add("is-hover")); ln.addEventListener("mouseleave", () => ln.classList.remove("is-hover")); });

  // Sparkle: pick one, turn it back on after 1/60s, the next after 0.2~0.6s (0.5~1.2s on phones)
  const sparks2 = $$(".house__ill > svg .gm-spark");
  let t2 = null;
  const blink = () => { const s = sparks2[(Math.random() * sparks2.length) | 0]; s.classList.remove("is-blink"); gsap.delayedCall(1 / 60, () => s.classList.add("is-blink")); t2 = gsap.delayedCall(isSP ? gsap.utils.random(0.5, 1.2) : gsap.utils.random(0.2, 0.6), blink); };
  if (!reduced) new IntersectionObserver(([en]) => { t2?.kill(); if (en.isIntersecting) blink(); }).observe($(".house"));

  // The box’s secret: when the panel is visible, floating spins, and the circle grows when visible and folds when it drops below
  const ioShow = new IntersectionObserver((ens) => ens.forEach((en) => en.isIntersecting && en.target.classList.add("is-show")), { rootMargin: "0% 0% -5% 0%", threshold: [0, 1] });
  const ioHide = new IntersectionObserver((ens) => ens.forEach((en) => !en.isIntersecting && en.boundingClientRect.top > 0 && en.target.classList.remove("is-show")), { threshold: 0 });
  $$("[data-pkg-circle]").forEach((c) => (reduced ? c.classList.add("is-show") : (ioShow.observe(c), ioHide.observe(c))));

  // Description window
  const modal = $(".modal");
  $$(".circle").forEach((c) => c.addEventListener("click", () => {
    modal.querySelector(".modal__name").textContent = c.dataset.name;
    modal.querySelector(".modal__ja").textContent = c.dataset.ja;
    modal.style.setProperty("--circle-color", c.style.getPropertyValue("--circle-color"));
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); GM.lenis?.stop();
  }));
  const close = () => { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); GM.lenis?.start(); };
  modal.querySelector(".modal__close").addEventListener("click", close);
  modal.querySelector(".modal__bg").addEventListener("click", close);

  // Shop photo slider — same swiper as the original (slidesPerView auto · speed 850 · loop · autoplay 3500 · dot buttons)
  new Swiper("[data-shop-swiper]", { slidesPerView: "auto", spaceBetween: 0, speed: 850, loop: true, autoplay: reduced ? false : { delay: 3500, disableOnInteraction: false }, pagination: { el: "[data-shop-swiper] .swiper-pagination", clickable: true } });
})();
