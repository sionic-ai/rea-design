// Motion shared by the four sub pages (work list, about, recruit, work detail) — attached only when each page has its own spot
(() => {
  const heads = (main) => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Header photo — shifts −10% with scroll (list and detail)
      main.querySelectorAll(".lp-phead__img .lp-img, .lp-dhead__img .lp-img").forEach((im) =>
        gsap.to(im, { yPercent: -10, ease: "none", scrollTrigger: { trigger: im.closest("section"), start: "top top", end: "bottom top", scrub: true } }));
      // Work detail header — after .75s photo 1.15 → 1x (5s power2.out), title and intro blur 10px and rise 10px over .8s, place and field .5s at .1 stagger, back link .5s
      const d = main.querySelector(".lp-dhead");
      if (d) {
        const im = d.querySelector(".lp-dhead__img"), t = d.querySelector(".lp-dhead__title"), ex = d.querySelector(".lp-dhead__excerpt");
        const small = d.querySelectorAll(".lp-dhead__loc, .lp-dhead__market"), back = d.querySelector(".lp-dhead__back");
        gsap.set([t, ex], { filter: "blur(10px)", opacity: 0, y: 10 }); gsap.set(im, { scale: 1.15 }); gsap.set([back, ...small], { opacity: 0 });
        LP.loaderDone.then(() => gsap.timeline({ delay: 0.75 })
          .to(im, { scale: 1, duration: 5, ease: "power2.out" })
          .to(t, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 }, "-=4")
          .to(ex, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 }, "-=4")
          .to(small, { opacity: 1, duration: 0.5, stagger: 0.1 }, "-=3.6")
          .to(back, { opacity: 1, duration: 0.5 }, "-=3.6"));
      }
      // Half-split and list header photo — around when the loader lifts, 1.15 → 1x (1.2s power2.inOut)
      const hm = main.querySelectorAll(".lp-split__img .lp-img, .lp-phead__img .lp-img");
      if (hm.length) { gsap.set(hm, { scale: 1.15 }); LP.loaderDone.then(() => gsap.to(hm, { scale: 1, duration: 1.2, ease: "power2.inOut" })); }
      // List·team cards — on first entry, rise from 10px below in .4s with .03 stagger
      const cards = main.querySelectorAll(".lp-plist .lp-icard, .lp-team__grid .lp-member");
      cards.length && gsap.from(cards, { y: 10, opacity: 0, duration: 0.4, stagger: 0.03, scrollTrigger: { trigger: cards[0], start: "top 85%" } });
    });
    // Job postings — photo preview above the row (original careers uses the same list part)
    const jw = main.querySelector(".lp-jobwrap");
    const offFollow = jw ? LP.follow(jw, jw.querySelector(".lp-news__follow"), jw, ["Office photo · meeting · landscape", "Office photo · workbench · landscape"]) : () => {};
    // List header Next — press to scroll down to the next section
    const nb = main.querySelector(".lp-phead__btn");
    const go = () => { const nx = nb.closest("section").nextElementSibling; nx && LP.lenis.scrollTo(nx, { duration: 0.6 }); };
    nb && nb.addEventListener("click", go);
    // Filter view — on tap the cards drop out in .25s (.02 stagger) and return in .4s (original list refetch)
    main.querySelectorAll(".lp-work__filters.is-tabs").forEach((bar) => bar.querySelectorAll(".lp-filter").forEach((f) => f.addEventListener("click", (e) => {
      e.preventDefault();
      bar.querySelectorAll(".lp-filter").forEach((x) => x.classList.toggle("is-active", x === f));
      const cards = main.querySelectorAll(".lp-plist .lp-icard, .lp-team__grid .lp-member");
      if (LP.reduce) return;
      gsap.timeline().to(cards, { y: 10, opacity: 0, duration: 0.25, stagger: 0.02 }).to(cards, { y: 0, opacity: 1, duration: 0.4, stagger: 0.03 });
    })));
    // Work detail tabs — underline moves in .3s and the text panel swaps in .2s
    const intro = main.querySelector(".lp-dintro");
    if (intro) {
      const bs = intro.querySelectorAll(".lp-dintro__tabs button"), line = intro.querySelector(".lp-dintro__line");
      const place = (b) => gsap.to(line, { x: b.offsetLeft, width: b.offsetWidth, duration: 0.3 });
      gsap.set(line, { x: bs[0].offsetLeft, width: bs[0].offsetWidth });
      const txt = intro.querySelector(".lp-dintro__text"), det = intro.querySelector(".lp-dintro__details");
      bs.forEach((b, i) => b.addEventListener("click", () => {
        if (b.dataset.tab === "active") return;
        bs.forEach((x) => { x.classList.toggle("is-active", x === b); x.dataset.tab = x === b ? "active" : "inactive"; });
        place(b);
        const [from, to] = i === 1 ? [txt, det] : [det, txt];
        gsap.timeline().to(from, { opacity: 0, duration: 0.2 }).add(() => intro.classList.toggle("is-details", i === 1)).fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      }));
    }
    return () => { mm.revert(); offFollow(); nb && nb.removeEventListener("click", go); };
  };
  ["works", "about", "recruit", "detail"].forEach((ns) => LP.page(ns, heads));
})();
