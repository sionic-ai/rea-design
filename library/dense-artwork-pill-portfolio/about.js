// About: clock hands every 1s (second s/60 · minute m/60+s/60 · 6° · hour h/12+m/60 · 30°), maker expand (collapses when released), the staircase illustration in a sentence (a ball climbs the stairs and the stair color changes, repeating).
(() => {
  DT.page("about", (main) => {
    const offs = [];
    const hands = { s: main.querySelector('[data-hand="s"]'), m: main.querySelector('[data-hand="m"]'), h: main.querySelector('[data-hand="h"]') };
    const time = main.querySelector("[data-time]");
    const tick = () => {
      const d = new Date(), s = d.getSeconds(), m = d.getMinutes();
      hands.s.style.transform = `rotate(${(s / 60) * 360}deg)`;
      hands.m.style.transform = `rotate(${(m / 60) * 360 + (s / 60) * 6}deg)`;
      hands.h.style.transform = `rotate(${(d.getHours() / 12) * 360 + (m / 60) * 30}deg)`;
      time.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };
    tick();
    const iv = setInterval(tick, 1000);
    offs.push(() => clearInterval(iv));

    const credits = main.querySelector("[data-credits]");
    credits.querySelector("[data-credits-open]").addEventListener("click", () => credits.classList.add("is-on"));
    credits.querySelector("ul").addEventListener("mouseleave", () => credits.classList.remove("is-on"));

    const steps = main.querySelector("[data-steps]");
    if (steps && !DT.reduce) {
      const ball = steps.querySelector(".dt-steps__ball"), shape = steps.querySelector(".dt-steps__shape");
      const hues = ["--site-step-a", "--site-hand-s", "--kf-accent-text", "--site-hand"].map((v) => `var(${v})`);
      const tl = gsap.timeline({ repeat: -1 });
      [[24, 44], [68, 20], [118, -6]].forEach(([x, y], i) => {
        tl.to(ball, { attr: { cx: x, cy: y - 22 }, duration: 0.22, ease: "power2.out" }, i * 0.5)
          .to(ball, { attr: { cy: y }, duration: 0.22, ease: "power2.in" }, i * 0.5 + 0.22);
      });
      tl.to(ball, { attr: { cx: 24, cy: 44 }, duration: 0.01 }, 1.5);
      hues.forEach((c, i) => tl.set(shape, { attr: { style: `fill:${c}` } }, i * 0.5));
      offs.push(() => tl.kill());
    }

    return () => offs.forEach((f) => f());
  });
})();
