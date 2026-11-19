// Spanning multiple pages — logo Lottie (four-letter cluster that spreads apart and closes) · close X Lottie · menu underline · logo interaction response.
// The original Lottie file isn’t used — build our own shape animation here with the same length and the same keyframe order.
(() => {
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const st = (k) => ({ a: 0, k });
  // No color is put in — shared.css paints the path’s fill and stroke with skin variables (CSS takes priority over Lottie attributes)
  const fill = (rule) => ({ ty: "fl", c: st([0, 0, 0, 1]), o: st(100), r: rule || 1 });
  const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });
  const layer = (ind, nm, p, shapes, extra) => ({
    ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op: 400, st: 0, bm: 0,
    ks: Object.assign({ o: st(100), r: st(0), p, a: st([0, 0, 0]), s: st([100, 100, 100]) }, extra || {}),
    shapes,
  });
  // Original keyframe order: 0 closed → 5 open → 15 held open → 22 closed. Curve (.13,0)·(.15,1)
  const IO = { x: [0.13], y: [0] }, II = { x: [0.15], y: [1] };
  const HO = { x: [0.85], y: [0.85] }, HI = { x: [0.87], y: [0.87] };
  const four = (closed, open) => ({
    a: 1,
    k: [
      { t: 0, s: closed, o: IO, i: II },
      { t: 5, s: open, o: HO, i: HI },
      { t: 15, s: open, o: IO, i: II },
      { t: 22, s: closed },
    ],
  });
  const rect = (w, h, r) => ({ ty: "gr", it: [{ ty: "rc", d: 1, s: st([w, h]), p: st([0, 0]), r: st(r) }, fill(), tr()] });

  // Logo spot: the left two chunks spread 112px to the left, the right chunk 116px to the right, and the center ring widens from 141 → 382px.
  // 25fps · frames 7~29 (.88s). 0% is frame 7 (open type), 100% is frame 29 (closed type), so as in the original the resting type is the open wordmark
  function logoData() {
    const y = 155;
    const ring = {
      ty: "gr",
      it: [
        { ty: "el", d: 1, p: st([0, 0]), s: four([141, 269], [382, 269]) },
        { ty: "el", d: 1, p: st([0, 0]), s: four([21, 162], [211, 162]) },
        fill(2),
        tr(),
      ],
    };
    return {
      v: "5.7.0", fr: 25, ip: 7, op: 29, w: 969, h: 313, nm: "logo", ddd: 0, assets: [],
      layers: [
        layer(1, "left-1", four([253, y, 0], [141, y, 0]), [rect(136, 263, 46)]),
        layer(2, "left-2", four([395, y, 0], [283, y, 0]), [rect(133, 263, 6)]),
        layer(3, "ring", st([556, 158, 0]), [ring]),
        layer(4, "right", four([712, y, 0], [828, y, 0]), [rect(137, 263, 46)]),
      ],
    };
  }

  // Close X: 30fps · 49 frames (1.63s) once. Frames 5~22.6: two lines grow from the center to the ends (.16,.51)·(.55,.98), frames 5~29: the plate rotates −180° → 0°
  function closeData() {
    const E = { o: { x: [0.16], y: [0.51] }, i: { x: [0.55], y: [0.98] } };
    const grow = (from, to) => ({ a: 1, k: [{ t: 5, s: [from], o: E.o, i: E.i }, { t: 22.57, s: [to] }] });
    const spin = (from) => ({ a: 1, k: [{ t: 5, s: [from], o: E.o, i: E.i }, { t: 29, s: [0] }] });
    const line = (ind, nm, a, b, rot) => layer(ind, nm, st([0, 0, 0]), [{
      ty: "gr",
      it: [
        { ty: "sh", d: 1, ks: st({ i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], v: [a, b], c: false }) },
        { ty: "st", c: st([0, 0, 0, 1]), o: st(100), w: st(1), lc: 1, lj: 1, ml: 4 },
        { ty: "tm", s: grow(50, 0), e: grow(50, 100), o: st(0), m: 1 },
        tr(),
      ],
    }], { r: spin(rot) });
    const parent = { ddd: 0, ind: 1, ty: 3, nm: "pivot", sr: 1, ao: 0, ip: 0, op: 400, st: 0, bm: 0, ks: { o: st(0), r: spin(-180), p: st([250, 250, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) } };
    const l1 = line(2, "a", [200, -200], [-200, 200], 45);
    const l2 = line(3, "b", [-200, -200], [200, 200], -45);
    l1.parent = 1;
    l2.parent = 1;
    return { v: "5.7.0", fr: 29.97, ip: 0, op: 49, w: 500, h: 500, nm: "close", ddd: 0, assets: [], layers: [parent, l1, l2] };
  }

  const mount = (box, data, autoplay) => window.lottie
    ? lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay, animationData: data, rendererSettings: { preserveAspectRatio: "xMidYMin meet" } })
    : null;

  // Like a Webflow Lottie action, moves progress (0~1) in a straight line over its length — frame is progress × totalFrames (original goToFrame(frames * T/100))
  const seek = (anim, to, dur) => {
    if (!anim) return null;
    const state = anim.__snState || (anim.__snState = { p: 0 });
    const total = anim.totalFrames;
    return gsap.to(state, {
      p: to, duration: reduce ? 0 : dur, ease: "none", overwrite: true,
      onUpdate: () => anim.goToAndStop(state.p * total, true),
    });
  };

  const logos = new Map();
  document.querySelectorAll("[data-sn-logo]").forEach((box) => {
    const anim = mount(box, logoData(), false);
    if (!anim) return;
    anim.addEventListener("DOMLoaded", () => anim.goToAndStop(0, true));
    logos.set(box, anim);
    // Hovering the logo closes it in .5s (0→100%), and releasing reopens it in .5s (→0%)
    if (box.hasAttribute("data-sn-logo-hover") && hoverable) {
      box.addEventListener("mouseenter", () => seek(anim, 1, 0.5));
      box.addEventListener("mouseleave", () => seek(anim, 0, 0.5));
    }
  });
  document.querySelectorAll("[data-sn-close]").forEach((box) => mount(box, closeData(), !reduce));

  // Menu underline: 0→100% in .3s on hover, back to 0 in .15s on release
  const lineIn = "0.215,0.61,0.355,1", lineOut = "0.55,0.085,0.68,0.53";
  const ce = (c, f) => (window.CustomEase ? CustomEase.create(`sn-${c}`, c) : f);
  document.querySelectorAll("[data-sn-underline]").forEach((wrap) => {
    const line = wrap.querySelector(".sn-line");
    if (!line) return;
    gsap.set(line, { width: "0%" });
    if (!hoverable) return;
    wrap.addEventListener("mouseenter", () => gsap.to(line, { width: "100%", duration: reduce ? 0 : 0.3, ease: ce(lineIn, "power3.out"), overwrite: true }));
    wrap.addEventListener("mouseleave", () => gsap.to(line, { width: "0%", duration: reduce ? 0 : 0.15, ease: ce(lineOut, "power2.in"), overwrite: true }));
  });

  // The phone header logo closes for .5s and opens again for .5s when the page appears (original lottie mobile)
  const mobileLogo = () => {
    const anim = logos.get(document.querySelector("[data-sn-logo-mobile]"));
    if (!anim || reduce || matchMedia("(min-width: 768px)").matches) return;
    gsap.timeline().add(seek(anim, 1, 0.5)).add(() => seek(anim, 0, 0.5), 0.5);
  };
  if (document.readyState === "complete") mobileLogo();
  else addEventListener("load", mobileLogo, { once: true });

  // On back navigation, reload fresh like the original, from the first state
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  window.snSite = { reduce, hoverable, seek, logos, ce };
})();
