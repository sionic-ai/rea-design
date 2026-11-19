// Affiliate overview: the Read more of the safety policy opens from height 0 as a hidden cell above the button, like the original Studio fold, and the button changes to Close.
// On phone, each vehicle group becomes a collapsible (pressing the head opens it and flips the arrow). Duration is the default Studio transition .4s cubic-bezier(.4,.4,0,1).
(() => {
  const ease = CustomEase.create("trFold", "0.4,0.4,0,1");
  const d = () => (HS.reduced ? 0 : 0.4);

  const more = document.querySelector("[data-readmore]");
  if (more) {
    const body = more.querySelector(".tr-more__body");
    const btn = more.querySelector("[data-readmore-btn]");
    btn.addEventListener("click", () => {
      const open = !more.classList.contains("is-open");
      more.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
      gsap.to(body, { height: open ? "auto" : 0, duration: d(), ease, onComplete: () => ScrollTrigger.refresh() });
    });
  }

  const phone = matchMedia("(max-width: 768px)");
  document.querySelectorAll(".tr-grp").forEach((grp) => {
    const btn = grp.querySelector(".tr-grp__h");
    const body = grp.querySelector(".tr-grp__body");
    btn.addEventListener("click", () => {
      if (!phone.matches) return;
      const open = !grp.classList.contains("is-open");
      grp.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
      gsap.fromTo(body, { height: open ? 0 : body.offsetHeight }, { height: open ? "auto" : 0, duration: d(), ease, clearProps: "height", onComplete: () => ScrollTrigger.refresh() });
    });
  });
})();
