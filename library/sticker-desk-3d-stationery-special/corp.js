// Shared across company site sections: header white/dark, menu panel (cards drop and stand tilted), section group expand button, hatch reveal, pinned Hero, back to top
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelector(".ky-head");
  const fv = document.querySelector("[data-fv]");
  // Original about.js — white text if the hero hangs below the header line (−70px)
  if (head && fv && document.body.dataset.page !== "sustainability") {
    new IntersectionObserver((es) => es.forEach((e) => head.toggleAttribute("data-white", e.isIntersecting)), { rootMargin: "-70px 0px 0px 0px" }).observe(fv);
  }

  // Menu panel — each time it opens, cards drop from above and settle at different tilts (in the original gnaviGroupUnit the tilt and offset differ every time it opens)
  const toggle = document.querySelector(".ky-head__toggle"), drawer = document.querySelector(".ky-drawer");
  const rand = (a, b) => a + Math.random() * (b - a);
  toggle?.addEventListener("click", () => {
    const on = !head.classList.contains("is-open");
    if (on) drawer.querySelectorAll("li").forEach((li) => {
      li.style.setProperty("--tx", `${rand(-7, 7).toFixed(2)}rem`);
      li.style.setProperty("--ty", `${rand(40, 48).toFixed(2)}rem`);
      li.style.setProperty("--tr", `${rand(-10, 10).toFixed(2)}deg`);
    });
    head.classList.toggle("is-open", on); drawer.classList.toggle("is-open", on);
    // Like the original, raise the panel then expand on the next frame so the bundle card expands from the collapsed width (100) and the interior design card is seen rising from 0
    requestAnimationFrame(() => drawer.classList.toggle("is-wide", on));
    toggle.setAttribute("aria-expanded", String(on));
    document.documentElement.style.overflow = on ? "hidden" : "";
  });

  // Section bundle expand button — on hover the color piece inside the button switches immediately to the next brand color, and on press the bundle expands in .233s
  let chipIndex = 1;
  document.querySelectorAll(".ky-gcategoryButton").forEach((b) => {
    const chip = b.querySelector(".ky-gcategoryButton__chip");
    const next = (e) => { if (e.pointerType === "mouse" && chip) chip.style.color = ky.palette("frame")[++chipIndex % 8].hex; };
    b.addEventListener("pointerenter", next);
    b.addEventListener("pointerleave", (e) => setTimeout(() => next(e), 70));
    b.addEventListener("click", () => {
      const unit = b.closest(".tp-gnavi__unit");
      const on = !unit.classList.contains("is-open");
      unit.classList.toggle("is-open", on);
      b.setAttribute("aria-expanded", String(on));
    });
  });

  // First photo dots — pressing another dot goes to that section, pressing the current dot restarts the advance count from the beginning. During the 4s recount the dot interior is empty (original progress dot)
  document.querySelectorAll(".ab-fv__ind").forEach((b, _, all) => b.addEventListener("click", () => {
    if (!b.classList.contains("is-current")) { all.forEach((x) => x.classList.toggle("is-current", x === b)); return; }
    b.classList.add("is-counting");
    clearTimeout(b.countTimer);
    b.countTimer = setTimeout(() => b.classList.remove("is-counting"), 4000);
  }));

  document.querySelectorAll(".ky-totop").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })));

  // Hatch reveal — measures the panel size, then plays once when visible
  const ro = new ResizeObserver((es) => es.forEach((e) => {
    e.target.style.setProperty("--swipew", Math.round(e.borderBoxSize[0].inlineSize));
    e.target.style.setProperty("--swipeh", Math.round(e.borderBoxSize[0].blockSize));
  }));
  const show = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-show");
    show.unobserve(e.target);
  }), { rootMargin: "0px 0px -10% 0px", threshold: 0 });
  document.querySelectorAll(".ky-slash").forEach((el) => {
    if (reduce) { el.classList.add("is-done"); return; }
    ro.observe(el); show.observe(el);
    el.addEventListener("animationend", (e) => { if (e.animationName === "ky-showslash") { el.classList.add("is-done"); ro.unobserve(el); } });
  });

  // Pinned hero (original company hero) — while the panel is pinned to the screen, the section is chosen by scroll share
  document.querySelectorAll("[data-carousel=scroll]").forEach((car) => {
    const slides = [...car.querySelectorAll("[data-slide]")], num = car.querySelector("[data-num]"), pin = car.parentElement;
    let i = 0;
    const pick = () => {
      const r = pin.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
      const k = Math.min(slides.length - 1, Math.max(0, Math.floor((-r.top / span) * slides.length)));
      if (k === i) return;
      slides[i].classList.remove("is-active"); i = k; slides[i].classList.add("is-active");
      if (num) num.textContent = `${i + 1} / ${slides.length}`;
    };
    addEventListener("scroll", pick, { passive: true });
  });
})();
