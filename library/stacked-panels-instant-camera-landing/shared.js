// Shared machinery of one-page product intros — extremely heavy Lenis (lerp .0225), anchor moves, order window, button press, footer appearance
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original lerp .0225 — keeps gliding for more than 1s after the wheel stops. ScrollTrigger refreshes on every scroll so section boundaries don’t lag
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.0225, duration: 1.2, wheelMultiplier: 1.25, anchors: false, syncTouch: false });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
  }
  window.snLenis = lenis;
  const scrollTo = (y) => (lenis ? lenis.scrollTo(y) : scrollTo0(y));
  const scrollTo0 = (y) => window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  window.snScrollTo = scrollTo;

  // Sections stick and rise overlapping each other, so measuring after scrolling down returns the stuck position — it goes to the position measured once at the top (original offsetCache)
  const anchors = [...document.querySelectorAll('a[href^="#"]:not([href="#"]):not([data-order])')];
  const cache = new Map();
  const measure = () => anchors.forEach((a) => {
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (t) cache.set(a, t.getBoundingClientRect().top + scrollY);
  });
  const warm = () => (scrollY > 0 ? requestAnimationFrame(warm) : (ScrollTrigger.refresh(), requestAnimationFrame(measure)));
  addEventListener("load", warm);
  anchors.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const y = cache.get(a);
    if (y != null) scrollTo(y);
  }));

  // Order window — folded on the top center axis, it comes down in 1s power2.out and folds away in .5s power2.in
  const order = document.querySelector(".sn-order");
  if (order) {
    let open = false;
    gsap.set(order, { yPercent: -100, scaleY: 0, transformOrigin: "top center", visibility: "hidden", pointerEvents: "none" });
    const show = () => {
      if (open) return;
      open = true;
      lenis?.stop();
      gsap.set(order, { visibility: "visible", pointerEvents: "auto" });
      gsap.to(order, { yPercent: 0, scaleY: 1, duration: reduce ? 0 : 1, ease: "power2.out" });
    };
    const hide = () => {
      if (!open) return;
      open = false;
      lenis?.start();
      gsap.to(order, {
        yPercent: -100, scaleY: 0, duration: reduce ? 0 : 0.5, ease: "power2.in",
        onComplete: () => { gsap.set(order, { visibility: "hidden", pointerEvents: "none" }); order.classList.remove("is-sent"); },
      });
    };
    document.querySelectorAll("[data-order]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); show(); }));
    order.querySelector(".sn-order__close")?.addEventListener("click", hide);
    order.querySelector("[data-close]")?.addEventListener("click", hide);
    addEventListener("keydown", (e) => e.key === "Escape" && hide());

    const form = order.querySelector(".sn-form");
    const sum = order.querySelector("[data-sum]");
    const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const total = () => {
      let t = 0;
      form.querySelectorAll("input:checked").forEach((i) => (t += +i.dataset.price || 0));
      sum.textContent = money.format(t);
    };
    form.addEventListener("change", (e) => {
      const i = e.target;
      if (i.type !== "radio" && i.type !== "checkbox") return;
      form.querySelectorAll(`input[name="${i.name}"]`).forEach((x) => x.closest(".sn-card")?.classList.toggle("is-active", x.checked));
      total();
    });
    total();
    const fields = [...form.querySelectorAll(".sn-input[required]")];
    const check = (i) => { const ok = i.value.trim() !== ""; i.closest(".sn-field").classList.toggle("is-error", !ok); return ok; };
    fields.forEach((i) => { i.addEventListener("blur", () => check(i)); i.addEventListener("input", () => check(i)); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const bad = fields.filter((i) => !check(i));
      if (bad.length) { bad[0].focus(); return; }
      order.classList.add("is-sent");
      form.reset();
      form.querySelectorAll(".sn-card").forEach((c) => c.classList.toggle("is-active", !!c.querySelector("input:checked")));
      total();
    });
  }

  // Button press — scales to .9 over .15s, and back over .2s on release
  document.querySelectorAll(".sn-btn").forEach((b) => {
    b.addEventListener("pointerdown", () => gsap.to(b, { scale: 0.9, duration: 0.15, ease: "power2.out" }));
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, () => gsap.to(b, { scale: 1, duration: 0.2, ease: "power2.out" })));
  });

  // Footer — 1.2→1 while the photo covers in, and when the top edge touches 10% of the screen the title·cells rise in order (reverse when scrolled back)
  const foot = document.querySelector(".sn-footer");
  if (foot) {
    const q = (s) => foot.querySelector(s);
    const title = q(".sn-footer__title"), c3 = q(".is-credits"), c2 = q(".is-logo"), c1 = q(".is-menu");
    if (reduce) {
      gsap.set(q(".sn-footer__bg"), { scale: 1 });
      title.classList.add("is-visible");
    } else {
      gsap.fromTo(q(".sn-footer__bg"), { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "top 10%", scrub: true } });
      const tl = gsap.timeline({ scrollTrigger: { trigger: foot, start: "top 10%", toggleActions: "play none none reverse" } });
      tl.fromTo(title, { opacity: 0, yPercent: 20 }, {
        opacity: 1, yPercent: 0, duration: 0.6, ease: "power2.out",
        onComplete: () => title.classList.add("is-visible"),
        onReverseComplete: () => title.classList.remove("is-visible"),
      });
      tl.fromTo(c3, { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out" });
      tl.fromTo(c3.querySelectorAll(".sn-footer__box"), { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 }, "<");
      tl.fromTo(c2, { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out" });
      tl.fromTo(c2.querySelector(".sn-logo"), { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out" }, "<");
      tl.fromTo(c1, { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out" });
      tl.fromTo(c1.querySelectorAll(".sn-footer__nav a"), { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 }, "<");
    }
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
