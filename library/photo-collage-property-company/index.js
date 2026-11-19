// First page — two hero videos played in sync, the video stage of the About section (window opening, darkness, video flow, title entrance, end blur clearing), photo strip following scroll speed
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OK = "(prefers-reduced-motion: no-preference)";

  // ---------- Two hero videos — like the original, wait until both load then play together (3s at the latest), and sync the second to the first’s time within .1s ----------
  const vids = [...document.querySelectorAll("[data-hero-video]")];
  if (vids.length === 2) {
    const [a, b] = vids;
    let synced = false;
    const ready = (v) => v.readyState >= 3;
    const start = () => { if (synced) return; synced = true; vids.forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); }); };
    vids.forEach((v) => { v.pause(); v.addEventListener("canplay", () => vids.every(ready) && start()); });
    if (vids.every(ready)) start();
    setTimeout(start, 3000);
    a.addEventListener("timeupdate", () => {
      if (!synced || a.paused || b.paused) return;
      const d = a.duration;
      if (!isFinite(d) || d <= 0) return;
      let gap = (b.currentTime - a.currentTime) % d;
      if (gap > d / 2) gap -= d;
      if (gap < -d / 2) gap += d;
      if (Math.abs(gap) > 0.1) b.currentTime = a.currentTime;
    });
  }

  // ---------- About section ----------
  const about = document.querySelector("[data-about]");
  if (about) {
    const stage = about.querySelector(".gh-about__stage");
    const frame = about.querySelector("[data-about-frame]");
    const video = about.querySelector("[data-about-video]");
    const heading = about.querySelector("[data-about-heading]");
    const reader = about.querySelector(".gh-about__reader");
    const blur = about.querySelector("[data-about-blur]");
    const shade = about.querySelector("[data-about-shade]");
    const base = about.querySelector("[data-about-base]");
    const surround = about.querySelector("[data-about-surround]");
    const cssNum = (k, d) => parseFloat(getComputedStyle(about).getPropertyValue(k)) || d;
    const scale = () => cssNum("--about-scale", 0.5), dark = () => cssNum("--about-dark", 0.4);
    const headerH = () => document.querySelector(".gh-header")?.offsetHeight || 100;
    const mm = gsap.matchMedia();
    mm.add(`${OK} and (min-width: 768px)`, () => {
      // Video window — from margins of header height, 64 left and right, 40 bottom (at 1440) to full screen (over .5 of a screen once the section top reaches the top of the screen)
      const b = () => frame.offsetWidth / 1440;
      gsap.fromTo(frame, { clipPath: () => `inset(${headerH()}px ${64 * b()}px ${40 * b()}px ${64 * b()}px)` }, {
        clipPath: "inset(0px 0px 0px 0px)", ease: "none",
        scrollTrigger: { trigger: stage, start: "top top", end: () => `top -${scale() * 100}%`, scrub: true, invalidateOnRefresh: true },
      });
      // Next, blur, a black veil and the background spread across the screen over .4
      gsap.fromTo([blur, shade, base], { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: stage, start: () => `top -${scale() * 100}%`, end: () => `top -${(scale() + dark()) * 100}%`, scrub: true, invalidateOnRefresh: true },
      });
      // A vertical video longer than the window flows all the way up while stuck, and is pushed back by the same amount as the section leaves, so it looks paused on screen
      const g = { pinned: 1, vh: 1 };
      const measure = () => { g.vh = innerHeight; g.pinned = Math.max(stage.offsetHeight - g.vh, 1); };
      measure();
      const over = () => Math.max(video.offsetHeight - frame.offsetHeight, 0);
      const curve = (u) => {
        const w = u * (g.pinned + g.vh);
        if (w <= g.pinned) return w / g.pinned;
        const S = Math.max(over(), 1);
        return 1 - (1 - S / g.pinned) * (w - g.pinned) / S;
      };
      gsap.fromTo(video, { y: 0 }, {
        y: () => -over(), ease: curve,
        scrollTrigger: { trigger: stage, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true, onRefresh: measure },
      });
      // The title appears in .8s when it reaches its pinned spot and hides in .4s when it goes back. A bottom margin equal to the reading window height is added so it leaves along with the window
      const fit = () => { heading.style.marginBottom = `${Math.max(reader.clientHeight - heading.offsetHeight, 0)}px`; };
      fit();
      ScrollTrigger.addEventListener("refreshInit", fit);
      gsap.set(heading, { autoAlpha: 0 });
      const show = ScrollTrigger.create({
        trigger: heading, start: () => `top ${parseFloat(getComputedStyle(heading).top) || 0}px`, invalidateOnRefresh: true,
        onEnter: () => gsap.to(heading, { autoAlpha: 1, duration: 0.8, ease: "power2.out", overwrite: true }),
        onLeaveBack: () => gsap.to(heading, { autoAlpha: 0, duration: 0.4, ease: "power2.out", overwrite: true }),
      });
      // While the section bottom edge goes from the screen bottom to the 20% line: blur 32 → 0, curtain .5 → 0, surrounding background 1 → 0
      const tail = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: about, start: "bottom bottom", end: "bottom 20%", scrub: true, invalidateOnRefresh: true } });
      tail.fromTo(blur, { backdropFilter: "blur(32px)", webkitBackdropFilter: "blur(32px)" }, { backdropFilter: "blur(0px)", webkitBackdropFilter: "blur(0px)", immediateRender: false }, 0);
      tail.fromTo(shade, { "--gh-veil": 1 }, { "--gh-veil": 0, immediateRender: false }, 0);
      tail.fromTo(surround, { opacity: 1 }, { opacity: 0, immediateRender: false }, 0);
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", fit);
        show.kill();
        heading.style.marginBottom = "";
        gsap.set(heading, { clearProps: "opacity,visibility" });
      };
    });
  }

  // ---------- Photo strip — 40px per second at 1440 width, plus scroll speed (px/frame) ×6 (max 160), followed by 8% each frame ----------
  const gallery = document.querySelector("[data-gallery]");
  const track = gallery?.querySelector("[data-gallery-track]");
  if (track && !reduce) {
    const copy = track.cloneNode(true);
    copy.removeAttribute("data-gallery-track");
    copy.setAttribute("aria-hidden", "true");
    gallery.append(copy);
    let w = track.offsetWidth;
    new ResizeObserver(() => { w = track.offsetWidth; }).observe(track);
    let seen = false;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(gallery);
    const BASE = 40;
    let speed = BASE, x = 0;
    gsap.ticker.add((time, dt) => {
      if (!seen || !w) return;
      const boost = Math.min(Math.abs(window.ghLenis?.velocity || 0) * 6, 160);
      speed += (BASE + boost - speed) * 0.08;
      x -= speed * (innerWidth / 1440) * dt / 1000;
      if (x <= -w) x += w;
      gsap.set(gallery, { x });
    });
  }
})();
