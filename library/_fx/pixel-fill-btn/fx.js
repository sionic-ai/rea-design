(() => {
  // 24×6 cells, 20 pixel sprites — each cell’s threshold slopes left→right plus noise so the smear sweeps in from the left. Drawn once and shared by all buttons
  const sprite = () => {
    if (window.__kfPxMask) return window.__kfPxMask;
    const F = 20, CW = 24, CH = 6, S = 10, c = document.createElement("canvas");
    c.width = F * CW * S; c.height = CH * S;
    const g = c.getContext("2d");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const th = [];
    for (let i = 0; i < CW * CH; i++) th.push(((i % CW) / CW) * 0.7 + rnd() * 0.3);
    g.fillStyle = "rgba(255,255,255,1)"; /* Not skin: mask alpha channel */
    for (let f = 0; f < F; f++) {
      const p = f / (F - 1);
      for (let i = 0; i < CW * CH; i++) {
        const a = Math.max(0, Math.min(1, (p * 1.3 - th[i]) / 0.3));
        if (a <= 0) continue;
        g.globalAlpha = f === F - 1 ? 1 : Math.round(a * 20) / 20;
        g.fillRect(f * CW * S + (i % CW) * S, Math.floor(i / CW) * S, S, S);
      }
    }
    return (window.__kfPxMask = `url(${c.toDataURL()})`);
  };
  const twin = (part) => {
    if (!part || part.querySelector(".fx-pxb-a")) return null;
    const html = part.innerHTML;
    part.innerHTML = `<span class="fx-pxb-a">${html}</span><span class="fx-pxb-b" aria-hidden="true">${html}</span>`;
    return () => { part.innerHTML = html; };
  };
  kfFx.register("pixel-fill-btn", (el, { options, reduce, hover }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    if (!label) return;
    const icon = el.querySelector('[data-fx-part="icon"]');
    const dur = +(options.dur ?? 0.58), steps = Math.max(1, +options.steps || 19), roll = +(options.roll ?? 0.48), tint = +(options.tint ?? 0.15);
    const undo = [twin(label), twin(icon)].filter(Boolean);
    const bg = document.createElement("span");
    bg.className = "fx-pxb-bg";
    bg.setAttribute("aria-hidden", "true");
    el.prepend(bg);
    el.style.setProperty("--fx-px-mask", sprite());
    el.style.setProperty("--fx-roll", roll + "s");
    const off = () => { bg.remove(); undo.forEach((f) => f()); el.classList.remove("fx-pxb-on", "fx-pxb-entered", "fx-pxb-exiting"); el.style.removeProperty("--fx-px-mask"); el.style.removeProperty("--fx-roll"); gsap.set(el, { clearProps: "color" }); };
    if (reduce || !hover) return off;
    const base = getComputedStyle(el).color;
    const on = getComputedStyle(document.documentElement).getPropertyValue("--fx-on").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-on-accent").trim();
    let tl;
    const play = (exit) => {
      tl && tl.kill();
      gsap.set(bg, { webkitMaskPosition: "0% 0", maskPosition: "0% 0" });
      tl = gsap.timeline({ onComplete: () => { el.classList.toggle("fx-pxb-entered", !exit); el.classList.remove("fx-pxb-exiting"); gsap.set(bg, { webkitMaskPosition: "0% 0", maskPosition: "0% 0" }); } })
        .to(bg, { webkitMaskPosition: "100% 0", maskPosition: "100% 0", duration: dur, ease: `steps(${steps})` }, 0)
        .to(el, { color: exit ? base : on, duration: tint, ease: "circ.in" }, 0);
    };
    const enter = () => { el.classList.add("fx-pxb-on"); el.classList.remove("fx-pxb-exiting"); play(false); };
    const leave = () => { el.classList.remove("fx-pxb-on"); el.classList.add("fx-pxb-exiting"); play(true); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);
    return () => { tl && tl.kill(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.removeEventListener("focus", enter); el.removeEventListener("blur", leave); off(); };
  });
})();
