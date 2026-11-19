// Scissor-cut loading curtain — Brand loader values (top 60% · bottom 40%, scissors 3s · .4 late, number 0→100 3s, curtain 1.5s power2.in)
(() => {
  kfFx.register("scissor-cut-loader", (root, { options, reduce }) => {
    const made = [];
    const mk = (part, parent, tag = "div") => {
      let n = root.querySelector(`[data-fx-part="${part}"]`);
      if (!n) { n = document.createElement(tag); n.setAttribute("data-fx-part", part); parent.append(n); made.push(n); }
      return n;
    };
    const split = +(options.split ?? 0.6), dur = +(options.dur ?? 3), open = +(options.open ?? 1.5), from = +(options.from ?? 7);
    root.style.setProperty("--fx-split", `${split * 100}%`);
    const top = mk("top", root), bottom = mk("bottom", root), seam = mk("seam", root);
    mk("dash", seam); const solid = mk("solid", seam); const blade = mk("blade", seam); const count = mk("count", seam); const wheels = mk("wheels", bottom);
    if (!blade.firstChild) blade.innerHTML = '<svg viewBox="0 0 36 24" aria-hidden="true"><circle cx="6" cy="6" r="4.2"/><circle cx="6" cy="18" r="4.2"/><path d="M9.5 8.2 34 19M9.5 15.8 34 5"/></svg>';
    if (!count.firstChild) {
      const strip = (list) => `<span><i>${list.map((d) => `<b style="font-weight:inherit;height:20px">${d}</b>`).join("")}</i></span>`;
      count.innerHTML = strip([0, 1]) + strip(Array.from({ length: 120 }, (_, i) => i % 10)) + strip(Array.from({ length: 24 }, (_, i) => (i % 2) * 5));
    }
    if (!wheels.firstChild) wheels.innerHTML = [4, 5, 6, 8, 0].map((n) => n ? `<svg viewBox="0 0 12 12"><polygon points="${Array.from({ length: n }, (_, i) => { const a = Math.PI / 2 + (i * 2 * Math.PI) / n; return `${6 + 5 * Math.cos(a)},${6 + 5 * Math.sin(a)}`; }).join(" ")}"/></svg>` : '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="5"/></svg>').join("");
    const strips = [...count.querySelectorAll("i")], dots = [...wheels.children];
    const done = () => { root.classList.add("is-done"); root.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce || !window.gsap) { done(); return () => { made.forEach((n) => n.remove()); root.classList.remove("is-done"); }; }
    const p = { v: 0 };
    const step = [100, 10, 5];
    const tw = gsap.to(p, { v: 100, duration: dur, ease: "power2.inOut", onUpdate: () => strips.forEach((s, i) => gsap.set(s, { y: -(p.v / step[i]) * 20 })) });
    gsap.set(blade, { xPercent: from });
    gsap.set(dots, { x: "-80vw" });
    const tl = gsap.timeline({ onComplete: done });
    dots.forEach((d, i) => tl.to(d, { x: 0, duration: Math.max(0.1, dur - 0.2 - i * 0.1), ease: "power2.inOut" }, 0));
    tl.to(blade, { xPercent: 100, duration: dur, ease: "power1.inOut" }, 0.4).to(solid, { width: "102.5%", duration: dur, ease: "power1.inOut" }, 0.4);
    const g2 = dur + 0.4;
    dots.forEach((d, i) => tl.to(d, { x: "80vw", duration: Math.max(0.1, dur - 0.5 - i * 0.1), ease: "power2.inOut" }, g2 + 0.1));
    tl.to([top, bottom], { height: 0, duration: open, ease: "power2.in" }, g2 + 0.15).to(seam, { opacity: 0, duration: 0.1 }, g2 + 0.15);
    const label = root.querySelector('[data-fx-part="label"]');
    if (label) tl.to(label, { opacity: 0, duration: 0.1 }, g2 + 0.15);
    return () => {
      tw.kill(); tl.kill();
      gsap.set([top, bottom, solid, blade, seam, ...dots, ...strips, label].filter(Boolean), { clearProps: "all" });
      made.forEach((n) => n.remove());
      root.classList.remove("is-done");
      root.style.removeProperty("--fx-split");
    };
  });
})();
