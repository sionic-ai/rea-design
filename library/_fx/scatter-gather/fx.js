// Dot positions use data-from·data-to per dot (0~1 ratio "x,y") is written this way — because it is a value for each individual dot, not a part option
(() => {
  kfFx.register("scatter-gather", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const q = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const xy = (s) => (s || "0,0").split(",").map(Number);
    const dots = q("dot"), from = dots.map((d) => xy(d.dataset.from)), to = dots.map((d) => xy(d.dataset.to));
    if (!dots.length) return;
    const place = (pts) => dots.forEach((d, i) => { d.style.left = `${pts[i][0] * 100}%`; d.style.top = `${pts[i][1] * 100}%`; });
    let svg = null, lines = [...el.querySelectorAll(".fx-lines line")];
    if (options.edges && !lines.length) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "fx-lines");
      svg.innerHTML = options.edges.split(",").map((p) => p.split("-").map(Number)).filter(([a, b]) => to[a] && to[b]).map(([a, b]) => `<line x1="${to[a][0] * 100}%" y1="${to[a][1] * 100}%" x2="${to[b][0] * 100}%" y2="${to[b][1] * 100}%" pathLength="1" stroke-dasharray="1"/>`).join("");
      el.prepend(svg);
      lines = [...svg.children];
    }
    const cover = q("cover")[0], mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => {
      place(to); dots.forEach((d) => d.style.setProperty("--to-ink", 1)); if (cover) cover.hidden = true;
      return () => { if (cover) cover.hidden = false; };
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      place(from);
      const st = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: `+=${+(options.length || 2600)}`, pin: true, scrub: true, anticipatePin: 1 } });
      const say = cover?.firstElementChild;
      if (say) st.to(say, { autoAlpha: 0, y: -20, duration: 0.12 }, 0.12);
      if (cover) st.set(cover, { autoAlpha: 0 }, 0.24);
      st.from(dots, { scale: 0, duration: 0.08, stagger: 0.01 }, 0.3);
      dots.forEach((d, i) => st.to(d, { left: `${to[i][0] * 100}%`, top: `${to[i][1] * 100}%`, "--to-ink": 1, duration: 0.3, ease: "power1.inOut" }, 0.45));
      const hint = q("hint");
      if (lines.length) st.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.2, stagger: 0.01 }, 0.78);
      if (hint.length) st.to(hint, { autoAlpha: 0, duration: 0.05 }, 0.4);
    });
    // When a pinned element is pulled from the document only the pin-spacer remains, and putting it back makes ScrollTrigger re-insert the removed element in place — so clear the empty spacer first
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === el && t.spacer?.remove()); mm.revert(); svg?.remove(); dots.forEach((d) => { d.style.left = d.style.top = ""; d.style.removeProperty("--to-ink"); }); };
  });
})();
