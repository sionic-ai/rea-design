(() => {
  // Photos stack in the panel’s center window, flickering faster and faster (.3s each), then the cover panel (video) expands from that window size to the whole panel and its corners become rounded
  kfFx.register("flash-window-opening", (el, { options, reduce }) => {
    const flashes = [...el.querySelectorAll('[data-fx-part="flash"]')];
    const reveal = el.querySelector('[data-fx-part="reveal"]');
    if (!reveal) return;
    const video = reveal.querySelector("video");
    const times = String(options.times ?? "0, .78, 1.22, 1.58, 1.86, 2.11, 2.34").split(",").map((t) => +t.trim()).filter((t) => !Number.isNaN(t));
    const flashDur = +(options.flash ?? 0.3), hold = +(options.hold ?? 2.6), fade = +(options.fade ?? 0.3), expand = +(options.expand ?? 1.2);
    const w = options.w || "40%", h = options.h || "calc(100% - 200px)";
    const radius = options.radius || "20px";
    const inset = `inset(calc((100% - ${h}) / 2) calc((100% - ${w}) / 2) round 0px)`;
    const timers = [];
    const later = (s, fn) => timers.push(setTimeout(fn, s * 1000));
    const done = () => { gsap.set(reveal, { opacity: 1, clipPath: `inset(0% 0% round ${radius})` }); flashes.forEach((f) => gsap.set(f, { opacity: 0 })); };
    const off = () => { timers.forEach(clearTimeout); gsap.killTweensOf([reveal, ...flashes]); gsap.set([reveal, ...flashes], { clearProps: "opacity,clipPath,visibility" }); };
    if (reduce) { done(); video?.play().catch(() => {}); return off; }
    flashes.forEach((f) => gsap.set(f, { opacity: 0 }));
    gsap.set(reveal, { opacity: 0, clipPath: inset });
    const run = () => {
      el.dispatchEvent(new CustomEvent("fx:start", { bubbles: true }));
      flashes.forEach((f, i) => gsap.to(f, { opacity: 1, duration: flashDur, delay: times[i] ?? times[times.length - 1], ease: "power1.out" }));
      later(hold, () => {
        video?.play().catch(() => {});
        gsap.to(reveal, { opacity: 1, duration: fade, ease: kfFx.ease("0.025,0.64,0.415,0.975", "power3.out") });
        later(1, () => {
          gsap.to(reveal, { clipPath: "inset(0% 0% round 0px)", duration: expand, ease: "power1.inOut" });
          later(expand, () => {
            gsap.to(reveal, { clipPath: `inset(0% 0% round ${radius})`, duration: 0.3, ease: "power1.inOut" });
            flashes.forEach((f) => gsap.set(f, { opacity: 0 }));
          });
          later(0.8, () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })));
        });
      });
    };
    // on: play starts when fx:play is received (e.g. after the loading counter finishes), otherwise as soon as it is attached
    if (options.on === "play") el.addEventListener("fx:play", run, { once: true });
    else run();
    return () => { el.removeEventListener("fx:play", run); off(); };
  });
})();
