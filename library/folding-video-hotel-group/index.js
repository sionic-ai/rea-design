(() => {
  const { lenis, isSp, reduce, scrollTo } = window.UDS;
  const vs = (n) => (n * innerWidth) / (isSp ? 375 : 1366);
  const onScroll = (fn) => (lenis ? lenis.on("scroll", fn) : addEventListener("scroll", fn, { passive: true }));

  // ───── Hotel list ─────
  const REGION = { north: "Northern Region", capital: "Capital region", west: "Western Region", south: "Southern island", abroad: "Overseas" };
  const CAT = { hotel: "Hotel", ryokan: "Inn", resort: "Resort" };
  const plan = [["north", "ryokan"], ["capital", "ryokan"], ["capital", "hotel"], ["capital", "hotel"], ["capital", "hotel"], ["capital", "ryokan"], ["west", "hotel"], ["west", "hotel"], ["west", "hotel"], ["west", "hotel"], ["south", "hotel"], ["south", "resort"], ["south", "hotel"], ["south", "resort"], ["abroad", "hotel"]];
  const BRAND = plan.map(([place, cat], i) => ({ i, place, cat, name: `Hotel Name ${String(i + 1).padStart(2, "0")}`, loc: `${REGION[place]} · City ${String(i + 1).padStart(2, "0")}` }));
  const TYPES = [
    { k: "exterior", t: "Exterior", label: "Hotel exterior · daytime front · portrait 4:5", icon: '<path fill-rule="evenodd" d="M2 1h8v10H7.5V8h-3v3H2zM3.5 2.5v1.5h1.5V2.5zm3.5 0v1.5h1.5V2.5zM3.5 5v1.5h1.5V5zm3.5 0v1.5h1.5V5z"/>' },
    { k: "interior", t: "Interior", label: "Room interior · Natural window light · Portrait 4:5", icon: '<path d="M1 5h10v6h-1V9H2v2H1zM3 3h6v2H3z"/>' },
    { k: "food", t: "Food", label: "Close-up of a single dish · warm light · portrait 4:5", icon: '<path d="M2 1h1v3h1V1h1v3a1.5 1.5 0 01-1 1.4V11H3V5.4A1.5 1.5 0 012 4zM8 1c2 1 2 4.5 1 6v4H8z"/>' },
    { k: "activity", t: "Facility", label: "Lobby · hot spring facility · indoor light · portrait 4:5", icon: '<path d="M1 7.2c1-1 2-1 3 0s2 1 3 0 2-1 3 0v1c-1-1-2-1-3 0s-2 1-3 0-2-1-3 0zm0 2.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0v1c-1-1-2-1-3 0s-2 1-3 0-2-1-3 0z"/>' },
  ];
  const arrow = '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M0 5.5h9.3L5.8 2l.7-.7L11.2 6l-4.7 4.7-.7-.7 3.5-3.5H0z"/></svg>';
  const state = { type: "exterior", category: "", place: "" };
  const grid = document.querySelector("[data-hotel-grid]");
  const empty = document.querySelector("[data-hotel-empty]");
  const card = (h) => `<li class="h-cardItem"><button class="h-card" type="button" data-fx="inset-grow-hover" data-hotel="${h.i}">
      <span><p class="h-card__loc">${h.loc}</p><p class="h-card__cat">${CAT[h.cat]}</p></span>
      <span data-fx-part="frame">${TYPES.map((t) => `<span class="h-card__type u-ph wf-img${t.k === state.type ? " -current" : ""}" data-fx-part="photo" data-type="${t.k}" data-label="${h.name} ${t.label}"></span>`).join("")}
        <span class="u-ph wf-img" data-fx-part="alt" data-label="${h.name} Room view + hotel logo overlap · Fills the card"></span></span>
      <p class="h-card__name -en">${h.name}</p>
      <span class="h-card__arrow">${arrow}${arrow.replace("<svg", '<svg class="-after"')}</span>
    </button></li>`;
  const render = (list) => {
    grid.innerHTML = list.map(card).join("");
    empty.hidden = list.length > 0;
  };
  render(BRAND);

  document.querySelectorAll("[data-types]").forEach((box) => {
    box.innerHTML = TYPES.map((t) => `<button class="h-type -en${t.k === state.type ? " -selected" : ""}" type="button" data-type-btn="${t.k}"><span class="h-type__icon"><svg viewBox="0 0 12 12" fill="currentColor">${t.icon}</svg></span>${t.t}</button>`).join("");
  });
  // Changing the photo type turns the new type on overlapping, each card .05s later, over 1.2s power4.out
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-type-btn]");
    if (!b) return;
    const before = state.type;
    state.type = b.dataset.typeBtn;
    document.querySelectorAll("[data-type-btn]").forEach((x) => x.classList.toggle("-selected", x.dataset.typeBtn === state.type));
    grid.querySelectorAll(".h-card").forEach((c, i) => {
      c.querySelectorAll(".h-card__type").forEach((p) => p.classList.remove("-current", "-before"));
      c.querySelector(`[data-type="${before}"]`)?.classList.add("-before");
      const now = c.querySelector(`[data-type="${state.type}"]`);
      now.classList.add("-current");
      gsap.fromTo(now, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: i * 0.05, ease: "power4.out", overwrite: true });
    });
  });
  // Changing the selection makes cards shrink to .8x with a .1s delay each and vanish, switch to the filtered list, then scroll to the section top in 1.5s
  const refresh = (done) => {
    const cards = [...grid.querySelectorAll(".h-card")];
    if (!cards.length) { done(); return; }
    cards.forEach((c, i) => gsap.to(c, { scale: 0.8, duration: 0.8, delay: i * 0.1, ease: "power4.out", onComplete: () => gsap.to(c, { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => i === cards.length - 1 && done() }) }));
  };
  document.querySelectorAll("[data-filter]").forEach((sel) => sel.addEventListener("change", () => {
    state[sel.dataset.filter] = sel.value;
    const list = BRAND.filter((h) => (!state.category || h.cat === state.category) && (!state.place || h.place === state.place));
    refresh(() => { render(list); scrollTo(document.querySelector("[data-brand]"), { duration: 1.5 }); });
  }));

  // When a section heading sticks under the header bar, the second row of the header above is cropped upward by the scroll amount and the title shrinks by half (PC) · on phones, a fixed bar at the bottom
  const sec = document.querySelector("[data-brand]");
  const head = document.querySelector("[data-brand-head]");
  const header = document.querySelector(".u-header");
  const under = document.querySelector(".u-header__under");
  const spbar = document.querySelector("[data-brand-spbar]");
  let modalOpen = false, clip = 0;
  const sync = () => {
    if (!sec || modalOpen) return;
    const r = sec.getBoundingClientRect();
    if (isSp) {
      spbar.classList.toggle("-visible", r.top < innerHeight && r.bottom >= innerHeight * 0.2);
      return;
    }
    clip = Math.min(Math.max(-r.top, 0), vs(43));
    const through = r.top < vs(-50), passed = r.bottom < 0;
    head.classList.toggle("-shrink", through);
    header.style.transition = through ? "opacity 0.7s var(--u-ease), clip-path 0.7s var(--u-ease)" : "";
    if (!passed && r.top < 0) {
      gsap.to(header, { clipPath: `inset(0% 0% ${clip}px 0%)`, duration: 0.05, ease: "expo.out", overwrite: true });
      gsap.to(under, { y: -clip, duration: 0.05, ease: "expo.out", overwrite: true });
    } else {
      gsap.set(header, { clipPath: "inset(0% 0% 0% 0%)", overwrite: true });
      gsap.set(under, { y: 0, overwrite: true });
    }
  };
  onScroll(sync);
  sync();

  // ───── Hotel detail curtain ─────
  const modal = document.querySelector("[data-detail]");
  const content = modal.querySelector("[data-detail-content]");
  const back = modal.querySelector(".h-detail__backdrop");
  const photo = modal.querySelector("[data-detail-photo]");
  const thumbs = modal.querySelector("[data-detail-thumbs]");
  const fades = modal.querySelectorAll("[data-detail-fade]");
  const others = modal.querySelector("[data-detail-others]");
  others.innerHTML = BRAND.map((h) => `<li><button class="h-detail__other -en" type="button" data-other="${h.i}"><span>${h.name}</span><span class="u-ph wf-img" data-label="${h.name} Exterior · Square"></span></button></li>`).join("");
  // The large photo is an endless Splide row like the original (no drag · .9s cubic-bezier(.45,0,.55,1)) — pressing a photo slot below goes to that slide
  const SHOTS = ["Guest room", "Lobby", "Restaurant", "Bathroom", "Exterior", "Nearby Streets"];
  let shots = null;
  const fill = (h) => {
    modal.querySelector("[data-detail-loc]").textContent = h.loc;
    modal.querySelector("[data-detail-name]").textContent = h.name;
    shots?.destroy();
    modal.querySelector("[data-detail-slides]").innerHTML = SHOTS.map((t) => `<div class="splide__slide"><div class="u-ph wf-img" data-label="${h.name} ${t} · Natural light · wide landscape"></div></div>`).join("");
    thumbs.innerHTML = SHOTS.map((t, i) => `<button class="h-detail__thumb${i ? "" : " -selected"}" type="button" data-shot="${i}"><span class="u-ph wf-img" data-label="${h.name} ${t} · Square"></span></button>`).join("");
    if (window.Splide) shots = new Splide(photo, { type: "loop", drag: false, perPage: 1, arrows: false, pagination: false, focus: "center", autoWidth: true, gap: "0", updateOnMove: true, speed: 900, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }).mount();
    others.querySelectorAll("[data-other]").forEach((b) => b.classList.toggle("-selected", +b.dataset.other === h.i));
  };
  const openDetail = (h) => {
    fill(h);
    modalOpen = true;
    modal.classList.add("-open");
    modal.setAttribute("aria-hidden", "false");
    lenis?.stop();
    if (!isSp) {
      gsap.to(header, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power4.out", overwrite: true });
      gsap.to(under, { y: 0, duration: 0.5, delay: 0.2, ease: "power4.out", overwrite: true });
    }
    gsap.to(content, { opacity: 1, duration: 0.7, ease: "power2.out" });
    gsap.fromTo(photo, { opacity: 0 }, {
      opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power2.out",
      onStart: () => {
        gsap.fromTo(thumbs, { opacity: 0 }, { opacity: 1, duration: 1, delay: isSp ? 0 : 0.3, ease: "power2.out" });
        gsap.fromTo(thumbs.children, { opacity: 0 }, { opacity: 1, duration: 1.4, delay: isSp ? 0.2 : 0.5, stagger: 0.1, ease: "power2.out" });
        gsap.to(fades, { opacity: 1, duration: 1.6, delay: 0.2, ease: "power2.out", stagger: 0.25 });
      },
    });
    gsap.to(back, { opacity: 1, duration: 0.4, ease: "power3.out" });
  };
  const closeDetail = () => {
    modal.setAttribute("aria-hidden", "true");
    gsap.to(content, { opacity: 0, duration: 0.6, delay: 0.2, ease: "power2.out" });
    gsap.to(fades, { opacity: 0, duration: 1.6, ease: "power2.out" });
    gsap.to(back, { opacity: 0, duration: 0.6, ease: "power3.out", onComplete: () => { modal.classList.remove("-open"); lenis?.start(); } });
    if (!isSp) {
      gsap.to(header, { clipPath: `inset(0% 0% ${clip}px 0%)`, delay: 0.1, duration: 0.5, ease: "power4.out", overwrite: true });
      gsap.to(under, { y: -clip, duration: 0.5, ease: "power4.out", overwrite: true, onComplete: () => { modalOpen = false; } });
    } else modalOpen = false;
  };
  grid.addEventListener("click", (e) => { const c = e.target.closest("[data-hotel]"); if (c) openDetail(BRAND[+c.dataset.hotel]); });
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-detail-close]")) closeDetail();
    const o = e.target.closest("[data-other]");
    if (o) {
      const inner = modal.querySelector(".h-detail__main");
      gsap.to(inner, { opacity: 0, duration: 0.3, ease: "power4.out", onComplete: () => { fill(BRAND[+o.dataset.other]); gsap.to(inner, { opacity: 1, duration: 0.8, ease: "power4.out" }); } });
    }
    const t = e.target.closest(".h-detail__thumb");
    if (t) { thumbs.querySelectorAll(".h-detail__thumb").forEach((x) => x.classList.toggle("-selected", x === t)); shots?.go(+t.dataset.shot); }
  });
  addEventListener("keydown", (e) => e.key === "Escape" && modal.classList.contains("-open") && closeDetail());

  // ───── Intro: draw the airship, then a paper plane ─────
  const plane = document.querySelector("[data-intro-plane]");
  if (window.Vivus && plane) {
    if (reduce) gsap.set(plane, { opacity: 1 });
    else {
      const line = new Vivus("intro-line", { type: "oneByOne", start: "manual", duration: 100, animTimingFunction: Vivus.EASE }, () => {
        gsap.fromTo(plane, { opacity: 0, xPercent: isSp ? -20 : -15, yPercent: isSp ? 20 : 15 }, { opacity: 1, xPercent: 0, yPercent: 0, duration: 1.3, ease: "power3.out" });
      });
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { line.play(); io.disconnect(); } }, { rootMargin: isSp ? "-50% 0px" : "-20% 0px" });
      io.observe(document.querySelector("[data-intro]"));
    }
  }

  // ───── Travel notes carousel ─────
  const SLIDES = 7;
  const list = document.querySelector("[data-journal-list]");
  const bgs = document.querySelector("[data-journal-bgs]");
  list.innerHTML = Array.from({ length: SLIDES }, (_, i) => `<li class="splide__slide h-slide"><a class="h-slide__link" href="#">
      <div class="h-slide__titles"><p class="h-slide__text">Your travel story title here<br>Set in two lines.</p><p class="h-slide__loc -en">Hotel Name ${String(i + 1).padStart(2, "0")}</p></div>
      <div class="h-slide__img u-ph wf-img" data-label="Room · street scenery photo ${String(i + 1).padStart(2, "0")} · Window light · landscape"></div>
      <div class="h-slide__foot"><p class="h-slide__num -en">( ${String(i + 1).padStart(2, "0")} )</p><span class="h-slide__mark u-ph wf-img" data-label="Hotel Logo"></span></div>
    </a></li>`).join("");
  bgs.innerHTML = Array.from({ length: SLIDES }, (_, i) => `<div class="h-journal__bg${i ? "" : " -focus"}"><div class="u-ph wf-img" data-label="Travel note ${String(i + 1).padStart(2, "0")} Background · dark guest room · full-bleed landscape"></div></div>`).join("");
  if (window.Splide) {
    const sp = new Splide(".h-journal__splide", {
      type: "loop", drag: true, width: "100%", gap: "2vw", autoWidth: true, focus: "center", easing: "cubic-bezier(.04,.66,.48,1)", speed: 1700,
      arrows: true, pagination: true, perPage: 1, perMove: 1, flickPower: 80, flickMaxPages: 1, keyboard: true, dragMinThreshold: { mouse: 50, touch: 50 },
      breakpoints: { 800: { speed: 800, gap: "-2vw" } },
    });
    const focus = (idx) => {
      sp.Components.Slides.get(true).forEach((s) => s.slide.classList.toggle("-focus", s.index === idx));
      bgs.querySelectorAll(".h-journal__bg").forEach((b, i) => b.classList.toggle("-focus", i === idx));
    };
    sp.on("mounted", () => focus(sp.index));
    sp.on("move", (idx) => focus(idx));
    sp.mount();
  }

  // ───── Shop photo parallax — the original sets the start point as ”section top edge one screen-width below” (passing width instead of height, as is) ─────
  const par = [...document.querySelectorAll("[data-parallax]")].map((el) => ({ el, inner: el.querySelector("[data-parallax-inner]") }));
  const measure = () => par.forEach((p) => {
    const r = p.el.getBoundingClientRect(), y = scrollY;
    p.start = r.top + y - innerWidth;
    p.end = r.bottom + y;
    p.diff = p.el.clientHeight - p.inner.clientHeight;
  });
  const parallax = () => {
    if (reduce) return;
    const y = lenis ? lenis.scroll : scrollY;
    par.forEach((p) => {
      if (getComputedStyle(p.el).display === "none") return;
      const prog = (y - p.start) / (p.end - p.start);
      gsap.to(p.inner, { y: p.diff * prog * -1, duration: 0.05, ease: "expo.out", overwrite: true });
    });
  };
  measure();
  parallax();
  onScroll(parallax);
  addEventListener("resize", () => { measure(); parallax(); });
  addEventListener("load", () => { measure(); parallax(); });

  // ───── News row ─────
  const dates = ["2026.11.02", "2026.10.28", "2026.10.01", "2026.09.24", "2026.09.17", "2026.09.03", "2026.09.03"];
  document.querySelector("[data-news-rows]").innerHTML = dates.map((d, i) => `<li><a class="u-newsRow" href="article.html">
      <div class="u-newsRow__img"><div class="u-ph wf-img" data-label="News thumbnail ${i + 1} · Landscape 16:9"></div></div>
      <div class="u-newsRow__text"><p class="u-newsRow__title">NEWS | Put a long one-line news headline here — even the event name and date ${String(i + 1).padStart(2, "0")}</p><p class="u-newsRow__date -en">${d}</p></div>
    </a></li>`).join("");
})();
