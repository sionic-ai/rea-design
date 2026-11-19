(() => {
  // The big name at screen center rises letter by letter from below (1.15s power4.out · .035 stagger), a one-line intro follows, then after a short pause
  // As About switches off, the name flies straight to the signature spot (small text at bottom left) (1.25s expo.inOut). A click or key press sends it right away in .7s.
  // The shape of the two positions is up to the css of the side using it [data-fx-state=intro]·[data-fx-state=sign] decides it — the part only links the two spots with FLIP
  kfFx.register("name-fly-sign", (el, { options, reduce }) => {
    const name = el.querySelector('[data-fx-part="name"]');
    if (!name || !name.textContent.trim()) return;
    const line = el.querySelector('[data-fx-part="line"]');
    const meta = el.querySelector('[data-fx-part="meta"]');
    const delay = +(options.delay ?? 0);
    const hold = +(options.hold ?? 3.6);
    const dur = +(options.dur ?? 1.25);
    const fast = +(options.fast ?? 0.7);
    const startOn = options.start || "load";
    let chars = [...name.querySelectorAll('[data-fx-part="char"]')];
    const madeChars = !chars.length;
    if (madeChars) {
      const words = name.textContent.trim().split(/\s+/);
      name.textContent = "";
      words.forEach((w, i) => {
        const box = document.createElement("span");
        box.className = "fx-nfs-word";
        [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "fx-nfs-char"; c.dataset.fxPart = "char"; c.textContent = ch; box.append(c); });
        name.append(box);
        if (i < words.length - 1) name.append(" ");
      });
      chars = [...name.querySelectorAll('[data-fx-part="char"]')];
    }
    let flown = false, t1 = 0, t2 = 0, tw = [];
    const sign = () => { el.dataset.fxState = "sign"; el.dispatchEvent(new CustomEvent("fx:signed", { bubbles: true })); };
    if (reduce) { sign(); return () => { delete el.dataset.fxState; }; }
    el.dataset.fxState = "intro";
    gsap.set(chars, { yPercent: 110 });
    if (line) gsap.set(line, { opacity: 0 });
    const fly = (quick) => {
      if (flown) return;
      flown = true;
      clearTimeout(t1); clearTimeout(t2);
      gsap.killTweensOf([line, ...chars].filter(Boolean));
      gsap.set(chars, { clearProps: "transform" });
      const go = () => {
        const a = name.getBoundingClientRect();
        el.dataset.fxState = "sign";
        const b = name.getBoundingClientRect();
        el.dataset.fxState = "intro";
        el.dataset.fxFlying = "";
        tw.push(gsap.to(name, { x: b.left - a.left, y: b.top - a.top, scale: b.width / (a.width || 1), transformOrigin: "0 0", duration: quick ? fast : dur, ease: "expo.inOut", onComplete: () => {
          delete el.dataset.fxFlying;
          gsap.set(name, { clearProps: "transform,transformOrigin" });
          sign();
          if (meta) tw.push(gsap.from(meta, { opacity: 0, y: 8, duration: 0.6, ease: "power2.out" }));
        } }));
      };
      if (line) tw.push(gsap.to(line, { opacity: 0, duration: quick ? 0.15 : 0.35, ease: "power1.in", onComplete: go })); else go();
    };
    const begin = () => {
      t1 = setTimeout(() => {
        tw.push(gsap.to(chars, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.035, delay: 0.15 }));
        if (line) tw.push(gsap.to(line, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: 0.85, startAt: { y: 14 } }));
        t2 = setTimeout(() => fly(false), hold * 1000);
      }, delay * 1000);
    };
    const skip = () => fly(true);
    addEventListener("pointerdown", skip, { once: true });
    addEventListener("keydown", skip, { once: true });
    const onStart = () => begin();
    if (startOn === "load") begin(); else addEventListener(startOn, onStart, { once: true });
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      tw.forEach((t) => t.kill());
      removeEventListener("pointerdown", skip); removeEventListener("keydown", skip); removeEventListener(startOn, onStart);
      gsap.set([name, ...chars, line, meta].filter(Boolean), { clearProps: "all" });
      delete el.dataset.fxState; delete el.dataset.fxFlying;
    };
  });
})();
