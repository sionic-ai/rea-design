// Three-photo intro — over a white curtain, three small photos in the center light up each tempo (step) in the order center · left · right, and the next frame switches in the same order.
// When all have changed, both sides blur out and the center one fills the screen, then the curtain lifts (Brand intro values: .3 · .2 tempo · .5 · .3 · 1s expo.inOut · after .5, 1.5s power4.out)
(() => {
  kfFx.register("trio-flash-intro", (el, { options, reduce }) => {
    const inner = el.querySelector('[data-fx-part="inner"]');
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!inner || !photos.length) return;
    // when: external — skipped if arriving from within the same site (only on outside entry or refresh)
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin && document.referrer !== location.href; } catch (e) {}
    const done = () => { el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce || (options.when === "external" && same)) { done(); return () => { el.hidden = false; }; }
    const main = photos.find((p) => p.dataset.key === "main") || photos[Math.floor(photos.length / 2)];
    const order = [main, ...photos.filter((p) => p !== main)];
    const frames = (p) => [...p.querySelectorAll('[data-fx-part="frame"]')];
    const show = (p, n) => frames(p).forEach((f, i) => f.classList.toggle("is-on", i === n));
    const start = +(options.start ?? 0.3), step = +(options.step ?? 0.2), hold = +(options.hold ?? 0.5);
    const side = +(options.side ?? 0.3), grow = +(options.grow ?? 1), wait = +(options.wait ?? 0.5), fade = +(options.fade ?? 1.5);
    const growEase = kfFx.ease(options["grow-ease"] || "expo.inOut", "expo.inOut"), fadeEase = kfFx.ease(options["fade-ease"] || "power4.out", "power4.out");
    const rounds = Math.max(...photos.map((p) => frames(p).length), 1);
    gsap.set(photos, { opacity: 0 });
    photos.forEach((p) => show(p, 0));
    // on: load — start at window load (after images are fully loaded) (the Brand original’s window load). Default is right on attach
    const tl = gsap.timeline({ delay: start, onComplete: done, paused: options.on === "load" && document.readyState !== "complete" });
    if (tl.paused()) addEventListener("load", () => tl.play(), { once: true });
    order.forEach((p, i) => tl.set(p, { opacity: 1 }, i * step));
    for (let r = 1; r < rounds; r++) order.forEach((p, i) => tl.call(() => show(p, r), null, (r * order.length + i) * step));
    const sides = photos.filter((p) => p !== main);
    tl.to(sides, { opacity: 0, duration: side, onComplete: () => sides.forEach((p) => (p.style.display = "none")) }, `+=${hold}`);
    tl.to(inner, { width: "100%", height: "100vh", duration: grow, ease: growEase });
    tl.to(el, { opacity: 0, duration: fade, delay: wait, ease: fadeEase });
    return () => {
      tl.kill();
      gsap.set([el, inner, ...photos], { clearProps: "all" });
      photos.forEach((p) => frames(p).forEach((f) => f.classList.remove("is-on")));
      el.hidden = false;
    };
  });
})();
