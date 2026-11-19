// First page — logo intro → green ground, hero strip flow·mask·parallax, promise card pill, gallery slide, recruiting card pop
(() => {
  const { wait, mobile, reduce, onScroll, scrollY, bloomMark } = window.yt;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ground = $("[data-ground]"), intro = $("[data-intro]"), logoEl = $("[data-intro-logo]"), topSvg = $("[data-intro-top]");
  const kv = $("[data-kv]"), kvImgs = $$(".kv-img", kv), kvTitle = $("[data-kv-title]");
  const rand = (a, b) => a + (b - a) * Math.random();

  /* ── Green ground position: width is 1820/1440 of the screen (phone 540/390), top edge is 165/1440 of the width above the bottom of the screen (phone 72/390 × .95) ── */
  const groundLayout = () => {
    const m = mobile(), w = innerWidth * (m ? 540 / 390 : 1820 / 1440), h = innerWidth * (m ? 72 / 390 : 165 / 1440);
    return { width: w, x: (innerWidth - w) / 2, y: innerHeight - h * (m ? 0.95 : 1) };
  };

  /* ── Loader (original homeSymbol) ── */
  const runIntro = async () => {
    // The bottom bean is a ground element attached to the screen from the start — placed at the logo spot, then grows into the ground as it is
    const r = topSvg.getBoundingClientRect();
    gsap.set(ground, { width: r.width * 0.98, x: r.left + r.width * 0.01, y: r.bottom + r.width * 0.04 });
    if (reduce) {
      intro.remove();
      gsap.set(ground, groundLayout());
      return window.yt.fadeIn();
    }
    await wait(100);
    bloomMark(logoEl);
    bloomMark(ground, { text: false });
    await wait(800 + 1300);
    wait(200).then(() => {
      const letters = $$(".intro__text > *");
      gsap.to(".intro__text", { opacity: 0, duration: 0.4, delay: 0.1, ease: "power2.inOut" });
      gsap.to(letters, { y: -50, duration: 0.7, ease: "power3.inOut" });
    });
    wait(600).then(() => window.yt.fadeIn());
    const g = groundLayout(), gr = ground.getBoundingClientRect(), scale = g.width / gr.width, ease = { duration: 1.8, ease: "power4.inOut" };
    gsap.to(ground, { ...g, ...ease });
    const tr = topSvg.getBoundingClientRect();
    gsap.to(topSvg, { scale, x: g.x - tr.left, y: -(tr.top + tr.height * scale * 1.1), transformOrigin: "top left", ...ease });
    gsap.to(topSvg, { opacity: 0, duration: 1.1, delay: 0.4, ease: "power2.inOut" });
    await wait(1800);
    intro.remove();
    groundMotion();
  };

  /* ── The ground breathes (original startSymbolRandomMotion): tilts 1~4° and scales .95~1.1, drifts 2~4% of the width sideways — the gallery head bean moves along too ── */
  const groundMotion = () => {
    const els = [ground.querySelector("svg"), $("[data-gallery-move]")].filter(Boolean);
    const loop = (prop, pick, time, dir, toggle, ease) => {
      const go = (d) => gsap.to(els, { [prop]: pick(d), duration: rand(...time), delay: prop === "scale" ? 0 : rand(0, prop === "x" ? 0 : 1), ease, onComplete: () => go(toggle ? -d : d) });
      go(dir);
    };
    loop("rotation", (d) => rand(1, 4) * d, [3, 8], 1, true, "power1.inOut");
    loop("scale", () => rand(0.95, 1.1), [3, 8], 1, false, "power1.inOut");
    loop("x", (d) => rand(0.02, 0.04) * innerWidth * d, [5, 8], -1, true, "power0.in");
  };
  addEventListener("resize", () => { if (!intro.isConnected) gsap.set(ground, groundLayout()); });

  /* ── Hero: the band flows at 0.01px/ms (original InfiniteLoop speed 1) with per-cell parallax ── */
  const loops = [];
  const makeLoop = (strip, track, items) => {
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("[data-fx]").forEach((n) => n.removeAttribute("data-fx"));
    clone.querySelectorAll(".yt-ill").forEach((n) => { n.innerHTML = ""; window.yt.drawIll(n); });
    strip.appendChild(clone);
    const parts = [...items, ...$$(".kv-img, .kv-ill", clone)].map((el) => ({ el, body: el.querySelector(".kv-img__body") || el, power: +el.dataset.power || 0 }));
    return { strip, tracks: [track, clone], parts, x: 0, w: track.offsetWidth };
  };
  const imgLoop = makeLoop($("[data-kv-loop]"), $("[data-kv-track]"), kvImgs);
  const illLoop = makeLoop($("[data-kv-illoop]"), $("[data-kv-iltrack]"), $$(".kv-ill", kv));
  loops.push(imgLoop, illLoop);
  addEventListener("resize", () => loops.forEach((l) => { l.w = l.tracks[0].offsetWidth; }));
  let kvIn = true, playing = false, ending = false, last = 0;
  new IntersectionObserver(([e]) => { kvIn = e.isIntersecting; }).observe(kv);
  const tick = () => {
    const now = performance.now(), dt = last ? Math.max(1, now - last) : 16.7;
    last = now;
    if (!playing) return;
    loops.forEach((l) => {
      l.x -= dt * 0.01;
      if (-l.x >= l.w) l.x = 0;
      l.tracks.forEach((t) => { t.style.transform = `translate3d(${l.x}px,0,0)`; });
      const p = -l.x / l.w;
      l.parts.forEach((s) => { if (s.power) s.body.style.transform = `translate3d(${-p * l.w * s.power}px,0,0)`; });
    });
    // In the original, once the first strip fully passes the screen edge, it clears in 1s and resets to the start, then shows again at 1.8s
    if (!ending && -imgLoop.x / (imgLoop.w - innerWidth) >= 1) {
      ending = true;
      gsap.to([imgLoop.strip, illLoop.strip], { opacity: 0, duration: 1, onComplete: () => { loops.forEach((l) => { l.x = 0; }); gsap.to([imgLoop.strip, illLoop.strip], { opacity: 1, duration: 1.8, ease: "power2.inOut" }); ending = false; } });
    }
  };
  if (!reduce) gsap.ticker.add(tick);

  const firstView = () => {
    kvImgs.filter((el) => +el.dataset.i <= 5).forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.out", delay: i * 0.1 });
      gsap.fromTo(el, { scale: 0 }, { scale: 1, duration: 1.5, ease: "elastic.out(1, 0.6)", delay: i * 0.1 });
    });
    gsap.to(kvTitle, { opacity: 1, duration: 1, delay: 0.5, ease: "power2.inOut" });
    gsap.to(kvTitle, { scale: 1, duration: 1.5, delay: 0.4, ease: "power3.inOut" });
    playing = !reduce;
    // Photo mask: cells start staggered by 0.5s, and every 4s one of stem, right bump or left bump, different from last time, runs for 2s
    if (!reduce) kvImgs.forEach((el, i) => setTimeout(() => {
      const once = () => {
        const next = ["is-scale-down", "is-rotate-r", "is-rotate-l"].filter((c) => c !== el.dataset.before);
        const c = next[Math.floor(Math.random() * next.length)];
        el.classList.add(c);
        setTimeout(() => { el.dataset.before = c; el.classList.remove(c); }, 2000);
      };
      once();
      setInterval(once, 4000);
    }, i * 500 + Math.random() * 1000));
  };
  if (!reduce) { gsap.set(kvImgs.filter((el) => +el.dataset.i <= 5), { scale: 0, opacity: 0 }); gsap.set(kvTitle, { scale: 1.08, opacity: 0 }); }
  window.yt.onReady(firstView);

  // As you scroll down the band shifts up 10% while growing and fading, the title rises 25%
  const kvTop = () => kv.getBoundingClientRect().top + scrollY();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  if (!reduce) onScroll((y) => {
    if (!kvIn) return;
    const d = (y - kvTop()) / kv.offsetHeight, r = Math.max((d - 0.2) / 0.8, 0), s = clamp((d - 0.2) / 0.6);
    imgLoop.strip.style.transform = `translate3d(0,${r * -10}%,0) scale(${1 + d * 0.18})`;
    imgLoop.strip.style.opacity = `${1 - s}`;
    illLoop.strip.style.transform = `translate3d(0,${d * -10}%,0) scale(${1 + d * 0.1})`;
    illLoop.strip.style.opacity = `${1 - d * 0.2}`;
    $("[data-kv-titlewrap]").style.transform = `translate3d(0,${d * -25}%,0)`;
  });

  // Scroll pill: letters rise one by one at .025s (.6s), then all drop together after 1s, repeating, and it stops when scrolling down
  const pill = $("[data-kv-scroll]"), letters = $$("span", pill);
  let pillTl = null;
  const pillLoop = () => { pillTl?.kill(); pillTl = gsap.timeline({ repeat: -1 }).set(letters, { yPercent: 100, opacity: 0 }).to(letters, { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.inOut", stagger: 0.025 }).to(letters, { delay: 1, yPercent: -100, opacity: 0, duration: 0.4, ease: "power1.inOut" }); };
  window.yt.onReady(async () => { await wait(500); pill.classList.add("is-in"); if (scrollY() <= 50 && !reduce) pillLoop(); });
  let scrolled = false;
  onScroll((y) => { const s = y > 50; if (s === scrolled) return; scrolled = s; pill.classList.toggle("is-scrolled", s); s ? pillTl?.kill() : pill.classList.contains("is-in") && !reduce && pillLoop(); });

  /* ── Promise card pill: the current card’s name slot opens in .4s and the others collapse in .3s ── */
  const cards = $("[data-promise-cards]"), pills = $$(".promise__pill");
  let idx = -1;
  const setPill = () => pills.forEach((p, i) => {
    const t = p.querySelector(".promise__pill-t"), on = i === idx;
    p.setAttribute("aria-current", String(on));
    gsap.to(t, { width: on ? t.firstElementChild.getBoundingClientRect().width : 0, duration: on ? 0.4 : 0.3, ease: on ? "power2.inOut" : "power2.out", overwrite: true });
  });
  gsap.set($$(".promise__pill-t"), { width: 0 });
  // The card picture blooms from 0 with elastic.out(.2,.27) only when the current card moves to the front
  const cardIlls = $$(".pcard__ill", cards);
  if (!reduce) gsap.set(cardIlls, { scale: 0, opacity: 0 });
  onScroll((y) => {
    const v = (y + innerHeight - (cards.getBoundingClientRect().top + y)) / cards.offsetHeight;
    let c = -1;
    if (v >= 0) c = 0;
    if (v >= 0.45 && v < 0.8) c = 1;
    if (v >= 0.8) c = 2;
    if (c === idx) return;
    const prev = idx;
    idx = c;
    setPill();
    cardIlls.forEach((el, i) => {
      if (reduce) return;
      if (c === -1) return gsap.set(el, { scale: 0, opacity: 0 });
      if (i === c && c > prev) { gsap.to(el, { opacity: 1, duration: 0.5, delay: 0.1, ease: "power2.inOut" }); gsap.to(el, { scale: 1, duration: 1.5, delay: 0.1, ease: "elastic.out(0.2, 0.27)" }); }
    });
  });

  /* ── Gallery: photos swap every 5s, once the top blob passes half the screen the pinned ground is hidden, the bottom blob scales up to 2.68x with scroll ── */
  const photos = $$(".gallery__item");
  let pi = 0, gTimer = null;
  new IntersectionObserver(([e]) => {
    clearInterval(gTimer);
    if (e.isIntersecting && !reduce) gTimer = setInterval(() => { photos[pi].classList.remove("is-active"); pi = (pi + 1) % photos.length; photos[pi].classList.add("is-active"); }, 5000);
  }).observe($("[data-gallery-photos]"));
  const bean = $("[data-gallery-bean]");
  onScroll(() => ground.classList.toggle("is-off", bean.getBoundingClientRect().top < innerHeight * 0.5));
  const bottom = $("[data-gallery-bottom]"), bottomImg = $("[data-gallery-bottom-img]");
  if (!reduce) onScroll(() => {
    const r = bottom.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = clamp((innerHeight - r.top) / (r.height + innerHeight));
    bottomImg.style.transform = `translate3d(0,${p * bottomImg.clientHeight * -0.5}px,0) scale(${p * 1.677 + 1})`;
  });

  /* ── Careers: two lines of balloon letters flow in opposite directions, and in the order 1·2·0·3·4 one piece pops 20~25% and turns 8~16° before returning ── */
  const rec = $("[data-rec]");
  const BALLOON = ["M20 0h60a20 20 0 0 1 20 20v60a20 20 0 0 1-20 20H20A20 20 0 0 1 0 80V20A20 20 0 0 1 20 0Z", "M50 0C80 0 100 22 100 50S80 100 50 100 0 78 0 50 20 0 50 0Z", "M30 0h40c17 0 30 13 30 30 0 12-7 18-7 20s7 8 7 20c0 17-13 30-30 30H30C13 100 0 87 0 70c0-12 7-18 7-20S0 42 0 30C0 13 13 0 30 0Z", "M24 0h52c13 0 24 11 24 24v8c0 8-8 10-8 18s8 10 8 18v8c0 13-11 24-24 24H24C11 100 0 89 0 76V24C0 11 11 0 24 0Z"];
  $$("[data-rec-bg]", rec).forEach((row, r) => { row.innerHTML = Array.from({ length: 9 }, (_, i) => `<svg viewBox="0 0 ${i % 3 ? 100 : 70} 100" preserveAspectRatio="none"><path d="${BALLOON[(i + r) % BALLOON.length]}"/></svg>`).join(""); });
  const recLoops = $$("[data-rec-row]", rec).map((row, i) => {
    const t = row.firstElementChild, c = t.cloneNode(true);
    row.appendChild(c);
    return { t: [t, c], w: t.offsetWidth, x: i === 0 ? 0 : -t.offsetWidth, dir: i === 0 ? -1 : 1 };
  });
  let recIn = false, recLast = 0;
  const recTick = () => {
    const now = performance.now(), dt = recLast ? Math.max(1, now - recLast) : 16.7;
    recLast = now;
    if (!recIn) return;
    recLoops.forEach((l) => {
      l.x += dt * 0.01 * (l.dir === -1 ? -1 : 1);
      if (l.dir === -1 && -l.x >= l.w) l.x = 0;
      if (l.dir === 1 && l.x >= 0) l.x = -l.w;
      l.t.forEach((t) => { t.style.transform = `translate3d(${l.x}px,0,0)`; });
    });
  };
  const rcards = $$(".rcard", rec), ORDER = [1, 2, 0, 3, 4], DIR = [-1, 1, -1, 1, 1];
  let ci = 0, rTimer = null;
  const jump = (i) => {
    const v = { x: 0, y: 0, r: 0 }, put = () => { rec.style.setProperty("--x", `${v.x.toFixed(2)}%`); rec.style.setProperty("--y", `${v.y.toFixed(2)}%`); rec.style.setProperty("--rotate", `${v.r.toFixed(2)}deg`); };
    rcards.forEach((c) => c.classList.remove("is-active"));
    rcards[i].classList.add("is-active");
    gsap.timeline().to(v, { x: rand(20, 25) * DIR[i], y: -rand(20, 25), r: rand(8, 16) * DIR[i], duration: 0.9, ease: "elastic.out(1, 0.6)", onUpdate: put }).to(v, { x: 0, y: 0, r: 0, duration: 1.2, ease: "elastic.inOut(0.8, 0.8)", onUpdate: put });
    ci = (ci + 1) % rcards.length;
  };
  if (!reduce) {
    gsap.ticker.add(recTick);
    new IntersectionObserver(([e]) => {
      recIn = e.isIntersecting;
      clearInterval(rTimer);
      if (recIn) { jump(ORDER[ci]); rTimer = setInterval(() => jump(ORDER[ci]), 3000); }
    }).observe(rec);
  }

  runIntro();
})();
