(() => {
  // Original brand: the big number over the curtain climbs by 1~10 every 50~250ms, and at 100 the number and text line slide up (after .3s, .8s power3.inOut),
  // .25s before the end, two curtains with bow-curved bottom edges lift upward (1s expo.inOut, the second one .12s later).
  // The bottom edge of the curtain is M0,0 H100 V(100·(1−p)) Q50,(that spot + 18·sin πp) 0,… — it sags deepest in the middle of the lift
  const NS = "http://www.w3.org/2000/svg";
  const path = (p, bow) => {
    const y = 100 * (1 - p);
    return `M0,0 H100 V${y} Q50,${y + bow * Math.sin(Math.PI * p)} 0,${y} Z`;
  };

  kfFx.register("bow-curtain-loader", (el, { options, reduce }) => {
    const count = el.querySelector('[data-fx-part="count"]');
    const line = el.querySelector('[data-fx-part="line"]');
    const bow = +(options.bow ?? 18);
    const dur = +(options.dur ?? 1);
    const gap = +(options.gap ?? 0.12);
    const out = +(options.out ?? 0.8);
    const loop = +(options.loop ?? 25);
    const counting = options.count !== "off" && count;
    const lock = options.lock !== "off";
    const root = document.documentElement;
    const done = () => {
      el.hidden = true;
      if (lock) root.style.removeProperty("overflow");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    if (reduce) {
      el.dispatchEvent(new CustomEvent("fx:reveal", { bubbles: true }));
      done();
      return () => { el.hidden = false; };
    }
    if (lock) root.style.overflow = "hidden";

    const sheets = ["accent", "main"].map((k) => {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("data-fx-part", `sheet-${k}`);
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      svg.setAttribute("aria-hidden", "true");
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", path(0, bow));
      svg.append(p);
      el.prepend(svg);
      return { svg, p, v: { p: 0 } };
    });
    const [accent, main] = sheets;
    el.classList.add("is-fx-on");

    // Duplicate the text line and scroll half its length once per 25s loop
    let track = null;
    if (line && line.textContent.trim()) {
      track = document.createElement("span");
      track.setAttribute("data-fx-part", "track");
      track.innerHTML = line.innerHTML + line.innerHTML;
      line.replaceChildren(track);
    }
    const lineHtml = line && track ? track.innerHTML.slice(0, track.innerHTML.length / 2) : null;
    const flow = track && loop > 0 ? gsap.to(track, { xPercent: -50, duration: loop, ease: "none", repeat: -1 }) : null;

    let tl = null, timer = 0, n = 0;
    const sweep = () => {
      tl = gsap.timeline({ onComplete: () => { flow?.kill(); done(); } });
      const away = [count, line].filter(Boolean);
      if (away.length) tl.to(away, { yPercent: -60, opacity: 0, duration: out, delay: 0.3, ease: "power3.inOut" });
      tl.addLabel("sweep", away.length ? "-=0.25" : 0);
      tl.to(main.v, { p: 1, duration: dur, ease: "expo.inOut", onUpdate: () => main.p.setAttribute("d", path(main.v.p, bow)) }, "sweep");
      tl.to(accent.v, { p: 1, duration: dur, ease: "expo.inOut", onUpdate: () => accent.p.setAttribute("d", path(accent.v.p, bow)) }, `sweep+=${gap}`);
      tl.call(() => el.dispatchEvent(new CustomEvent("fx:reveal", { bubbles: true })), null, "sweep+=0.35");
    };
    const tick = () => {
      if (n >= 100) return sweep();
      n = Math.min(n + Math.floor(Math.random() * 10) + 1, 100);
      count.textContent = String(n);
      timer = setTimeout(tick, Math.floor(Math.random() * 200) + 50);
    };
    if (counting) tick();
    else sweep();

    return () => {
      clearTimeout(timer);
      tl?.kill();
      flow?.kill();
      sheets.forEach((s) => s.svg.remove());
      if (line && lineHtml != null) line.innerHTML = lineHtml;
      [count, line].filter(Boolean).forEach((x) => gsap.set(x, { clearProps: "transform,opacity" }));
      el.classList.remove("is-fx-on");
      el.hidden = false;
      if (lock) root.style.removeProperty("overflow");
    };
  });
})();
