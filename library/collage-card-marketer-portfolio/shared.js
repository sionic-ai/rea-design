// Spans several pages: ticker · header · full menu · ball cursor · envelope mascot slot · footer · flipped big word · page transition · ScrollSmoother. Page scripts use window.WR.
// Original ScrollSmoother: smooth .6, effects off, not created when reduced motion is on.
(() => {
  const page = document.body.dataset.page;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LINKS = [
    { key: "home", href: "index.html", label: "Home" },
    { key: "list", href: "list.html", label: "Work" },
    { key: "about", href: "about.html", label: "About" },
    { key: "roll", href: "#", label: "Videos" },
    { key: "play", href: "#", label: "Experiment" },
  ];
  const heart = '<svg viewBox="0 0 300 238" aria-hidden="true"><path d="M150 236C60 170 4 118 4 66 4 30 32 4 68 4c34 0 62 22 82 52C170 26 198 4 232 4c36 0 64 26 64 62 0 52-56 104-146 170Z"/></svg>';
  // Instead of the original handwritten logo, a red handwriting-style placeholder at the same position·size (98×43) — one stroke and a small heart
  const logo = `<svg viewBox="0 0 98 43" aria-hidden="true"><text x="0" y="33" style="font:400 40px var(--kf-font-hand, var(--kf-font-display));fill:currentColor">Logo</text><path d="M2 39c18-4 40-5 62-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><g transform="translate(70 4) scale(.075)" fill="currentColor"><path d="M150 236C60 170 4 118 4 66 4 30 32 4 68 4c34 0 62 22 82 52C170 26 198 4 232 4c36 0 64 26 64 62 0 52-56 104-146 170Z"/></g></svg>`;

  // Burger: cuts our heart into nine horizontal bands and splits the top three left and right to make twelve brush strokes. Normally lined up in three rows (top six · middle three · bottom three), and they gather into a heart when raised.
  const BARS = (() => {
    const c = document.createElement("canvas").getContext("2d"), path = new Path2D("M150 236C60 170 4 118 4 66 4 30 32 4 68 4c34 0 62 22 82 52C170 26 198 4 232 4c36 0 64 26 64 62 0 52-56 104-146 170Z");
    const span = (y, from, to) => { let a = -1, b = -1; for (let x = from; x <= to; x++) if (c.isPointInPath(path, x, y)) { if (a < 0) a = x; b = x; } return a < 0 ? null : [a, b]; };
    // Stroke height 14.2, centered evenly across 19 ~ 224.4 — the narrowest bottom stroke becomes width 31 like the original (7.72x for three lines)
    const out = [], rows = 9;
    for (let k = 0; k < rows; k++) {
      const mid = 19 + k * (224.4 - 19) / (rows - 1), y0 = mid - 7.1, y1 = mid + 7.1;
      const parts = k < 3 ? [span(mid, 0, 150), span(mid, 150, 300)] : [span(mid, 0, 300)];
      for (const p of parts) if (p) out.push([p[0], y0, p[1], y1]);
    }
    return out.slice(0, 12).map(([x0, y0, x1, y1]) => {
      const r = (y1 - y0) / 2;
      return { box: [x0, y0, x1, y1], d: `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z` };
    });
  })();
  const ROWS_Y = [64, 119, 174], ROW_OF = [0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2];
  const LINE = BARS.map(({ box: [x0, y0, x1, y1] }, i) => { const sx = 240 / (x1 - x0), sy = 16 / (y1 - y0); return { x: 30 - x0 * sx, y: ROWS_Y[ROW_OF[i]] - 8 - y0 * sy, scaleX: sx, scaleY: sy }; });
  const bars = `<svg viewBox="0 0 300 238" aria-hidden="true">${BARS.map((b) => `<path d="${b.d}"/>`).join("")}</svg>`;

  const render = () => {
    const ticker = document.createElement("div");
    ticker.className = "wr-ticker micro";
    ticker.dataset.slot = "ticker";
    const item = `<span class="wr-ticker__item"><span>Your top news line here: short and big!!!</span>${heart}</span>`;
    ticker.innerHTML = `<a class="wr-ticker__link" href="#"><span class="wr-ticker__track"><span>${item.repeat(6)}</span><span>${item.repeat(6)}</span></span></a>
      <button class="wr-ticker__close" type="button" aria-label="News Close"><svg viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9"/></svg></button>`;
    // The original also puts the top News strip only on the first page
    if (page === "home") document.body.prepend(ticker);
    else document.documentElement.style.setProperty("--ticker-h", "0px");

    const header = document.querySelector('[data-slot="header"]');
    header.className = "wr-header";
    header.innerHTML = `<nav class="wr-nav"><a class="wr-logo" href="index.html" aria-label="Home" data-label="Your handwritten English name logo here">${logo}</a>
      <button class="wr-burger" type="button" aria-label="Menu"><span class="wr-burger__heart"><i class="half-l">${bars}</i><i class="half-r">${bars}</i></span></button></nav>
      <div class="wr-takeover" data-slot="menu-takeover"><div class="wr-takeover__bg"></div>
        <nav class="wr-takeover__links" data-label="Your English page name">${LINKS.map((l) => `<a href="${l.href}" ${l.key === page ? 'aria-current="page" class="is-dot"' : ""}>${[...l.label].map((c) => `<span class="ch">${c}</span>`).join("")}</a>`).join("")}<span class="wr-takeover__dot" aria-hidden="true"></span></nav>
        <div class="wr-takeover__photo wf-img wr-shot is-bw" data-label="Black-and-white 1950s woman holding binoculars · striped coat · cutout · landscape 3:2"></div>
        <div class="wr-takeover__foot micro"><div>Your short one-line closing here</div><div><a href="#">Social 1</a> <a href="#">Social 2</a> <a href="#">Mail</a></div><div>© 0000 Your name here</div></div></div>`;

    const footer = document.querySelector('footer[data-slot="footer"]');
    if (footer) {
      footer.className = "wr-footer";
      // Original layout: logo · two lines | center 4 columns × 2 rows (top: pages, bottom: featured work · fields) | far right four socials stacked · bottom copyright (left) · credits (right)
      const cols = [["About", "about.html"], ["Work", "list.html"], ["Playground", "#"], ["Video", "#"], ["Featured work 1", "detail.html"], ["Featured work 2", "detail.html"], ["Field One", "#"], ["Field Two", "#"]];
      // The original too has ”back to top” only in the first page footer (sub page footers start without it)
      footer.innerHTML = `${page === "home" ? '<div class="wr-footer__top micro"><a href="#top" data-top><span>[</span>Back to top<span>]</span></a></div>' : ""}
        <div class="wr-footer__grid"><div class="wr-footer__id"><a class="wr-logo" href="index.html" aria-label="Home" data-label="Your handwritten English name logo here">${logo}</a>
          <p>Your one line saying it is better spoken.<br>Please say hello.</p></div>
          <nav class="wr-footer__cols micro">${cols.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</nav>
          <div class="wr-footer__social micro"><a href="#">Social 1</a><a href="#">Social 2</a><a href="#">Social 3</a><a href="#">Mail</a></div></div>
        <div class="wr-footer__meta micro muted"><p>© 0000 Your name here. All rights reserved.</p><p>Your one line about the maker here</p></div>`;
      // Footer link letter roll: each letter staggered by 22ms rolls up 1em in .7s while a shadow copy below rises in (on exit, the back letters go first)
      footer.querySelectorAll(".wr-footer__social a, .wr-footer__cols a").forEach((a) => {
        const label = a.firstChild.nodeType === 3 ? a.firstChild : null;
        if (!label) return;
        let i = 0;
        const words = label.textContent.split(" ").map((wd) => `<span class="roll__w">${[...wd].map((c) => `<span class="roll__c" style="--i:${i++}">${c}</span>`).join("")}</span>`);
        const roll = document.createElement("span");
        roll.className = "roll"; roll.style.setProperty("--n", i); roll.setAttribute("aria-label", label.textContent);
        roll.innerHTML = words.join(" ");
        label.replaceWith(roll);
      });
      const unfold = document.createElement("section");
      unfold.className = "wr-unfold";
      unfold.dataset.slot = "footer-unfold-word";
      unfold.innerHTML = `<div class="wr-unfold__panel"><p class="wr-unfold__word" data-label="Your large English word here, revealed flipped below the Footer">${[..."Big Word"].map((c) => `<span>${c === " " ? "&nbsp;" : c}</span>`).join("")}</p></div>`;
      footer.after(unfold);
    }

    const main = document.querySelector("main");
    const wrap = document.createElement("div"), content = document.createElement("div");
    wrap.id = "smooth-wrapper"; content.id = "smooth-content";
    main.before(wrap); wrap.append(content);
    content.append(main, ...[footer, document.querySelector(".wr-unfold")].filter(Boolean));

    const sticker = document.createElement("button");
    sticker.className = "wr-sticker";
    sticker.type = "button";
    sticker.dataset.slot = "sticker-button";
    sticker.dataset.visible = "false";
    sticker.setAttribute("aria-label", "Send email");
    sticker.innerHTML = '<canvas aria-hidden="true"></canvas>';
    const slotLine = document.createElement("span");
    slotLine.className = "wr-sticker-slot";
    slotLine.setAttribute("aria-hidden", "true");
    document.body.append(sticker, slotLine);
  };

  const initTicker = () => {
    const t = document.querySelector(".wr-ticker");
    if (!t) return;
    // On close, the letters·hearts visible on screen bounce and fall one by one (Physics2D velocity 30~180 · angle 60~120° · gravity 900 · rotation ±220°, 1.4s · vanish over .3s from 1.2s) and .15s later the header rises
    t.querySelector(".wr-ticker__close").addEventListener("click", () => {
      if (reduced || !window.Physics2DPlugin) { t.classList.add("is-off"); document.body.classList.add("ticker-off"); return; }
      t.querySelector(".wr-ticker__track").style.animationPlayState = "paused";
      const bits = [];
      t.querySelectorAll(".wr-ticker__item").forEach((it) => {
        const txt = it.querySelector("span");
        txt.innerHTML = [...txt.textContent].map((c) => (c === " " ? " " : `<span class="wr-ticker__ch">${c}</span>`)).join("");
        bits.push(...txt.querySelectorAll(".wr-ticker__ch"), it.querySelector("svg"));
      });
      const seen = bits.filter((b) => { const r = b.getBoundingClientRect(); return r.right > 0 && r.left < innerWidth; });
      gsap.set(bits.filter((b) => !seen.includes(b)), { opacity: 0 });
      t.classList.add("is-falling");
      const R = gsap.utils.random;
      seen.forEach((b) => {
        gsap.to(b, { physics2D: { velocity: R(30, 180), angle: R(60, 120), gravity: 900 }, rotation: R(-220, 220), duration: 1.4, delay: R(0, .12) });
        gsap.to(b, { opacity: 0, duration: .3, delay: 1.2 });
      });
      setTimeout(() => document.body.classList.add("ticker-off"), 150);
      setTimeout(() => { t.style.visibility = "hidden"; }, 1600);
      setTimeout(() => ScrollTrigger.refresh(), 600);
    });
  };

  // Full menu (original formula): a circle spreads from the burger spot over 1.4s — up to 18% it pops to .1 of the screen diagonal (power2.out), up to 30% it shrinks slightly to .065 (power1.inOut), then grows to 1.02x until the end (power3.inOut).
  // Meanwhile the heart beats twice (1.28 and 1.22x at 9% and 36%) and splits in half, opening ∓18° (back.out(2.2)). Links come in from 160px to the right starting at .8s, .1s apart, and the closing line rises from below starting at 1.05s (power4.out 1s).
  // On close the letters vanish in .35s and from .25s the circle rewinds into the burger. Hovering a link rolls letters up 1.1em in random order (.05s) revealing the copy below
  const initMenu = () => {
    const burger = document.querySelector(".wr-burger"), tk = document.querySelector(".wr-takeover");
    const links = [...tk.querySelectorAll(".wr-takeover__links a")], foot = [...tk.querySelectorAll(".wr-takeover__foot > div")], photo = tk.querySelector(".wr-takeover__photo");
    const heartEl = burger.querySelector(".wr-burger__heart"), halves = [...heartEl.querySelectorAll("i")], E = "power4.out";
    const st = { p: 0 };
    let open = false, tl = null;
    const tri = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
    const heart = (t) => {
      const beat = t > 0 && t < 1 ? .28 * tri(t, .09, .09) + .22 * tri(t, .36, .1) : 0;
      gsap.set(heartEl, { scale: 1 + beat, transformOrigin: "50% 55%" });
      const o = t > 0 ? gsap.parseEase("back.out(2.2)")(Math.max(0, Math.min(1, (t - .05) / .22))) : 0, dx = 12 * o * heartEl.offsetWidth / 300;
      gsap.set(halves[0], { rotation: -18 * o, x: -dx }); gsap.set(halves[1], { rotation: 18 * o, x: dx });
    };
    const circle = (t) => {
      const b = burger.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, W = innerWidth, H = innerHeight;
      const far = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)), pop = .1 * far, dip = .065 * far;
      const r = t < .18 ? pop * gsap.parseEase("power2.out")(t / .18) : t < .3 ? pop - (pop - dip) * gsap.parseEase("power1.inOut")((t - .18) / .12) : dip + (1.02 * far - dip) * gsap.parseEase("power3.inOut")((t - .3) / .7);
      return `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
    };
    const draw = () => { tk.style.clipPath = st.p >= 1 ? "" : circle(st.p); heart(st.p); };
    const placePhoto = () => {
      if (!photo) return;
      const last = links[links.length - 1].getBoundingClientRect(), top = tk.getBoundingClientRect().top;
      tk.style.setProperty("--photo-base", `${last.bottom - top}px`);
      tk.style.setProperty("--photo-h", `${links[0].parentElement.getBoundingClientRect().height}px`);
      gsap.set(photo, { xPercent: -50, yPercent: -100 });
    };
    addEventListener("resize", placePhoto);
    const dotEl = tk.querySelector(".wr-takeover__dot");
    const parts = [...links, ...foot, photo, dotEl].filter(Boolean);
    burger.addEventListener("click", () => {
      open = !open;
      if (open) WR.heart?.form(true);
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      WR.smoother?.paused(open);
      tl?.kill();
      if (reduced) { tk.style.visibility = open ? "visible" : "hidden"; tk.style.clipPath = ""; gsap.set(parts, { clearProps: "all" }); st.p = +open; heart(st.p); return; }
      const v = 160 * Math.min(1.5, Math.max(1, .4 + .6 * innerWidth / 1440));
      if (open) {
        if (tk.style.visibility !== "visible") {
          st.p = 0; tk.style.visibility = "visible"; tk.style.clipPath = "circle(0px at 0px 0px)"; placePhoto();
          gsap.set(links, { opacity: 0, x: v }); if (photo) gsap.set(photo, { opacity: 0, x: v }); gsap.set(foot, { opacity: 0, y: v });
          const cur = links.findIndex((a) => a.classList.contains("is-dot"));
          if (cur >= 0) { gsap.set(dotEl, { opacity: 0, x: v, y: links[cur].offsetTop + links[cur].offsetHeight / 2 - dotEl.offsetHeight / 2 }); gsap.to(dotEl, { opacity: 1, x: 0, duration: 1, ease: E, delay: .8 + .1 * cur }); }
          else gsap.set(dotEl, { opacity: 0 });
        }
        tl = gsap.timeline({ defaults: { ease: E, duration: 1 }, onComplete: () => (tl = null) })
          .to(st, { p: 1, duration: 1.4 * (1 - st.p), ease: "none", onUpdate: draw, onComplete: () => (tk.style.clipPath = "") }, 0)
          .to(links, { opacity: 1, x: 0, stagger: .1 }, .8);
        if (photo) tl.to(photo, { opacity: 1, x: 0 }, .8);
        tl.to(foot, { opacity: 1, y: 0, stagger: .15 }, 1.05);
      } else {
        tl = gsap.timeline({ defaults: { ease: E }, onComplete: () => { tl = null; WR.heart?.closed(); tk.style.visibility = "hidden"; tk.style.clipPath = ""; gsap.set(parts, { clearProps: "opacity,x,y" }); } })
          .to(parts, { opacity: 0, duration: .35 }, 0)
          .to(st, { p: 0, duration: .9 * st.p, ease: "none", onUpdate: draw }, .25);
      }
    });
    // Current-page dot: clicking another link makes the dot leap to that link in a parabola (peak .45em above the higher of the two links), squash and bounce twice as it lands, then navigate — the original gravityThrow·landing formula
    const dot = tk.querySelector(".wr-takeover__dot"), nav = tk.querySelector(".wr-takeover__links");
    const yOf = (a) => a.offsetTop + a.offsetHeight / 2 - dot.offsetHeight / 2;
    const here = () => nav.querySelector("a.is-dot");
    const hopSeg = (x0, y0, x1, y1, K, t, bulge = 0) => ({ hop: true, x0, y0, x1, y1, K, t, bulge });
    const squashSeg = (x, y, t, amt) => ({ hop: false, x, y, t, amt });
    const landing = (x, y, fall, tFall, cap) => {
      const out = [squashSeg(x, y, .085, .34)], top = Math.min(fall * .22, cap);
      [.22, .06].forEach((c, i) => { const f = top * (c / .22); if (f >= 1.5) { out.push(hopSeg(x, y, x, y, f, tFall * Math.sqrt(f / fall))); if (!i) out.push(squashSeg(x, y, .06, .16)); } });
      return out;
    };
    const pose = (segs, t) => {
      for (const g of segs) {
        if (t > g.t) { t -= g.t; continue; }
        const e = g.t ? t / g.t : 1;
        if (!g.hop) { const k = 1 - g.amt * Math.sin(Math.PI * e); return { x: g.x, y: g.y, sx: 1 / k, sy: k }; }
        const n = g.y1 - g.y0, l = 1 + .2 * Math.min(1, Math.abs(n - 4 * g.K * (1 - 2 * e)) / (Math.max(Math.abs(n - 4 * g.K), Math.abs(n + 4 * g.K)) || 1));
        return { x: g.x0 + (g.x1 - g.x0) * e + g.bulge * Math.sin(Math.PI * e), y: g.y0 + n * e - 4 * g.K * e * (1 - e), sx: 1 / Math.sqrt(l), sy: l };
      }
      const g = segs[segs.length - 1];
      return { x: g.hop ? g.x1 : g.x, y: g.hop ? g.y1 : g.y, sx: 1, sy: 1 };
    };
    const jumpTo = (from, to) => new Promise((done) => {
      const em = parseFloat(getComputedStyle(dot).fontSize), bulge = -Math.min(.55 * em, Math.max(0, nav.getBoundingClientRect().x - tk.getBoundingClientRect().x - dot.offsetWidth));
      const y0 = yOf(from), y1 = yOf(to), rise = .45 * em;
      const g = ((Math.sqrt(2 * rise) + Math.sqrt(2 * (rise + (Math.abs(yOf(links[1] || to) - yOf(links[0])) || em)))) / .62) ** 2;
      const apex = Math.min(y0, y1) - rise, tt = Math.sqrt(2 * (y0 - apex) / g) + Math.sqrt(2 * (y1 - apex) / g), fall = y1 - apex;
      const segs = [hopSeg(0, y0, 0, y1, g * tt * tt / 8, tt, bulge), ...landing(0, y1, fall, 2 * Math.sqrt(2 * fall / g), .35 * em)];
      from.classList.remove("is-dot"); to.classList.add("is-dot");
      gsap.set(dot, { transformOrigin: "50% 100%" });
      const clock = { t: 0 }, total = segs.reduce((a, b) => a + b.t, 0);
      gsap.to(clock, { t: total, duration: total, ease: "none", onUpdate: () => { const p = pose(segs, clock.t); gsap.set(dot, { x: p.x, y: p.y, scaleX: p.sx, scaleY: p.sy }); }, onComplete: () => { gsap.set(dot, { x: 0, y: y1, scaleX: 1, scaleY: 1 }); done(); } });
    });
    let jumping = false;
    links.forEach((a) => a.addEventListener("click", (e) => {
      const from = here();
      if (jumping) { e.preventDefault(); e.stopPropagation(); return; }
      if (!from || from === a || reduced || a.getAttribute("href") === "#") return;
      e.preventDefault(); e.stopPropagation(); jumping = true;
      jumpTo(from, a).then(() => WR.go(a.href));
    }));
    if (!fine || reduced) return;
    links.forEach((a) => {
      const chars = a.querySelectorAll(".ch"), roll = (up) => gsap.to(chars, { y: up ? "-1.1em" : 0, duration: 1, ease: E, stagger: { each: .05, from: "random" }, overwrite: true });
      a.addEventListener("pointerenter", () => roll(true)); a.addEventListener("pointerleave", () => roll(false));
      a.addEventListener("focus", () => roll(true)); a.addEventListener("blur", () => roll(false));
    });
  };

  // Ball cursor (original formula): the ball sticks directly to the pointer, and when speed exceeds 30px/s it stretches in that direction up to 1.55x (velocity interpolation 18/s).
  // The six tail dots follow the previous dot by exponential interpolation (30/s), and the verb letters follow at 20/s. The verb shows only at data-cursor spots, and over links and buttons the cursor stays a plain ball.
  // When empty, pressing makes it hop 46px (.44s), squash, and settle with two small bounces. The text color changes by the background (dark · accent · photo)
  const initCursor = () => {
    if (!fine) return;
    const VERBS = { scroll: ["Scroll", "↓"], hover: ["Lift it up", ""], draw: ["Try drawing", ""], drag: ["Pull", "↔"], peel: ["Detaching", ""], stick: ["Insert", ""] };
    const el = (cls, txt = "") => Object.assign(document.createElement("span"), { className: cls, textContent: txt });
    const root = el("wr-cursor"), verb = el("wr-cursor__verb"), vin = el("wr-cursor__verb-in"), word = el("wr-cursor__w");
    const ball = el("wr-cursor__ball"), bin = el("wr-cursor__ball-in"), dot = el("wr-cursor__dot"), trail = el("wr-cursor__trail");
    root.setAttribute("aria-hidden", "true"); root.dataset.slot = "cursor"; root.dataset.on = "false"; root.dataset.mode = "idle"; root.dataset.tone = "light";
    vin.append(word); verb.append(vin); bin.append(dot); ball.append(bin);
    const tail = Array.from({ length: 6 }, () => { const d = el("wr-cursor__tail"); trail.append(d); return { el: d, x: -200, y: -200 }; });
    trail.hidden = reduced;
    root.append(verb, trail, ball); document.body.append(root);
    document.documentElement.classList.add("wr-has-cursor");
    const ease = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
    const ptr = { x: -200, y: -200, seen: false }, lag = { x: -200, y: -200 }, vel = { x: null, y: null, vx: 0, vy: 0 };
    let cur = "", lastEl = null, lastAttr, hop = null, hopT = 0, last = performance.now();
    const show = (v) => {
      if (v === cur) return; cur = v;
      if (v === null) { root.dataset.on = "false"; return; }
      root.dataset.on = ptr.seen ? "true" : "false"; root.dataset.mode = v ? "word" : "idle";
      if (!v) return;
      verb.dataset.verb = v;
      const [label, arrow] = VERBS[v], chars = [...label].map((c, i) => { const ch = el("wr-cursor__ch", c); ch.style.setProperty("--i", i); return ch; });
      if (v === "draw") {
        const ink = el("wr-cursor__ink"), pen = el("wr-cursor__pen");
        ink.append(...chars);
        pen.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
        word.replaceChildren(pen, ink); return;
      }
      word.replaceChildren(...chars);
      if (arrow) word.append(el("wr-cursor__arrow", arrow));
    };
    const verbOf = (t) => {
      const hit = t?.closest?.('[data-cursor], a[href], button, [role="button"], summary, label, select, input, textarea, [contenteditable=""], [contenteditable="true"]');
      if (!hit) return "";
      if (hit.hasAttribute("data-cursor")) { const v = hit.dataset.cursor; return v === "none" ? null : VERBS[v] ? v : ""; }
      return hit.matches('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable=""], [contenteditable="true"]') ? null : "";
    };
    const accent = (() => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim(); c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3); })();
    const toneOf = (t) => {
      for (let n = t; n && n.nodeType === 1; n = n.parentElement) {
        if (n.dataset.cursorTone) return n.dataset.cursorTone;
        if (n.tagName === "IMG" || n.tagName === "VIDEO" || n.tagName === "CANVAS") return "photo";
        const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
        if (!m || (m.length > 3 && +m[3] < .5)) continue;
        const [r, g, b] = m.map(Number);
        if (Math.hypot(r - accent[0], g - accent[1], b - accent[2]) < 90) return "red";
        return (.2126 * r + .7152 * g + .0722 * b) / 255 < .4 ? "dark" : "light";
      }
      return "light";
    };
    const read = (t, force = false) => {
      const attr = t?.closest?.("[data-cursor]")?.dataset.cursor;
      if (t === lastEl && attr === lastAttr && !force) return;
      lastEl = t; lastAttr = attr;
      show(verbOf(t));
      root.dataset.tone = toneOf(t);
      root.dataset.ink = t?.closest?.("[data-cursor-ink]")?.dataset.cursorInk ?? "";
    };
    let rq = 0;
    const reread = () => { if (ptr.seen && !rq) rq = requestAnimationFrame(() => { rq = 0; read(document.elementFromPoint(ptr.x, ptr.y), true); }); };
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      ptr.x = e.clientX; ptr.y = e.clientY;
      if (!ptr.seen) { ptr.seen = true; lag.x = ptr.x; lag.y = ptr.y; tail.forEach((d) => { d.x = ptr.x; d.y = ptr.y; }); }
      if (cur !== null) root.dataset.on = "true";
      read(e.target);
    }, { passive: true });
    addEventListener("pointerover", (e) => { if (ptr.seen && e.pointerType === "mouse") read(e.target); }, { passive: true });
    addEventListener("scroll", reread, { passive: true });
    new MutationObserver(reread).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-cursor", "data-cursor-tone"] });
    // Hop: jumps 46px in .44s, on landing squashes .34 for .085s → bounces 10.1px (.206s) → squashes .16 for .06s → bounces 2.8px (.108s)
    const H0 = 46, T0 = .44;
    const jump = (K, t) => ({ hop: true, K, t });
    const squash = (t, amt) => ({ hop: false, t, amt });
    const landing = () => { const s = [squash(.085, .34)]; [.22, .06].forEach((k, i) => { const f = H0 * k; if (f >= 1.5) { s.push(jump(f, T0 * Math.sqrt(f / H0))); if (i === 0) s.push(squash(.06, .16)); } }); return s; };
    const poseAt = (segs, t) => {
      for (const g of segs) {
        if (t > g.t) { t -= g.t; continue; }
        const e = g.t ? t / g.t : 1;
        if (!g.hop) { const k = 1 - g.amt * Math.sin(Math.PI * e); return { y: 0, sx: 1 / k, sy: k }; }
        const y = -4 * g.K * e * (1 - e), l = 1 + .2 * Math.min(1, Math.abs(-4 * g.K * (1 - 2 * e)) / (4 * g.K || 1));
        return { y, sx: 1 / Math.sqrt(l), sy: l };
      }
      return { y: 0, sx: 1, sy: 1 };
    };
    const total = (segs) => segs.reduce((a, g) => a + g.t, 0);
    addEventListener("pointerdown", () => { verb.classList.add("is-down"); if (cur === "" && !reduced) { hop = [jump(H0, T0), ...landing()]; hopT = 0; } });
    addEventListener("pointerup", () => verb.classList.remove("is-down"));
    document.documentElement.addEventListener("pointerleave", () => { root.dataset.on = "false"; lastEl = null; });
    const frame = (now) => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (vel.x !== null && dt > 0) { vel.vx = ease(vel.vx, (ptr.x - vel.x) / dt, 18, dt); vel.vy = ease(vel.vy, (ptr.y - vel.y) / dt, 18, dt); }
      vel.x = ptr.x; vel.y = ptr.y;
      lag.x = reduced ? ptr.x : ease(lag.x, ptr.x, 20, dt); lag.y = reduced ? ptr.y : ease(lag.y, ptr.y, 20, dt);
      verb.style.transform = verb.dataset.verb === "draw" && cur === "draw" ? `translate3d(${ptr.x}px, ${ptr.y}px, 0) translate(-0.1em, -0.945em)` : `translate3d(${lag.x}px, ${lag.y}px, 0) translate(-50%, -50%)`;
      let by = ptr.y, tf = "";
      if (hop) { hopT += dt; const p = poseAt(hop, hopT); if (hopT > total(hop)) hop = null; by += p.y; tf = `scale(${p.sx}, ${p.sy})`; }
      else if (!reduced) { const sp = Math.hypot(vel.vx, vel.vy); if (sp > 30) { const k = Math.min(.55, sp / 2600); tf = `rotate(${Math.atan2(vel.vy, vel.vx)}rad) scale(${1 + k}, ${1 / (1 + k)})`; } }
      ball.style.transform = `translate3d(${ptr.x}px, ${by}px, 0)`;
      if (!reduced) { let px = ptr.x, py = by; for (const d of tail) { d.x = ease(d.x, px, 30, dt); d.y = ease(d.y, py, 30, dt); d.el.style.transform = `translate3d(${d.x}px, ${d.y}px, 0)`; px = d.x; py = d.y; } }
      dot.style.transform = tf; dot.style.transformOrigin = hop ? "50% 100%" : "50% 50%";
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  // Burger heart (current original): on hover the strokes gather from the center into a heart over .7s (power4.out), staggered .03s each, and once gathered a heartbeat (1.2x .1s → 1 .16s → 1.11x .09s → 1 .22s → rest .43s) repeats at 1.6x speed.
  // On leaving, the throbbing stops and it returns to its own size in .25s, and the strokes return from the outside to three lines in .55s. Opening the menu gathers them quickly at .35s and .012s
  const initHeart = () => {
    const b = document.querySelector(".wr-burger"), hb = b.querySelector(".wr-burger__heart");
    const [L, R] = [...b.querySelectorAll("i")].map((i) => [...i.querySelectorAll("path")]);
    const pairs = L.map((p, i) => [p, R[i]]), mid = (BARS.length - 1) / 2, far = (i) => Math.abs(i - mid), E = "power4.out";
    gsap.set(pairs.flat(), { svgOrigin: "0 0" });
    pairs.forEach((pp, i) => gsap.set(pp, LINE[i]));
    // The heartbeat goes on the inner heart rather than the button (original span.nav-heart) — the button spot stays as is
    gsap.set(hb, { transformOrigin: "50% 55%" });
    const beat = gsap.timeline({ repeat: -1, paused: true })
      .to(hb, { scale: 1.2, duration: .1, ease: "power2.out" }).to(hb, { scale: 1, duration: .16, ease: "power2.in" })
      .to(hb, { scale: 1.11, duration: .09, ease: "power2.out" }).to(hb, { scale: 1, duration: .22, ease: "power2.in" }).to({}, { duration: .43 }).timeScale(1.6);
    const st = { heart: false, near: false, morph: null };
    const free = () => !document.body.classList.contains("menu-open");
    const form = (quick) => {
      if (st.heart) return;
      st.heart = true; st.morph?.kill();
      if (reduced) { pairs.forEach((pp) => gsap.set(pp, { x: 0, y: 0, scaleX: 1, scaleY: 1 })); return; }
      const d = quick ? .35 : .7, gap = quick ? .012 : .03;
      st.morph = gsap.timeline({ onComplete: () => free() && beat.play(0) });
      pairs.forEach((pp, i) => st.morph.to(pp, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: d, ease: E }, far(i) * gap));
    };
    const unform = () => {
      if (!st.heart) return;
      st.heart = false; st.morph?.kill(); beat.pause();
      gsap.to(hb, { scale: 1, duration: .25, ease: "power2.out" });
      if (reduced) { pairs.forEach((pp, i) => gsap.set(pp, LINE[i])); return; }
      st.morph = gsap.timeline();
      pairs.forEach((pp, i) => st.morph.to(pp, { ...LINE[i], duration: .55, ease: E }, (pairs.length / 2 - far(i)) * .03));
    };
    WR.heart = { form: (quick) => { form(quick); beat.pause(0); }, closed: () => (st.near ? !reduced && beat.play(0) : unform()) };
    b.addEventListener("pointerenter", (e) => { if (e.pointerType === "touch") return; st.near = true; if (free()) form(); });
    b.addEventListener("pointerleave", (e) => { if (e.pointerType === "touch") return; st.near = false; if (free()) unform(); });
    b.addEventListener("focus", () => { if (!b.matches(":focus-visible")) return; st.near = true; if (free()) form(); });
    b.addEventListener("blur", () => { st.near = false; if (free()) unform(); });
  };

  // Logo dandelion: on press, the dots in the logo letters’ area (3.6 cells of the original 500×219 panel) burst outward, then drift like seeds in the wind (240~520px/s, gust 1+.28sin(.9t)+.12sin(2.3t+1))
  const initPuff = () => {
    if (reduced) return;
    let cv, ctx, raf = 0, last = 0, t = 0, parts = [], seeds = null;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const sample = (logo) => {
      const k = 4, w = 98 * k, h = 43 * k, c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.scale(k, k);
      g.font = `400 40px ${getComputedStyle(logo.querySelector("text") || logo).fontFamily}`;
      g.fillText("Logo", 0, 33);
      g.lineWidth = 2; g.lineCap = "round"; g.stroke(new Path2D("M2 39c18-4 40-5 62-2"));
      g.translate(70, 4); g.scale(.075, .075); g.fill(new Path2D("M150 236C60 170 4 118 4 66 4 30 32 4 68 4c34 0 62 22 82 52C170 26 198 4 232 4c36 0 64 26 64 62 0 52-56 104-146 170Z"));
      const px = g.getImageData(0, 0, w, h).data, out = [], step = 3.6 * 98 / 500;
      for (let y = step / 2; y < 43; y += step) for (let x = step / 2; x < 98; x += step) {
        const sx = x + step * rnd(-.35, .35), sy = y + step * rnd(-.35, .35);
        if (px[(Math.floor(sy * k) * w + Math.floor(sx * k)) * 4 + 3] > 96) out.push({ x: sx, y: sy });
      }
      return out;
    };
    const step = (now) => {
      const dt = 1.1 * Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; t += dt;
      const W = innerWidth, H = innerHeight, gust = 1 + .28 * Math.sin(.9 * t) + .12 * Math.sin(2.3 * t + 1);
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.age += dt; if (p.age < 0) continue;
        const k = 1 - Math.exp(-p.drag * dt);
        p.vx += (p.wind * gust * p.kv - p.vx) * k; p.vy += ((p.sink + 70 * Math.sin(t * p.fl + p.ph)) * p.kv - p.vy) * k;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.a = p.age < .25 ? p.age / .25 : p.x > .88 * W ? Math.max(0, p.a - 1.2 * dt) : 1;
        ctx.globalAlpha = p.a; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        if (p.hair) {
          const lean = .35 * Math.atan2(p.vy, p.vx + 1);
          ctx.strokeStyle = p.col; ctx.lineWidth = .8 * p.u; ctx.globalAlpha = .7 * p.a; ctx.beginPath();
          for (let n = -1; n <= 1; n++) { const o = -Math.PI / 2 - lean + .55 * n + .2 * Math.sin(3 * t + p.ph); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(o) * p.r * 4, p.y + Math.sin(o) * p.r * 4); }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      parts = parts.filter((p) => p.age < 0 || (p.x < W + 30 && p.x > -60 && p.y < H + 40 && p.y > -80 && p.a > 0));
      if (parts.length) raf = requestAnimationFrame(step); else { ctx.clearRect(0, 0, W, H); raf = 0; }
    };
    let lastPuff = -1e9;
    document.addEventListener("click", (e) => {
      const logo = e.target.closest(".wr-header .wr-logo");
      if (!logo || performance.now() - lastPuff < 450) return;
      lastPuff = performance.now();
      if (!cv) { cv = document.createElement("canvas"); cv.className = "wr-puff"; document.body.append(cv); ctx = cv.getContext("2d"); }
      const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seeds ??= sample(logo);
      const r = logo.getBoundingClientRect(), u = r.width / 98, kv = Math.max(.45, innerWidth / 1440), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const keep = .5 * Math.min(1, Math.max(.3, innerWidth / 1440)), col = getComputedStyle(logo).color;
      for (const p of seeds) {
        if (Math.random() > keep || parts.length >= 2400) continue;
        const x = r.left + p.x * u, y = r.top + p.y * u, ang = Math.atan2(y - cy, x - cx) + rnd(-.6, .6), sp = rnd(160, 560) * kv;
        let vy = Math.sin(ang) * sp; if (vy < 0) vy *= .35;
        parts.push({ col, u, kv, x, y, vx: Math.cos(ang) * sp, vy, a: 0, age: -(p.x / 98 * .12 + rnd(0, .16)), wind: rnd(240, 520), sink: rnd(-10, 120), drag: rnd(1.4, 2.6), r: rnd(1.2, 2.8) * u, ph: rnd(0, 6.3), fl: rnd(1.2, 3.4), hair: Math.random() < .55 });
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    });
  };

  // Header inversion: if the background under the header is the accent color (red section), the logo · burger take the text color — same result as the inverted that the original About page’s red sections turn on. When the menu is open, back to the original color
  const initInvert = () => {
    const h = document.querySelector(".wr-header");
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim(); c.fillRect(0, 0, 1, 1);
    const acc = [...c.getImageData(0, 0, 1, 1).data].slice(0, 3);
    let rq = 0;
    const check = () => {
      rq = 0;
      const r = h.getBoundingClientRect(), y = r.top + r.height / 2;
      let red = false;
      for (const el of document.elementsFromPoint(innerWidth / 2, y)) {
        if (el.closest(".wr-header, .wr-cursor, .wr-ticker, .wr-pre, .wr-sticker")) continue;
        const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number);
        if (!m || (m.length > 3 && m[3] < .5)) continue;
        red = Math.hypot(m[0] - acc[0], m[1] - acc[1], m[2] - acc[2]) < 90;
        break;
      }
      h.classList.toggle("is-inverted", red);
    };
    const ask = () => { if (!rq) rq = requestAnimationFrame(check); };
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    WR.whenReady(ask);
  };

  // Header hide: scrolling down more than 4px hides it upward by 110% (.4s), and scrolling up or being within the top 10px shows it. If the menu is open it stays as is
  const initAway = () => {
    const h = document.querySelector(".wr-header");
    let last = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY;
      if (document.body.classList.contains("menu-open")) { last = y; return; }
      if (y < 10) h.classList.remove("is-away"); else if (y > last + 4) h.classList.add("is-away"); else if (y < last - 4) h.classList.remove("is-away");
      last = y;
    }, { passive: true });
  };

  // Header entrance: when loading ends, the logo and burger settle down from 14px above in .6s (power3.out), .07s apart
  const initNavEnter = () => {
    if (reduced) return;
    gsap.fromTo([".wr-header .wr-logo", ".wr-burger"], { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: .6, ease: "power3.out", stagger: .07, clearProps: "opacity,transform" });
  };

  // Flipped big word: letters get pushed away by 1.2% of the width within the cursor radius (12% of the width) and return with a spring (120 · damping 14)
  const initUnfold = () => {
    const u = document.querySelector(".wr-unfold");
    if (!u) return;
    const panel = u.querySelector(".wr-unfold__panel");
    if (!reduced) gsap.fromTo(panel, { rotationX: -88 }, { rotationX: 0, ease: "none", scrollTrigger: { trigger: u, start: "top bottom", end: "bottom bottom", scrub: true } });
    if (!fine || reduced) return;
    const ls = [...u.querySelectorAll(".wr-unfold__word span")], st = ls.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    let mx = 0, my = 0, over = false, last = 0;
    u.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; over = true; });
    u.addEventListener("pointerleave", () => (over = false));
    const tick = (t) => {
      const dt = last ? Math.min((t - last) / 1000, .05) : .016; last = t;
      const w = panel.clientWidth, amp = .012 * w, rad = .12 * w;
      ls.forEach((el, i) => {
        const s = st[i]; let tx = 0, ty = 0;
        if (over) { const b = el.getBoundingClientRect(), dx = b.left + b.width / 2 + s.x - mx, dy = b.top + b.height / 2 + s.y - my, d = Math.hypot(dx, dy) || 1, f = amp * Math.exp(-(d * d) / (rad * rad)); tx = dx / d * f; ty = dy / d * f; }
        s.vx += ((tx - s.x) * 120 - 14 * s.vx) * dt; s.vy += ((ty - s.y) * 120 - 14 * s.vy) * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        el.style.left = `${(-s.x).toFixed(2)}px`; el.style.top = `${(s.y).toFixed(2)}px`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Page transition: for our own page links a cream curtain covers in .35s then navigates, and the new page opens as the curtain lifts
  const initTransition = () => {
    const veil = document.createElement("div");
    veil.dataset.slot = "page-transition";
    Object.assign(veil.style, { position: "fixed", inset: 0, zIndex: 2147482000, background: "var(--kf-bg)", pointerEvents: "none" });
    document.body.append(veil);
    // The curtain lifts open only when arriving from our own page, and entering directly from outside has no curtain, like the original
    const inside = (() => { try { return new URL(document.referrer).origin === location.origin; } catch { return false; } })();
    if (inside) gsap.to(veil, { autoAlpha: 0, duration: reduced ? 0 : .45, ease: "power2.out", delay: .05 });
    else gsap.set(veil, { autoAlpha: 0 });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (href === "#top" || a.hasAttribute("data-top")) { e.preventDefault(); WR.smoother ? WR.smoother.scrollTo(0, true) : scrollTo({ top: 0, behavior: "smooth" }); return; }
      if (!href || href.startsWith("#") || a.href === location.href) return;
      e.preventDefault();
      WR.go(a.href);
    });
    WR.go = (href) => gsap.to(veil, { autoAlpha: 1, duration: reduced ? 0 : .35, ease: "power2.in", onComplete: () => (location.href = href) });
  };

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase, ...(window.Physics2DPlugin ? [Physics2DPlugin] : []));
  render();
  // The first page with loading calls WR.setReady() when loading finishes — until then the doll and header entrances wait
  const waiting = [];
  window.WR = {
    page, fine, reduced, smoother: null, ready: false,
    whenReady: (fn) => (WR.ready ? fn() : waiting.push(fn)),
    setReady: () => { if (WR.ready) return; WR.ready = true; waiting.splice(0).forEach((fn) => fn()); },
  };
  if (!reduced) WR.smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: .6, effects: false });
  initTicker();
  initMenu();
  initCursor();
  initHeart();
  initAway();
  initInvert();
  initPuff();
  initUnfold();
  initTransition();
  WR.whenReady(initNavEnter);
  if (!document.querySelector(".wr-pre")) WR.setReady();
})();
