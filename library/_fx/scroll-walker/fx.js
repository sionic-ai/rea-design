(() => {
  // A character stuck to the screen walks left with the content by the scrolled amount, stopping at the screen edge (stop). On rewind it turns around (rotateY 180) and walks right,
  // Each time the edge of a chosen section crosses a screen-ratio line, it folds to 90° then unfolds from −90° and switches to the next character (the walking character of a reference site)
  kfFx.register("scroll-walker", (el, { options, reduce, scroller }) => {
    const looks = [...el.querySelectorAll('[data-fx-part="look"]')];
    if (!looks.length) return;
    const dir = el.querySelector('[data-fx-part="dir"]') || el;
    const face = el.querySelector('[data-fx-part="face"]') || looks[0].parentElement;
    const hide = el.querySelector('[data-fx-part="hide"]');
    const stop = +(options.stop ?? 2), speed = +(options.speed ?? 1), turn = +(options.turn ?? 0.3), flipDur = +(options.flip ?? 0.2);
    const edge = options.edge === "top" ? "top" : "left";
    const avoidBelow = +(options["avoid-below"] ?? 767);
    const avoid = options.avoid ? [...document.querySelectorAll(options.avoid)] : [];
    const show = (i) => looks.forEach((l, j) => (l.hidden = j !== i));
    // Which character it should be — the number of data-key section edges that crossed the data-ratio line of the screen
    const want = () => looks.reduce((n, l, i) => {
      if (!i) return n;
      const sec = l.dataset.key && document.querySelector(l.dataset.key);
      if (!sec) return n;
      const r = sec.getBoundingClientRect();
      const line = (edge === "left" ? innerWidth : innerHeight) * +(l.dataset.ratio ?? 0.4);
      return r[edge] <= line ? i : n;
    }, 0);
    let cur = want();
    show(cur);
    if (reduce) return () => looks.forEach((l) => (l.hidden = false));

    const pos = () => (scroller ? scroller.scrollTop + scroller.scrollLeft : Math.max(scrollY, scrollX));
    const start = { left: el.style.left, right: el.style.right };
    let left = el.getBoundingClientRect().left, prev = pos(), back = false, flipping = false, hidden = false;
    const P = { transformPerspective: 600 };
    const setDir = (rev) => {
      if (rev === back) return;
      back = rev;
      gsap.to(dir, { ...P, rotateY: rev ? 180 : 0, duration: turn, ease: "power1.inOut" });
    };
    const flipTo = (i) => {
      if (flipping || i === cur) return;
      flipping = true;
      gsap.to(face, { ...P, rotateY: 90, duration: flipDur, ease: "power1.in", onComplete: () => {
        cur = i;
        show(i);
        gsap.fromTo(face, { ...P, rotateY: -90 }, { ...P, rotateY: 0, duration: flipDur, ease: "power1.out", onComplete: () => { flipping = false; update(); } });
      } });
    };
    const update = () => {
      const p = pos(), d = (p - prev) * speed;
      prev = p;
      if (d) { setDir(d < 0); left -= d; }
      const min = (innerWidth * stop) / 100, max = innerWidth - el.offsetWidth - min;
      left = Math.min(Math.max(left, min), max);
      // Attached to an edge it is set in vw, so it stays in place when the window size changes
      if (left <= min) Object.assign(el.style, { left: `${stop}vw`, right: "auto" });
      else if (left >= max) Object.assign(el.style, { left: "auto", right: `${stop}vw` });
      else Object.assign(el.style, { left: `${left}px`, right: "auto" });
      flipTo(want());
      if (!hide || !avoid.length) return;
      const r = el.getBoundingClientRect();
      const over = innerWidth <= avoidBelow && avoid.some((a) => { const b = a.getBoundingClientRect(); return r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top; });
      if (over === hidden) return;
      hidden = over;
      gsap.to(hide, { ...P, rotateY: over ? 90 : 0, duration: flipDur, ease: over ? "power1.in" : "power1.out", overwrite: true });
    };
    const src = scroller || window;
    src.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      src.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      gsap.killTweensOf([dir, face, hide].filter(Boolean));
      gsap.set([dir, face, hide].filter(Boolean), { clearProps: "transform" });
      Object.assign(el.style, start);
      looks.forEach((l) => (l.hidden = false));
    };
  });
})();
