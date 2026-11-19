(() => {
  const arrow = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2.5 7.3h8.6L7.6 3.8l.9-.9L13.6 8l-5.1 5.1-.9-.9 3.5-3.5H2.5z"/></svg>';
  const play = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z"/></svg>';
  let shared = null, users = 0;

  // One crosshair per page — shared even with several boards, and removed when the last board leaves
  function make(fade) {
    if (shared) return shared;
    const root = document.createElement("div");
    root.className = "fx-xcur";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = '<i class="fx-xcur__line"></i><i class="fx-xcur__line"></i><span class="fx-xcur__pill"></span>';
    document.body.appendChild(root);
    const pill = root.querySelector(".fx-xcur__pill");
    let shown = false;
    const move = (e) => {
      if (!shown) { shown = true; gsap.to(root, { opacity: 1, duration: fade, ease: "sine.out" }); }
      shared.to(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    shared = { root, pill, move, to: null };
    return shared;
  }

  kfFx.register("cross-label-cursor", (el, { options, hover }) => {
    if (!hover) return;
    const dur = +(options.dur ?? 0.2), follow = +(options.follow ?? 0), fade = +(options.fade ?? 0.3);
    const ease = kfFx.ease("0,0,0.58,1", "power1.out");
    const c = make(fade);
    users++;
    if (!c.to) {
      if (follow > 0) {
        const qx = gsap.quickTo(c.root, "x", { duration: follow, ease: "power3" }), qy = gsap.quickTo(c.root, "y", { duration: follow, ease: "power3" });
        c.to = (x, y) => { qx(x); qy(y); };
      } else {
        const sx = gsap.quickSetter(c.root, "x", "px"), sy = gsap.quickSetter(c.root, "y", "px");
        c.to = (x, y) => { sx(x); sy(y); };
      }
    }
    let on = null;
    const open = (t) => {
      on = t;
      const isPlay = t.dataset.icon === "play";
      c.pill.classList.toggle("is-play", isPlay);
      c.pill.innerHTML = isPlay ? play : `<span>${t.dataset.label || ""}</span>${arrow}`;
      // Measure own size briefly as auto, then go from the current size to it — switching to another tab mid-expand doesn’t break
      gsap.killTweensOf(c.pill);
      const w0 = c.pill.offsetWidth, h0 = c.pill.offsetHeight;
      gsap.set(c.pill, { width: "auto", height: "auto" });
      const w = isPlay ? 40 : c.pill.offsetWidth, h = isPlay ? 40 : c.pill.offsetHeight;
      gsap.set(c.pill, { width: w0, height: h0 });
      // Measured on the original, height starts expanding one or two frames (.05s) later than width
      gsap.to(c.pill, { width: w, duration: dur, ease });
      gsap.to(c.pill, { height: h, duration: dur, delay: 0.05, ease });
      // Opacity goes straight to 1 on the next frame — measuring the original (IX2 interactions) shows it turns on all at once, before the width
      gsap.to(c.pill, { opacity: 1, duration: 0, delay: 1 / 60 });
    };
    const close = (t) => {
      if (on !== t) return;
      on = null;
      gsap.to(c.pill, { width: 0, height: 0, opacity: 0, duration: dur, ease, overwrite: true });
    };
    const over = (e) => {
      const t = e.target.closest?.('[data-fx-part="target"]');
      if (t && el.contains(t) && t !== on) open(t);
    };
    const out = (e) => {
      const t = e.target.closest?.('[data-fx-part="target"]');
      if (t && t === on && !t.contains(e.relatedTarget)) close(t);
    };
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerout", out);
    return () => {
      el.removeEventListener("pointerover", over);
      el.removeEventListener("pointerout", out);
      if (on) close(on);
      if (--users === 0 && shared) {
        window.removeEventListener("pointermove", shared.move);
        gsap.killTweensOf([shared.root, shared.pill]);
        shared.root.remove();
        shared = null;
      }
    };
  });
})();
