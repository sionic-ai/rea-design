(() => {
  // Hides a one-line name among rows of random characters, then filters it out — random characters scatter in and fade, and while they drain away
  // The gap glyph cells between names narrow so the names close up, and finally the names also exit to the right. When all are out, fx:done (then the curtain is hooked up).
  const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cell = (ch, kind) => `<span class="fx-sieve__mask"><span class="fx-sieve__ch fx-sieve__ch--${kind}">${ch === " " ? "&nbsp;" : ch}</span></span>`;

  kfFx.register("letter-sieve-loader", (root, { options, reduce }) => {
    const brandEl = root.querySelector('[data-fx-part="brand"]');
    const brand = (brandEl?.textContent || "").trim();
    if (!brand) return;
    const words = brand.split(/\s+/);
    const first = words[0], last = words.slice(1).join(" ");
    const rows = Math.max(1, +(options.rows || 5)), len = Math.max(4, +(options.len || 18));
    const gap = Math.max(0, +(options.gap ?? 3)), trail = Math.max(0, +(options.trail ?? 2));
    const close = +(options.close ?? 0.48), hold = +(options.hold ?? 0.4);
    const r = rng(+(options.seed || 763));
    const pick = (n) => Array.from({ length: n }, () => AZ[Math.floor(r() * 26)]);
    const mid = Math.floor(rows / 2);
    const html = [];
    for (let i = 0; i < rows; i++) {
      if (i === mid) {
        html.push(`<div class="fx-sieve__row fx-sieve__row--brand"><span class="fx-sieve__word">${[...first].map((c) => cell(c, "first")).join("")}</span>` +
          `<span class="fx-sieve__gap" data-gap="mid">${pick(gap).map((c) => cell(c, "noise")).join("")}</span>` +
          `<span class="fx-sieve__word">${[...last].map((c) => cell(c, "last")).join("")}</span>` +
          `<span class="fx-sieve__gap" data-gap="trail">${pick(trail).map((c) => cell(c, "noise")).join("")}</span></div>`);
      } else html.push(`<div class="fx-sieve__row">${pick(len + (i % 2 ? 2 : 0)).map((c) => cell(c, "noise")).join("")}</div>`);
    }
    const stage = document.createElement("div");
    stage.className = "fx-sieve";
    stage.setAttribute("aria-hidden", "true");
    stage.innerHTML = html.join("");
    if (brandEl) brandEl.hidden = true;
    root.append(stage);
    root.classList.remove("fx-sieve-done");
    const noise = stage.querySelectorAll(".fx-sieve__ch--noise");
    const firstCh = stage.querySelectorAll(".fx-sieve__ch--first"), lastCh = stage.querySelectorAll(".fx-sieve__ch--last");
    const gMid = stage.querySelector('[data-gap="mid"]'), gTrail = stage.querySelector('[data-gap="trail"]');
    const dim = getComputedStyle(root).getPropertyValue("--fx-dim").trim() || getComputedStyle(root).getPropertyValue("--kf-line").trim() || "currentColor";
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      root.classList.add("fx-sieve-done");
      root.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    const px = (el, v) => `${v * parseFloat(getComputedStyle(el).fontSize)}px`;
    let tl;
    if (reduce) {
      gsap.set(noise, { autoAlpha: 0 });
      gsap.set(gMid, { width: px(gMid, close) });
      gsap.set(gTrail, { width: 0 });
      tl = gsap.timeline().to(root, { autoAlpha: 0, delay: 0.45, duration: 0.25, ease: "none" }).call(done);
    } else {
      gsap.set([noise, firstCh, lastCh], { autoAlpha: 0, xPercent: -120 });
      tl = gsap.timeline({ defaults: { overwrite: "auto" }, delay: +(options.delay ?? 0) });
      tl.to(noise, { autoAlpha: 1, xPercent: 0, duration: 1, ease: "power2.out", stagger: { amount: 0.75, from: "random" } })
        .to([...firstCh, ...lastCh], { autoAlpha: 1, xPercent: 0, duration: 1, ease: "power2.out", stagger: 0.035 }, 0.25)
        .to(noise, { color: dim, duration: 0.95, ease: "sine.inOut", stagger: { amount: 0.85, from: "random" } }, `+=${hold}`)
        .addLabel("sieve", "+=0.25")
        .to(noise, { autoAlpha: 0, xPercent: 120, duration: 1.15, ease: "power2.inOut", stagger: { amount: 0.35, from: "random" } }, "sieve")
        .fromTo(gMid, { width: () => gMid.offsetWidth }, { width: () => px(gMid, close), duration: 1.25, ease: "power2.inOut" }, "sieve")
        .fromTo(gTrail, { width: () => gTrail.offsetWidth }, { width: 0, duration: 1.25, ease: "power2.inOut" }, "sieve")
        .addLabel("out", "+=0.5")
        .to(firstCh, { autoAlpha: 0, xPercent: 120, duration: 0.85, ease: "power2.inOut", stagger: 0.02 }, "out")
        .to(lastCh, { autoAlpha: 0, xPercent: 120, duration: 0.85, ease: "power2.inOut", stagger: 0.02 }, "out")
        .call(done, null, "+=0.35");
    }
    return () => { tl.kill(); stage.remove(); if (brandEl) brandEl.hidden = false; root.classList.remove("fx-sieve-done"); gsap.set(root, { clearProps: "opacity,visibility" }); };
  });
})();
