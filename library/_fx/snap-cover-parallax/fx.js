// Flips work covers one per screen (fullPage.js 2.9.7 — one wheel·key·dot step takes .9s ease, wraps from the end to the start).
// While transitioning, the cover image trails behind the slot (outgoing section +60%, incoming section -60% back to 0) so the layers look deep — the original is a paid parallax extension, so the same motion was newly written.
// .6s after the section settles, the name line turns on over .3s, and clicking the name pulls that section up 30% and shrinks the image to .6x before moving on
(() => {
  let busy = null;
  kfFx.register("snap-cover-parallax", (el, { options, reduce }) => {
    const $ = window.jQuery;
    const sections = [...el.querySelectorAll('[data-fx-part="section"]')];
    if (!sections.length || !$?.fn?.fullpage) return;
    const wide = matchMedia(`(min-width: ${+(options.wide ?? 768)}px)`);
    const speed = +(options.speed ?? 900), depth = +(options.depth ?? 60), loop = options.loop !== "off";
    const cover = (s) => s.querySelector('[data-fx-part="cover"]');
    const put = (c, y, ms) => { if (!c) return; c.style.transition = ms ? `transform ${ms}ms ${options.ease || "ease"}` : "none"; c.style.transform = `translate3d(0, ${y}%, 0)`; };
    let on = false;
    const start = () => {
      if (on || busy || !wide.matches) return;
      on = true; busy = el;
      el.classList.add("is-armed");
      $(el).fullpage({
        sectionSelector: '[data-fx-part="section"]',
        navigation: options.dots !== "off",
        navigationPosition: "right",
        loopBottom: loop, loopTop: loop,
        scrollingSpeed: reduce ? 0 : speed,
        css3: true, easingcss3: options.ease || "ease",
        controlArrows: false, animateAnchor: false, lockAnchors: true, verticalCentered: false,
        recordHistory: false,
        onLeave(index, next, dir) {
          if (reduce) return;
          const from = cover(sections[index - 1]), to = cover(sections[next - 1]);
          const sign = dir === "up" ? -1 : 1;
          put(to, -sign * depth, 0);
          requestAnimationFrame(() => requestAnimationFrame(() => { put(from, sign * depth, speed); put(to, 0, speed); }));
        },
        afterLoad(_, index) { sections.forEach((s, i) => { if (i !== index - 1) put(cover(s), 0, 0); }); },
      });
    };
    const stop = () => {
      if (!on) return;
      on = false; busy = null;
      $.fn.fullpage.destroy("all");
      el.classList.remove("is-armed");
      sections.forEach((s) => { put(cover(s), 0, 0); cover(s)?.style.removeProperty("transform"); });
    };
    const flip = () => (wide.matches ? start() : stop());
    // Clicking the name pulls the section up and shrinks the image (.3s + .6s), then goes to that address
    const ac = new AbortController();
    sections.forEach((s) => s.querySelectorAll('[data-fx-part="label"] a, a[data-fx-part="label"]').forEach((a) => a.addEventListener("click", (e) => {
      if (!on || reduce) return;
      e.preventDefault();
      s.classList.add("is-leaving");
      const href = a.getAttribute("href");
      setTimeout(() => { if (href && href !== "#") location.href = href; else s.classList.remove("is-leaving"); }, 900);
    }, { signal: ac.signal })));
    wide.addEventListener("change", flip, { signal: ac.signal });
    flip();
    return () => { ac.abort(); stop(); sections.forEach((s) => s.classList.remove("is-leaving")); };
  });
})();
