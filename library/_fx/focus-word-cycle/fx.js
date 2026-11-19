(() => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const FOCUS = "cubic-bezier(0.2, 0.8, 0.2, 1)";

  kfFx.register("focus-word-cycle", (el, { options, reduce }) => {
    const phrases = [...el.querySelectorAll('[data-fx-part="phrase"]')];
    if (!phrases.length) return;
    const hold = +(options.hold ?? 5) * 1000;
    const outMs = +(options.out ?? 0.38) * 1000, inMs = +(options.in ?? 0.7) * 1000;
    const box = el.closest(options.fit || "h1, h2") || el.parentElement;
    let i = Math.max(0, phrases.findIndex((p) => p.classList.contains("is-on")));
    phrases.forEach((p, n) => p.classList.toggle("is-on", n === i));
    if (reduce || phrases.length < 2) return;

    // If a long word overflows the title cell, only that word shrinks its font size to stay on one line
    const fit = () => {
      const p = phrases[i];
      p.style.fontSize = "";
      const over = box.scrollWidth - box.clientWidth;
      if (over > 0) {
        const w = p.getBoundingClientRect().width, f = parseFloat(getComputedStyle(p).fontSize);
        p.style.fontSize = (f * Math.max(0.35, (w - over - 2) / w)).toFixed(2) + "px";
      }
    };

    const looks = {
      async focus(p) {
        await p.animate([{ filter: "blur(0.15em)", opacity: 0, transform: "scale(1.04)" }, { filter: "blur(0)", opacity: 1, transform: "scale(1)" }], { duration: inMs, easing: FOCUS, fill: "backwards" }).finished;
      },
      async typewriter(p) {
        const text = p.dataset.text ?? (p.dataset.text = p.textContent);
        const decoy = p.dataset.decoy || "";
        p.innerHTML = '<span data-typed></span><span class="fx-caret"></span>';
        const t = p.querySelector("[data-typed]");
        const type = async (s, ms) => { for (const c of s) { if (!alive) return; t.textContent += c; await wait(ms * rnd(0.6, 1.4)); } };
        await wait(150);
        if (decoy) {
          let k = 0;
          while (k < decoy.length && decoy[k] === text[k]) k++;
          await type(decoy, 55); await wait(650);
          while (alive && t.textContent.length > k) { t.textContent = t.textContent.slice(0, -1); await wait(40); }
          await wait(250); await type(text.slice(k), 110);
        } else await type(text, 90);
        await wait(700);
        p.querySelector(".fx-caret")?.remove();
      },
      async gradient(p) {
        await p.animate([{ opacity: 0, transform: "translateY(0.12em)" }, { opacity: 1, transform: "none" }], { duration: 650, easing: FOCUS, fill: "backwards" }).finished;
      },
      async copy(p) {
        await wait(120); p.classList.add("is-selected");
        await wait(700); p.classList.remove("is-selected");
        await wait(300);
      },
    };

    let alive = true, timer = 0, seen = true;
    const next = async () => {
      if (!alive) return;
      if (document.hidden || !seen) return later(800);
      const cur = phrases[i];
      await cur.animate([{ filter: "blur(0)", opacity: 1 }, { filter: "blur(0.12em)", opacity: 0 }], { duration: outMs, easing: "ease-in", fill: "forwards" }).finished.catch(() => {});
      if (!alive) return;
      cur.getAnimations().forEach((a) => a.cancel());
      cur.classList.remove("is-on");
      if (cur.dataset.text) cur.textContent = cur.dataset.text;
      i = (i + 1) % phrases.length;
      const p = phrases[i];
      const look = p.dataset.look || "focus";
      p.classList.add("is-on");
      fit();
      await (looks[look] || looks.focus)(p).catch(() => {});
      later(look === "typewriter" ? Math.round(hold * 0.45) : hold);
    };
    const later = (ms = hold) => { clearTimeout(timer); timer = setTimeout(next, ms); };
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(() => alive && fit());
    later();
    return () => {
      alive = false; clearTimeout(timer); io.disconnect(); ro.disconnect();
      phrases.forEach((p, n) => { p.getAnimations().forEach((a) => a.cancel()); if (p.dataset.text) p.textContent = p.dataset.text; p.style.fontSize = ""; p.classList.toggle("is-on", n === i); });
    };
  });
})();
