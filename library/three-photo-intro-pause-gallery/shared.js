// Interaction across several pages: Header — when a [data-not-top] section touches the top by header height, the menu sharpens from 10px blur in .5s,
// Drawer (MicroModal) — after the panel rises from below, rows come up from 20px below at .04s stagger over .6s, and on close the rows exit upward in .3s and the panel leaves in .6s,
// Gallery photo modal — MicroModal + Splide fade 1s, page number and arrows
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".kn-header");
  const drawer = document.querySelector("#kn-drawer");

  const notTop = document.querySelector("[data-not-top]");
  if (header && notTop) {
    const set = (on) => { header.classList.toggle("is-not-top", on); drawer?.classList.toggle("is-not-top", on); };
    ScrollTrigger.create({ trigger: notTop, start: () => `-${header.offsetHeight}px top`, endTrigger: document.body, end: "bottom bottom", onToggle: (self) => set(self.isActive) });
  }

  if (drawer && window.MicroModal) {
    const burgers = [...document.querySelectorAll("[data-hamburger]")];
    const items = () => drawer.querySelectorAll("[data-drawer-item]");
    let opened = false, anim = null;
    const expanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", String(v)));
    const open = () => {
      if (opened) return;
      MicroModal.show("kn-drawer", {
        disableScroll: true, disableFocus: true, awaitOpenAnimation: false, awaitCloseAnimation: true,
        onShow: () => {
          opened = true;
          setTimeout(() => expanded(true), reduce ? 0 : 200);
          anim = gsap.fromTo(items(), { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: reduce ? 0 : 0.3, duration: reduce ? 0 : 0.6, ease: "power1.out", stagger: { each: 0.04 } });
        },
        onClose: () => { opened = false; expanded(false); },
      });
    };
    const close = () => {
      if (!opened) return;
      anim?.pause();
      gsap.fromTo(items(), { opacity: 1, y: 0 }, { opacity: 0, y: -20, ease: "power1.out", duration: reduce ? 0 : 0.3, stagger: { each: 0.002 }, onComplete: () => MicroModal.close("kn-drawer") });
    };
    burgers.forEach((b) => b.addEventListener("click", () => (opened ? close() : open())));
    drawer.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", close));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && opened) close(); });
  }

  if (window.MicroModal && window.Splide) {
    document.querySelectorAll(".kn-modal").forEach((m) => {
      const el = m.querySelector("[data-modal-slide]");
      if (!el) return;
      const s = new Splide(el, { arrows: false, pagination: false, type: "fade", rewind: true, speed: reduce ? 0 : 1000, height: "70vh", breakpoints: { 1025: { height: "60vh" }, 768: { height: "50vh" } } });
      const now = m.querySelector("[data-now]"), total = m.querySelector("[data-total]");
      s.on("mounted move", () => { if (now) now.textContent = s.index + 1; if (total) total.textContent = s.length; });
      s.mount();
      m.querySelector("[data-prev]")?.addEventListener("click", () => s.go("<"));
      m.querySelector("[data-next]")?.addEventListener("click", () => s.go(">"));
    });
    MicroModal.init({ disableFocus: true, disableScroll: true, awaitCloseAnimation: true, awaitOpenAnimation: true });
  }

  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }));
})();
