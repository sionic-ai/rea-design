// Page-wide: Lenis 1.0.19 (PC only), a header line that comes down only when scrolling up, 1-second anchor move (smooth-scroll 15.2.1), drafting-line wordmark,
// Work detail window (magnific-popup 1.1.0 — on desktop the inside of the window gets its own Lenis). Library, version and options are exactly as in the original main.js.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  // The original turns Lenis off and uses default scroll on phones (767 or less) and tablets (768~1024 or iPad·Android tablets)
  const ua = navigator.userAgent.toLowerCase();
  const isTablet = () => ua.includes("ipad") || (ua.includes("macintosh") && "ontouchend" in document) || (ua.includes("android") && !ua.includes("mobile")) || ua.includes("kindle") || ua.includes("silk") || (innerWidth > 767 && innerWidth <= 1024);
  const isNoInertia = () => innerWidth <= 767 || isTablet();

  let lenis = null, modalLenis = null;
  const ct = (window.ctSite = { lenis: null });
  // As in the original, a single rAF drives both the page Lenis and the window Lenis
  const raf = (t) => { lenis?.raf(t); modalLenis?.raf(t); requestAnimationFrame(raf); };
  let looping = false;
  const updateLenis = () => {
    const want = !reduced.matches && !isNoInertia();
    if (want && !lenis) {
      lenis = ct.lenis = new Lenis();
      if (!looping) { looping = true; requestAnimationFrame(raf); }
    } else if (!want && lenis) {
      lenis.destroy();
      lenis = ct.lenis = null;
      modalLenis?.destroy();
      modalLenis = null;
    }
  };
  addEventListener("load", updateLenis);
  addEventListener("resize", updateLenis);
  reduced.addEventListener("change", updateLenis);

  // Anchors arrive in 1 second regardless of distance (original smooth-scroll speedAsDuration, speed 1000, default easeInOutCubic)
  new SmoothScroll("[data-scrollto]", { speedAsDuration: true, speed: 1000, after: () => window.ScrollTrigger?.refresh() });

  // Header bar: hides when scrolling down, shows when scrolling up
  const header = document.querySelector(".ct-header");
  if (header) {
    let last = scrollY;
    addEventListener("scroll", () => {
      const now = scrollY;
      if (now > last) header.classList.remove("is-show");
      else if (now < last) header.classList.add("is-show");
      last = now;
    }, { passive: true });
  }

  // Drafting-line wordmark: for each letter, draws top, bottom, vertical and diagonal lines that stick out beyond the letter.
  // Lines are cyan outside the text, and inside the text a mask splits the letters so the background shows through. Same seed so they are always drawn in the same place
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // Wordmark font is read from the skin (--kf-font-logo, else the heading font)
  const logoFont = () => { const cs = getComputedStyle(document.documentElement); return (cs.getPropertyValue("--kf-font-logo") || cs.getPropertyValue("--kf-font-display")).trim() || "sans-serif"; };
  let markId = 0;
  const buildMark = (svg) => {
    const word = svg.dataset.mark || "LOGOTYPE";
    const rowsWanted = +(svg.dataset.rows || 1);
    const per = Math.ceil(word.length / rowsWanted);
    const rows = [];
    for (let i = 0; i < word.length; i += per) rows.push(word.slice(i, i + per));
    const outline = svg.classList.contains("is-outline");
    const id = `ct-mark-${++markId}`;
    svg.textContent = "";

    // Original ratio: letter height 165 within width 1384, with room for guide lines sticking out 54px above and below
    const CAP0 = 165, PAD = 54, F0 = CAP0 / 0.7, GAP = 30, ROW = CAP0 + PAD * 1.2;
    // One of the phone and PC wordmarks is display:none so it can’t be measured with SVG — measure text width with a canvas
    const measure = document.createElement("canvas").getContext("2d");
    measure.font = `800 ${F0}px ${logoFont()}`;
    // One line is squeezed to fit the original width 1384, multiple lines use the longest line width as the panel width and scale up to fill the screen width
    const natural = rows.map((row) => [...row].reduce((a, ch) => a + measure.measureText(ch).width, 0) + GAP * (row.length - 1));
    const W = rows.length > 1 ? Math.ceil(Math.max(...natural)) + 80 : 1384;
    const H = PAD * 2 + CAP0 + (rows.length - 1) * ROW;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const defs = el("defs", {}, svg);
    const glyphs = el("g", { class: "ct-mark__fill" });
    const guides = [];
    const rnd = seeded(7 + word.length);
    // If it has to be squeezed horizontally past .86 to fit, shrink the whole text — keeps the original ratio where letters are slightly narrower than tall
    const MIN_SX = 0.86;
    const widest = Math.max(...rows.map((row) => [...row].reduce((a, ch) => a + measure.measureText(ch).width, 0) / (W - 24 - GAP * (row.length - 1))));
    const k = Math.min(1, 1 / (widest * MIN_SX));
    const F = F0 * k, CAP = CAP0 * k;

    rows.forEach((row, r) => {
      const base = PAD + CAP0 - (CAP0 - CAP) / 2 + r * ROW;
      const top = base - CAP;
      const adv = [...row].map((ch) => measure.measureText(ch).width * k);
      const sum = adv.reduce((a, b) => a + b, 0);
      const sx = Math.min(1, (W - 24 - GAP * (row.length - 1)) / sum);
      const used = sum * sx + GAP * (row.length - 1);
      let x = (W - used) / 2;
      [...row].forEach((ch, i) => {
        const w = adv[i] * sx;
        const t = el("text", { "font-size": F, transform: `translate(${x} ${base}) scale(${sx} 1)` }, glyphs);
        t.textContent = ch;
        const x0 = x + F * 0.05 * sx, x1 = x + w - F * 0.05 * sx;
        const gw = x1 - x0;
        const ext = (a, b) => a + rnd() * (b - a);
        const line = (x1_, y1_, x2_, y2_) => guides.push([x1_, y1_, x2_, y2_]);
        line(x0 - ext(8, 40), top, x1 + ext(8, 40), top);
        line(x0 - ext(8, 40), base, x1 + ext(8, 40), base);
        line(x0 + gw * ext(0.12, 0.3), top - ext(10, 45), x0 + gw * ext(0.12, 0.3), base + ext(20, 55));
        if (rnd() > 0.35) { const vx = x0 + gw * ext(0.6, 0.9); line(vx, top - ext(10, 50), vx, base + ext(15, 50)); }
        if (rnd() > 0.4) { const hy = top + CAP * ext(0.35, 0.65); line(x0 - ext(10, 45), hy, x1 + ext(10, 45), hy); }
        if (rnd() > 0.3) {
          const flip = rnd() > 0.5;
          const ya = top - ext(20, 50), yb = base + ext(20, 55);
          const xa = x0 + gw * ext(0.1, 0.45), xb = x0 + gw * ext(0.55, 0.95);
          flip ? line(xa, ya, xb, yb) : line(xb, ya, xa, yb);
        }
        x += w + GAP;
      });
    });

    const drawLines = (parent, attrs = {}) => guides.forEach(([a, b, c, d]) => el("line", { x1: a, y1: b, x2: c, y2: d, ...attrs }, parent));
    if (outline) {
      svg.append(glyphs);
      drawLines(el("g", { class: "ct-mark__guides" }, svg));
      return;
    }
    // Text is split by the line’s space (cut), and the line shows only outside the text (out)
    const cut = el("mask", { id: `${id}-cut`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    el("rect", { width: W, height: H, fill: "#fff" }, cut); // Not skin: mask luminance (white = shown)
    drawLines(el("g", { class: "ct-mark__cuts" }, cut));
    const out = el("mask", { id: `${id}-out`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    el("rect", { width: W, height: H, fill: "#fff" }, out); // Not skin: mask luminance (white = shown)
    const hole = glyphs.cloneNode(true);
    hole.removeAttribute("class");
    hole.setAttribute("fill", "#000"); // Not skin: mask luminance (black = Cover)
    out.append(hole);
    glyphs.setAttribute("mask", `url(#${id}-cut)`);
    svg.append(glyphs);
    drawLines(el("g", { class: "ct-mark__guides", mask: `url(#${id}-out)` }, svg));
  };
  const marks = [...document.querySelectorAll("svg[data-mark]")];
  // Cells are split by measuring glyph widths, so draw after the wordmark font has loaded
  const fontReady = document.fonts ? document.fonts.load(`800 100px ${logoFont()}`).catch(() => {}) : Promise.resolve();
  marks.forEach(buildMark);
  fontReady.then(() => marks.forEach(buildMark));

  // Work detail window: original magnific-popup (inline · no close button · fixedContentPos · mfp-zoom-in · removalDelay 400) — filled with the clicked cell’s name, category and region
  const fill = (card) => {
    const modal = document.getElementById("project");
    const field = (name) => modal.querySelector(`[data-field="${name}"]`);
    field("title").textContent = card.dataset.title || "";
    field("locate").textContent = card.dataset.locate || "";
    field("date").textContent = card.dataset.date || "";
    const cate = field("cate");
    cate.textContent = "";
    (card.dataset.cate || "").split("/").map((v) => v.trim()).filter(Boolean).forEach((label) => {
      const l = document.createElement("span");
      l.className = "label";
      l.textContent = label;
      cate.append(l);
    });
  };
  addEventListener("load", () => {
    jQuery("[data-project]").magnificPopup({
      type: "inline",
      showCloseBtn: false,
      fixedContentPos: true,
      mainClass: "mfp-zoom-in",
      removalDelay: reduced.matches ? 0 : 400,
      callbacks: {
        elementParse(item) { fill(item.el[0]); },
        open() {
          lenis?.stop();
          modalLenis?.destroy();
          modalLenis = null;
          const inner = this.content?.[0]?.querySelector(".ct-modal__inner");
          if (!inner) return;
          inner.scrollTop = 0;
          inner.style.maxHeight = "100dvh";
          if (isNoInertia() || reduced.matches) {
            inner.style.overflowY = "auto";
          } else {
            modalLenis = new Lenis({ wrapper: inner, content: inner.querySelector(".ct-modal__scroll"), gestureOrientation: "vertical" });
            if (!looping) { looping = true; requestAnimationFrame(raf); }
          }
          inner.querySelector(".ct-modal__close")?.focus({ preventScroll: true });
        },
        close() {
          modalLenis?.destroy();
          modalLenis = null;
          if (lenis && !isNoInertia()) lenis.start();
        },
      },
    });
    jQuery(document).on("click", ".ct-modal__close, .ct-modal__prev", (e) => { e.preventDefault(); jQuery.magnificPopup.close(); });
  });
})();
