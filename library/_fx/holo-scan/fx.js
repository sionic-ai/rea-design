// As you scroll, the picture turns from bottom to top into a hologram (monochrome → single-color tint · thin scanlines · translucent), a light band passes along the boundary, and the number counts from 000 to 100.
(() => {
  kfFx.register("holo-scan", (el, { options, reduce, scroller }) => {
    const target = el.querySelector(':scope > [data-fx-part="target"]') || el.firstElementChild;
    if (!target || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const count = el.querySelector('[data-fx-part="count"]');
    const ghost = target.cloneNode(true);
    ghost.removeAttribute("data-fx-part");
    ghost.removeAttribute("data-fx");
    ghost.setAttribute("aria-hidden", "true");
    ghost.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    const layer = document.createElement("div");
    layer.className = "fx-holo";
    layer.setAttribute("aria-hidden", "true");
    const tint = document.createElement("i"), lines = document.createElement("i"), edge = document.createElement("i");
    tint.className = "fx-holo__tint"; lines.className = "fx-holo__lines"; edge.className = "fx-holo__edge";
    ghost.classList.add("fx-holo__ghost");
    layer.append(ghost, tint, lines, edge);
    el.classList.add("fx-holo-host");
    el.append(layer);
    const end = +(options.span ?? 0.95);
    const set = (p) => {
      el.style.setProperty("--fx-scan", p.toFixed(4));
      if (count) count.textContent = String(Math.floor(p * 100)).padStart(+(options.digits ?? 3), "0");
    };
    if (reduce) { set(1); return () => { layer.remove(); el.classList.remove("fx-holo-host"); el.style.removeProperty("--fx-scan"); }; }
    set(0);
    const o = { p: 0 };
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 35%", end: options.end || "bottom bottom", scrub: options.scrub === undefined ? true : +options.scrub } });
    tl.to(o, { p: 1, duration: end, ease: "none", onUpdate: () => set(o.p) }, 0);
    if (end < 1) tl.to({}, { duration: 1 - end }, end);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); layer.remove(); el.classList.remove("fx-holo-host"); el.style.removeProperty("--fx-scan"); };
  });
})();
