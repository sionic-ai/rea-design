// Hero intro — the photo stays in place while only a droplet-shaped window (clip-path) flies in from off-screen top right and settles,
// When the window is almost there, the title line rises from 200% below tilted 3° and stands upright, then what follows (news board · header line) floats up from 30% below.
// Instead of moving the window, move the window and the inside in opposite directions so the photo doesn’t move — the original moves the clipPath element directly.
(() => {
  kfFx.register("blob-window-intro", (el, { options, reduce }) => {
    const win = el.querySelector('[data-fx-part="window"]');
    const inside = el.querySelector('[data-fx-part="inside"]');
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const after = [...el.querySelectorAll('[data-fx-part="after"]')];
    const extra = (options.with || "").split(",").map((s) => s.trim()).filter(Boolean).flatMap((s) => [...document.querySelectorAll(s)]);
    const late = [...after, ...extra];
    if (!win) return;
    const done = () => el.dispatchEvent(new CustomEvent("fx:done"));
    const end = { x: options.x ?? "6vw", y: options.y ?? "-8vh", scaleX: +(options.sx ?? 1), scaleY: +(options.sy ?? 1) };
    const from = { x: options["from-x"] ?? "100vw", y: options["from-y"] ?? "-100vh", scaleX: 1, scaleY: 1 };
    const reset = () => {
      gsap.set([win, inside, ...lines, ...late].filter(Boolean), { clearProps: "transform,opacity" });
    };
    if (reduce) {
      el.classList.remove("fx-blob-window-intro-wait");
      extra.forEach((n) => n.classList.remove("fx-blob-window-intro-hide"));
      gsap.set(win, end);
      if (inside) gsap.set(inside, { x: 0, y: 0 });
      requestAnimationFrame(follow);
      done();
      return reset;
    }
    function follow() {
      if (!inside) return;
      // Shift the inside back by the amount the window moved (inverse for scale) so the photo stays stuck to the screen. Both window and inside use the top left as the axis.
      // Positions given in vw·vh can’t be converted to px by getProperty — read the translation and scale from the drawn matrix
      const m = new DOMMatrix(getComputedStyle(win).transform);
      const sx = m.a || 1, sy = m.d || 1;
      gsap.set(inside, { x: -m.e / sx, y: -m.f / sy, scaleX: 1 / sx, scaleY: 1 / sy });
    }
    // Remove the waiting mark (translate) first, then set the start values — if GSAP reads it while attached, translateY(200%) remains as y and the line stays hidden to the end
    el.classList.remove("fx-blob-window-intro-wait");
    extra.forEach((n) => n.classList.remove("fx-blob-window-intro-hide"));
    gsap.set([win, inside].filter(Boolean), { transformOrigin: "0 0" });
    gsap.set(lines, { y: 0, yPercent: 200, skewY: 3 });
    gsap.set(late, { y: 0 });
    const dur = +(options.dur ?? 2.5);
    const winEase = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const lineAt = +(options["line-at"] ?? 1.5), lineGap = +(options["line-gap"] ?? 0.4), lineDur = +(options["line-dur"] ?? 1);
    const afterAt = +(options["after-at"] ?? 2.1), afterGap = +(options["after-gap"] ?? 0.4), afterDur = +(options["after-dur"] ?? 1.2);
    const expo = kfFx.ease("0.19,1,0.22,1", "expo.out");
    const tl = gsap.timeline({ onComplete: done, delay: +(options.wait ?? 0) });
    gsap.set(win, from);
    tl.fromTo(win, from, { ...end, duration: dur, ease: winEase, onUpdate: follow, onStart: follow }, 0);
    // Lines with the same data-key (line group) rise together — the original raises all the letter cells in one line at once
    const groups = [];
    for (const l of lines) {
      const k = l.dataset.key || String(groups.length);
      let g = groups.find((x) => x.k === k);
      if (!g) groups.push((g = { k, els: [] }));
      g.els.push(l);
    }
    groups.forEach((g, i) => tl.fromTo(g.els, { yPercent: 200, skewY: 3 }, { yPercent: 0, skewY: 0, duration: lineDur, ease: expo }, lineAt + i * lineGap));
    // Followers — the first after after-at, the rest together after after-gap (original: after the news plane, the header line · menu · reserve button come at the same time). data-from: above (from 30% above) · fade (in place)
    const fromY = (n) => (n.dataset.from === "above" ? -30 : n.dataset.from === "fade" ? 0 : 30);
    late.forEach((n, i) => tl.fromTo(n, { yPercent: fromY(n), opacity: 0 }, { yPercent: 0, opacity: 1, duration: afterDur, ease: expo }, n.dataset.at != null ? +n.dataset.at : afterAt + (i ? afterGap : 0)));
    return () => { tl.kill(); reset(); };
  });
})();
