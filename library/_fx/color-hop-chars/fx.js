// Colors may be oklch, which GSAP cannot read, so only one progress value runs with bounce and is mixed with color-mix
(() => {
  kfFx.register("color-hop-chars", (el, { options, reduce, scroller }) => {
    const lines = el.querySelectorAll("[data-fx-part=line]").length ? [...el.querySelectorAll("[data-fx-part=line]")] : [el];
    if (!lines.some((l) => l.textContent.trim())) return;
    const originals = lines.map((l) => l.innerHTML);
    lines.forEach((l) => {
      l.innerHTML = l.textContent.trim().split(/\s+/).map((w) => `<span class="fx-hop-w">${[...w].map((c) => `<span class="fx-hop-c">${c}</span>`).join("")}</span>`).join(" ");
    });
    const restore = () => lines.forEach((l, i) => { l.innerHTML = originals[i]; });
    if (reduce) return restore;
    const each = +(options.each ?? 0.02), up = +(options.up ?? 0.4), down = +(options.down ?? 0.5);
    const tilt = +(options.tilt ?? 5), drift = +(options.drift ?? 5), delay = +(options.delay ?? 0);
    const [lo, hi] = String(options.rise ?? "10,20").split(",").map(Number);
    const px = options.unit === "px";
    const cs = getComputedStyle(el);
    const paints = options.paint === "none" ? [] : [1, 2, 3, 4, 5, 6, 7].map((n) => cs.getPropertyValue(`--fx-paint-${n}`).trim()).filter(Boolean);
    const keep = options.keep === "on";
    const tweens = [];
    let st = null, timer = 0;
    const play = () => {
      let n = 0;
      lines.forEach((line) => {
        const final = getComputedStyle(line).color;
        line.querySelectorAll(".fx-hop-c").forEach((c) => {
          const paint = paints.length ? paints[Math.floor(Math.random() * paints.length)] : "";
          if (paint) c.style.color = paint;
          const lift = -(Math.random() * (hi - lo) + lo), side = Math.random() * drift * 2 - drift, rot = Math.random() * tilt * 2 - tilt;
          const to = px ? { x: side, y: lift } : { xPercent: side, yPercent: lift };
          const from = px ? { x: 0, y: 0 } : { xPercent: 0, yPercent: 100 };
          tweens.push(gsap.fromTo(c, { ...from, rotation: 0 }, {
            ...to, rotation: rot, duration: up, ease: "power1.out", delay: delay + each * n++,
            onComplete: () => {
              const mix = { p: 0 };
              tweens.push(gsap.to(c, { ...(px ? { x: 0, y: 0 } : { xPercent: 0, yPercent: 0 }), rotation: 0, duration: down, ease: "bounce.out" }));
              if (paint && !keep) tweens.push(gsap.to(mix, { p: 1, duration: down, ease: "bounce.out", onUpdate: () => { c.style.color = `color-mix(in srgb, ${final} ${Math.min(100, mix.p * 100)}%, ${paint})`; }, onComplete: () => { c.style.color = ""; } }));
            },
          }));
        });
      });
    };
    if (options.on === "enter") {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, scroller, onEnter: play });
    } else timer = setTimeout(play, 0);
    return () => { clearTimeout(timer); st?.kill(); tweens.forEach((t) => t.kill()); restore(); };
  });
})();
