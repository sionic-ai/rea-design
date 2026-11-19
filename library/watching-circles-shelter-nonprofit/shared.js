// Shared across the site — our Lottie playback (eyed circle, logo dot), phone drawer (slideout), parallax photo, video play button.
// The page transition curtain, rise on entering view, and peeking character are handled by the motion part (_fx).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // As in the original, with a gap it runs once, rests for that long, then restarts, without a gap it loops endlessly
  document.querySelectorAll("[data-lottie]").forEach((el) => {
    const data = window.snLottie?.[el.dataset.lottie];
    if (!data || !window.lottie) return;
    const gap = +el.dataset.loopInterval || 0;
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: !gap && !reduce, autoplay: el.dataset.autoplay !== "false" && !reduce, animationData: JSON.parse(JSON.stringify(data)) });
    if (reduce) anim.goToAndStop(anim.totalFrames - 1, true);
    if (gap) anim.addEventListener("complete", () => setTimeout(() => anim.goToAndPlay(0), gap));
    el.snLottie = anim;
  });

  // Phone drawer — the original uses an empty cover panel as the slideout panel (10ms), and the menu drops in from the top right via CSS
  const menu = document.getElementById("sn-menu"), overlay = document.querySelector(".sn-overlay"), burger = document.querySelector(".sn-burger");
  if (menu && overlay && window.Slideout) {
    const so = new Slideout({ panel: overlay, menu, duration: 10, padding: 0, side: "right", touch: false });
    const sync = () => burger?.setAttribute("aria-expanded", String(so.isOpen()));
    so.on("open", sync); so.on("close", sync);
    burger?.addEventListener("click", () => so.toggle());
    overlay.addEventListener("click", () => so.close());
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) so.close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && so.isOpen()) so.close(); });
  }

  // Parallax photo — the art inside the frame is scaled to 1.2x, and while the frame passes through the screen it flows from −5% to 5%, following 1.5s late
  if (window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-parallax]").forEach((frame) => {
      const img = frame.firstElementChild;
      if (!img) return;
      const y = frame.dataset.y || "10%";
      gsap.set(img, { scale: +(frame.dataset.scale || 1.1) });
      gsap.fromTo(img, { yPercent: -parseFloat(y) }, { yPercent: parseFloat(y), ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: +(frame.dataset.delay || 1.5) } });
    });
  }

  document.querySelectorAll(".sn-movie__play").forEach((b) => b.addEventListener("click", () => { b.hidden = true; b.parentElement.classList.add("is-playing"); }));
})();
