// About — a value block fires once when its top edge reaches 90% of the screen − 100px: English letters (.03s stagger, 1rem below) → a thin line from the left over .9s power2.out (.5s overlap)
// → Korean letters (.03s, .3s overlap) → body. Scattered photos rise from 2rem below in 3s power2.out, and the inner image rises −20% while passing through the cell.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const split = (el) => {
    const text = el.textContent;
    el.textContent = "";
    return [...text].map((c) => {
      const s = document.createElement("span");
      s.textContent = c;
      el.append(s);
      return s;
    });
  };
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-value]").forEach((v) => {
      const [en, ko] = [...v.querySelectorAll("[data-split]")];
      const line = v.querySelector("[data-line]");
      const a = en ? split(en) : [], b = ko ? split(ko) : [];
      gsap.set([...a, ...b], { opacity: 0, y: "1rem" });
      if (line) gsap.set(line, { clipPath: "inset(0 100% 0 0)" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: v, start: "top-=100px 90%", once: true } });
      tl.to(a, { opacity: 1, y: 0, stagger: 0.03 });
      if (line) tl.to(line, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.out" }, "-=0.5");
      tl.to(b, { opacity: 1, y: 0, stagger: 0.03 }, "-=0.3");
    });
    document.querySelectorAll("[data-shot]").forEach((f) => {
      const inner = f.firstElementChild;
      gsap.fromTo(f, { opacity: 0, y: "2rem" }, { opacity: 1, y: 0, duration: 3, ease: "power2.out", scrollTrigger: { trigger: f, start: "top 80%", once: true } });
      if (inner) gsap.to(inner, { yPercent: -20, scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
})();
