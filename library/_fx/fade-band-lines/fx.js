// A gradient band covering each line shrinks toward its right edge (scaleX 1→0) and reveals the text — the band’s darker side is on the right, so the left shows through first (per the original).
(() => {
  kfFx.register("fade-band-lines", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length) return;
    const band = /band/.test(options.look || "");
    const each = +(options.each ?? 0.05), dur = +(options.dur ?? 0.3);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const made = [];
    const child = (l, role) => {
      let c = l.querySelector(`:scope > [data-fx-part="${role}"]`);
      if (!c) {
        c = document.createElement("span");
        c.setAttribute("data-fx-part", role);
        c.setAttribute("aria-hidden", "true");
        l.append(c);
        made.push(c);
      }
      return c;
    };
    const grads = lines.map((l) => child(l, "gradient"));
    const bands = band ? lines.map((l) => child(l, "band")) : [];
    const shown = () => {
      gsap.set(grads, { scaleX: 0 });
      band ? gsap.set(bands, { opacity: 0 }) : gsap.set(lines, { opacity: 1 });
    };
    const clean = () => { made.forEach((c) => c.remove()); gsap.set(lines, { clearProps: "opacity" }); };
    if (reduce) { shown(); return clean; }

    gsap.set(grads, { scaleX: 1 });
    band ? gsap.set(bands, { opacity: 1 }) : gsap.set(lines, { opacity: 0 });
    let played = false, tweens = [];
    const play = () => {
      if (played) return;
      played = true;
      tweens = [
        band ? gsap.to(bands, { opacity: 0, stagger: each, duration: dur, ease }) : gsap.to(lines, { opacity: 1, stagger: each, duration: dur, ease }),
        gsap.to(grads, { scaleX: 0, stagger: each, duration: dur, ease }),
      ];
    };
    // start — for event, wait for fx:play (after the loader clears), for load, go right away, otherwise use ScrollTrigger’s start (default top 30%, once)
    const start = options.start || "top 30%";
    let st = null;
    if (start === "event") el.addEventListener("fx:play", play);
    else if (start === "load") play();
    else if (window.ScrollTrigger) st = ScrollTrigger.create({ trigger: (options.at && document.querySelector(options.at)) || el, start, once: true, onEnter: play });
    else play();
    return () => {
      el.removeEventListener("fx:play", play);
      st?.kill();
      tweens.forEach((t) => t.kill());
      clean();
    };
  });
})();
