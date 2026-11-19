// Opening screen (brush band and knot under the logo), top-center MENU accordion, entrance that opens from below, footer giant logo rising.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Same CustomEase ”dsk” as the original (0.4, 1, 0.7, 1)
  gsap.registerPlugin(CustomEase);
  const dsk = CustomEase.create("dsk", "0.4, 1, 0.7, 1");

  // Opening screen: first visit of the session only. The brush band opens left→right, the thin band right→left, and the knot line is drawn in one stroke
  const splash = document.querySelector(".splash");
  const brush = document.querySelector(".splash__thi-brush");
  const finish = () => {
    body.classList.add("splashed");
    splash?.classList.add("is-end");
    brush?.setAttribute("stroke-dashoffset", "0");
    ScrollTrigger.refresh();
  };
  if (!splash || reduce || sessionStorage.getItem("lib-brand-splashed")) finish();
  else {
    scrollTo(0, 0);
    sessionStorage.setItem("lib-brand-splashed", "1");
    const fir = splash.querySelector(".splash__fir"), sec = splash.querySelector(".splash__sec");
    const fill = splash.querySelector(".splash__thi-fill"), fou = splash.querySelector(".splash__fou");
    const len = brush.getTotalLength();
    brush.setAttribute("stroke-dasharray", len);
    brush.setAttribute("stroke-dashoffset", len);
    gsap.timeline({ delay: .3, onComplete: finish })
      .to(fir, { clipPath: "inset(0 0% 0 0)", duration: .85, ease: dsk })
      .to(sec, { clipPath: "inset(0 0 0 0%)", duration: .85, ease: dsk }, "+=0.05")
      .addLabel("thi", "+=0.3")
      .to(brush, { attr: { "stroke-dashoffset": -25 }, duration: 1.8, ease: "power2.inOut" }, "thi")
      .set(fill, { opacity: 1 }, "thi+=1.3")
      .to(fou, { opacity: 1, duration: 1, ease: "power1.out" }, "thi+=1.5");
  }

  // MENU: the same button opens and closes. On phone it unfolds upward from bottom center (CSS column-reverse)
  const menu = document.querySelector(".menu");
  const btn = menu?.querySelector(".menu__btn");
  const setMenu = (on) => { menu.classList.toggle("is-on", on); btn.setAttribute("aria-expanded", on); };
  btn?.addEventListener("click", () => setMenu(!menu.classList.contains("is-on")));
  menu?.querySelectorAll(".js-close").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => { if (menu && !menu.contains(e.target)) setMenu(false); });

  // Movement within the same page is smooth (original html scroll-behavior: smooth)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const el = document.querySelector(a.getAttribute("href"));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  // Entrance: once when it touches the 75% line of the screen — clip opens from bottom to top
  document.querySelectorAll(".fade-in, .fade-in-lines").forEach((el) => {
    if (reduce) { el.classList.add("is-active"); return; }
    ScrollTrigger.create({ trigger: el, once: true, start: "top 75%", onEnter: () => el.classList.add("is-active") });
  });

  // Footer: when the red panel touches the top of the screen, the giant logo below floats up 100px
  const mm = gsap.matchMedia();
  const lift = (start, end) => gsap.fromTo(".footer__logo", { translate: "-50% 0px" }, { translate: "-50% -100px", ease: "none", scrollTrigger: { trigger: ".footer__upper", start, end, scrub: true } });
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => { lift("top top", "20% top"); });
  mm.add("(max-width: 1024px) and (prefers-reduced-motion: no-preference)", () => { lift("top 50%", "top top"); });
})();
