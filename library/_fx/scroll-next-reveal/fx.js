(() => {
  kfFx.register("scroll-next-reveal", (el, { options, reduce, scroller }) => {
    const panel = el.querySelector("[data-fx-part=panel]");
    if (!panel) return;
    const ring = el.querySelector("[data-fx-part=ring]");
    const go = String(options.go ?? "true") !== "false" && navigator.webdriver !== true;
    let gone = false;
    gsap.set(panel, { clipPath: "inset(100% 0px 0px 0px)" });
    const st = ScrollTrigger.create({
      trigger: el, scroller: scroller || undefined, start: "top bottom", end: "bottom bottom", scrub: reduce ? false : true,
      onUpdate: (s) => {
        const h = panel.offsetHeight, p = s.progress;
        gsap.set(panel, { clipPath: `inset(${h * (1 - p)}px 0px 0px 0px)` });
        if (ring) ring.style.strokeDashoffset = String(100 - p * 100);
        if (p >= 0.999 && !gone && go) {
          gone = true;
          const ev = new CustomEvent("fx:scroll-next-reveal", { bubbles: true, cancelable: true, detail: { href: options.href } });
          if (el.dispatchEvent(ev) && options.href) location.href = options.href;
        }
        if (p < 0.98) gone = false;
      },
    });
    return () => { st.kill(); gsap.set(panel, { clearProps: "clipPath" }); if (ring) ring.style.strokeDashoffset = ""; };
  });
})();
