// Business page: tagline line breaks · half-circle card rotation
(() => {
  const { reduced, sp } = window.ST;

  // Tagline: words are laid out to measure the actual line break positions, each line wrapped in a masking frame. The subtitle follows the tagline in sequence at .14s steps
  const sec = document.querySelector(".ubt");
  const title = sec.querySelector("[data-split]");
  const text = title.textContent.trim();
  const STAGGER = 0.14;
  const layout = () => {
    title.textContent = "";
    const spans = text.split(/\s+/).map((w, i, a) => {
      const s = document.createElement("span");
      s.textContent = w;
      s.style.display = "inline-block";
      title.append(s);
      if (i < a.length - 1) title.append(" ");
      return s;
    });
    const lines = [];
    let top = null;
    spans.forEach((s) => {
      if (top === null || Math.abs(s.offsetTop - top) > 1) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.textContent);
    });
    title.innerHTML = lines.map((l, i) => `<span class="st-line"><span class="st-line__in" style="--delay:${(i * STAGGER).toFixed(2)}s">${l.join(" ")}</span></span>`).join("");
    sec.querySelectorAll(".ubt__sub .st-line__in").forEach((el, j) => el.style.setProperty("--delay", ((lines.length + j) * STAGGER).toFixed(2) + "s"));
  };
  layout();
  if (document.fonts) document.fonts.ready.then(layout);
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; layout(); } });

  // ── Half-circle card rotation (original values): center 270°, PC radius = Panel width × 1.08 · 12.9° spacing · visible range ±4,
  //    Phone × 2.9 · 14° · ±2. Outer card is a white film .68, steps one slot every 2.2s, drag past 46px to step one slot ──
  const carousel = document.querySelector(".uba__carousel");
  const stage = carousel.querySelector(".uba__stage");
  const slides = [...stage.querySelectorAll(".uba__slide")];
  const N = slides.length;
  let active = 0, busy = false, paused = true, timer = 0, revealed = false;
  const norm = (i) => (i + N) % N;
  const offsetOf = (i, base) => { let o = i - base; if (o > N / 2) o -= N; if (o < -N / 2) o += N; return o; };
  const layoutOf = () => {
    const r = stage.getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const L = sp.matches ? { h: 29.2, ratio: 2.9, step: 14, range: 2 } : { h: 34, ratio: 1.08, step: 12.9, range: 4 };
    const radius = r.width * L.ratio;
    return { w: r.width, h: r.height, cx: r.width / 2, cy: radius + (L.h * rem) / 2, radius, step: L.step, range: L.range };
  };
  const render = () => {
    const L = layoutOf();
    slides.forEach((s, i) => {
      const o = offsetOf(i, active);
      const d = Math.abs(o);
      const ang = 270 + o * L.step;
      const rad = (ang * Math.PI) / 180;
      const x = L.cx + Math.cos(rad) * L.radius;
      const y = L.cy + Math.sin(rad) * L.radius;
      const show = d <= L.range;
      s.classList.toggle("is-active", d === 0);
      s.style.transform = `translate(-50%, -50%) translate(${(x - L.w / 2).toFixed(2)}px, ${(y - L.h / 2).toFixed(2)}px) rotate(${(ang - 270).toFixed(2)}deg)`;
      s.style.opacity = show ? "1" : "0";
      s.style.zIndex = String(100 - Math.round(d * 10));
      s.style.pointerEvents = show ? "auto" : "none";
      s.querySelector(".uba__veil").style.opacity = d === 0 ? "0" : "0.68";
    });
  };
  const goTo = (i) => {
    if (busy) return;
    const next = norm(i);
    busy = true;
    // A card crossing to the opposite side teleports instantly while hidden
    slides.forEach((s, k) => s.classList.toggle("is-loop-jump", Math.abs(offsetOf(k, next) - offsetOf(k, active)) > 1));
    active = next;
    render();
    setTimeout(() => { slides.forEach((s) => s.classList.remove("is-loop-jump")); busy = false; }, 780);
  };
  let dragX = null;
  stage.addEventListener("pointerdown", (e) => (dragX = e.clientX));
  addEventListener("pointerup", (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) > 46) goTo(active + (dx < 0 ? 1 : -1));
    dragX = null;
  });
  addEventListener("resize", () => revealed && render());
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    paused = !e.isIntersecting;
    if (!e.isIntersecting) return;
    if (!revealed) { revealed = true; carousel.classList.remove("is-before-reveal"); render(); }
    if (!timer && !reduced) { goTo(active + 1); timer = setInterval(() => !paused && goTo(active + 1), 2200); }
  }), { rootMargin: "0px 0px -30% 0px" });
  io.observe(carousel);
  render();
})();
