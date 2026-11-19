// Home — opening curtain order (logo → hole → hero copy → header → character), photo hero, News · staff sliders, voices switched on two at a time.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelectorAll(".sn-head-item");
  const deco = document.querySelectorAll(".sn-deco-item");
  const copy = document.querySelector(".sn-kv__copyFrame");
  const op = document.querySelector(".sn-op");

  gsap.set(deco, { opacity: 0, yPercent: -30 });
  gsap.set(head, { yPercent: -30 });
  const showRest = () => gsap.timeline().to(head, { opacity: 1, yPercent: 0, duration: 0.4 }).to(deco, { opacity: 1, yPercent: 0, duration: 0.4 });
  if (op && !reduce) {
    op.addEventListener("fx:play", () => op.querySelector("[data-lottie]")?.snLottie?.play());
    // When the hole starts to open the Hero copy pops out (original "-=1"), once fully open: head → character
    op.addEventListener("fx:open", () => copy?.classList.add("is-anime"));
    op.addEventListener("fx:done", showRest);
  } else { copy?.classList.add("is-anime"); gsap.set([head, deco], { opacity: 1, yPercent: 0 }); }

  if (window.Splide) {
    const kv = document.querySelector(".sn-kv__slider");
    if (kv) new Splide(kv, { type: "fade", speed: 500, interval: 6000, rewind: true, pauseOnFocus: false, pauseOnHover: false, autoplay: !reduce, arrows: false, pagination: false }).mount();
    const news = document.querySelector(".sn-news__slider");
    if (news) {
      const s = new Splide(news, { type: "slide", speed: 1500, rewind: false, autoWidth: true, drag: false, updateOnMove: true, arrows: false, pagination: false, breakpoints: { 992: { drag: true, gap: "2rem" } } });
      const bar = document.querySelector(".sn-news__bar");
      s.on("mounted move", () => { const end = s.Components.Controller.getEnd() + 1; bar.style.width = `${Math.min((s.index + 1) / end, 1) * 100}%`; });
      s.mount();
    }
    const staff = document.querySelector(".sn-staff__slider");
    if (staff) new Splide(staff, { type: "loop", gap: "4rem", speed: 1500, interval: 6000, pauseOnFocus: false, pauseOnHover: false, autoWidth: true, updateOnMove: true, arrows: false, pagination: false, breakpoints: { 768: { gap: "0rem" } } }).mount();
  }

  // Hero copy fades as it passes upward (starts at half its height up, reaches 0 when its top edge touches the screen top)
  if (window.ScrollTrigger && copy && !reduce) {
    gsap.to(copy, { opacity: 0, scrollTrigger: { trigger: copy, start: "-50% 0%", end: "0% 0%", scrub: true } });
  }

  // Lights up two of the voice cards at random every 1.5s
  const items = document.querySelectorAll(".js-voice .sn-voice__item");
  if (items.length >= 2) {
    const pick = () => {
      items.forEach((i) => i.classList.remove("active"));
      const on = new Set();
      while (on.size < 2) on.add((Math.random() * items.length) | 0);
      on.forEach((i) => items[i].classList.add("active"));
    };
    pick();
    if (!reduce) setInterval(pick, 1500);
  }

  document.querySelectorAll(".sn-news__cat").forEach((c, i, all) => c.addEventListener("click", () => { all.forEach((x) => x.classList.remove("is-act")); c.classList.add("is-act"); }));
})();

// Voice modal — original jQuery fadeIn·fadeOut (.4s swing)
(() => {
  const modal = document.getElementById("sn-voice-modal");
  if (!modal) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const text = modal.querySelector(".sn-modal__text"), who = modal.querySelector(".sn-tag");
  const open = (from) => {
    if (from) { text.textContent = from.querySelector("p")?.textContent || text.textContent; who.textContent = from.querySelector(".sn-voice__who")?.textContent || who.textContent; }
    modal.hidden = false;
    document.documentElement.classList.add("is-modal-open");
    gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: "sine.inOut" });
    modal.querySelector(".sn-modal__close")?.focus({ preventScroll: true });
  };
  const close = () => gsap.to(modal, { autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => { modal.hidden = true; document.documentElement.classList.remove("is-modal-open"); } });
  document.querySelectorAll(".js-modal-open").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); open(a); }));
  modal.querySelectorAll(".js-modal-close").forEach((b) => b.addEventListener("click", close));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
})();

// Supporter see more — original js-accordionCSS (is-open on the pressed button and the next panel)
document.querySelectorAll(".js-accordion").forEach((b) => b.addEventListener("click", () => {
  const panel = document.getElementById(b.getAttribute("aria-controls"));
  const on = !b.classList.contains("is-open");
  b.classList.toggle("is-open", on); panel?.classList.toggle("is-open", on);
  b.setAttribute("aria-expanded", String(on));
  b.querySelector(".sn-btn__text").textContent = on ? "Close" : "See more";
}));
