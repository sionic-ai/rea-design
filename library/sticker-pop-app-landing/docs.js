// Doc contents collapse — on press › turns 90° and the sub list expands in .2s
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".fa-side__fold > button").forEach((b) => {
    const sub = b.nextElementSibling;
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", open);
      gsap.to(sub, { height: open ? "auto" : 0, duration: reduce ? 0 : 0.2, ease: "power1.out" });
    });
  });
})();
