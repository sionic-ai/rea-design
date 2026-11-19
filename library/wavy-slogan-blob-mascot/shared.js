// Common to all pages: draws in the header, menu drawer and footer in one place, and hooks up reveal (blur), header color change, side nav follow and character bubble drawing.
// Original values: menu curtain scaleY .45 power4.out → text y24·blur8 .45 stagger .06 · hamburger wave 2/3s, 11px per step · entrance blur15 .8s power2.out top 75% · follow lerp .2
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const mm = gsap.matchMedia();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => matchMedia("(max-width: 800px)").matches;
  const page = document.body.dataset.page || "home";
  const VS = (window.VS = { reduced, isSp, mm });

  // Redraws the original character (a color blob with a face) with the same feel — one color stain on a gray circle, two eyes.
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const blobPath = (cx, cy, r, seed = 3, n = 8, wob = 0.22) => {
    const rnd = rand(seed * 977 + 13);
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 - wob + rnd() * wob * 2);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    });
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + "Z";
  };
  const eyes = (x, y, s = 1, gap = 9) =>
    [0, gap].map((dx) => `<ellipse cx="${x + dx}" cy="${y}" rx="${4.2 * s}" ry="${5 * s}" fill="var(--kf-on-accent)"/><circle cx="${x + dx + 0.8 * s}" cy="${y + 0.6 * s}" r="${2.2 * s}" fill="var(--site-pupil)"/>`).join("");
  const CHARA = [
    { c: "var(--site-chara-1)", blob: [62, 46, 30, 7], eye: [52, 40], extra: '<path d="M30 52l4 9 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="var(--kf-on-accent)" opacity=".9"/>' },
    { c: "var(--site-chara-2)", blob: [44, 58, 30, 11], eye: [56, 50], extra: `<path d="${blobPath(72, 36, 13, 4, 6)}" fill="var(--site-chara-2)"/>` },
    { c: "var(--site-chara-3)", blob: [50, 50, 40, 5, 10, 0.18], eye: [26, 44], ring: true },
    { c: "var(--site-chara-4)", blob: [50, 52, 40, 9, 9, 0.2], eye: [22, 40], extra: `<path d="${blobPath(52, 54, 22, 2, 7)}" fill="var(--site-moss)"/><path d="${blobPath(52, 54, 11, 6, 6)}" fill="var(--site-moss-deep)"/><circle cx="52" cy="54" r="3" fill="var(--kf-on-accent)"/>` },
    { c: "var(--site-chara-5)", blob: [60, 56, 26, 17], eye: [56, 50] },
  ];
  VS.blobPath = blobPath;
  VS.eyes = eyes;
  VS.chara = (i) => {
    const k = CHARA[(i - 1) % CHARA.length];
    const [cx, cy, r, seed, n, w] = k.blob;
    const body = k.ring
      ? `<path d="${blobPath(cx, cy, r, seed, n, w)}" fill="${k.c}"/><path d="${blobPath(cx, cy, r * 0.62, seed + 2, 8, 0.25)}" fill="var(--kf-on-accent)"/>`
      : `<path d="${blobPath(cx, cy, r, seed, n || 8, w || 0.22)}" fill="${k.c}"/>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="var(--site-chara-base)"/>${body}${k.extra || ""}${eyes(k.eye[0], k.eye[1])}</svg>`;
  };
  // Round button in the footer and menu: a picture of five droplets fused into a ring (the original is a single image file)
  VS.ring = () => {
    const cols = ["var(--site-chara-2)", "var(--site-chara-1)", "var(--site-chara-5)", "var(--site-chara-4)", "var(--site-chara-3)"];
    const parts = cols.map((c, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = 100 + Math.cos(a) * 62, y = 100 + Math.sin(a) * 62;
      return `<path d="${blobPath(x, y, 40, i * 5 + 3, 9, 0.2)}" fill="${c}"/>` + eyes(x - 6 + Math.cos(a) * 14, y - 4 + Math.sin(a) * 14, 1.25, 11);
    });
    return `<svg viewBox="0 0 200 200" aria-hidden="true">${parts.join("")}<circle cx="100" cy="100" r="50" fill="var(--kf-on-accent)"/></svg>`;
  };
  const fillCharas = (root = document) =>
    root.querySelectorAll("[data-chara]").forEach((el) => {
      if (!el.firstElementChild) el.innerHTML = VS.chara(+el.dataset.chara);
    });
  VS.fillCharas = fillCharas;

  const arrow = '<span class="vs-arrow"><span></span></span>';
  VS.arrow = arrow;
  const logoMark = (cls = "") => `<svg class="vs-logo__mark ${cls}" viewBox="0 0 40 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M2 4c6 10 12 18 18 24M38 4C32 14 26 22 20 28M8 4c4 7 8 12 12 16M32 4c-4 7-8 12-12 16M14 4c2 4 4 7 6 9M26 4c-2 4-4 7-6 9"/></svg>`;
  const logo = (cls = "") => `${logoMark(cls)}<span class="vs-logo__word">WORDMARK</span>`;
  VS.logo = logo;

  const NAV = [
    ["about", "about.html", "About us"],
    ["statement", "index.html#statement", "Statement"],
    ["service", "service.html", "Service"],
    ["recruit", "recruit.html", "Recruit"],
    ["list", "list.html", "Journal", "009"],
    ["contact", "#footer", "Contact"],
  ];
  const cur = (k) => (k === page ? ' aria-current="page"' : "");
  const badge = (b) => (b ? ` <span class="vs-badge">${b}</span>` : "");
  const choiceBtn = (cls) => `
    <div class="vs-choice ${cls}"><a href="index.html#statement">
      <span class="vs-choice__ring">${VS.ring()}</span>
      <span class="vs-choice__txt"><span class="l01">WORDMARK FOR<br>RE<small>:</small>SLOGAN</span><span class="l02">0 Things${arrow}</span></span>
    </a></div>`;

  // Head
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "vs-head";
    head.id = "header";
    head.innerHTML = `
      <a class="vs-logo" href="index.html" aria-label="Home">${logo()}</a>
      <nav class="vs-nav" aria-label="Main menu"><ul>${NAV.map(([k, h, t]) => `<li><a href="${h}"${cur(k)}>${t}</a></li>`).join("")}</ul></nav>
      <button class="vs-burger" type="button" aria-label="Open Menu" aria-expanded="false">
        <svg class="vs-burger__icon is-normal" viewBox="0 0 46 28" aria-hidden="true"><g class="vs-burger__flow">${'<path d="M.75 3.75C12 8.25 34 8.25 45.25 3.75"/>'.repeat(4)}</g></svg>
        <svg class="vs-burger__icon is-close" viewBox="0 0 46 28" aria-hidden="true"><path class="is-top" d="M.75 10.75C12 16.25 34 16.25 45.25 10.75"/><path class="is-bottom" d="M.75 17.25C12 11.75 34 11.75 45.25 17.25"/></svg>
      </button>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="vs-menu" data-slot="menu-drawer" aria-hidden="true" inert>
        <div class="vs-menu__bg"></div>
        <div class="vs-menu__inner">
          <div class="vs-menu__body">
            <nav class="vs-menu__nav"><ul>${NAV.map(([k, h, t, b]) => `<li><a href="${h}"${cur(k)}>${t}${badge(b)}</a></li>`).join("")}</ul></nav>
            <div class="vs-menu__meta">
              <ul class="vs-menu__policy"><li><a href="#">Your policy link 1 here</a></li><li><a href="#">Policy link 2 · viewing guide goes here</a></li></ul>
              <p class="vs-menu__copy">©WORDMARK.0000</p>
            </div>
            ${choiceBtn("vs-menu__choice")}
          </div>
          <div class="vs-menu__slogan" aria-hidden="true">
            <svg class="vs-menu__slogan-en is-pc" viewBox="0 0 1500 240"><path id="vs-menu-curve" d="M0 40C240 40 330 196 750 196S1260 40 1500 40" fill="none"/><text><textPath href="#vs-menu-curve" startOffset="50%" text-anchor="middle">BRAND FOR RE:SLOGAN</textPath></text></svg><svg class="vs-menu__slogan-en is-sp" viewBox="0 0 400 125"><path id="vs-menu-curve-sp" d="M0 0C3 2 5 5 7 8L33 45C69 95 127 125 189 125H211C273 125 331 95 367 45L393 8C395 5 397 2 400 0" fill="none"/><text><textPath href="#vs-menu-curve-sp" startOffset="50%" text-anchor="middle">BRAND FOR RE:SLOGAN</textPath></text></svg>
            <p class="vs-menu__slogan-ja">Here, one line</p>
          </div>
        </div>
      </div>`
    );
  }

  // Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "vs-foot";
    foot.id = "footer";
    foot.innerHTML = `
      <div class="vs-foot__hills" aria-hidden="true"></div>
      <div class="vs-foot__inner">
        <div class="vs-foot__left">
          <a class="vs-logo is-foot" href="index.html" aria-label="Home">${logo()}</a>
          <address class="vs-foot__addr">〒000-0000<br>Your address line one, 0000 here<br>Your building name 000 here<br>TEL 000-000-0000<br>Business hours: Mon–Fri 00:00-00:00</address>
          <p class="vs-foot__copy">©WORDMARK.0000</p>
        </div>
        <div class="vs-foot__center">
          <nav class="vs-foot__nav"><ul>${NAV.map(([k, h, t, b]) => `<li><a href="${h}">${t}${badge(b)}</a></li>`).join("")}</ul></nav>
          <ul class="vs-foot__policy"><li><a href="#">Your policy link 1 here</a></li><li><a href="#">Policy link 2 · viewing guide goes here</a></li></ul>
        </div>
        <div class="vs-foot__right">${choiceBtn("is-foot")}</div>
        <a class="vs-pagetop" href="#header" aria-label="Back to top"><span class="vs-scroll__dots"></span></a>
      </div>`;
    const hills = foot.querySelector(".vs-foot__hills");
    // Redraws the original hill illustration strip (foot_bg_illust): a few dark green hills and one red lighthouse sit on the horizon.
    const hillSet = (off) =>
      [[60, 70, 30], [180, 120, 52], [260, 60, 26], [620, 150, 56], [990, 110, 40], [1080, 60, 24], [1380, 70, 34]]
        .map(([x, w, h]) => `<path d="M${x + off - w / 2},63 C${x + off - w / 2 + w * 0.15},${63 - h} ${x + off + w / 2 - w * 0.15},${63 - h} ${x + off + w / 2},63Z" fill="var(--site-hill)"/>`)
        .join("") +
      `<g transform="translate(${1450 + off},26)"><path d="M0 37 2 0h6l2 37z" fill="var(--kf-on-accent)"/><path d="M1 8h8v6H1zM.6 22h8.8v6H.6z" fill="var(--site-red)"/><path d="M1 0h8l-4-6z" fill="var(--site-red)"/></g>`;
    hills.innerHTML = `<svg viewBox="0 0 3000 63" preserveAspectRatio="xMinYMax slice">${hillSet(0)}${hillSet(1500)}</svg>`;
  }

  fillCharas();

  // Menu drawer
  const btn = document.querySelector(".vs-burger");
  const menu = document.querySelector(".vs-menu");
  if (btn && menu) {
    const bg = menu.querySelector(".vs-menu__bg");
    const items = menu.querySelectorAll(".vs-menu__nav, .vs-menu__meta, .vs-menu__choice");
    const copies = menu.querySelectorAll(".vs-menu__slogan-en, .vs-menu__slogan-ja");
    const iconN = btn.querySelector(".is-normal"), iconC = btn.querySelector(".is-close");
    const flow = [...btn.querySelectorAll(".vs-burger__flow path")];
    const lt = btn.querySelector(".is-top"), lb = btn.querySelector(".is-bottom");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let open = false, flowTl = null, order = [], flowing = false;

    gsap.set(iconC, { autoAlpha: 0 });
    gsap.set(lt, { y: -1 });
    gsap.set(lb, { y: 1 });
    const resetFlow = () => {
      flowing = false;
      flowTl && flowTl.kill();
      order = [...flow];
      gsap.set(flow, { y: (i) => [-11, 0, 11, 22][i], opacity: (i) => (i === 0 ? 0 : 1) });
    };
    // Conveyor where four wave lines move down one step (11px) at a time and a new line enters from the top
    const step = () => {
      if (!flowing) return;
      const [first, ...rest] = order;
      const last = order[3];
      flowTl = gsap.timeline({ onComplete: () => { gsap.set(last, { y: -11, opacity: 0 }); order = [last, ...order.slice(0, 3)]; step(); } });
      flowTl.to(order.slice(1), { y: "+=11", duration: 2 / 3, ease: "none" }, 0)
        .to(first, { y: 0, duration: 2 / 3, ease: "none" }, 0)
        .to(last, { opacity: 0, duration: 0.32, ease: "none" }, 0.16)
        .to(first, { opacity: 1, duration: 0.32, ease: "none" }, 0.16);
    };
    resetFlow();
    const spread = (on) => gsap.to([lt, lb], { y: (i) => (on ? [-5.5, 5.5][i] : [-1, 1][i]), duration: on ? 0.4 : 0.3, ease: "power2.out", overwrite: true });
    btn.addEventListener("pointerenter", () => {
      if (reduced || !fine.matches) return;
      if (open) spread(true);
      else { resetFlow(); flowing = true; step(); }
    });
    btn.addEventListener("pointerleave", () => { resetFlow(); spread(false); });

    gsap.set(bg, { scaleY: 0, "--menu-blur": "0px" });
    gsap.set(items, { autoAlpha: 0, y: 24, filter: "blur(8px)" });
    gsap.set(copies, { autoAlpha: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } })
      .to(bg, { scaleY: 1, duration: 0.45, ease: "power4.out" })
      .addLabel("in", "-=0.05")
      .to(items, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.06, ease: "power2.out" }, "in")
      .to(bg, { "--menu-blur": "10px", duration: 0.45, ease: "power2.out" }, "in")
      .to(copies, { autoAlpha: 1, duration: 0.35, stagger: 0.06, ease: "power2.out" }, "in+=0.12");
    tl.eventCallback("onReverseComplete", () => { document.body.classList.remove("is-menu"); menu.inert = true; });
    const swapIcon = (on) => {
      resetFlow();
      spread(false);
      gsap.to(iconN, { autoAlpha: on ? 0 : 1, duration: 0.25, ease: "power1.inOut", overwrite: true });
      // Original: if the pointer stays on the changed button, the opened side spreads its two lines and the closed side lets the wave flow again
      gsap.to(iconC, { autoAlpha: on ? 1 : 0, duration: 0.25, ease: "power1.inOut", overwrite: true, onComplete: () => {
        if (reduced || !fine.matches || !btn.matches(":hover")) return;
        if (on) spread(true);
        else { resetFlow(); flowing = true; step(); }
      } });
    };
    const setOpen = (on) => {
      open = on;
      btn.setAttribute("aria-expanded", String(on));
      btn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
      menu.setAttribute("aria-hidden", String(!on));
      swapIcon(on);
      if (on) { document.body.classList.add("is-menu"); menu.inert = false; reduced ? tl.progress(1) : tl.play(); }
      else reduced ? (tl.progress(0), document.body.classList.remove("is-menu"), (menu.inert = true)) : tl.reverse();
    };
    btn.addEventListener("click", () => setOpen(!open));
    addEventListener("keydown", (e) => e.key === "Escape" && open && setOpen(false));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && setOpen(false)));
  }

  // If the center dot at the header’s bottom edge is over a white-background section ([data-header-dark]), make the text black
  const headEl = document.querySelector(".vs-head");
  if (headEl) {
    let ticking = false;
    const check = () => {
      ticking = false;
      if (document.body.classList.contains("is-menu")) return;
      // The original looks at one line above the bottom edge below the header (height 79 · phone 38)
      const y = isSp() ? 37 : 78;
      const dark = document.elementsFromPoint(innerWidth / 2, y).some((el) => el.closest("[data-header-dark]"));
      headEl.classList.toggle("is-dark", dark);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    addEventListener("load", check);
    check();
  }

  // In-page links roll with .5s power2.out
  document.querySelectorAll('a[href^="#"], a[href*=".html#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const t = url.hash === "#header" ? 0 : document.querySelector(url.hash);
      if (t === null) return;
      e.preventDefault();
      gsap.to(window, { scrollTo: { y: t, autoKill: true }, duration: reduced ? 0 : 0.5, ease: "power2.out", overwrite: "auto" });
    });
  });

  // Entrance: original gsap-reveal defaults (blur 15px · .8s · power2.out · top 75% · group stagger .12)
  const fromVars = (el) => {
    const t = el.dataset.reveal || "blur";
    const sp = isSp();
    if (t === "fade-up") return { autoAlpha: 0, y: sp ? 20 : 30 };
    if (t === "fade") return { autoAlpha: 0 };
    return { autoAlpha: 0, filter: `blur(${sp ? 8 : 15}px)` };
  };
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".reveal-group").forEach((g) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: g, start: "top 75%" } });
      [...g.querySelectorAll(".reveal")].filter((r) => r.closest(".reveal-group") === g)
        .forEach((r, i) => tl.from(r, { ...fromVars(r), duration: 0.8, ease: "power2.out", clearProps: "opacity,visibility,filter,transform" }, i * 0.12));
    });
    document.querySelectorAll(".reveal").forEach((r) => {
      if (r.closest(".reveal-group")) return;
      gsap.from(r, { ...fromVars(r), duration: 0.8, ease: "power2.out", clearProps: "opacity,visibility,filter,transform", scrollTrigger: { trigger: r, start: "top 75%" } });
    });
  });

  // Side nav follow: chases the scroll .2 late and gets nudged slightly the opposite way (PC only)
  const follow = document.querySelectorAll(".js-follow");
  if (follow.length && !reduced) {
    const pc = matchMedia("(min-width: 801px)");
    let target = scrollY, cur = target;
    addEventListener("scroll", () => (target = scrollY), { passive: true });
    gsap.ticker.add(() => {
      if (!pc.matches) return;
      cur += 0.2 * (target - cur);
      gsap.set(follow, { y: -0.2 * (target - cur) });
    });
  }

  // Side nav: marks the section currently in view
  document.querySelectorAll(".vs-side").forEach((nav) => {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    links.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && links.forEach((l) => l.classList.toggle("is-on", l === a)) });
    });
  });

  const SVGNS = "http://www.w3.org/2000/svg";
  // ── Choice tree: branches turn into dots every 4px and light up in turn ──
  document.querySelectorAll(".tree").forEach((tree) => {
    const svg = tree.querySelector("svg");
    const lines = [...svg.querySelectorAll(".tree__lines path")];
    const g = document.createElementNS(SVGNS, "g");
    g.setAttribute("class", "tree__dots");
    svg.append(g);
    const marker = svg.querySelector("marker");
    const tips = [];
    const groups = lines.map((p) => {
      const L = p.getTotalLength(), dots = [];
      for (let a = 0; a <= L; a += 4) {
        const pt = p.getPointAtLength(a), c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); c.setAttribute("r", 0.9);
        g.append(c); dots.push(c);
      }
      const tip = document.createElementNS(SVGNS, "path");
      const e = p.getPointAtLength(L), b = p.getPointAtLength(L - 2);
      tip.setAttribute("d", `M${b.x} ${b.y}L${e.x} ${e.y}`);
      tip.setAttribute("stroke", "transparent");
      tip.setAttribute("marker-end", "url(#tree-arrow)");
      svg.append(tip); tips.push(tip);
      return dots;
    });
    const allDots = groups.flat();
    const chara = tree.querySelector(".tree__chara"), q = tree.querySelector(".tree__q");
    const bubbles = tree.querySelectorAll(".tree__dot");
    const prog = { v: 0 }, shown = groups.map(() => 0);
    const draw = () => groups.forEach((dots, i) => {
      const n = Math.min(dots.length, Math.ceil(dots.length * prog.v));
      if (n > shown[i]) gsap.set(dots.slice(shown[i], n), { autoAlpha: 1 });
      shown[i] = n;
    });
    const reset = () => {
      gsap.set([...allDots, ...bubbles, ...tips], { autoAlpha: 0 });
      gsap.set(tips, { autoAlpha: 1 });
      gsap.set(marker, { attr: { markerWidth: 0.01, markerHeight: 0.01 } });
      gsap.set(q, { autoAlpha: 0, y: 4 });
      prog.v = 0; shown.fill(0);
    };
    gsap.set(chara, { autoAlpha: 0, y: 10, scale: 0.85, transformOrigin: "50% 100%" });
    reset();
    if (reduced) {
      gsap.set(chara, { autoAlpha: 1, y: 0, scale: 1 }); prog.v = 1; draw();
      gsap.set([...bubbles, q], { autoAlpha: 1, y: 0 }); gsap.set(marker, { attr: { markerWidth: 12, markerHeight: 12 } });
    } else {
      const loop = gsap.timeline({ paused: true, repeat: -1 })
        .call(reset).addLabel("line")
        .to(prog, { v: 1, duration: 2.2, ease: "power2.inOut", onUpdate: draw }, "line")
        .addLabel("done", "line+=2.2")
        .to(marker, { attr: { markerWidth: 12, markerHeight: 12 }, duration: 0.35, ease: "none" }, "done")
        .to(bubbles, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, "done-=0.3")
        .to(q, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power1.out" }, "<")
        .to({}, { duration: 6 })
        .to([...allDots, ...tips, ...bubbles, q], { autoAlpha: 0, duration: 0.45, ease: "power1.inOut" });
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        gsap.to(chara, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: "back.out(1.8)" });
        loop.play(0);
      }, { rootMargin: "-15% 0px", threshold: 0.2 });
      io.observe(tree);
    }
  });

  // ── Bowl: dotted curve below, nine drops fall from above and collect ──
  document.querySelectorAll(".bowl").forEach((bowl) => {
    const svg = bowl.querySelector("svg"), lower = svg.querySelector(".bowl__lower");
    const g = document.createElementNS(SVGNS, "g");
    g.setAttribute("class", "bowl__dots");
    for (let a = 0, L = lower.getTotalLength(); a <= L; a += 4) {
      const pt = lower.getPointAtLength(a), c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); c.setAttribute("r", 0.9); g.append(c);
    }
    svg.append(g);
    // Use the original position, rotation and drop values (data-*) as they are
    const SPEC = [
      [23.2, 44.665, 11.28, 0.8, -0.12, 1.45, -8], [44, 49.63, 11.7, 0.92, 0.08, 1.6, 3], [65, 44.665, 14.2, 1, -0.1, 1.7, 28],
      [27, 57.07, 13.76, 0.76, 0.12, 1.4, 18], [56.4, 54.59, 11, 0.88, -0.08, 1.55, 0], [69.4, 59.55, 12.36, 0.82, 0.1, 1.5, 18],
      [22.4, 67.99, 11.56, 0.94, -0.08, 1.65, -18], [47, 62.53, 12.4, 0.78, 0.08, 1.45, -14], [57, 69.23, 10.91, 0.9, -0.06, 1.6, 8],
    ];
    const pebble = (i) => `<svg viewBox="0 0 60 56"><path d="${blobPath(30, 28, 25, i + 31, 6, 0.12)}" fill="var(--site-pebble)" stroke="var(--kf-on-accent)" stroke-width="1.5"/>${eyes(22, 24, 0.9, 12)}</svg>`;
    const wrap = bowl.querySelector(".bowl__charas");
    const charas = SPEC.map(([l, t, w, drop, drift, dur, rot], i) => {
      const el = document.createElement("span");
      el.className = "bowl__chara";
      el.style.cssText = `--l:${l}%;--t:${t}%;--w:${w}%`;
      Object.assign(el.dataset, { drop, drift, duration: dur, rotation: rot });
      el.innerHTML = pebble(i);
      wrap.append(el);
      return el;
    });
    gsap.set(charas, { autoAlpha: 0, zIndex: (i) => i + 1 });
    if (reduced) gsap.set(charas, { autoAlpha: 1, rotation: (i, el) => +el.dataset.rotation });
    else {
      const fall = (tl, el, at) => {
        const d = +el.dataset.duration;
        tl.set(el, { x: () => bowl.clientWidth * +el.dataset.drift, y: () => -bowl.clientHeight * +el.dataset.drop, rotation: -0.6 * +el.dataset.rotation }, at)
          .to(el, { autoAlpha: 1, duration: 0.46 * d, ease: "none" }, at)
          .to(el, { x: 0, y: 0, rotation: +el.dataset.rotation, duration: d, ease: "power2.in" }, at);
        return at + d;
      };
      const again = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 5, repeatRefresh: true });
      let end = 0;
      charas.map((el, i) => ({ el, o: (7 * i) % charas.length })).sort((a, b) => a.o - b.o).forEach(({ el }, i) => {
        const at = i * (bowl.classList.contains("is-recruit") ? 0.055 : 0.07);
        again.to(el, { autoAlpha: 0, duration: 0.28, ease: "power1.inOut" }, at);
        end = Math.max(end, fall(again, el, at + 0.28));
      });
      again.to({}, { duration: 0.01 }, end);
      const first = gsap.timeline({ paused: true, onComplete: () => again.restart() });
      let fEnd = 0;
      charas.forEach((el, i) => (fEnd = Math.max(fEnd, fall(first, el, i * (bowl.classList.contains("is-recruit") ? 0.09 : 0.12)))));
      first.to({}, { duration: 5 }, fEnd);
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); first.play(0); } }, { rootMargin: "-10% 0px", threshold: 0.1 });
      io.observe(bowl);
    }
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
