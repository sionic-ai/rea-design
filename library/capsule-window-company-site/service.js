// Business intro: pill filter (on exit down 100px · .4s, on enter from 60% below · .94 scale at 1.1s power4.out), card capsule photo swaps every 3 seconds.
uSite.scene(({ reduce }) => {
  const list = document.querySelector("[data-cards]");
  const empty = document.querySelector("[data-empty]");
  const pills = [...document.querySelectorAll(".sv-pill")];
  pills.forEach((p) => {
    p.setAttribute("aria-pressed", "false");
    p.addEventListener("click", () => p.setAttribute("aria-pressed", String(p.getAttribute("aria-pressed") !== "true")));
  });

  let busy = false;
  const apply = async () => {
    if (busy) return;
    busy = true;
    const on = pills.filter((p) => p.getAttribute("aria-pressed") === "true").map((p) => p.dataset.f.split(":"));
    const units = on.filter(([k]) => k === "unit").map(([, v]) => v);
    const fields = on.filter(([k]) => k === "field").map(([, v]) => v);
    if (!reduce) {
      gsap.to(list, { y: 100, duration: 0.4, ease: "power2.inOut" });
      await gsap.to(list, { opacity: 0, duration: 0.2, ease: "none" });
    }
    gsap.set(list, { y: 0, opacity: 1 });
    const shown = [...list.children].filter((li) => {
      const ok = (!units.length || units.includes(li.dataset.unit)) && (!fields.length || fields.some((f) => li.dataset.field.split(" ").includes(f)));
      li.hidden = !ok;
      return ok;
    });
    empty.hidden = shown.length > 0;
    if (!reduce && shown.length) {
      gsap.fromTo(shown, { yPercent: 60, scale: 0.94 }, { yPercent: 0, scale: 1, duration: 1.1, ease: "power4.out", stagger: 0.05 });
      gsap.fromTo(shown, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.inOut", stagger: 0.05 });
    }
    window.lenis?.resize();
    ScrollTrigger.refresh();
    busy = false;
  };
  document.querySelector("[data-filter-apply]").addEventListener("click", apply);
  document.querySelector("[data-filter-clear]").addEventListener("click", () => {
    pills.forEach((p) => p.setAttribute("aria-pressed", "false"));
    apply();
  });

  // In the original, not per card but one clock (3 seconds) advances all capsules together
  const carousels = [...document.querySelectorAll("[data-carousel]")];
  if (!reduce) setInterval(() => {
    carousels.forEach((c) => {
      const slides = [...c.children];
      const i = slides.findIndex((s) => s.classList.contains("is-in"));
      slides[i].classList.remove("is-in");
      slides[(i + 1) % slides.length].classList.add("is-in");
    });
  }, 3000);
});
