(() => {
  // A letter-shaped hole in the white curtain — the text passes through, the hole outline is drawn, then the curtain spins with the hole and grows 10x to open the page below.
  // Plays only once a day (once: day). When returning on another day, fx:play runs directly with no curtain {quick: true}
  const KEY = "kf-hole-zoom-loader";
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  kfFx.register("hole-zoom-loader", (el, { options, reduce }) => {
    const texts = [...el.querySelectorAll('[data-fx-part="text"]')];
    const sheet = el.querySelector('[data-fx-part="sheet"]');
    const outline = el.querySelector('[data-fx-part="outline"]');
    const line = outline?.querySelector("path, rect, circle, ellipse, polygon");
    const wedge = el.querySelector('[data-fx-part="wedge"]');
    const tail = el.querySelector('[data-fx-part="tail"]');
    if (!sheet) return;
    const root = document.documentElement;
    const fire = (type, detail) => el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
    const once = options.once === "day" ? `${KEY}:${options.name || location.pathname}` : "";
    let seen = false;
    try { seen = !!once && localStorage.getItem(once) === today(); } catch {}
    const finish = () => { el.hidden = true; root.classList.remove("fx-hzl-lock"); fire("fx:done"); };
    if (reduce || seen) {
      el.hidden = true;
      queueMicrotask(() => { fire("fx:play", { quick: true }); fire("fx:done"); });
      return () => { el.hidden = false; };
    }
    const hold = +(options.hold ?? 1.1), draw = +(options.draw ?? 1), zoom = +(options.zoom ?? 1.5), scale = +(options.scale ?? 10), turn = +(options.turn ?? 20), playAt = +(options["play-at"] ?? 0.4);
    texts[0]?.classList.add("fx-hzl-first");
    root.classList.add("fx-hzl-lock");
    scrollTo(0, 0);
    if (line) { const len = line.getTotalLength(); gsap.set(line, { strokeDasharray: len, strokeDashoffset: len }); }
    const on = (n) => () => n?.classList.add("is-on");
    const tl = gsap.timeline();
    tl.call(on(texts[0]), null, 0);
    tl.call(on(texts[1]), null, hold);
    tl.addLabel("second", hold);
    tl.call(() => el.classList.add("is-clear"), null, "second");
    tl.call(() => outline?.classList.add("is-on"), null, "second+=0.5");
    if (line) tl.to(line, { strokeDashoffset: 0, duration: draw, ease: "power2.inOut" }, "second+=0.5");
    tl.call(on(wedge), null, "second+=0.9");
    tl.call(on(tail), null, "second+=1");
    tl.addLabel("zoom", hold + 0.5 + draw);
    const holeParts = [outline, sheet].filter(Boolean);
    if (holeParts.length) tl.to(holeParts, { scale, rotation: turn, duration: zoom, ease: "power3.in", transformOrigin: "50% 50%" }, "zoom");
    if (tail) {
      tl.to(tail, { scale: scale * 2, rotation: 5, duration: zoom, ease: "power3.in", transformOrigin: "left top" }, "zoom");
      tl.to(tail, { opacity: 0, duration: 0.5, ease: "power2.out" }, `zoom+=${Math.max(0, zoom - 0.5)}`);
    }
    tl.call(() => fire("fx:play", { quick: false }), null, `zoom+=${playAt}`);
    tl.call(() => fire("fx:open"), null, Math.max(0, tl.duration() - 0.5));
    tl.call(() => { scrollTo(0, 0); try { once && localStorage.setItem(once, today()); } catch {} finish(); }, null, tl.duration());
    return () => {
      tl.kill();
      root.classList.remove("fx-hzl-lock");
      el.hidden = false; el.classList.remove("is-clear");
      [...texts, outline, wedge, tail].forEach((n) => n?.classList.remove("is-on", "fx-hzl-first"));
      const used = [...holeParts, tail, line].filter(Boolean);
      if (used.length) gsap.set(used, { clearProps: "all" });
    };
  });
})();
