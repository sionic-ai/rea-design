/* Service·option list — branch nav: pressing scrolls to that section in .4s (jQuery animate default 400ms·easeOutQuad), and marks the branch of the section currently in view */
(() => {
  const nav = document.querySelector(".sv-nav");
  if (!nav) return;
  const links = [...nav.querySelectorAll("a")];
  const secs = links.map((a) => document.querySelector(a.getAttribute("href")));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    const sec = document.querySelector(a.getAttribute("href"));
    const y = sec.getBoundingClientRect().top + scrollY - nav.offsetHeight - (innerWidth > 767 ? 60 : 60);
    const s = { y: scrollY };
    gsap.to(s, { y, duration: reduce ? 0 : 0.4, ease: "power1.out", onUpdate: () => scrollTo(0, s.y) });
  });
  const spy = () => {
    const line = nav.getBoundingClientRect().bottom + 10;
    let on = -1;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) on = i; });
    links.forEach((a, i) => a.classList.toggle("is-on", i === on));
  };
  // Card detail window — the original .modal-open is jQuery fadeIn (400ms, swing→easeOutQuad) and fadeOut
  const modal = document.querySelector(".sv-modal");
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".sv-card:not(.is-ex)");
    if (card && modal) {
      e.preventDefault();
      modal.querySelector(".sv-modal__ttl").textContent = card.querySelector("h3")?.textContent || "";
      gsap.killTweensOf(modal);
      gsap.fromTo(modal, { display: "grid", opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.4, ease: "power1.out" });
    } else if (e.target.closest("[data-sv-close]") && modal) {
      gsap.to(modal, { opacity: 0, duration: reduce ? 0 : 0.4, ease: "power1.out", onComplete: () => gsap.set(modal, { display: "none" }) });
    }
  });
  addEventListener("scroll", spy, { passive: true });
  spy();
})();
