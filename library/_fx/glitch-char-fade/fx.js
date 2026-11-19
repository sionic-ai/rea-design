// Splits text lines into words and letters, and when the panel is 30% visible (only when scrolling down), letters light up one by one at 28ms intervals, flashing the accent color several times, and words blink at 39ms intervals.
// Turns off once the panel leaves the screen while going up, so it turns on again on coming back down (original data-text-fade-in values)
(() => {
  kfFx.register("glitch-char-fade", (el, { options, reduce }) => {
    const text = el.textContent.trim();
    if (!text) return;
    const original = el.innerHTML;
    const each = +(options.each ?? 28), word = +(options.word ?? 39), lead = +(options.delay ?? 0);
    el.textContent = "";
    text.split(/\s+/).forEach((w, wi, all) => {
      const ws = document.createElement("span");
      ws.setAttribute("data-fx-part", "word");
      ws.style.setProperty("--fx-word", wi + 1);
      [...w].forEach((c, ci) => {
        const cs = document.createElement("span");
        cs.setAttribute("data-fx-part", "char");
        cs.style.setProperty("--fx-char", ci + 1);
        cs.textContent = c;
        ws.appendChild(cs);
      });
      el.appendChild(ws);
      if (wi < all.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.style.setProperty("--fx-each", `${each}ms`);
    el.style.setProperty("--fx-word-each", `${word}ms`);
    if (reduce || options.on === "now") { el.classList.add("is-inview"); return () => { el.innerHTML = original; el.classList.remove("is-inview"); }; }
    if (options.on === "manual") return () => { el.innerHTML = original; el.classList.remove("is-inview"); };

    let lastY = scrollY, dir = "down", timer = 0;
    const onScroll = () => { const y = scrollY; dir = y > lastY ? "down" : y < lastY ? "up" : dir; lastY = y; };
    addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && dir === "down") { clearTimeout(timer); timer = setTimeout(() => el.classList.add("is-inview"), lead * 1000); }
      if (!en.isIntersecting && dir === "up") { clearTimeout(timer); el.classList.remove("is-inview"); }
    }, { threshold: +(options.threshold ?? 0.3) });
    io.observe(el);
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      el.classList.remove("is-inview");
      el.innerHTML = original;
    };
  });
})();
