// About motion. Original values: region map .72→1 1.6s power3.out (.4 delay) · text .86→1 1.1s (.35) · people and shapes pop out from the center at .3 and -15° over .9s (.8+.06i)
(() => {
  const { reduced, blobPath, mm } = window.VS;

  // Yellow map stain: one big blob instead of the original map image
  document.querySelector(".area__splat-path").setAttribute("d", blobPath(300, 280, 250, 23, 18, 0.26));

  // Side nav numbers: white over the yellow greeting area
  const side = document.querySelector(".vs-side"), msg = document.querySelector("#message");
  const tint = () => {
    const a = side.getBoundingClientRect(), b = msg.getBoundingClientRect(), m = a.top + a.height / 2;
    side.classList.toggle("is-on-color", m >= b.top && m <= b.bottom);
  };
  addEventListener("scroll", tint, { passive: true });
  tint();

  // Logo video plays on its own like the original — under reduced motion it stays on the first frame
  const logoVideo = document.querySelector(".logo-sec__video video");
  if (reduced && logoVideo) { logoVideo.removeAttribute("autoplay"); logoVideo.pause(); }

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const area = document.querySelector(".area"), visual = area.querySelector(".area__visual");
    const map = area.querySelector(".area__splat"), cont = area.querySelector(".area__cont");
    const people = area.querySelectorAll(".area__person"), objs = area.querySelectorAll(".area__obj");
    gsap.set([map, cont, ...people, ...objs], { autoAlpha: 0 });
    const fromCenter = (el) => {
      const r = el.getBoundingClientRect(), v = visual.getBoundingClientRect();
      return { x: v.width / 2 - (r.left - v.left + r.width / 2), y: v.height / 2 - (r.top - v.top + r.height / 2) };
    };
    ScrollTrigger.create({
      trigger: visual, start: "top 50%", once: true,
      onEnter: () => {
        const tl = gsap.timeline({ delay: 0.4, defaults: { ease: "power3.out" } });
        tl.fromTo(map, { autoAlpha: 0, scale: 0.72 }, { autoAlpha: 1, scale: 1, duration: 1.6 })
          .fromTo(cont, { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 1.1 }, 0.35);
        [people, objs].forEach((set, k) => set.forEach((el, i) => {
          const c = fromCenter(el), at = 0.8 + 0.06 * i;
          tl.fromTo(el, { x: c.x, y: c.y, scale: 0.3, rotation: -15 }, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.9 }, at)
            .to(el, { autoAlpha: 1, duration: k ? 1 : 0.45 }, at + (k ? 0.3 : 0.5));
        }));
        objs.forEach((el, i) => gsap.to(el, { y: "-=10", duration: 2 + i * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 }));
      },
    });
    return () => gsap.set([map, cont, ...people, ...objs], { clearProps: "all" });
  });
  if (reduced) gsap.set(".area__splat, .area__cont, .area__person, .area__obj", { autoAlpha: 1 });
})();
