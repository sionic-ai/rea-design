// About section — photo scatter (original mwg082): the panel is pinned for 400vh, and photos turn on at .1 intervals. When on, they bounce .9→1 scale with elastic.out(2,.6) .5s,
// In 100vh perspective, z is pushed back up to −window width and ±20° at random over a length of 1 with power1.inOut, then from .4 on it flies off r% horizontally and −screen height ×2 vertically over a length of .6 with power1.in
(() => {
  const depthFly = (root, k) => root.querySelectorAll(".dfy").forEach((sec) => {
    const pin = sec.querySelector(".dfy__pin"), stage = sec.querySelector(".dfy__stage"), media = sec.querySelectorAll(".dfy__media");
    if (!pin || !stage || !media.length) return;
    const pops = [...media].map((m) => gsap.timeline({ paused: true }).fromTo(m, { scaleX: 0.9, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, immediateRender: false, ease: "elastic.out(2, 0.6)", duration: 0.5 }, "<"));
    const tl = gsap.timeline({ scrollTrigger: { trigger: pin, start: "top top", end: "bottom bottom", scrub: true, pin: stage, invalidateOnRefresh: true } });
    media.forEach((m, i) => {
      const one = gsap.timeline({ onStart: () => pops[i].play(), onReverseComplete: () => pops[i].progress(0).pause() });
      one.set(m, { autoAlpha: 1 }, 0.001);
      const r = 40 * (Math.random() - 0.5);
      one.to(m, { z: -innerWidth, rotation: r, duration: 1, ease: "power1.inOut" });
      one.to(m, { x: 0.01 * r * innerWidth, y: -2 * innerHeight, duration: 0.6, ease: "power1.in" }, "<+=0.4");
      tl.add(one, 0.1 * i);
    });
    k.add(() => { tl.scrollTrigger?.kill(); tl.kill(); pops.forEach((p) => p.kill()); gsap.set(media, { clearProps: "all" }); });
  });

  TDS.page("about", (root, { k, reduce }) => {
    if (reduce) { gsap.set(root.querySelectorAll(".dfy__media"), { autoAlpha: 1 }); return; }
    depthFly(root, k);
  });
})();
