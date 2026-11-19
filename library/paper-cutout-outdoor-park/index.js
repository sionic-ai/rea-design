// Home: fills the icon row, status box, news, area panel and gallery contents, and attaches four Splides and the Pixi stage.
// Original values: Splide speed 800 ease (News 30.4rem · gap 1rem / Section 24.2rem · .4rem / Shortcuts 37rem · 14rem centered / Gallery 27rem · 3.5rem centered)
// · The Pixi stage has five scrub lines tied to the section position (brush background · four photos · map · sea otter · white circle) · tab .5s when the section panel lifts · SCROLL label .3s.
(() => {
  const { ic, chev, zones } = window.GP;
  const isPc = innerWidth > 767;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrowPath = "M30.1367 21.3281C30.8398 20.6249 30.8398 19.4531 30.1367 18.7499L14.9805 3.51556C14.1992 2.81244 13.0273 2.81244 12.3242 3.51556L10.5273 5.31244C9.82422 6.01556 9.82422 7.18744 10.5273 7.96869L22.5586 19.9999L10.5273 32.1093C9.82422 32.8906 9.82422 34.0624 10.5273 34.7656L12.3242 36.5624C13.0273 37.2656 14.1992 37.2656 14.9805 36.5624L30.1367 21.3281Z";

  // The original re-reads when the width crosses 767px — the setup (rem · Pixi size) differs by width
  addEventListener("resize", () => { if ((innerWidth > 767) !== isPc) location.reload(); });

  document.querySelector(".gh-nav").innerHTML = zones.map(([k, t]) =>
    `<li class="gh-nav__item"><a class="gh-nav__link" href="#">${ic[k].replace('class="gp-ic"', 'class="gp-ic gh-nav__img"')}<p class="gh-nav__txt">${t}</p></a></li>`).join("");
  document.querySelectorAll("[data-ic]").forEach((s) => (s.innerHTML = ic[s.dataset.ic]));
  document.querySelector(".gh-state").innerHTML = GP.stateHtml;

  const news = [
    ["notice", "Notice", "[00 News] A two-line seasonal walk news title goes here", "Bird flying over a lake · autumn mountain · landscape 4:3", true],
    ["notice", "Notice", "【00 News】 Your autumn food news headline goes here", "Calm lake and mountains · daytime · landscape 4:3"],
    ["event", "Event", "0/0/0000 ~ 0 Enter the outdoor play event title here", "Food event poster illustration · landscape 4:3"],
    ["event", "Event", "Your two-line seasonal experience event title here", "Children on a forest experience · Landscape 4:3", true],
    ["important", "Important", "【Important】 Your business change notice title goes here.", "Lodging building front view · daytime · landscape 4:3"],
    ["notice", "Notice", "Your new facility opening news title here", "Water park sign · landscape 4:3"],
  ];
  document.querySelector("[data-news-list]").innerHTML = news.map(([c, cl, t, ph, n]) =>
    `<li class="splide__slide gh-news__item"><a class="gh-news__link" href="news.html">
      ${n ? '<span class="gh-news__new gp-hand">New</span>' : ""}
      <div class="gh-news__img gp-ph"><div class="wf-img" data-label="${ph}"></div></div>
      <p class="gh-news__txt">${t}</p>
      <div class="gh-news__in"><p class="gh-news__date gp-en">2026.00.00</p><p class="gh-news__cate gh-news__cate--${c}">${cl}</p></div>
    </a></li>`).join("");

  // Region panel — tab strip, blurred background photo, large text, drawing, link cards
  const zoneData = {
    stay: { en: "STAY", ko: "To stay", items: [["Camp", "Camping spot under a white tent · Daytime"], ["Forest Villa", "Wooden villa with large windows · daytime"], ["Inn", "Tile-roof inn front · Daytime"], ["Hot spring", "Wooden open-air bath · daytime", "※Day-use bathing also available"]], bg: "Forest campground view · blurred · landscape 16:9" },
    eat: { en: "EAT", ko: "To eat", items: [["Barbecue", "Family barbecuing under a canopy · daytime"], ["Restaurant", "Meat set meal table · From above"]], bg: "BBQ area wide view · blurred · landscape 16:9" },
    play: { en: "PLAY", ko: "Play", items: [["Forest adventure", "Child on a tree tightrope · day"], ["Insect Yard", "Children watching a beetle · daytime"], ["Tennis Court", "Empty tennis court · daytime"], ["Basketball Court", "Friends playing basketball · Day"], ["Venue", "Lawn event venue · day"]], bg: "Lawn and forest · blurred · landscape 16:9" },
  };
  const charSvg = '<svg class="gh-cnt-ttlarea__img" viewBox="0 0 200 160" aria-hidden="true"><path class="c1" d="M40 120 90 30l60 90z"/><path class="c3" d="M90 30l-14 90h28z"/><circle class="c2" cx="150" cy="40" r="16"/><path class="ln" d="M150 14v8M150 58v8M124 40h8M168 40h8"/><circle class="c3" cx="58" cy="78" r="16"/><path class="ln" d="M58 94v26M58 104l-14 10M58 104l16 6M58 120l-10 20M58 120l12 18M40 120h120"/></svg>';
  const vec = '<svg class="gh-cnt-link__vec" viewBox="0 0 180 60" aria-hidden="true"><path d="M20 34C30 10 150 6 168 26c14 18-60 30-112 28C14 52 2 40 30 22"/></svg>';
  document.querySelectorAll(".gh-cnt__item").forEach((el) => {
    const z = zoneData[el.dataset.zone];
    el.innerHTML = `<div class="gh-cnt__wrap">
      <div class="gh-cnt__bg"><div class="wf-img" data-label="${z.bg}"></div></div>
      <div class="gh-cnt__sub"><i class="gh-cnt__bar" data-fx-part="bar"></i><span class="gh-cnt__subin">${z.en}<small>AREA</small></span></div>
      <div class="gh-cnt__in">
        <div class="gh-cnt-ttlarea"><div class="gh-cnt-ttlarea__in"><p class="gh-cnt-ttlarea__en"><span class="gp-stamp">${z.en}</span><span class="gp-hand">Area</span></p><h3 class="gh-cnt-ttlarea__ttl">${z.ko}<small>Area</small></h3></div>${charSvg}</div>
        <div class="gh-cnt-linkarea splide" aria-label="${z.ko} Facility"><div class="splide__track"><ul class="splide__list">
          ${z.items.map(([t, ph, sm]) => `<li class="splide__slide"><a class="gh-cnt-link" href="#"><div class="gh-cnt-link__img gp-ph"><div class="wf-img" data-label="${ph}"></div></div>${vec}<p class="gh-cnt-link__txt">${t}${chev}</p>${sm ? `<span class="gh-cnt-link__small">${sm}</span>` : ""}</a></li>`).join("")}
        </ul></div></div>
      </div>
    </div>`;
  });

  const gallery = [["#Your hashtag here", "#Hashtag Two", "Friends playing basketball · daytime · portrait"], ["#Hands-On Touch", "#Insect Watching", "Stag beetle on a hand · close-up · portrait"], ["#Your camp meal here", "#Simple is best", "Smiling mother and child · portrait"], ["#Water play fun", "#Found a frog", "Child playing by the water · vertical"], ["#Eating out", "#Delicious meat", "Hands grilling barbecue · portrait"], ["#Forest Walk", "#Birdsong", "Family walking a forest path from behind · portrait"], ["#Campfire", "#Night Sky", "Friends around a campfire · night · vertical"], ["#Pitching a Tent", "#First Camping", "Dad and child pitching a tent · portrait"]];
  document.querySelector("[data-gallery-list]").innerHTML = gallery.map(([a, b, ph]) =>
    `<li class="splide__slide gh-gallery__item"><div class="gh-gallery__in"><div class="gh-gallery__img gp-ph"><div class="wf-img" data-label="${ph}"></div></div><ul class="gh-gallery-hash"><li>${a}</li><li>${b}</li></ul></div></li>`).join("");

  // Splide
  const base = { speed: 800, easing: "ease", pagination: false, arrows: true, arrowPath, updateOnMove: true, flickPower: 200, drag: true, waitForTransition: true };
  if (isPc) new Splide(".gh-news-slider", { ...base, type: "slide", fixedWidth: "30.4rem", gap: "1rem", focus: 0, padding: { left: 0, right: "4rem" }, trimSpace: true, omitEnd: true }).mount();
  document.querySelectorAll(".gh-cnt-linkarea").forEach((el) => {
    const s = new Splide(el, { ...base, type: "slide", fixedWidth: "24.2rem", gap: ".4rem", focus: 0, trimSpace: true, omitEnd: true,
      breakpoints: { 767: { type: "loop", fixedWidth: "20.4rem", focus: "center" } } });
    s.on("overflow", (over) => {
      s.go(0);
      el.classList.toggle("is-overflow", over);
      s.options = { arrows: over, drag: over, clones: over ? undefined : 0 };
    });
    s.mount();
  });
  new Splide(".gh-linkarea-slider", { ...base, type: "loop", fixedWidth: "37rem", gap: "14rem", focus: "center", trimSpace: false,
    breakpoints: { 767: { fixedWidth: "29.4rem", gap: "8rem" } } }).mount();
  const gal = new Splide(".gh-gallery-slider", { ...base, type: "loop", fixedWidth: "27rem", gap: "3.5rem", focus: "center", trimSpace: false,
    breakpoints: { 767: { gap: "2.5rem" } } });
  gal.on("mounted", () => {
    const arrows = document.querySelector(".gh-gallery-slider .splide__arrows");
    arrows?.insertAdjacentHTML("afterbegin", '<svg class="gh-ring" viewBox="0 0 160 160" aria-hidden="true"><defs><path id="gh-gal-c" d="M80 80m-64 0a64 64 0 1 1 128 0a64 64 0 1 1-128 0"/></defs><text><textPath href="#gh-gal-c">GALLERY · GALLERY · GALLERY · GALLERY · </textPath></text></svg>');
  });
  gal.mount();

  const hero = document.querySelector(".gh-hero");
  const cnt = document.querySelector(".gh-cnt");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Bird and one-line text start .6s after the document loads, and the drawing loop stops once past the hero
    const onLoad = () => setTimeout(() => hero.classList.add("is-load"), 600);
    if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad, { once: true });
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onLeave: () => hero.classList.add("is-paused"), onEnterBack: () => hero.classList.remove("is-paused") });
    // When the section chapter reaches 70% of the screen, the tab returns to place
    ScrollTrigger.create({ trigger: cnt, start: () => (isPc ? "top 70%" : "top 80%"), once: true, invalidateOnRefresh: true, onEnter: () => cnt.classList.add("is-in") });
    // SCROLL label from the second panel on
    gsap.to(".gh-cnt-scroll", { opacity: 1, duration: 0.3, scrollTrigger: { trigger: cnt, toggleActions: "play none none reverse", start: () => `top+=${innerHeight * 2} top`, end: () => `top+=${innerHeight * 4} top` } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { hero.classList.add("is-load"); cnt.classList.add("is-in"); });

  // Pixi stage — the original art (brush background·map·four photos·sun·moon) isn’t used, it is redrawn on canvas at the same size and place
  const root = getComputedStyle(document.documentElement);
  const rem = (v) => v * parseFloat(root.fontSize);
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = root.getPropertyValue(name).trim() || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return { css: `rgb(${r} ${g} ${b})`, num: (r << 16) | (g << 8) | b };
  };
  const C = {
    bg: rgb("--kf-bg"), surface: rgb("--kf-surface"), ink: rgb("--kf-ink"), soft: rgb("--kf-ink-soft"), raised: rgb("--kf-raised"), dim: rgb("--kf-dim"),
    accent: rgb("--kf-accent"), leaf: rgb("--site-leaf"), leaf2: rgb("--site-leaf-2"), stay: rgb("--site-stay"), eat: rgb("--site-eat"), play: rgb("--site-play"), hl: rgb("--site-hl"),
  };
  const FONT = root.getPropertyValue("--kf-font-sans").trim();
  const canvasOf = (w, h, draw) => { const c = document.createElement("canvas"); c.width = Math.round(w); c.height = Math.round(h); draw(c.getContext("2d"), c.width, c.height); return c; };
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

  // Brush backdrop is opaque — it covers the map below until two panels slide away to reveal it
  const brushTex = () => canvasOf(1024, 1013, (g, w, h) => {
    g.fillStyle = C.bg.css; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.55; g.fillStyle = C.surface.css;
    for (let i = 0; i < 22; i++) {
      g.save(); g.translate(rnd() * w, rnd() * h); g.rotate((rnd() - 0.5) * 0.6);
      g.beginPath(); g.ellipse(0, 0, 80 + rnd() * 220, 12 + rnd() * 30, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  });
  const mapTex = (wpx) => canvasOf(wpx, wpx * (818 / 800), (g, w, h) => {
    const s = w / 800;
    g.scale(s, s);
    g.fillStyle = C.leaf.css; g.strokeStyle = C.accent.css; g.lineWidth = 6;
    g.beginPath(); g.moveTo(330, 60); g.bezierCurveTo(520, 30, 700, 120, 690, 300); g.bezierCurveTo(700, 470, 760, 620, 620, 740);
    g.bezierCurveTo(470, 800, 300, 760, 240, 640); g.bezierCurveTo(120, 560, 60, 420, 140, 300); g.bezierCurveTo(170, 160, 220, 80, 330, 60); g.fill(); g.stroke();
    g.fillStyle = C.stay.css; g.beginPath(); g.ellipse(230, 360, 90, 120, -0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = C.surface.css; g.lineWidth = 14; g.lineCap = "round";
    g.beginPath(); g.moveTo(300, 160); g.bezierCurveTo(420, 260, 360, 420, 480, 500); g.bezierCurveTo(560, 560, 520, 660, 600, 700); g.stroke();
    g.beginPath(); g.moveTo(340, 330); g.lineTo(600, 280); g.stroke();
    for (let i = 0; i < 60; i++) { g.fillStyle = (i % 3 ? C.leaf2 : C.accent).css; g.beginPath(); g.arc(160 + rnd() * 520, 100 + rnd() * 620, 8 + rnd() * 8, 0, Math.PI * 2); g.fill(); }
    [[C.play, 470, 200], [C.eat, 540, 420], [C.play, 420, 600], [C.eat, 330, 470], [C.stay, 600, 600]].forEach(([c, x, y]) => { g.fillStyle = c.css; g.fillRect(x - 22, y - 16, 44, 32); g.fillStyle = C.soft.css; g.beginPath(); g.moveTo(x - 28, y - 16); g.lineTo(x, y - 36); g.lineTo(x + 28, y - 16); g.fill(); });
    g.fillStyle = C.soft.css; g.font = `700 20px ${FONT}`;
    [["CAMP SITE", 430, 150], ["POND", 200, 360], ["BBQ", 560, 380], ["FOREST", 400, 560], ["EVENT AREA", 560, 700]].forEach(([t, x, y]) => g.fillText(t, x, y));
  });
  const sunTex = () => canvasOf(256, 256, (g) => {
    g.translate(128, 128); g.strokeStyle = C.eat.css; g.lineWidth = 12; g.lineCap = "round";
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 74); g.lineTo(0, 110); g.stroke(); }
    g.fillStyle = C.eat.css; g.beginPath(); g.arc(0, 0, 60, 0, Math.PI * 2); g.fill();
  });
  const moonTex = () => canvasOf(256, 256, (g) => {
    g.fillStyle = C.hl.css; g.beginPath(); g.arc(128, 128, 96, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(176, 96, 84, 0, Math.PI * 2); g.fill();
  });
  // Four photos — Polaroid placeholders are scattered toward the edges of a panel covering one screen (screen size at .6x)
  const photoSets = [
    [[0.12, 0.2, 0.2, -6, "Woman eating food · daytime"], [0.86, 0.78, 0.17, 8, "Friends jumping up · daytime"]],
    [[0.8, 0.16, 0.16, 5, "Sisters with ice cream · Daytime"], [0.18, 0.84, 0.2, -4, "Couple choosing at a shop · interior"]],
    [[0.62, 0.1, 0.13, -8, "Smiling child face · close-up"], [0.06, 0.52, 0.14, 6, "Forest Tent · Day"], [0.94, 0.44, 0.14, -5, "Child catching bugs · Daytime"]],
    [[0.44, 0.9, 0.17, 4, "Kids group · lawn"], [0.97, 0.12, 0.15, 8, "Stroll in front of building · Day"], [0.3, 0.07, 0.11, -3, "Duck by the water · Day"]],
  ];
  const photoTex = (W, H, set) => canvasOf(W / 0.6, H / 0.6, (g, w, h) => {
    set.forEach(([cx, cy, pw, rot, label]) => {
      const fw = pw * w, fh = fw * 1.1, pad = fw * 0.06;
      g.save(); g.translate(cx * w, cy * h); g.rotate((rot * Math.PI) / 180);
      g.fillStyle = C.surface.css; g.fillRect(-fw / 2, -fh / 2, fw, fh);
      g.fillStyle = C.raised.css; g.fillRect(-fw / 2 + pad, -fh / 2 + pad, fw - pad * 2, fh - pad * 3.4);
      g.strokeStyle = C.dim.css; g.lineWidth = 2; g.beginPath();
      g.moveTo(-fw / 2 + pad, -fh / 2 + pad); g.lineTo(fw / 2 - pad, fh / 2 - pad * 2.4); g.moveTo(fw / 2 - pad, -fh / 2 + pad); g.lineTo(-fw / 2 + pad, fh / 2 - pad * 2.4); g.stroke();
      g.fillStyle = C.soft.css; g.font = `500 ${Math.max(14, fw * 0.06)}px ${FONT}`; g.textAlign = "center";
      g.fillText(`Photo · ${label}`, 0, fh / 2 - pad * 0.9);
      g.restore();
    });
  });

  const stage = document.querySelector(".gh-wrap__stage");
  const startPixi = async () => {
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);
    const app = new PIXI.Application();
    await app.init({ canvas: stage, width: document.documentElement.clientWidth, height: innerHeight, backgroundColor: C.bg.num, antialias: false, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true });
    const W = app.screen.width, H = app.screen.height;
    const cont = new PIXI.Container(), bgC = new PIXI.Container(), mapC = new PIXI.Container(), circC = new PIXI.Container(), photoC = new PIXI.Container();
    app.stage.addChild(cont); cont.addChild(mapC, bgC, circC, photoC);
    const tex = (c) => PIXI.Texture.from(c);

    const bgT = tex(brushTex());
    const mkBg = (rot) => { const s = new PIXI.Sprite(bgT); s.anchor.set(0.5); s.width = isPc ? rem(295.8) : rem(100); s.height = isPc ? rem(292.6) : rem(100); s.x = W / 2; s.y = H / 2; s.rotation = rot; bgC.addChild(s); return s; };
    const bg1 = mkBg(0), bg2 = mkBg(Math.PI);

    const mapW = isPc ? rem(74) : rem(43);
    const map = new PIXI.Sprite(tex(mapTex(mapW * 2)));
    map.anchor.set(0.5);
    const baseW = isPc ? rem(113) : W;
    map.x = isPc ? W - (W - baseW) / 2 - mapW / 2 : W / 2; map.y = H / 2; map.alpha = 0; map.tint = 0x808080;
    mapC.addChild(map);

    const circles = [0, 1, 2].map(() => {
      const c = new PIXI.Graphics();
      c.circle(0, 0, isPc ? document.documentElement.clientWidth : screen.height * 0.75);
      c.stroke({ width: isPc ? rem(1) : rem(0.6), color: C.surface.num });
      c.x = W / 2; c.y = H / 2; c.scale.set(0); circC.addChild(c); return c;
    });
    const sm = new PIXI.Container();
    sm.x = W / 2; sm.y = H / 2; sm.rotation = ((isPc ? 80 : 170) * Math.PI) / 180; sm.scale.set(2); sm.alpha = 0;
    const r = isPc ? rem(30) : rem(18.5);
    const sun = new PIXI.Sprite(tex(sunTex())), moon = new PIXI.Sprite(tex(moonTex()));
    [sun, moon].forEach((s, i) => { s.anchor.set(0.5); s.width = s.height = isPc ? rem(8) : rem(4.5); s.x = s.y = (i ? 1 : -1) * (r / 1.5); sm.addChild(s); });
    circC.addChild(sm);

    const px = isPc ? [0.01, 0, -0.01, 0] : [0, 0, -0.05, 0], py = isPc ? [-0.01, 0.08, -0.01, -0.01] : [-0.055, 0.05, -0.08, -0.07];
    const photos = photoSets.map((set, i) => {
      const p = new PIXI.Sprite(tex(photoTex(W, H, set)));
      p.anchor.set(0.5); p.x = W / 2 + p.width * px[i]; p.y = H / 2 + p.height * py[i]; p.alpha = 0; photoC.addChild(p); return p;
    });

    if (reduce) {
      bgC.visible = false; map.alpha = 1; map.tint = 0xffffff; map.scale.set(isPc ? 0.5 : 0.265);
      photos.forEach((p) => { p.alpha = 1; p.scale.set(isPc ? 0.6 : 0.5); }); sm.alpha = 1; sm.scale.set(isPc ? 1 : 0.5);
      return;
    }
    const st = (o) => ({ scrub: true, ...o });
    gsap.timeline({ scrollTrigger: st({ trigger: ".gh-about", endTrigger: ".gh-about-map", start: "top 70%", end: "top bottom" }) })
      .to(bg1, { pixi: { x: bg1.x + bg1.width * 0.6, y: bg1.y - bg1.height * (isPc ? 0.3 : 0.4), rotation: 20, scaleX: bg1.scale.x * 1.1, scaleY: bg1.scale.y * 1.1 }, ease: "power1.in" })
      .to(bg2, { pixi: { x: bg2.x - bg2.width * 0.6, y: bg2.y + bg2.height * (isPc ? 0.3 : 0.4), rotation: 200, scaleX: bg2.scale.x * 1.1, scaleY: bg2.scale.y * 1.1 }, ease: "power1.in" }, "<");
    photos.forEach((p, i) => {
      gsap.set(p, { pixi: { alpha: 0, scaleX: isPc ? 4 : 3, scaleY: isPc ? 4 : 3 } });
      gsap.fromTo(p, { pixi: { alpha: 0 } }, { pixi: { alpha: 1 }, ease: "power2.out", scrollTrigger: st({ trigger: ".gh-about", start: "top 40%", end: "top 20%" }) });
      gsap.to(p, { pixi: { scaleX: isPc ? 0.6 : 0.5, scaleY: isPc ? 0.6 : 0.5, rotation: 0 }, ease: "power2.out", scrollTrigger: st({ trigger: ".gh-about", endTrigger: ".gh-about-txtarea", start: "top 40%", end: "bottom 110%" }) });
      gsap.fromTo(p, { pixi: { scaleX: isPc ? 0.6 : 0.5, scaleY: isPc ? 0.6 : 0.5 } }, { pixi: { scaleX: isPc ? 2 : 4, scaleY: isPc ? 2 : 4, rotation: i % 2 ? 20 : isPc ? -20 : -5 }, ease: "power1.in", immediateRender: false,
        scrollTrigger: st({ trigger: ".gh-about-txtarea", endTrigger: ".gh-about-map", start: "bottom bottom", end: isPc ? "bottom bottom" : "top bottom" }) });
      gsap.fromTo(p, { pixi: { alpha: 1 } }, { pixi: { alpha: 0 }, ease: "power2.in", immediateRender: false, scrollTrigger: st({ trigger: ".gh-about-map", start: isPc ? "bottom 120%" : "top 120%", end: isPc ? "bottom bottom" : "top bottom" }) });
    });
    gsap.timeline({ scrollTrigger: st({ trigger: ".gh-about", endTrigger: ".gh-about-map", start: "top bottom", end: "bottom 150%", invalidateOnRefresh: true }) })
      .fromTo(map, { pixi: { alpha: 0.4, scaleX: isPc ? 0.15 : 0.1, scaleY: isPc ? 0.15 : 0.1, tint: 0x808080 } }, { pixi: { alpha: 1, scaleX: isPc ? 0.5 : 0.265, scaleY: isPc ? 0.5 : 0.265, tint: 0xffffff }, ease: "power2.in" })
      .set(map, { pixi: { x: () => app.screen.width / 2 } }, "<")
      .to(map, { pixi: { x: () => (isPc ? app.screen.width - (app.screen.width - rem(113)) / 2 - mapW / 2 : app.screen.width / 2) }, ease: "power2.in" }, "<");
    gsap.fromTo(sm, { pixi: { alpha: 0 } }, { pixi: { alpha: 1 }, scrollTrigger: st({ trigger: ".gh-about", start: "top 40%", end: "top 20%" }) });
    gsap.fromTo(sm, { pixi: { rotation: isPc ? 80 : 170 } }, { pixi: { rotation: 480 }, ease: "none", scrollTrigger: st({ trigger: ".gh-about", start: "top 40%", end: "bottom 110%" }) });
    gsap.fromTo(sm, { pixi: { scaleX: 2, scaleY: 2 } }, { pixi: { scaleX: isPc ? 1 : 0.5, scaleY: isPc ? 1 : 0.5 }, ease: "power4.out", scrollTrigger: st({ trigger: ".gh-about", endTrigger: ".gh-about-txtarea", start: "top 40%", end: "bottom 110%" }) });
    gsap.fromTo(sm, { pixi: { scaleX: isPc ? 1 : 0.5, scaleY: isPc ? 1 : 0.5 } }, { pixi: { scaleX: isPc ? 5 : 4, scaleY: isPc ? 5 : 4 }, ease: "power1.in", immediateRender: false,
      scrollTrigger: st({ trigger: ".gh-about-txtarea", endTrigger: ".gh-about-map", start: "bottom bottom", end: isPc ? "bottom bottom" : "top bottom" }) });
    gsap.timeline({ scrollTrigger: st({ trigger: ".gh-about", endTrigger: isPc ? ".gh-about" : ".gh-about-map", start: "top top", end: "bottom 110%" }) })
      .fromTo(circles, { pixi: { scaleX: 0, scaleY: 0 } }, { pixi: { scaleX: isPc ? 0.7 : 1, scaleY: isPc ? 0.7 : 1 }, stagger: 0.3, ease: "power1.in" });

    if (isPc) addEventListener("resize", () => {
      app.renderer.resize(document.documentElement.clientWidth, innerHeight);
      const w = app.screen.width, h = app.screen.height;
      [bg1, bg2, sm, ...circles, ...photos].forEach((o) => { o.x = w / 2; o.y = h / 2; });
      map.y = h / 2;
      ScrollTrigger.refresh();
    });
    ScrollTrigger.refresh();
  };
  // Like the original, shows the stage after the whole document is loaded
  if (document.readyState === "complete") startPixi(); else addEventListener("load", startPixi, { once: true });
})();
