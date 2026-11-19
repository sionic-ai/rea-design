(() => {
  kfFx.register("crosshair-follow", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const k = +(options.lerp ?? 0.3), fade = +(options.fade ?? 0.25), alpha = +(options.alpha ?? 0.16);
    const ui = document.createElement("div");
    ui.className = "fx-xh";
    ui.setAttribute("aria-hidden", "true");
    ui.innerHTML = '<i class="fx-xh-v"></i><i class="fx-xh-h"></i><i class="fx-xh-p"></i><span class="fx-xh-c">X: <b>0</b> Y: <b>0</b></span>';
    const tip = el.querySelector('[data-fx-part="tip"]');
    const home = tip && tip.parentNode, next = tip && tip.nextSibling;
    tip && ui.append(tip);
    el.append(ui);
    const [cv, ch, cp] = ui.children, co = ui.querySelector(".fx-xh-c"), cb = co.querySelectorAll("b");
    const p = { x: 0, y: 0 }, q = { x: 0, y: 0 };
    let r = el.getBoundingClientRect(), inside = false, seen = false, tipped = false, last = 0;
    const move = (e) => { r = el.getBoundingClientRect(); q.x = e.clientX - r.left - r.width / 2; q.y = e.clientY - r.top - r.height / 2; if (!seen) { p.x = q.x; p.y = q.y; seen = true; } };
    const enter = (e) => { inside = true; move(e); gsap.to(ui, { autoAlpha: 1, duration: fade, ease: "power2.out", overwrite: "auto" }); };
    const leave = () => { inside = false; seen = false; gsap.to(ui, { autoAlpha: 0, duration: fade, ease: "power2.out", overwrite: "auto" }); };
    const down = () => { if (tip && !tipped) { tipped = true; gsap.to(tip, { autoAlpha: 0, duration: fade }); } };
    const tick = (t) => {
      const now = t * 1000, dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      if (!inside) return;
      const f = 1 - Math.pow(1 - k, dt / 16.7);
      const dx = (q.x - p.x) * f, dy = (q.y - p.y) * f;
      p.x += dx; p.y += dy;
      const sp = Math.min(1, Math.hypot(dx, dy) / 300);
      gsap.set(cv, { x: p.x, autoAlpha: alpha + 0.02 * sp });
      gsap.set(ch, { y: p.y, autoAlpha: alpha + 0.02 * sp });
      gsap.set(cp, { x: p.x, y: p.y, scale: 1 + 0.02 * sp });
      gsap.set(co, { x: p.x + 23.3, y: p.y - 14.2 });
      tip && !tipped && gsap.set(tip, { x: p.x + 68.3, y: p.y + 20.8 });
      cb[0].textContent = Math.round(p.x + r.width / 2);
      cb[1].textContent = Math.round(p.y + r.height / 2);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); el.removeEventListener("pointerdown", down);
      if (tip && home) { gsap.set(tip, { clearProps: "all" }); home.insertBefore(tip, next && next.parentNode === home ? next : null); }
      ui.remove();
    };
  });
})();
