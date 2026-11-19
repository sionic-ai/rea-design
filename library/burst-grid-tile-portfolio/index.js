// Grid: drawing cell lines · work cell hover (name band, year text, image lift) · text cell yellow label following the cursor · opening, closing and flipping through work.
// Cell spreading is done by center-spread-tiles, blur by tile-blur-focus, and text fragments by the cell-shatter-gl motion part.
(() => {
  const reduced = JL.reduced;
  const wrap = document.querySelector("#thumbs-wrap");
  const grid = document.querySelector("#main-grid");
  const proj = document.querySelector("#project-wrap");
  const projIn = document.querySelector("#project-content");
  const tiles = [...wrap.querySelectorAll(".jl-tile")].filter((t) => !t.classList.contains("is-filler"));
  const projects = tiles.filter((t) => t.dataset.num != null);
  const canHover = matchMedia("(hover: hover)").matches;
  const wide = () => innerWidth >= 650;
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
  // The original reads the cursor position measured over the whole window (useMouseInElement) inside the cell’s mousemove. The window-side update lags behind the cell handler, so the label trails one step behind.
  const ptr = { x: innerWidth, y: innerHeight };
  addEventListener("pointermove", (e) => { ptr.x = e.clientX; ptr.y = e.clientY; });

  // Grid lines — original ProjectGrid: after 2.4s, vertical lines go up and down from the center row (second row) at 350ms per row, horizontal lines go left and right from the center column at 350ms per column.
  // The center segment goes from the center to both sides (quad.in), the end segments 750ms quad.out, and the segments between are joined straight (none) — one line is drawn from the center outward
  const layer = document.createElement("div");
  layer.className = "jl-borders";
  wrap.appendChild(layer);
  const START = 2.4, STEP = 0.35, EDGE = 0.75;
  const spread = (i, n, w) => (Math.abs(i - (n - 1) / 2) - (n % 2 ? 0 : 0.5)) * w;
  const easeFor = (i, n, mid) => {
    const c = mid ?? (n - 1) / 2, center = Math.abs(i - c) - (mid != null || n % 2 ? 0 : 0.5) === 0, edge = i === 0 || i === n - 1;
    return center && edge ? "quad.inOut" : center ? "quad.in" : edge ? "quad.out" : "none";
  };
  // Lines are SVG segments that bend separately per cell (JL.line) — when the cursor passes, only that cell’s share is pulled and bent
  const drawLines = (animate) => {
    JL.dropLines(layer);
    const shown = [...wrap.querySelectorAll(".jl-tile")].filter((t) => t.offsetWidth > 0);
    const cols = Math.max(1, Math.round(wrap.offsetWidth / shown[0].offsetWidth));
    const rows = Math.ceil(shown.length / cols), mid = Math.min(1, Math.max(0, rows - 1));
    shown.forEach((t, k) => {
      const c = k % cols, r = Math.floor(k / cols);
      if (c > 0) {
        const i = JL.line(layer, "y", t);
        if (animate) {
          gsap.set(i, { scaleY: 0, transformOrigin: r < mid ? "50% 100%" : r > mid ? "50% 0%" : "50% 50%" });
          gsap.to(i, { scaleY: 1, delay: START + Math.abs(r - mid) * STEP, duration: r === 0 || r === rows - 1 ? EDGE : STEP, ease: easeFor(r, rows, mid) });
        }
      }
      if (r > 0) {
        const i = JL.line(layer, "x", t);
        if (animate) {
          gsap.set(i, { scaleX: 0, transformOrigin: c < (cols - 1) / 2 ? "100% 50%" : c > (cols - 1) / 2 ? "0% 50%" : "50% 50%" });
          gsap.to(i, { scaleX: 1, delay: START + spread(r, rows, 0) + spread(c, cols, STEP), duration: c === 0 || c === cols - 1 ? EDGE : STEP, ease: easeFor(c, cols) });
        }
      }
    });
  };
  drawLines(!reduced);
  let rw = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== rw) { rw = innerWidth; drawLines(false); } });

  // Work cell hover — name band 101% → 0 (.5s power3.out) · the image rises by half the band · year: vertical line .25s quad.in → horizontal line .35s quad.out, letters drop in from −40px with bounce.out .75s (.02s apart)
  const splitChars = (el) => { el.innerHTML = [...el.textContent].map((c) => `<span class="char">${c}</span>`).join(""); return [...el.children]; };
  projects.forEach((t) => {
    if (wide() && canHover && !reduced) t.querySelector(".jl-tile__label").classList.add("is-hidden");
    const label = t.querySelector(".jl-tile__label"), art = t.querySelector(".jl-tile__art"), year = t.querySelector(".jl-year");
    const lx = year.querySelector(".jl-year__lx"), ly = year.querySelector(".jl-year__ly"), yt = year.querySelector(".jl-year__t");
    const chars = splitChars(yt);
    if (!canHover || reduced) return;
    t.addEventListener("pointerenter", () => {
      if (!wide()) return;
      if (t.classList.contains("is-open")) { gsap.to(t.querySelectorAll(".jl-cover i"), { "--s": 0.8, duration: 0.75, ease: "power3.out" }); return; }
      gsap.killTweensOf([art, label, lx, ly, yt, ...chars]);
      label.classList.remove("is-hidden");
      gsap.fromTo(label, { y: "101%" }, { y: 0, duration: 0.5, ease: "power3.out" });
      gsap.set(year, { display: "block" });
      gsap.to(ly, { scaleY: 1, duration: 0.25, ease: "quad.in" });
      gsap.to(lx, { delay: 0.25, scaleX: 1, duration: 0.35, ease: "quad.out" });
      gsap.set(yt, { y: 0, display: "inline-block" });
      gsap.fromTo(chars, { y: -40 }, { y: 0, duration: 0.75, ease: "bounce.out", stagger: 0.02 });
      gsap.to(art, { y: -label.offsetHeight / 2, duration: 0.5, ease: "power3.out" });
    });
    t.addEventListener("pointerleave", () => {
      if (!wide()) return;
      if (t.classList.contains("is-open")) gsap.to(t.querySelectorAll(".jl-cover i"), { "--s": 1, duration: 0.75, ease: "elastic.out(1.5,2)" });
      gsap.killTweensOf([art, yt, lx, ly]);
      gsap.to(label, { y: "101%", duration: 0.5, ease: "power3.in", onComplete: () => label.classList.add("is-hidden") });
      gsap.to(yt, { y: -40, duration: 0.35, ease: "quad.in", onComplete: () => gsap.set(year, { display: "none" }) });
      gsap.to(ly, { delay: 0.2, scaleY: 0, duration: 0.2, ease: "quad.out" });
      gsap.to(lx, { scaleX: 0, duration: 0.2, ease: "quad.in" });
      gsap.to(art, { y: 0, duration: 1, ease: "power3.inOut" });
    });
  });

  // Text cell — a yellow label follows the cursor with .5s power3.out, on entering the background unfolds after .15s and the text after .3s with elastic.out(1.5,2) 1s, on leaving it retracts to the right in .25s quad.in
  tiles.filter((t) => t.classList.contains("is-letter")).forEach((t) => {
    const tag = t.querySelector(".jl-tag"), bg = tag.querySelector(".jl-tag__bg"), tx = tag.querySelector(".jl-tag__t");
    if (!canHover || reduced) return;
    let on = false;
    const show = () => {
      if (on) return;
      on = true;
      gsap.killTweensOf([bg, tx]);
      gsap.set(bg, { transformOrigin: "top left" });
      gsap.fromTo(bg, { scaleX: 0, x: 0 }, { delay: 0.15, scaleX: 1, duration: 1, ease: "elastic.out(1.5,2)" });
      gsap.fromTo(tx, { opacity: 0, x: -20, clipPath: "inset(0 100% 0 0)" }, { delay: 0.3, opacity: 1, x: 0, clipPath: "inset(0 0% 0 0)", duration: 1, ease: "elastic.out(1.5,2)" });
    };
    const hide = () => {
      on = false;
      gsap.killTweensOf([bg, tx]);
      gsap.set(bg, { transformOrigin: "top right" });
      gsap.to(bg, { scaleX: 0, x: 20, duration: 0.25, ease: "quad.in" });
      gsap.to(tx, { clipPath: "inset(0 0% 0 100%)", x: 20, duration: 0.25, ease: "quad.in" });
    };
    t.addEventListener("pointerenter", show);
    t.addEventListener("pointermove", () => {
      const r = t.getBoundingClientRect();
      show();
      gsap.to(tag, { x: ptr.x - r.left, y: ptr.y - r.top, duration: 0.5, ease: "power3.out" });
    });
    t.addEventListener("pointerleave", hide);
    t.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && JL.openAbout());
  });

  // Open Work — original: the grid drops 75rem (57rem below 850, based on the fluid root font size) with elastic.out(1,2) 1.5s (after .1s), the Work panel comes down from −50% and the content from −30% with elastic.out(1.2,2) 1.5s.
  // On the pressed cell a white cover comes in from the left (.75s power3.out) and two X lines are drawn .25s apart
  let openNum = null;
  const fill = (num) => {
    const n = Number(num) + 1;
    proj.querySelector(".jl-project__title").textContent = `Work ${String(n).padStart(2, "0")}`;
  };
  const cover = (t, open) => {
    const c = t.querySelector(".jl-cover"), xs = [...c.querySelectorAll("i")];
    t.classList.toggle("is-open", open);
    if (open) {
      gsap.fromTo(c, { xPercent: -100 }, { xPercent: 0, duration: 0.75, ease: "power3.out" });
      xs.forEach((x, k) => gsap.fromTo(x, { "--s": 0 }, { "--s": 1, duration: 0.5, delay: k * 0.25, ease: "power3.out" }));
    } else {
      xs.forEach((x, k) => gsap.to(x, { "--s": 0, duration: 0.4, delay: k * 0.1, ease: "quad.in" }));
      gsap.to(c, { delay: 0.2, xPercent: 100, duration: 0.5, ease: "quad.in" });
    }
  };
  const blurAll = (on) => tiles.forEach((t) => gsap.to(t.querySelector(".jl-tile__face"), { filter: on ? "blur(6px)" : "blur(0px)", duration: 0.25, ease: on ? "quad.out" : "power3.out" }));
  const openProject = (num) => {
    const t = projects.find((p) => p.dataset.num === String(num));
    if (openNum != null) { const o = projects.find((p) => p.dataset.num === String(openNum)); if (o && o !== t) cover(o, false); }
    if (openNum != null && openNum !== num) {
      gsap.to(projIn, { opacity: 0, duration: 0.3, ease: "power3.in", onComplete: () => { fill(num); gsap.to(projIn, { opacity: 1, duration: 0.6, ease: "power3.out" }); } });
      openNum = num;
      cover(t, true);
      return;
    }
    openNum = num;
    fill(num);
    cover(t, true);
    if (!wide()) {
      gsap.set(proj, { display: "block", height: 0 });
      gsap.to(proj, { height: projIn.offsetHeight, duration: 1.5, ease: "power3.inOut", onComplete: () => gsap.set(proj, { height: "auto" }) });
      return;
    }
    const drop = rem() * (innerWidth < 850 ? 57 : 75);
    gsap.killTweensOf([grid, proj, projIn]);
    gsap.set(proj, { display: "block", position: "absolute" });
    gsap.to(grid, { y: drop, duration: reduced ? 0 : 1.5, ease: "elastic.out(1,2)", delay: 0.1, onComplete: () => { gsap.set(grid, { y: 0 }); gsap.set(proj, { position: "relative" }); } });
    gsap.fromTo(proj, { yPercent: -50 }, { yPercent: 0, duration: reduced ? 0 : 1.5, ease: "elastic.out(1.2,2)", delay: 0.1 });
    gsap.fromTo(projIn, { yPercent: -30 }, { yPercent: 0, duration: reduced ? 0 : 1.5, ease: "elastic.out(1.2,2)", delay: 0.1 });
    blurAll(true);
  };
  const closeProject = () => {
    if (openNum == null) return;
    const t = projects.find((p) => p.dataset.num === String(openNum));
    if (t) cover(t, false);
    openNum = null;
    if (!wide()) { gsap.to(proj, { height: 0, duration: 1, ease: "power3.out", onComplete: () => gsap.set(proj, { display: "none", height: "" }) }); return; }
    const drop = rem() * (innerWidth < 850 ? 57 : 75);
    gsap.killTweensOf([grid, proj, projIn]);
    gsap.set(proj, { position: "absolute" });
    gsap.fromTo(grid, { y: drop }, { y: 0, duration: 1.5, ease: "elastic.out(1.2,2)" });
    gsap.to(proj, { yPercent: -50, duration: 1.5, ease: "elastic.out(1.2,2)", onComplete: () => gsap.set(proj, { display: "none", yPercent: 0 }) });
    gsap.to(projIn, { yPercent: -50, duration: 1.5, ease: "elastic.out(1.2,2)", onComplete: () => gsap.set(projIn, { yPercent: 0 }) });
    blurAll(false);
  };
  projects.forEach((t) => t.addEventListener("click", (e) => {
    e.preventDefault();
    const n = Number(t.dataset.num);
    if (openNum === n) closeProject(); else openProject(n);
  }));
  proj.addEventListener("click", (e) => {
    const b = e.target.closest("[data-proj]");
    if (!b) return;
    const act = b.dataset.proj;
    if (act === "close") return closeProject();
    const n = projects.length, next = ((openNum ?? 0) + (act === "next" ? 1 : -1) + n) % n;
    openProject(next);
  });
  addEventListener("keydown", (e) => e.key === "Escape" && closeProject());

  // Work screen text push-away — original Year (radius 120px · strength .2) · Launch (per letter, radius 30px · strength 1).
  // If the cursor is within the radius, it is pushed the opposite way by (radius − distance) × strength over 1s power3.out, and on leaving the cell it returns with .75s elastic.out(2,2)
  if (!reduced && !matchMedia("(pointer: coarse)").matches) {
    const wrapChars = (el) => {
      el.innerHTML = `<span>${[...el.textContent].map((c) => (c.trim() ? `<span class="jl-repel">${c}</span>` : c)).join("")}</span>`;
      return [...el.querySelectorAll(".jl-repel")];
    };
    const repel = (box, els, reach, k) => {
      box.addEventListener("mousemove", (e) => els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2 - gsap.getProperty(el, "x")), dy = e.clientY - (r.top + r.height / 2 - gsap.getProperty(el, "y"));
        const d = Math.hypot(dx, dy), on = d < reach && d > 0;
        gsap.to(el, { x: on ? (-dx / d) * k * (reach - d) : 0, y: on ? (-dy / d) * k * (reach - d) : 0, duration: 1, ease: "power3.out", overwrite: "auto" });
      }));
      box.addEventListener("mouseleave", () => els.forEach((el) => gsap.to(el, { x: 0, y: 0, duration: 0.75, ease: "elastic.out(2,2)", overwrite: "auto" })));
    };
    const yr = proj.querySelector(".jl-project__year"), launch = proj.querySelector(".jl-project__launch");
    yr.innerHTML = `<span class="jl-repel">${yr.textContent}</span>`;
    repel(yr.parentElement, [yr.firstElementChild], 120, 0.2);
    repel(launch, wrapChars(launch), 30, 1);
  }
})();
