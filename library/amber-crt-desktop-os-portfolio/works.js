// Work room — three views (sphere·list·gallery) switched with path-line buttons, list flows with the wheel, gallery flips one at a time. The chosen view is kept in the session
(() => {
  const room = document.querySelector(".e-room"), reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const views = { sphere: document.querySelector(".e-sphere"), index: document.querySelector(".e-index"), gallery: document.querySelector(".e-gallery") };
  const toggles = [...document.querySelectorAll("[data-mode-go]")];
  const KEY = "eddy-works-mode";
  let mode = "sphere";
  const setMode = (m) => {
    if (!views[m]) return;
    mode = m;
    room.dataset.mode = m;
    Object.entries(views).forEach(([k, el]) => (el.hidden = k !== m));
    toggles.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.modeGo === m)));
    sessionStorage.setItem(KEY, m);
    if (m === "index") requestAnimationFrame(() => { layoutIndex(); scrollIndex(0, true); });
    if (m === "gallery") requestAnimationFrame(() => go(at, true));
  };
  toggles.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.modeGo)));

  // Sphere — click a card and it rotates to the center (fx:pick), then goes to the detail. On the raised card, only the spot the cursor passed (handprint) loses the dither and shows its original color (original card fluid handprint)
  views.sphere.addEventListener("fx:pick", () => window.eddyGo?.("detail.html"));
  const clear = (img, on) => { const a = window.eddyCover?.(+img.dataset.cover); if (a) img.src = on ? a.raw : a.dith; };
  window.eddyTrail?.cards(views.sphere, { selector: ".e-card", rawOf: (img) => img && window.eddyCover?.(+img.dataset.cover)?.raw });

  // List — an endless looping ring. The wheel changes the target and the rows follow with .8s power3. Letters light up from the front by the visible share (--p),
  // The center row becomes cream plus a particle image on the right. At first the first work is centered (the last works continue above it)
  const list = document.querySelector("[data-index-list]"), items = [...list.children], rows = items.map((li) => li.querySelector(".row")), art = document.querySelector(".e-index__art");
  let y = 0, target = 0, H = 1, rowH = 80, total = 1, on = null;
  const follow = gsap.quickTo({ get v() { return y; }, set v(n) { y = n; } }, "v", { duration: reduce ? 0 : 0.8, ease: "power3", onUpdate: () => paintIndex() });
  const layoutIndex = () => { H = views.index.clientHeight; rowH = items[0]?.offsetHeight || 80; total = rowH * items.length; };
  const paintIndex = () => {
    let best = null, bd = Infinity;
    items.forEach((li, i) => {
      let t = (i * rowH - y) % total;
      if (t < -total / 2) t += total;
      if (t > total / 2) t -= total;
      const top = H / 2 - rowH / 2 + t;
      li.style.transform = `translateY(${top.toFixed(1)}px)`;
      const p = Math.max(0, Math.min(1, Math.min(top + rowH, H - top) / rowH));
      rows[i].style.setProperty("--p", p.toFixed(3));
      const d = Math.abs(t);
      if (d < bd) { bd = d; best = rows[i]; }
    });
    if (best && best !== on) {
      on?.classList.remove("is-on");
      on = best; on.classList.add("is-on");
      art.dispatchEvent(new CustomEvent("fx:shape", { detail: { key: on.dataset.key } }));
    }
  };
  const scrollIndex = (d, now) => { target += d; if (now) { y = target; paintIndex(); } else follow(target); };
  views.index.addEventListener("wheel", (e) => { e.preventDefault(); scrollIndex(e.deltaY); }, { passive: false });
  let ty = null;
  views.index.addEventListener("touchstart", (e) => (ty = e.touches[0].clientY), { passive: true });
  views.index.addEventListener("touchmove", (e) => { if (ty == null) return; const n = e.touches[0].clientY; scrollIndex(ty - n); ty = n; }, { passive: true });
  rows.forEach((r) => r.addEventListener("pointerenter", () => {
    if (r === on) return;
    on?.classList.remove("is-on");
    on = r; r.classList.add("is-on");
    art.dispatchEvent(new CustomEvent("fx:shape", { detail: { key: r.dataset.key } }));
  }));
  addEventListener("resize", () => { if (mode === "index") { layoutIndex(); paintIndex(); } });

  // Gallery — card size min(width .2, height .345), a row stepping back to the right .33, down .19 and back .065 per cell (phone .52 · .3). Only the center keeps its original color
  const slides = [...document.querySelectorAll(".e-slide")], pos = document.querySelector("[data-gallery-pos]"), ttl = document.querySelector("[data-gallery-title]");
  let at = 0;
  const go = (i, now) => {
    at = (i + slides.length) % slides.length;
    const W = views.gallery.clientWidth, Hh = views.gallery.clientHeight, small = W <= 600;
    const size = Math.max(1, Math.min(W * (small ? 0.52 : 0.2), Hh * 0.345)), sx = size * 0.33, sy = size * (small ? 0.3 : 0.19);
    views.gallery.style.setProperty("--g-size", `${size}px`);
    slides.forEach((s, j) => {
      let o = j - at;
      if (o > slides.length / 2) o -= slides.length;
      if (o < -slides.length / 2) o += slides.length;
      const far = Math.abs(o), img = s.querySelector("img");
      s.classList.toggle("is-here", o === 0);
      clear(img, o === 0);
      gsap.to(s, {
        x: o * sx - size / 2, y: o * sy - size / 2, z: -far * size * 0.065, scale: 1 - Math.min(0.5, far * 0.04), skewY: -12,
        autoAlpha: far > 4 ? 0 : 1 - far * 0.2, zIndex: 50 - far, duration: now || reduce ? 0 : 0.8, ease: "power3.out", overwrite: true,
      });
    });
    pos.textContent = `${String(at + 1).padStart(2, "0")} / ${slides.length}`;
    ttl.textContent = slides[at].dataset.name;
  };
  let acc = 0, lock = 0;
  views.gallery.addEventListener("wheel", (e) => {
    e.preventDefault();
    acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const now = performance.now();
    if (Math.abs(acc) < 40 || now - lock < 280) return;
    lock = now; go(at + Math.sign(acc)); acc = 0;
  }, { passive: false });
  slides.forEach((s, j) => s.addEventListener("click", (e) => { if (j !== at) { e.preventDefault(); e.stopPropagation(); go(j); } }, true));
  document.addEventListener("keydown", (e) => {
    if (mode === "gallery" && (e.key === "ArrowRight" || e.key === "ArrowDown")) go(at + 1);
    if (mode === "gallery" && (e.key === "ArrowLeft" || e.key === "ArrowUp")) go(at - 1);
    if (mode === "index" && (e.key === "ArrowDown" || e.key === "ArrowUp")) scrollIndex((e.key === "ArrowDown" ? 1 : -1) * rowH);
  });
  addEventListener("resize", () => { if (mode === "gallery") go(at, true); });

  setMode(sessionStorage.getItem(KEY) || "sphere");
})();
