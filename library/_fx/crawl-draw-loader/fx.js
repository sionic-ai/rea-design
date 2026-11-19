// While downloading, draws the line art very slowly (crawl seconds) so it only looks like ”it hasn’t stopped”, and when done, draws the remaining line in finish seconds.
// Before the line is fully drawn (after hold seconds) the picture fades over fade seconds, and after gap seconds the curtain is removed and fx:done fires — hook the first screen behind the curtain onto it.
// ”Fully loaded” means window load + fonts ready. If the consumer sends fx:ready, that’s when it counts (for apps that send it after loading their own images).
(() => {
  kfFx.register("crawl-draw-loader", (el, { options, reduce }) => {
    const paths = [...el.querySelectorAll('[data-fx-part="line"] path, [data-fx-part="line"] line, [data-fx-part="line"] polyline, [data-fx-part="line"] circle, [data-fx-part="line"] ellipse, [data-fx-part="line"] rect, path[data-fx-part="line"]')];
    const mark = el.querySelector('[data-fx-part="mark"]') || el.querySelector('[data-fx-part="line"]');
    const crawl = +(options.crawl ?? 130);
    const crawlEase = kfFx.ease(options["crawl-ease"] || "0.25,0.46,0.45,0.94", "power1.out");
    const finish = +(options.finish ?? 5);
    const finishEase = kfFx.ease(options["finish-ease"] || "0.455,0.03,0.515,0.955", "sine.inOut");
    const hold = +(options.hold ?? 1.5);
    const fade = +(options.fade ?? 1);
    const fadeEase = kfFx.ease(options["fade-ease"] || "0.19,1,0.22,1", "expo.out");
    const gap = +(options.gap ?? 0.4);
    const skip = options.skip || "";
    const manual = options.ready === "event";
    const timers = [];
    const tweens = [];
    let finished = false;

    const done = () => {
      el.classList.add("is-fx-done");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };

    // A page entered by inner navigation (the caller writes the press time in sessionStorage) goes straight in with no curtain — the original has a curtain only on first open, none for in-app navigation.
    // If the mark is older than 4 seconds, the transition was cut off and this is a fresh open, so show the curtain (the case of pressing but not navigating, then reopening via the address)
    const stamp = skip ? +sessionStorage.getItem(skip) : 0;
    if (skip) sessionStorage.removeItem(skip);
    if (stamp && Date.now() - stamp < 4000) {
      el.classList.add("is-fx-done");
      const raf = requestAnimationFrame(() => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })));
      return () => { cancelAnimationFrame(raf); el.classList.remove("is-fx-done"); };
    }
    if (reduce) {
      const raf = requestAnimationFrame(done);
      return () => { cancelAnimationFrame(raf); el.classList.remove("is-fx-done"); };
    }

    const lens = paths.map((p) => { try { return p.getTotalLength(); } catch { return 0; } });
    paths.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });
    if (paths.length) tweens.push(gsap.to(paths, { strokeDashoffset: 0, duration: crawl, ease: crawlEase }));

    const ready = () => {
      if (finished) return;
      finished = true;
      tweens.forEach((t) => t.kill());
      if (paths.length) tweens.push(gsap.to(paths, { strokeDashoffset: 0, duration: finish, ease: finishEase }));
      timers.push(setTimeout(() => {
        if (mark) tweens.push(gsap.to(mark, { opacity: 0, duration: fade, ease: fadeEase }));
        timers.push(setTimeout(done, gap * 1000));
      }, hold * 1000));
    };

    const onEvent = () => ready();
    el.addEventListener("fx:ready", onEvent);
    if (!manual) {
      const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
      Promise.all([loaded, document.fonts?.ready]).then(ready);
    }

    return () => {
      finished = true;
      timers.forEach(clearTimeout);
      tweens.forEach((t) => t.kill());
      el.removeEventListener("fx:ready", onEvent);
      el.classList.remove("is-fx-done");
      paths.forEach((p) => { p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; });
      if (mark) gsap.set(mark, { clearProps: "opacity" });
    };
  });
})();
