// Motion shared by all pages: original main2.js values:
// Locomotive v4 (smooth, multiplier .7, lerp .18, smooth off on phone) + ScrollTrigger scrollerProxy (panel scroll only at 1025px and above),
// First-visit loader (once per session, logo after 2.5s → curtain 1.5s after .5s), header row is-fixed after scrolling 20px, menu drawer, image pop-out (.5s back) + 5s hop,
// Arrow · underline hover (css), banner row slick (5 slides · 5s · .5s easeOutCubic), and the hand-drawn kit (map · mountain · parachute · person · animal).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = () => matchMedia("(min-width: 1025px)").matches;
  const root = document.documentElement;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();

  /* ---------------- Hand-drawn kit ---------------- */
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const O = (d, f = "") => `<path class="o ${f}" d="${d}"/>`;
  const C = (x, y, r, f = "fw") => `<circle class="o ${f}" cx="${x}" cy="${y}" r="${r}"/>`;
  const E = (x, y, rx, ry, f = "fw") => `<ellipse class="o ${f}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
  const R = (x, y, w, h, f = "fw", r = 0) => `<rect class="o ${f}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
  const FILLS = ["fp", "fo", "fg", "fb", "fu", "fm", "fr", "fy"];

  // One person — head, hair, body (clothing color), legs. Scale s, foot tip at (x, y)
  const person = (x, y, s = 1, f = "fo", hair = "fk", walk = false) => {
    const k = (v) => +(v * s).toFixed(1);
    const legs = walk
      ? O(`M${x} ${y - k(22)} l${-k(8)} ${k(22)} M${x} ${y - k(22)} l${k(9)} ${k(21)}`)
      : O(`M${x - k(4)} ${y - k(22)} v${k(22)} M${x + k(4)} ${y - k(22)} v${k(22)}`);
    return legs +
      O(`M${x - k(11)} ${y - k(20)} q${k(-1)} ${k(-24)} ${k(11)} ${k(-28)} q${k(12)} ${k(4)} ${k(11)} ${k(28)} z`, f) +
      C(x, y - k(56), k(9), "fw") +
      O(`M${x - k(9)} ${y - k(57)} q${k(1)} ${k(-12)} ${k(9)} ${k(-11)} q${k(9)} ${k(-1)} ${k(9)} ${k(11)} q${k(-9)} ${k(-5)} ${k(-18)} 0z`, hair);
  };
  const dog = (x, y, s = 1, f = "fy") => {
    const k = (v) => +(v * s).toFixed(1);
    return O(`M${x - k(14)} ${y} v${k(-9)} M${x - k(6)} ${y} v${k(-9)} M${x + k(8)} ${y} v${k(-9)} M${x + k(14)} ${y} v${k(-9)}`) +
      E(x, y - k(13), k(18), k(8), f) + E(x + k(20), y - k(22), k(8), k(7), f) + O(`M${x + k(17)} ${y - k(28)} l${k(-3)} ${k(-6)} l${k(5)} ${k(3)}`, f) +
      O(`M${x - k(17)} ${y - k(16)} q${k(-8)} ${k(-6)} ${k(-6)} ${k(-14)}`);
  };
  const tree = (x, y, r, f = "fg") => O(`M${x} ${y} v${-r * 0.9}`) + C(x, y - r * 1.4, r, f) + O(`M${x - r * 0.4} ${y - r * 1.5} q${r * 0.4} ${-r * 0.3} ${r * 0.7} 0`);
  const house = (x, y, w, h, roof = "fr") =>
    R(x, y - h, w, h, "fw") + O(`M${x - 4} ${y - h} L${x + w / 2} ${y - h - w * 0.45} L${x + w + 4} ${y - h} z`, roof) + R(x + w * 0.38, y - h * 0.55, w * 0.24, h * 0.55, "fk");
  const cloud = (x, y, w) => O(`M${x} ${y} h${w} a10 10 0 0 0 0 -20 h${-w * 0.35} a12 12 0 0 0 -24 0 h${-w * 0.65 + 24} a10 10 0 0 0 0 20z`, "fw") + O(`M${x + w * 0.2} ${y - 10} h${w * 0.5}`);
  const chute = (x, y, s = 1, f = "fm") => {
    const k = (v) => +(v * s).toFixed(1);
    return O(`M${x - k(40)} ${y} q${k(40)} ${k(-56)} ${k(80)} 0 q${k(-10)} ${k(-8)} ${k(-20)} 0 q${k(-10)} ${k(-8)} ${k(-20)} 0 q${k(-10)} ${k(-8)} ${k(-20)} 0 q${k(-10)} ${k(-8)} ${k(-20)} 0z`, f) +
      O(`M${x - k(20)} ${y - k(30)} q${k(-6)} ${k(14)} 0 ${k(30)} M${x} ${y - k(36)} v${k(36)} M${x + k(20)} ${y - k(30)} q${k(6)} ${k(14)} 0 ${k(30)}`) +
      O(`M${x - k(40)} ${y} L${x - k(6)} ${y + k(40)} M${x + k(40)} ${y} L${x + k(6)} ${y + k(40)}`) +
      person(x, y + k(78), s * 0.7, "fy", "fk");
  };
  const mountains = (w, h, seed = 3) => {
    const r = rnd(seed); let d = `M0 ${h}`; let x = 0;
    while (x < w) { const pw = 120 + r() * 160; d += ` L${x + pw / 2} ${h * (0.05 + r() * 0.3)} L${x + pw} ${h * (0.5 + r() * 0.25)}`; x += pw * 0.8; }
    return O(d + ` L${w} ${h}z`, "fs");
  };

  const ILL = {
    // Mountain band — green hill ridge + two clouds (stacked over an empty panel)
    hills: () => {
      let d = "M0 150 L0 92"; const r = rnd(7);
      for (let x = 0; x < 1440; x += 160) d += ` Q${x + 80} ${30 + r() * 30} ${x + 160} ${70 + r() * 30}`;
      let grass = ""; for (let i = 0; i < 14; i++) { const gx = 60 + i * 100 + r() * 40; grass += O(`M${gx} ${100 + r() * 30} l14 -18`); }
      return { vb: "0 0 1440 150", par: "xMidYMax slice", body: O(d + " L1440 150z", "fg") + grass + cloud(70, 70, 120) + cloud(1050, 50, 90) };
    },
    walk: () => ({ vb: "0 0 160 110", body: person(40, 104, 1.3, "fw", "fk", true) + dog(92, 104, 1.1, "fs") + dog(132, 104, 1, "fy") }),
    chute: (f = "fo") => ({ vb: "-50 -50 100 170", body: chute(0, 0, 1, f) }),
    people: (n = 2) => {
      let b = ""; for (let i = 0; i < +n; i++) b += person(30 + i * 34, 120, 1.25, FILLS[i % FILLS.length], "fk");
      return { vb: `0 0 ${50 + n * 34} 125`, body: b };
    },
    // Props beside section headers — a stall and people (Events), a sunflower pond and dog (Features), a safari car and animals (News), two igloos (above News)
    stall: () => ({ vb: "0 0 260 170", body: tree(222, 150, 26, "fg") + tree(40, 150, 22, "fg") + house(80, 150, 100, 52, "fn") + O("M70 98 h120 l-14 -26 h-92z", "fy") + person(60, 160, 1.1, "fy") + person(205, 162, 1.1, "fb") + person(130, 168, 1.2, "fp") }),
    pond: () => ({ vb: "0 0 260 200", body: E(110, 120, 100, 34, "fb") + tree(200, 120, 28, "fg") + Array.from({ length: 5 }, (_, i) => O(`M${30 + i * 44} 120 v-60`) + C(30 + i * 44, 56, 14, "fo") + C(30 + i * 44, 56, 6, "fn")).join("") + person(130, 180, 1.2, "fu") + dog(200, 196, 1.2, "fo") }),
    safari: () => ({ vb: "0 0 300 220", body: E(90, 120, 60, 44, "fd") + O("M40 110 q-16 30 -6 66", "") + C(66, 106, 4, "fk") + R(150, 30, 26, 120, "fy") + C(163, 26, 16, "fy") + R(40, 160, 180, 40, "fw", 8) + C(80, 204, 14, "fk") + C(180, 204, 14, "fk") + O("M60 160 v-20 h140 v20") + person(250, 216, 1.3, "fr") + person(282, 216, 1.2, "fm") }),
    igloo: () => ({ vb: "0 0 160 140", body: O("M10 130 a50 50 0 0 1 100 0z", "fw") + O("M20 106 h80 M14 120 h92 M36 92 h48 M60 80 v26 M40 106 v24 M80 106 v24") + O("M50 130 a10 12 0 0 1 20 0", "fk") + person(135, 136, 1.2, "fo") }),
    // Menu card props — a different scene for each branch
    vignette: (kind = "tree") => {
      const v = {
        tree: tree(40, 92, 22, "fp") + tree(90, 96, 26, "fp") + house(54, 98, 40, 26, "fr") + person(118, 100, 0.9, "fm"),
        hill: E(70, 84, 64, 18, "fg") + tree(30, 80, 16, "fg") + person(70, 92, 1, "fo") + person(100, 92, 0.9, "fp"),
        sheep: E(70, 64, 42, 30, "fo") + O("M44 92 v14 M96 92 v14") + person(20, 104, 0.9, "fm") + person(120, 104, 0.9, "fb"),
        spa: O("M24 74 a46 34 0 0 0 92 0z", "fb") + C(70, 64, 10, "fw") + O("M50 50 q6 -10 0 -20 M90 50 q6 -10 0 -20"),
        shop: R(24, 54, 92, 46, "fw") + O("M18 54 h104 l-10 -20 h-84z", "fr") + R(40, 70, 20, 30, "fy") + R(76, 70, 22, 18, "fb"),
        cart: R(34, 46, 70, 46, "fr", 6) + C(46, 98, 8, "fk") + C(94, 98, 8, "fk") + tree(120, 98, 14, "fg") + person(16, 102, 0.8, "fo"),
      };
      return { vb: "0 0 140 110", body: v[kind] || v.tree };
    },
    // Footer bottom-right mountain — gray-brown peak, maple tree, temple gate roof, two parachutes, clouds
    mountain: () => {
      const r = rnd(11); let trees = "";
      for (let i = 0; i < 26; i++) { const x = 200 + r() * 600, y = 200 + r() * 120; trees += tree(x, y, 10 + r() * 12, ["fo", "fr", "fy", "fg"][i % 4]); }
      return { vb: "0 0 820 320", par: "xMaxYMax meet", body: O("M120 320 L260 120 L330 170 L470 40 L560 140 L640 60 L720 120 L820 30 L820 320z", "fs") + O("M640 60 l-14 30 l14 -8 l14 8z", "fw") + trees + O("M420 250 h90 l-12 -18 h-66z", "fr") + R(430, 250, 70, 30, "fw") + cloud(260, 220, 110) + cloud(560, 200, 80) + chute(330, 40, 0.8, "fm") + chute(560, 30, 0.75, "fu") };
    },
  };
  const paint = (el) => {
    const [name, arg] = el.dataset.ill.split(":");
    const fn = ILL[name]; if (!fn) return;
    const { vb, body, par } = fn(arg);
    el.innerHTML = `<svg class="ill" viewBox="${vb}" preserveAspectRatio="${par || "xMidYMid meet"}" aria-hidden="true">${body}</svg>`;
  };

  // Hero big map — it must be swept down with object-position, so it is baked into an img. Colors read the current skin’s variables and are written into the art’s inline style
  const mapSrc = () => {
    const probe = document.createElement("i"); document.body.append(probe);
    const col = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
    const fills = { fk: "--kf-ink", fw: "--kf-surface", fg: "--site-green", fh: "--site-hill", fb: "--kf-accent", fp: "--site-pink", fo: "--site-orange", fr: "--site-red", fy: "--site-beige", fm: "--site-mint", fu: "--site-purple", fd: "--kf-line", fn: "--site-brown", fs: "--kf-dim", fbg: "--kf-bg" };
    const style = `.o{stroke:${col("--kf-ink")};stroke-width:2;stroke-linejoin:round;stroke-linecap:round;fill:none}` + Object.entries(fills).map(([k, v]) => `.${k}{fill:${col(v)}}`).join("") + `.rv{fill:none;stroke:${col("--kf-accent")};stroke-width:70;stroke-linecap:round}`;
    probe.remove();
    const W = 1000, H = 1500, r = rnd(5);
    const riverX = (y) => 520 + 230 * Math.sin(y / 230) + 60 * Math.sin(y / 90);
    let river = "M" + riverX(260) + " 260"; for (let y = 280; y <= H + 40; y += 20) river += ` L${riverX(y).toFixed(1)} ${y}`;
    let s = `<rect class="fbg" width="${W}" height="${H}"/>`;
    s += mountains(W, 300, 9);
    for (let i = 0; i < 9; i++) s += E(80 + r() * 840, 340 + r() * 1100, 90 + r() * 80, 40 + r() * 30, "fg");
    s += `<path class="o" d="${river}" style="stroke-width:76"/><path class="rv" d="${river}"/>`;
    s += O("M0 900 C300 860 600 980 1000 920", "") + O("M0 1180 C260 1240 700 1120 1000 1210", "");
    const items = [];
    for (let i = 0; i < 150; i++) {
      const x = 30 + r() * 940, y = 300 + r() * 1180;
      if (Math.abs(x - riverX(y)) < 80) continue;
      items.push([y, x, r()]);
    }
    items.sort((a, b) => a[0] - b[0]);
    for (const [y, x, k] of items) {
      if (k < 0.42) s += tree(x, y, 12 + k * 30, FILLS[Math.floor(k * 100) % 4]);
      else if (k < 0.7) s += house(x, y, 26 + k * 20, 20 + k * 10, ["fr", "fn", "fs", "fd"][Math.floor(k * 37) % 4]);
      else if (k < 0.85) s += person(x, y, 0.6, FILLS[Math.floor(k * 53) % 8]);
      else s += dog(x, y, 0.7, "fy");
    }
    s += R(330, 1020, 300, 110, "fr") + O("M320 1020 L480 960 L640 1020z", "fs");
    for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) s += R(346 + i * 31, 1036 + j * 30, 14, 18, "fw");
    for (let i = 0; i < 6; i++) s += R(110 + i * 46, 700, 42, 26, i % 2 ? "fw" : "fy", 4);
    s += E(830, 1330, 70, 46, "fd") + R(170, 1340, 120, 40, "fw", 6) + chute(260, 90, 0.9, "fm") + chute(760, 60, 0.8, "fo");
    return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><style>${style}</style>${s}</svg>`);
  };

  /* ---------------- Scroll panel ---------------- */
  let loco = null;
  const box = document.querySelector("[data-scroll-container]");
  let resolveReady; window.tsReady = new Promise((r) => (resolveReady = r));
  const head = document.body;
  const onY = (y) => head.classList.toggle("is-fixed", y > 20);

  const start = () => {
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (box && !reduce && window.LocomotiveScroll) {
      loco = new LocomotiveScroll({
        el: box, smooth: true, multiplier: 0.7, lerp: 0.18, getDirection: true, reloadOnContextChange: true, touchMultiplier: 3,
        smartphone: { smooth: false }, tablet: { smooth: true },
      });
      loco.on("scroll", (o) => { onY(o.scroll.y); if (window.ScrollTrigger) ScrollTrigger.update(); });
      if (window.ScrollTrigger && desktop()) {
        ScrollTrigger.scrollerProxy(box, {
          scrollTop(v) { return arguments.length ? loco.scrollTo(v, { duration: 0, disableLerp: true }) : loco.scroll.instance.scroll.y; },
          getBoundingClientRect() { return { top: 0, left: 0, width: innerWidth, height: innerHeight }; },
          pinType: box.style.transform ? "transform" : "fixed",
        });
        ScrollTrigger.addEventListener("refresh", () => loco.update());
      }
      new ResizeObserver(() => loco.update()).observe(box);
    }
    addEventListener("scroll", () => onY(scrollY), { passive: true });
    window.tsScroll = { loco, scroller: loco && desktop() ? box : window };
    resolveReady(window.tsScroll);
    requestAnimationFrame(() => window.ScrollTrigger && ScrollTrigger.refresh());
  };

  /* ---------------- First-visit loader ---------------- */
  const loader = () => {
    const el = document.querySelector(".ts-loader");
    if (!el) return;
    let seen = false; try { seen = !!sessionStorage.getItem("ts-access"); sessionStorage.setItem("ts-access", "0"); } catch {}
    if (seen || reduce) { root.classList.add("is-seen"); root.classList.add("is-loaded"); return; }
    setTimeout(() => {
      el.querySelector(".ts-loader__logo").classList.add("is-hidden");
      setTimeout(() => { el.classList.add("is-hidden"); root.classList.add("is-loaded"); }, 500);
    }, 2500);
  };

  /* ---------------- Drawer ---------------- */
  const drawer = () => {
    const btn = document.querySelector(".ts-head__menu");
    const dr = document.querySelector(".ts-drawer, .tm-drawer");
    if (!btn || !dr) return;
    const set = (on) => { root.classList.toggle("is-drawer", on); btn.setAttribute("aria-expanded", on); if (on) dr.scrollTop = 0; };
    btn.addEventListener("click", () => set(!root.classList.contains("is-drawer")));
    dr.addEventListener("click", (e) => { if (dr.classList.contains("ts-drawer") && !e.target.closest(".ts-drawer__inner")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    // Sub-site drawer photos — original jsSlide (Swiper loop · 5s auto · 1s · parallax · dot pagination + pause button). Keeps running even while the drawer is closed
    const slide = dr.querySelector(".tm-drawer__slide");
    if (slide && window.Swiper) {
      const dots = slide.querySelector(".tm-dot"), toggle = slide.querySelector(".tm-toggle");
      const sw = new Swiper(slide, {
        loop: true, slidesPerView: 1, simulateTouch: true, speed: 1000, parallax: true,
        autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
        pagination: { el: dots, type: "bullets", clickable: true, renderBullet: (i, cls) => `<li class="${cls}"></li>` },
      });
      toggle.addEventListener("click", () => {
        const paused = toggle.classList.toggle("paused");
        if (paused) sw.autoplay.stop(); else sw.autoplay.start();
        toggle.setAttribute("aria-label", paused ? "Play" : "Pause");
        dots.querySelectorAll(".swiper-pagination-bullet").forEach((b) => b.classList.toggle("paused", paused));
      });
    }
  };

  /* ---------------- Picture pop-out ---------------- */
  const pops = () => {
    const els = document.querySelectorAll(".ts-pop");
    if (reduce) { els.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-visible");
      setTimeout(() => en.target.classList.add("is-action"), 500);
      io.unobserve(en.target);
    }), { rootMargin: "0px 0px -15% 0px" });
    els.forEach((el) => io.observe(el));
  };

  /* ---------------- Transparent cursor — original Cursor: follows with Config.duration (.4)/2 · is-mouseon over links · is-mousedown on press ---------------- */
  const pointer = () => {
    if (!root.classList.contains("notouch") || !window.gsap) return;
    const el = document.createElement("div");
    el.className = "ts-pointer"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="ts-pointer__cursor"></div>';
    document.body.append(el);
    const cur = el.firstChild;
    try { const x = sessionStorage.getItem("ts-x"), y = sessionStorage.getItem("ts-y"); if (x && y) gsap.set(el, { x: +x, y: +y }); } catch {}
    addEventListener("mousemove", (e) => {
      gsap.to(el, { x: e.clientX, y: e.clientY, duration: 0.2 });
      try { sessionStorage.setItem("ts-x", e.clientX); sessionStorage.setItem("ts-y", e.clientY); } catch {}
    }, { passive: true });
    // In the original measurement the cursor did not grow over the main site header row (the sub-site header does grow) — grab everything except that header row link
    const hit = (e) => { const h = e.target.closest && e.target.closest("a, button, label"); return h && !h.closest("header:not(.tm-head)") ? h : null; };
    document.addEventListener("mouseover", (e) => { if (hit(e)) cur.classList.add("is-mouseon"); });
    document.addEventListener("mouseout", (e) => { if (hit(e) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("a, button, label") === hit(e))) cur.classList.remove("is-mouseon"); });
    document.addEventListener("mousedown", (e) => { if (hit(e)) cur.classList.add("is-mousedown"); });
    document.addEventListener("mouseup", () => cur.classList.remove("is-mousedown"));
  };

  /* ---------------- Banner row slick ---------------- */
  const banners = () => {
    if (!window.jQuery || !jQuery.fn.slick) return;
    jQuery(".ts-bnr__slider").each(function () {
      const $s = jQuery(this);
      $s.slick({
        dots: false, arrows: true, swipe: true, autoplay: !reduce, autoplaySpeed: 5000, speed: 500, easing: "easeOutCubic",
        pauseOnHover: false, infinite: true, slidesToShow: 5, slidesToScroll: 1,
        prevArrow: $s.siblings(".ts-bnr__prev"), nextArrow: $s.siblings(".ts-bnr__next"),
        responsive: [{ breakpoint: 1023, settings: { slidesToShow: 2 } }],
      });
    });
  };

  // Swiper page number — Current ─── Total, after a slide ends, the middle line fills from the left over 4s
  window.tsFraction = (sel) => ({
    el: sel, type: "fraction",
    renderFraction: (cur, tot) => `<span class="${cur}"></span><span class="ts-frac__bar js-border"><span></span></span><span class="${tot}"></span>`,
  });
  window.tsFractionOn = (rootEl) => ({
    init() { setTimeout(() => rootEl.querySelector(".swiper-pagination")?.classList.add("is-active"), 100); },
    slideChangeTransitionStart() { const b = rootEl.querySelector(".js-border span"); if (b) { b.style.transitionDuration = "0s"; b.style.transform = "scaleX(0)"; } },
    slideChangeTransitionEnd() { const b = rootEl.querySelector(".js-border span"); if (b) { b.style.transitionDuration = "4000ms"; b.style.transform = "scaleX(1)"; } },
  });
  window.tsMapSrc = mapSrc;

  const SNS = [
    ["facebook", "M13.5 20v-8h2.7l.4-3.2h-3.1V6.9c0-.9.3-1.5 1.6-1.5h1.7V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V12h2.8v8z"],
    ["instagram", "M10 2c-2.2 0-2.4 0-3.3.1C3.9 2.2 2.2 3.9 2.1 6.7 2 7.6 2 7.8 2 10s0 2.4.1 3.3c.1 2.8 1.8 4.5 4.6 4.6.9.1 1.1.1 3.3.1s2.4 0 3.3-.1c2.8-.1 4.5-1.8 4.6-4.6.1-.9.1-1.1.1-3.3s0-2.4-.1-3.3c-.1-2.8-1.8-4.5-4.6-4.6C12.4 2 12.2 2 10 2zm0 1.4c2.1 0 2.4 0 3.2.1 2.1.1 3.1 1.1 3.2 3.2.1.8.1 1.1.1 3.2s0 2.4-.1 3.2c-.1 2.1-1.1 3.1-3.2 3.2-.8.1-1.1.1-3.2.1s-2.4 0-3.2-.1c-2.1-.1-3.1-1.1-3.2-3.2-.1-.8-.1-1.1-.1-3.2s0-2.4.1-3.2c.1-2.1 1.1-3.1 3.2-3.2.8-.1 1.1-.1 3.2-.1zM10 5.9a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2zm0 6.8a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4zm4.3-7.9a1 1 0 1 0 0 1.9 1 1 0 0 0 0-1.9z"],
    ["youtube", "M19.6 6.2a2.5 2.5 0 0 0-1.8-1.8C16.2 4 10 4 10 4s-6.2 0-7.8.4A2.5 2.5 0 0 0 .4 6.2C0 7.8 0 10 0 10s0 2.2.4 3.8a2.5 2.5 0 0 0 1.8 1.8C3.8 16 10 16 10 16s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-3.8.4-3.8s0-2.2-.4-3.8zM8 12.5v-5l5.2 2.5z"],
  ];

  // Like the original, hover responses apply only under html.notouch, which prevents hover from sticking on touch devices
  if (!("ontouchstart" in window) && !navigator.maxTouchPoints) root.classList.add("notouch");

  // Relative colors made from Skin variables (oklch from …) blend in OKLab during transitions, so the darker starting side shows up later than with original rgb colors (sRGB blending).
  // Only a few colors with transitions are computed from the current skin values and set down as rgb() (called again to match when the skin changes)
  const flatten = (names) => {
    const probe = document.createElement("i"); document.body.append(probe);
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    names.forEach((n) => {
      probe.style.color = `var(${n})`;
      cx.clearRect(0, 0, 1, 1); cx.fillStyle = getComputedStyle(probe).color; cx.fillRect(0, 0, 1, 1);
      const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
      root.style.setProperty(`${n}-rgb`, `rgb(${r}, ${g}, ${b})`);
    });
    probe.remove();
  };
  window.tsFlattenColors = flatten;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.classList.contains("is-mill")) flatten(["--site-mill-side", "--site-mill-ink"]);
    const blur = document.querySelector(".ts-blur");
    if (blur) setTimeout(() => blur.classList.add("is-visible"), reduce ? 0 : 100);
    loader();
    const chat = document.querySelector(".ts-chat");
    chat?.addEventListener("click", () => chat.setAttribute("aria-expanded", root.classList.toggle("is-chat")));
    document.querySelectorAll("[data-ill]").forEach(paint);
    document.querySelectorAll("[data-sns]").forEach((el) => {
      el.innerHTML = SNS.map(([n, d]) => `<a class="${n}" href="#" aria-label="${n}"></a>`).join("");
      el.querySelectorAll("a").forEach((a, i) => a.style.setProperty("--icon", `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='${SNS[i][1]}'/></svg>`)}")`));
    });
    pointer();
    drawer();
    document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      if (loco) loco.scrollTo(0); else scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }));
    pops();
    banners();
    onY(0);
    // The original turns on Locomotive .5s after the DOM is ready
    setTimeout(start, reduce ? 0 : 500);
  });
})();
