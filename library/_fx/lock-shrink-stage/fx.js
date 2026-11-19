// A full-screen stage shrinks into a frame on the first scroll gesture (scroll locked meanwhile). Returns when back at the top.
(() => {
  kfFx.register("lock-shrink-stage", (el, { options, reduce }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) return;
    const FILL = +(options.fill ?? 0.78), RATIO = +(options.ratio || 1106 / 623) || 1106 / 623, RATIO_SP = +(options["ratio-sp"] || 296 / 494) || 296 / 494, DUR = reduce ? 0.001 : +(options.dur ?? 1.2);
    const ratio = () => (matchMedia("(min-width: 48rem)").matches ? RATIO : RATIO_SP);
    const state = { p: 0 };
    const apply = () => {
      const W = innerWidth, H = innerHeight, bw = Math.min(W, H * ratio()) * FILL, bh = Math.min(H, W / ratio()) * FILL;
      const x = ((W - bw) / 2) * state.p, y = ((H - bh) / 2) * state.p;
      stage.style.clipPath = `inset(${y}px ${x}px)`;
      el.style.setProperty("--fx-shrink", state.p);
      el.style.setProperty("--fx-frame-x", x + "px");
      el.style.setProperty("--fx-frame-y", y + "px");
    };
    const fire = (open) => el.dispatchEvent(new CustomEvent("fx:shrink", { bubbles: true, detail: { open } }));
    let locked = false, armed = false, ty = 0;
    const DOWN = new Set([" ", "ArrowDown", "PageDown", "End"]), UP = new Set(["ArrowUp", "PageUp", "Home"]);
    const onWheel = (e) => { if (e.cancelable) e.preventDefault(); if (e.deltaY > 0) play(); };
    const onTS = (e) => { ty = e.touches[0] ? e.touches[0].clientY : 0; };
    const onTM = (e) => { if (e.cancelable) e.preventDefault(); if (ty - (e.touches[0] ? e.touches[0].clientY : ty) > 6) play(); };
    const onKey = (e) => { const d = DOWN.has(e.key); if (!d && !UP.has(e.key)) return; e.preventDefault(); if (d) play(); };
    const lock = () => {
      if (locked) return;
      locked = true;
      if (window.lenis && window.lenis.stop) window.lenis.stop();
      addEventListener("wheel", onWheel, { passive: false }); addEventListener("touchstart", onTS, { passive: true }); addEventListener("touchmove", onTM, { passive: false }); addEventListener("keydown", onKey);
    };
    const unlock = () => {
      if (!locked) return;
      locked = false;
      removeEventListener("wheel", onWheel); removeEventListener("touchstart", onTS); removeEventListener("touchmove", onTM); removeEventListener("keydown", onKey);
      if (window.lenis && window.lenis.start) window.lenis.start();
    };
    const tween = gsap.to(state, { p: 1, duration: DUR, ease: "power3.inOut", paused: true, onUpdate: apply, onComplete: unlock });
    function play() { if (tween.progress() === 1 && !tween.reversed()) { unlock(); return; } lock(); tween.play(); fire(true); }
    function rewind() { lock(); scrollTo(0, 0); tween.reverse(); fire(false); }
    const onScroll = () => {
      if (locked) { if (scrollY > 2) { scrollTo(0, 0); play(); } return; }
      if (!armed) { armed = scrollY > 40; return; }
      if (scrollY <= 2) { armed = false; rewind(); }
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", apply);
    apply();
    if (scrollY > 2) { tween.progress(1); armed = scrollY > 40; } else lock();
    return () => {
      tween.kill();
      unlock();
      removeEventListener("scroll", onScroll); removeEventListener("resize", apply);
      stage.style.clipPath = "";
      el.style.removeProperty("--fx-shrink"); el.style.removeProperty("--fx-frame-x"); el.style.removeProperty("--fx-frame-y");
    };
  });
})();
