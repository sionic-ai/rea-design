(() => {
  kfFx.register("auto-pick-list", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), every = +options.every || 8, out = kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out");
      // Entrance length, delay, rise, and the length of blurring the previous content first (0 means swap immediately)
      const dur = +(options.dur ?? beat), delay = +(options.delay ?? 0), rise = +(options.y ?? 0), fade = +(options.out ?? 0);
      let swap = null;
      const rows = [...el.querySelectorAll("[data-fx-part=row]")], view = el.querySelector("[data-fx-part=view]"), head = el.querySelector("[data-fx-part=head]");
      if (!rows.length) return;
      let at = Math.max(0, rows.findIndex((r) => r.classList.contains("is-on")));
      const pick = (i, quiet) => {
        at = i;
        rows.forEach((r) => r.classList.toggle("is-on", r === rows[i]));
        const slots = view ? [...view.querySelectorAll("[data-fx-part=slot]")] : [];
        const fill = () => slots.forEach((n) => (n.textContent = rows[i].dataset[n.dataset.key] ?? ""));
        if (!slots.length || quiet || reduce) return fill();
        swap?.kill();
        swap = gsap.timeline();
        if (fade) swap.to(slots, { autoAlpha: 0, duration: fade, delay, ease: out });
        swap.add(fill).fromTo(slots, rise ? { autoAlpha: 0, y: rise } : { autoAlpha: 0 }, { autoAlpha: 1, ...(rise && { y: 0 }), duration: dur, delay, ease: out });
      };
      pick(at, true);
      const rotate = gsap.delayedCall(beat * every, () => { pick((at + 1) % rows.length); rotate.restart(true); }).pause();
      el.addEventListener("click", (e) => { const r = e.target.closest("[data-fx-part=row]"); if (!r) return; pick(rows.indexOf(r)); if (!reduce) rotate.restart(true); }, { signal });
      // pick: hover — hovering a row also picks that row, and while the hover stays on the row it does not advance on its own (original Brand version list)
      let held = false;
      if (options.pick === "hover" && hover) rows.forEach((r) => {
        r.addEventListener("pointerenter", () => { held = true; rotate.pause(); if (rows.indexOf(r) !== at) pick(rows.indexOf(r)); }, { signal });
        r.addEventListener("pointerleave", () => { held = false; if (!reduce) rotate.restart(true); }, { signal });
      });
      if (reduce) return;
      const sweep = head ? gsap.fromTo(head, { "--x": 0 }, { "--x": 1, duration: beat * 16, ease: "none", repeat: -1, paused: true }) : null;
      ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? (sweep?.play(), held || rotate.resume()) : (sweep?.pause(), rotate.pause())) });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
