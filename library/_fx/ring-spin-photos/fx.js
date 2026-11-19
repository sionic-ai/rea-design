// Lays N photos (cutouts) out on a circle around the panel, and turns each one by offset + i × step degrees so its direction changes along the circle.
// Position is measured by panel size · first section size (center = Half panel, radius = half panel width − half card width) — re-measured when the size changes.
// On entry the whole bundle grows from the from-scale to 1x while fading on (a single curve), and after spin-delay the whole panel spins once per spin seconds with no curve.
// On fx:leave the group grows to the exit scale and switches off — the user moves on to the next page in the meantime.
(() => {
  kfFx.register("ring-spin-photos", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    let wrap = el.querySelector('[data-fx-part="wrap"]');
    let made = false;
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.setAttribute("data-fx-part", "wrap");
      items[0].before(wrap);
      wrap.append(...items);
      made = true;
    }
    const n = items.length;
    const step = +(options.step ?? 360 / n);
    const offset = +(options.offset ?? 270);
    const from = +(options.from ?? 1.2);
    const dur = +(options.dur ?? 1.5);
    const delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
    const spin = +(options.spin || 150);
    const spinDelay = +(options["spin-delay"] ?? 1.5);
    const exitScale = +(options["exit-scale"] ?? 1.2);
    const exitDur = +(options["exit-dur"] ?? 1);
    const exitEase = kfFx.ease(options["exit-ease"] || "0.32,0.48,0.27,1.02", "power2.out");
    const waitFor = options.wait || "";

    const place = () => {
      const W = el.clientWidth, H = el.clientHeight, D = items[0].offsetWidth;
      if (!W || !D) return;
      const r = W / 2 - D / 2;
      items.forEach((it, i) => {
        const a = (i * 2 * Math.PI) / n;
        it.style.setProperty("--fx-rotate", `${offset + i * step}deg`);
        it.style.setProperty("--fx-left", `${Math.round(W / 2 + r * Math.cos(a) - D / 2)}px`);
        it.style.setProperty("--fx-top", `${Math.round(H / 2 + r * Math.sin(a) - D / 2)}px`);
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    ro.observe(items[0]);

    el.style.setProperty("--fx-spin", `${spin}s`);
    let spinTimer = 0, tw = null;
    const startSpin = () => { spinTimer = setTimeout(() => el.classList.add("is-fx-spinning"), spinDelay * 1000); };

    if (reduce) {
      gsap.set(wrap, { scale: 1, opacity: 1 });
      return () => { ro.disconnect(); if (made) { wrap.before(...items); wrap.remove(); } };
    }

    gsap.set(wrap, { scale: from, opacity: 0, transformOrigin: "50% 50%" });
    const play = () => {
      tw = gsap.to(wrap, { scale: 1, opacity: 1, duration: dur, ease, delay });
      startSpin();
    };
    const onWait = () => play();
    if (waitFor) document.addEventListener(waitFor, onWait, { once: true });
    else play();

    const leave = () => {
      tw?.kill();
      tw = gsap.to(wrap, { scale: exitScale, opacity: 0, duration: exitDur, ease: exitEase, delay });
    };
    el.addEventListener("fx:leave", leave);

    return () => {
      ro.disconnect();
      clearTimeout(spinTimer);
      if (waitFor) document.removeEventListener(waitFor, onWait);
      el.removeEventListener("fx:leave", leave);
      tw?.kill();
      el.classList.remove("is-fx-spinning");
      el.style.removeProperty("--fx-spin");
      gsap.set(wrap, { clearProps: "transform,opacity" });
      items.forEach((it) => ["--fx-rotate", "--fx-left", "--fx-top"].forEach((p) => it.style.removeProperty(p)));
      if (made) { wrap.before(...items); wrap.remove(); }
    };
  });
})();
