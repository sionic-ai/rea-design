// ∞ orbit loader: photos circle a lemniscate, and at the last photo’s spot the stage expands from a rounded rectangle → full panel (Brand hero)
(() => {
  kfFx.register("lemniscate-orbit-reveal", (el, { options, reduce }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const orbitEl = el.querySelector('[data-fx-part="orbit"]');
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) return;
    const media = stage.querySelector('[data-fx-part="media"]');
    if (reduce || !photos.length || !orbitEl) {
      if (orbitEl) gsap.set(orbitEl, { autoAlpha: 0 });
      el.dispatchEvent(new CustomEvent("fx:revealed", { bubbles: true }));
      return () => orbitEl && gsap.set(orbitEl, { clearProps: "all" });
    }
    const orbitDur = +(options.orbit ?? 2), openDur = +(options.open ?? 2), delay = +(options.delay ?? 0.25);
    const W = el.clientWidth, H = el.clientHeight, small = innerWidth <= 768;
    const A = options.size != null ? +options.size : small ? (W * 50) / 375 : (W * 200) / 1512;
    const R0 = options.radius != null ? +options.radius : small ? 5 : (W * 20) / 1512;
    const cx = W / 2, cy = H / 2, S = W / 2.5, C = S * 1.2, N = photos.length, T = 1 / N;
    const o = { p: 0, e: 0 };
    const place = () => photos.forEach((ph, n) => {
      const a = (o.p * Math.PI * 2 + (n / N) * Math.PI * 2 + Math.PI / 2) * o.e, s = Math.sin(a), k = 1 + s * s;
      gsap.set(ph, { x: cx + (S * Math.cos(a)) / k, y: cy + (C * Math.cos(a) * s) / k });
    });
    const ring = gsap.timeline({ paused: true, onUpdate: place }).to(o, { p: 1 + T, duration: orbitDur, ease: "none" }, 0).to(o, { e: 1, duration: orbitDur, ease: "power1.out" }, 0);
    const box = { w: A, h: A, r: R0 };
    const cover = (w, h) => Math.max(w / 16, (h * 1.2) / 9);
    const clip = () => {
      stage.style.clipPath = `inset(${(H - box.h) / 2}px ${(W - box.w) / 2}px round ${box.r}px)`;
      if (media) media.style.transform = `scale(${cover(box.w, box.h) / cover(W, H)})`;
    };
    clip();
    gsap.set(stage, { opacity: 0 });
    gsap.set(photos, { opacity: 0 });
    ring.progress(0.8);
    const tl = gsap.timeline({ delay });
    tl.fromTo(photos, { scale: 0.5 }, { scale: 1, duration: 0.25, stagger: 0.05, ease: "power1.out" }, 0)
      .to(photos, { opacity: 1, duration: 0.1, stagger: 0.05 }, 0)
      .fromTo(ring, { progress: 0.8 }, { progress: 1, duration: orbitDur, ease: "power1.out" }, 0)
      .add(() => { gsap.set(photos[N - 1], { opacity: 0 }); gsap.set(stage, { opacity: 1 }); })
      .to(box, { w: W, h: H, r: 0, duration: openDur, ease: "expo.inOut", onUpdate: clip, onComplete: () => { stage.style.clipPath = ""; if (media) media.style.transform = ""; } })
      .to(orbitEl, { scale: 0, duration: openDur, ease: "expo.inOut" }, "<")
      .to(ring, { progress: 0.8, duration: openDur, ease: "expo.inOut" }, "<")
      .add(() => el.dispatchEvent(new CustomEvent("fx:revealed", { bubbles: true })), `<${openDur * 0.375}`);
    return () => {
      tl.kill(); ring.kill();
      stage.style.clipPath = "";
      if (media) media.style.transform = "";
      gsap.set([stage, orbitEl, ...photos], { clearProps: "all" });
    };
  });
})();
