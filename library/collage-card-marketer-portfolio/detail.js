// Case detail: the title is a scratched strikethrough from the start, and the blocks below float up with the original shv-rise values as they enter the screen
(() => {
  const site = CustomEase.create("wrSite", "0.22, 1, 0.36, 1");
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // Original shv-rise values: when it reaches 75% of the screen (original useScrollReveal default), it rises from 20px below in .55s (.22,1,.36,1), with 70ms offsets within the same group
    document.querySelectorAll(".cs-intro, .cs-video, .cs-board, .cs-work, .cs-text, .cs-embed").forEach((box) => {
      const kids = box.matches(".cs-video, .cs-embed") ? [box] : [...box.children];
      gsap.from(kids, { y: 20, autoAlpha: 0, duration: .55, ease: site, stagger: .07, scrollTrigger: { trigger: box, start: "top 75%" } });
    });
  });
  // Video: the original is a video-site thumbnail — clicking swaps it in place for an autoplay (muted) player.
  const poster = document.querySelector(".cs-video__poster");
  poster?.addEventListener("click", () => {
    const v = Object.assign(document.createElement("video"), { src: "placeholder-16x9.mp4", muted: true, autoplay: true, controls: true, playsInline: true });
    poster.replaceWith(v);
    v.play().catch(() => {});
  });
})();
