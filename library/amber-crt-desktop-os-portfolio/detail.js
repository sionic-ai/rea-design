// Work detail — scrolls with Lenis (original 1.3.26, default lerp .1, overscroll off), matches the fixed gallery dots and preview to the section number, and
// In the Footer’s next-work strip, as it passes through the strip the image gathers into particles (0~.6), the name letters turn on from the front (.22~.72, the two just-lit cells in ember color), and the intro line opens like a cursor (.55~.9)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = reduce ? null : new Lenis({ overscroll: false });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const goY = (y) => (lenis ? lenis.scrollTo(y) : window.scrollTo(0, y));

  // Gallery — when the section changes: dots (current 8px, others 5px at .7), progress line, and a ”Next capture” preview at lower right
  const gal = document.querySelector(".e-gal"), dots = [...gal.querySelectorAll("[data-dot]")], line = gal.querySelector("[data-gal-line]"), peek = gal.querySelector("[data-gal-peek]");
  const figs = [...gal.querySelectorAll(".e-fig")];
  let idx = 0;
  gal.addEventListener("fx:slide", (e) => {
    idx = e.detail.index;
    dots.forEach((d, i) => {
      d.setAttribute("aria-current", String(i === idx));
      gsap.to(d.firstElementChild, { width: i === idx ? 8 : 5, height: i === idx ? 8 : 5, opacity: i === idx ? 1 : 0.7, duration: reduce ? 0 : 0.3, ease: "power2.out", overwrite: true });
    });
    gsap.set(line, { scaleX: idx / Math.max(1, figs.length - 1) });
    const last = idx >= figs.length - 1;
    peek.setAttribute("aria-disabled", String(last));
    const next = figs[Math.min(idx + 1, figs.length - 1)].querySelector(".wf-img");
    peek.firstElementChild.dataset.label = `Next — ${next.dataset.label.split(" — ")[1] || ""}`.slice(0, 26);
  });
  const toSlide = (i) => {
    const st = ScrollTrigger.getAll().find((s) => s.trigger === gal && s.pin);
    if (!st) return;
    goY(st.start + ((st.end - st.start) * Math.max(0, Math.min(figs.length - 1, i))) / (figs.length - 1) + 1);
  };
  dots.forEach((d, i) => d.addEventListener("click", () => toSlide(i)));
  peek.addEventListener("click", () => toSlide(idx + 1));

  // Next work strip
  const runway = document.querySelector("[data-next]"), art = document.querySelector("[data-next-art]"), title = document.querySelector("[data-next-title]"), desc = document.querySelector("[data-next-desc]");
  const chars = [];
  title.innerHTML = title.textContent.split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? w : `<span class="w">${[...w].map((c) => `<span class="c">${c}</span>`).join("")}</span>`)).join("");
  title.querySelectorAll(".c").forEach((c) => chars.push(c));
  const cur = document.createElement("span");
  cur.className = "cur";
  desc.append(cur);
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const setTitle = (p) => {
    const n = Math.ceil(p * chars.length), hot = n >= chars.length ? n : Math.max(0, n - 2);
    chars.forEach((c, i) => { c.classList.toggle("is-on", i < n); c.classList.toggle("is-hot", i < n && i >= hot); });
  };
  // About line — open the cover by joined line length × progress, with a cursor block at its end (line height .42)
  const setDesc = (p) => {
    desc.style.opacity = p > 0 ? "1" : "0";
    if (p >= 1) { desc.style.removeProperty("mask-image"); desc.style.removeProperty("-webkit-mask-image"); cur.style.display = "none"; return; }
    cur.style.display = "";
    const box = desc.getBoundingClientRect(), r = document.createRange();
    r.selectNodeContents(desc.firstChild);
    const rows = [];
    for (const c of r.getClientRects()) { const t = c.top - box.top, row = rows.find((x) => Math.abs(x.top - t) < c.height / 2); if (row) { row.l = Math.min(row.l, c.left - box.left); row.r = Math.max(row.r, c.right - box.left); } else rows.push({ top: t, h: c.height, l: c.left - box.left, r: c.right - box.left }); }
    if (!rows.length) return;
    let left = rows.reduce((s, x) => s + x.r - x.l, 0) * Math.round(p * rows.length * 4) / (rows.length * 4), i = 0;
    while (i < rows.length - 1 && left > rows[i].r - rows[i].l) { left -= rows[i].r - rows[i].l; i++; }
    const row = rows[i], cw = row.h * 0.42, x = row.l + Math.min(left, row.r - row.l);
    const m = "linear-gradient(#000,#000),linear-gradient(#000,#000)"; /* Not skin: cover alpha */
    for (const k of ["", "-webkit-"]) {
      desc.style.setProperty(`${k}mask-image`, m);
      desc.style.setProperty(`${k}mask-size`, `${box.width + 2}px ${Math.max(0, row.top)}px, ${x + cw}px ${row.h}px`);
      desc.style.setProperty(`${k}mask-position`, `0 0, 0 ${row.top}px`);
      desc.style.setProperty(`${k}mask-repeat`, "no-repeat");
    }
    cur.style.cssText = `left:${x}px;top:${row.top + row.h * 0.14}px;width:${cw}px;height:${row.h * 0.72}px`;
  };
  const paint = (p) => {
    art.dispatchEvent(new CustomEvent("fx:progress", { detail: { key: "next", value: smooth(0, 0.6, p) } }));
    setTitle(reduce ? 1 : smooth(0.22, 0.72, p));
    setDesc(reduce ? 1 : smooth(0.55, 0.9, p));
  };
  // Only after more than 70% has gathered does the original picture show through at the cursor’s handprint spot (original projectNext)
  window.eddyTrail?.plane(art, { gate: 0.7 });
  ScrollTrigger.create({ trigger: runway, start: "top 73px", end: "bottom bottom", onUpdate: (s) => paint(s.progress >= 0.995 ? 1 : s.progress), onRefresh: (s) => paint(s.progress) });
  paint(0);
  document.addEventListener("site:enter", () => ScrollTrigger.refresh(), { once: true });
})();
