(() => {
  kfFx.register("petal-morph-loader", (el, { options, reduce }) => {
    const petals = [...el.querySelectorAll('[data-fx-part="petal"]')];
    const mark = el.querySelector('[data-fx-part="mark"]');
    const word = el.querySelector('[data-fx-part="word"]');
    const hold = +(options.hold ?? 2400), fade = +(options.fade ?? 0.8), spread = +(options.spread ?? 15);
    const done = () => el.dispatchEvent(new CustomEvent("fx:done"));
    if (!petals.length || !mark || reduce) {
      el.dataset.loaderState = "done";
      el.hidden = true;
      queueMicrotask(done);
      return () => { el.hidden = false; delete el.dataset.loaderState; };
    }
    el.dataset.loaderState = "loading";
    const live = [];
    // Seeded random numbers (minimal-standard LCG) — same wobble every time it opens
    let seed = +(options.seed ?? 42) || 42;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const still = new Set(String(options.still ?? "1,6,11,16").split(",").map((s) => +s.trim()).filter((n) => !isNaN(n)));
    const box = mark.getBBox();
    const mcx = box.x + box.width / 2, mcy = box.y + box.height / 2;
    const K = 0.5522847498;
    const circle = (cx, cy, r) => { const k = r * K; return `M${cx},${cy - r}C${cx + k},${cy - r},${cx + r},${cy - k},${cx + r},${cy}C${cx + r},${cy + k},${cx + k},${cy + r},${cx},${cy + r}C${cx - k},${cy + r},${cx - r},${cy + k},${cx - r},${cy}C${cx - r},${cy - k},${cx - k},${cy - r},${cx},${cy - r}Z`; };
    const orig = petals.map((p) => p.getAttribute("d"));

    gsap.set(mark, { transformOrigin: `${mcx}px ${mcy}px` });
    petals.forEach((p, i) => {
      const b = p.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      const dx = cx - mcx, dy = cy - mcy, len = Math.hypot(dx, dy) || 1;
      gsap.set(p, { x: (dx / len) * spread, y: (dy / len) * spread, opacity: 0, transformOrigin: `${cx}px ${cy}px` });
      // Petals swell halfway toward the circle and return, repeating (only when flubber is present)
      const tMax = still.has(i) ? 0 : 0.35 + rand() * 0.4;
      if (tMax && window.flubber?.interpolate && orig[i]) {
        const lerp = flubber.interpolate(orig[i], circle(cx, cy, Math.max(b.width, b.height) / 2), { maxSegmentLength: 2 });
        const o = { t: 0 };
        live.push(gsap.to(o, { t: tMax, duration: 2.8 + i * 0.15, delay: i * 0.1, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: () => p.setAttribute("d", lerp(o.t)) }));
      }
    });
    live.push(gsap.to(petals, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: { each: 0.04, from: "random" } }));
    petals.forEach((p) => {
      const amt = 2 + rand() * 3, dir = rand() > 0.5 ? 1 : -1, dur = 3 + rand() * 3, delay = rand() * 2;
      live.push(gsap.to(p, { rotation: amt * dir, duration: dur, delay, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    });
    live.push(gsap.to(mark, { rotation: 360, duration: 24, ease: "none", repeat: -1 }));
    live.push(gsap.to(mark, { scale: 1.06, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    if (word) live.push(gsap.fromTo(word, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power1.inOut" }));

    const timer = setTimeout(() => {
      el.dataset.loaderState = "leaving";
      done();
      live.push(gsap.to(el, { opacity: 0, duration: fade, delay: 0.2, onComplete: () => { el.dataset.loaderState = "done"; el.style.display = "none"; live.forEach((t) => t.kill()); } }));
    }, hold);

    return () => {
      clearTimeout(timer);
      live.forEach((t) => t.kill());
      petals.forEach((p, i) => { orig[i] && p.setAttribute("d", orig[i]); gsap.set(p, { clearProps: "all" }); });
      gsap.set([mark, el, word].filter(Boolean), { clearProps: "all" });
      delete el.dataset.loaderState;
    };
  });
})();
