// Home page key visual — order and values from the original page chunk:
// Once all six characters are loaded, each rolls in step by step (steps) every .4s after its own delay (tilting alternately ±swing on the way into place, first step unseen).
// When the first character stands, the oval grows (CSS steps(4) .7s .2s) and 1.1s later the time and mission text turn on. When all four stand, Lottie runs after .8s and the mission text moves 2s later.
// The mission text slides 12.5% of the path (half a turn, since the path is four turns long) with quint in-out for 3s (phone 2.5s) every 13s (phone 12.5s).
(() => {
  const kv = document.querySelector(".kv");
  if (!kv) return;
  const ID = window.ID || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Mission text path: the same ellipse for four laps (desktop starts at right center like the original, phone starts at bottom center, clockwise) ──
  const loop4 = (cx, cy, rx, ry, fromBottom) => {
    const [a, b] = fromBottom ? [[cx, cy + ry], [cx, cy - ry]] : [[cx + rx, cy], [cx - rx, cy]];
    const arc = (p) => `A${rx} ${ry} 0 0 1 ${p[0]} ${p[1]}`;
    return `M${a[0]} ${a[1]}` + `${arc(b)}${arc(a)}`.repeat(4);
  };
  kv.querySelector("#kv-path-pc")?.setAttribute("d", loop4(685.5, 336.5, 685.5, 336.5, false));
  kv.querySelector("#kv-path-sp")?.setAttribute("d", loop4(156.5, 240, 156.5, 240, true));
  const paths = [...kv.querySelectorAll("textPath")];
  const placeText = (r) => paths.forEach((tp) => tp.setAttribute("startOffset", `${(+tp.dataset.base + (r % 50)) % 100}%`));
  placeText(0);
  const ease = (e) => (e < 0.5 ? 16 * e ** 5 : 1 - (-2 * e + 2) ** 5 / 2);
  const glide = () => {
    const phone = () => innerWidth < 768;
    let t0 = null, last = null;
    // During the still 10s the value is the same so it isn’t rewritten — the original (React) doesn’t redraw for the same value either
    const f = (now) => {
      if (t0 === null) t0 = now;
      const [cycle, move] = phone() ? [12500, 2500] : [13000, 3000];
      const l = now - t0, o = Math.floor(l / cycle), s = l % cycle;
      const r = s < move ? 12.5 * o + 12.5 * ease(s / move) : (o + 1) * 12.5;
      if (r !== last) placeText((last = r));
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };

  // ── Time: device time every 1s (the original also uses new Date) ──
  const hh = kv.querySelector(".kv__hh"), mm = kv.querySelector(".kv__mm");
  const tick = () => {
    const d = new Date();
    hh.textContent = String(d.getHours()).padStart(2, "0");
    mm.textContent = String(d.getMinutes()).padStart(2, "0");
  };
  tick();
  setInterval(tick, 1000);

  // ── Clock and character are dragged with the mouse (original is mouse only too) ──
  const clock = kv.querySelector(".kv__clock");
  const clockOff = ID.dragOff(clock, () => (clock.style.transform = `translate(${clockOff.x}px, ${clockOff.y}px)`));
  if (reduced) kv.classList.add("is-ring");
  const stage = ID.rollIn([...kv.querySelectorAll(".kv__chara")], {
    drag: true, interval: true,
    onRolled: (n) => {
      if (n === 1) kv.classList.add("is-ring");
      if (n === 4) {
        setTimeout(() => stage.enable(), 800);
        setTimeout(glide, 2000);
      }
    },
  });

  // ── COLOR picker (shaped like the original react-colorful HexColorPicker): saturation·brightness panel · hue strip · hex · 10 swatches ──
  const box = document.querySelector(".kv__color");
  if (!box) return;
  const panel = box.querySelector(".kv__panel"), open = box.querySelector(".kv__open");
  const sv = box.querySelector(".kv__sv"), hue = box.querySelector(".kv__hue"), hex = box.querySelector("input");
  const SW = ["#1a1a1a", "#1ba271", "#faa331", "#fbf056", "#6e63bf", "#90d8d9", "#c5cfd6", "#ea4d2d", "#fdb9ba", "#f0f0f0"]; // Not skin: original swatch column colors (color picker content)
  box.querySelector(".kv__sw").innerHTML = SW.map((c) => `<button type="button" style="background-color:${c}" class="${c === SW[SW.length - 1] ? "is-light" : ""}" aria-label="Color ${c} switch to" data-c="${c}"></button>`).join("");
  let H = 0, S = 0, V = 0.1;
  const toHex = (h, s, v) => {
    const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return "#" + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
  };
  const fromHex = (c) => {
    const n = parseInt(c.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
    const h = d ? (mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 : 0;
    return [(h + 360) % 360, mx ? d / mx : 0, mx];
  };
  const show = () => {
    sv.style.setProperty("--h", H);
    const c = toHex(H, S, V);
    sv.querySelector("i").style.cssText = `left:${S * 100}%;top:${(1 - V) * 100}%;--c:${c}`;
    hue.querySelector("i").style.cssText = `left:${(H / 360) * 100}%;--c:hsl(${H} 100% 50%)`;
  };
  const apply = (c, fromPicker) => {
    document.documentElement.style.setProperty("--site-kv", c);
    if (document.activeElement !== hex) hex.value = c.slice(1);
    if (!fromPicker) [H, S, V] = fromHex(c);
    show();
  };
  const drag = (el, fn) => el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.focus();
    const move = (ev) => {
      const r = el.getBoundingClientRect();
      fn(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)));
      apply(toHex(H, S, V), true);
    };
    move(e);
    el.onpointermove = move;
    el.onpointerup = () => (el.onpointermove = null);
  });
  drag(sv, (x, y) => { S = x; V = 1 - y; });
  drag(hue, (x) => { H = x * 360; });
  // Arrow keys move 1% at a time (same as react-colorful)
  const keys = (el, fn) => el.addEventListener("keydown", (e) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    fn(d[0] * 0.01, d[1] * 0.01);
    apply(toHex(H, S, V), true);
  });
  keys(sv, (dx, dy) => { S = Math.min(1, Math.max(0, S + dx)); V = Math.min(1, Math.max(0, V - dy)); });
  keys(hue, (dx) => { H = Math.min(360, Math.max(0, H + dx * 360)); });
  box.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => apply(b.dataset.c)));
  hex.addEventListener("input", () => /^[0-9a-f]{6}$/i.test(hex.value) && apply("#" + hex.value.toLowerCase()));
  const setOpen = (v) => { panel.classList.toggle("is-open", v); open.setAttribute("aria-expanded", v); };
  open.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  document.addEventListener("pointerdown", (e) => panel.classList.contains("is-open") && !box.contains(e.target) && setOpen(false));
  const away = () => box.classList.toggle("is-away", scrollY > innerHeight / 2);
  addEventListener("scroll", away, { passive: true });
  away();
  // Read the initial color from the skin (--site-kv) — painting it here would leave this color behind after a skin change
  const now = getComputedStyle(open.querySelector("i")).backgroundColor.match(/[\d.]+/g)?.slice(0, 3) || [0, 0, 0];
  const cur = "#" + now.map((v) => Math.round(+v).toString(16).padStart(2, "0")).join("");
  [H, S, V] = fromHex(cur);
  hex.value = cur.slice(1);
  show();
})();
