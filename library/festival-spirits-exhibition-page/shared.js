// Header row hamburger drawer, same-page anchor moves, and the ‹STORY› button below — dot nav movement is handled by the dot-spy-nav part
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ham = document.getElementById("dj-ham");
  const burger = document.querySelector(".dj-burger");
  const setHam = (on) => {
    ham?.classList.toggle("is-open", on);
    burger?.setAttribute("aria-expanded", String(on));
  };
  burger?.addEventListener("click", () => setHam(true));
  ham?.querySelector(".dj-ham__close")?.addEventListener("click", () => setHam(false));
  addEventListener("keydown", (e) => e.key === "Escape" && setHam(false));

  // The original is jQuery animate(2000ms, swing) — swing is 0.5 − cos(πp)/2, the same formula as sine.inOut. On a mobile-device UA the section heading sits 40px above, otherwise 90px above
  const offset = /(iPhone|iPad|iPod|Android)/i.test(navigator.userAgent) ? 40 : 90;
  const pos = { y: 0 };
  let tween = null;
  const glide = (y) => {
    tween?.kill();
    pos.y = scrollY;
    const to = Math.max(0, y);
    if (reduce) return scrollTo(0, to);
    tween = gsap.to(pos, { y: to, duration: 2, ease: "sine.inOut", onUpdate: () => scrollTo(0, pos.y) });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.closest('[data-fx~="dot-spy-nav"]')) return;
    const id = a.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : null;
    if (id && !target) return;
    e.preventDefault();
    setHam(false);
    glide(target ? target.getBoundingClientRect().top + scrollY - offset : -offset);
  });

  // The bottom-center button turns off when the second section (Experience) header crosses the 400px line from the bottom of the screen, and turns on again when scrolled back up
  const cue = document.querySelector(".dj-cue");
  const second = document.getElementById("contents");
  if (cue && second) {
    ScrollTrigger.create({
      trigger: second,
      start: "top bottom-=400",
      end: () => ScrollTrigger.maxScroll(window) + 1,
      onToggle: (self) => cue.classList.toggle("is-hidden", self.isActive),
    });
  }
})();
