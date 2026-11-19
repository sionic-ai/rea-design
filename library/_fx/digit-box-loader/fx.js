// Number-cell loader: three 3:2 bordered cells fill 000 every 0.1 seconds toward 96 by 2.5% of the remaining distance (minimum 0.08), then when ready (after ready seconds or fx:go) it shows 98→100 for two screens,
// After holding .18s, the black curtain folds to the window (element picked with to) size and corners in .9s cubic-bezier(.76,0,.24,1) and vanishes at .42s — the number drops 8px as folding starts and fades out (Brand hero).
(() => {
  kfFx.register("digit-box-loader", (el, { options, reduce }) => {
    const digits = [...el.querySelectorAll('[data-fx-part="digit"]')];
    if (!digits.length) return;
    const ready = +(options.ready ?? 2.6), hold = +(options.hold ?? 0.18), shut = +(options.collapse ?? 0.9), fade = +(options.fade ?? 0.42);
    const wait = options.wait === "true";
    let shown = 0, dead = false, started = false;
    const timers = [];
    const later = (fn, s) => timers.push(setTimeout(fn, s * 1000));
    const set = (v) => {
      shown = Math.max(shown, Math.min(100, v));
      const s = String(Math.round(shown)).padStart(digits.length, "0");
      digits.forEach((d, i) => (d.textContent = s[i] ?? ""));
      el.setAttribute("aria-label", s);
    };
    const finish = () => { if (dead) return; el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce) { set(100); later(finish, 0); return () => timers.forEach(clearTimeout); }
    set(0);
    const tick = setInterval(() => { if (shown < 96) set(Math.min(96, shown + Math.max(0.08, (96 - shown) * 0.025))); }, 100);
    let tw = null;
    const close = () => {
      if (started || dead) return;
      started = true;
      clearInterval(tick);
      set(98);
      requestAnimationFrame(() => {
        set(100);
        requestAnimationFrame(() => requestAnimationFrame(() => later(() => {
          const target = options.to ? document.querySelector(options.to) : null;
          const r = target?.getBoundingClientRect();
          el.classList.add("fx-collapsing");
          el.dispatchEvent(new CustomEvent("fx:collapse", { bubbles: true }));
          const to = r && r.width > 1
            ? { left: r.left + r.width / 2, top: r.top + r.height / 2, width: r.width, height: r.height, borderRadius: getComputedStyle(target).borderRadius || "0px" }
            : { width: 0, height: 0 };
          tw = gsap.timeline({ onComplete: finish })
            .to(el, { ...to, duration: shut, ease: kfFx.ease("0.76,0,0.24,1", "power4.inOut") })
            .to(el, { opacity: 0, duration: fade, ease: "none" });
        }, hold)));
      });
    };
    const go = () => close();
    el.addEventListener("fx:go", go);
    if (!wait) later(close, ready);
    return () => {
      dead = true;
      clearInterval(tick);
      timers.forEach(clearTimeout);
      tw?.kill();
      el.removeEventListener("fx:go", go);
      el.hidden = false;
      el.classList.remove("fx-collapsing");
      gsap.set(el, { clearProps: "left,top,width,height,borderRadius,opacity" });
    };
  });
})();
