// One case — the cover photo shrinks from 1.12x to 1 while flowing upward (scroll group), and the screen strip stays pinned while pushed horizontally (current number · bar).
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Cover entrance — brightens in .4s, holds for 1s, then the edge frame retracts over 2.9s (original load: fade .4 · hold 1 · enter 2.9)
    gsap.timeline()
      .fromTo(".ap-case__cover", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" })
      .fromTo(".ap-case__cover", { clipPath: "inset(6% 6% 6% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2.9, ease: "power2.out" }, 1.4);
    gsap.fromTo(".ap-case__cover", { scale: 1.12, yPercent: 0 }, { scale: 1, yPercent: 12, ease: "none", scrollTrigger: { trigger: ".ap-case__hero", start: "top top", end: "bottom top", scrub: true } });
  });
  mm.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
    const rail = document.querySelector(".ap-case__rail");
    const track = rail.querySelector(".ap-case__rail-track");
    const now = rail.querySelector(".ap-case__rail-now");
    const bar = rail.querySelector(".ap-case__rail-bar");
    const n = track.children.length;
    gsap.to(track, {
      x: () => -(track.scrollWidth - innerWidth), ease: "none",
      scrollTrigger: {
        trigger: rail, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (s) => { bar.style.setProperty("--p", s.progress.toFixed(3)); now.textContent = String(Math.min(n, 1 + Math.floor(s.progress * n))).padStart(2, "0"); },
      },
    });
  });
})();

// Section button — pressing it pushes the strip to that screen cell (the current cell darkens in .15s)
(() => {
  const btns = [...document.querySelectorAll(".ap-case__chapters button:not(.ap-case__film)")];
  const rail = document.querySelector(".ap-case__rail");
  const set = (i) => btns.forEach((b, k) => b.classList.toggle("is-current", k === i));
  btns.forEach((b, i) => b.addEventListener("click", () => {
    set(i);
    // Phone has no pinned band, so only the tapped cell turns on and nothing rolls
    if (!rail || innerWidth <= 760) return;
    const top = rail.getBoundingClientRect().top + scrollY;
    const y = top + (rail.offsetHeight - innerHeight) * (i / Math.max(1, btns.length - 1));
    window.AP?.lenis ? window.AP.lenis.scrollTo(y) : scrollTo(0, y);
  }));
  const film = document.querySelector(".ap-case__film");
  film?.addEventListener("click", () => { film.textContent = film.textContent === "Play film" ? "Pause" : "Play film"; });
  const phonePlay = document.querySelector(".ap-case__phone-play");
  phonePlay?.addEventListener("click", () => { phonePlay.textContent = phonePlay.textContent === "Play film" ? "Pause film" : "Play film"; });
  // Scrolling changes the current cell only on wide screens with a fixed strip — on phones only on press
  if (rail) gsap.matchMedia().add("(min-width: 761px)", () => { ScrollTrigger.create({ trigger: rail, start: "top top", end: "bottom bottom", onUpdate: (s) => set(Math.min(btns.length - 1, Math.floor(s.progress * btns.length))) }); });
})();
