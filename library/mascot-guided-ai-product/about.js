// About — number cell roll (1.6s, each cell .12s later), promise ring Lottie (original LottiePlayer: plays only when visible, loads 200px ahead, loop and slice)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-digits]").forEach((box) => {
    box.innerHTML = [...box.dataset.digits].map((d, i) => `<span class="j-tile"><span class="j-roll" style="--digit:${d};--order:${i}">${Array.from({ length: +d + 1 }, (_, k) => `<span>${k}</span>`).join("")}</span></span>`).join("");
  });
  if (!window.lottie || !window.tLoops) return;
  document.querySelectorAll("[data-loop]").forEach((box) => {
    let anim = null, seen = false;
    const sync = () => { if (anim && !reduce) seen ? anim.play() : anim.pause(); };
    new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !anim) {
        anim = lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: false, animationData: JSON.parse(JSON.stringify(window.tLoops[box.dataset.loop])), rendererSettings: { preserveAspectRatio: "xMidYMid slice" } });
        if (reduce) anim.addEventListener("DOMLoaded", () => anim.goToAndStop(0, true));
      }
      sync();
    }, { rootMargin: "200px 0px" }).observe(box);
  });
})();
