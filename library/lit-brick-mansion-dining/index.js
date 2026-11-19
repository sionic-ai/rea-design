// Unique to the first page: the hero photo is pushed out at half speed, text fragments attach one by one over three photos to form a sentence,
// The text panels of the three intros pin to the screen center, and the FAQ switches groups by tab and measures height to expand.
(() => {
  const { ctx, lvh, reduce } = window.NL;

  if (!reduce) {
    const hero = document.querySelector(".nl-hero");
    gsap.fromTo(".nl-hero__visual", { yPercent: 0 }, { yPercent: 50, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });

    // While one section passes the bottom edge of the screen (one screen length), that section’s photo sags 50%
    const concept = document.querySelector(".nl-concept");
    concept.querySelectorAll(".nl-concept__section").forEach((s) => {
      const imgs = s.querySelectorAll(".nl-concept__img");
      ScrollTrigger.create({ trigger: s, start: "bottom bottom", end: () => "bottom+=" + lvh() + " bottom",
        onUpdate: (st) => imgs.forEach((im) => { im.style.transform = "translateY(" + 50 * st.progress + "%)"; }) });
    });
    concept.querySelectorAll(".nl-concept__part").forEach((p) => {
      ScrollTrigger.create({ trigger: p, start: "top top", endTrigger: concept, end: "bottom bottom", pin: true, pinSpacing: false });
    });

    if (ctx === "pc") document.querySelectorAll(".nl-feature").forEach((f) => {
      const m = f.querySelector(".nl-feature__main");
      ScrollTrigger.create({ trigger: m, start: "center center", endTrigger: f, end: () => "bottom-=" + m.offsetHeight / 2 + " center", pin: true, pinSpacing: false });
    });
  }

  const open = (block, on) => {
    const a = block.querySelector(".nl-faq__a");
    const inner = block.querySelector(".nl-faq__inner");
    block.classList.toggle("is-open", on);
    a.style.transitionDuration = "0s";
    a.style.height = (on ? 0 : inner.offsetHeight) + "px";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      a.style.transitionDuration = "";
      a.style.height = (on ? inner.offsetHeight : 0) + "px";
    }));
  };
  document.querySelectorAll(".nl-faq__block").forEach((b) => {
    const a = b.querySelector(".nl-faq__a");
    a.addEventListener("transitionend", () => {
      a.style.height = b.classList.contains("is-open") ? "auto" : "";
      ScrollTrigger.refresh();
    });
    b.querySelector(".nl-faq__q").addEventListener("click", () => open(b, !b.classList.contains("is-open")));
  });
  const tabs = document.querySelectorAll(".nl-faq__tab");
  const secs = document.querySelectorAll(".nl-faq__section");
  tabs.forEach((t) => t.addEventListener("click", () => {
    if (t.classList.contains("is-current")) return;
    secs.forEach((s) => s.querySelectorAll(".nl-faq__block.is-open").forEach((b) => {
      b.classList.remove("is-open");
      b.querySelector(".nl-faq__a").style.height = "";
    }));
    tabs.forEach((x) => x.classList.toggle("is-current", x === t));
    secs.forEach((s) => s.classList.toggle("is-current", s.id === t.dataset.target));
    ScrollTrigger.refresh();
  }));
})();
