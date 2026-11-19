// Home only: the 240×150 small window video grows to 100svw×100svh at the start of the pin range (2s power1.out, delay .5)
// The English lines on both sides slide out with xPercent ∓100 (1s power2.out). When they return they shrink back over 1.5s. The text lines rise from yPercent 100 and scale 1.1 at .15s intervals.
(() => {
  const sec = document.querySelector(".brk");
  if (!sec) return;
  const video = sec.querySelector(".brk__video");
  const left = sec.querySelector('[data-side="left"]');
  const right = sec.querySelector('[data-side="right"]');
  const mm = gsap.matchMedia();
  // Original: on phones (575px and below) the video is swapped for a vertical one and reloaded. Autoplay, muted, loop
  const media = video.querySelector("video");
  if (media) {
    if (matchMedia("(max-width: 575px)").matches && media.dataset.srcSp) { media.src = media.dataset.srcSp; media.load(); }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { media.removeAttribute("autoplay"); media.pause(); }
  }

  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.set(video, { width: 240, height: 150 });
    const grow = () => {
      gsap.to(video, { width: "100vw", height: "100vh", delay: 0.5, duration: 2, ease: "power1.out", overwrite: true });
      gsap.to(left, { xPercent: -100, opacity: 0, delay: 0.5, duration: 1, ease: "power2.out", overwrite: true });
      gsap.to(right, { xPercent: 100, opacity: 0, delay: 0.5, duration: 1, ease: "power2.out", overwrite: true });
    };
    const shrink = () => {
      gsap.to(video, { width: 240, height: 150, duration: 1.5, ease: "power1.out", overwrite: true });
      gsap.to([left, right], { xPercent: 0, opacity: 1, delay: 0.5, duration: 1, ease: "power2.out", overwrite: true });
    };
    ScrollTrigger.create({ trigger: sec, start: "top top", end: "center center", onEnter: grow, onLeaveBack: shrink });
    ScrollTrigger.create({ trigger: ".brk__inner", start: "top top", endTrigger: sec, end: "bottom bottom", pin: true, pinSpacing: false });
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lines = sec.querySelectorAll(".brk__text");
    gsap.set(lines, { yPercent: 100, scale: 1.1 });
    gsap.to(lines, { yPercent: 0, scale: 1, duration: 1, ease: "power3.out", stagger: { each: 0.15 }, scrollTrigger: { trigger: sec, start: "top 75%" } });
  });
})();
