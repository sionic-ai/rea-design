// First page only — work slider (keen-slider snap, progress bar starts at the visible share and runs to the end) and the media flow row (one clone set · width/1360×95s · pauses off-screen)
(() => {
  const slider = document.querySelector(".dd-works .keen-slider");
  if (slider && window.KeenSlider) {
    const bar = document.querySelector(".dd-works__progress .bar");
    const size = Math.floor((slider.clientWidth / slider.scrollWidth) * 100) / 100;
    gsap.set(bar, { scaleX: size });
    const keen = new KeenSlider(slider, {
      loop: false, mode: "snap", rtl: false, slides: { perView: "auto" },
      detailsChanged: (s) => {
        const v = (1 - size) * s.track.details.progress + size;
        if (v <= 1.001) gsap.set(bar, { scaleX: v });
      },
    });
    addEventListener("resize", () => keen.update());
  }

  const layout = document.querySelector(".dd-media__layout"), strip = layout?.querySelector(".dd-media__slider");
  if (layout && strip) {
    const twin = strip.cloneNode(true);
    twin.setAttribute("aria-hidden", "true");
    layout.append(twin);
    const fit = () => layout.style.setProperty("--duration", Math.round((strip.clientWidth / 1360) * 95) + "s");
    fit();
    addEventListener("resize", fit);
    layout.style.setProperty("--play", "paused");
    const play = (on) => layout.style.setProperty("--play", on ? "running" : "paused");
    ScrollTrigger.create({ trigger: layout, onEnter: () => play(true), onEnterBack: () => play(true), onLeave: () => play(false), onLeaveBack: () => play(false) });
  }
})();
