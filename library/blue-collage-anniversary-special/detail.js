// Work detail: the hero photo follows down at .5× speed while scrolling, its bottom edge is cut into an ellipse and the body covers it from above.
HS.page("detail", (root) => {
  const img = root.querySelector(".dt-kv__img");
  if (!img || HS.reduced) return;
  const st = { trigger: root.querySelector(".dt-kv"), start: "top top", end: "bottom top", scrub: true };
  gsap.to(img, { yPercent: 50, ease: "none", scrollTrigger: st });
  gsap.fromTo(root.querySelector(".dt-kv"), { clipPath: "ellipse(150% 100% at 50% 0%)" }, { clipPath: "ellipse(70% 100% at 50% 0%)", ease: "none", scrollTrigger: st });
});
