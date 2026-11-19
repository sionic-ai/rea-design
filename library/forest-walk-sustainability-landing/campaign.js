// Campaign: original index.js. On load the cover gets is-show, and the index gets is-current while the backdrop scenery crossfades to match the section passing screen center,
// The zigzag above and below the campaign panel (.Action__roof/__floor) moves background-position-x 100px with scrub .6 · +=To 2000
(() => {
  const show = () => document.body.classList.add("is-show");
  if (document.readyState === "complete") show(); else addEventListener("load", show);

  const secs = [...document.querySelectorAll(".cp-col > section[id]")], links = [...document.querySelectorAll(".cp-side li")], bgs = [...document.querySelectorAll(".cp-bg__img")];
  const check = () => {
    const mid = innerHeight / 2;
    let cur = secs[0];
    secs.forEach((s) => { if (s.getBoundingClientRect().top < mid) cur = s; });
    links.forEach((li) => li.classList.toggle("is-current", li.querySelector("a").getAttribute("href") === `#${cur.id}`));
    const two = cur.dataset.bg === "2" || cur.id === "cp-action";
    bgs.forEach((b, k) => b.classList.toggle("is-on", two ? k === 1 : k === 0));
  };
  addEventListener("scroll", check, { passive: true });
  check();

  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".cp-roof").forEach((r) => gsap.to(r, { backgroundPositionX: "100px, 125px", ease: "none", scrollTrigger: { trigger: r, start: "top bottom", end: "+=2000 bottom", scrub: 0.6 } }));
  });
})();
