// About hero — photo columns gather from ±50vh above and below (2.3s power3.out, random .1·.15s), and cells grow from .6x and transparent (1.2s, .03s).
// Scroll: the center column rises −50vh (phone −30vh) then widens to 100%, center cell height 100vh, title blurs 5px and fades, side columns move ±600px. Stacking scenes and photo tiles are here too
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const sec = document.querySelector(".ab-grid");
  const mm = gsap.matchMedia();
  mm.add({ wide: "(min-width: 992px)", ok: "(prefers-reduced-motion: no-preference)" }, ({ conditions: { wide, ok } }) => {
    if (!ok || !sec) return;
    gsap.from(".ab-gwrap .ab-gcol", { y: "50vh", duration: 2.3, ease: "power3.out", stagger: { from: "random", each: 0.15 }, delay: 0.3 });
    gsap.from(".ab-gmain .ab-gcol", { y: "-50vh", duration: 2.3, ease: "power3.out", delay: 0.3 });
    gsap.from(".ab-gitem", { scale: 0.6, opacity: 0, duration: 1.2, ease: "power3.out", stagger: { from: "random", each: 0.03 }, delay: 0.5 });
    const st = (start, end) => ({ trigger: sec, start, end, scrub: true });
    gsap.to(".ab-gmain", { y: wide ? "-50vh" : "-30vh", ease: "power2.out", scrollTrigger: st("top+=1px top", "20% top") });
    gsap.to(".ab-gmain", { width: "100%", ease: "none", scrollTrigger: st("20% top", "bottom bottom") });
    gsap.to(".ab-gitem.is-the", { height: "100vh", ease: "power2.out", scrollTrigger: st("top+=1px top", "20% top") });
    gsap.to(".ab-grid__in", { filter: "blur(5px)", opacity: 0, ease: "power2.out", immediateRender: false, scrollTrigger: st("top+=10px top", "20% top") });
    gsap.to(".ab-gwrap:first-child", { y: "600px", ease: "power2.out", scrollTrigger: st("top+=1px top", "bottom top") });
    gsap.to(".ab-gwrap:last-of-type", { y: "-600px", ease: "power2.out", scrollTrigger: st("top+=1px top", "bottom top") });
  });

  // Stacking scenes — while 100vh and 200vh placeholders travel from the bottom to the top of the screen, the next section is clipped and rises from the bottom
  const huge = document.querySelector(".ab-huge");
  if (huge) {
    const s = [...huge.querySelectorAll(".ab-huge__slide")], marks = huge.querySelectorAll(".ab-huge__mark"), img = (i) => s[i]?.querySelector(".ab-huge__img > .wf-img");
    [1, 2].forEach((n) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: marks[n - 1], start: "top bottom", end: "top top", scrub: true } });
      tl.to(s[n], { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "sine.out" }, 0)
        .fromTo(img(n), { scale: 1 }, { scale: 1.2, ease: "sine.out" }, 0)
        .to(img(n - 1), { scale: 1, y: "-80px", ease: "sine.out" }, 0);
    });
  }

  // Photo tiles — on wide screens each row moves x 300px → −40px (the second row reversed)
  if (innerWidth > 992) document.querySelectorAll(".ab-tiles__line").forEach((line) => {
    const max = line.dataset.move === "max";
    gsap.fromTo(line, { x: max ? "300px" : "-340px" }, { x: max ? "-40px" : "0px", ease: "none", scrollTrigger: { trigger: ".ab-tiles", start: "top bottom", end: "bottom top", scrub: true } });
  });
})();
