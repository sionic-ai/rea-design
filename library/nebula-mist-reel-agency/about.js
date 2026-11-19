// About — header letters switch on at random, paragraph lights up one letter at a time (scrub), dictionary card typing, big text writing in (scrub), line drawing, number counting, FAQ open and close.
(() => {
  const { split, reduce } = window.PS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  document.addEventListener("ps:ready", () => {
    const block = $("[data-reveal-text]");
    const blockChars = $$("p", block).flatMap((p) => {
      const out = [];
      [...p.childNodes].forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement("span"); s.textContent = n.textContent; n.replaceWith(s); out.push(...split(s)); }
        else if (n.nodeType === 1) out.push(...split(n));
      });
      return out;
    });
    // Dictionary card: leave the search field text empty, then type it one character at a time
    const q = $(".define__q");
    const word = q.dataset.type;
    q.textContent = "";
    const rows = $$(".define__row, .define__foot");
    accordion();
    if (reduce) { q.textContent = word; return; }

    // Header (original About hero): gray line −175% and white line +175% at 1s power3.out, center line scaleX 1s, scroll-down button from 16px below at .9s (+.3)
    gsap.timeline({ delay: 0.3 })
      .fromTo(".a-hero__line", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.out" })
      .fromTo(".a-hero__title .grey", { xPercent: -175 }, { xPercent: 0, duration: 1, ease: "power3.out" }, "<")
      .fromTo(".a-hero__title .white", { xPercent: 175 }, { xPercent: 0, duration: 1, ease: "power3.out" }, "<")
      .fromTo(".a-hero__cue", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, "<+=0.5");
    // On scroll down the head stays attached (no offset, scrub .5), two lines pull out to both sides and the line flattens
    gsap.timeline({ scrollTrigger: { trigger: ".a-hero", start: "top top", end: "bottom top", pin: true, pinSpacing: false, scrub: 0.5 } })
      .to(".a-hero__line", { scaleY: 0, opacity: 0, duration: 1 })
      .to(".a-hero__cue", { opacity: 0, duration: 0.25 }, 0)
      .fromTo(".a-hero__title .grey", { xPercent: 0 }, { xPercent: -175, duration: 1 }, "<")
      .fromTo(".a-hero__title .white", { xPercent: 0 }, { xPercent: 175, duration: 1 }, "<");

    // Filled-in text (original OnScrollFilledText): letters .3 → 1, scrub, start -15% 75% · end 115% 70%, spacing .05
    gsap.to(blockChars, { opacity: 1, duration: 0.1, stagger: 0.05, scrollTrigger: { trigger: block, start: "-15% 75%", end: "115% 70%", scrub: true } });
    // Growing together: label rolls .9s (turns on across .35) · line draws .7s at .1 · big text lights up from the left over .9s at .2 (gradient position 100%→0%)
    const collabLabel = split(document.querySelector(".a-collab .a-title-line h2"));
    gsap.timeline({ scrollTrigger: { trigger: ".a-collab", start: "top 90%" } })
      .to(collabLabel, { duration: 0.9, scrambleText: { text: "{original}", chars: "upperCase", tweenLength: false } }, 0)
      .from(collabLabel, { opacity: 0, duration: 0.01, stagger: { amount: 0.35, from: "random" } }, 0)
      .fromTo(".a-collab .ps-line", { width: "0%", opacity: 0 }, { width: "100%", opacity: 1, duration: 0.7, ease: "power3.out" }, 0.1)
      .fromTo("[data-type-scrub]", { backgroundPosition: "100% 0%" }, { backgroundPosition: "0% 0%", duration: 0.9, ease: "power3.out" }, 0.2);

    ScrollTrigger.create({ trigger: ".define", start: "top 75%", once: true, onEnter: () => {
      const tl = gsap.timeline();
      [...word].forEach((c, i) => tl.call(() => (q.textContent = word.slice(0, i + 1)), null, 0.3 + i * 0.12));
      tl.to(rows, { opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.12 }, "+=0.3");
    } });

    $$(".a-story .a-title-line .ps-line, .ethos .ps-line").forEach((l) => gsap.from(l, { scaleX: 0, duration: 1.5, ease: "power2.inOut", scrollTrigger: { trigger: l, start: "top 90%" } }));
    $$(".ethos__grid").forEach((g) => gsap.from(g.children, { opacity: 0, y: 24, duration: 1, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: g, start: "top 85%" } }));
    $$(".team li").forEach((li, i) => gsap.from(li, { opacity: 0, y: 40, duration: 1, ease: "power3.out", delay: (i % 4) * 0.08, scrollTrigger: { trigger: li, start: "top 92%" } }));

    $$("[data-count]").forEach((el) => {
      const from = Number(el.dataset.countFrom || 0), to = Number(el.dataset.count), suf = el.dataset.suffix || "";
      const o = { v: from };
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => gsap.to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v) + suf) }) });
    });
    // The snow video recedes from 1.15 → 1 while passing through the section
    gsap.fromTo(".a-ethos__bg", { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".a-ethos__title", start: "top bottom", end: "bottom top", scrub: true } });
  });

  function accordion() {
    const items = $$(".acc__item");
    items.forEach((it) => {
      const head = $(".acc__head", it), body = $(".acc__body", it);
      head.addEventListener("click", () => {
        const open = !it.classList.contains("is-open");
        items.forEach((o) => {
          if (o === it || !o.classList.contains("is-open")) return;
          o.classList.remove("is-open"); $(".acc__head", o).setAttribute("aria-expanded", "false");
          gsap.fromTo($(".acc__body", o), { height: $(".acc__body", o).scrollHeight }, { height: 0, duration: 0.5, ease: "power3.inOut" });
        });
        it.classList.toggle("is-open", open);
        head.setAttribute("aria-expanded", String(open));
        if (reduce) return;
        if (open) gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.5, ease: "power3.inOut" });
        else gsap.fromTo(body, { height: body.scrollHeight }, { height: 0, duration: 0.5, ease: "power3.inOut" });
      });
    });
  }
})();
