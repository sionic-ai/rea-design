// One product. Original values: entrance y→0 .7s power2.out (top 88% once) · showcase marquee runs one set width endlessly in 28s · bathroom image y parallax scrub ·
// When the add button leaves the top of the screen, the bottom add bar rises in .45s · image·review slides .4·.5s
(() => {
  const { reduced } = window.FL;
  const slides = document.querySelector(".pd-slides"), thumbs = [...document.querySelectorAll("[data-thumb]")];
  let cur = 0;
  const show = (i) => { cur = (i + thumbs.length) % thumbs.length; slides.style.transform = `translateX(${-100 * cur}%)`; thumbs.forEach((t, k) => t.classList.toggle("is-on", k === cur)); };
  thumbs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  document.querySelector("[data-next]").addEventListener("click", () => show(cur + 1));
  document.querySelectorAll(".pd-variants button").forEach((b, _, all) => b.addEventListener("click", () => all.forEach((x) => x.classList.toggle("is-on", x === b))));
  const qn = document.querySelector("[data-qty-n]");
  document.querySelectorAll("[data-qty]").forEach((b) => b.addEventListener("click", () => { qn.textContent = String(Math.max(1, +qn.textContent + +b.dataset.qty)); }));
  const track = document.querySelector(".pd-reviews__track");
  let rv = 0;
  document.querySelectorAll("[data-rv]").forEach((b) => b.addEventListener("click", () => {
    const card = track.children[0].getBoundingClientRect().width + 12, max = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    rv = gsap.utils.clamp(0, max, rv + +b.dataset.rv * card);
    track.style.transform = `translateX(${-rv}px)`;
  }));
  const sticky = document.querySelector(".pd-sticky");
  ScrollTrigger.create({ trigger: "[data-main-cart]", start: "bottom top", end: "max", onToggle: (s) => sticky.classList.toggle("is-on", s.isActive) });
  ScrollTrigger.create({ trigger: '[data-slot="footer"]', start: "top bottom", onToggle: (s) => s.isActive && sticky.classList.remove("is-on") });
  if (reduced) return;
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-rise], .pd-reviews__row, .pd-similar__row").forEach((n) => gsap.fromTo(n, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 88%", once: true } }));
    const mq = document.querySelector(".pd-marquee__track");
    gsap.to(mq, { x: () => -mq.scrollWidth / 2, duration: 28, ease: "none", repeat: -1 });
    document.querySelectorAll("[data-par]").forEach((box) => gsap.fromTo(box.querySelector("[data-par-in]"), { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } }));
  });
})();
