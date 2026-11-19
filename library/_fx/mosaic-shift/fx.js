// One photo is split into three layers of grid-cell masks, each placed at a slightly different size and position and pushed a different distance on scroll — a tile mosaic offset cell by cell.
// The mask is drawn by attaching an SVG sized to the element, so it is redrawn when the window or element size changes
(() => {
  // Layer positions of the original first scene (% of element width) — [width, left, top]. Index 0 is the background photo
  const CROPS = [
    [[144.93, -20.63, -25.69], [134.1, -17.08, -26.67], [139.58, -16.81, -31.6], [123.26, -11.81, -21.88]],
    [[142.01, -19.17, -41.94], [131.39, -15.69, -41.67], [136.81, -15.42, -47.71], [129.93, -15.14, -40]],
  ];
  kfFx.register("mosaic-shift", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')].filter((s) => s.firstElementChild);
    if (!slides.length) return;
    const ac = new AbortController(), signal = ac.signal;
    const timers = [];
    const num = (k, d) => +(options[k] ?? d);
    const list = (k, d) => String(options[k] ?? d).split(",").map(Number);
    const base = num("base", 1440), cell = num("cell", 276), x0 = num("x", 30), y0 = num("y", 106);
    const shift = list("shift", "455.6, 364.5, 182.3"), rise = list("rise", "250, 200, 100");
    const spread = num("spread", 1), seed = num("seed", 7);
    const every = num("every", 7), first = num("first", 4.6);
    if (options.ratio) el.style.setProperty("--fx-ratio", options.ratio);
    const made = [];
    slides.forEach((s, si) => {
      const pic = s.firstElementChild;
      pic.classList.add("fx-ms-pic");
      const crops = CROPS[si % CROPS.length];
      const lay = [{ wrap: null, pic, crop: crops[0] }];
      for (let k = 1; k <= 3; k++) {
        const wrap = document.createElement("div");
        wrap.className = "fx-ms-layer";
        wrap.setAttribute("aria-hidden", "true");
        wrap.style.setProperty("--fx-rise", "0px");
        const rider = document.createElement("div");
        rider.className = "fx-ms-rider";
        const copy = pic.cloneNode(true);
        copy.removeAttribute("id");
        rider.append(copy);
        wrap.append(rider);
        s.append(wrap);
        lay.push({ wrap, rider, pic: copy, k, crop: crops[k].map((v, i) => crops[0][i] + (v - crops[0][i]) * spread) });
      }
      made.push({ s, lay });
    });
    // Cell split: only cells picked by seed are given to that layer (0 shows the background photo)
    const pick = (i, j) => {
      let h = (i * 73856093) ^ (j * 19349663) ^ (seed * 83492791);
      h = Math.abs(Math.imul(h ^ (h >>> 13), 1274126177)) % 7;
      return h < 2 ? 0 : (h % 3) + 1;
    };
    const draw = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      const u = w / base, c = cell * u, ox = x0 * u, oy = y0 * u;
      const paths = ["", "", "", ""];
      for (let i = -1; ox + i * c < w; i++)
        for (let j = -1; oy + j * c < h; j++) {
          const k = pick(i, j);
          if (k) paths[k] += `M${(ox + i * c).toFixed(1)} ${(oy + j * c).toFixed(1)}h${c.toFixed(1)}v${c.toFixed(1)}h${(-c).toFixed(1)}z`;
        }
      el.style.setProperty("--fx-u", u + "px");
      made.forEach(({ lay }) =>
        lay.forEach(({ wrap, pic, crop, k }) => {
          pic.style.width = (crop[0] * w) / 100 + "px";
          pic.style.left = (crop[1] * w) / 100 + "px";
          pic.style.top = (crop[2] * w) / 100 + "px";
          if (!wrap) return;
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><path d='${paths[k] || "M0 0"}'/></svg>`;
          wrap.style.maskImage = wrap.style.webkitMaskImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
          wrap.style.setProperty("--fx-shift", -shift[k - 1] * u + "px");
          wrap.style.setProperty("--fx-rise-to", rise[k - 1] * u + "px");
        }),
      );
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    let pos = 0;
    const show = (n, how) => {
      made.forEach(({ s, lay }, i) => {
        const on = i === n;
        s.toggleAttribute("data-on", on);
        lay.forEach(({ wrap }) => {
          if (!wrap) return;
          wrap.classList.remove("fx-ms-in", "fx-ms-out");
          if (how) { void wrap.offsetWidth; wrap.classList.add(on ? "fx-ms-in" : "fx-ms-out"); }
        });
      });
    };
    show(0, false);
    if (reduce) return () => { ro.disconnect(); made.forEach(({ lay }) => lay.forEach(({ wrap }) => wrap?.remove())); };
    el.classList.add("fx-ms-wait");
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom top", onUpdate: (t) => el.style.setProperty("--fx-p", t.progress.toFixed(4)) });
    const cycle = () => {
      if (made.length < 2) return;
      pos = (pos + 1) % made.length;
      show(pos, true);
      timers.push(setTimeout(cycle, every * 1000));
    };
    // The photo layers rise from below and line up — starts when the cover lifts (fx:play). With start: load, right when it attaches
    const play = () => {
      if (!el.classList.contains("fx-ms-wait")) return;
      el.classList.remove("fx-ms-wait");
      el.classList.add("fx-ms-play");
      timers.push(setTimeout(cycle, first * 1000));
    };
    if (options.start === "load") requestAnimationFrame(() => requestAnimationFrame(play));
    else el.addEventListener("fx:play", play, { signal });
    return () => {
      ac.abort();
      timers.forEach(clearTimeout);
      st.kill();
      ro.disconnect();
      el.classList.remove("fx-ms-wait", "fx-ms-play");
      el.style.removeProperty("--fx-p");
      el.style.removeProperty("--fx-u");
      made.forEach(({ s, lay }) => {
        s.removeAttribute("data-on");
        lay.forEach(({ wrap, pic }) => { if (wrap) wrap.remove(); else { pic.classList.remove("fx-ms-pic"); pic.style.removeProperty("width"); pic.style.removeProperty("left"); pic.style.removeProperty("top"); } });
      });
    };
  });
})();
