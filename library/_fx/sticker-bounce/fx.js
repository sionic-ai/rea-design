(() => {
  kfFx.register("sticker-bounce", (el, { options, reduce }) => {
    const ac = new AbortController();
    const every = options.every === undefined ? 2.6 : +options.every, near = +(options.near ?? 0);
    // Given near, it throbs instead of popping on its own — when the pointer is within near px, it repeats 1.2x for .1s, then 1 for .16s, then 1.11x for .09s, then 1 for .22s, then rests .43s,
    // At center 2.6x, farther away 1.9 − distance/near×1.15 times speed (changes in .5s). When out of range it returns to its own size in .3s
    if (near > 0 && !reduce) {
      gsap.set(el, { transformOrigin: "50% 55%" });
      const beat = gsap.timeline({ repeat: -1, paused: true })
        .to(el, { scale: 1.2, duration: .1, ease: "power2.out" }).to(el, { scale: 1, duration: .16, ease: "power2.in" })
        .to(el, { scale: 1.11, duration: .09, ease: "power2.out" }).to(el, { scale: 1, duration: .22, ease: "power2.in" }).to({}, { duration: .43 });
      let on = false, settle = null;
      const stop = () => { if (!on) return; on = false; beat.pause(); settle = gsap.to(el, { scale: 1, duration: .3, ease: "power2.out" }); };
      addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const r = el.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        if (d > near) return stop();
        if (!on) { on = true; settle?.kill(); beat.play(); }
        gsap.to(beat, { timeScale: d < r.width / 2 ? 2.6 : 1.9 - d / near * 1.15, duration: .5, ease: "power2.out", overwrite: true });
      }, { signal: ac.signal, passive: true });
      document.addEventListener("pointerout", (e) => { if (!e.relatedTarget) stop(); }, { signal: ac.signal });
      return () => { ac.abort(); beat.kill(); settle?.kill(); gsap.killTweensOf(el); if (el.isConnected) gsap.set(el, { clearProps: "transform" }); };
    }
    const loop = !reduce && every > 0 ? gsap.timeline({ repeat: -1, repeatDelay: every }).to(el, { scale: 1.2, duration: 0.1, ease: "power2.out" }).to(el, { scale: 1, duration: 0.16, ease: "power2.in" }) : null;
    el.addEventListener("click", () => !reduce && gsap.timeline().to(el, { scale: 1.11, rotation: -8, duration: 0.09, ease: "power2.out" }).to(el, { scale: 1, rotation: 0, duration: 0.22, ease: "power2.in" }), { signal: ac.signal });
    // Elements removed from the document don’t get their transform cleared — if GSAP briefly attaches and detaches one to measure it, fx-core sees it as a newly added element and keeps attaching and detaching endlessly, freezing the page
    return () => { ac.abort(); loop?.kill(); gsap.killTweensOf(el); if (el.isConnected) gsap.set(el, { clearProps: "transform" }); };
  });
})();
