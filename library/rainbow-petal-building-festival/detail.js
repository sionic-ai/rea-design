// Post detail: pressing a progress-log header line expands and collapses the body — original jQuery slideToggle (400ms, swing = sine.inOut) and is_active
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".dt-prog__head").forEach((head) => {
    const body = head.nextElementSibling;
    head.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !head.classList.contains("is-active");
      head.classList.toggle("is-active", open);
      head.setAttribute("aria-expanded", String(open));
      gsap.killTweensOf(body);
      if (reduce) { body.hidden = !open; return; }
      if (open) {
        body.hidden = false;
        gsap.fromTo(body, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }, { height: "auto", paddingTop: "", paddingBottom: "", duration: 0.4, ease: "sine.inOut", clearProps: "height,overflow,paddingTop,paddingBottom" });
      } else {
        gsap.to(body, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden", duration: 0.4, ease: "sine.inOut", onComplete: () => { body.hidden = true; gsap.set(body, { clearProps: "all" }); } });
      }
    });
  });
})();
