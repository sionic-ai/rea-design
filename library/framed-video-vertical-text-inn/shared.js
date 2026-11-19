// Motion spanning multiple pages — original values as is:
// Loader act = Page transition (cover .6s power2.out + stamp .5 → wipe after .5s, 3.75s linear), header states (hero .25/.7 · footer .8 threshold),
// Night↔paper background and body erase (footer · ratio at bottom edge of night zone), hero screen saver (7.5s), booking window, phone English|Korean toggle, this month’s video playlist.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const header = document.querySelector(".tw-header");
  const main = document.querySelector("main");
  const footer = document.querySelector(".tw-footer");
  const isSP = () => window.matchMedia("(max-width: 767px)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isIndex = !!document.querySelector("[data-fv]");
  const TW = (window.TW = { isSP, reduce, isIndex, ready: [], fvNatural: 0 });
  const sineIn = gsap.parseEase("sine.in"), expoOut = gsap.parseEase("expo.out");
  const inThenOut = (t) => expoOut(sineIn(t));

  /* ---------- Header menu: hero type (English x15→0 · Korean y30→0, letter-spacing .8/2.4→.2), normal type (y15→0, Korean letter-spacing .8→.2), hide .75s (screen saver 3.5s) ---------- */
  const enItems = [...document.querySelectorAll(".tw-nav__en li")];
  const jaItems = [...document.querySelectorAll(".tw-nav__ja li")];
  let navState = "";
  let navTl;
  const navLinks = (on) => [...enItems, ...jaItems].forEach((li) => li.querySelector("a") && (li.querySelector("a").style.pointerEvents = on ? "" : "none"));
  function navFv() {
    if (navState === "fv") return;
    navState = "fv";
    navTl?.kill();
    navTl = gsap.timeline();
    if (isSP()) return;
    navLinks(true);
    enItems.forEach((el, i) => {
      navTl.set(el, { x: 15, y: 0, "--en-ls": 0.8, opacity: 0 }, 0)
        .to(el, { x: 0, "--en-ls": 0.2, opacity: 1, duration: 1, ease: "power2.out" }, 0.1 * i);
    });
    jaItems.forEach((el, i) => {
      const at = 0.1 * i + 0.1;
      navTl.set(el, { x: 0, y: 30, opacity: 0, "--ja-ls": 2.4 }, 0)
        .to(el, { y: 0, duration: 1, ease: "expo.out" }, at)
        .to(el, { opacity: 1, duration: 1, ease: "sine.inOut" }, at)
        .to(el, { "--ja-ls": 0.2, duration: 1, ease: "expo.out" }, at);
    });
  }
  function navNormal(delay = 0) {
    if (navState === "normal") return;
    navState = "normal";
    navTl?.kill();
    navTl = gsap.timeline();
    if (isSP()) return;
    navLinks(true);
    enItems.forEach((el, i) => {
      navTl.set(el, { x: 0, y: 15, opacity: 0, "--en-ls": 0.2 }, delay)
        .to(el, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0.1 * i + delay);
    });
    jaItems.forEach((el, i) => {
      navTl.set(el, { x: 0, y: 15, opacity: 0, "--ja-ls": 0.8 }, 0)
        .to(el, { y: 0, opacity: 1, "--ja-ls": 0.2, duration: 1, ease: "power2.out" }, 0.1 * i + delay);
    });
  }
  function navHide(idle = false) {
    if (navState === "hide") return;
    navState = "hide";
    navTl?.kill();
    navTl = gsap.timeline();
    if (isSP()) return;
    const dur = idle ? 3.5 : 0.75;
    const items = [...enItems, ...jaItems];
    navTl.to(items, { opacity: 0, duration: dur, ease: idle ? "expo.out" : "sine.inOut", onComplete: () => navLinks(false) }, 0)
      .to(items, { y: -15, duration: dur, ease: idle ? "sine.out" : inThenOut }, 0);
  }

  /* Header states: fv (hero type) · fvHide/footerHide (hidden) · normal (normal type) */
  let headState = "";
  TW.setHead = (next, delay = 0) => {
    if (headState === next) return;
    headState = next;
    if (next === "fv") {
      header.classList.add("is-fv");
      header.classList.remove("is-up");
      navFv();
    } else if (next === "normal") {
      header.classList.remove("is-fv", "is-up");
      navNormal(delay);
    } else {
      header.classList.add("is-up");
      header.classList.remove("is-open");
      navHide();
    }
  };

  /* ---------- Header wordmark: each letter starts 3px × rank outside, in order of rank farthest from the center, and gathers in with 3s expo.out while appearing, when hiding, .5s power2.out ---------- */
  const mark = document.querySelector(".tw-wordmark");
  let glyphs = [];
  if (mark) {
    const text = mark.textContent;
    mark.textContent = "";
    glyphs = [...text].map((ch) => mark.appendChild(Object.assign(document.createElement("span"), { className: "tw-glyph", textContent: ch })));
  }
  let markOn = false, markTw;
  function markShow(on) {
    if (!glyphs.length || on === markOn) return;
    markOn = on;
    markTw?.kill();
    if (!on) { markTw = gsap.to(glyphs, { opacity: 0, duration: 0.5, ease: "power2.out" }); return; }
    const box = mark.getBoundingClientRect(), mid = box.left + box.width / 2;
    const info = glyphs.map((g) => { const r = g.getBoundingClientRect(), c = r.left + r.width / 2; return { g, dist: Math.abs(c - mid), dir: c < mid ? -1 : 1 }; });
    [...info].sort((a, b) => a.dist - b.dist).forEach((o, i) => (o.x = o.dir * 3 * i));
    markTw = gsap.fromTo(glyphs, { x: (i) => info[i].x, opacity: 0 }, { x: 0, opacity: 1, duration: reduce ? 0 : 3, ease: "expo.out" });
  }

  /* ---------- Vertical reserve labels on both sides: when below Hero ratio .6 · Footer ratio .7 they slip 10px up (.5s sine.inOut), otherwise they float up from 10px below ---------- */
  const sides = [...document.querySelectorAll(".tw-side a")];
  let sideOn = null;
  function sideShow(on) {
    if (!sides.length || on === sideOn) return;
    sideOn = on;
    gsap.killTweensOf(sides);
    if (on) gsap.fromTo(sides, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "sine.inOut", onStart: () => sides.forEach((a) => (a.style.pointerEvents = "all")) });
    else { sides.forEach((a) => (a.style.pointerEvents = "none")); gsap.to(sides, { opacity: 0, y: -10, duration: 0.5, ease: "sine.inOut" }); }
  }

  /* ---------- Icons (sound, fullscreen): Hero (e < .25) and footer end (footer ratio < .05) only, lifts 10px over .5s sine.inOut ---------- */
  const sound = document.querySelector(".tw-sound");
  const fullIcon = document.querySelector(".tw-full");
  let iconsOn = null;
  function icons(on) {
    if (iconsOn === on) return;
    iconsOn = on;
    if (sound) {
      gsap.killTweensOf(sound);
      if (on) gsap.fromTo(sound, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "sine.inOut", onComplete: () => (sound.style.pointerEvents = "") });
      else { sound.style.pointerEvents = "none"; gsap.to(sound, { opacity: 0, y: 10, duration: 0.5, ease: "sine.inOut" }); }
    }
    fullIcon?.classList.toggle("is-show", on);
  }
  if (sound) gsap.set(sound, { opacity: 0, pointerEvents: "none" });

  /* ---------- Night↔paper: the hero turns paper past ratio .6, after that it turns night when the bottom edge of a [data-dark] element (footer or night section) is at ratio .5 or below ---------- */
  const darkEl = document.querySelector("[data-dark]") || footer;
  const setLight = (on) => body.classList.toggle("is-light", on);
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  function bottomRatio(el, div) {
    const r = el.getBoundingClientRect();
    const k = r.height / div;
    return clamp01((r.bottom - window.innerHeight - k) / k);
  }

  /* ---------- Hero screen saver: after 7.5s with no input at the very top, the menu, labels and icons fade out over 3.5s, and come back on movement ---------- */
  let idleTimer = null, idleOn = false, active = true;
  const idleEvents = ["mousemove", "keydown", "touchstart", "touchmove", "touchend", "resize", "scroll"];
  function poke() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, 7500);
    if (active) return;
    active = true;
    body.classList.remove("is-idle");
    if (headState === "fv") { navState = ""; navFv(); }
    if (TW.fvNatural < 0.25) icons(true);
  }
  function goIdle() {
    if (!active) return;
    active = false;
    body.classList.add("is-idle");
    header.classList.remove("is-open");
    navHide(true);
    icons(false);
  }
  function idleWatch(on) {
    if (on === idleOn) return;
    idleOn = on;
    idleEvents.forEach((ev) => (on ? window.addEventListener(ev, poke, { passive: true }) : window.removeEventListener(ev, poke)));
    if (on) poke();
    else { clearTimeout(idleTimer); if (!active) { active = true; body.classList.remove("is-idle"); } }
  }

  /* ---------- Per scroll: hero ratio → header·background, then footer ratio → header·body hidden·icon, night section ratio → background ---------- */
  let fvDelayDone = !isIndex;
  function update() {
    const natural = window.scrollY / window.innerHeight;
    TW.fvNatural = natural;
    if (isIndex && natural < 1) {
      const e = clamp01(natural);
      setLight(e > 0.6);
      if (TW.started) {
        markShow(e > 0.55);
        sideShow(e >= 0.6);
      }
      if (TW.started && fvDelayDone) {
        if (e < 0.25) TW.setHead("fv");
        else if (e < 0.7) TW.setHead("fvHide");
        else TW.setHead("normal", 0.3);
        icons(e < 0.25 && active);
        idleWatch(e <= 0);
      }
      main.classList.remove("hide");
      return;
    }
    idleWatch(false);
    if (!footer) return;
    const fr = bottomRatio(footer, 3);
    if (darkEl) setLight(bottomRatio(darkEl, darkEl === footer || isSP() ? 3 : 2) > 0.5);
    if (!TW.started) return;
    markShow(true);
    sideShow(fr >= 0.7);
    if (!fvDelayDone) return;
    TW.setHead(fr <= 0.8 ? "footerHide" : "normal");
    main.classList.toggle("hide", fr < 0.5);
    icons(fr < 0.05);
  }
  TW.update = update;

  /* Video below the footer: by the amount scrolled past the end of the body (divided by 33vw on windows · 100vw on phones) it moves from half a cell below into place (quickTo .5s expo.out) */
  const footY = gsap.quickTo(body, "--footer-y", { duration: 0.5, ease: "expo.out" });
  function footerVideo() {
    const n = isSP() ? window.innerWidth : window.innerWidth * 0.33;
    const t = clamp01((window.scrollY + window.innerHeight - body.clientHeight) / n);
    footY((1 - t) * (n / 2));
  }

  /* ---------- Scrollbar ---------- */
  const thumb = document.querySelector(".tw-scrollbar__thumb");
  function scrollbar() {
    if (!thumb) return;
    const vh = window.innerHeight;
    const full = document.documentElement.scrollHeight;
    const th = Math.max(40, (vh / full) * vh);
    thumb.style.height = th + "px";
    thumb.style.transform = `translateY(${(window.scrollY / Math.max(1, full - vh)) * (vh - th)}px)`;
  }
  const onScroll = () => {
    scrollbar();
    footerVideo();
    update();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- Reveal (watched from the moment the curtain starts to lift) ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("show");
        io.unobserve(e.target);
      }
    }),
    { rootMargin: "0px 0px -12% 0px" }
  );
  const lead = document.querySelector(".tw-lead");
  function watchEffects() {
    document.querySelectorAll(".js-fade, .js-img").forEach((el) => io.observe(el));
    document.querySelectorAll(".js-foot").forEach((el, i) => {
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => setTimeout(() => el.classList.add("show"), i * 100) });
    });
  }

  /* ---------- Text wave hover: touched letters flicker right away, farther letters later (.5×distance) with opacity .8×distance, then return in .75s power1.out ---------- */
  const hoverTargets = [
    [".tw-nav__en a, .tw-reserve__close, .tw-reserve__btn, .ac-tabs__btn, .tw-cookie button", false],
    [".tw-nav__ja a, .tw-side a", true],
  ];
  hoverTargets.forEach(([sel, vertical]) =>
    document.querySelectorAll(sel).forEach((el) => {
      const chars = [];
      const split = (node) =>
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            [...n.textContent].forEach((ch) => {
              const span = document.createElement("span");
              span.className = "tw-hv";
              span.textContent = ch;
              frag.appendChild(span);
              chars.push(span);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) split(n);
        });
      split(el);
      let tls = [];
      el.addEventListener("pointerenter", (e) => {
        if (reduce || window.matchMedia("(hover: none)").matches) return;
        const r = el.getBoundingClientRect();
        tls.forEach((t) => t.kill());
        tls = chars.map((c) => {
          const b = c.getBoundingClientRect();
          const l = vertical ? Math.abs(e.clientY - b.top) / r.height : Math.abs(e.clientX - b.left) / r.width;
          return gsap.timeline()
            .to(c, { opacity: 0.8 * l, duration: 0.2, ease: "sine.out", delay: 0.5 * l })
            // The original is "Expo.out"Being uppercase, it’s a name that doesn’t exist in GSAP 3 — it runs with the default curve power1.out. The measured value is also that, so the curve actually running is used
            .to(c, { opacity: 1, duration: 0.75, ease: "power1.out" });
        });
      });
    })
  );

  /* ---------- Booking window: backdrop 1s sine.inOut, rows y15→0 (1s expo.out) staggered .075s, center vertical line on the phone field’s turn. Closing: rows exit upward staggered .03s and the backdrop goes over .75s after .35s ---------- */
  const reserve = document.querySelector(".tw-reserve");
  const resItems = () => [...reserve.querySelectorAll(".tw-reserve__title, .tw-reserve__lead, .tw-reserve__btn, .tw-reserve__tel a, .tw-reserve__tel span, .tw-reserve__desc")].filter((el) => getComputedStyle(el).display !== "none");
  const resClose = reserve?.querySelector(".tw-reserve__close");
  let resOpen = false, resClosing = false, resTl;
  function openReserve(e) {
    e?.preventDefault();
    if (!reserve || resOpen) return;
    resOpen = true;
    const again = resClosing;
    resClosing = false;
    header.classList.remove("is-open");
    reserve.classList.add("is-show");
    reserve.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
    const items = resItems();
    const telAt = items.findIndex((el) => el.closest(".tw-reserve__tel"));
    resTl?.kill();
    resTl = gsap.timeline();
    resTl.to(reserve, { "--bg-opacity": 1, duration: reduce ? 0 : 1, ease: "sine.inOut" }, 0)
      .to(resClose, { opacity: 1, duration: again ? 1 : 0, ease: "sine.inOut" }, 0);
    if (!again) resTl.set(items, { y: 15, opacity: 0 }, 0).set(reserve, { "--divider-opacity": 0 }, 0);
    items.forEach((el, i) => {
      const at = again || reduce ? 0 : 0.075 * i + 0.4;
      resTl.to(el, { y: 0, duration: 1, ease: "expo.out" }, at).to(el, { opacity: 1, duration: 1, ease: "sine.inOut" }, at);
    });
    resTl.to(reserve, { "--divider-opacity": 1, duration: 1, ease: "sine.inOut" }, again || reduce ? 0 : 0.075 * (telAt < 0 ? items.length : telAt) + 0.4);
  }
  function closeReserve() {
    if (!reserve || !resOpen) return;
    resOpen = false;
    resClosing = true;
    reserve.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
    const items = resItems();
    const telAt = items.findIndex((el) => el.closest(".tw-reserve__tel"));
    resTl?.kill();
    resTl = gsap.timeline({ onComplete: () => { resClosing = false; reserve.classList.remove("is-show"); } });
    resTl.to(reserve, { "--bg-opacity": 0, duration: 0.75, ease: "sine.inOut" }, reduce ? 0 : 0.35)
      .to(resClose, { opacity: 0, duration: 1, ease: "sine.out" }, 0);
    items.forEach((el, i) => {
      resTl.to(el, { y: -15, duration: 0.75, ease: inThenOut }, 0.03 * i).to(el, { opacity: 0, duration: 0.75, ease: "sine.inOut" }, 0.03 * i);
    });
    resTl.to(reserve, { "--divider-opacity": 0, duration: 0.75, ease: "sine.inOut" }, 0.03 * (telAt < 0 ? items.length : telAt));
  }
  document.querySelectorAll("[data-reserve]").forEach((a) => a.addEventListener("click", openReserve));
  resClose?.addEventListener("click", closeReserve);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeReserve());
  window.addEventListener("resize", () => resOpen && closeReserve());

  /* ---------- Cookie bar: once a choice is made it never asks again (.25s fade + 10px) ---------- */
  const cookie = document.querySelector(".tw-cookie");
  const cookieSeen = (() => { try { return localStorage.getItem("tw-cookie"); } catch { return null; } })();
  if (cookieSeen) cookie?.remove();
  cookie?.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => {
    cookie.classList.remove("is-show");
    try { localStorage.setItem("tw-cookie", i ? "accept" : "reject"); } catch { /* If the window can’t save, close it this time only */ }
  }));

  /* ---------- Phone Menu ---------- */
  document.querySelector(".tw-header__burger")?.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    body.style.overflow = open ? "hidden" : "";
  });

  /* ---------- Phone EN|KR swap: a two-column band across the whole page slides together by main’s single --slideX ---------- */
  // The original starts on the Korean tab if the browser language is Japanese, otherwise on the English tab — the copy’s Korean tab is the Korean slot, so ko and ja both count as the Korean tab
  let lang = /^(ko|ja)/i.test(navigator.language || "") ? "ja" : "en";
  let slideMin = 0, slideTw, swipeOn = null;
  const getX = () => parseFloat(main.style.getPropertyValue("--slideX") || "0");
  const setX = (v) => main.style.setProperty("--slideX", String(Math.max(Math.min(v, 0), slideMin)));
  const snap = (to) => {
    const o = { v: getX() };
    slideTw?.kill();
    slideTw = gsap.to(o, { v: to, duration: reduce ? 0 : 0.45, ease: "expo.out", onUpdate: () => setX(o.v), onComplete: () => (lang = Math.abs(to) < Math.abs(to - slideMin) ? "en" : "ja") });
  };
  const sw = { sx: 0, sy: 0, x: 0, y: 0, t: 0, h: false, v: false, x0: 0, zoom: false, tapped: false };
  const point = (e, start = true) => { const p = start ? e.touches[0] : e.changedTouches[0]; return { x: p.clientX, y: p.clientY }; };
  const onStart = (e) => {
    const p = point(e);
    Object.assign(sw, { sx: p.x, sy: p.y, x: p.x, y: p.y, t: Date.now(), h: false, v: false, x0: getX(), zoom: !!(window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.01) });
    lang = slideMin / 2 < getX() ? "en" : "ja";
  };
  const onMove = (e) => {
    if (sw.v || sw.zoom) return;
    const p = point(e);
    sw.x = p.x; sw.y = p.y;
    const dx = Math.abs(sw.x - sw.sx), dy = Math.abs(sw.y - sw.sy);
    if (!sw.h && dx < 10 && dy < 10) return;
    if (!sw.h && !sw.v) { if (dx > dy) sw.h = true; else { sw.v = true; return; } }
    if (sw.h) { if (e.cancelable) e.preventDefault(); setX(sw.x0 + (sw.x - sw.sx)); }
  };
  const onEnd = () => {
    if (sw.h) {
      const dx = sw.x - sw.sx, speed = Math.abs(dx) / Math.max(1, Date.now() - sw.t), range = slideMin;
      const x = getX();
      snap(speed > 0.3 ? (dx < 0 ? slideMin : 0) : lang === "en" ? (0.4 * range < x ? 0 : slideMin) : 0.6 * range < x ? 0 : slideMin);
    }
    if (sw.h || sw.v) sw.tapped = true;
  };
  const onClick = (e) => {
    if (sw.tapped) { sw.tapped = false; return; }
    const x = e.clientX, w = window.innerWidth;
    if (x <= 60) return snap(0);
    if (x >= w - 60) return snap(slideMin);
    const col = e.target.closest?.(".tw-swipe > *");
    if (col) snap(col === col.parentElement.firstElementChild ? 0 : slideMin);
  };
  function swipeSetup() {
    const ja = document.querySelector(".tw-swipe > :last-child");
    const sp = isSP();
    if (ja && sp) {
      const w = ja.getBoundingClientRect().width;
      slideMin = -(w + w - window.innerWidth * (window.visualViewport?.scale || 1));
      setX(lang === "ja" ? slideMin : 0);
    } else main.style.removeProperty("--slideX");
    if (!ja || sp === swipeOn) return;
    swipeOn = sp;
    const fn = sp ? "addEventListener" : "removeEventListener";
    window[fn]("touchstart", onStart, { passive: true });
    window[fn]("touchmove", onMove, { passive: false });
    window[fn]("touchend", onEnd, { passive: true });
    window[fn]("click", onClick, { passive: true });
  }
  swipeSetup();
  window.addEventListener("resize", swipeSetup);

  /* ---------- Video of the month: clips shuffled by weight switch to the next every 10s (1s linear overlap), at the same time in two spots, the hero and below the footer ---------- */
  const playlist = [
    { name: "01", weight: 1 },
    { name: "02", weight: 1 },
    { name: "03", weight: 0 },
  ];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ids = Object.values(playlist.reduce((g, f) => ((g[f.weight] ||= []).push(f), g), {}))
    .sort((a, b) => b[0].weight - a[0].weight).flatMap(shuffle).map((f) => f.name);
  const parents = [...document.querySelectorAll("[data-monthly]")];
  const clips = {};
  let current = null, clipIdx = 0, clipTimer = null;
  const media = (id) => `media/monthly-${id}.mp4`;
  function load(id) {
    if (clips[id]) return clips[id].ready;
    const doms = parents.map((p) => {
      const v = document.createElement("video");
      Object.assign(v, { muted: true, autoplay: false, playsInline: true, preload: "auto", src: media(id) });
      v.setAttribute("aria-hidden", "true");
      v.style.visibility = "hidden";
      v.style.opacity = "0";
      p.appendChild(v);
      return v;
    });
    const ready = new Promise((res) => {
      const v = doms[0];
      if (!v) return res();
      const done = () => res();
      v.addEventListener("loadeddata", done, { once: true });
      v.addEventListener("error", done, { once: true });
      setTimeout(done, 10000);
    });
    clips[id] = { doms, ready };
    return ready;
  }
  function fade(v, on) {
    if (on) v.style.visibility = "visible";
    v.style.zIndex = on ? "1" : "0";
    return gsap.fromTo(v, { opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0, duration: reduce ? 0 : 1, ease: "none", onComplete: () => { if (!on) v.style.visibility = "hidden"; } });
  }
  async function start(id, first = false) {
    clearTimeout(clipTimer);
    clipTimer = setTimeout(next, 10000 - (first ? 1000 : 0));
    const prev = current;
    current = id;
    const c = clips[id];
    const lead = c.doms[0];
    if (reduce) { c.doms.forEach((v) => { v.style.visibility = "visible"; v.style.opacity = "1"; }); return; }
    lead.currentTime = 0;
    c.doms.forEach((v) => { v.currentTime = lead.currentTime; v.play().catch(() => {}); fade(v, true); });
    if (prev && clips[prev]) {
      const old = clips[prev];
      await Promise.all(old.doms.map((v) => fade(v, false).then()));
      old.doms.forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); v.remove(); });
      delete clips[prev];
    }
  }
  function next() {
    const n = (clipIdx + 1) % ids.length;
    if (clips[ids[n]]) {
      clipIdx = n;
      start(ids[n]);
      load(ids[(n + 1) % ids.length]);
    } else {
      load(ids[n]);
      clips[current]?.doms.forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); });
      clipTimer = setTimeout(next, 10000);
    }
  }
  async function mediaSetup() {
    if (!parents.length) return;
    await Promise.all([load(ids[0]), load(ids[1])]);
    await start(ids[0], true);
  }
  document.addEventListener("visibilitychange", () => {
    const c = clips[current];
    if (!c) return;
    if (document.hidden) { clearTimeout(clipTimer); c.doms.forEach((v) => v.pause()); }
    else if (!reduce) { c.doms.forEach((v) => v.play().catch(() => {})); clipTimer = setTimeout(next, 10000); }
  });

  /* Sound: the original plays a separately loaded sound per clip — this copy has no sound files, so only the bars (paused ↔ bouncing) and aria-pressed change */
  sound?.querySelector("button")?.addEventListener("click", (e) => {
    const on = sound.classList.toggle("is-playing");
    sound.classList.toggle("is-paused", !on);
    e.currentTarget.setAttribute("aria-pressed", String(on));
  });

  /* Fullscreen: fills the window with the currently visible video slot (the hero if on the first screen, otherwise below the footer). On entering, the hero video’s shrink scale is turned off (--fullscreen-flg) */
  fullIcon?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (document.fullscreenElement) return document.exitFullscreen();
    const target = (TW.fvNatural < 1 && document.querySelector(".tw-fv__clip")) || document.querySelector(".tw-footer-video");
    if (target?.requestFullscreen) { await target.requestFullscreen(); body.style.setProperty("--fullscreen-flg", "1"); }
  });
  document.addEventListener("fullscreenchange", () => !document.fullscreenElement && body.style.setProperty("--fullscreen-flg", "0"));

  /* ---------- Loader curtain = Page transition: the cover is the curtain .6s power2.out plus the stamp going to .5 over .5s after .1s (1.05→1x), the reveal is the stamp 1.5s (sine.in, .9x expo.in), and the curtain 3.75s linear after .5s ---------- */
  const loading = document.querySelector(".tw-loading");
  const logo = loading?.querySelector(".tw-loading__logo");
  const veil = loading?.querySelector(".tw-loading__bg");
  let veilTl;
  function veilShow(then) {
    loading.style.pointerEvents = "all";
    veilTl?.kill();
    veilTl = gsap.timeline({ onComplete: then });
    veilTl.to(veil, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0)
      .fromTo(logo, { opacity: 0 }, { opacity: 0.5, duration: 0.5, ease: "sine.out" }, 0.1)
      .fromTo(logo, { scale: 1.05 }, { scale: 1, duration: 0.5, ease: "sine.out" }, 0.1);
  }
  function veilHide(onView) {
    veilTl?.kill();
    veilTl = gsap.timeline();
    veilTl.to(veil, { opacity: 0, duration: reduce ? 0 : 3.75, ease: "none", onStart: () => { loading.style.pointerEvents = "none"; onView(); } }, reduce ? 0 : 0.5)
      .to(logo, { opacity: 0, duration: reduce ? 0 : 1.5, ease: "sine.in" }, 0)
      .to(logo, { scale: 0.9, duration: reduce ? 0 : 1.5, ease: "expo.in" }, 0);
  }

  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|tel:|mailto:)/.test(href) || a.target) return;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (href === location.pathname.split("/").pop()) return;
      header.classList.remove("is-open");
      body.style.overflow = "";
      closeReserve();
      try { sessionStorage.setItem("tw-veil", "1"); } catch { /* Just can’t pick up right where it left off */ }
      if (reduce) return (location.href = href);
      veilShow(() => (location.href = href));
    });
  });
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted || !loading) return;
    veilTl?.kill();
    gsap.set(veil, { opacity: 0 });
    gsap.set(logo, { opacity: 0 });
    loading.style.pointerEvents = "none";
  });

  // When the curtain starts to lift (original showView): watch the reveals, bloom the sub-header, show the cookie bar, and on the first page follow the header state after .9s
  const view = () => {
    TW.started = true;
    lead?.classList.add("show");
    cookie?.classList.add("is-show");
    watchEffects();
    TW.ready.forEach((fn) => fn());
    if (isIndex) setTimeout(() => { fvDelayDone = true; update(); }, reduce ? 0 : 900);
    else update();
  };
  main.classList.remove("hide");
  onScroll();

  const arrived = (() => { try { const v = sessionStorage.getItem("tw-veil"); sessionStorage.removeItem("tw-veil"); return v; } catch { return null; } })();
  const setup = Promise.all([document.fonts?.ready, mediaSetup()].filter(Boolean));
  if (!loading) setup.then(view);
  else if (arrived) {
    // Picks up the cover carried over from the previous page — stamp .5
    gsap.set(veil, { opacity: 1 });
    gsap.set(logo, { opacity: 0.5, scale: 1 });
    setup.then(() => requestAnimationFrame(() => veilHide(view)));
  } else {
    veilShow();
    setup.then(() => requestAnimationFrame(() => veilHide(view)));
  }
})();
