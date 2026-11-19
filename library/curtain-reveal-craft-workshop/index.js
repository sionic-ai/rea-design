// First page — numbers exactly from the original Homepage.js
(() => {
  const AM = (window.AM = window.AM || { pages: {} });
  const lerp = (a, b, t) => a + (b - a) * t;

  AM.pages.home = (main, { mobile }) => {
    const off = [];
    const hero = main.querySelector(".h-hero__wrap");
    gsap.to(hero, { duration: 1.2, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "power2.inOut" });

    const thumbsSec = main.querySelector(".h-thumbs");
    const thumbs = [...main.querySelectorAll(".h-thumb")];

    thumbs.forEach((t) => {
      const img = t.querySelector(".h-thumb__img");
      const chars = t.querySelectorAll(".split-char");
      ScrollTrigger.create({
        trigger: img, start: "top 65%", end: "bottom bottom", once: true,
        onEnter: () => {
          gsap.to(img, { duration: 1.2, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "power2.inOut" });
          gsap.to(img.querySelector(".am-ph"), { duration: 1.2, scale: 1, ease: "power2.inOut" });
          gsap.to(chars, { y: "0%", duration: 1.2, ease: "power2.out", stagger: 0.025 });
        },
      });
    });

    if (!mobile) {
      // While the thumbnail section enters from the bottom of the screen and rises one screen, the hero’s bottom edge folds upward
      ScrollTrigger.create({
        trigger: thumbsSec, start: "top bottom", end: `+=${innerHeight}`,
        onUpdate: (s) => gsap.set(hero, { clipPath: `polygon(0 0, 100% 0, 100% ${(1 - s.progress) * 100}%, 0% ${(1 - s.progress) * 100}%)` }),
      });
      slider(main);
    }

    // Thumbnails — all drift ±15% by the mouse position within the section, only the hovered photo is clear and its frame opens toward the mouse
    const par = { x: 0, y: 0 };
    let overImg = false;
    const insets = thumbs.map(() => ({ top: 3.5, right: 1.5, bottom: 3.5, left: 1.5 }));
    const setInset = (t, v) => t.style.setProperty("--js-inset", `inset(${v.top}rem ${v.right}rem ${v.bottom}rem ${v.left}rem)`);
    const onSec = (e) => {
      if (overImg) return;
      const r = thumbsSec.getBoundingClientRect();
      gsap.to(par, {
        x: lerp(-15, 15, (e.clientX - r.left) / r.width), y: lerp(-15, 15, (e.clientY - r.top) / r.height), duration: 1,
        onUpdate: () => thumbsSec.style.setProperty("--js-parallax", `translate(${par.x.toFixed(2)}%, ${par.y.toFixed(2)}%)`),
      });
    };
    thumbsSec.addEventListener("mousemove", onSec);
    off.push(() => thumbsSec.removeEventListener("mousemove", onSec));
    thumbs.forEach((t, i) => {
      const img = t.querySelector(".h-thumb__img");
      img.addEventListener("mouseenter", () => {
        overImg = true;
        thumbs.forEach((o) => gsap.to(o, { filter: o === t ? "blur(0px)" : "blur(12px)", duration: 0.5 }));
      });
      img.addEventListener("mouseleave", () => {
        overImg = false;
        thumbs.forEach((o) => gsap.to(o, { filter: "blur(0px)", duration: 0.5 }));
        gsap.to(insets[i], { duration: 1, top: 3.5, right: 1.5, bottom: 3.5, left: 1.5, onUpdate: () => setInset(t, insets[i]) });
      });
      img.addEventListener("mousemove", (e) => {
        const r = img.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(insets[i], { duration: 1, top: lerp(0, 3.5, py), right: lerp(1.5, 0, px), bottom: lerp(3.5, 0, py), left: lerp(0, 1.5, px), onUpdate: () => setInset(t, insets[i]) });
      });
    });

    // Brand name line — the name rises up in turn, and the logo strip sticks to cursor height every frame (clipped outside the line box)
    const clients = main.querySelector(".h-clients");
    gsap.to(main.querySelectorAll(".h-client__name"), { y: "0%", duration: 1.2, ease: "power2.out", stagger: 0.05, scrollTrigger: { trigger: clients, start: "top 65%", end: "bottom bottom" } });
    const bands = [...main.querySelectorAll(".h-logo-band")];
    const rowH = () => main.querySelector(".h-client").getBoundingClientRect().height;
    const fit = () => bands.forEach((b) => gsap.set(b, { height: rowH() }));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(main.querySelector(".h-client"));
    let my = 0, raf = 0;
    const onMove = (e) => { if (!mobile) my = e.clientY; };
    addEventListener("mousemove", onMove, { passive: true });
    const loop = () => { bands.forEach((b) => gsap.set(b, { y: my })); raf = requestAnimationFrame(loop); };
    loop();
    off.push(() => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMove); ro.disconnect(); });

    return () => off.forEach((f) => f());
  };

  // Process slider — the large photo panel on the right is pinned, and each time a step cell on the left passes the screen center the background changes to that photo’s tone in .6s while that step’s photo fills up from below in 1.2s
  function slider(main) {
    const box = main.querySelector(".h-slider");
    const wrap = box.querySelector(".h-slider__wrap");
    const imagesWrap = box.querySelector(".h-images__wrap");
    const bigs = [...box.querySelectorAll(".h-image")];
    const smalls = [...box.querySelectorAll(".h-small")];
    const bg = box.querySelector(".js-bg");
    const bars = [...box.querySelectorAll(".h-bars span")];
    smalls.forEach((s) => {
      const [r, g, b] = AM.rgb(`var(--site-tone-${s.dataset.tone})`, s);
      s.querySelector(".h-small__text").classList.add((r * 299 + g * 587 + b * 114) / 1000 > 128 ? "is-dark" : "is-light");
    });
    const paint = (tone, barTone) => {
      bg.style.backgroundColor = tone;
      bars.forEach((b) => (b.style.backgroundColor = barTone || tone));
    };
    gsap.to(imagesWrap, { duration: 1.2, height: "100%", ease: "power2.inOut", scrollTrigger: { trigger: box, start: "top 50%" } });
    ScrollTrigger.create({ trigger: box, start: "top top", endTrigger: smalls[smalls.length - 1], end: "bottom top", pin: wrap, pinSpacing: false });
    smalls.forEach((s, i) => {
      const last = i === smalls.length - 1, first = i === 0;
      const tone = `var(--site-tone-${s.dataset.tone})`;
      const img = bigs[i].querySelector(".h-image__wrap");
      ScrollTrigger.create({
        trigger: s, start: "top 50%", end: last ? "bottom top" : "bottom bottom",
        onEnter: () => { paint(tone); gsap.to(img, { duration: 1.2, height: "100%", ease: "power2.inOut" }); },
        onLeave: () => (last ? paint("var(--kf-bg)", "var(--kf-line)") : paint(tone)),
        onEnterBack: () => paint(tone),
        onLeaveBack: () => {
          if (first) paint("var(--kf-bg)", "var(--kf-line)");
          else { paint(tone); gsap.to(img, { duration: 1.2, height: "0%", ease: "power2.inOut" }); }
        },
      });
    });
  }
})();
