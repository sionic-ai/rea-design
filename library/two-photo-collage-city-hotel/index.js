(() => {
  // Room photos — advance by arrow, dots or push (50px), crossfading in .8s ease-in-out. No auto-advance
  document.querySelectorAll(".su-ri__slider").forEach((box) => {
    const slides = [...box.querySelectorAll(".su-ri__slide")];
    const dotsBox = box.querySelector(".su-ri__dots");
    if (slides.length < 2) return;
    const dots = slides.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", `${i + 1}Photo No.`);
      d.addEventListener("click", () => go(i));
      dotsBox?.append(d);
      return d;
    });
    let at = 0;
    const go = (i) => {
      at = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("is-on", k === at));
      dots.forEach((d, k) => d.classList.toggle("is-on", k === at));
    };
    box.querySelector(".is-prev")?.addEventListener("click", () => go(at - 1));
    box.querySelector(".is-next")?.addEventListener("click", () => go(at + 1));
    let x0 = 0, x1 = 0;
    box.addEventListener("touchstart", (e) => { x0 = x1 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchmove", (e) => { x1 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", () => { const d = x0 - x1; if (d > 50) go(at + 1); else if (d < -50) go(at - 1); });
    go(0);
  });

  // About video slot — pressing switches it to a playing indicator (the original embeds a video player)
  const movie = document.querySelector(".su-movie__frame");
  movie?.addEventListener("click", () => movie.classList.toggle("is-playing"));
})();
