// Notification card — on hover the tag slot shifts 26px to the right (layout transition: a transform reverting from the new position to the old is resolved with a spring) and disappears while the arrow slot turns on.
// shift: while scrolling down the card stays raised by that amount, hide: after that section enters the screen the card disappears
(() => {
  kfFx.register("notice-card", (el, { options, reduce, hover, scroller }) => {
    const offs = [];
    const label = el.querySelector('[data-fx-part="label"]');
    if (hover && label) {
      const spring = getComputedStyle(el).getPropertyValue("--fx-spring").trim() || "ease-out";
      const dur = parseFloat(getComputedStyle(el).getPropertyValue("--fx-dur")) * 1000 || 400;
      const swap = (on) => {
        const a = label.getBoundingClientRect().left;
        el.classList.toggle("is-fx-hover", on);
        const d = a - label.getBoundingClientRect().left;
        if (!reduce && Math.abs(d) > 0.5) label.animate([{ transform: `translateX(${d}px)` }, { transform: "none" }], { duration: dur, easing: spring, delay: 8, fill: "backwards" });
      };
      // Framer moves position on the frame after a state change — delay one frame to match the timing
      let raf = 0;
      const later = (on) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => swap(on)); };
      const enter = () => later(true), leave = () => later(false);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      offs.push(() => { cancelAnimationFrame(raf); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.classList.remove("is-fx-hover"); });
    }
    const shift = +(options.shift ?? 0);
    // hide — when the section’s top edge enters below the screen (even after passing) the card vanishes, and returns when scrolled back above it (Product scroll-target variant)
    const mark = options.hide ? document.querySelector(options.hide) : null;
    if (shift || mark) {
      const src = scroller || window;
      const pos = () => (scroller ? scroller.scrollTop : window.scrollY);
      const vh = () => (scroller ? scroller.clientHeight : innerHeight);
      const step = +(options.step ?? 1);
      let last = pos();
      const on = () => {
        if (mark) el.classList.toggle("is-fx-gone", mark.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0) < vh());
        if (!shift) return;
        const y = pos(), d = y - last;
        if (Math.abs(d) < step) return;
        last = y;
        el.classList.toggle("is-fx-shifted", d > 0 && y > 0);
      };
      if (shift) el.style.setProperty("--fx-shift", `${shift}px`);
      src.addEventListener("scroll", on, { passive: true });
      on();
      offs.push(() => { src.removeEventListener("scroll", on); el.classList.remove("is-fx-shifted", "is-fx-gone"); el.style.removeProperty("--fx-shift"); });
    }
    return () => offs.forEach((f) => f());
  });
})();
