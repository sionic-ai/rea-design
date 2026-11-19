(() => {
  // On hover a ‹band color 50% → background color› gradient panel stretches from outside the left to 4x beyond the right end, covering the button in band color, and the letters tint one by one, late.
  // On release, a ”base color 50% → band color” board sweeps back along the same path to the base color — the entering and leaving boards differ, so it always sweeps left to right
  kfFx.register("gradient-band-btn", (el, { options, hover }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    const delay = +(options.delay ?? 0.1);
    const each = +(options.each ?? 0.025);
    let orig = null;
    if (label && !label.querySelector(".fx-gbb-ch")) {
      orig = label.textContent;
      const frag = document.createDocumentFragment();
      let n = 0;
      for (const ch of orig) {
        if (/\s/.test(ch)) { frag.append(ch); continue; }
        const s = document.createElement("span");
        s.className = "fx-gbb-ch";
        s.textContent = ch;
        s.style.transitionDelay = `${delay + each * n++}s`;
        frag.append(s);
      }
      label.setAttribute("aria-label", orig);
      label.replaceChildren(frag);
    }
    const on = () => { el.classList.add("is-in"); el.classList.remove("is-out"); };
    const off = () => { el.classList.add("is-out"); el.classList.remove("is-in"); };
    const evIn = hover ? "mouseenter" : "focus", evOut = hover ? "mouseleave" : "blur";
    el.addEventListener(evIn, on);
    el.addEventListener(evOut, off);
    return () => {
      el.removeEventListener(evIn, on);
      el.removeEventListener(evOut, off);
      el.classList.remove("is-in", "is-out");
      if (label && orig != null) { label.textContent = orig; label.removeAttribute("aria-label"); }
    };
  });
})();
