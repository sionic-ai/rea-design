// Four-corner curtain transition: the four corners of the covering curtain move in pairs with different curves and delays, so the curtain’s leading edge sweeps past at a slant.
// Clicking a same-site link fills up from below to cover (.6s) and moves on, and on the new page the cover lifts upward (.7s).
// For left-right direction the leading edge bulges as a quadratic curve — on-the-trip TransitionCanvas
(() => {
  kfFx.register("quad-wipe-page", (el, { options, reduce }) => {
    if (typeof gsap === "undefined") return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const path = document.createElementNS(ns, "path");
    svg.setAttribute("aria-hidden", "true");
    svg.appendChild(path);
    el.appendChild(svg);
    const lead = typeof CustomEase !== "undefined"
      ? (gsap.registerPlugin(CustomEase), CustomEase.create("fxQuadLead", "M0,0 C0.438,0 0.481,0.399 0.522,0.574 0.554,0.712 0.616,1 1,1"))
      : "power3.inOut";
    const trail = kfFx.ease(options.ease || "0.77,0,0.175,1", "power4.inOut");
    const inDur = +(options.in ?? 0.6), outDur = +(options.out ?? 0.7);
    const inDir = options["in-dir"] || "top", outDir = options["out-dir"] || "top";
    const pts = [0, 0, 0, 0].map(() => ({ p: 0 }));
    let dir = outDir, tweens = [];
    const draw = () => {
      const w = innerWidth, h = innerHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      if (dir === "left" || dir === "right") {
        const x = pts.map((q) => q.p * w);
        const b1 = 0.5 * (x[1] - x[2]), b0 = 0.5 * (x[0] - x[3]);
        path.setAttribute("d", `M${x[0]} 0L${x[1]} 0Q${x[2] + b1} ${h * 0.5} ${x[2]} ${h}L${x[3]} ${h}Q${x[3] + b0} ${h * 0.5} ${x[0]} 0Z`);
      } else {
        const y = pts.map((q) => q.p * h);
        path.setAttribute("d", `M0 ${y[0]}L${w} ${y[1]}L${w} ${y[2]}L0 ${y[3]}Z`);
      }
    };
    const kill = () => { tweens.forEach((t) => t.kill()); tweens = []; };
    // Cover — original in: one of the two front vertices follows a .9x length lead curve, the other is .05x later with Quart.inOut
    const cover = (d, done) => {
      kill(); dir = d; el.classList.add("is-fx-on");
      const set = { top: [1, [0, 1], 0], bottom: [0, [2, 3], 1], left: [1, [0, 3], 0], right: [0, [1, 2], 1] }[d] || [1, [0, 1], 0];
      pts.forEach((q) => { q.p = set[0]; });
      const [a, b] = set[1];
      draw();
      tweens.push(gsap.to(pts[a], { p: set[2], duration: 0.9 * inDur, delay: 0.01, ease: lead, onUpdate: draw }));
      tweens.push(gsap.to(pts[b], { p: set[2], duration: inDur, delay: 0.05 * inDur, ease: trail, onUpdate: draw, onComplete: done }));
    };
    // Walking — original out: the two back vertices are driven forward .9x lead · .1x late with Quart.inOut to fold the curtain
    const reveal = (d) => {
      kill(); dir = d; el.classList.add("is-fx-on");
      const full = d === "left" || d === "right" ? [0, 1, 1, 0] : [0, 0, 1, 1];
      pts.forEach((q, i) => { q.p = full[i]; });
      const pick = { top: [[2, 3], 0], bottom: [[0, 1], 1], left: [[1, 2], 0], right: [[0, 3], 1] }[d] || [[2, 3], 0];
      const [[a, b], to] = pick;
      draw();
      tweens.push(gsap.to(pts[a], { p: to, duration: 0.9 * outDur, ease: lead, onUpdate: draw }));
      tweens.push(gsap.to(pts[b], { p: to, duration: outDur, delay: 0.1 * outDur, ease: trail, onUpdate: draw, onComplete: () => { el.classList.remove("is-fx-on"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); } }));
    };
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download") || a.matches("[data-wipe=skip], .prevent")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      cover(a.dataset.wipeDir || inDir, () => { location.href = url.href; });
    };
    const onShow = (e) => { if (e.persisted) reveal(outDir); };
    addEventListener("resize", draw);
    addEventListener("pageshow", onShow);
    if (reduce) { el.classList.remove("is-fx-on"); }
    else {
      if (options.links !== "off") document.addEventListener("click", onClick);
      if (options.start !== "off") reveal(outDir);
    }
    el.fxCover = cover; el.fxReveal = reveal;
    return () => {
      kill();
      removeEventListener("resize", draw);
      removeEventListener("pageshow", onShow);
      document.removeEventListener("click", onClick);
      svg.remove(); el.classList.remove("is-fx-on");
      delete el.fxCover; delete el.fxReveal;
    };
  });
})();
