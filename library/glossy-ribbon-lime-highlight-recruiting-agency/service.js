// Service: swap the fixed left panel (when the top edge of the right box passes -120px below the screen bottom) · menu accordion .5s (swing of jQuery slideToggle = sine.inOut).
(() => {
  const { reduced } = window.PC;
  const boxes = [...document.querySelectorAll(".sv-box")];
  const panels = [...document.querySelectorAll(".sv-panel")];
  const sync = () => {
    const trigger = scrollY + innerHeight - 120;
    boxes.forEach((b, i) => {
      if (i === 0) return;
      const top = b.getBoundingClientRect().top + scrollY;
      panels[i].classList.toggle("is-active", trigger > top);
    });
  };
  addEventListener("scroll", sync, { passive: true });
  sync();

  document.querySelectorAll(".sv-acc").forEach((acc) => {
    const body = acc.querySelector(".sv-acc__body");
    acc.querySelector(".sv-acc__head").addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      gsap.killTweensOf(body);
      if (open) gsap.fromTo(body, { height: 0, display: "block" }, { height: "auto", duration: reduced ? 0 : 0.5, ease: "sine.inOut", onComplete: () => ScrollTrigger.refresh() });
      else gsap.to(body, { height: 0, duration: reduced ? 0 : 0.5, ease: "sine.inOut", onComplete: () => { body.style.display = "none"; ScrollTrigger.refresh(); } });
    });
  });
})();
