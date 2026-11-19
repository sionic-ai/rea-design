// Home page scenes. Effect functions (melt, rise, sweep) and Lenis live in shared.js.

// While the hero wordmark melts and shrinks, the next section’s mirrored wordmark grows in the same order, joining the two sections
kMotion.scene(({ melt }) => {
  const hero = document.getElementById("hero");
  const mirage = document.getElementById("mirage");
  gsap.timeline({ scrollTrigger: { trigger: hero, start: "bottom bottom", end: "bottom 30%", scrub: true } })
    .add(melt(hero.querySelectorAll(".k-word__cell"), 1, 0.42), 0);
  gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } })
    .to(hero.querySelector(".k-hero__cover"), { yPercent: -16, ease: "none" }, 0)
    .to(hero.querySelector(".k-hero__date"), { yPercent: -70, ease: "none" }, 0);
  gsap.timeline({ scrollTrigger: { trigger: mirage, start: "top bottom", end: "top 30%", scrub: true } })
    .add(melt(mirage.querySelectorAll(".k-mirror__cell"), 0.05, 1), 0);
});

// Six posters start from a tilted pile in the center of the wall and are placed in position one by one from the top sheet at 0.42 intervals
kMotion.scene(() => {
  const section = document.getElementById("lineup");
  const stage = section.querySelector(".k-lineup__stage");
  const wall = section.querySelector(".k-lineup__wall");
  const posters = [...wall.children];
  const turns = [-11, 7, -4, 9, -7, 4];
  const pileX = (p) => wall.clientWidth / 2 - (p.offsetLeft + p.offsetWidth / 2);
  const pileY = (p) => wall.clientHeight / 2 - (p.offsetTop + p.offsetHeight / 2);
  const deal = gsap.timeline({
    scrollTrigger: { trigger: stage, start: "top top", end: () => "+=" + Math.round(innerHeight * 1.7), pin: true, scrub: true, invalidateOnRefresh: true },
  });
  posters.slice().reverse().forEach((p, order) => {
    const i = posters.indexOf(p);
    deal.fromTo(p,
      { x: () => pileX(p), y: () => pileY(p), rotation: turns[i], scale: 0.66 },
      { x: 0, y: 0, rotation: 0, scale: 1, duration: 1, ease: "power2.inOut" }, order * 0.42);
  });
  deal.to({}, { duration: 0.5 });
});

// With the screen pinned, the photo strip flows to the left, and as much as passes the center vertical line peels back the original photo layer to reveal the thermal image.
kMotion.scene(() => {
  const section = document.getElementById("archive");
  const stage = section.querySelector(".k-archive__stage");
  const track = section.querySelector(".k-archive__track");
  const frames = [...track.querySelectorAll(".k-archive__photo")];
  const lights = frames.map((f) => f.querySelector(".k-archive__light"));
  section.classList.add("is-scanning");
  const setLight = lights.map((l) => gsap.quickSetter(l, "x", "px"));
  const setInner = lights.map((l) => gsap.quickSetter(l.firstElementChild, "x", "px"));
  let boxes = [];
  let travel = 0;
  const measure = () => {
    travel = Math.max(0, track.scrollWidth - stage.clientWidth);
    boxes = frames.map((f) => ({ left: f.parentElement.offsetLeft, width: f.offsetWidth }));
  };
  const paint = (progress) => {
    const scanner = stage.clientWidth / 2;
    const shift = -progress * travel;
    boxes.forEach((box, i) => {
      const crossed = gsap.utils.clamp(0, 1, (scanner - (box.left + shift)) / box.width) * box.width;
      setLight[i](crossed);
      setInner[i](-crossed);
    });
  };
  measure();
  gsap.timeline({
    scrollTrigger: {
      trigger: stage, start: "top top", end: () => "+=" + travel, pin: true, scrub: true, invalidateOnRefresh: true,
      onRefreshInit: measure, onRefresh: (self) => paint(self.progress), onUpdate: (self) => paint(self.progress),
    },
  }).fromTo(track, { x: 0 }, { x: () => -travel, ease: "none", duration: 1 });
  paint(0);
  return () => section.classList.remove("is-scanning");
});

// The arch below the reviews grows and crosses the boundary, and in the ticket section an upturned bowl grows at the same ratio
kMotion.scene(() => {
  const voices = document.getElementById("voices");
  const tickets = document.getElementById("tickets");
  gsap.timeline({ scrollTrigger: { trigger: voices, start: "bottom bottom", end: "bottom 35%", scrub: true } })
    .fromTo(voices.querySelector(".k-voices__arch"), { scale: 0.3 }, { scale: 1, ease: "none", duration: 1 }, 0);
  gsap.timeline({ scrollTrigger: { trigger: tickets, start: "top bottom", end: "top 35%", scrub: true } })
    .fromTo(tickets.querySelector(".k-tickets__bowl"), { scale: 0.3 }, { scale: 1, ease: "none", duration: 1 }, 0);
});

// While a place poster is pinned, a band of its original color sweeps across once
kMotion.scene(({ scan }) => {
  const visit = document.getElementById("visit");
  gsap.timeline({ scrollTrigger: { trigger: visit, start: "top 75%", end: "bottom bottom", scrub: true } })
    .add(scan(visit.querySelector(".k-visit__poster .k-heat")), 0);
});
