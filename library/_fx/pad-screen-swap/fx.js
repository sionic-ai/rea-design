(() => {
  // If pressed again while it’s fading out, only the last press is remembered and applied at once — rapid clicking won’t tangle the screen
  kfFx.register("pad-screen-swap", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const beat = 60 / (+options.bpm || 142);
      const out = kfFx.ease("0.16,1,0.3,1", "expo.out"), snap = kfFx.ease("0.55,0,0.1,1", "power3.inOut"), rel = kfFx.ease("0.1,0.6,0.3,0.9", "power2.out");
      const pads = [...el.querySelectorAll("[data-fx-part=pad]")], screen = el.querySelector("[data-fx-part=screen]");
      if (!screen) return;
      const masks = [...screen.querySelectorAll("[data-fx-part=line]")].map((n) => { const m = document.createElement("span"); m.className = "fx-mask"; n.before(m); m.append(n); return m; });
      signal.addEventListener("abort", () => masks.forEach((m) => m.replaceWith(...m.childNodes)));
      const ins = [...screen.querySelectorAll("[data-fx-part=line]")], fades = [...screen.querySelectorAll("[data-fx-part=fade]")];
      const fill = (p) => screen.querySelectorAll("[data-key]").forEach((n) => (n.textContent = p.dataset[n.dataset.key] ?? ""));
      let cur = Math.max(0, pads.findIndex((p) => p.hasAttribute("data-on"))), busy = false, queued = null;
      const mark = (i) => pads.forEach((p, k) => { p.toggleAttribute("data-on", k === i); p.setAttribute("aria-pressed", String(k === i)); });
      mark(cur); fill(pads[cur]);
      pads.forEach((p, i) => p.addEventListener("click", () => {
        if (!reduce) gsap.fromTo(p, { scale: 0.95 }, { scale: 1, duration: beat, ease: rel, overwrite: true });
        if (i === cur) return;
        cur = i; mark(i);
        if (reduce) return fill(p);
        queued = i;
        if (busy) return;
        busy = true;
        gsap.to(ins, { yPercent: -105, duration: beat * 0.5, ease: snap, stagger: beat / 4, overwrite: true });
        gsap.to(fades, { autoAlpha: 0, duration: beat * 0.5, ease: snap, overwrite: true, onComplete: () => {
          busy = false; fill(pads[queued]); queued = null;
          gsap.fromTo(ins, { yPercent: 105 }, { yPercent: 0, duration: beat, ease: out, stagger: beat / 2, overwrite: true });
          gsap.fromTo(fades, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: beat, delay: beat * 0.25, ease: out, stagger: beat / 2, overwrite: true });
        } });
      }, { signal }));
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
