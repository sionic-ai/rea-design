// pinch-velocity-gallery — pins the photo strip to the screen and flows it sideways by the amount of vertical scroll (2D canvas).
// When flipped quickly, the photo is drawn cut into 3px vertical slices, squashed down to .75x the closer a slice is to the screen center, then spreads back out when it stops.
(() => {
  kfFx.register("pinch-velocity-gallery", (el, { options, reduce, scroller }) => {
    const pin = el.querySelector('[data-fx-part="pin"]');
    const canvas = el.querySelector('[data-fx-part="canvas"]');
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!pin || !canvas || !photos.length) return;
    const g = canvas.getContext("2d", { alpha: true });
    const squeeze = +(options.squeeze ?? 0.75);
    const edge = +(options.edge ?? 0.18);
    const kick = +(options.kick ?? 0.65);
    const fullSpeed = +(options.speed ?? 1800);
    const top = +(options.top ?? 0);
    const root = scroller || document.scrollingElement;
    const scrollTarget = scroller || window;

    // Panel to draw a single photo — <img> Leave as is, the placeholder board (.wf-img) draws its background color, diagonal and label once
    const sources = photos.map((p) => {
      if (p.tagName === "IMG") return { img: p, focus: +(p.dataset.focus ?? 0.5) };
      const c = document.createElement("canvas");
      c.width = 640; c.height = 880;
      const x = c.getContext("2d"), cs = getComputedStyle(p);
      x.fillStyle = cs.backgroundColor; x.fillRect(0, 0, c.width, c.height);
      x.strokeStyle = cs.borderTopColor; x.lineWidth = 2;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(c.width, c.height); x.moveTo(c.width, 0); x.lineTo(0, c.height); x.stroke();
      x.strokeRect(1, 1, c.width - 2, c.height - 2);
      x.fillStyle = cs.color; x.textAlign = "center"; x.font = `500 22px ${cs.fontFamily}`;
      (p.dataset.label || "").split(" · ").forEach((line, i, a) => x.fillText(line, c.width / 2, c.height / 2 + (i - (a.length - 1) / 2) * 30));
      return { img: c, focus: 0.5 };
    });
    const ready = (s) => (s.img.tagName === "IMG" ? s.img.complete && s.img.naturalWidth > 0 : true);

    let W = 0, H = 0, card = 0, gap = 0, pad = 0, travel = 0, start = 0, x = 0;
    let amt = 0, kickV = 0, raf = 0, last = 0, lastT = performance.now(), visible = true;

    const cover = (iw, ih, w, h, f) => {
      const s = Math.max(w / iw, h / ih), sw = w / s, sh = h / s;
      return { sx: (iw - sw) / 2, sy: (ih - sh) * f, sw, sh };
    };
    function draw() {
      g.clearRect(0, 0, W, H);
      const ch = 0.92 * H;
      sources.forEach((s, i) => {
        if (!ready(s)) return;
        const left = pad + i * (card + gap) - x;
        if (left > W || left + card < 0) return;
        const iw = s.img.naturalWidth || s.img.width, ih = s.img.naturalHeight || s.img.height;
        const c = cover(iw, ih, card, ch, s.focus);
        if (amt === 0) { g.drawImage(s.img, c.sx, c.sy, c.sw, c.sh, left, (H - ch) / 2, card, ch); return; }
        for (let k = Math.max(0, -left); k < Math.min(card, W - left); k += 3) {
          const w = Math.min(3, card - k, W - left - k);
          const a = (left + k + w / 2 - W / 2) / Math.max(1, W / 2);
          const h = ch * (1 + (squeeze + edge * Math.min(1, a * a) - 1) * Math.max(0, Math.min(1, amt)));
          g.drawImage(s.img, c.sx + (k / card) * c.sw, c.sy, (w / card) * c.sw, c.sh, left + k, (H - h) / 2, w + 0.35, h);
        }
      });
    }
    // Releases the press at 30fps — the press follows kick at 12/s, and kick cools at 6/s
    function tick(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = now - last;
      if (dt < 1000 / 30) { raf = requestAnimationFrame(tick); return; }
      const n = Math.min(dt / 1000, 0.05);
      last = now;
      if (reduce) amt = kickV = 0;
      else {
        amt += (kickV - amt) * (1 - Math.exp(-12 * n));
        kickV *= Math.exp(-6 * n);
        if (amt < 0.002 && kickV < 0.002) amt = kickV = 0;
      }
      draw();
      if (amt > 0 || kickV > 0) raf = requestAnimationFrame(tick);
    }
    const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };

    const scrollTop = () => (scroller ? scroller.scrollTop : window.scrollY);
    function measure() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      card = Math.min(0.66 * W, 0.76 * H);
      gap = W < 600 ? 16 : Math.min(30, W / 48);
      pad = W < 600 ? 16 : 0.0421875 * W;
      travel = Math.max(0, sources.length * (card + gap) - gap + 2 * pad - W);
      const stage = (scroller ? scroller.clientHeight : innerHeight) - top;
      el.style.setProperty("--fx-travel", `${travel}px`);
      el.style.setProperty("--fx-stage", `${stage}px`);
      const base = scroller ? scroller.getBoundingClientRect().top - scroller.scrollTop : -scrollTop();
      start = el.getBoundingClientRect().top - base - top;
      x = Math.max(0, Math.min(travel, scrollTop() - start));
      const dpr = Math.min(devicePixelRatio, 1.5, 1920 / Math.max(1, W));
      const cw = Math.round(W * dpr), chh = Math.round(H * dpr);
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== chh) canvas.height = chh;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function onScroll() {
      const now = performance.now();
      const nx = Math.max(0, Math.min(travel, scrollTop() - start));
      const d = nx - x, v = (d / Math.min(80, Math.max(16, now - lastT))) * 1000;
      lastT = now; x = nx;
      if (!reduce && Math.abs(d) > 0.1) kickV = Math.max(kickV, kick * Math.min(1, Math.abs(v) / fullSpeed));
      if (amt === 0 && kickV === 0) draw();
      wake();
    }
    const shift = (dx) => {
      const nx = Math.max(0, Math.min(travel, x + dx));
      if (nx !== x) (scroller || window).scrollTo({ top: start + nx, behavior: "instant" });
    };
    let drag = null;
    const down = (e) => { if (e.button !== 0 || e.pointerType === "touch") return; drag = { id: e.pointerId, x: e.clientX }; canvas.setPointerCapture(e.pointerId); canvas.dataset.dragging = "true"; };
    const move = (e) => { if (!drag || drag.id !== e.pointerId) return; const dx = drag.x - e.clientX; drag.x = e.clientX; shift(dx); };
    const up = () => { drag = null; delete canvas.dataset.dragging; };
    const wheel = (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && travel > 0 && Math.max(0, Math.min(travel, x + e.deltaX)) !== x) { e.preventDefault(); shift(e.deltaX); } };
    const vis = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0), (amt = kickV = 0)) : (measure(), wake()));

    const ro = new ResizeObserver(measure);
    ro.observe(canvas); ro.observe(document.documentElement);
    const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (!visible) { cancelAnimationFrame(raf); raf = 0; amt = kickV = 0; } else wake(); }, { root: scroller || null, rootMargin: "160px" });
    io.observe(el);
    photos.forEach((p) => p.tagName === "IMG" && !p.complete && p.addEventListener("load", draw, { once: true }));
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", vis);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    el.dataset.galleryReady = "true";
    measure();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      scrollTarget.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", vis);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("lostpointercapture", up);
      canvas.removeEventListener("wheel", wheel);
      el.style.removeProperty("--fx-travel");
      el.style.removeProperty("--fx-stage");
      delete el.dataset.galleryReady;
    };
  });
})();
