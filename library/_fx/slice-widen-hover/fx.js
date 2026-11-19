(() => {
  // Stacks N panel-size cells and shows them split into N equal parts with clip-path — only the hovered cell widens to (100 − (N−1)·narrow)%, while the rest are pushed to narrow% at both ends and blurred
  const poly = (a, b) => `polygon(${a}% 0%, ${b}% 0%, ${b}% 100%, ${a}% 100%)`;
  kfFx.register("slice-widen-hover", (el, { options, reduce, hover }) => {
    const slices = [...el.querySelectorAll('[data-fx-part="slice"]')];
    const n = slices.length;
    if (n < 2) return;
    const min = +(options.min ?? 900);
    const narrow = +(options.narrow ?? 15);
    const dur = +(options.dur ?? 1.2);
    const blur = +(options.blur ?? 15);
    const ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    const wide = 100 - (n - 1) * narrow;
    const pct = 100 / n;
    const part = (s, name) => s.querySelector(`[data-fx-part="${name}"]`);
    let on = false;
    const rest = () => slices.forEach((s, i) => {
      gsap.set(s, { clipPath: poly(i * pct, (i + 1) * pct) });
      const small = part(s, "small"), big = part(s, "big");
      if (small) gsap.set(small, { left: `${i * pct + 2.5}%` });
      if (big) gsap.set(big, { left: `${i * narrow + wide / 2}%` });
    });
    const clear = () => slices.forEach((s) => {
      gsap.killTweensOf(s);
      gsap.set(s, { clearProps: "clipPath" });
      ["small", "big", "image"].forEach((k) => { const p = part(s, k); if (p) { gsap.killTweensOf(p); gsap.set(p, { clearProps: "left,x,filter,opacity,visibility" }); } });
    });
    const enter = (i) => {
      const s = slices[i];
      s.classList.add("is-active");
      gsap.to(s, { duration: dur, clipPath: poly(i * narrow, i * narrow + wide), ease });
      const big = part(s, "big"), img = part(s, "image");
      if (big) gsap.to(big, { duration: dur / 2, autoAlpha: 1, ease: "power2.in" });
      if (img) gsap.to(img, { duration: dur, x: `${-1 * (i - 1) * narrow * 2}%`, ease });
      slices.forEach((o, j) => {
        const sm = part(o, "small"), bg = part(o, "big"), im = part(o, "image");
        if (sm) gsap.to(sm, { duration: 0.3, autoAlpha: 0 });
        if (j === i) return;
        if (bg) { gsap.killTweensOf(bg); gsap.to(bg, { duration: 0.3, autoAlpha: 0 }); }
        const at = j < i ? j * narrow : 100 - (n - j) * narrow;
        gsap.to(o, { duration: dur, clipPath: poly(at, at + narrow), ease });
        if (im) gsap.to(im, { duration: dur, x: `${j < i ? -narrow : narrow}%`, filter: `blur(${blur}px)`, ease });
      });
    };
    const leave = (i) => {
      slices[i].classList.remove("is-active");
      slices.forEach((o, j) => {
        const sm = part(o, "small"), bg = part(o, "big"), im = part(o, "image");
        if (bg) { gsap.killTweensOf(bg); gsap.to(bg, { duration: 0.3, autoAlpha: 0 }); }
        if (sm) { gsap.killTweensOf(sm); gsap.to(sm, { duration: dur / 2, autoAlpha: 1, ease: "power2.in" }); }
        gsap.to(o, { duration: dur, clipPath: poly(j * pct, (j + 1) * pct), ease });
        if (im) gsap.to(im, { duration: dur, x: "0%", filter: "blur(0px)", ease });
      });
    };
    const offs = [];
    const wire = () => slices.forEach((s, i) => {
      const go = () => { if (!s.classList.contains("is-active")) enter(i); };
      const out = () => leave(i);
      s.addEventListener("mouseenter", go);
      s.addEventListener("mousemove", go);
      s.addEventListener("mouseleave", out);
      s.addEventListener("focusin", go);
      s.addEventListener("focusout", out);
      offs.push(() => { s.removeEventListener("mouseenter", go); s.removeEventListener("mousemove", go); s.removeEventListener("mouseleave", out); s.removeEventListener("focusin", go); s.removeEventListener("focusout", out); });
    });
    const mq = matchMedia(`(min-width: ${min + 1}px)`);
    const apply = () => {
      offs.splice(0).forEach((f) => f());
      if (!mq.matches) { clear(); on = false; return; }
      rest();
      on = true;
      if (!reduce && hover) wire();
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      offs.splice(0).forEach((f) => f());
      slices.forEach((s) => s.classList.remove("is-active"));
      if (on) clear();
    };
  });
})();
