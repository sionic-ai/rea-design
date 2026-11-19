(() => {
  // Round ‹More› button — on entering, two ripple rings spread half a beat apart, and on hover the text and icon settle down while the surrounding circle draws once around (css)
  kfFx.register("ripple-ring-btn", (el, { options, reduce, scroller }) => {
    const set = (k, v) => el.style.setProperty(k, v);
    const keys = [];
    const put = (k, v) => { set(k, v); keys.push(k); };
    if (options.ripple != null) put("--fx-ripple", `${+options.ripple}s`);
    if (options.repeat != null) put("--fx-repeat", String(+options.repeat || 1));
    if (options.ring != null) put("--fx-ring", `${+options.ring}s`);
    if (options.drop != null) put("--fx-drop", /[a-z%]$/.test(String(options.drop)) ? String(options.drop) : `${+options.drop}em`);
    if (options.dur != null) put("--fx-dur", `${+options.dur}s`);

    // Surrounding circle — created if missing (radius 39, length 245 → dash 245 shifted by 245 to hide it)
    let ring = el.querySelector('[data-fx-part="ring"]'), made = null;
    if (!ring) {
      made = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      made.setAttribute("viewBox", "0 0 80 80");
      made.setAttribute("aria-hidden", "true");
      made.setAttribute("data-fx-part", "ring");
      made.innerHTML = '<path d="M40 1a39 39 0 1 1 0 78a39 39 0 1 1 0-78"/>';
      el.append(made);
      ring = made;
    }
    if (options.hide === "0" || options.hide === 0) el.classList.add("is-fx-shown");

    let obs = null;
    const show = () => { el.classList.add("is-fx-in"); obs?.disconnect(); obs = null; };
    // on: load — attached immediately (the original Brand hooks a hidden button as a trigger so everything turns on as soon as it opens)
    if (reduce || options.on === "load") show();
    else {
      obs = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) show(); }, { root: scroller && scroller !== window ? scroller : null });
      // A hidden button has no box, so measure by its parent
      obs.observe(el.parentElement || el);
    }
    return () => {
      obs?.disconnect();
      made?.remove();
      el.classList.remove("is-fx-in", "is-fx-shown");
      keys.forEach((k) => el.style.removeProperty(k));
    };
  });
})();
