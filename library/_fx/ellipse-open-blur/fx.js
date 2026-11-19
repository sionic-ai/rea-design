(() => {
  // When the section top passes the screen top, the oval window opens fully (CSS transition fills in between) · it closes when scrolled back up.
  // Blurs the photo from when the following section has risen 70% up the screen until its bottom edge touches the bottom of the screen (scrub, no original curve = power1.out)
  kfFx.register("ellipse-open-blur", (el, { options, reduce, scroller }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    if (!mask || reduce) return;
    const media = mask.firstElementChild;
    const narrow = matchMedia("(max-width: 767px)").matches;
    const from = narrow ? options["from-narrow"] || options.from : options.from;
    if (from) mask.style.clipPath = `ellipse(${from})`;
    const closed = getComputedStyle(mask).clipPath;
    const open = "ellipse(100% 100% at 50% 50%)";
    const st = ScrollTrigger.create({
      trigger: el, scroller: scroller || undefined, start: options.start || "top top",
      onEnter: () => (mask.style.clipPath = open),
      onLeaveBack: () => (mask.style.clipPath = closed),
    });
    if (st.progress > 0 || st.scroll() > st.start) mask.style.clipPath = open;
    const blur = +(options.blur ?? 16);
    const tw = media && blur > 0
      ? gsap.fromTo(media, { filter: "blur(0px)" }, { filter: `blur(${blur}px)`, ease: options.ease ? kfFx.ease(options.ease, "power1.out") : "power1.out", scrollTrigger: { trigger: el, scroller: scroller || undefined, start: options["blur-start"] || "top -70%", end: options["blur-end"] || "bottom bottom", scrub: true } })
      : null;
    return () => {
      st.kill();
      if (tw) { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(media, { clearProps: "filter" }); }
      mask.style.clipPath = "";
    };
  });
})();
