// Progress follows real downloads (images, video, fonts) at 50fps, closing 10% of the remainder each tick — the original followed imagesLoaded progress this way.
// once: if session, it runs only on first open in a tab and from the next page the curtain lifts right away. When finished it fires fx:loaded to continue the header line and Hero entrance
(() => {
  kfFx.register("stroke-bar-loader", (el, { options, reduce }) => {
    const hold = +(options.hold ?? 1.3), each = +(options.each ?? 0.05), copyAt = +(options["copy-at"] ?? 0.8);
    const draw = +(options.draw ?? 1), spread = +(options.spread ?? 0.167), gone = +(options.gone ?? 0.7);
    const key = options.once === "session" ? `fx-loader:${location.pathname.split("/").slice(0, -1).join("/")}` : "";
    const done = (instant) => {
      el.classList.add("is-done");
      el.dispatchEvent(new CustomEvent("fx:loaded", { bubbles: true, detail: { instant } }));
    };
    if (reduce || (key && sessionStorage.getItem(key))) { done(true); el.hidden = true; return () => { el.hidden = false; el.classList.remove("is-done"); }; }
    if (key) sessionStorage.setItem(key, "1");
    const timers = [], tl = gsap.timeline();
    const strokes = [...el.querySelectorAll('[data-fx-part="logo"] :is(path, line, polyline, circle)')];
    strokes.forEach((s, i) => {
      const len = s.getTotalLength?.() || 0;
      gsap.set(s, { strokeDasharray: len + 1, strokeDashoffset: len + 1 });
      tl.to(s, { strokeDashoffset: 0, duration: draw, ease: "sine.inOut" }, strokes.length > 1 ? (spread * i) / (strokes.length - 1) : 0);
    });
    const copy = el.querySelector('[data-fx-part="copy"]');
    if (copy && !copy.querySelector("span")) {
      const chars = [...copy.textContent];
      copy.textContent = "";
      chars.forEach((c, i) => { const s = document.createElement("span"); s.textContent = c; s.style.transitionDelay = `${(i + 1) * each}s`; copy.append(s); });
    }
    timers.push(setTimeout(() => el.classList.add("is-copy"), copyAt * 1000));
    const media = [...document.images, ...document.querySelectorAll("video")];
    const ready = (m) => (m.tagName === "VIDEO" ? m.readyState >= 2 : m.complete);
    let shown = 0;
    const tick = setInterval(() => {
      const loaded = media.length ? media.filter(ready).length / media.length : 1;
      shown += (loaded * 100 - shown) * 0.1;
      if (shown > 99.9) shown = 100;
      el.style.setProperty("--fx-progress", `${shown}%`);
      if (shown >= 100) {
        clearInterval(tick);
        timers.push(setTimeout(() => done(false), hold * 1000));
        timers.push(setTimeout(() => { el.hidden = true; }, (hold + gone) * 1000));
      }
    }, 20);
    return () => {
      clearInterval(tick); timers.forEach(clearTimeout); tl.kill();
      if (strokes.length) gsap.set(strokes, { clearProps: "strokeDasharray,strokeDashoffset" });
      el.classList.remove("is-done", "is-copy"); el.hidden = false; el.style.removeProperty("--fx-progress");
    };
  });
})();
