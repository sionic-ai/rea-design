(() => {
  kfFx.register("spin-land-chars", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const saved = el.innerHTML;
    el.setAttribute("aria-label", text.trim());
    el.textContent = "";
    const chars = [];
    text.trim().split(/\s+/).forEach((w, i) => {
      if (i) el.appendChild(document.createTextNode(" "));
      const word = document.createElement("span");
      word.className = "fx-slc-word";
      word.setAttribute("aria-hidden", "true");
      for (const c of w) { const s = document.createElement("span"); s.className = "fx-slc-ch"; s.textContent = c; word.appendChild(s); chars.push(s); }
      el.appendChild(word);
    });
    const ctx = gsap.context(() => {
      if (reduce) return;
      const ease = kfFx.ease("0,0.55,0.45,1", "power2.out");
      const tw = { scale: 1, rotate: 0, opacity: 1, duration: +(options.dur ?? 0.68), ease, stagger: +(options.each ?? 0.04), delay: +(options.delay ?? 0) };
      gsap.set(chars, { scale: +(options.scale ?? 3.5), rotate: +(options.rotate ?? 55), opacity: 0 });
      if (options.on === "view") {
        gsap.registerPlugin(ScrollTrigger);
        gsap.to(chars, { ...tw, scrollTrigger: { scroller, trigger: el, start: "top 85%", toggleActions: "play none none none" } });
      } else gsap.to(chars, tw);
    }, el);
    return () => { ctx.revert(); el.innerHTML = saved; el.removeAttribute("aria-label"); };
  });
})();
