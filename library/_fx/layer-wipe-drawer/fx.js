// Three-layer curtain drawer — pressing the open button darkens the background, and three color curtains cover from the left in .08s steps with .58s power3.inOut, then
// Inner text turns on and the big menu rows rise from below in .06s steps. On close it reverses at 1.35x — brand menu.
(() => {
  kfFx.register("layer-wipe-drawer", (el, { options, reduce }) => {
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!panel) return;
    const opens = [...el.querySelectorAll('[data-fx-part="open"]')], closes = [...el.querySelectorAll('[data-fx-part="close"]')];
    const tint = el.querySelector('[data-fx-part="tint"]'), inner = el.querySelector('[data-fx-part="inner"]');
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')].map((l) => l.firstElementChild || l);
    const foot = el.querySelector('[data-fx-part="foot"]');
    const dur = +(options.dur ?? 0.58), each = +(options.each ?? 0.08), back = +(options.speed ?? 1.35) || 1.35;
    const wipes = ["a", "b", "c"].map((k) => { const w = document.createElement("span"); w.className = `fx-lwd-wipe fx-lwd-${k}`; w.setAttribute("aria-hidden", "true"); return w; });
    panel.prepend(...wipes);
    let open = false;
    const tl = gsap.timeline({ paused: true, onReverseComplete: () => { if (!open) el.classList.remove("is-open"); } });
    if (tint) tl.to(tint, { opacity: +(options.tint ?? 0.78), duration: 0.62, ease: "power2.inOut" }, 0);
    wipes.forEach((w, i) => tl.fromTo(w, { x: 0, xPercent: -101 }, { x: 0, xPercent: 0, duration: dur, ease: "power3.inOut" }, i * each));
    const after = dur + 2 * each - 0.04;
    if (inner) tl.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "none" }, after);
    if (lines.length) tl.fromTo(lines, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }, after + 0.02);
    if (foot) tl.fromTo(foot, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, after + 0.25);
    const set = (v) => {
      if (v === open) return;
      open = v;
      el.setAttribute("aria-hidden", String(!v));
      opens.forEach((o) => o.setAttribute("aria-expanded", String(v)));
      if (v) { el.classList.add("is-open"); reduce ? tl.progress(1) : tl.timeScale(1).play(); }
      else { reduce ? (tl.progress(0), el.classList.remove("is-open")) : tl.timeScale(back).reverse(); }
    };
    const onOpen = () => set(true), onClose = () => set(false);
    const onKey = (e) => { if (e.key === "Escape") set(false); };
    opens.forEach((o) => o.addEventListener("click", onOpen));
    closes.forEach((c) => c.addEventListener("click", onClose));
    tint?.addEventListener("click", onClose);
    addEventListener("keydown", onKey);
    el.addEventListener("fx:open", onOpen);
    el.addEventListener("fx:close", onClose);
    return () => {
      tl.kill(); wipes.forEach((w) => w.remove());
      opens.forEach((o) => o.removeEventListener("click", onOpen));
      closes.forEach((c) => c.removeEventListener("click", onClose));
      tint?.removeEventListener("click", onClose);
      removeEventListener("keydown", onKey);
      el.removeEventListener("fx:open", onOpen);
      el.removeEventListener("fx:close", onClose);
      el.classList.remove("is-open");
      gsap.set([tint, inner, foot, ...lines].filter(Boolean), { clearProps: "all" });
    };
  });
})();
