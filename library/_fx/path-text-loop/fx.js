// Text placed on a curve (SVG path) (textPath) flows endlessly along the line — start offset 0% → −100% over speed seconds, one linear loop.
// Stops when the panel goes 20% beyond the top or bottom of the screen and resumes flowing when it returns. The text repeats over twice the line length so the line never empties even when pushed to −100%
(() => {
  kfFx.register("path-text-loop", (el, { options, reduce, scroller }) => {
    const tp = el.querySelector("textPath");
    const href = tp?.getAttribute("href") || tp?.getAttribute("xlink:href");
    const path = href && (el.querySelector(href) || document.querySelector(href));
    if (!tp || !path?.getTotalLength) return;
    gsap.registerPlugin(ScrollTrigger);
    const saved = tp.textContent;
    const unit = saved.trim() ? saved.replace(/\s+$/, "") + "　" : "";
    if (!unit) return;
    const len = path.getTotalLength();
    let s = unit;
    tp.textContent = s;
    // fill: off keeps the text as written — a single text piece passing along the path (enters from off-screen via from·to and exits all the way out)
    if (options.fill !== "off") while (tp.getComputedTextLength() < len * 2.2 && s.length < 4000) { s += unit; tp.textContent = s; }
    else tp.textContent = saved;
    if (reduce) return () => { tp.textContent = saved; };
    const back = options.dir === "reverse";
    const from = options.from ?? (back ? "-100%" : "0%"), to = options.to ?? (back ? "0%" : "-100%");
    // If the start value is missing on the attribute, GSAP starts from an empty value and throws a startOffset empty length error — set it first
    tp.setAttribute("startOffset", from);
    const flow = gsap.fromTo(tp, { attr: { startOffset: from } }, { attr: { startOffset: to }, duration: +options.speed || 30, ease: "none", repeat: -1, paused: true });
    const st = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }), start: options.start || "top 120%", end: options.end || "bottom -20%",
      onEnter: () => flow.play(), onEnterBack: () => flow.play(), onLeave: () => flow.pause(), onLeaveBack: () => flow.pause(),
    });
    return () => { st.kill(); flow.kill(); tp.setAttribute("startOffset", "0%"); tp.textContent = saved; };
  });
})();
