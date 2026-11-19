// Uses a brush stroke as a mask — paints the drawn span [a, b] (length ratio) and thickness w (screen %) by moving them into dasharray and stroke-width
(() => {
  const PATH = "M40 250C300 0 1000 10 930 500C860 990 290 1000 120 770C-40 540 180 260 470 260C770 260 800 500 660 655C520 810 310 760 280 665C250 580 300 450 500 450C700 450 880 640 940 940";
  kfFx.register("brush-page-swipe", (root, { options, reduce }) => {
    const cover = reduce ? 0 : +(options.cover ?? 1), reveal = reduce ? 0 : +(options.reveal ?? 1.25), wait = reduce ? 0 : +(options.delay ?? 0.4);
    const thin = +(options.thin ?? 5), thick = +(options.thick ?? 30), ease = kfFx.ease(options.ease || "power1.inOut", "power1.inOut");
    const own = root.querySelector(':scope > [data-fx-part="stroke"] path');
    const box = document.createElement("div");
    box.className = "fx-brush";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = `<svg viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d="${own?.getAttribute("d") || PATH}"/></svg>`;
    root.append(box);
    const path = box.querySelector("path");
    const len = path.getTotalLength() || 1;
    const s = { a: 0, b: 1, w: thick };
    const paint = () => {
      const on = Math.max(0, s.b - s.a) * len;
      path.style.strokeDasharray = `${on} ${len * 2}`;
      path.style.strokeDashoffset = `${-s.a * len}`;
      path.style.strokeWidth = `${s.w}%`;
      path.style.visibility = on > 0.5 ? "visible" : "hidden";
    };
    const tweens = [];
    const go = (vars) => (tweens.push(gsap.to(s, { ...vars, onUpdate: paint })), tweens[tweens.length - 1]);
    const open = () => (Object.assign(s, { a: 1, b: 1, w: thin }), paint());
    // If attached at first open it starts covered and then lifts. An element added after everything has opened has nothing to lift
    if (document.readyState === "complete" || reduce) open();
    else {
      Object.assign(s, { a: 0, b: 1, w: thick });
      paint();
      go({ a: 1, w: thin, duration: reveal, delay: wait, ease });
    }
    const ac = new AbortController(), on = { signal: ac.signal };
    addEventListener("pageshow", (e) => e.persisted && (tweens.forEach((t) => t.kill()), open()), on);
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      tweens.forEach((t) => t.kill());
      if (reduce) return void (location.href = a.href);
      Object.assign(s, { a: 0, b: 0, w: thin });
      paint();
      go({ b: 0.85, duration: cover, ease, onComplete: () => (location.href = a.href) });
      go({ w: thick, duration: cover * 0.75, delay: cover * 0.25, ease });
    }, on);
    return () => { ac.abort(); tweens.forEach((t) => t.kill()); box.remove(); };
  });
})();
