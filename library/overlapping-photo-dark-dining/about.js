// About — title and greeting appear, flame video cover lifts away, full-width photo cell, people photo brightness
KC.page("about", ({ main, second, later }) => {
  const { $, still, d } = KC;
  const enter = () => {
    $(".kc-ab__titlewrap", main).classList.add("is-view");
    $(".kc-ab__list", main).classList.add("is-view");
    gsap.to(".kc-ab__dtitle", { opacity: 1, y: 0, duration: d(0.8), ease: "power2.out", delay: d(0.4) });
    gsap.to(".kc-ab__lines p:nth-child(1)", { opacity: 1, y: 0, duration: d(0.8), ease: "power2.out", delay: d(0.5) });
    gsap.to(".kc-ab__lines p:nth-child(2)", { opacity: 1, y: 0, duration: d(0.8), ease: "power2.out", delay: d(0.6) });
  };
  if (second) later(enter, 500);
  else enter();

  // Original initHls — the fire video loads right on entry and plays by itself
  const fire = $(".kc-ab__movie video", main);
  const hls = KC.hlsLoad(fire, "media/fire.m3u8");
  KC.play(fire);

  ScrollTrigger.create({
    trigger: ".kc-ab",
    start: "bottom bottom",
    end: "bottom top",
    onUpdate: (s) => gsap.set(".kc-ab__movie", { opacity: 1 - s.progress }),
  });

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 900px)", sp: "(max-width: 899px)" }, (ctx) => {
    if (ctx.conditions.pc) {
      if (!still) KC.stack($(".kc-pict", main), { dur: 0.1 });
    } else gsap.set(".kc-pict .wf-img", { clearProps: "clipPath,transform" });
  });

  ScrollTrigger.create({
    trigger: ".kc-member__list",
    start: "top 80%",
    end: "top 30%",
    onUpdate: (s) => gsap.set(".kc-member__image .wf-img", { filter: `brightness(${0.3 + 0.7 * s.progress})` }),
  });

  return () => {
    mm.revert();
    hls?.destroy();
    fire.pause();
  };
});
