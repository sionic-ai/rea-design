// Outer frame: first-visit curtain (once per session) · white curtain lifts · logo after dropping half a screen · phone menu drawer · pressing the menu goes to a screen-height multiple in .7s
(() => {
  const body = document.body;
  const first = document.getElementById("ow-first");
  const header = document.querySelector(".ow-header");
  const logo = document.querySelector(".ow-logo");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (first) {
    if (sessionStorage.getItem("ow-access") || reduce) first.classList.add("is-hid");
    else { sessionStorage.setItem("ow-access", "true"); setTimeout(() => first.classList.add("is-st"), 3700); }
  }
  const lift = () => setTimeout(() => body.classList.remove("ow-fadeout"), reduce ? 0 : 1200);
  if (document.readyState === "complete") lift(); else addEventListener("load", lift, { once: true });

  const onScroll = () => logo?.classList.toggle("is-hid", scrollY <= innerHeight * 0.5);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const btn = document.querySelector(".ow-menu-btn");
  const setMenu = (open) => {
    header.classList.toggle("is-open", open);
    logo?.classList.toggle("is-open", open);
    btn?.setAttribute("aria-expanded", String(open));
  };
  btn?.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));

  // Original mt(): scrolls by multiples of screen height (Services 1 · Company 2 · Contact 4), not by section position — on phones by section position
  const SLOT = { top: 0, service: 1, company: 2, contact: 4 };
  const glide = (y) => {
    if (reduce) return scrollTo(0, y);
    const s = { y: scrollY };
    gsap.to(s, { y, duration: 0.7, ease: "sine.inOut", onUpdate: () => scrollTo(0, s.y) });
  };
  document.querySelectorAll("[data-ow-go]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const k = a.dataset.owGo;
    setMenu(false);
    if (matchMedia("(max-width: 768px)").matches) {
      const t = k === "top" ? 0 : document.getElementById(k === "contact" ? "contact-wrap" : k)?.getBoundingClientRect().top + scrollY - 70;
      glide(Math.max(0, t || 0));
    } else glide(innerHeight * (SLOT[k] ?? 0));
  }));
})();
