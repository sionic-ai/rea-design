// Business intro: collapsible filter slot on phones (original Accordion, collapsed height 100px)
(() => {
  gsap.matchMedia().add("(max-width: 767px)", () => {
    const cats = [...document.querySelectorAll(".svc-nav__cat")];
    cats.forEach((c) => {
      const b = c.querySelector(".svc-nav__title"), t = c.querySelector(".svc-nav__tags");
      const set = (open) => { b.setAttribute("aria-expanded", open); t.style.maxHeight = open ? t.scrollHeight + "px" : "100px"; };
      set(false);
      b.onclick = () => set(b.getAttribute("aria-expanded") !== "true");
    });
    return () => cats.forEach((c) => { c.querySelector(".svc-nav__tags").style.maxHeight = ""; c.querySelector(".svc-nav__title").onclick = null; });
  });
})();
