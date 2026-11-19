(() => {
  // When a hand enters a section, a round guide circle (text or image like ”Swipe”) turns on, and each time the mouse moves it glides to that spot in .5s power4.out.
  // Keeps receiving the mouse across the whole window even outside the section (as in the original), so it turns on right at the cursor when re-entering
  kfFx.register("ease-follow-disc", (el, { options, reduce, hover }) => {
    const disc = el.querySelector('[data-fx-part="disc"]');
    if (!disc || !hover) return;
    const dur = +(options.dur ?? 0.5);
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    // look: pop — the outer (disc) only follows the cursor, the inner face scales 0 ↔ 1 via a CSS transition (Studio: .7s cubic-bezier(.4,0,.2,1)).
    // To avoid mixing with follow-scale in one transform, split into two layers like the original. shift-x·shift-y offset the plane by a percentage of its own size (60 · -60 = Top right)
    const pop = options.look === "pop";
    if (pop) {
      if (options["shift-x"] != null) disc.style.setProperty("--fx-shift-x", `${+options["shift-x"]}%`);
      if (options["shift-y"] != null) disc.style.setProperty("--fx-shift-y", `${+options["shift-y"]}%`);
    }
    const move = (e) => {
      if (reduce) gsap.set(disc, { x: e.clientX, y: e.clientY });
      else gsap.to(disc, { x: e.clientX, y: e.clientY, duration: dur, ease, overwrite: "auto" });
    };
    addEventListener("mousemove", move);
    const on = () => disc.classList.add("is-visible");
    const off = () => disc.classList.remove("is-visible");
    el.addEventListener("mouseenter", on);
    // The original turns on when the mouse moves over a section — a cursor that entered after the page changed inside the section also turns on after one move
    if (pop) el.addEventListener("mousemove", on);
    el.addEventListener("mouseleave", off);
    return () => {
      removeEventListener("mousemove", move);
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mousemove", on);
      el.removeEventListener("mouseleave", off);
      disc.classList.remove("is-visible");
      disc.style.removeProperty("--fx-shift-x");
      disc.style.removeProperty("--fx-shift-y");
      gsap.killTweensOf(disc);
      gsap.set(disc, { clearProps: "x,y" });
    };
  });
})();
