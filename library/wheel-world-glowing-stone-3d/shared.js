// Shared by all pages: project list (stone pattern · scene values), sound button, 20px pixel curtain (loader end · page transition), first-visit loader sequence.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GC = (window.GC = window.GC || {});
  GC.reduced = reduced;

  // Stone pattern (veins grain · bands stripes · density) and scene (mist · water · relief · night) values are taken from six original projects
  GC.PROJECTS = [
    { name: ["Work", "One"], color: [1, .1, .05], matter: { veins: 1.4, veinScale: 1, bands: .5, bandScale: 1, density: 1 }, scene: { water: 0, mist: .7, relief: 1.25 } },
    { name: ["Work", "Two"], color: [1, .69, .46], matter: { veins: 1.1, veinScale: 1.4, bands: .6, bandScale: 1.2, density: .95 }, scene: { water: .02, mist: .3, relief: .6, night: 1 } },
    { name: ["Work", "Three"], color: [.62, .46, .2], matter: { veins: .6, veinScale: .8, bands: 1.6, bandScale: .8, density: 1.7 }, scene: { water: .01, mist: .3, relief: .7, night: 1 } },
    { name: ["Work", "Four"], color: [.3, .62, 1], matter: { veins: .25, veinScale: 1, bands: 1.7, bandScale: 1.6, density: 1.15 }, scene: { water: 0, mist: 1.8, relief: 1 } },
    { name: ["Work", "Five"], color: [.19, 1, .86], matter: { veins: .12, veinScale: 1, bands: .25, bandScale: 1, density: .8 }, scene: { water: -.02, mist: 1.2, relief: 1 } },
    { name: ["Work", "Six"], color: [1, .49, .22], matter: { veins: .5, veinScale: 1, bands: 1.8, bandScale: .5, density: 1.05 }, scene: { water: 0, mist: .8, relief: .8 } },
  ];
  GC.projectFromUrl = () => {
    const n = Number(new URLSearchParams(location.search).get("p"));
    return Number.isInteger(n) && n >= 0 && n < GC.PROJECTS.length ? n : 0;
  };

  // ── Sound button: the original toggles background audio. Here it is only the look ──
  document.querySelectorAll(".gc-sound").forEach((b) => b.addEventListener("click", () => {
    const on = b.classList.toggle("is-on");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
  }));

  // ── 20px black cell curtain: lifting starts from the center, covering starts from the edges ──
  const CELL = 20;
  const pix = document.createElement("canvas");
  pix.className = "gc-pixels";
  pix.setAttribute("aria-hidden", "true");
  document.body.append(pix);
  const ctx = pix.getContext("2d");
  let cells = [];
  const layout = () => {
    pix.width = innerWidth;
    pix.height = innerHeight;
    const cols = Math.ceil(innerWidth / CELL);
    const rows = Math.ceil(innerHeight / CELL);
    cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const d = Math.max(Math.abs((x + .5) / cols - .5), Math.abs((y + .5) / rows - .5)) * 2;
      cells.push({ x: x * CELL, y: y * CELL, v: d * .75 + Math.random() * .25 });
    }
  };
  layout();
  addEventListener("resize", layout);
  // t=0 fully covered, t=1 fully cleared. If a captured image (from) exists, it paints that image on not-yet-cleared cells instead of the background color, so the loader screen turns into the finished scene cell by cell
  let from = null;
  const draw = (t) => {
    ctx.clearRect(0, 0, pix.width, pix.height);
    ctx.beginPath();
    for (const c of cells) if (c.v >= t) ctx.rect(c.x, c.y, CELL, CELL);
    if (from) {
      ctx.save();
      ctx.clip();
      ctx.drawImage(from, 0, 0, pix.width, pix.height);
      ctx.restore();
    } else {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim();
      ctx.fill();
    }
  };
  GC.pixels = {
    hold: () => draw(0),
    // Capture the current screen (WebGL is only readable right after drawing) so the next reveal wipes away from that image
    freeze: (src) => {
      from = Object.assign(document.createElement("canvas"), { width: pix.width, height: pix.height });
      from.getContext("2d").drawImage(src, 0, 0, pix.width, pix.height);
    },
    reveal: (duration = .9, ease = "power1.inOut") => new Promise((done) => {
      const s = { t: 0 };
      gsap.to(s, { t: 1, duration: reduced ? .01 : duration, ease, onUpdate: () => draw(s.t), onComplete: () => { from = null; draw(1); done(); } });
    }),
    cover: (duration = .55) => new Promise((done) => {
      const s = { t: 1 };
      gsap.to(s, { t: 0, duration: reduced ? .01 : duration, ease: "power1.inOut", onUpdate: () => draw(s.t), onComplete: done });
    }),
  };

  // ── Page transition: covers with cells, and after moving on, the new page walks in from the center ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute("href");
    if (href === "#") return void e.preventDefault();
    if (!/^[\w-]+\.html(\?[\w=&]*)?$/.test(href)) return;
    e.preventDefault();
    GC.go(href);
  });
  GC.go = (href) => GC.pixels.cover().then(() => (location.href = href));
  addEventListener("pageshow", (e) => e.persisted && draw(1));

  // ── First-visit loader (first page of the session, only on pages with a stone) ──
  let first = false;
  try {
    first = !sessionStorage.getItem("gc:intro");
    sessionStorage.setItem("gc:intro", "1");
  } catch (err) {}
  GC.firstVisit = first && !reduced;
  GC.pixels.hold();

  // Seven windows: wireframe (large center window) → clay · UV · normal · transmission (order shuffled every time) → two finished ones (one a wide window attached to the ground)
  GC.intro = (world, { windows: host, outline, onWheel }) => new Promise((done) => {
    const body = document.body;
    const kinds = ["wireframe", ...["clay", "uv", "normals", "transmission"].sort(() => Math.random() - .5), "beauty", "beauty"];
    const N = kinds.length;
    const els = kinds.map((k) => {
      const el = document.createElement("div");
      el.className = "gc-window";
      el.innerHTML = `<div class="gc-window__bar"><i></i><i></i><i></i><span>${k}</span></div>`;
      host.append(el);
      return el;
    });
    // Size and position use screen-height units: only item 0 is centered at 0.5×0.42, the rest scatter around it
    const spec = kinds.map((k, i) => {
      const ground = i === N - 2;
      const ang = ((((i === N - 1 ? N - 3 : i - 1) + .5) / (N - 2)) + Math.random() * .1) * Math.PI * 2;
      const dist = i === 0 ? 0 : .12 + Math.random() * .2;
      return {
        kind: k, ground, side: Math.random() < .5 ? -1 : 1,
        x: Math.cos(ang) * dist * .72, y: ground ? .26 : Math.sin(ang) * dist * 1.4 - .02,
        w: i === 0 ? .5 : ground ? .46 + Math.random() * .12 : .26 + Math.random() * .24,
        h: i === 0 ? .42 : ground ? .3 + Math.random() * .08 : .2 + Math.random() * .2,
        openAt: .02 + i * .06,
      };
    });
    const DURATION = 2.6;
    const state = { p: 0, outline: .02, phase: "outline" };
    const backOut = (t) => { const s = 1.70158; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
    const rects = () => {
      const W = innerWidth, H = innerHeight;
      return spec.map((s, i) => {
        const k = Math.max(0, backOut(Math.min(1, Math.max(0, (state.p - s.openAt) / .14))));
        const cx = W * .494 + (s.ground ? s.side * (.19 * W / H + s.w * .5) : s.x) * H;
        const cy = H * .491 + s.y * H;
        const w = s.w * H * k, h = s.h * H * k;
        const r = { kind: s.kind, x: Math.max(cx - w / 2, W * .01), y: Math.max(cy - h / 2, H * .01), w, h, k };
        r.w = Math.min(r.w, W * .99 - r.x);
        r.h = Math.min(r.h, H * .99 - r.y);
        Object.assign(els[i].style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`, opacity: k > .01 ? 1 : 0 });
        return r;
      });
    };
    body.classList.add("is-intro");
    GC.pixels.reveal(.01);
    world.loaderWindows = () => (state.phase === "windows" ? rects() : state.phase === "outline" ? [] : null);
    // Original formula: pauses .5s after the outline, then the 2.6s stage runs (Ee = Elapsed time / 2.6). The window opens at the start of the step, and from 56% the finished scene
    // blends with smoothstep (cells clear) all the way to the end, and when blend passes .4 (75%) the cylinder spins twice in 1.5s, when it passes .8 (87%) the headband turns on
    const smooth = (x) => x * x * (3 - 2 * x);
    gsap.timeline()
      .to(state, { outline: 1, duration: .9, ease: "power2.out", onUpdate: () => outline?.style.setProperty("--p", state.outline) })
      .add(() => { state.phase = "windows"; body.classList.add("is-wired"); }, "+=.5")
      .add("reveal")
      .to(state, { p: 1, duration: DURATION, ease: "none" }, "reveal")
      .add(() => {
        // Captures the window screen (window frame laid over the cell image) and swaps each cell to its finished scene — unlike the original, the screen is not covered all at once
        const gl = document.querySelector(".gc-gl");
        world.render(world.loaderWindows());
        const snap = Object.assign(document.createElement("canvas"), { width: innerWidth, height: innerHeight });
        const g = snap.getContext("2d");
        g.drawImage(gl, 0, 0, snap.width, snap.height);
        const frame = getComputedStyle(els[0]).borderTopColor;
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 1 || getComputedStyle(el).opacity === "0") return;
          g.strokeStyle = frame;
          g.strokeRect(r.left + .5, r.top + .5, r.width - 1, r.height - 1);
        });
        GC.pixels.freeze(snap);
        GC.pixels.hold();
        state.phase = "done";
        host.replaceChildren();
        GC.pixels.reveal(DURATION * .44, smooth);
      }, `reveal+=${DURATION * .56}`)
      .add(() => onWheel?.(), `reveal+=${DURATION * .752}`)
      .add(() => {
        body.classList.remove("is-intro");
        body.classList.add("is-ui");
      }, `reveal+=${DURATION * .873}`)
      .add(() => done(), `reveal+=${DURATION}`);
  });
})();
