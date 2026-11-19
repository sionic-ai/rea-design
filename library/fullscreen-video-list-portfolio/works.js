/* Work list: image size (scroll space) · active row · arrow · row/image hover.
   Original value: focus = Screen height × .34 · anchor = Above image + height × .12 · range = (screen − focus) × .72 · size = .28 + (1 − (1 − t)^1.65) × .72 · lerp .16
   · Opacity = .35 + size × .65 · video plays when more than 4% of the screen width is visible and pauses below 1.2% (up to four at once). */
(() => {
  const { playVideo, reduce } = window.AL;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const rows = $$("[data-row]"), visuals = $$("[data-visual]"), arrow = document.querySelector(".wk__arrow");
  const wide = matchMedia("(min-width: 992px)"), fine = matchMedia("(min-width: 992px) and (hover: hover) and (pointer: fine)");
  const FOCUS = 0.34, MIN = 0.28, BASE_EM = 52;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const state = visuals.map(() => null);
  let active = -1, raf = 0, arrowSet = false;

  function targetScale(el) {
    const vh = innerHeight, r = el.getBoundingClientRect(), focus = vh * FOCUS, anchor = r.top + r.height * 0.12;
    if (anchor <= focus) return 1;
    const t = clamp(1 - (anchor - focus) / Math.max(1, (vh - focus) * 0.72), 0, 1);
    return MIN + (1 - Math.pow(1 - t, 1.65)) * (1 - MIN);
  }
  function apply(i, snap) {
    const el = visuals[i], to = targetScale(el);
    state[i] = state[i] == null || snap ? to : state[i] + (to - state[i]) * 0.16;
    const s = clamp(state[i], MIN, 1);
    el.style.width = (s * 100).toFixed(2) + "%";
    el.style.height = BASE_EM * s + "em";
    el.style.opacity = 0.35 + s * 0.65;
    return Math.abs(to - s);
  }
  function ratio(el) {
    const r = el.getBoundingClientRect(), t = Math.max(0, r.top), b = Math.min(innerHeight, r.bottom), l = Math.max(0, r.left), rt = Math.min(innerWidth, r.right);
    return b <= t || rt <= l ? 0 : ((b - t) * (rt - l)) / (innerWidth * innerHeight);
  }
  function videos() {
    const ranked = visuals.map((el) => ({ el, v: el.querySelector("video"), r: ratio(el) })).sort((a, b) => b.r - a.r);
    let playing = 0;
    const max = wide.matches ? 4 : 1;
    ranked.forEach((k) => {
      const on = playing < max && (k.r > 0.04 || (!k.v.paused && k.r > 0.012));
      if (on) { playing++; playVideo(k.v); } else if (!k.v.paused) k.v.pause();
    });
  }
  function setActive() {
    const vh = innerHeight, focus = vh * FOCUS;
    let best = -1, score = Infinity;
    visuals.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      let s = Math.abs(r.top + r.height * 0.12 - focus);
      if (r.top > vh) s += vh * 0.5;
      if (s < score) { score = s; best = i; }
    });
    if (best !== active) {
      active = best;
      rows.forEach((row, i) => row.classList.toggle("is-active", i === best));
    }
    if (!arrow || best < 0) return;
    const r = rows[best].getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) { arrow.classList.remove("is-ready"); return; }
    arrow.style.top = Math.round(r.top + r.height * 0.5) + "px";
    arrow.classList.add("is-ready");
    if (!arrowSet) { arrowSet = true; requestAnimationFrame(() => requestAnimationFrame(() => arrow.classList.add("is-tracked"))); }
  }
  function tick() {
    raf = 0;
    let moving = 0;
    if (wide.matches) {
      visuals.forEach((_, i) => { moving = Math.max(moving, apply(i, reduce)); });
      setActive();
    }
    videos();
    if (moving > 0.001) raf = requestAnimationFrame(tick);
  }
  const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
  function reset() {
    visuals.forEach((el, i) => { state[i] = null; el.style.width = el.style.height = el.style.opacity = ""; });
    if (wide.matches) for (let pass = 0; pass < 8; pass++) { let d = 0; visuals.forEach((_, i) => { d = Math.max(d, apply(i, true)); }); if (d < 0.001) break; }
    ask();
  }
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", reset);
  wide.addEventListener("change", reset);
  reset();

  // Hovering a row fades only the other rows to .65, hovering an image scales it 1.04x and dims the other images to .68 brightness (measured on the original, the two never overlap)
  function hoverRow(i) {
    if (!fine.matches || reduce) return;
    html.classList.toggle("is-wk-hover", i >= 0);
    rows.forEach((r, k) => r.classList.toggle("is-dim", i >= 0 && k !== i));
  }
  function hoverVisual(i) {
    if (!fine.matches || reduce) return;
    visuals.forEach((v, k) => { v.classList.toggle("is-target", k === i); v.classList.toggle("is-dim", i >= 0 && k !== i); });
  }
  rows.forEach((r, i) => { r.addEventListener("pointerenter", () => hoverRow(i)); r.addEventListener("pointerleave", () => hoverRow(-1)); });
  visuals.forEach((v, i) => { v.addEventListener("pointerenter", () => hoverVisual(i)); v.addEventListener("pointerleave", () => hoverVisual(-1)); });
})();
