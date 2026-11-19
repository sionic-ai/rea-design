// About page — hero photo starts receding, the navy panel photo group cycles every 5 seconds (only when visible), series photo Splide. Values are the original about.js as they are.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector(".mm-amv").classList.add("is-load");

  // Photo group — every 5s is-active goes to the next slide and is-prev to the previous. Runs when on screen and stops when off
  const intro = document.querySelector(".mm-amv__intro");
  document.querySelectorAll(".mm-amv__img").forEach((group, g) => {
    group.style.setProperty("--index", g);
    const items = [...group.querySelectorAll(".mm-amv__img-item")];
    if (!items.length || reduce) return;
    let cur = 0, timer = null;
    const mark = (list, n, cls) => { list.forEach((el) => el.classList.remove(cls)); list[n].classList.add(cls); };
    const go = (n) => { cur = n; mark(items, cur, "is-active"); mark(items, (cur + items.length - 1) % items.length, "is-prev"); };
    const next = () => go((cur + 1) % items.length);
    const play = () => { if (timer) return; go(cur); timer = setInterval(next, 5000); };
    const stop = () => { clearInterval(timer); timer = null; };
    ScrollTrigger.create({ trigger: intro, start: "top bottom", onEnter: play, onLeave: stop, onEnterBack: play, onLeaveBack: stop });
  });

  // Series photos — original Splide defaults (.5s cubic-bezier(.165,.84,.44,1) · loop · autoWidth · snap · flickMaxPages .5)
  document.querySelectorAll(".mm-series__photo").forEach((el) => {
    if (el.querySelectorAll(".splide__slide").length < 2) return;
    const s = new Splide(el, { arrowPath: " ", speed: 500, easing: "cubic-bezier(0.165, 0.84, 0.44, 1)", type: "loop", autoWidth: true, snap: true, flickMaxPages: 0.5 }).mount();
    s.on("drag", () => el.classList.add("is-drag"));
    s.on("dragged", () => el.classList.remove("is-drag"));
  });
})();
