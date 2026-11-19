// First page — showreel (grows, pins, starts playing), fill-in-the-blank letter (cell width grows and shrinks with text)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Showreel — original Reel: at 1024 and up 55% → section width (scrub .5, while the section top moves from the bottom of the screen → top), then pinned for .9 of the screen height while filling the screen (.82 power2.inOut + .18 hold).
     Phone: .7x → screen width (section top edge 80% → center). Plays when over 55% visible, on first play the center ball shrinks with back.in and the curtain lifts as the video goes 1.12 → 1 */
  const stage = document.querySelector("[data-reel-stage]");
  const reel = stage?.querySelector("[data-reel]");
  if (stage && reel) {
    const veil = reel.querySelector(".dk-reel__veil"), cue = reel.querySelector(".dk-reel__cue"), media = reel.querySelector(".dk-reel__media");
    const toggle = reel.querySelector(".dk-reel__toggle");
    let userPaused = reduce, started = false;
    const sync = () => {
      const paused = reel.hasAttribute("data-paused");
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "Video playback" : "Video paused");
      document.dispatchEvent(new Event("dk:video"));
    };
    const start = () => {
      if (started) return;
      started = true;
      if (reduce) { reel.classList.add("is-started"); return; }
      gsap.timeline({ onComplete: () => reel.classList.add("is-started") })
        .to(cue, { scale: 0.4, opacity: 0, duration: 0.45, ease: "back.in(2)" }, 0)
        .to(veil, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0.1)
        .fromTo(media, { scale: 1.12 }, { scale: 1, duration: 1.4, ease: "power3.out" }, 0.1);
    };
    const play = () => { reel.removeAttribute("data-paused"); start(); sync(); };
    const pause = () => { reel.setAttribute("data-paused", ""); sync(); };
    toggle.addEventListener("click", (e) => { e.stopPropagation(); if (reel.hasAttribute("data-paused")) { userPaused = false; play(); } else { userPaused = true; pause(); } });
    reel.addEventListener("click", () => toggle.click());
    const io = new IntersectionObserver(([e]) => { if (!e) return; if (e.isIntersecting) { if (e.intersectionRatio >= 0.55 && !userPaused) play(); } else pause(); }, { threshold: [0, 0.55] });
    window.dkEntered(() => io.observe(reel));
    sync();

    if (!reduce) {
      const grad = stage.closest(".dk-home-grad"), section = stage.parentElement;
      const RATIO = 508 / 1312, FROM = 0.55, HOLD = 0.9, REST = 0.18;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        let w = 0, h = 0, vw = 0, vh = 0;
        const measure = () => {
          vw = document.documentElement.clientWidth; vh = innerHeight;
          w = stage.clientWidth; h = w * RATIO;
          const pull = (h - vh) / 2;
          stage.style.setProperty("--reel-pull", `${pull}px`);
          grad?.style.setProperty("--reel-extra", `${vh * HOLD - pull}px`);
        };
        stage.classList.add("is-growing");
        measure();
        ScrollTrigger.addEventListener("refreshInit", measure);
        const grow = gsap.fromTo(reel, { width: () => w * FROM, height: () => h * FROM }, { width: () => w, height: () => h, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "top top", scrub: 0.5, invalidateOnRefresh: true, refreshPriority: 1 } });
        const fill = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: stage, start: "top top", end: () => `+=${innerHeight * HOLD}`, pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1 } })
          .fromTo(reel, { width: () => w, height: () => h }, { width: () => vw, height: () => vh, duration: 1 - REST, ease: "power2.inOut", immediateRender: false })
          .to({}, { duration: REST });
        return () => {
          grow.scrollTrigger?.kill(); grow.kill(); fill.scrollTrigger?.kill(); fill.kill();
          ScrollTrigger.removeEventListener("refreshInit", measure);
          stage.classList.remove("is-growing");
          stage.style.removeProperty("--reel-pull");
          grad?.style.removeProperty("--reel-extra");
          gsap.set(reel, { clearProps: "width,height" });
        };
      });
      mm.add("(max-width: 1023.98px)", () => {
        gsap.fromTo(reel, { scale: 0.7 }, { scale: () => document.documentElement.clientWidth / reel.offsetWidth, ease: "none", scrollTrigger: { trigger: section, start: "top 80%", end: "center center", scrub: 0.5, invalidateOnRefresh: true } });
        return () => gsap.set(reel, { clearProps: "scale" });
      });
    }
  }

  /* Fill-in-the-blank letter — when the text changes, measure the mirror text width and stretch or shrink to that width (.38s if it changes by over 40px, else .12s) */
  document.querySelectorAll(".dk-slot").forEach((slot) => {
    const input = slot.querySelector("input"), mirror = slot.querySelector(".dk-slot__mirror");
    if (!input || !mirror) return;
    let anim = null, last = 0;
    const fit = (animate = true) => {
      const from = anim?.playState === "running" ? mirror.getBoundingClientRect().width : last;
      anim?.cancel();
      mirror.textContent = input.value || input.placeholder;
      const to = mirror.getBoundingClientRect().width;
      last = to;
      const d = Math.abs(to - from);
      if (!animate || d < 1 || reduce) return;
      anim = mirror.animate([{ width: `${from}px`, minWidth: 0 }, { width: `${to}px`, minWidth: 0 }], { duration: d > 40 ? 380 : 120, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    };
    input.addEventListener("input", () => fit());
    addEventListener("resize", () => { if (anim?.playState !== "running") last = mirror.getBoundingClientRect().width; });
    fit(false);
  });
})();
