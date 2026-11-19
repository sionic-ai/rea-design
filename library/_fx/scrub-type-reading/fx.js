(() => {
  // Binds to scroll a timeline that types letters in order for each chunk (child span). If a chunk has data-reading, it types the reading sound first and swaps to the real text .1s later.
  // Keep only the contiguous chunk that becomes the same text as keep once fully typed, and sink the rest into a faded text color — a scene where only song titles remain in the lyrics
  kfFx.register("scrub-type-reading", (el, { options, reduce, scroller }) => {
    const chunks = [...el.children].filter((c) => c.tagName === "SPAN");
    if (!chunks.length) return;
    const was = el.innerHTML;
    const full = chunks.map((c) => c.textContent);
    const keep = (options.keep || "").trim();
    const min = +(options.min ?? 0.01), max = +(options.max ?? 0.05), swap = +(options.swap ?? 0.1);
    const dim = () => getComputedStyle(document.documentElement).getPropertyValue("--kf-dim").trim();

    // Finds a contiguous chunk whose text exactly matches keep — whitespace chunks count as characters too
    const settle = () => {
      let from = -1, to = -1;
      for (let i = 0; i < chunks.length && from < 0; i++) {
        let acc = "";
        for (let j = i; j < chunks.length; j++) {
          acc += full[j];
          if (acc === keep) { from = i; to = j; break; }
          if (acc.length >= keep.length) break;
        }
      }
      chunks.forEach((c, i) => c.classList.toggle("is-kept", from >= 0 && i >= from && i <= to));
      const rest = chunks.filter((c) => !c.classList.contains("is-kept") && c.textContent.trim());
      if (!rest.length) return null;
      return reduce ? gsap.set(rest, { color: dim() }) : gsap.to(rest, { color: dim(), duration: 0.1, stagger: { amount: 0.5, from: "random" } });
    };

    if (reduce) { const t = settle(); return () => { t?.kill?.(); el.innerHTML = was; }; }
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({ paused: true });
    chunks.forEach((c, i) => {
      const reading = c.dataset.reading || "";
      // Each character’s length is a random .01-step value between min~max per chunk (original gsap.utils.random(.01, .05, .01))
      const per = gsap.utils.random(min, max, 0.01);
      const type = (text) => {
        const s = { n: 0 };
        tl.to(s, { n: text.length, duration: per * text.length, ease: "none", onUpdate: () => { c.textContent = text.slice(0, Math.round(s.n)); } });
      };
      c.textContent = "";
      if (!reading) type(full[i]);
      else { type(reading); tl.call(() => { c.textContent = full[i]; }, null, `+=${swap}`); }
    });
    let settled = null;
    if (keep) tl.call(() => { settled = settle(); });
    const st = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }),
      start: options.start || "top-=20% bottom", end: options.end || "center center",
      scrub: +(options.lag ?? 0.6) || true, once: true, animation: tl,
    });
    return () => { st.kill(); tl.kill(); settled?.kill?.(); el.innerHTML = was; };
  });
})();
