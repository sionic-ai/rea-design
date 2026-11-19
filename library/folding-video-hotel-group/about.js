(() => {
  const { lenis, isSp, reduce } = window.UDS;

  // Brand video curtain — the original shows a video thumbnail and swaps to the player on press. Here, a same-size placeholder
  const modal = document.querySelector("[data-film-modal]");
  const setFilm = (on) => { modal.classList.toggle("-open", on); modal.setAttribute("aria-hidden", String(!on)); on ? lenis?.stop() : lenis?.start(); };
  document.querySelector("[data-film-open]").addEventListener("click", () => setFilm(true));
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-film-close]")) setFilm(false); });
  addEventListener("keydown", (e) => e.key === "Escape" && setFilm(false));

  // Pinned three photos — split the overall progress into thirds, the second and third photos cover upward from the bottom (clip-path) during the first 40% of their share,
  // Text is darkest at the center of its own share (transparent within .1 before and after), flowing up 2.5% → -1.5%
  const sec = document.querySelector("[data-about-slide]");
  if (!sec || isSp || reduce) return;
  const imgs = [...sec.querySelectorAll("[data-slide-img]")];
  const texts = [...sec.querySelectorAll("[data-slide-text]")];
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const map = (n, a, b, c, d, cl = true) => { if (cl) { if (n <= a) return c; if (n >= b) return d; } return c + ((n - a) * (d - c)) / (b - a); };
  let start = 0, end = 1;
  const measure = () => { start = sec.offsetTop; end = sec.offsetHeight - imgs[0].offsetHeight; };
  const run = () => {
    const y = lenis ? lenis.scroll : scrollY;
    const progress = clamp(((y - start) / end) * 100, 0, 100);
    const part = 100 / imgs.length;
    const ratio = imgs.map((_, i) => clamp((progress - part * i) / part, 0, 1));
    imgs.forEach((img, i) => {
      if (!i) return;
      gsap.to(img, { clipPath: `inset(${100 - clamp(ratio[i] * 250, 0, 100)}% 0% 0% 0%)`, duration: 0.05, ease: "expo.out", overwrite: true });
    });
    texts.forEach((t, i) => {
      const off = Math.abs(0.5 - ratio[i]);
      gsap.to(t, { opacity: map(0.5 - off, 0, 0.4, 0, 1), yPercent: map(ratio[i], 0, 0.5, 2.5, -1.5, false), duration: 0.05, ease: "expo.out", overwrite: true });
    });
  };
  measure();
  run();
  lenis ? lenis.on("scroll", run) : addEventListener("scroll", run, { passive: true });
  addEventListener("resize", () => { measure(); run(); });
  addEventListener("load", () => { measure(); run(); });
})();
