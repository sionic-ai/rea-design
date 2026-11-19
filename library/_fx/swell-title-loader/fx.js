// Title-swelling loader: on an accent-color panel a three-row grid stands up, and while thin lines between the rows are drawn in turn, the text lines rise from below.
// After hold seconds the center line opens to 60% of the screen while the title swells to 20% of the screen width (1.2s), the panel rises half a screen and the lower half is cut off,
// It darkens and clears — meanwhile the page rises from below. Emits fx:lift when it starts clearing and fx:done when fully cleared — Brand
(() => {
  kfFx.register("swell-title-loader", (host, { options, reduce }) => {
    const grid = host.querySelector('[data-fx-part="grid"]') || host;
    const rows = [...host.querySelectorAll('[data-fx-part="row"]')];
    const title = host.querySelector('[data-fx-part="title"]');
    const splits = [...host.querySelectorAll('[data-fx-part="split"]'), title].filter(Boolean);
    const fades = [...host.querySelectorAll('[data-fx-part="fade"]')];
    const page = options.page ? document.querySelector(options.page) : null;
    const emit = (type) => host.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    if (reduce) {
      host.style.visibility = "hidden";
      emit("fx:lift"); emit("fx:done");
      return () => { host.style.visibility = ""; };
    }
    const hold = +(options.hold ?? 1), size = +(options.size ?? 20);
    const swell = +(options.swell ?? 1.2), lift = +(options.lift ?? 1.2), rise = +(options.rise ?? 1);
    const smooth = kfFx.ease(options.ease || "0.5,0,0,1", "power3.inOut");
    const expo = kfFx.ease("0.19,1,0.22,1", "expo.out"), soft = kfFx.ease("0.215,0.61,0.355,1", "power2.out");
    rows.forEach((r, i) => r.style.setProperty("--fx-i", i));
    if (page) gsap.set(page, { yPercent: 100, force3D: true });
    const splitters = [];
    let tl = null, alive = true;

    const start = async () => {
      await document.fonts?.ready;
      if (!alive) return;
      host.classList.add("is-fx-ready");
      gsap.to(grid, { opacity: 1, duration: 0.5, ease: smooth });
      splits.forEach((el) => {
        let lines = [el];
        if (window.SplitText) {
          const s = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "fx-line", aria: "none" });
          splitters.push(s);
          lines = s.lines;
        }
        gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.15, ease: expo, stagger: 0.1 });
      });
      fades.forEach((el) => gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.75, ease: soft, delay: 0.5 + 0.1 * [...el.parentElement.children].indexOf(el) }));

      const H = innerHeight, wide = innerWidth >= +(options.wide ?? 1000);
      const band = wide ? [0.2, 0.6, 0.2] : [0.25, 0.5, 0.25];
      tl = gsap.timeline({ delay: hold });
      tl.to(grid, { gridTemplateRows: band.map((b) => `${b * H}px`).join(" "), duration: 1, ease: smooth }, 0);
      if (title) tl.to(title, { fontSize: innerWidth * size / 100, duration: swell, ease: smooth, onStart: () => host.classList.add("is-fx-swell") }, 0);
      else tl.add(() => host.classList.add("is-fx-swell"), 0);
      tl.addLabel("hide")
        .add(() => emit("fx:lift"), "hide")
        .to(host, { yPercent: -50, duration: lift, ease: smooth, force3D: true }, "hide")
        .fromTo(host, { clipPath: "inset(0% 0% 0% 0%)", filter: "brightness(1)" }, { clipPath: "inset(0% 0% 50% 0%)", filter: "brightness(0.5)", duration: rise, ease: smooth }, "hide");
      if (page) tl.to(page, { yPercent: 0, duration: rise, ease: smooth, onComplete: () => gsap.set(page, { clearProps: "transform" }) }, "hide");
      tl.add(() => { host.style.visibility = "hidden"; emit("fx:done"); });
    };
    start();

    return () => {
      alive = false;
      tl?.kill();
      splitters.forEach((s) => s.revert());
      const els = [host, grid, title, ...fades].filter(Boolean);
      gsap.killTweensOf(els);
      gsap.set(els, { clearProps: "all" });
      if (page) gsap.set(page, { clearProps: "transform" });
      host.classList.remove("is-fx-ready", "is-fx-swell");
      host.style.visibility = "";
    };
  });
})();
