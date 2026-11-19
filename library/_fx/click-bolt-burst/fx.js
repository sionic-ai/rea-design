(() => {
  // From the pressed spot four lightning pieces spread out starting at −172.5° (±8) at 35° intervals — each piece unfolds from 8~11px away in .16s quick(.34,1.56,.64,1) and shoots out,
  // Folds and vanishes from the tail in .18s power2.out (scatter at start 0~.03s). Up to 14 chunks at once, and when over the limit the oldest is finished off
  const ARMS = [["0 0 22 6", "0,3 22,0 22,6"], ["0 0 26 8", "0,4 26,0 20,4 26,8"], ["0 0 18 6", "0,3 18,0 18,6"], ["0 0 24 7", "0,3.5 24,0 16,3.5 24,7"]];
  kfFx.register("click-bolt-burst", (el, { options, reduce }) => {
    if (reduce) return;
    const size = +(options.size ?? 1), max = +(options.max ?? 14), spread = +(options.spread ?? 35);
    const quick = kfFx.ease("0.34,1.56,0.64,1", "back.out(2)");
    const host = document.createElement("div");
    host.dataset.fxPart = "bolt-layer"; host.setAttribute("aria-hidden", "true");
    document.body.append(host);
    const live = [];
    const burst = (x, y) => {
      if (live.length >= max) live.shift().progress(1);
      const b = document.createElement("div"); b.className = "fx-bolt-burst"; b.style.transform = `translate(${x}px, ${y}px)`; host.append(b);
      const base = -172.5 + gsap.utils.random(-8, 8);
      const tl = gsap.timeline({ onComplete: () => { b.remove(); const i = live.indexOf(tl); i > -1 && live.splice(i, 1); } });
      ARMS.forEach(([vb, pts], k) => {
        const [, , w, h] = vb.split(" ").map(Number);
        const arm = document.createElement("div"); arm.className = "fx-bolt-arm";
        arm.innerHTML = `<svg viewBox="${vb}"><polygon points="${pts}"/></svg>`; b.append(arm);
        const svg = arm.firstChild, sc = gsap.utils.random(0.7, 0.9) * size, gap = gsap.utils.random(8, 11), run = gsap.utils.random(5, 8), d0 = 0.03 * Math.random();
        gsap.set(arm, { rotation: base + spread * k + gsap.utils.random(-6, 6) });
        gsap.set(svg, { width: w * sc, height: h * sc, x: gap, yPercent: -50, scaleX: 0, transformOrigin: "0% 50%" });
        tl.to(svg, { scaleX: 1, x: gap + 0.5 * run, duration: 0.16, ease: quick }, d0).set(svg, { transformOrigin: "100% 50%" }, d0 + 0.16).to(svg, { scaleX: 0, x: gap + run, duration: 0.18, ease: "power2.out" }, d0 + 0.16);
      });
      live.push(tl);
    };
    const down = (e) => {
      if (e.button !== 0 || e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.pointerType !== "mouse" && options.touch !== "on") return;
      burst(e.clientX, e.clientY);
    };
    el.addEventListener("pointerdown", down, { passive: true });
    return () => { el.removeEventListener("pointerdown", down); live.forEach((t) => t.kill()); host.remove(); };
  });
})();
