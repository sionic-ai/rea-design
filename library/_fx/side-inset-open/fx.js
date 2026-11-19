(() => {
  // Background that opens at both sides and sinks — while passing the attached element (blank slot, track), the photo (data-fx-part="image"the masking on both sides of )
  // Opens from side to 0, from 1.03x to 1x, and opacity falls from 1 to dim (scrub 1.2)
  kfFx.register("side-inset-open", (el, { options, reduce, scroller }) => {
    const image = el.querySelector('[data-fx-part="image"]') || (options.target ? document.querySelector(options.target) : null);
    if (!image) return;
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const phone = matchMedia(`(max-width: ${options.phone || 900}px)`).matches;
    const side = phone ? options["phone-side"] || "5.33vw" : options.side || "10.83vw";
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1.2);
    // Make the end mask use the same unit as the start mask — with different units like 25% → 0vw the in-between values jump (corp-brand uses half the center width, 25%)
    const zero = String(side).replace(/^-?[\d.]+/, "0");
    // ease — default is the GSAP default, since the original site lists no curve. For the corporate variant it is none
    const ease = options.ease ? kfFx.ease(options.ease, "power1.inOut") : undefined;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), scrub, start: options.start || "top 0%", end: options.end || "bottom 0%" } })
      .fromTo(image, { clipPath: `inset(0vw ${side})`, scale: +(options.scale ?? 1.03) }, { clipPath: `inset(0vw ${zero})`, scale: 1, opacity: +(options.dim ?? 0.4), ...(ease && { ease }) });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(image, { clearProps: "clipPath,scale,opacity,transform" }); };
  });
})();
