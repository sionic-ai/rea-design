// How-to guide — clicking the video slot shows a playing state (the original is a video embed, so it plays in place when clicked)
(() => {
  const box = document.querySelector(".ad-mov__box");
  const bar = box.querySelector(".ad-mov__bar");
  let tween;
  const toggle = () => {
    const playing = box.classList.toggle("is-playing");
    if (!tween) tween = gsap.to(bar, { width: "100%", duration: 90, ease: "none", paused: true });
    playing ? tween.play() : tween.pause();
  };
  box.addEventListener("click", toggle);
  box.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
})();
