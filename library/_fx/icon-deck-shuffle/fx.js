// Icon card stack — only the first three show, lifted 2px each and stacked at 5°, −3°, 0°, and hovering the stack lifts the second card by 20px.
// On press the front card disappears in .125s while the second card stays lifted and goes to the back, and the new front card settles into place (app icon at the end of the first sentence on the Brand site)
(() => {
  // framer-motion default transform spring (stiffness 500·damping 25) — ends when the wobble settles below 1%
  const phys = (k, c) => {
    const w = Math.sqrt(k), z = c / (2 * Math.sqrt(k)), wd = w * Math.sqrt(1 - z * z);
    const d = Math.log(100) / (z * w) + 0.05;
    return { duration: d, ease: (p) => (p >= 1 ? 1 : 1 - Math.exp(-z * w * p * d) * (Math.cos(wd * p * d) + ((z * w) / wd) * Math.sin(wd * p * d))) };
  };

  kfFx.register("icon-deck-shuffle", (el, { options, reduce, hover }) => {
    let cards = [...el.querySelectorAll(':scope > [data-fx-part="card"]')];
    if (!window.gsap || cards.length < 2) return;
    const label = el.querySelector('[data-fx-part="label"]');
    const lift = +(options.lift ?? 20), step = +(options.step ?? 2), show = Math.max(1, +(options.show ?? 3) || 3);
    const tilts = String(options.tilt ?? "5,-3,0").split(",").map(Number);
    const fade = +(options.fade ?? 0.125);
    const sp = phys(+(options.stiffness ?? 500) || 500, +(options.damping ?? 25) || 25);
    const ease3 = kfFx.ease("0.25,0.1,0.35,1", "power1.out");
    const tilt = (i) => tilts[i] ?? 0;
    let busy = false, over = false, alive = true;
    const tw = [];
    const T = (t) => { tw.push(t); return t; };

    const layout = (instant) => {
      cards.forEach((c, i) => {
        c.style.zIndex = String(cards.length - i);
        c.classList.toggle("is-fx-top", i === 0);
        const to = { top: i >= show ? 0 : -step * i, opacity: i >= show ? 0 : 1 };
        if (instant || reduce) return gsap.set(c, { ...to, rotate: tilt(i) });
        T(gsap.to(c, { ...to, duration: 0.3, ease: ease3 }));
        T(gsap.to(c, { rotate: tilt(i), duration: sp.duration, ease: sp.ease }));
      });
    };
    const name = (c) => { if (label && c.dataset.name) label.textContent = c.dataset.name; };
    const raise = (y) => cards[1] && T(gsap.to(cards[1], { y, duration: reduce ? 0 : sp.duration, ease: sp.ease, overwrite: "auto" }));
    const enter = () => { over = true; if (!busy) raise(-lift); };
    const leave = () => { over = false; if (!busy) raise(0); };
    const onCard = (e) => name(e.currentTarget);
    const tween = (t) => new Promise((r) => { T(t); t.eventCallback("onComplete", r); });
    const shuffle = async () => {
      if (busy) return;
      busy = true;
      const [first, second] = cards;
      if (!reduce) {
        await tween(gsap.to(second, { y: -lift, duration: sp.duration, ease: sp.ease, overwrite: "auto" }));
        await tween(gsap.to(first, { opacity: 0, duration: fade, ease: ease3 }));
      }
      if (!alive) return;
      cards = [...cards.slice(1), first];
      gsap.set(first, { y: 0 });
      layout(false);
      name(cards[0]);
      if (!reduce) await tween(gsap.to(cards[0], { y: 0, duration: sp.duration, ease: sp.ease }));
      busy = false;
      if (alive) raise(over && hover ? -lift : 0);
      el.dispatchEvent(new CustomEvent("fx:shuffle", { bubbles: true, detail: { top: cards[0] } }));
    };

    layout(true);
    name(cards[0]);
    if (hover) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); }
    cards.forEach((c) => c.addEventListener("pointerenter", onCard));
    el.addEventListener("click", shuffle);
    return () => {
      alive = false;
      tw.forEach((t) => t.kill());
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", shuffle);
      cards.forEach((c) => { c.removeEventListener("pointerenter", onCard); c.classList.remove("is-fx-top"); c.style.zIndex = ""; });
      gsap.set(cards, { clearProps: "top,opacity,rotate,y,transform" });
    };
  });
})();
