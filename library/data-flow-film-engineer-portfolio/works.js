// Work collection — hovering a row for 70ms (immediately if pressed or focused) makes that company the chosen row, and the preview switches via view transition
// (old one fades out in .16s, new one rises from 10px below in .36s). In the preview the structure drawing’s lines are drawn in .62s and the center box comes in .16s later.
(() => {
  const LQ = (window.LQ = window.LQ || { pages: {} });
  const STUDIES = [
    { n: "01", src: ["Input 1", "Input 2", "Input 3"], core: "Center box", dst: ["Output 1", "Output 2", "Output 3"], title: "01 / Diagram title", tags: "Field 1 / Field 2 / Field 3",
      figures: [["000B+", "Number Description One"], ["000+", "Number description two"], ["00", "Number description three"]] },
    { n: "02", src: ["Input 1", "Input 2"], mid: "Intermediate step", core: "Center box", dst: ["Output 1", "Output 2"], title: "02 / Diagram title", tags: "Field 1 / Field 2 / Field 3",
      figures: [["0,000+", "Number Description One"], ["€0B+", "Number description two"], ["0", "Number description three"]], story: true },
    { n: "03", src: ["Input 1", "Input 2", "Input 3"], mid: "Intermediate step", core: "Center box", dst: ["Output 1"], title: "03 / Diagram title", tags: "Field 1 / Field 2 / Field 3",
      figures: [["000,000", "Number Description One"], ["00M", "Number description two"], ["0", "Number description three"]] },
    { n: "04", src: ["Input 1", "Input 2", "Input 3"], core: "Center box", dst: ["Output 1", "Output 2", "Output 3"], title: "04 / Diagram title", tags: "Field 1 / Field 2 / Field 3",
      figures: [["00,000", "Number Description One"], ["$0.00B", "Number description two"]] },
  ];
  let uid = 0;

  // Left boxes → (middle step) → center black box → right boxes. Lines draw per branch and a square dot circles once in 2.4s
  function diagram(s) {
    const id = `chev-${++uid}`;
    const ys = (n) => Array.from({ length: n }, (_, i) => 175 + (i - (n - 1) / 2) * 75);
    const mid = !!s.mid;
    const srcX = mid ? 40 : 84, srcW = mid ? 130 : 150, coreX = mid ? 400 : 325, coreW = 150;
    const coreR = coreX + coreW, dstX = 566 + (mid ? 40 : 0), dstW = mid ? 140 : 150;
    const grid = [];
    for (let x = 0; x <= 800; x += 40) grid.push(`<path d="M ${x} 0 V 350" class="diagram-grid"/>`);
    for (let y = 0; y <= 320; y += 40) grid.push(`<path d="M 0 ${y} H 800" class="diagram-grid"/>`);
    const inX = mid ? 330 : coreX;
    const lanesIn = ys(s.src.length).map((y) => `M ${srcX + srcW} ${y} H ${srcX + srcW + 46} L ${inX} 175`);
    const lanesOut = ys(s.dst.length).map((y) => `M ${coreR} 175 L ${coreR + 45} ${y} H ${dstX}`);
    const midPath = mid ? `<path d="M 330 175 H 400" pathLength="1" class="diagram-path diagram-draw"/>` : "";
    const paths = lanesIn.map((p, i) => `<path d="${p}${lanesOut[i % lanesOut.length].replace(/^M [\d.]+ [\d.]+/, ` M ${coreR} 175`)}" pathLength="1" class="diagram-path diagram-draw"/>`);
    const packets = lanesIn.map((p, i) => {
      const out = lanesOut[i % lanesOut.length].replace(/^M [\d.]+ [\d.]+ /, "");
      return `<rect x="-3" y="-3" width="6" height="6" class="packet"><animateMotion dur="2.4s" begin="-${(i * 0.8).toFixed(1)}s" repeatCount="indefinite" path="${p} H ${coreR} ${out}"/></rect>`;
    });
    const node = (x, y, w, t) => `<g><rect x="${x}" y="${y - 20}" width="${w}" height="40" class="diagram-node"/><text x="${x + w / 2}" y="${y + 4}" text-anchor="middle" class="diagram-label diagram-node-label">${t}</text></g>`;
    return `<div class="architecture" role="img" aria-label="${s.title}" style="--chevron:url(#${id})">
      <svg viewBox="0 0 800 350" aria-hidden="true">
        <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L9 5 L1 9" class="diagram-chevron"/></marker></defs>
        ${grid.join("")}
        <text x="28" y="30" class="diagram-label">${s.title}</text>
        <text x="28" y="336" class="diagram-label">Initials / structure at a glance</text>
        ${paths.join("")}${midPath}${packets.join("")}
        ${ys(s.src.length).map((y, i) => node(srcX, y, srcW, s.src[i])).join("")}
        ${mid ? node(220, 175, 110, s.mid) : ""}
        ${ys(s.dst.length).map((y, i) => node(dstX, y, dstW, s.dst[i])).join("")}
        <rect x="${coreX}" y="140" width="${coreW}" height="70" class="diagram-core"/>
        <text x="${coreX + coreW / 2}" y="179" text-anchor="middle" class="diagram-core-label">${s.core}</text>
        <path d="M ${coreX} 130 V 120 H ${coreR} V 130 M ${coreX} 220 V 230 H ${coreR} V 220" class="diagram-path"/>
      </svg>
    </div>`;
  }
  const body = (s) => `${diagram(s)}
    <p class="work-tags">${s.tags}</p>
    <p class="work-summary">Your two lines on what was done for this company go here. Say what was designed, what was migrated, and how far it was led.</p>
    <div class="work-context">
      <p class="eyebrow muted">The company numbers back then</p>
      <dl class="work-context-figures">${s.figures.map(([v, l]) => `<div><dt class="eyebrow muted">${l}</dt><dd class="work-context-value">${v}</dd><dd><a href="#" class="eyebrow work-context-source"><span class="nowrap">Source site name</span> <span class="nowrap">· 0000 ↗</span></a></dd></div>`).join("")}</dl>
    </div>${s.story ? `
    <div class="work-story"><p class="eyebrow muted">Public client case — Your case title here</p><p>Your case summary here, two lines. State which numbers changed after a few months of testing, as the client reported.</p><a href="#" class="eyebrow work-context-source">Source name · 0000 ↗</a></div>` : ""}`;

  LQ.pages.works = (main) => {
    const rows = [...main.querySelectorAll(".work-row")], aside = main.querySelector(".work-preview");
    if (!rows.length || !aside) return () => {};
    let active = -1, timer = 0;
    const paint = (i) => {
      active = i;
      rows.forEach((r, k) => {
        r.toggleAttribute("data-active", k === i);
        r.querySelector(".work-row-trigger")?.setAttribute("aria-expanded", String(k === i));
        r.querySelector(".work-row-inline")?.remove();
      });
      const s = STUDIES[i], row = rows[i];
      aside.innerHTML = `<div class="work-preview-body" style="--brand: ${row.style.getPropertyValue("--brand")}"><p class="eyebrow muted work-preview-kicker">Preview — ${s.n}</p>${body(s)}</div>`;
      const inline = document.createElement("div");
      inline.className = "work-row-inline";
      inline.innerHTML = body(s);
      row.append(inline);
    };
    const pick = (i) => {
      if (i === active) return;
      if (!document.startViewTransition || LQ.still()) return paint(i);
      document.startViewTransition(() => paint(i));
    };
    const offs = rows.map((r, i) => {
      const enter = () => { clearTimeout(timer); timer = setTimeout(() => pick(i), 70); };
      const leave = () => clearTimeout(timer);
      const now = () => { clearTimeout(timer); pick(i); };
      const t = r.querySelector(".work-row-trigger");
      r.addEventListener("mouseenter", enter);
      r.addEventListener("mouseleave", leave);
      t?.addEventListener("click", now);
      t?.addEventListener("focus", now);
      return () => { r.removeEventListener("mouseenter", enter); r.removeEventListener("mouseleave", leave); t?.removeEventListener("click", now); t?.removeEventListener("focus", now); };
    });
    paint(0);
    return () => { clearTimeout(timer); offs.forEach((f) => f()); };
  };
})();
