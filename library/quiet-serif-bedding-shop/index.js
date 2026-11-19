// First page (original script-index-*.js).
// Hero: the copy turns on right away in .5s ease-in-out, and 1.5s later the pill · certification badge · consultation board turn on in the same .5s.
// Features: divides the scroll share of a 300vh panel (top edge at screen top → bottom edge at screen bottom) by the item count, turns on only the current item in .3s, and the left bar fills by that share (all on for phones).
// Parallax photos: yPercent −200 · −200 · −300 while the whole section passes (scrub 1.5 · 2 · 3).
// Consultation panel: once, when the panel’s top edge reaches the screen center — wide screens: bubble1 → bubble2 → text (.9s each, overlapping .2s), phone: text → bubble1 → bubble2.
(() => {
  const { NM } = window;
  const photos = ["Smiling person under a blanket on a bed by the window · morning light · square", "Mother lying down with her baby · soft indoor light · square", "Small bedroom mattress and lighting · evening light · square", "Pet doll on a mattress · Interior light · Square", "Child rolling around on a mattress · natural light · square", "Book and glasses on the bed · evening light · square"];
  const fill = () => {
    const vc = document.querySelector(".vc__list");
    vc.innerHTML = photos.map((p, i) => `<li><div class="nm-ph"><div class="wf-img" data-label="${p}"></div></div>
      <div class="vc__content"><h3>user_name_0${i + 1}</h3><p>Your reviewer’s comment here, in five or six lines. Next, a story that setup is easy and light, then a story that mornings feel fresher. If a longer review follows, the bottom fades out and is cut off.</p>
      <p class="vc__link"><a href="#">View all</a></p></div></li>`).join("");
    const nw = document.querySelector(".nw__list");
    nw.innerHTML = ["Event info illustration under a night sky · dark navy · landscape 330:195", "Mattress display in a hotel room · indoor light · 330:195 landscape", "Mattresses on a store display · indoor light · landscape 330:195"].map((p, i) => `<li><a href="article.html">
      <div class="nm-ph"><div class="wf-img" data-label="${p}"></div></div><h3>Your news title here, long, in two to three lines ${i + 1} — Name of your partner here</h3><time>2026.00.0${i + 1}</time></a></li>`).join("");
    const fq = document.querySelector(".fq__list");
    fq.innerHTML = ["How is a mattress assessment done?", "Will the mattress from your diagnosis result ease your shoulder and back concerns?", "How do I return an item?", "Please tell me about the warranty terms."].map((q) => `<details class="nm-qa"><summary><span class="nm-qa__q"><b>Q</b>${q}</span>
      <svg class="nm-qa__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><div class="nm-qa__a"><p>The first line of the answer here. Follow with one line listing what the diagnosis asks (height, weight, sleeping position, concerns, preferences).</p><p>Your two-line explanation goes here of what structure and material are chosen based on the answers. Add one line naming the reviewer and credentials.</p><p>Your one line here on what you can change after getting your diagnosis result and how to retake it. Add one more line of guidance for when the result feels off.</p><p>Your pointer to more detailed guidance here.</p></div></details>`).join("");
    const mo = document.querySelector(".mo__track");
    const strip = ["Person reading on a mattress", "Bedroom View", "Pillow Close-up", "Morning curtains and bed", "Hand tidying the bedding"].map((p) => `<div class="nm-ph"><div class="wf-img" data-label="${p} · Horizontal band"></div></div>`).join("");
    mo.innerHTML = strip + strip;
  };
  fill();

  NM.page = () => {
    const { reduced } = NM;
    const hero = document.querySelector("[data-hero]");
    const copy = hero.querySelector("[data-copy]");
    const later = hero.querySelectorAll("[data-later]");
    if (reduced) [copy, ...later].forEach((el) => el.classList.add("is-on"));
    else {
      setTimeout(() => copy.classList.add("is-on"), 0);
      setTimeout(() => later.forEach((el) => el.classList.add("is-on")), 1500);
    }

    const sec = document.querySelector("[data-feature]");
    const units = sec.querySelectorAll("[data-feature-item]");
    const bars = sec.querySelectorAll("[data-feature-bar]");
    const watch = (progress) => {
      const p = progress * 100;
      if (innerWidth < 767) return units.forEach((u) => u.classList.add("is-active"));
      units.forEach((u, i) => {
        const a = (100 / units.length) * i, b = (100 / units.length) * (i + 1);
        u.classList.toggle("is-active", (p >= a && p < b) || (p < 0 && i === 0) || (p >= 100 && i === units.length - 1));
      });
      bars.forEach((bar, i) => {
        const a = (100 / bars.length) * i, b = (100 / bars.length) * (i + 1);
        bar.style.height = p >= b ? "100%" : p < a ? "0%" : ((p - a) / (b - a)) * 100 + "%";
      });
    };
    watch(0);
    ScrollTrigger.create({ trigger: sec.querySelector("[data-feature-scroller]"), start: "top top", end: "bottom bottom", onUpdate: (s) => watch(s.progress) });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const imgs = document.querySelector("[data-images]");
      imgs.querySelectorAll("[data-images-item]").forEach((it) => {
        gsap.to(it, { yPercent: -(+(it.dataset.move ?? 0)), ease: "none", scrollTrigger: { trigger: imgs, start: "top bottom", end: "bottom top", scrub: +(it.dataset.scrub ?? 1) } });
      });
    });

    document.querySelectorAll("[data-cta]").forEach((sec2) => {
      const panel = sec2.querySelector("[data-cta-panel]");
      const b1 = panel.querySelector("[data-cta-b1]"), b2 = panel.querySelector("[data-cta-b2]"), content = sec2.querySelector("[data-cta-content]");
      if (reduced) return void gsap.set([b1, b2, content], { opacity: 1 });
      ScrollTrigger.create({
        trigger: panel, start: "top 50%", once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          if (innerWidth > 767) tl.to(b1, { opacity: 1, duration: 0.9 }).to(b2, { opacity: 1, duration: 0.9 }, "-=0.7").to(content, { opacity: 1, duration: 0.9 }, "-=0.7");
          else tl.to(content, { opacity: 1, duration: 0.9 }).to(b1, { opacity: 1, duration: 0.9 }, "-=0.7").to(b2, { opacity: 1 }, "-=0.7");
        },
      });
    });
  };
})();
