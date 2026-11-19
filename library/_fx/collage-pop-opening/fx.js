// Collage pieces pop out over a gray curtain to cover the screen, and the curtain lifts at 1.45s — once every 7 days (life-design #opening)
(() => {
  kfFx.register("collage-pop-opening", (el, { options, reduce }) => {
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    const key = "fxCollagePop";
    let seen = false;
    if (options.once !== "none") { try { seen = new RegExp(`(?:^|; )${key}=1`).test(document.cookie); document.cookie = `${key}=1; max-age=604800; path=/; SameSite=Lax`; } catch (e) {} }
    const narrow = +(options.narrow ?? 767);
    if (reduce || seen || innerWidth <= narrow || !pieces.length) {
      el.classList.add("is-fx-off");
      const t = setTimeout(() => { fire("fx:open"); fire("fx:done"); }, 0);
      return () => { clearTimeout(t); el.classList.remove("is-fx-off"); };
    }
    const timers = [], later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const first = String(options.first || "2,4,10,17,23,24").split(",").map((n) => +n);
    const step = +(options.step ?? 55), fd = +(options["first-dur"] ?? 0.28);
    const restAt = +(options["rest-at"] ?? 650), rs = +(options["rest-step"] ?? 7), rd = +(options["rest-dur"] ?? 0.1);
    const close = +(options.close ?? 1450), fade = +(options.fade ?? 0.7);
    const on = (p, dur, ease) => { p.style.transition = `opacity ${dur}s ${ease}`; p.style.opacity = "1"; };
    const a = first.map((i) => pieces[i]).filter(Boolean), b = pieces.filter((p) => !a.includes(p)).sort(() => Math.random() - 0.5);
    later(() => a.forEach((p, i) => later(() => on(p, fd, "cubic-bezier(.22,1,.36,1)"), i * step)), 100);
    later(() => b.forEach((p, i) => later(() => on(p, rd, "ease-out"), i * rs)), restAt);
    later(() => { el.style.setProperty("--fx-fade", `${fade}s`); el.classList.add("is-fx-hide"); fire("fx:open"); later(() => fire("fx:done"), fade * 1000); }, close);
    return () => { timers.forEach(clearTimeout); el.classList.remove("is-fx-hide"); pieces.forEach((p) => { p.style.opacity = ""; p.style.transition = ""; }); };
  });
})();
