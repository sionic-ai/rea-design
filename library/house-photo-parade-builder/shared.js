// Header row scroll state, menu drawer, reveal detection and banner strip — shared by all pages
(() => {
  const body = document.body;
  const header = document.querySelector(".uh-header");
  const hm = document.querySelector(".uh-hm");
  const gn = document.querySelector(".uh-gn");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => innerWidth <= 768;

  // Header bar: past 20px (10px on phones) it slips up, then .26s later comes back down as a 70px band, and on scrolling back up it slips up, then .4s later returns to its initial type
  if (header) {
    let on = false, addTimer = 0, removeTimer = 0;
    const set = (...c) => { header.classList.add(...c); hm?.classList.add(...c); };
    const unset = (...c) => { header.classList.remove(...c); hm?.classList.remove(...c); };
    const add = () => {
      if (on) return;
      on = true; clearTimeout(addTimer); clearTimeout(removeTimer);
      unset("sc-out"); set("sc");
      body.classList.remove("is-header-sc-out"); body.classList.add("is-header-sc");
      addTimer = setTimeout(() => { set("sc-in"); body.classList.add("is-header-sc-in"); }, 260);
    };
    const remove = () => {
      if (!on) return;
      on = false; clearTimeout(addTimer); clearTimeout(removeTimer);
      set("sc-out"); body.classList.add("is-header-sc-out");
      removeTimer = setTimeout(() => {
        unset("sc", "sc-in", "sc-out");
        body.classList.remove("is-header-sc", "is-header-sc-in", "is-header-sc-out");
      }, 400);
    };
    const check = () => (scrollY > (isSP() ? 10 : 20) ? add() : remove());
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // Menu drawer: opens and closes with a round button, the + button inside the drawer unfolds the list below
  if (hm && gn) {
    const toggle = (open) => {
      hm.classList.toggle("open", open);
      gn.classList.toggle("open", open);
      hm.setAttribute("aria-expanded", String(open));
      hm.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    hm.addEventListener("click", () => toggle(!gn.classList.contains("open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && gn.classList.contains("open")) toggle(false); });
    gn.querySelectorAll(".uh-gn-box .icon").forEach((btn) => {
      const head = btn.closest(".head");
      const cont = head.nextElementSibling;
      btn.addEventListener("click", () => {
        const open = !head.classList.contains("open");
        head.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", String(open));
        cont.style.height = open ? `${cont.scrollHeight}px` : "0px";
      });
    });
    gn.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  // Appearance: .play once the element’s top edge crosses the 93.3% line of the screen height — groups stagger .12s per child
  const singles = [...document.querySelectorAll(".u-up, .u-left, .u-right, .uh-ttl, .uh-con-c, [data-anime]")];
  const groups = [...document.querySelectorAll("[data-anime-group]")];
  groups.forEach((g) => {
    const step = Number(g.dataset.delayStep ?? 120), start = Number(g.dataset.delayStart ?? 0);
    [...g.children].forEach((c, i) => { c.style.animationDelay = `${start + i * step}ms`; c.style.transitionDelay = `${start + i * step}ms`; });
  });
  const targets = singles.concat(groups);
  if (reduce) targets.forEach((t) => t.classList.add("play"));
  else {
    let ticking = false;
    const check = () => {
      const line = innerHeight * 0.933;
      targets.forEach((t) => {
        if (t.classList.contains("play")) return;
        const r = t.getBoundingClientRect();
        if (r.top <= line && r.bottom >= 0) t.classList.add("play");
      });
      ticking = false;
    };
    const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    check();
    addEventListener("load", ask);
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
  }

  // Banner band: same Splide settings as the original .js-cb-s (center-aligned loop · 3s · 1.1s)
  const cb = document.querySelector(".uh-cb .splide");
  if (cb && window.Splide) {
    new Splide(cb, {
      type: "loop", perPage: 3, gap: 10, focus: "center", arrows: false, pagination: true,
      autoplay: !reduce, interval: 3000, pauseOnHover: true, pauseOnFocus: true, speed: 1100,
      dragMinThreshold: { mouse: 10, touch: 24 }, noDrag: "a",
      breakpoints: { 768: { perPage: 1, padding: { left: "14%", right: "14%" } } },
    }).mount();
  }

  // Contact form: the send button turns on only after the privacy consent is checked (same as the original)
  document.querySelectorAll(".ct-form-b").forEach((form) => {
    const agree = form.querySelector(".agree input[type=checkbox]");
    const send = form.querySelector(".send button");
    if (agree && send) agree.addEventListener("change", () => (send.disabled = !agree.checked));
  });

  // Back to top
  document.querySelectorAll(".uh-pt").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }));
})();
