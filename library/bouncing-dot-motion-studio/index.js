/* Home page — loader (two dot bounces → letters gather → logo moves to the header → curtain lifts), letter Lottie (lottie-play-pin part: plays the first 51 frames then stays pinned and ties 87 frames to 3480px of scroll),
   ”Watch reel” over the showreel follows the cursor late, growing .1 → 1 · click opens a large video window, capability section rises and slides in, blog cards rise, header panel color changes in the capability and blog sections.
   Original values: dot −20px .5s circ.out / 0 .2s circ.in / −18 .5 / 0 .2 · text 1.8s power4.out · logo .8s power4.out (width 90) · curtain height 0 .9s power4.out · Lottie at 2.7s */
(() => {
  const html = document.documentElement;
  const desk = innerWidth > 1024;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();

  // ── Letter Lottie: builds the same structure as the original creativity_full (1920×1080 · 29.97fps · 139 frames) using our own copy and font skin.
  //    0–30: both lines together rise per line from 390 below the mask window with cubic-bezier(.86,0,.16,1) and stop at 51 (original line group + rectangular mask).
  //    51–138: each letter turns into a separate layer, bounces upward and flies off spinning — the per-letter paths (PATHS) of the original are handed out to our letters from the left.
  //    The third line hidden below the screen (baseline 1368) rises from the bottom after 51 and flies across the screen. Font and color are read from the skin ──
  const ROWS = [
    { text: "A title runs", base: 740, fs: 300 },
    { text: "over two", base: 1033, fs: 300 },
    { text: "and moves", base: 1368, fs: 262 },
  ];
  const LEFT = 122, RISE = 390, RISE_END = 30, INTRO = 51, LAST = 139;
  // Path after 51 for each original glyph slot — [dx, dy, rotation°] at frame PF (relative to slot 51, 1920×1080 coordinates). Per line, starting from the leftmost letter.
  // The last two on the first line are a glyph that stays in place in the original and the 402 glyph that only floats up and stops
  const PF = [51, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 120, 130, 138];
  const PATHS = [
    [
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-8,-47,0,-14,-75,0,-54,-158,0,-99,-251,-1,-114,-342,-4,-100,-428,-9,-87,-520,-13,-75,-617,-18,-64,-719,-23,-26,-830,-34,1,-866,-42,23,-883,-53],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-8,-47,0,-17,-64,6,-39,-88,24,-63,-119,45,-89,-155,66,-119,-192,86,-132,-265,89,-145,-343,92,-159,-427,95,-191,-611,101,-224,-791,122,-218,-817,125],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,-3,0,36,-78,-21,115,-139,-69,219,-267,-145,307,-440,-229,364,-592,-314,401,-709,-373,285,-791,-325,178,-868,-278,-3,-953,-204,-46,-952,-190,-23,-982,-191],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-8,-47,0,-16,-202,-8,-90,-437,-27,-190,-702,-53,-291,-985,-80,-478,-1140,-20,-522,-1165,81,-451,-1072,150,-479,-1024,158,-480,-1041,159,-476,-1069,150,-476,-1075,149],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-8,-47,0,-33,-278,-28,-112,-539,-51,-185,-812,-75,-281,-1098,-101,-382,-1204,-80,-402,-1202,-76,-425,-1199,-72,-445,-1197,-70,-475,-1193,-70,-495,-1199,-66,-480,-1199,-68],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-7,-51,-1,-28,-239,-32,-89,-541,-56,-156,-885,-94,-255,-1203,-96,-299,-1217,-87,-325,-1201,-80,-347,-1195,-71,-369,-1189,-63,-406,-1180,-53,-401,-1192,-71,-401,-1192,-65],
      [0,0,0,0,0,0,0,0,0,0,0,0,-1,-15,3,-36,-246,-9,-73,-581,-33,-134,-983,-45,-208,-1223,-12,-242,-1248,8,-268,-1233,24,-291,-1222,32,-313,-1219,36,-350,-1227,38,-358,-1254,32,-351,-1253,32],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-11,-121,-9,-70,-427,-5,-157,-810,11,-242,-1215,31,-375,-1332,93,-388,-1335,92,-389,-1326,97,-400,-1312,101,-418,-1307,102,-458,-1310,99,-478,-1335,93,-472,-1334,93],
      [0,0,0,-1,-3,0,-2,-12,0,-5,-27,0,5,-112,-7,28,-349,-28,44,-718,-58,67,-1109,-89,56,-1191,-88,74,-1181,-93,73,-1173,-92,79,-1171,-93,93,-1162,-99,138,-1154,-128,153,-1153,-135,153,-1153,-135],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,1,-69,7,69,-364,76,141,-660,127,210,-1046,120,291,-1336,96,428,-1350,93,575,-1350,92,583,-1336,85,568,-1327,80,558,-1329,80,552,-1334,84,549,-1336,85],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,-36,0,0,-80,0,0,-125,0,0,-170,0,0,-214,0,0,-259,0,0,-304,0,0,-349,0,0,-393,0,0,-402,0,0,-402,0,0,-402,0,0,-402,0,0,-402,0,0,-402,0],
    ],
    [
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-18,-49,-6,-78,-83,-39,-111,-124,-72,-92,-174,-105,-83,-213,-132,-80,-251,-156,-84,-287,-175,-90,-329,-193,-98,-376,-211,-104,-482,-251,-108,-605,-295,-114,-717,-330],
      [0,0,0,0,0,0,0,0,0,0,0,0,-25,-53,-20,-66,-175,-57,-80,-207,-82,-91,-236,-110,-102,-292,-117,-114,-363,-114,-129,-428,-117,-145,-499,-119,-161,-577,-122,-196,-748,-127,-233,-932,-131,-232,-956,-134],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-9,-137,9,-30,-280,46,45,-311,1,205,-350,-22,370,-402,-40,535,-460,-59,688,-499,-35,807,-548,-5,816,-588,1,800,-650,5,773,-714,18,775,-762,17],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-22,-117,-12,-27,-320,-24,-9,-572,-61,-49,-894,-88,-90,-1237,-113,-221,-1402,-91,-342,-1408,-43,-431,-1410,-2,-467,-1403,17,-472,-1404,3,-480,-1432,-7,-475,-1438,0],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-7,-149,-6,1,-423,8,-22,-755,-1,-94,-1187,26,-176,-1549,57,-186,-1591,79,-200,-1564,94,-218,-1539,109,-240,-1516,121,-282,-1501,125,-298,-1549,109,-296,-1540,116],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-11,-124,-11,-11,-308,-52,22,-682,-76,44,-1106,-111,76,-1445,-150,62,-1483,-159,47,-1488,-159,23,-1454,-138,7,-1450,-141,15,-1459,-141,16,-1459,-142,14,-1458,-141],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-33,0,1,-227,9,-44,-519,0,-62,-883,-36,-63,-1274,-67,-14,-1467,-108,-29,-1462,-100,6,-1461,-114,13,-1458,-117,36,-1461,-114,40,-1467,-110,40,-1469,-108,40,-1469,-108],
      [0,0,0,-1,-3,0,-2,-12,0,-4,-27,0,-9,-152,2,-37,-474,-7,-31,-855,-30,42,-1265,-71,69,-1480,-86,94,-1483,-89,94,-1483,-89,100,-1481,-90,118,-1476,-93,121,-1483,-88,124,-1481,-90,124,-1481,-89],
    ],
    [
      [0,0,0,0,0,0,0,-2,0,7,-34,-4,29,-103,-28,107,-204,-75,182,-321,-125,247,-445,-175,302,-569,-225,357,-687,-274,419,-805,-324,490,-930,-374,565,-1069,-424,601,-1211,-455,586,-1304,-454,569,-1369,-450],
      [0,0,0,-1,-3,0,-2,-16,1,-9,-104,19,12,-303,-4,23,-540,-26,136,-624,-61,310,-707,-91,483,-798,-116,653,-857,-145,813,-854,-150,895,-878,-125,900,-895,-111,907,-946,-85,887,-993,-92,875,-1013,-90],
      [0,0,0,0,0,0,-1,-2,-1,3,-95,-22,35,-314,-45,73,-579,-66,83,-916,-93,15,-1321,-123,-57,-1713,-149,-146,-1748,-126,-213,-1735,-103,-277,-1726,-88,-321,-1707,-99,-362,-1717,-109,-371,-1751,-103,-364,-1749,-103],
      [0,0,0,0,0,0,0,0,0,-3,-47,-6,58,-249,7,106,-543,-2,145,-964,-2,189,-1440,-22,220,-1783,-36,281,-1777,-61,282,-1773,-62,286,-1764,-61,298,-1750,-58,323,-1715,-45,331,-1699,-40,326,-1695,-37],
      [0,0,0,0,0,0,0,0,0,-1,-86,-2,35,-267,-9,71,-577,-27,115,-992,-17,165,-1443,-16,250,-1748,-37,290,-1754,-42,282,-1744,-32,284,-1741,-33,288,-1733,-29,292,-1738,-25,291,-1738,-24,286,-1737,-22],
      [0,0,0,0,0,0,1,-18,-2,1,-133,-5,-2,-329,-9,14,-641,-27,72,-1058,-18,125,-1508,-16,192,-1807,-29,222,-1819,-35,216,-1813,-29,218,-1812,-27,230,-1807,-22,236,-1807,-23,237,-1807,-21,236,-1806,-20],
      [0,0,0,0,0,0,0,-2,0,-6,-107,-4,-12,-320,-12,13,-659,-30,64,-1074,-27,130,-1481,6,211,-1825,36,327,-1863,56,471,-1859,67,493,-1846,92,487,-1841,135,472,-1856,162,463,-1868,165,459,-1872,166],
      [0,0,0,0,0,0,-8,-10,-12,-22,-107,-5,-41,-337,4,-8,-686,22,61,-982,46,172,-1194,76,274,-1347,152,374,-1505,234,473,-1570,274,463,-1499,297,452,-1438,321,427,-1329,368,397,-1239,416,360,-1209,425],
    ],
  ];
  const toRgb = (c) => { const x = document.createElement("canvas").getContext("2d"); x.fillStyle = c; const h = x.fillStyle; return h.startsWith("#") ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) : [0, 0, 0]; };
  // Skin’s computed color (including oklch, color-mix) to an rgb GSAP can blend — paint one point and read it
  const solid = (c) => { const x = document.createElement("canvas").getContext("2d", { willReadFrequently: true }); x.fillStyle = c; x.fillRect(0, 0, 1, 1); const [r, g, b] = x.getImageData(0, 0, 1, 1).data; return `rgb(${r}, ${g}, ${b})`; };
  function lettersData() {
    const fam = css("--kf-font-display").split(",")[0].replace(/["']/g, "").trim() || "sans-serif";
    const ctx = document.createElement("canvas").getContext("2d");
    const ink = toRgb(css("--kf-ink"));
    const still = (k) => ({ a: 0, k });
    const lin = { o: { x: [0], y: [0] }, i: { x: [1], y: [1] } };
    const rise = { o: { x: [0.86], y: [0] }, i: { x: [0.16], y: [1] } };
    const text = (ch, fs, extra) => ({ ddd: 0, ty: 5, nm: ch, sr: 1, ao: 0, bm: 0, st: 0,
      ...extra, t: { d: { k: [{ s: { s: fs, f: "rxFont", t: ch, j: 0, tr: 0, lh: fs, ls: 0, fc: ink }, t: 0 }] }, p: {}, m: { g: 1, a: still([0, 0]) }, a: [] } });
    const keys = (val) => PF.map((t, i) => ({ t, s: val(i), ...(i < PF.length - 1 ? lin : {}) }));
    const assets = [], intro = [], fly = [];
    ROWS.forEach((row, r) => {
      ctx.font = `500 ${row.fs}px "${fam}", "Pretendard Variable", sans-serif`;
      const glyphs = [];
      let x = LEFT;
      for (const ch of row.text) { const w = ctx.measureText(ch).width; if (ch !== " ") glyphs.push({ ch, x, w }); x += w; }
      if (r < 2) {
        assets.push({ id: "row" + r, nm: "Line " + (r + 1), layers: glyphs.map((g, i) => text(g.ch, row.fs, { ind: i + 1, ip: 0, op: LAST,
          ks: { o: still(100), r: still(0), p: still([g.x, row.base, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]) } })) });
        const winTop = row.base - row.fs, winBot = row.base + row.fs * 0.24;
        intro.push({ ddd: 0, ty: 4, nm: "Cover panel " + (r + 1), td: 1, sr: 1, ao: 0, bm: 0, ip: 0, op: INTRO, st: 0,
          ks: { o: still(100), r: still(0), p: still([960, (winTop + winBot) / 2, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]) },
          shapes: [{ ty: "gr", it: [{ ty: "rc", d: 1, p: still([0, 0]), s: still([1920, winBot - winTop]), r: still(0) }, { ty: "fl", c: still([1, 1, 1, 1]), o: still(100), r: 1 },
            { ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100) }] }] });
        intro.push({ ddd: 0, ty: 0, nm: "Line " + (r + 1), tt: 1, refId: "row" + r, sr: 1, ao: 0, bm: 0, w: 1920, h: 1080, ip: 0, op: INTRO, st: 0,
          ks: { o: still(100), r: still(0), a: still([960, 540, 0]), s: still([100, 100, 100]), p: { a: 1, k: [{ t: 0, s: [960, 540 + RISE, 0], ...rise }, { t: RISE_END, s: [960, 540, 0] }] } } });
      }
      const slots = PATHS[r], cy = row.base - row.fs * 0.3;
      glyphs.forEach((g, j) => {
        const path = slots[glyphs.length > 1 ? Math.round((j * (slots.length - 1)) / (glyphs.length - 1)) : 0], cx = g.x + g.w / 2;
        fly.push(text(g.ch, row.fs, { ip: INTRO, op: LAST,
          ks: { o: still(100), s: still([100, 100, 100]), a: still([g.w / 2, -row.fs * 0.3, 0]),
            p: { a: 1, k: keys((i) => [cx + path[i * 3], cy + path[i * 3 + 1], 0]) }, r: { a: 1, k: keys((i) => [path[i * 3 + 2]]) } } }));
      });
    });
    const layers = [...intro, ...fly].map((l, i) => ({ ...l, ind: i + 1 }));
    return { v: "5.12.1", fr: 29.97, ip: 0, op: LAST, w: 1920, h: 1080, nm: "Character", ddd: 0, assets, fonts: { list: [{ fName: "rxFont", fFamily: fam, fStyle: "Medium", ascent: 72 }] }, layers, markers: [] };
  }

  // When the part finishes its previous playback (or isn’t pinned because the width is 1024 or less), unlock and go to the top — original unlockScroll
  const hero = document.querySelector(".rx-hero"), dataEl = document.getElementById("rx-letters-data");
  hero?.addEventListener("fx:unlock", () => { html.classList.remove("is-locked"); window.scrollTo(0, 0); rx.smoother?.scrollTo(0, false); });
  const startLetters = () => {
    if (!hero || !window.kfFx || !window.lottie) { html.classList.remove("is-locked"); return; }
    if (desk && dataEl) dataEl.textContent = JSON.stringify(lettersData());
    hero.dispatchEvent(new CustomEvent("fx:play"));
  };
  // The part attaches after DOMContentLoaded — an fx:play fired before that has no receiver
  const afterFx = (fn) => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => setTimeout(fn, 0), { once: true }) : setTimeout(fn, 0));

  // ── Loader ──
  const loader = document.querySelector(".rx-loader");
  const L = (s) => loader.querySelector(s);
  html.classList.add("is-locked");
  function headLogoTo() {
    const big = loader.querySelector(".rx-logo"), dest = document.querySelector(".rx-head .rx-logo");
    const a = dest.getBoundingClientRect(), r = big.getBoundingClientRect();
    gsap.to(big, { duration: 0.8, x: a.left - r.left, y: a.top - r.top, scale: a.width / r.width, transformOrigin: "0 0", ease: "power4.out" });
  }
  function runLoader() {
    if (reduce) { loader.remove(); rx.headIn(true); afterFx(startLetters); return; }
    gsap.set([L(".l-a"), L(".l-k")], { x: 60, opacity: 0 });
    gsap.set(L(".l-r"), { x: -40 });
    gsap.set([L(".l-m"), L(".l-dot")], { x: (i) => (i ? -140 : 120) });
    const tl = gsap.timeline({
      onComplete: () => {
        headLogoTo();
        gsap.to(".rx-loader .rx-logo", { color: css("--kf-ink"), duration: 0.4, ease: "circ.out", delay: 0.2 });
        gsap.to(loader, { height: "0%", duration: 0.9, ease: "power4.out", onComplete: () => loader.remove() });
        rx.headIn(true);
      },
    });
    const dot = L(".l-dot");
    tl.to(dot, { y: 0, duration: 0, ease: "circ.out" }, "<+=0")
      .to(dot, { y: "-20px", duration: 0.5, ease: "circ.out" })
      .to(dot, { y: "0px", duration: 0.2, ease: "circ.in" })
      .to(dot, { y: "-18px", duration: 0.5, ease: "circ.out" })
      .to(dot, { y: "0px", duration: 0.2, ease: "circ.in" })
      .to([L(".l-m"), dot, L(".l-r")], { x: 0, duration: 1.8, ease: "power4.out" }, "+=0.18")
      .to([L(".l-a"), L(".l-k")], { x: 0, opacity: 1, duration: 1, ease: "circ.out" }, "<+=0.25");
    setTimeout(() => afterFx(startLetters), 2700);
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(runLoader);

  // ── Showreel: on hover, ”Watch showreel” follows the cursor late (lerp .1) and grows .1 → 1 ──
  const reel = document.querySelector(".rx-reel__box"), fol = document.querySelector(".rx-reel__follow");
  if (reel && desk) {
    const st = { tx: { p: 0, c: 0, a: 0.1 }, ty: { p: 0, c: 0, a: 0.1 }, sc: { p: 0.1, c: 0.1, a: 0.1 } };
    reel.addEventListener("mousemove", (e) => {
      const b = reel.getBoundingClientRect();
      st.tx.c = e.clientX - b.left - fol.offsetWidth / 2; st.ty.c = e.clientY - b.top - fol.offsetHeight / 2;
    });
    reel.addEventListener("mouseenter", (e) => { reel.classList.add("is-on"); st.sc.c = 1; const b = reel.getBoundingClientRect(); st.tx.p = e.clientX - b.left - fol.offsetWidth / 2; st.ty.p = e.clientY - b.top - fol.offsetHeight / 2; });
    reel.addEventListener("mouseleave", () => { reel.classList.remove("is-on"); st.sc.c = 0.1; });
    gsap.ticker.add(() => {
      for (const k in st) st[k].p += (st[k].c - st[k].p) * st[k].a;
      fol.style.transform = `translateX(${st.tx.p}px) translateY(${st.ty.p}px) scale(${st.sc.p})`;
    });
  }

  // ── Showreel big video window: clicking the showreel covers the screen at once with an ink-colored window with no curve, after .5s focus goes to the close button and the full video plays, closing (press · Esc · Enter · Space) stops it and withdraws immediately — original Reel·ReelPopup ──
  const pop = document.querySelector(".rx-reelpop");
  if (reel && pop) {
    const film = pop.querySelector("video"), shut = pop.querySelector(".rx-reelpop__close");
    let wait = [];
    const open = () => {
      pop.classList.add("is-active");
      pop.setAttribute("aria-hidden", "false");
      wait = [setTimeout(() => shut.focus(), 500), setTimeout(() => { film.preload = "auto"; film.play()?.catch?.(() => {}); }, 500)];
    };
    const close = () => {
      wait.forEach(clearTimeout);
      film.pause();
      pop.classList.remove("is-active");
      pop.setAttribute("aria-hidden", "true");
    };
    reel.addEventListener("click", open);
    shut.addEventListener("click", close);
    shut.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // ── Capabilities section (original capabilities-pinner — only the name says pinner, there is no pinning): when the section enters view the title rises from 50px below, and the video from 50px below and transparent, over 1s power4.out,
  //    when the paragraph comes in, each line rises from 50px below at .15 intervals (.5s), and list text slides in from -100% left over 1s power4.out at .15 intervals, .2 later.
  //    When the top edge of the section reaches 20% of the screen, the header panel turns to the section background (gray-brown) ──
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: ".rx-caps", once: true, end: "top 20%", onEnter: () => {
      gsap.to(".rx-caps__pre", { y: "0%", duration: 1, ease: "power4.out" });
      gsap.to(".rx-caps__video", { y: "0%", opacity: 1, duration: 1, ease: "power4.out" });
    } });
    ScrollTrigger.create({ trigger: ".rx-caps__para", once: true, end: "top 50%", onEnter: () => {
      gsap.to(".rx-caps__para .rx-caps__inner", { y: "0%", opacity: 1, stagger: 0.15 });
      gsap.to(".rx-caps__cap", { x: "0%", opacity: 1, duration: 1, ease: "power4.out", stagger: 0.15, delay: 0.2 });
    } });
    gsap.timeline({ scrollTrigger: { trigger: ".rx-caps", start: "top 20%", end: "+=50", scrub: 0 } }).to(".rx-head", { backgroundColor: solid(getComputedStyle(document.querySelector(".rx-caps")).backgroundColor), duration: 0.3, ease: "none" });
  });

  // ── Blog: when a section’s top edge hits 80% of the screen, the chunks rise from 50px below at .1 stagger, .8s power4.out, at 20% the header panel turns gray ──
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.to(".rx-blog__rise", { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power4.out", scrollTrigger: { trigger: "#rx-blog", start: "top 80%" } });
    gsap.timeline({ scrollTrigger: { trigger: "#rx-blog", start: "top 20%", end: "+=50", scrub: 0 } }).to(".rx-head", { backgroundColor: css("--kf-raised"), duration: 0.3, ease: "none" });
  });
  mm.add("(max-width: 1024px), (prefers-reduced-motion: reduce)", () => gsap.set(".rx-blog__rise", { y: 0, opacity: 1 }));
})();
