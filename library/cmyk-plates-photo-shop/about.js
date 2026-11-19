// About — vertical title splitting, pinned text floating up and pushing, scattered photo parallax, Interaction on the service list.
// CMYK plate gathering is attached by _fx/cmyk-converge at DOMContentLoaded — build after that so the fixed length is counted in the positions of the sections below
(() => {
  const title = document.querySelector(".ab-title__h");
  if (title) {
    const t = title.textContent.trim();
    title.textContent = "";
    for (const ch of t) {
      const s = document.createElement("span");
      s.textContent = ch;
      s.className = "yc-vert";
      title.append(s);
    }
  }

  const go = () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const text = document.querySelector(".ab-concept__text");
      gsap.to(text, {
        y: "-5rem",
        scrollTrigger: {
          trigger: ".ab-concept",
          start: "10% bottom",
          end: "bottom center",
          scrub: true,
          onEnter: () => text.classList.add("is-show"),
          onLeaveBack: () => text.classList.remove("is-show"),
        },
      });
      document.querySelectorAll(".ab-concept__img .yc-ph > *").forEach((img) =>
        gsap.to(img, { y: "5%", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } }),
      );
    });

    // Service list — hovering a row switches to that row’s photo (gsap default .5s) and the other rows immediately fade to .2. On leave, it returns to the lead photo.
    const imgs = [...document.querySelectorAll(".ab-svc__visual .yc-ph > *")];
    const links = [...document.querySelectorAll(".ab-svc ul a")];
    const base = imgs.length - 1;
    let prev = base;
    links.forEach((a, i) => {
      a.addEventListener("mouseenter", () => {
        if (innerWidth <= 860) return;
        gsap.to(imgs[i], { opacity: 1 });
        if (prev !== i) { gsap.to(imgs[prev], { opacity: 0 }); prev = i; }
        links.forEach((b, j) => j !== i && gsap.to(b, { opacity: 0.2, duration: 0 }));
      });
      a.addEventListener("mouseleave", () => {
        if (innerWidth <= 860) return;
        gsap.to(imgs[prev], { opacity: 0 });
        prev = base;
        gsap.to(imgs[prev], { opacity: 1 });
        links.forEach((b) => gsap.to(b, { opacity: 1, duration: 0 }));
      });
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go, { once: true });
  else go();
})();
