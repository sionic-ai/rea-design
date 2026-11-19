// When leaving for another page, a theater curtain — its bottom edge a rounded head-fold pleat — rises from below with .6s ”main” (0.625,0.05,0,1) and covers the screen,
// Once the curtain is past halfway, the center emblem (gold coin) pops out from 0 → 1x with back.out(2.6) in .45s, stays .3s, then moves on.
// On the arrived page, the sagging pleat hem lifts up and clears in .8s main. If the picture in the middle of the curtain is a photo, cover it with a light plate (.is-light).
(() => {
  const K = { uneven: 0.02, depth: 0.3, bounce: 0.4, swings: 1.75, lag: 0.12, sway: 0.035, step: 3 };
  const TAU = Math.PI * 2;
  const fold = (w, h, folds, drift) => {
    const r = (K.depth * w) / folds / h, o = r * (1 + K.bounce);
    const s = Math.max(8, Math.ceil(w / folds / K.step));
    const cos = Array.from({ length: s + 1 }, (_, u) => -Math.cos((Math.PI * u) / s));
    const warp = (c) => c + K.uneven * Math.sin(TAU * 1.5 * c);
    const unwarp = (k) => { let p = k; for (let n = 0; n < 3; n++) p -= (warp(p) - k) / (1 + K.uneven * TAU * 1.5 * Math.cos(TAU * 1.5 * p)); return p; };
    return (rise, cover) => {
      const up = rise < 1, m = up ? rise : cover, v = drift * m;
      const pt = (x, k, p) => {
        const n = r * (1 + K.bounce * Math.sin(TAU * (K.swings * m - K.lag * k))) * Math.sqrt(Math.max(0, 1 - p * p));
        const b = (1 + o) * m + K.sway * Math.sin(Math.PI * m) * Math.sin(TAU * (0.6 * x - 0.5 * m)) + (up ? -n : n - o);
        return `${(x * (w + 2) - 1).toFixed(1)}px ${(h * (1 - b)).toFixed(1)}px,`;
      };
      const first = warp(0) * folds + v, last = warp(1) * folds + v;
      const k0 = drift ? Math.floor(first) : 0, k1 = drift ? Math.floor(last) : folds - 1;
      let d = pt(0, k0, 2 * (first - k0) - 1);
      for (let k = k0; k < last; k++) for (let j = 1; j <= s; j++) {
        const x = k + (1 + cos[j]) / 2;
        if (x <= first) continue;
        if (x >= last) break;
        d += pt(unwarp((x - v) / folds), k, cos[j]);
      }
      d += pt(1, k1, 2 * (last - k1) - 1);
      const y = up ? -1 : h + 1;
      return `polygon(${d}${w + 1}px ${y}px,-1px ${y}px)`;
    };
  };

  const KEY = "kf-fold-curtain";
  kfFx.register("fold-curtain-page", (el, { options, reduce }) => {
    const badge = el.querySelector('[data-fx-part="badge"]');
    const dur = +(options.dur ?? 0.6), out = +(options.out ?? 0.8), hold = +(options.hold ?? 0.3), pop = +(options.pop ?? 0.45);
    const ease = kfFx.ease(options.ease || "0.625,0.05,0,1", "power3.inOut");
    const folds = () => +(matchMedia("(min-width: 992px)").matches ? options.folds || 8 : options.narrow || options.folds || 4);
    const shape = () => fold(innerWidth, innerHeight, folds(), 0);
    if (badge) gsap.set(badge, { xPercent: -50, yPercent: -50, scale: 0 });
    let busy = false;
    const cover = (go) => {
      busy = true;
      el.style.display = "block";
      if (reduce || !dur) { el.style.clipPath = "none"; return go(); }
      const f = shape(), p = { v: 0 };
      let shown = null;
      const showBadge = () => (shown ||= badge ? gsap.to(badge, { scale: 1, duration: pop, ease: "back.out(2.6)" }).then(() => new Promise((r) => gsap.delayedCall(hold, r))) : Promise.resolve());
      // The curtain’s round head rises from bottom to top (cover). The outside is the lower side of the curtain, so it closes with the bottom edge
      gsap.to(p, { v: 1, duration: dur, ease, onUpdate: () => {
        el.style.clipPath = p.v < 1 ? f(1, p.v) : "none";
        if (p.v > 0.5) showBadge();
      }, onComplete: () => showBadge().then(go) });
    };
    const uncover = () => {
      el.style.display = "block";
      if (badge) gsap.set(badge, { scale: 0 });
      if (reduce || !out) { el.style.display = "none"; return; }
      const f = shape(), p = { v: 0 };
      // The sagging folds are drawn up (opening) — it’s above the covered corner, so it closes at the top edge
      gsap.to(p, { v: 1, duration: out, ease, onUpdate: () => (el.style.clipPath = p.v < 1 ? f(p.v, 0) : "polygon(0 0, 0 0, 0 0)"), onComplete: () => { el.style.display = "none"; el.style.clipPath = ""; } });
    };
    let came = false;
    try { came = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch {}
    if (came) uncover(); else el.style.display = "none";
    const click = (e) => {
      if (busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-curtain-skip]")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
      e.preventDefault();
      el.classList.toggle("is-light", !!document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("img, video, canvas, .wf-img"));
      cover(() => { try { sessionStorage.setItem(KEY, "1"); } catch {} location.href = u.href; });
    };
    document.addEventListener("click", click);
    const show = (e) => { if (e.persisted) { busy = false; el.style.display = "none"; el.style.clipPath = ""; } };
    addEventListener("pageshow", show);
    return () => { document.removeEventListener("click", click); removeEventListener("pageshow", show); gsap.killTweensOf(badge); el.style.display = ""; el.style.clipPath = ""; };
  });
})();
