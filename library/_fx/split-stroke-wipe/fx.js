// Splits the wordmark SVG strokes into two groups and wipes them in opposite directions — group a (thin strokes · dots) from the right edge to the left, group b (thick strokes) from the left edge to the right
// The clipper (clipPath rect) widens and everything is revealed together over 1.6s power3.inOut. Original first screen and footer logo (clip-group1 x 543→0 · width 0→543, clip-group2 width 0→543).
// The clipper is made by the part — the consumer puts data-fx-part on group g="a"·"b" Only attach.
(() => {
  let uid = 0;
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("split-stroke-wipe", (el, { options, reduce, scroller }) => {
    const svg = el.tagName.toLowerCase() === "svg" ? el : el.querySelector("svg");
    const a = svg?.querySelector('[data-fx-part="a"]'), b = svg?.querySelector('[data-fx-part="b"]');
    if (!svg || (!a && !b)) return;
    const vb = svg.viewBox.baseVal;
    const W = vb?.width || svg.getBBox().width, H = vb?.height || svg.getBBox().height, X = vb?.x || 0, Y = vb?.y || 0;
    const defs = document.createElementNS(NS, "defs");
    const clip = (g, fromRight) => {
      if (!g) return null;
      const id = `fx-ssw-${++uid}`;
      const cp = document.createElementNS(NS, "clipPath");
      cp.setAttribute("id", id);
      cp.setAttribute("clipPathUnits", "userSpaceOnUse");
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", fromRight ? X + W : X);
      r.setAttribute("y", Y - H);
      r.setAttribute("width", 0);
      r.setAttribute("height", H * 3);
      cp.append(r);
      defs.append(cp);
      g.setAttribute("clip-path", `url(#${id})`);
      return r;
    };
    const ra = clip(a, true), rb = clip(b, false);
    svg.prepend(defs);
    const full = () => { ra && gsap.set(ra, { attr: { x: X, width: W } }); rb && gsap.set(rb, { attr: { width: W } }); };
    const dur = +(options.dur ?? 1.6), ease = kfFx.ease(options.ease || "", "power3.inOut");
    let tl = null, st = null;
    const play = (delay = +(options.delay ?? 0)) => {
      if (tl) return;
      tl = gsap.timeline({ delay });
      if (ra) tl.to(ra, { attr: { x: X, width: W }, duration: dur, ease }, 0);
      if (rb) tl.to(rb, { attr: { width: W }, duration: dur, ease }, 0);
    };
    const onEvent = (e) => play(e.detail?.delay ?? +(options.delay ?? 0));
    const onDone = () => { tl?.kill(); tl = gsap.timeline(); full(); };
    if (reduce) full();
    else if (options.start === "event") { el.addEventListener("fx:play", onEvent); el.addEventListener("fx:done", onDone); }
    else if (options.start === "scroll") {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: svg, scroller, start: options.at || "top bottom", once: true, onEnter: () => play() });
    } else play();
    return () => {
      el.removeEventListener("fx:play", onEvent);
      el.removeEventListener("fx:done", onDone);
      st?.kill();
      tl?.kill();
      a?.removeAttribute("clip-path");
      b?.removeAttribute("clip-path");
      defs.remove();
    };
  });
})();
