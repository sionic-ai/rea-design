(() => {
  // Three-sheet sticky note stack — at rest nearly overlapped (0° · 2.07° · −3.37°), fanning out in three directions on hover (−10° · 12° · −14°),
  // On press, the group slides off the left edge of the screen, then fx:open fires — whoever draws a question-card-deck panel in that spot shows it. Sending fx:reset returns it to place.
  const REST = [[0, 0, 0, 1], [10, -8, 2.07, 1], [-8, 12, -3.37, 0.965]];
  const FAN = [[-56, -52, -10, 1], [56, -42, 12, 1], [-50, 46, -14, 0.965]];
  const pose = (s) => s.split(",").map(Number);

  kfFx.register("note-deck-fan", (el, { options, reduce, hover }) => {
    const notes = [...el.querySelectorAll('[data-fx-part="note"]')];
    if (!notes.length) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.48);
    const outDur = reduce ? 0 : +(options.out ?? 0.75);
    const ease = options.ease || "sine.inOut";
    // Delay between hover and spreading — the parker original hooks it on the frame after the state changes, so it is about .05s late
    const lag = reduce ? 0 : +(options.lag ?? 0);
    const rest = options.rest ? options.rest.split("|").map(pose) : REST;
    const fan = options.fan ? options.fan.split("|").map(pose) : FAN;
    let open = false;

    const to = (set, d) => notes.forEach((n, i) => {
      const [x, y, rotation, s] = set[i] ?? set[0];
      n.style.zIndex = String(notes.length - i);
      gsap.to(n, { x, y, rotation, scale: s, transformOrigin: "50% 50%", duration: d, delay: d ? lag : 0, ease, overwrite: "auto" });
    });
    to(rest, 0);

    const enter = () => { if (!open && hover) to(fan, dur); };
    const leave = () => { if (!open) to(rest, dur); };
    const click = (e) => {
      if (open || e.target.closest("a[href]")) return;
      open = true;
      el.dispatchEvent(new CustomEvent("fx:opening", { bubbles: true }));
      const r = el.getBoundingClientRect();
      const m = Math.max(r.right + 32, 1.1 * r.width, 560);
      gsap.to(el, { x: -m, duration: outDur, ease: "power2.inOut", overwrite: "auto", onComplete: () => {
        gsap.set(el, { autoAlpha: 0, x: 0 });
        el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      } });
    };
    const reset = () => {
      open = false;
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, autoAlpha: 1 });
      to(rest, 0);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("click", click);
    el.addEventListener("fx:reset", reset);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", click);
      el.removeEventListener("fx:reset", reset);
      gsap.killTweensOf([el, ...notes]);
      gsap.set([el, ...notes], { clearProps: "transform,opacity,visibility,zIndex" });
    };
  });
})();
