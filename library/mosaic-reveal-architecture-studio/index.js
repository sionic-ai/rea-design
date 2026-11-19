// Home page motion — wordmark letters rising, About title filling up, dotted box floating, work title swapping, photo mosaic reveal, team pixel strip · sticky title.
(() => {
  const { reduce, splitChars, pixelBand, paint } = AN;
  const mm = gsap.matchMedia();

  // Real photo in the photo slot (<img src>) if none, draws a stand-in picture in the tone of the photo named in the label and runs the same mosaic
  const standIn = (w, h, [sky, mass]) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, sky); g.addColorStop(0.42, sky); g.addColorStop(0.43, mass); g.addColorStop(1, mass);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalAlpha = 0.22;
    for (let i = 0; i < 7; i++) {
      x.fillStyle = i % 2 ? "#000" : "#fff"; // Not skin: window pattern over the stand-in photo (photo content) laid on at 22%
      x.fillRect(w * (0.08 + i * 0.13), h * (0.3 + (i % 3) * 0.08), w * 0.07, h * (0.5 - (i % 3) * 0.06));
    }
    x.globalAlpha = 1;
    return c;
  };

  const mosaic = (box) => {
    const canvas = box.querySelector("canvas"), img = box.querySelector("img");
    const ctx = canvas.getContext("2d");
    const small = document.createElement("canvas"), sctx = small.getContext("2d");
    const state = { progress: reduce ? 1 : 0 };
    let source = null, W = 0, H = 0;
    const draw = () => {
      if (!source) return;
      canvas.width = W; canvas.height = H;
      const l = Math.max(1, Math.round(18 + (W - 18) * state.progress ** 2.5));
      const u = Math.max(1, Math.round((H / W) * l));
      small.width = l; small.height = u;
      sctx.clearRect(0, 0, l, u);
      sctx.drawImage(source, 0, 0, l, u);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(small, 0, 0, l, u, 0, 0, W, H);
    };
    const ready = () => {
      if (img.getAttribute("src")) { source = img; W = img.naturalWidth; H = img.naturalHeight; }
      else {
        const r = box.getBoundingClientRect();
        W = 900; H = Math.round(900 * (r.height / r.width));
        source = standIn(W, H, box.dataset.tone.split(","));
      }
      draw();
    };
    if (img.getAttribute("src") && !img.complete) img.onload = ready; else ready();
    if (reduce) return;
    gsap.set(canvas, { scale: 1.1 });
    gsap.timeline({ scrollTrigger: { trigger: box, start: "top center", toggleActions: "play none none none" } })
      .to(state, { progress: 1, duration: 1.5, onUpdate: draw })
      .to(canvas, { scale: 1, duration: 1.5 }, 0);
  };

  const heroChars = [...document.querySelectorAll(".an-fv__title .an-mask > span")].flatMap(splitChars);
  const teamChars = splitChars(document.querySelector(".an-team__title .an-mask"));
  document.querySelectorAll(".js-pixel").forEach(mosaic);
  pixelBand(document.querySelector(".js-pixel-enter"), { from: paint("--kf-bg"), to: paint("--an-dark"), accent: paint("--an-yellow"), probs: [0.1, 0.2, 0.5, 0.7, 1, 1] });
  pixelBand(document.querySelector(".js-pixel-leave"), { from: paint("--an-dark"), to: paint("--kf-bg"), accent: paint("--an-yellow"), probs: [0.1, 0.2, 0.5, 0.7, 1, 1] });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(heroChars, { scaleY: 0, transformOrigin: "bottom center" });
    gsap.to(heroChars, { scaleY: 1, duration: 1.2, ease: "power4.out", stagger: { each: 0.05, from: "random" } });

    gsap.fromTo(".an-about__fill",
      { clipPath: "polygon(0% 0%, 0% 0%, 0 100%, 0 100%)" },
      { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0 100%)", ease: "none", scrollTrigger: { trigger: ".an-about__title", start: "top 80%", end: "top 20%", scrub: 1.5 } });

    document.querySelectorAll(".js-floating").forEach((el) =>
      gsap.fromTo(el, { y: -8 }, { y: 8, duration: gsap.utils.random(1.2, 1.8), ease: "sine.inOut", repeat: -1, yoyo: true, delay: gsap.utils.random(0, 2) }));

    const w = document.querySelectorAll(".an-works__title .an-mask span");
    gsap.set([w[1], w[3]], { y: "100%" });
    gsap.timeline({ scrollTrigger: { trigger: ".an-works__title", start: "top 65%" } })
      .to([w[1], w[3]], { y: "0%", duration: 1.5, ease: "power3.out", stagger: 0.3 })
      .to([w[0], w[2]], { y: "-100%", duration: 1.5, ease: "power3.out", stagger: 0.3 }, "<");

    gsap.set(teamChars, { yPercent: 100 });
    gsap.to(teamChars, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.05, scrollTrigger: { trigger: ".an-team__title .an-mask", start: "top top" } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".an-about__fill", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0 100%)" });
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
