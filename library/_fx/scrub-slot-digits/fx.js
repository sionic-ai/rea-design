(() => {
  // Each slot needs a different band length so the slots spin at different speeds on the same scroll and then stop all at once
  kfFx.register("scrub-slot-digits", (el, { options, reduce, scroller }) => {
    const from = String(options.from ?? el.textContent).trim();
    if (!from) return;
    const to = String(options.to ?? "1").trim().padStart(from.length, " ").slice(-from.length);
    const saved = [...el.childNodes];
    const spins = Math.max(0, Math.round(+(options.spins ?? 2)));
    const n = from.length, mid = (n - 1) / 2;
    const cols = [...from].map((f, i) => {
      const turns = Math.max(0, spins - Math.round(Math.abs(i - mid)));
      const seq = [f];
      const start = /\d/.test(f) ? +f : 0;
      for (let k = 1; k <= turns * 10; k++) seq.push((start + k) % 10);
      seq.push(to[i] === " " ? " " : to[i]);
      const c = document.createElement("span");
      c.setAttribute("data-fx-part", "col");
      c.innerHTML = seq.map((d) => `<span>${d}</span>`).join("");
      return { c, len: seq.length, outer: i === 0 || i === n - 1, i };
    });
    el.replaceChildren(...cols.map((x) => x.c));
    if (reduce) {
      cols.forEach((x) => gsap.set(x.c, { yPercent: (-100 * (x.len - 1)) / x.len }));
      return () => el.replaceChildren(...saved);
    }
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      if (options.enter !== "0") gsap.fromTo(cols.map((x) => x.c), { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: el, scroller, start: "top 90%", toggleActions: "play none none reset" } });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top 80%", end: options.end || "bottom 20%", scrub: true } });
      cols.forEach((x) => tl.fromTo(x.c, { yPercent: 0 }, { yPercent: (-100 * (x.len - 1)) / x.len, duration: x.outer ? 0.8 : 1, ease: "power3.inOut" }, x.i * 0.02 + (x.outer ? 0 : 0.01)));
    }, el);
    return () => { ctx.revert(); el.replaceChildren(...saved); };
  });
})();
