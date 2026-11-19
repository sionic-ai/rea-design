// Hero wordmark walk · work section parallax · header-line logo drop · work window
(() => {
  const reduce = window.DH?.reduce;
  const head = document.querySelector("[data-head]");
  const banner = document.querySelector("[data-banner]");
  const mark = document.querySelector("[data-banner-mark]");
  const scrub = /iPad|iPhone|iPod/.test(navigator.userAgent) ? 0.8 : true;
  const mm = gsap.matchMedia();
  // When the banner intro phase (3.4s) ends, the header bar appears with a .9s ease-in-out
  setTimeout(() => head.classList.remove("is-hidden"), reduce ? 0 : 3400);

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) { head.classList.add("is-logo"); return; }
    // Hooked 1.1s later so counting starts after the hero settles in place (same as the original)
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      gsap.to(mark, { opacity: 0, ease: "none", scrollTrigger: { trigger: banner, start: "top top", end: "center top-=100", scrub, invalidateOnRefresh: true } });
      gsap.to(mark, { y: 200, scrollTrigger: { trigger: banner, start: "center center-=1px", toggleActions: "play complete none reverse", scrub } });
    }, 1100);
    // After the hero, the header logo drops in from above in .4s
    ScrollTrigger.create({ trigger: banner, start: "bottom top+=64", onEnter: () => head.classList.add("is-logo"), onLeaveBack: () => head.classList.remove("is-logo") });
    return () => clearTimeout(t);
  });

  // Work window: pressing a section opens it carrying that section’s name
  const modal = document.querySelector("[data-modal]");
  if (modal) {
    const title = modal.querySelector("[data-modal-title]");
    const video = modal.querySelector("video");
    const scroller = modal.querySelector("[data-modal-scroll]");
    const open = (sec) => {
      title.textContent = sec.querySelector(".proj__title")?.textContent || title.textContent;
      modal.classList.add("is-open");
      scroller.scrollTop = 0;
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power2.out" });
      window.DH?.lenis?.stop();
      if (!reduce) video.play().catch(() => {});
    };
    const close = () => {
      gsap.to(modal, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power2.out", onComplete: () => modal.classList.remove("is-open") });
      video.pause();
      window.DH?.lenis?.start();
    };
    document.querySelectorAll("[data-proj]").forEach((sec) => {
      sec.addEventListener("click", (e) => { if (!e.target.closest("a")) open(sec); });
      sec.addEventListener("keydown", (e) => { if (e.key === "Enter") open(sec); });
    });
    modal.querySelector("[data-modal-close]").addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });
    // Still flip: tapping the left or right 20% zone moves one frame at a time
    const track = modal.querySelector("[data-stills-track]");
    const stills = [...track.children];
    let at = 0;
    track.addEventListener("click", (e) => {
      const r = track.getBoundingClientRect(), p = (e.clientX - r.left) / r.width;
      if (p >= 0.8 && at < stills.length - 1) at++;
      else if (p <= 0.2 && at > 0) at--;
      else return;
      track.scrollTo({ left: stills[at].offsetLeft - stills[0].offsetLeft, behavior: reduce ? "auto" : "smooth" });
    });
  }
})();
