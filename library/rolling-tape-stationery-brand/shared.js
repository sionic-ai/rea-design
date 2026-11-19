(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Crumpled paper texture: a gray image of noise lit by slanted light — no color (laid over the background with multiply)
  const crumple = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='.006' numOctaves='5' seed='7'/><feDiffuseLighting surfaceScale='9' diffuseConstant='1.1'><feDistantLight azimuth='225' elevation='38'/></feDiffuseLighting></filter><rect width='900' height='900' filter='url(%23c)'/></svg>`;
  root.style.setProperty("--st-crumple", `url("data:image/svg+xml,${crumple.replace(/</g, "%3C").replace(/>/g, "%3E")}")`);

  // Original: Lenis 1.3.25 driven by the GSAP ticker
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, prevent: (n) => n.closest?.("[data-lenis-prevent]") });
    lenis.on("scroll", () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.stLenis = lenis;

  // Arched text: the line center rises 1.2vw and both ends tilt ±7° (original .warped-text --arc-drop·--arc-tilt, values in css)
  $$("[data-warp]").forEach((line) => {
    const t = line.textContent, n = [...t].filter((c) => c !== " ").length;
    line.textContent = "";
    let i = 0;
    for (const c of t) {
      const s = document.createElement("span");
      if (c === " ") { s.className = "sp"; line.append(s); continue; }
      s.className = "ch"; s.textContent = c; s.style.setProperty("--i", i++); s.style.setProperty("--n", n);
      line.append(s);
    }
  });

  // Tape roll drawing — outer color ring, inner pale panel, leaf-shaped logo on top, large name in the center, ring text, barcode.
  let uid = 0;
  window.stTape = (name = "TAPE", sub = "NORMAL") => {
    const id = `st-arc-${++uid}`;
    const words = name.split(" ");
    const lines = words.length > 1 ? [words.slice(0, -1).join(" "), words.at(-1)] : [name];
    const fs = lines.some((l) => l.length > 8) ? 34 : 52;
    const bars = Array.from({ length: 14 }, (_, i) => `<rect x="${123 + i * 4}" y="214" width="${i % 3 ? 2 : 3}" height="18"/>`).join("");
    return `<svg class="st-tape" viewBox="0 0 300 300" aria-hidden="true">
      <circle class="ring" cx="150" cy="150" r="150"/><circle class="face" cx="150" cy="150" r="118"/>
      <defs><path id="${id}" d="M150 150m-100 0a100 100 0 1 1 200 0"/></defs>
      <text class="arc"><textPath href="#${id}" startOffset="8%">Your · role · description · 000mm here</textPath></text>
      <path class="hole" d="M124 40c8-8 44-8 52 0 6 7 3 18-5 21-10 3-32 3-42 0-8-3-11-14-5-21z"/>
      <g class="brand"><path d="M112 76c14-14 62-14 76 0 6 7-2 19-38 21-36-2-44-14-38-21z"/></g>
      <text class="brand-t" x="150" y="91" text-anchor="middle">BRAND</text>
      ${lines.map((l, i) => `<text class="name" x="150" y="${158 + i * fs * 0.86 - (lines.length - 1) * fs * 0.3}" text-anchor="middle" font-size="${fs}">${l}</text>`).join("")}
      <g class="bar">${bars}</g>
      <text class="arc" x="150" y="262" text-anchor="middle">${sub}</text>
    </svg>`;
  };
  $$("[data-tape]").forEach((el) => { el.innerHTML = window.stTape(el.dataset.tape, el.dataset.tapeSub); });
  // Bakes the SVG painted with CSS variables into an image for canvas·3D — carries computed colors and fonts over as attributes
  window.stBake = (el, px = 300) => {
    const src = el.querySelector("svg"), svg = src.cloneNode(true);
    const from = src.querySelectorAll("*"), to = svg.querySelectorAll("*");
    from.forEach((n, i) => {
      const c = getComputedStyle(n);
      to[i].setAttribute("fill", c.fill);
      to[i].setAttribute("style", `font:${c.font};letter-spacing:${c.letterSpacing}`);
    });
    svg.setAttribute("width", px); svg.setAttribute("height", px);
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    return img;
  };

  // Scattered letters gather into place tied to scroll — each letter is pushed and rotated randomly and some are empty until they form a sentence (About · detail)
  const scatterSets = $$("[data-scatter]").map((el) => {
    const chars = [];
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 1) { if (n.tagName !== "BR") walk(n); continue; }
        if (n.nodeType !== 3) continue;
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement("span");
          w.style.display = "inline-block";
          for (const c of part) { const s = document.createElement("span"); s.className = "st-ch"; s.style.display = "inline-block"; s.textContent = c; w.append(s); chars.push(s); }
          frag.append(w);
        }
        n.replaceWith(frag);
      }
    };
    walk(el);
    const far = parseFloat(el.dataset.scatter) || 1;
    return { el, chars, seeds: chars.map(() => ({ x: (Math.random() * 2 - 1) * 7 * far, y: (Math.random() * 2 - 1) * 9 * far, r: (Math.random() * 2 - 1) * 28, gone: Math.random() < 0.25 })) };
  });

  // The cover lifts away together with its curved board, and the tags, sound button and top-left chart pop back into place
  const loader = $(".st-loader");
  const enterChrome = () => {
    root.classList.remove("is-loading");
    if (reduce) return;
    gsap.from(".st-tab", { yPercent: -115, duration: 0.45, ease: "back.out(2.2)", delay: 0.05 });
    gsap.from(".st-sound", { yPercent: 150, duration: 0.45, ease: "back.out(2.2)", delay: 0.12 });
    gsap.from(".st-mark", { yPercent: -260, duration: 0.45, ease: "back.out(1.9)", delay: 0.18 });
  };
  if (loader && !reduce) {
    root.classList.add("is-loading");
    lenis && lenis.stop();
    const go = () => gsap.timeline({ onComplete: () => { loader.remove(); lenis && lenis.start(); } })
      .to(loader.querySelector("svg"), { scale: 0.85, opacity: 0, duration: 0.39, ease: "power2.in" })
      .to(loader, { yPercent: -100, duration: 0.85, ease: "power3.inOut" }, 0.15)
      .add(enterChrome, 0.55);
    if (document.readyState === "complete") setTimeout(go, 1200);
    else addEventListener("load", () => setTimeout(go, 1200));
  } else {
    loader && loader.remove();
    enterChrome();
  }

  // Tag menu: opens on click or when pulled down more than 24px
  const tab = $(".st-tab"), menu = $(".st-menu"), wrap = $(".st-menuwrap");
  if (tab && menu && wrap) {
    const set = (open) => { tab.setAttribute("aria-expanded", String(open)); wrap.classList.toggle("is-open", open); };
    let y0 = null;
    tab.addEventListener("pointerdown", (e) => { y0 = e.clientY; pulled = true; tab.setPointerCapture(e.pointerId); set(tab.getAttribute("aria-expanded") !== "true"); });
    tab.addEventListener("pointermove", (e) => {
      if (y0 == null) return;
      const d = Math.max(0, Math.min(60, e.clientY - y0));
      tab.style.translate = `0 ${d}px`;
      if (d > 24) set(true);
    });
    tab.addEventListener("pointerup", () => { y0 = null; tab.style.translate = ""; });
    tab.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(tab.getAttribute("aria-expanded") !== "true"); } });
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
    document.addEventListener("click", (e) => { if (!menu.contains(e.target) && !tab.contains(e.target)) set(false); });
  }

  // Sound button — when on, each press makes a short plucking sound (WebAudio noise, in place of the original effect sound)
  const snd = $(".st-sound");
  let actx = null;
  const rip = () => {
    if (!snd || snd.getAttribute("aria-pressed") !== "true") return;
    actx = actx || new AudioContext();
    const len = actx.sampleRate * 0.12, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * 0.25;
    const src = actx.createBufferSource(); src.buffer = buf; src.connect(actx.destination); src.start();
  };
  if (snd) {
    snd.addEventListener("pointerdown", () => snd.setAttribute("aria-pressed", String(snd.getAttribute("aria-pressed") !== "true")));
    snd.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); snd.setAttribute("aria-pressed", String(snd.getAttribute("aria-pressed") !== "true")); } });
  }
  document.addEventListener("click", (e) => e.target.closest("a, button:not(.st-sound)") && rip());

  // Arrow cursor — sticks right at the pointer position (tilted 7°), on clickable things goes 1.18x · -1° over .167s, on press shrinks to 1.11 and returns in .267s (original cursor-arrow)
  const cur = $(".st-cursor");
  if (cur && fine) {
    root.classList.add("has-cursor");
    gsap.set(cur, { rotation: 7, scale: 1 });
    let over = false;
    const live = (t) => !!t?.closest?.("a, button, [role=tab]");
    addEventListener("pointermove", (e) => {
      cur.style.translate = `${e.clientX - 6}px ${e.clientY - 4}px`;
      cur.classList.add("is-on");
      const o = live(e.target);
      if (o !== over) { over = o; gsap.to(cur, { scale: o ? 1.18 : 1, rotation: o ? -1 : 7, duration: 0.24, ease: "power2.out", overwrite: "auto" }); }
    }, { passive: true });
    addEventListener("pointerdown", () => gsap.to(cur, { scale: over ? 1.11 : 0.94, duration: 0.067, ease: "power2.out", overwrite: "auto" }));
    addEventListener("pointerup", () => gsap.to(cur, { scale: over ? 1.18 : 1, duration: 0.2, ease: "power2.out", overwrite: "auto" }));
    document.addEventListener("mouseleave", () => cur.classList.remove("is-on"));
  } else if (cur) cur.remove();

  if (!reduce && window.ScrollTrigger) {
    scatterSets.forEach(({ el, chars, seeds }) => {
      const paint = (p) => chars.forEach((c, i) => {
        const s = seeds[i], k = 1 - Math.min(1, Math.max(0, p * 1.25 - (i % 7) * 0.035));
        c.style.transform = k ? `translate(${s.x * k}vw, ${s.y * k}vh) rotate(${s.r * k}deg)` : "";
        c.style.opacity = s.gone && k > 0.5 ? "0" : "1";
      });
      paint(0);
      ScrollTrigger.create({ trigger: el, start: el.dataset.scatterStart || "top 85%", end: el.dataset.scatterEnd || "center 45%", scrub: true, onUpdate: (st) => paint(st.progress), onRefresh: (st) => paint(st.progress) });
    });
  }

  // Footer: tape rolls and round social buttons fall with physics and pile up on the wordmark (matter-js 0.20.0)
  const phys = $(".st-footer__phys");
  if (phys && window.Matter) {
    const M = Matter;
    const canvas = document.createElement("canvas");
    phys.append(canvas);
    const ctx = canvas.getContext("2d");
    const engine = M.Engine.create({ gravity: { y: 1.1 } });
    let W = 0, H = 0, walls = [], started = false;
    const tapes = $$("[data-drop]", phys.parentElement);
    const imgs = tapes.map((el) => {
      const img = window.stBake(el);
      const r = parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0.055;
      el.hidden = true;
      return { img, r };
    });
    const bodies = [];
    const size = () => {
      const b = phys.getBoundingClientRect();
      W = b.width; H = b.height;
      canvas.width = W * devicePixelRatio; canvas.height = H * devicePixelRatio;
      M.Composite.remove(engine.world, walls);
      const word = $(".st-footer__word .st-head", phys.parentElement)?.getBoundingClientRect();
      const shelf = word ? [M.Bodies.rectangle(W / 2, word.top - b.top + word.height * 0.62, word.width * 0.8, 10, { isStatic: true, chamfer: { radius: 5 } })] : [];
      walls = [
        M.Bodies.rectangle(W / 2, H + 50, W * 2, 100, { isStatic: true }),
        M.Bodies.rectangle(-50, H / 2, 100, H * 3, { isStatic: true }),
        M.Bodies.rectangle(W + 50, H / 2, 100, H * 3, { isStatic: true }),
        ...shelf,
      ];
      M.Composite.add(engine.world, walls);
    };
    const drop = () => {
      if (started) return;
      started = true;
      imgs.forEach((it, i) => {
        const r = it.r * W;
        const body = M.Bodies.circle(W * (0.15 + 0.7 * ((i * 0.37) % 1)), -r * 2 - i * r * 1.2, r, { restitution: 0.35, friction: 0.25, frictionAir: 0.012, angle: (i * 1.7) % 6.28 });
        body.plugin.img = it.img;
        bodies.push(body);
      });
      M.Composite.add(engine.world, bodies);
      if (fine) {
        const mouse = M.Mouse.create(canvas);
        mouse.pixelRatio = 1;
        // Detach matter’s wheel listener so wheel and touch are not intercepted — the page must keep scrolling
        canvas.removeEventListener("wheel", mouse.mousewheel);
        canvas.removeEventListener("mousewheel", mouse.mousewheel);
        canvas.removeEventListener("DOMMouseScroll", mouse.mousewheel);
        M.Composite.add(engine.world, M.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }));
      } else canvas.style.pointerEvents = "none";
    };
    size();
    new ResizeObserver(size).observe(phys);
    new IntersectionObserver(([e]) => e.isIntersecting && drop(), { threshold: 0.25 }).observe(phys);
    // matter warns if more than 16.667ms is passed at once — so run it in fixed frames (a late frame at most twice)
    const TICK = 1000 / 60;
    let last = performance.now(), acc = 0;
    const step = (now) => {
      acc = Math.min(TICK * 2, acc + Math.max(0, now - last));
      last = now;
      if (started) {
        if (reduce) acc = 0;
        while (acc >= TICK) { M.Engine.update(engine, TICK); acc -= TICK; }
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        ctx.clearRect(0, 0, W, H);
        for (const b of bodies) {
          const r = b.circleRadius;
          ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle);
          ctx.drawImage(b.plugin.img, -r, -r, r * 2, r * 2);
          ctx.restore();
        }
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();
