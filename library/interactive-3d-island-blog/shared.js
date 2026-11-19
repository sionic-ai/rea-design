// The Boring Blog — common to all pages: picture panel in the middle of a field (our four scenes drawn on canvas), sun button (day↔night, blending through sunset over 2 seconds),
// Turn bar (exchanges with field parts via fx:turned and fx:goto), small subscribe window, and a transition where the panel steps aside when leaving the page.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const css = () => getComputedStyle(root);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = $(".bb-stage");

  // ── Center picture panel: a small scene of people and animals on grass. The ground line is 36% from the bottom ──
  const SKIN = "#e9b892"; /* Not skin: flesh tone of people in the illustration */
  const FUR = "#d8b07a"; /* Not skin: dog and cat fur colors in the picture */
  const paintScenes = () => {
    const c = css();
    const v = (n) => c.getPropertyValue(n).trim();
    const ink = v("--site-ink") || v("--kf-ink"), red = v("--site-red") || v("--kf-accent"), paper = v("--site-paper") || v("--kf-bg");
    const dim = v("--site-ink-3") || v("--kf-dim"), soft = v("--site-ink-2") || v("--kf-ink-soft");
    const GY = 256;
    const line = (x) => { x.lineWidth = 5; x.lineJoin = x.lineCap = "round"; x.strokeStyle = ink; };
    const blob = (x, fill, f) => { x.beginPath(); f(); x.fillStyle = fill; x.fill(); x.stroke(); };
    const head = (x, cx, cy, cap) => {
      blob(x, SKIN, () => x.arc(cx, cy, 22, 0, Math.PI * 2));
      if (cap) blob(x, ink, () => { x.arc(cx, cy - 4, 23, Math.PI, 0); x.lineTo(cx + 34, cy - 4); });
      x.beginPath(); x.arc(cx - 7, cy + 2, 2.6, 0, 7); x.arc(cx + 8, cy + 2, 2.6, 0, 7); x.fillStyle = ink; x.fill();
    };
    const draw = {
      reader(x) { // A child with a red bag sits reading a book, and a dog lies sleeping beside them
        line(x);
        blob(x, red, () => x.roundRect(170, 150, 74, 92, 14));
        blob(x, red, () => x.roundRect(232, 168, 70, 84, 18));
        blob(x, soft, () => { x.moveTo(250, 250); x.quadraticCurveTo(300, 236, 336, GY); x.lineTo(240, GY); });
        head(x, 268, 140, true);
        blob(x, paper, () => { x.moveTo(282, 196); x.lineTo(326, 186); x.lineTo(330, 214); x.lineTo(286, 222); x.closePath(); });
        blob(x, FUR, () => x.ellipse(408, 238, 62, 22, 0, 0, Math.PI * 2));
        blob(x, FUR, () => x.ellipse(462, 226, 22, 18, 0.2, 0, Math.PI * 2));
        blob(x, FUR, () => x.ellipse(476, 214, 9, 14, 0.5, 0, Math.PI * 2));
      },
      telescope(x) { // A person gazing at the sky through a small telescope
        line(x);
        x.beginPath(); x.moveTo(380, GY); x.lineTo(410, 170); x.lineTo(440, GY); x.moveTo(410, 170); x.lineTo(410, GY); x.stroke();
        blob(x, dim, () => { x.save(); x.translate(410, 160); x.rotate(-0.55); x.roundRect(-70, -16, 140, 32, 10); x.restore(); });
        blob(x, red, () => x.roundRect(250, 150, 66, 106, 16));
        blob(x, soft, () => x.roundRect(254, 220, 26, 36, 8));
        blob(x, soft, () => x.roundRect(288, 220, 26, 36, 8));
        head(x, 284, 128, false);
        blob(x, red, () => { x.moveTo(300, 170); x.lineTo(352, 150); x.lineTo(358, 166); x.lineTo(306, 190); x.closePath(); });
      },
      kite(x) { // Kid flying a kite
        line(x);
        blob(x, red, () => { x.moveTo(430, 112); x.lineTo(460, 138); x.lineTo(430, 176); x.lineTo(402, 140); x.closePath(); });
        x.beginPath(); x.moveTo(430, 176); x.bezierCurveTo(400, 192, 362, 172, 330, 184); x.stroke();
        x.beginPath(); x.moveTo(430, 176); x.quadraticCurveTo(442, 196, 428, 214); x.stroke();
        blob(x, dim, () => x.roundRect(262, 156, 62, 100, 16));
        blob(x, soft, () => { x.moveTo(266, 220); x.lineTo(250, GY); x.lineTo(276, GY); x.lineTo(290, 224); x.closePath(); });
        blob(x, soft, () => { x.moveTo(300, 222); x.lineTo(320, GY); x.lineTo(344, GY); x.lineTo(318, 220); x.closePath(); });
        head(x, 292, 132, true);
        blob(x, dim, () => { x.moveTo(316, 170); x.lineTo(334, 182); x.lineTo(326, 194); x.lineTo(306, 186); x.closePath(); });
      },
      box(x) { // A cat sits on the box, and a person crouches beside it to look
        line(x);
        blob(x, FUR, () => x.rect(330, 176, 120, 80));
        blob(x, FUR, () => { x.moveTo(330, 176); x.lineTo(304, 150); x.lineTo(424, 150); x.lineTo(450, 176); x.closePath(); });
        blob(x, ink, () => x.ellipse(392, 140, 30, 24, 0, 0, Math.PI * 2));
        blob(x, ink, () => { x.moveTo(370, 104); x.lineTo(380, 84); x.lineTo(390, 104); x.moveTo(396, 104); x.lineTo(406, 84); x.lineTo(414, 104); });
        blob(x, red, () => x.roundRect(212, 170, 70, 86, 18));
        head(x, 248, 150, true);
        blob(x, soft, () => x.roundRect(214, 230, 72, 26, 10));
      },
    };
    $$('.bb-stage [data-fx-part="scene"]').forEach((cv) => {
      const x = cv.getContext("2d");
      x.clearRect(0, 0, cv.width, cv.height);
      x.save();
      // Like the original scene, scale up from the center of the bottom line so the figure takes up a bit over half the stage height
      x.translate(300, GY); x.scale(1.75, 1.75); x.translate(-330, -GY);
      draw[cv.dataset.draw]?.(x);
      x.restore();
    });
  };
  paintScenes();

  // ── Sun button: day → (sunset) → night, 2s. Mixes night and gold exactly per the original table ──
  const KEYS = [[0, 0, 0], [0.16, 0.07, 0.5], [0.42, 0.34, 1], [0.62, 0.66, 0.6], [0.8, 0.89, 0.22], [0.92, 0.97, 0.06], [1, 1, 0]];
  const at = (p) => {
    let i = 1;
    while (i < KEYS.length - 1 && KEYS[i][0] < p) i++;
    const a = KEYS[i - 1], b = KEYS[i], t = b[0] === a[0] ? 0 : (p - a[0]) / (b[0] - a[0]);
    return { night: a[1] + (b[1] - a[1]) * t, gold: a[2] + (b[2] - a[2]) * t };
  };
  const apply = ({ night, gold }, recolor = true) => {
    root.style.setProperty("--site-night", night.toFixed(4));
    root.style.setProperty("--site-gold", gold.toFixed(4));
    root.style.setProperty("--fx-scene-light", (1 - 0.64 * night).toFixed(4));
    if (recolor) stage?.dispatchEvent(new CustomEvent("fx:recolor", { detail: { dur: 0 } }));
  };
  let sun = "day";
  try { sun = localStorage.getItem("bb-sun") === "night" ? "night" : "day"; } catch (e) { sun = "day"; }
  root.dataset.sun = sun;
  root.dataset.ui = sun;
  apply(at(sun === "night" ? 1 : 0), false);
  let uiTimer = 0;
  let sunRaf = 0;
  const setSun = (to) => {
    sun = to;
    root.dataset.sun = to;
    try { localStorage.setItem("bb-sun", to); } catch (e) { /* If saving fails, this time only */ }
    $$(".bb-sun").forEach((b) => b.setAttribute("aria-label", to === "night" ? "Bring the sun up" : "Put the sun down"));
    cancelAnimationFrame(sunRaf);
    clearTimeout(uiTimer);
    if (reduce) { root.dataset.ui = to; apply(at(to === "night" ? 1 : 0)); paintScenes(); return; }
    root.classList.add("is-dusking");
    const t0 = performance.now(), from = +css().getPropertyValue("--site-night") || 0;
    const startP = to === "night" ? from : 1 - from;
    // When passing the point where the gold is deepest (.42) the UI colors flip — 840ms toward night, 1160ms toward day
    uiTimer = setTimeout(() => { root.dataset.ui = to; }, Math.max(0, 2000 * ((to === "night" ? 0.42 : 0.58) - startP)));
    const step = (now) => {
      const p = Math.min(1, startP + (now - t0) / 2000);
      apply(at(to === "night" ? p : 1 - p));
      if (p < 1) sunRaf = requestAnimationFrame(step);
      else { paintScenes(); setTimeout(() => root.classList.toggle("is-dusking", false), 700); }
    };
    sunRaf = requestAnimationFrame(step);
  };
  $$(".bb-sun").forEach((b) => b.addEventListener("click", () => setSun(sun === "night" ? "day" : "night")));

  // ── Subscribe small window ──
  $$(".bb-sub").forEach((box) => {
    const btn = box.querySelector("[data-fx~='seam-split-btn']");
    const close = () => { box.dataset.state = "closed"; btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); const open = box.dataset.state !== "open"; box.dataset.state = open ? "open" : "closed"; btn.setAttribute("aria-expanded", String(open)); if (open) box.querySelector("input")?.focus({ preventScroll: true }); });
    box.querySelector("form")?.addEventListener("submit", (e) => { e.preventDefault(); close(); });
    document.addEventListener("click", (e) => { if (!box.contains(e.target)) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  });

  // ── Turn Bar ──
  const track = $(".bb-track");
  if (track && stage) {
    const inner = $(".bb-track__inner", track), bar = $(".bb-track__bar", track), segL = $(".bb-track__seg--l", track), segR = $(".bb-track__seg--r", track), thumbs = $(".bb-track__thumbs", track);
    let steps = 24, idx = 0, gap = 0, rect = null;
    const draw = () => {
      const p = (idx + 0.5) / steps;
      [bar, thumbs].forEach((n) => n.style.setProperty("--at", p.toFixed(5)));
      segL.style.setProperty("--l", Math.max(0, p - gap).toFixed(5));
      segR.style.setProperty("--r", Math.max(0, 1 - p - gap).toFixed(5));
    };
    const measure = () => { rect = bar.getBoundingClientRect(); gap = rect.width > 0 ? 7 / rect.width : 0; draw(); };
    stage.addEventListener("fx:turned", (e) => { steps = e.detail.steps; idx = e.detail.index; bar.setAttribute("aria-valuemax", String(steps - 1)); bar.setAttribute("aria-valuenow", String(idx)); bar.setAttribute("aria-valuetext", `View ${idx + 1} of ${steps}`); draw(); });
    const sceneAt = (x) => Math.max(0, Math.min(steps - 1, Math.round(((x - rect.left) / rect.width) * steps - 0.5)));
    let dragging = false;
    bar.addEventListener("pointerdown", (e) => { if (e.button) return; e.stopPropagation(); e.preventDefault(); dragging = true; rect = bar.getBoundingClientRect(); inner.classList.add("is-dragging"); bar.setPointerCapture?.(e.pointerId); stage.dispatchEvent(new CustomEvent("fx:goto", { detail: sceneAt(e.clientX) })); });
    bar.addEventListener("pointermove", (e) => { if (dragging) stage.dispatchEvent(new CustomEvent("fx:goto", { detail: sceneAt(e.clientX) })); });
    const end = () => { dragging = false; inner.classList.remove("is-dragging"); };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => bar.addEventListener(t, end));
    bar.addEventListener("keydown", (e) => { const d = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[e.key]; if (d !== undefined) { e.preventDefault(); stage.dispatchEvent(new CustomEvent("fx:turn", { detail: d })); } });
    $$("[data-turn]", track).forEach((b) => b.addEventListener("click", () => stage.dispatchEvent(new CustomEvent("fx:turn", { detail: +b.dataset.turn }))));
    // When the cursor nears the bar height, lines thicken by (1 − distance/210)² within 210px
    let my = -1e4, q = 0;
    const reach = () => { q = 0; const r = rect || bar.getBoundingClientRect(); const k = Math.max(0, 1 - Math.abs(my - r.top) / 210); [inner, thumbs].forEach((n) => n.style.setProperty("--reach", (k * k).toFixed(3))); };
    if (!reduce) {
      addEventListener("pointermove", (e) => { my = e.clientY; if (!q) q = requestAnimationFrame(reach); }, { passive: true });
      root.addEventListener("pointerleave", () => { my = -1e4; if (!q) q = requestAnimationFrame(reach); });
    }
    new ResizeObserver(measure).observe(bar);
    measure();
  }

  // ── Transition: links to other pages step the plane aside for .2s, then navigate ──
  const leaf = $(".bb-leaf");
  window.bbLeave = (href) => {
    if (!leaf || reduce) { location.href = href; return; }
    leaf.setAttribute("data-leaving", "");
    setTimeout(() => { location.href = href; }, 200);
  };
  $$("a[data-leaf]").forEach((a) => a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    window.bbLeave(a.getAttribute("href"));
  }));
  addEventListener("pageshow", (e) => { if (e.persisted) leaf?.removeAttribute("data-leaving"); });
})();
