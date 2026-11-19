/* About page: rounded bottom edge below the hero, speech-bubble dialogue (32ms per character), a panel where stickers pour down and pile up */
(() => {
  const { reduce, holoSvg } = window.dv;

  // Hero bottom edge: as the board bottom rises from the screen bottom, a bright board swells up in a round shape
  document.querySelectorAll("[data-dome-up]").forEach((d) => {
    if (reduce) { d.style.setProperty("--curve", "0.6"); return; }
    let busy = false;
    const f = () => { busy = false; const b = d.parentElement.getBoundingClientRect().bottom; d.style.setProperty("--curve", Math.min(1, Math.max(0, 1 - b / innerHeight)).toFixed(3)); };
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(f); } }, { passive: true });
    f();
  });

  // Speech bubble chat: starts when visible — hide answer → .4s → question typed at 32ms per character → .5s → answer shown → 4.2s → next question
  document.querySelectorAll("[data-chat]").forEach((el) => {
    let lines;
    try { lines = JSON.parse(el.dataset.chat || "[]"); } catch { return; }
    const q = el.querySelector("[data-q]"), a = el.querySelector("[data-a]"), at = a && a.querySelector("span");
    if (!q || !a || lines.length < 1) return;
    if (reduce) { q.textContent = lines[0].q; at.textContent = lines[0].a; a.classList.remove("hide"); return; }
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let on = false;
    const run = async () => {
      for (let i = 0; ; i = (i + 1) % lines.length) {
        a.classList.add("hide"); q.textContent = ""; await wait(400);
        for (const ch of lines[i].q) { q.textContent += ch; await wait(32); }
        await wait(500); at.textContent = lines[i].a; a.classList.remove("hide"); await wait(4200);
      }
    };
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !on) { on = true; run(); } }, { threshold: 0.4 }).observe(el);
  });

  // Pouring stickers: lays our stickers per the data-spots coordinates ([left · top · width cqw, overlap, tilt°, delay s]), and at 15% visible they stick with a .6s bounce
  const kinds = ["pill", "smile", "star", "rating", "bubble"], tones = ["orange", "pink", "blue", "lime", "sun", "ink"];
  const words = ["hey!", "wow", "new", "live", "yes", "hi", "go", "ok"];
  document.querySelectorAll("[data-spill]").forEach((box) => {
    let spots;
    try { spots = JSON.parse(box.dataset.spots || "[]"); } catch { return; }
    spots.forEach(([l, top, w, z, r, d], i) => {
      const k = kinds[i % kinds.length], t = tones[(i * 7) % tones.length], text = k === "rating" ? "0.0" : words[i % words.length];
      const it = document.createElement("div");
      it.className = "dv-spill__it";
      it.style.cssText = `left:${l}cqw;top:${top}cqw;--w:${w}cqw;z-index:${z};--r:${r}deg;--d:${d}s`;
      it.innerHTML = `<span class="dv-holo${t === "ink" ? " dv-holo--dark" : ""}">${holoSvg(k, t, text)}</span>`;
      box.append(it);
    });
    if (reduce) { box.classList.add("in"); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { box.classList.add("in"); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(box);
  });
})();
