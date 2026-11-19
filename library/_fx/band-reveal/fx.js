(() => {
  kfFx.register("band-reveal", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')], covers = [...el.querySelectorAll('[data-fx-part="cover"]')];
    if (!lines.length || reduce) return;
    const delay = +(options.delay ?? 0.4), each = +(options.each ?? 0.25), dur = +(options.dur ?? 0.8);
    // look: grow — the band (::before of the line) grows from -5% on the left with scaleX 0→1 and transparent→opaque, and the whole line turns on text seconds late.
    // While the line is off, the band is hidden too (parent opacity), so when the line turns on the band is already half grown — the CSS keyframes of the Brand Hero copy, as is
    if (options.look === "grow") {
      const ease = kfFx.ease(options.ease || "0.22,1,0.36,1", "power4.out"), text = +(options.text ?? 0.2);
      const a = gsap.fromTo(lines, { "--fx-band": 0 }, { "--fx-band": 1, duration: dur, ease, delay, stagger: { each, from: "start" } });
      const b = gsap.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: dur, ease, delay: delay + text, stagger: { each, from: "start" } });
      return () => { a.revert(); b.revert(); };
    }
    // look: rise — the band (::before) unfolds from the left with scaleX 0→1 (each row delayed by each), and the text inside the row (text children) all three rise together from below by the row height after text seconds over text-dur and turn on.
    // Curve is CSS ease, bar .4s · gap .2s · text 1s delayed by 1s — Studio hero title row (the .title__row transition as is)
    if (options.look === "rise") {
      const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
      const rd = +(options.dur ?? 0.4), re = +(options.each ?? 0.2), rdl = +(options.delay ?? 0);
      const texts = lines.map((l) => l.querySelector('[data-fx-part="text"]')).filter(Boolean);
      const a = gsap.fromTo(lines, { "--fx-band": 0 }, { "--fx-band": 1, duration: rd, ease, delay: rdl, stagger: { each: re, from: "start" } });
      const b = texts.length ? gsap.fromTo(texts, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: +(options["text-dur"] ?? 1), ease, delay: rdl + +(options.text ?? 1) }) : null;
      return () => { a.revert(); b && b.revert(); };
    }
    // look: drop — the band of a vertical-writing line stretches from top to bottom over dur (default .5) (per line each default .2, delay default .1, curve ease default easeInOutQuart),
    // The cover lifts downward over cover-dur (default .9) after cover seconds (default .8 — a strong value from the start) (cover-ease default easeOutQuart). Brand hero vertical slogan, two lines
    if (options.look === "drop") {
      const ease = kfFx.ease(options.ease || "0.76,0,0.24,1", "power4.inOut"), cEase = kfFx.ease(options["cover-ease"] || "0.165,0.84,0.44,1", "power3.out");
      const dd = +(options.dur ?? 0.5), de = +(options.each ?? 0.2), ddl = +(options.delay ?? 0.1);
      const a = gsap.fromTo(lines, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: dd, ease, delay: ddl, stagger: { each: de, from: "start" } });
      const b = covers.length ? gsap.fromTo(covers, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }, { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", duration: +(options["cover-dur"] ?? 0.9), ease: cEase, delay: +(options.cover ?? 0.8), stagger: { each: de, from: "start" } }) : null;
      return () => { a.revert(); b && b.revert(); };
    }
    const a = gsap.to(lines, { duration: dur, ease: "power1.out", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", delay, stagger: { each, from: "start" } });
    const b = covers.length ? gsap.to(covers, { duration: dur, ease: "power1.out", clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", delay: delay + 0.4, stagger: { each, from: "start" } }) : null;
    return () => { a.revert(); b && b.revert(); };
  });
})();
