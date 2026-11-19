// Start the incoming line .15 seconds before the outgoing line finishes leaving — the two sheets must overlap briefly so the panel never looks empty
(() => {
  kfFx.register("line-swap-slides", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const slides = [...el.querySelectorAll("[data-fx-part=slide]")];
      if (slides.length < 2) return;
      const num = el.querySelector("[data-fx-part=count]"), dotBox = el.querySelector("[data-fx-part=dots]");
      let cur = Math.max(0, slides.findIndex((s) => s.classList.contains("is-on")));
      slides.forEach((s, i) => s.classList.toggle("is-on", i === cur));
      if (dotBox) dotBox.innerHTML = slides.map(() => "<i></i>").join("");
      const dots = dotBox ? [...dotBox.children] : [];
      const pad = (n) => String(n).padStart(2, "0");
      const mark = (n) => {
        dots.forEach((d, i) => d.classList.toggle("is-on", i === n));
        if (num) num.textContent = `${pad(n + 1)} / ${pad(slides.length)}`;
        if (slides[n].dataset.tone) el.dataset.tone = slides[n].dataset.tone; else delete el.dataset.tone;
      };
      mark(cur);
      const go = (n) => {
        n = (n + slides.length) % slides.length;
        if (n === cur) return;
        const out = slides[cur], inn = slides[n];
        cur = n;
        mark(n);
        if (reduce) { out.classList.remove("is-on"); inn.classList.add("is-on"); return; }
        gsap.timeline()
          .to(out.children, { yPercent: -100, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: "power2.inOut" })
          .add(() => { out.classList.remove("is-on"); gsap.set(out.children, { clearProps: "all" }); inn.classList.add("is-on"); })
          .from(inn.children, { yPercent: 70, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: "power2.inOut" }, "-=0.15");
      };
      el.querySelector("[data-fx-part=next]")?.addEventListener("click", () => go(cur + 1), { signal });
      el.querySelector("[data-fx-part=prev]")?.addEventListener("click", () => go(cur - 1), { signal });
      dots.forEach((d, i) => d.addEventListener("click", () => go(i), { signal }));
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
