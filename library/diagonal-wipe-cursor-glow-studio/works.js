// Work list — original Work·WorkItems: during one screen of the pinned title, blur 1.2rem and transparent (.3), grid comes in (first two cells clip 2s power3.out · the rest from 5rem below, 2s, .1 stagger),
// Filtering and view switching return to the top after .25s and re-enter, the end green panel goes from height 0 → .44 of screen width (scrub)
(() => {
  const ES = window.ES;
  const { q, qa } = ES;
  ES.pages.works = (root, api) => {
    const sec = q(".es-archive", root);
    const grid = q(".es-archive-grid", sec), list = q(".es-archive-list", sec);
    const filter = q(".es-filter", sec), switches = qa(".es-switch", sec);
    let view = "grid", ctx = null;

    if (!ES.reduce) {
      gsap.timeline({ scrollTrigger: { trigger: q(".es-archive-title-wrap", sec), start: "top top", end: () => `+=${innerHeight}`, pin: true, pinSpacing: false, scrub: true } })
        .to(sec, { duration: 1 }, 0)
        .to(q(".es-archive-title", sec), { autoAlpha: 0, filter: "blur(1.2rem)", duration: 0.3 }, 0);
      gsap.timeline({ scrollTrigger: { trigger: q(".es-archive-cta-wrap", sec), start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } })
        .fromTo(q(".es-archive-cta", sec), { height: 0 }, { height: () => innerWidth * 0.44, ease: "none" });
    } else gsap.set(q(".es-archive-cta", sec), { height: () => innerWidth * 0.44 });

    const gridIn = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        const rest = qa(".es-project:not(.is-inactive)", grid).slice(2);
        if (!ES.reduce) gsap.fromTo(rest, { autoAlpha: 0, y: "5rem" }, { autoAlpha: 1, y: 0, duration: 2, ease: "power3.out", stagger: 0.1 });
      });
    };
    // Original listIn: row 7.4rem · first row 26rem (photo 22rem), list height = Screen .5 + sum of line heights + screen 4, pinned while the lines unfold one by one.
    // Entrance at .2 intervals per row — line clip 1.4s power3.inOut, photo clip (.1 later), number · name · title from 105% below in 1.6s power3.out (.06 stagger)
    const listIn = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        const rows = qa(".es-row:not(.is-inactive)", list);
        const rem = ES.rem, H = innerHeight;
        rows.forEach((r, k) => {
          q(".es-row-number", r).textContent = String(k + 1).padStart(2, "0");
          [".es-row-number", ".es-row-client", ".es-row-title"].forEach((c) => { const el = q(c, r); if (!el.firstElementChild) el.innerHTML = `<span>${el.textContent}</span>`; });
        });
        if (!ES.mobile) {
          const h = rem(7.4), ah = rem(26), ih = rem(3.4), aih = rem(22);
          const total = Math.ceil(h * (rows.length - 1) + ah), offCenter = H * 0.6 - (H - ah) * 0.5;
          const base = 1.5, dur = base / Math.max(1, rows.length - 1), finalStart = 0.1 + base;
          const dist = H * 0.5 + total + H * 4;
          gsap.set([list, q(".es-list-wrapper", list)], { height: dist });
          gsap.set(rows[0], { height: ah });
          gsap.set(q(".es-row-media", rows[0]), { height: aih, autoAlpha: 1 });
          if (!ES.reduce) {
            const st = gsap.timeline({ scrollTrigger: { trigger: q(".es-list-wrapper", list), start: "top top", end: "bottom bottom", pin: true, scrub: true, pinSpacing: false }, defaults: { ease: "none", duration: dur } })
              .to(q(".es-list-inner", list), { y: -offCenter, ease: "power1.out", duration: 0.2 }, 0)
              .to(q(".es-list-projects", list), { y: -(total - H + (H - ah)), duration: base }, 0.1);
            rows.forEach((r, k) => {
              const m = q(".es-row-media", r), at = 0.1 + k * dur, prev = at - dur;
              if (k === 0) { st.to(r, { height: h }, 0.1).to(m, { height: ih, autoAlpha: 0 }, 0.1); return; }
              if (k !== rows.length - 1) st.to(r, { height: h }, at).to(m, { height: ih, autoAlpha: 0 }, at);
              else st.to(r, { height: h, duration: 0.4 }, finalStart).to(m, { height: ih, autoAlpha: 0, duration: 0.4 }, finalStart);
              st.to(r, { height: ah }, prev).to(m, { height: aih, autoAlpha: 1 }, prev);
            });
          }
        }
        if (ES.reduce) return;
        // Measured on the original, the line is drawn first and the text rises .2s later (while a border-light canvas is set up per line and the text is split)
        const tl = gsap.timeline();
        rows.forEach((r, k) => {
          const s0 = k * 0.2;
          tl.fromTo(q(".es-row-border", r), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power3.inOut" }, s0)
            .fromTo(q(".es-row-media", r), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "power3.inOut" }, s0 + 0.1)
            .fromTo(q(".es-row-number > span", r), { yPercent: 105 }, { yPercent: 0, duration: 1.6, ease: "power3.out" }, s0 + 0.2)
            .fromTo(q(".es-row-client > span", r), { yPercent: 105 }, { yPercent: 0, duration: 1.6, ease: "power3.out" }, s0 + 0.3)
            .fromTo(q(".es-row-title > span", r), { yPercent: 105 }, { yPercent: 0, duration: 1.6, ease: "power3.out" }, s0 + 0.4);
        });
      });
    };

    // Original out()/in(): withdraws panel opacity in .4s (css), after .25s returns to the top and sets up another panel, then turns it on again in .4s
    const swap = (fn) => {
      grid.classList.remove("is-loaded");
      list.classList.remove("is-loaded");
      setTimeout(() => {
        ES.lenis ? ES.lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
        fn();
        grid.classList.toggle("is-active", view === "grid");
        list.classList.toggle("is-active", view === "list");
        view === "grid" ? gridIn() : listIn();
        (view === "grid" ? grid : list).classList.add("is-loaded");
        ES.refresh();
      }, ES.reduce ? 0 : 250);
    };

    // Original WorkFilter: on open width 23.5rem · height auto (.6s power3.out), on close width auto · height 4rem (.3s)
    let open = false;
    const toggle = (v = !open) => {
      open = v;
      filter.classList.toggle("is-open", open);
      gsap.to(filter, open ? { width: "23.5rem", height: "auto", duration: ES.reduce ? 0 : 0.6, ease: "power3.out", overwrite: "auto" } : { width: "auto", height: "4rem", duration: ES.reduce ? 0 : 0.3, ease: "power3.out", overwrite: "auto" });
    };
    q(".es-filter-select", filter).addEventListener("click", () => toggle());
    document.addEventListener("click", (e) => { if (open && !filter.contains(e.target)) toggle(false); });
    qa(".es-filter-btn", filter).forEach((b) => b.addEventListener("click", () => {
      qa(".es-filter-btn", filter).forEach((x) => x.classList.toggle("is-active", x === b));
      toggle(false);
      const v = b.dataset.value;
      qa(".es-filter-select .es-roll > span", filter).forEach((x) => { x.textContent = v === "all" ? "Filter work" : b.textContent; });
      swap(() => qa(".es-project, .es-row", sec).forEach((p) => p.classList.toggle("is-inactive", v !== "all" && !p.dataset.services.split(" ").includes(v))));
    }));
    switches.forEach((s) => s.addEventListener("click", () => {
      if (s.classList.contains("is-active")) return;
      switches.forEach((x) => x.classList.toggle("is-active", x === s));
      view = s.dataset.view;
      swap(() => {});
    }));

    // Enter — original introTl: filter · view button clip (expo.inOut, .15), title blur resolve, first two cells clip (2s power3.out, .08 gap)
    if (!ES.reduce) {
      api.intro.clip(filter, { ease: "expo.inOut" }, 0.15)
        .clip(switches, { ease: "expo.inOut", stagger: 0.05 }, 0.15)
        .moveBlur(q(".es-archive-title-text", sec), {}, 0)
        .clip(qa(".es-project", grid).slice(0, 2), { stagger: 0.08, ease: "power3.out", duration: 2 }, 0);
    }
    // Initial state of the list rows — set in advance so values don’t jump when switching views (the original also starts with the rows hidden)
    qa(".es-row", list).forEach((r) => {
      [".es-row-number", ".es-row-client", ".es-row-title"].forEach((c) => { const el = q(c, r); if (!el.firstElementChild) el.innerHTML = `<span>${el.textContent}</span>`; });
      if (ES.reduce) return;
      gsap.set(qa(".es-row-number > span, .es-row-client > span, .es-row-title > span", r), { yPercent: 105 });
      gsap.set(q(".es-row-border", r), { clipPath: "inset(0 100% 0 0)" });
      gsap.set(q(".es-row-media", r), { clipPath: "inset(0 0 100% 0)" });
    });
    gridIn();
    grid.classList.add("is-loaded");
    return { destroy: () => ctx?.revert() };
  };
})();
