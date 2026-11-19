// What We Do: the spiral path line is drawn and the dot follows the path, not tied directly to scroll but triggered each time a step box touches the screen center
// Jumps to preset spots (.23 · .54 · .995) with .8s power2.out (same as the original). At each step the lens image and arrow change.
(() => {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const zu = document.querySelector(".ec-spiral__zu");
  const wrap = document.querySelector(".ec-spiral__wrap");
  const path = document.querySelector("#ec-motion-path");
  const target = document.querySelector(".ec-spiral__target");
  const boxes = [...document.querySelectorAll(".ec-spiral__box")];
  const stops = [0.23, 0.54, 0.995];
  let master = null, triggers = [];

  // Original centers the image on the window height
  const center = () => {
    const h = innerHeight;
    zu.style.top = `${Math.max(0, (h - zu.offsetHeight) / 2)}px`;
    document.querySelectorAll(".ec-spiral__inner").forEach((el) => {
      if (matchMedia("(max-width: 768px)").matches) { el.style.top = ""; return; }
      el.style.top = `${Math.max(0, (h - el.offsetHeight) / 2)}px`;
    });
  };
  const setStage = (i) => {
    wrap.classList.remove("anim1", "anim2", "anim3");
    if (i >= 0) wrap.classList.add(`anim${i + 1}`);
  };
  const init = () => {
    master?.kill();
    triggers.forEach((t) => t.kill());
    triggers = [];
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    master = gsap.timeline({ paused: true })
      .to(path, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
      .to(target, { ease: "none", duration: 1, motionPath: { path, align: path, autoRotate: true, alignOrigin: [0.5, 0.5] } }, 0);
    if (reduce) { master.progress(1); setStage(2); return; }
    boxes.forEach((box, i) => {
      triggers.push(ScrollTrigger.create({
        trigger: box,
        start: "top center",
        end: "top center",
        onEnter: () => { setStage(i); gsap.to(master, { progress: stops[i], duration: 0.8, ease: "power2.out" }); },
        onEnterBack: () => { setStage(i - 1); gsap.to(master, { progress: i === 0 ? 0 : stops[i - 1], duration: 0.8, ease: "power2.out" }); },
      }));
    });
  };
  center();
  init();
  let timer;
  addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { center(); init(); ScrollTrigger.refresh(); }, 200);
  });
})();
