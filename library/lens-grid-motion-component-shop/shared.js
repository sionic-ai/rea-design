/* Shared by all pages: draws the header row · phone menu · footer, and hooks up Lenis scroll · header row hiding · dropdown · FAQ (goo) · card ring · sequential rise. 
   Pictures in photo slots (canvas, SVG) read the skin variables to paint — change the skin and they change too. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const page = document.body.dataset.page || "home";

  /* ── Photo slot art: a different ”component preview” composition per seed. Stands in for the original preview photo slot ── */
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const shotSVG = (seed, opts = {}) => {
    const r = rand(seed * 97 + 13);
    const kind = seed % 5;
    const fill = (v) => `style="fill:var(${v})"`;
    let body = "";
    if (kind === 0) {
      body = `<rect x="18" y="20" width="${40 + r() * 30}" height="56" ${fill("--kf-accent")}/><rect x="${70 + r() * 10}" y="30" width="34" height="46" ${fill("--kf-contrast-ink")}/><rect x="112" y="24" width="30" height="52" ${fill("--site-shot-ink")}/>`;
    } else if (kind === 1) {
      body = `<circle cx="${60 + r() * 30}" cy="50" r="${16 + r() * 12}" ${fill("--kf-accent")}/><rect x="16" y="78" width="70" height="4" ${fill("--site-shot-ink")}/><rect x="16" y="86" width="44" height="4" ${fill("--site-shot-ink")}/>`;
    } else if (kind === 2) {
      body = `<text x="18" y="56" font-size="22" font-weight="500" ${fill("--kf-contrast-ink")} style="font-family:var(--kf-font-display);letter-spacing:-0.04em">Title ${String(seed % 90 + 10)}</text><rect x="18" y="66" width="${50 + r() * 50}" height="4" ${fill("--kf-accent")}/>`;
    } else if (kind === 3) {
      body = Array.from({ length: 4 }, (_, i) => `<rect x="${18 + i * 30}" y="${28 + (i % 2) * 8}" width="24" height="${36 + r() * 12}" ${fill(i === 1 ? "--kf-accent" : "--site-shot-ink")}/>`).join("");
    } else {
      body = `<path d="M18 80 L60 ${30 + r() * 20} L90 60 L140 26" stroke-width="3" fill="none" style="stroke:var(--kf-accent)"/><rect x="18" y="18" width="40" height="4" ${fill("--kf-contrast-ink")}/>`;
    }
    return `<svg viewBox="0 0 160 100" aria-hidden="true">${body}</svg>`;
  };

  /* Paints the same composition onto the canvas (WebGL pattern board) — the drawing board the shader reads */
  const paintShot = (ctx, x, y, w, h, seed, label) => {
    const r = rand(seed * 97 + 13);
    const c = { bg: css("--kf-contrast-bg"), ink: css("--kf-contrast-ink"), acc: css("--kf-accent"), dim: css("--kf-dim") };
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);
    const s = w / 160;
    ctx.scale(s, s);
    const kind = seed % 5;
    ctx.fillStyle = c.acc;
    if (kind === 0) { ctx.fillRect(18, 20, 40 + r() * 30, 56); ctx.fillStyle = c.ink; ctx.fillRect(74, 30, 34, 46); ctx.fillStyle = c.dim; ctx.fillRect(114, 24, 30, 52); }
    else if (kind === 1) { ctx.beginPath(); ctx.arc(60 + r() * 30, 48, 16 + r() * 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = c.dim; ctx.fillRect(16, 78, 70, 4); ctx.fillRect(16, 86, 44, 4); }
    else if (kind === 2) { ctx.fillStyle = c.ink; ctx.font = `500 22px ${css("--kf-font-display")}`; ctx.fillText(`Title ${seed % 90 + 10}`, 18, 56); ctx.fillStyle = c.acc; ctx.fillRect(18, 66, 50 + r() * 50, 4); }
    else if (kind === 3) { for (let i = 0; i < 4; i++) { ctx.fillStyle = i === 1 ? c.acc : c.dim; ctx.fillRect(18 + i * 30, 28 + (i % 2) * 8, 24, 36 + r() * 12); } }
    else { ctx.strokeStyle = c.acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, 80); ctx.lineTo(60, 30 + r() * 20); ctx.lineTo(90, 60); ctx.lineTo(140, 26); ctx.stroke(); ctx.fillStyle = c.ink; ctx.fillRect(18, 18, 40, 4); }
    ctx.restore();
    if (label) {
      ctx.fillStyle = c.dim;
      ctx.font = `400 ${Math.round(h * 0.06)}px ${css("--kf-font-mono")}`;
      ctx.fillText(label, x + w * 0.04, y + h * 0.93);
    }
  };

  const markSVG = '<svg class="an-brand__mark" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="362" style="--i:0" d="M3 20 L21 20"/><path pathLength="362" style="--i:1" d="M3 13 L21 13"/><path pathLength="362" style="--i:2" d="M3 6 L21 6"/></svg>';
  const arrow = (dir) => `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="${dir < 0 ? "M7 1 2.5 5 7 9z" : "M3 1 7.5 5 3 9z"}" fill="currentColor"/></svg>`;

  /* ── Headline ── */
  const links = [
    { key: "library", label: "Library", href: "detail.html", drop: [["All components", "Your one-line description here"], ["By category", "Your one-line description here"], ["Free components", "Your one-line description here"]] },
    { key: "kits", label: "Kits", href: "product.html", drop: [["Menu Kit", "Your one-line description here"], ["Reveal Kit", "Your one-line description here"]] },
    { key: "learn", label: "Learn", href: "list.html", drop: [["Showcase", "Your one-line description here"], ["Guides", "Your one-line description here"]] },
    { key: "docs", label: "Docs", href: "site.html" },
    { key: "pricing", label: "Pricing", href: "index.html#pricing" },
  ];
  const header = document.createElement("header");
  header.className = "an-nav";
  header.dataset.slot = "nav";
  header.innerHTML = `
    <a class="an-brand" href="index.html" aria-label="Back to start" data-label="Brand English name">${markSVG}<span class="an-brand__name">Brand</span><span class="an-brand__by">by Studio</span></a>
    <nav class="an-nav__links" aria-label="Main menu" data-label="Menu English name">
      ${links.map((l) => `<div class="an-nav__item" data-key="${l.key}">${l.drop
        ? `<a class="an-nav__link" href="${l.href}" aria-expanded="false"${l.key === page ? ' aria-current="page"' : ""}>${l.label}</a>`
        : `<a class="an-nav__link" href="${l.href}"${l.key === page ? ' aria-current="page"' : ""}>${l.label}</a>`}</div>`).join("")}
    </nav>
    <div class="an-mega" data-slot="mega-menu"><i class="an-mega__slide"></i><div class="an-mega__inner"><p class="an-drop__head" data-mega-head>Menu</p><div>${links.filter((l) => l.drop).map((l) => `<div class="an-drop" data-drop="${l.key}">${l.drop.map(([t, d]) => `<a href="${l.href}"><b>${t}</b><span>${d}</span></a>`).join("")}</div>`).join("")}</div></div></div>
    <div class="an-nav__right"><a class="an-nav__login" href="#">Login</a><a class="an-btn" href="index.html#pricing">Get access</a></div>
    <button class="an-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span></span></button>`;
  document.body.prepend(header);

  const mnav = document.createElement("div");
  mnav.className = "an-mnav";
  mnav.dataset.slot = "menu-panel";
  mnav.setAttribute("data-lenis-prevent", "");
  mnav.innerHTML = `
    <div class="an-mnav__top"><a class="an-brand" href="index.html">${markSVG}<span class="an-brand__name">Brand</span><span class="an-brand__by">by Studio</span></a><button class="an-mnav__close" type="button" aria-label="Close Menu"></button></div>
    ${links.map((l) => l.drop
      ? `<div class="an-mnav__row"><button type="button">${l.label}<i class="an-mnav__plus"></i></button><div class="an-mnav__sub"><div>${l.drop.map(([t]) => `<a href="${l.href}">${t}</a>`).join("")}</div></div></div>`
      : `<div class="an-mnav__row"><a href="${l.href}">${l.label}</a></div>`).join("")}
    <div class="an-mnav__foot"><a class="an-nav__login" href="#">Login</a><a class="an-btn" href="index.html#pricing">Get access</a></div>`;
  document.body.append(mnav);

  /* ── Footer ── */
  const cols = [
    ["Platform", ["How it works", "Documentation", "MCP server", "Learn", "Free tools", "Compare", "Changelog", "Roadmap", "Pricing", "FAQs", "Affiliates"]],
    ["Library", ["All components", "Buttons", "Scroll", "UI Components", "Experimental", "Shaders", "Menus", "Sections", "Showcase"]],
    ["Kits", ["See the Kits", "What a Kit is", "Kit vs. the Library"]],
  ];
  const footer = document.createElement("footer");
  footer.className = "an-foot";
  footer.dataset.slot = "footer";
  footer.innerHTML = `
    <div class="an-foot__bar">
      <p class="an-foot__ship"><i></i>New Release: <b>Component Name</b> · <span>today</span></p>
      <p class="an-foot__ask">Ask ${["M6 1v10M1 6h10M2.5 2.5l7 7M9.5 2.5l-7 7", "M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm0 3v4", "M2 2h8v8H2z", "M2 6a4 4 0 0 1 7-2.6M10 6a4 4 0 0 1-7 2.6"].map((d) => `<a href="#" aria-label="Tool"><svg viewBox="0 0 12 12"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></a>`).join("")}<span class="an-foot__time" data-clock>00:00</span></p>
    </div>
    <div class="an-foot__main">
      <div class="an-foot__news">
        ${markSVG}
        <p class="an-foot__drop"><b>Weekly drop</b><i></i><span>Your subscriber count line here</span></p>
        <form class="an-field" onsubmit="return false"><input type="email" placeholder="you@studio.com" aria-label="Email"><button class="an-btn" type="submit">Join</button></form>
        <label class="an-check"><input type="checkbox"> Here <u>Consent text</u></label>
        <p class="an-foot__social">${["M2 2l8 8M10 2 2 10", "M2 2h8v8H2z", "M6 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M3 9V5l3-3 3 3v4"].map((d) => `<a href="#" aria-label="Social"><svg viewBox="0 0 12 12"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a>`).join("")}<a class="is-text" href="#">Contact</a></p>
        <svg class="an-foot__mark" viewBox="0 0 262 132" aria-hidden="true" data-label="Brand mark large"><path d="M18 132a113 113 0 0 1 226 0" fill="none" stroke="currentColor" stroke-width="36"/><path d="M82 132a49 49 0 0 1 98 0" fill="none" stroke="currentColor" stroke-width="36"/></svg>
      </div>
      <div class="an-foot__cols">${cols.map(([h, items]) => `<div><h4>${h}</h4><ul>${items.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div>`).join("")}</div>
    </div>
    <div class="an-foot__base"><p>© 0000 Brand · Built by <b>Studio</b></p><nav><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a><a href="#">Refund</a><a href="#">Cookie Preferences</a></nav></div>`;
  document.body.append(footer);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("aria-hidden", "true");
  defs.style.cssText = "position:absolute;width:0;height:0";
  defs.innerHTML = '<filter id="an-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter>';
  document.body.append(defs);

  const clock = footer.querySelector("[data-clock]");
  const tick = () => { const d = new Date(); clock.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} KST`; };
  tick();
  setInterval(tick, 30000);

  /* Logo: on hover the three strokes vanish immediately, then are redrawn with in-out easing from .45s to .83s */
  document.querySelectorAll(".an-brand").forEach((b) => b.addEventListener("pointerenter", () => {
    if (reduce) return;
    b.querySelectorAll(".an-brand__mark path").forEach((p) => p.animate(
      [{ strokeDashoffset: 362, offset: 0 }, { strokeDashoffset: 362, offset: 0.54, easing: "cubic-bezier(.45,0,.55,1)" }, { strokeDashoffset: 0, offset: 1 }],
      { duration: 833 }));
  }));

  /* ── Text roll: button · menu text stacked in two copies, rolls up one line on hover ── */
  const roll = (el, text) => {
    const t = text ?? el.textContent.trim();
    el.innerHTML = `<span class="an-roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  };
  document.querySelectorAll(".an-btn:not(.is-plain), .an-nav__link").forEach((el) => { if (!el.querySelector("svg, i, b")) roll(el); });

  /* Cards entering in sequence — in the original list, cards appear one after another at .35s after .25s */
  if (!reduce) document.querySelectorAll("[data-stagger]").forEach((g) => gsap.from(g.children, { autoAlpha: 0, y: 16, duration: 0.3, stagger: 0.015, delay: 0.26, ease: "power2.out" }));
  document.querySelectorAll(".an-dock__chip[data-drop]").forEach((c) => c.addEventListener("click", () => c.classList.toggle("is-open")));

  /* ── Page transition: a background-color curtain covers in .18s, stays, passes over in .7s, and lifts on the arrived page in .53s (original out 183 · hold 583 · in 533ms) ── */
  const veil = document.createElement("div");
  veil.className = "an-veil";
  document.body.append(veil);
  if (sessionStorage.getItem("an-veil") === "1") {
    sessionStorage.removeItem("an-veil");
    veil.style.opacity = "1";
    if (!reduce) gsap.to(veil, { opacity: 0, duration: 0.53, ease: "power2.out" }); else veil.style.opacity = "0";
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    if (reduce) { location.href = url.href; return; }
    sessionStorage.setItem("an-veil", "1");
    gsap.to(veil, { opacity: 1, duration: 0.26, ease: "power2.out" });
    gsap.delayedCall(0.7, () => { location.href = url.href; });
  });

  /* ── Lenis (original 1.3.17) + ScrollTrigger ── */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Header bar: hides on scroll down and returns in surface color on scroll up — original .5s expo.out */
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-solid", y > 40);
    if (Math.abs(y - lastY) > 4) header.classList.toggle("is-hidden", y > lastY && y > 120 && !mnav.classList.contains("is-open"));
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* Big dropdown — hovering the menu grows a panel under the header row, and leaving the header row folds it after .15s */
  let megaT;
  const megaHead = header.querySelector("[data-mega-head]");
  const closeMega = () => { header.classList.remove("is-mega"); header.querySelectorAll(".an-nav__item.is-open").forEach((i) => { i.classList.remove("is-open"); i.firstElementChild.setAttribute("aria-expanded", "false"); }); };
  header.querySelectorAll(".an-nav__item").forEach((item) => {
    item.addEventListener("pointerenter", () => {
      clearTimeout(megaT);
      const drop = header.querySelector(`[data-drop="${item.dataset.key}"]`);
      if (!drop) { megaT = setTimeout(closeMega, 150); return; }
      header.querySelectorAll(".an-nav__item").forEach((i) => { const on = i === item; i.classList.toggle("is-open", on); i.firstElementChild.setAttribute("aria-expanded", String(on)); });
      header.querySelectorAll("[data-drop]").forEach((d) => d.classList.toggle("is-on", d === drop));
      megaHead.textContent = item.textContent.trim().split("\n")[0];
      header.classList.add("is-mega");
    });
  });
  header.addEventListener("pointerleave", () => { megaT = setTimeout(closeMega, 100); });
  header.querySelector(".an-mega").addEventListener("pointerenter", () => clearTimeout(megaT));

  const burger = header.querySelector(".an-burger");
  const setMenu = (on) => {
    mnav.classList.toggle("is-open", on);
    burger.setAttribute("aria-expanded", on);
    on ? lenis?.stop() : lenis?.start();
  };
  burger.addEventListener("click", () => setMenu(true));
  mnav.querySelector(".an-mnav__close").addEventListener("click", () => setMenu(false));
  mnav.querySelectorAll(".an-mnav__row > button").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  footer.querySelectorAll(".an-foot__cols h4").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("is-open")));

  /* ── FAQ: the top row and answer panel are joined inside a goo filter to spread out stickily (.5s expo.out) ── */
  document.querySelectorAll(".an-faq").forEach((faq) => {
    faq.querySelectorAll(".an-faq__row").forEach((row) => {
      const trig = row.querySelector(".an-faq__trigger");
      const panel = row.querySelector(".an-faq__panel");
      const p = panel.querySelector("p");
      const gooP = row.querySelector(".an-faq__goo .is-p");
      trig.setAttribute("aria-expanded", "false");
      trig.addEventListener("click", () => {
        const on = !row.classList.contains("is-open");
        row.classList.toggle("is-open", on);
        trig.setAttribute("aria-expanded", on);
        const h = on ? p.offsetHeight : 0;
        const d = reduce ? 0 : 0.5;
        gsap.to(panel, { height: h, duration: d, ease: "expo.out", onComplete: () => ScrollTrigger.refresh() });
        if (gooP) gsap.to(gooP, { height: h ? h + 6 : 0, top: h ? 54 : 48, duration: d, ease: "expo.out" });
        gsap.to(p, { opacity: on ? 1 : 0, y: on ? 0 : 8, duration: on ? d : 0.2, delay: on ? 0.08 : 0, ease: "power2.out" });
      });
    });
  });

  /* ── Card ring: cards stand around a circle centered off-screen and turn by themselves or by scroll ──
     data-ring="side"  : two circles centered outside the left and right edges (closing section)
     data-ring="arc"   : An upper arc of a circle centered far below (demo stage) */
  const rings = [];
  document.querySelectorAll("[data-ring]").forEach((box, bi) => {
    const mode = box.dataset.ring;
    const n = +(box.dataset.count || 16);
    const sides = mode === "side" ? [-1, 1] : [0];
    const items = [];
    sides.forEach((side) => {
      for (let i = 0; i < n; i++) {
        const el = document.createElement("div");
        el.className = "an-ring__item";
        el.innerHTML = `<div class="an-shot" data-label="Component preview screen · light background · landscape 3:2">${shotSVG(bi * 50 + i + (side > 0 ? 17 : 0))}</div>`;
        box.append(el);
        items.push({ el, side, i });
      }
    });
    const st = { box, items, mode, n, angle: 0, speed: +(box.dataset.speed || 0.035), scroll: 0 };
    rings.push(st);
  });
  const layoutRing = (st) => {
    const W = st.box.clientWidth, H = st.box.clientHeight;
    const mobile = W < 700;
    const w = mobile ? 74 : W * 0.086;
    st.items.forEach(({ el }) => { el.style.width = `${w}px`; });
    const h = w / 1.5;
    if (st.mode === "side") {
      const R = mobile ? H * 0.36 : H * 0.43;
      const reach = mobile ? W * 0.2 : W * 0.17;
      const step = (Math.PI * 2) / st.n;
      st.items.forEach(({ el, side, i }) => {
        const a = i * step + st.angle * side + (side > 0 ? Math.PI : 0);
        const cx = side < 0 ? reach - R : W - reach + R;
        const x = cx + Math.cos(a) * R, y = H * 0.48 + Math.sin(a) * R;
        el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${a}rad)`;
      });
    }
  };
  if (rings.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { const st = rings.find((r) => r.box === e.target); if (st) st.on = e.isIntersecting; }), { rootMargin: "200px 0px" });
    rings.forEach((st) => { io.observe(st.box); layoutRing(st); });
    let lastS = scrollY;
    gsap.ticker.add((t, dt) => {
      const ds = scrollY - lastS;
      lastS = scrollY;
      rings.forEach((st) => {
        if (!st.on) return;
        if (!reduce) st.angle += (st.speed * Math.min(dt, 100)) / 1000 + ds * 0.0006;
        layoutRing(st);
      });
    });
    addEventListener("resize", () => rings.forEach(layoutRing));
  }

  /* ── Rise in sequence from below: original list slider yPercent 100 · .6s · stagger .08 · power2.out · top 80% ── */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-rise]").forEach((list) => {
      const kids = list.querySelectorAll("[data-rise-item]");
      if (!kids.length) return;
      gsap.from(kids, { yPercent: 100, duration: 0.6, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: list, start: "top 80%" } });
    });
    document.querySelectorAll("[data-fade]").forEach((el) => {
      gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
  });

  /* ── Isometric line art: boxes [x,y,z,width,depth,height,orange?] are painted back to front so only the lines show. Stands in for the original’s one-face orange line art ── */
  const ISO = {
    steps: [[0, 2, 0, 1, 1, 1], [1, 1, 0, 1, 1, 2.2], [1.25, 1.25, 2.2, 0.5, 0.5, 0.5, 1], [2, 0, 0, 1, 1, 1]],
    floor: [...Array.from({ length: 9 }, (_, i) => [i % 3, Math.floor(i / 3), 0, 0.92, 0.92, 0.08]), [1, 1, 0.08, 0.92, 0.92, 0.9, 1]],
    row: [[0, 0, 0, 1, 1, 1], [1.05, 0, 0, 1, 1, 1, 1], [2.1, 0, 0, 1, 1, 1]],
    slices: Array.from({ length: 8 }, (_, i) => [i * 0.32, 0, 0, 0.06, 1.6, 2, i === 7 ? 1 : 0]),
    layers: Array.from({ length: 5 }, (_, i) => [0, 0, i * 0.22, 2, 2, 0.12, i === 4 ? 1 : 0]),
    cards: Array.from({ length: 7 }, (_, i) => [i * 0.42, i * 0.1, 0, 0.05, 1.5, 1.9, i === 6 ? 1 : 0]),
    cube: [[0, 0, 0, 1, 1, 1]],
    pair: [[0, 0, 0, 1, 1, 1, 1], [1, 0, 0, 1, 1, 1, 1]],
    tile: [[0, 0, 0, 2, 1.3, 0.12, 1]],
    box: [[0, 0, 0, 1.6, 1.6, 0.9, 1], [0, 0, 0.9, 1.6, 1.6, 0.04, 1]],
    page: [[0, 0, 0, 2.2, 1.5, 0.1, 1]],
    push: [[0, 0, 0, 2.2, 1.5, 0.1], [0.8, 0, 0.14, 1.4, 1.5, 0.1, 1]],
    float: [[0, 0, 0, 2.2, 1.5, 0.1], [1.4, 0.3, 0.14, 0.5, 0.5, 0.5, 1]],
    drill: Array.from({ length: 4 }, (_, i) => [i * 0.35, 0, 0, 0.06, 1.6, 1.4, i === 0 ? 1 : 0]),
  };
  const isoDraw = (svg) => {
    const boxes = ISO[svg.dataset.iso];
    if (!boxes) return;
    const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
    const P = (x, y, z) => [(x - y) * c, (x + y) * s - z];
    const order = [...boxes].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const faces = [];
    order.forEach(([x, y, z, w, d, h, acc]) => {
      const pts = {
        top: [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)],
        left: [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)],
        right: [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)],
      };
      Object.values(pts).forEach((f) => {
        f.forEach(([px, py]) => { minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); });
        faces.push(`<polygon class="iso-face${acc ? " is-acc" : ""}" points="${f.map((p) => p.map((v) => v.toFixed(3)).join(",")).join(" ")}"/>`);
      });
    });
    const pad = 0.05;
    svg.setAttribute("viewBox", `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`);
    svg.innerHTML = faces.join("");
  };
  document.querySelectorAll("svg[data-iso]").forEach(isoDraw);
  document.querySelectorAll(".an-icon-btn:empty").forEach((b) => { b.innerHTML = arrow((b.getAttribute("aria-label") || "").includes("Previous") ? -1 : 1); });

  /* ── Value panel (Customize): the whole row is a sliding handle, and a choice opens as a small panel in .3s. Changed values are reported through the ctl event ── */
  const ctlInit = (ctl) => {
    const emit = (key, value) => ctl.dispatchEvent(new CustomEvent("ctl", { detail: { key, value } }));
    ctl.querySelectorAll("input[type=range]").forEach((inp) => {
      const out = inp.nextElementSibling, row = inp.closest(".an-ctl__row");
      const dec = (inp.step.split(".")[1] || "").length;
      const set = (send) => {
        const v = +inp.value;
        row.style.setProperty("--p", (v - inp.min) / (inp.max - inp.min));
        out.textContent = v.toFixed(Math.max(dec, inp.step.includes(".") ? 1 : 0));
        if (send) emit(inp.dataset.ctlV, v);
      };
      inp.addEventListener("input", () => set(true));
      set(false);
    });
    ctl.querySelectorAll(".an-ctl__row").forEach((row) => {
      const sel = row.querySelector(".an-ctl__sel");
      if (!sel) return;
      sel.insertAdjacentHTML("beforeend", '<svg class="an-chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>');
      sel.addEventListener("click", (e) => {
        e.stopPropagation();
        const on = !row.classList.contains("is-open");
        ctl.querySelectorAll(".an-ctl__row.is-open").forEach((r) => r.classList.remove("is-open"));
        row.classList.toggle("is-open", on);
      });
      row.querySelectorAll(".an-ctl__menu button").forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        row.querySelectorAll(".an-ctl__menu button").forEach((x) => x.classList.toggle("is-on", x === b));
        const value = b.dataset.value || b.textContent.trim();
        const label = sel.querySelector("b");
        if (label) label.textContent = value; else sel.firstChild.textContent = value;
        row.classList.remove("is-open");
        emit(sel.dataset.sel, value);
      }));
    });
    document.addEventListener("click", () => ctl.querySelectorAll(".an-ctl__row.is-open").forEach((r) => r.classList.remove("is-open")));
  };

  window.AN = { css, reduce, shotSVG, paintShot, arrow, lenis, rand, isoDraw, ctlInit, roll };
})();
