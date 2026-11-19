// Hero: the surroundings (wordmark plate · scroll button · side links) enter with circOut .5s, and the scroll button slides to the About plate in 1s. The poster art is drawn with our own shapes.
(() => {
  const circOut = "0,0.55,0.45,1";
  CustomEase.create("okCircOut", `M0,0 C${circOut} 1,1`);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from("[data-hero-fade]", { opacity: 0, duration: 0.5, ease: "okCircOut", delay: 0.95 });
    gsap.from("[data-hero-rise]", { yPercent: 30, opacity: 0, duration: 0.5, ease: "okCircOut", delay: 0.95 });
    gsap.from("[data-hero-side]", { xPercent: 10, opacity: 0, duration: 0.5, ease: "okCircOut", delay: 0.95 });
  });

  const btn = document.querySelector(".ok-scroll__btn");
  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(window, { scrollTo: { y: "#about" }, duration: OK.reduced ? 0 : 1, ease: "power3.inOut" });
  });

  // Poster — the original is an image file. In the same place, redraws a wave arc (left poster) and a cluster of thin circles (right poster)
  const svg = (body) => `<svg viewBox="0 0 580 323" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;
  const wave = () => {
    let s = "";
    for (let i = 0; i < 6; i++) s += `<path d="M${330 + i * 34} -10 C ${430 + i * 34} 90, ${430 + i * 34} 230, ${330 + i * 34} 340" fill="none" stroke="var(--kf-bg)" stroke-width="${i % 2 ? 7 : 4}"/>`;
    s += `<path d="M520 40 C 600 120, 560 250, 470 300 C 430 230, 450 110, 520 40Z" fill="var(--site-leaf)"/>`;
    s += `<path d="M470 0 C 560 100, 560 230, 480 330" fill="none" stroke="var(--site-poster-arc)" stroke-width="6"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="M${30 + i * 60} 0 l18 -14" stroke="var(--site-poster-arc)" stroke-width="5"/><path d="M${10 + i * 60} 323 l16 -14" stroke="var(--site-poster-arc)" stroke-width="5"/>`;
    return svg(s);
  };
  const rings = () => {
    let s = "", seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) s += `<circle cx="${(200 + rnd() * 420).toFixed(0)}" cy="${(rnd() * 323).toFixed(0)}" r="${(18 + rnd() * 90).toFixed(0)}" fill="none" stroke="var(--kf-ink)" stroke-opacity=".45" stroke-width=".8"/>`;
    return svg(s);
  };
  document.querySelectorAll("[data-poster]").forEach((el) => el.insertAdjacentHTML("afterbegin", el.dataset.poster === "wave" ? wave() : rings()));
})();
