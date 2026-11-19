/* lavender-blob-transition-agency shared motion — original order as is: Swup 3 transition, Lenis 1.0.11, ScrollMagic scenes, jQuery fade/slide (400ms swing). 
   The original ScrollMagic tied two states to scroll with GSAP 2 className tweens, but GSAP 3 has no such feature, so
   Write the same two state values as a GSAP 3 tween and bind it to the scene progress. */
(() => {
  const $ = window.jQuery;
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const vh = () => window.innerHeight;

  if (touch) document.body.classList.add("is-touch-device");

  /* ── Smooth scroll: like the original, raf is called from two places, rAF and the gsap ticker ── */
  const LenisC = window.Lenis || window.lenis;
  const lenis = !reduce && LenisC ? new LenisC() : null;
  if (lenis) {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  }

  /* ── ScrollMagic: one scene = Tween runs for dur% of the screen height from the trigger position ── */
  let ctrl = new ScrollMagic.Controller({ refreshInterval: 0 });
  const scene = (trigger, dur, tween) => {
    if (!trigger) return;
    tween.pause();
    return new ScrollMagic.Scene({ triggerElement: trigger, triggerHook: 0, duration: dur })
      .on("progress", (e) => tween.progress(e.progress))
      .addTo(ctrl);
  };
  const helper = (host, cls, top) => {
    let h = host.querySelector(":scope > ." + cls);
    if (!h) { h = document.createElement("div"); h.className = "pos-helper " + cls; h.style.cssText = `position:absolute;left:0;width:1px;height:1px;top:${top}`; host.append(h); }
    return h;
  };
  function magic() {
    ctrl.destroy(true);
    ctrl = new ScrollMagic.Controller({ refreshInterval: 0 });
    if (reduce) return;
    // Footer slides from -20% → 0 beneath the main panel
    const foot = document.querySelector(".sm-footer");
    if (foot && innerWidth > 767) scene(foot.querySelector(".pos-helper"), "100%", gsap.fromTo(foot, { yPercent: -20 }, { yPercent: 0, ease: "none" }));
    // Photo parallax: a 125%-tall photo moves 0 → -15% over 150%
    document.querySelectorAll("#swup .pax").forEach((img) => {
      const wrap = img.parentElement;
      if (getComputedStyle(wrap).position === "static") wrap.style.position = "relative";
      scene(helper(wrap, "pax-h", "-80vh"), "150%", gsap.fromTo(img, { yPercent: 0 }, { yPercent: -15, ease: "none" }));
    });
    // Video mask: 1 → 0.836 (phone 0.9)
    document.querySelectorAll("#swup .sm-vmask").forEach((m) => {
      const w = m.querySelector(".vwrap");
      scene(m.querySelector(".pos-helper-0"), "100%", gsap.fromTo(w, { scale: 1 }, { scale: innerWidth > 767 ? 0.836 : 0.9, ease: "none" }));
    });
  }

  /* ── Header: hides on scroll down and returns on scroll up (0.9s), on the first page the background fills after half a screen ── */
  let last = 0;
  const nav = document.querySelector(".sm-nav");
  const contactFixed = document.querySelector(".sm-contact");
  function onScroll() {
    const st = scrollY;
    if (st > 10) {
      if (st > last) {
        if (!document.querySelector(".sm-navi.active")) { nav.classList.add("scrolled"); contactFixed?.classList.add("scrolled"); }
      } else { nav.classList.remove("scrolled"); contactFixed?.classList.remove("scrolled"); }
      last = st;
    }
    const hero = document.querySelector("#swup .sm-hero");
    if (hero) {
      document.body.classList.toggle("scrolled-in-50", st > vh() / 2);
      hero.classList.toggle("fade-out", st > vh() * 2);
    }
    // Title: document position - once after passing 2/3 of the screen
    document.querySelectorAll(".sm-reveal:not(.active):not(.on-event)").forEach((el) => {
      if (st > el.getBoundingClientRect().top + st - (vh() / 3) * 2) el.classList.add("active");
    });
    // Numbers: from 0 to the value at 3/4 of the screen, 2000ms swing
    document.querySelectorAll(".sm-count:not(.init)").forEach((el) => {
      if (st > el.getBoundingClientRect().top + st - (vh() / 4) * 3) {
        el.classList.add("init");
        $({ c: 0 }).animate({ c: +el.dataset.count }, { duration: 2000, easing: "swing", step() { el.textContent = Math.ceil(this.c); } });
      }
    });
    // The accordion runs only while it is more than halfway into view
    document.querySelectorAll("#swup .sm-acc").forEach((p) => {
      const top = p.getBoundingClientRect().top + st;
      p.classList.toggle("animate-loop", st > top - vh() / 2 && st <= top + p.offsetHeight);
    });
    // Service section TOC: lights up the currently visible group
    const side = document.querySelector("#swup .sm-sticky .side");
    if (side) {
      let cur = null;
      document.querySelectorAll("#swup .sm-sticky .block").forEach((b) => { if (b.getBoundingClientRect().top < vh() * 0.4) cur = b.id; });
      side.querySelectorAll("a[data-to]").forEach((a) => a.classList.toggle("active", a.dataset.to === cur || (a.dataset.grp && cur?.startsWith(a.dataset.grp))));
      side.querySelectorAll(".grp").forEach((g) => g.classList.toggle("active", !!g.querySelector("a.active")));
    }
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ── Header center: city · temperature · time line tilts and swaps every 2.6s ── */
  let wId = 1;
  function weather() {
    const lines = document.querySelectorAll(".sm-weather .line");
    if (!lines.length) return;
    const next = wId + 1 > lines.length ? 1 : wId + 1;
    const cur = document.querySelector(`.sm-weather .line[data-id="${wId}"]`);
    cur.classList.add("fade-out");
    document.querySelector(`.sm-weather .line[data-id="${next}"]`).classList.add("active");
    setTimeout(() => {
      cur.style.display = "none";
      setTimeout(() => { cur.classList.remove("active", "fade-out"); setTimeout(() => (cur.style.display = ""), 100); }, 100);
      setTimeout(() => { wId = next; weather(); }, 1500);
    }, 1100);
  }
  if (!reduce) setTimeout(weather, 1000);

  /* ── Color Drop Cursor ── */
  const bubble = document.querySelector(".sm-bubble");
  const checkAnimating = () => ["is-animating", "is-changing", "is-leaving", "is-rendering"].some((c) => html.classList.contains(c));
  let bx = 0, by = 0, mx = 0, my = 0;
  if (bubble && !touch) {
    const centers = bubble.querySelectorAll(".center-wrap");
    // Reduce motion: turn off chasing and tilt and place it right at the cursor — the drop stays because it is the starting point of link hints and the transition smear
    if (!reduce) gsap.to({}, {
      duration: 1 / 120, repeat: -1,
      onRepeat() {
        bx += (mx - bx) / 5; by += (my - by) / 5;
        gsap.set(bubble, { left: bx, top: by });
        gsap.set(centers, { rotate: (mx - bx) / 5 });
      },
    });
    const KINDS = [["[data-bubble=learn]", "learn"], ["[data-bubble=explore], .sm-nextup", "explore"], ["[data-bubble=play]", "play"], ["[data-bubble=full]", "full"], [".page-links", "view"]];
    document.addEventListener("mousemove", (e) => {
      const size = bubble.offsetWidth;
      mx = e.pageX - size / 2;
      my = e.pageY - size / 2 - scrollY - 20;
      if (reduce) gsap.set(bubble, { left: mx, top: my });
      if (!checkAnimating()) bubble.querySelectorAll(".sm-bubble__label").forEach((l) => l.classList.remove("clicked"));
      const hit = KINDS.find(([s]) => e.target.closest?.(s));
      if (hit) {
        bubble.dataset.kind = hit[1];
        bubble.classList.add("active");
        if (hit[1] === "learn" || hit[1] === "view") html.classList.add("color-bubble-active");
        if (hit[1] === "explore") html.classList.add("next-up-active");
      } else if (!checkAnimating()) {
        bubble.classList.remove("active");
        html.classList.remove("color-bubble-active", "next-up-active");
      }
    });
  }

  /* ── Menu: four preview cards ── */
  const navi = document.querySelector(".sm-navi");
  const menuBtns = document.querySelectorAll(".sm-menu-btn, .sm-burger");
  function closeNavi() {
    navi.querySelectorAll(".sm-preview, .veil").forEach((p) => p.classList.remove("active"));
    document.body.classList.remove("menu-open");
    setTimeout(() => { navi.style.display = "none"; navi.classList.remove("active"); menuBtns.forEach((b) => b.classList.remove("rotate-active")); }, 1000);
  }
  function openNavi() {
    navi.style.display = "block";
    menuBtns.forEach((b) => b.classList.add("rotate-active"));
    document.body.classList.add("menu-open");
    navi.offsetWidth;
    navi.querySelectorAll(".p4, .p3, .p2, .p1").forEach((p) => p.classList.add("active"));
    navi.classList.add("active");
    navi.querySelector(".veil").classList.add("active");
  }
  menuBtns.forEach((b) => b.addEventListener("click", () => (navi.classList.contains("active") ? closeNavi() : openNavi())));
  navi.querySelector(".veil").addEventListener("click", closeNavi);
  navi.querySelectorAll(".sm-preview").forEach((p) => {
    p.addEventListener("mouseenter", () => html.classList.add("navi-preview-active"));
    p.addEventListener("mouseleave", () => { if (!checkAnimating()) html.classList.remove("navi-preview-active"); });
  });

  /* ── Contact Button · Window ── */
  const contactBtn = document.querySelector(".sm-contact .sm-btn");
  const contactPop = document.querySelector(".sm-contact-pop");
  contactBtn?.addEventListener("click", () => {
    const open = contactBtn.classList.toggle("rotate-active");
    open ? $(contactPop).fadeIn() : $(contactPop).fadeOut();
  });

  /* ── Candy window ── */
  const candyBtn = document.querySelector(".sm-candy");
  const candy = document.querySelector(".sm-candy-pop");
  candyBtn?.addEventListener("click", () => {
    $(candyBtn.querySelector("svg")).fadeOut();
    setTimeout(() => { $(candy).fadeIn(); candy.querySelector(".sm-reveal")?.classList.add("active"); }, 200);
  });
  candy?.addEventListener("click", () => {
    $(candy).fadeOut();
    $(candyBtn.querySelector("svg")).fadeIn();
    setTimeout(() => candy.querySelector(".sm-reveal")?.classList.remove("active"), 200);
  });
  // Photo columns inside the candy window: each column moves at a different speed on window scroll
  candy?.addEventListener("scroll", () => {
    if (reduce) return;
    candy.querySelectorAll(".cand").forEach((c, i) => gsap.set(c, { y: -candy.scrollTop * [0.1, 0.25, 0.05][i % 3] }));
  });

  /* ── Video window (showreel): hover shows a Play bubble, click plays over a black scrim. The close button uses magnet 50 · 1s power4.out ── */
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-video-open]");
    const pop = document.querySelector(".sm-video-pop");
    if (open && pop) { $(pop).css("display", "flex").hide().fadeIn(); pop.querySelector("video").play().catch(() => {}); }
    if (e.target.closest(".sm-video-pop .close, .sm-video-pop .close-m") && pop) { pop.querySelector("video").pause(); $(pop).fadeOut(); }
    // Photo lightbox: click the center to close, the sides for previous·next (the original fades in the new photo)
    const shot = e.target.closest("[data-bubble=full]");
    const gal = document.querySelector(".sm-gallery-pop");
    if (!gal) return;
    const labels = [...new Set([...document.querySelectorAll("#swup .sm-gallery .set:first-child [data-bubble=full] .wf-img, #swup .sm-strip [data-bubble=full] .wf-img")].map((w) => w.dataset.label))];
    const show = (i) => { gal.dataset.i = (i + labels.length) % labels.length; gal.querySelector(".label").dataset.label = labels[gal.dataset.i] || ""; };
    if (shot) { show(Math.max(0, labels.indexOf(shot.querySelector(".wf-img")?.dataset.label))); $(gal).fadeIn(); }
    if (e.target.closest(".sm-gallery-pop .nav.c")) $(gal).fadeOut();
    if (e.target.closest(".sm-gallery-pop .nav.r")) { $(gal.querySelector(".shot")).hide().fadeIn(); show(+gal.dataset.i + 1); }
    if (e.target.closest(".sm-gallery-pop .nav.l")) { $(gal.querySelector(".shot")).hide().fadeIn(); show(+gal.dataset.i - 1); }
  });
  if (!reduce) document.querySelectorAll(".sm-video-pop .close").forEach((m) => {
    m.addEventListener("mousemove", (e) => {
      const r = m.getBoundingClientRect();
      gsap.to(m, { x: ((e.clientX - r.left) / m.offsetWidth - 0.5) * 50, y: ((e.clientY - r.top) / m.offsetHeight - 0.5) * 50, duration: 1, ease: "power4.out" });
    });
    m.addEventListener("mouseout", () => gsap.to(m, { x: 0, y: 0, duration: 1, ease: "power4.out" }));
  });

  /* ── Services accordion: advances every 6s, click opens that row (400ms slide·fade) ── */
  function accInit() {
    document.querySelectorAll("#swup .sm-acc:not(.init)").forEach((p) => {
      p.classList.add("init");
      p.dataset.cur = "1";
      const items = [...p.querySelectorAll(".item")];
      items.forEach((it, i) => {
        it.dataset.id = i + 1;
        if (!i) { it.classList.add("active", "show-learn"); $(it).find(".text").show(); $(p).find('.layer[data-id="1"]').show(); }
        it.addEventListener("click", (e) => {
          if (it.classList.contains("active")) return;
          e.preventDefault();
          e.stopPropagation();
          p.classList.add("clicked");
          const id = i + 1;
          $(p).find(".bar i").fadeOut();
          $(p).find(".layer").fadeOut();
          items.forEach((o) => { o.classList.remove("active", "show-learn"); o.removeAttribute("data-bubble"); $(o).find(".text").slideUp(); });
          $(it).find(".text").slideDown();
          $(p).find(`.layer[data-id="${id}"]`).fadeIn();
          it.classList.add("active");
          it.dataset.bubble = "learn";
          p.dataset.cur = id + 1 > items.length ? 1 : id + 1;
        }, true);
      });
      items[0].dataset.bubble = "learn";
      accLoop(p);
    });
  }
  function accLoop(p) {
    if (!p.isConnected) return;
    const items = [...p.querySelectorAll(".item")];
    const id = +p.dataset.cur;
    if (!p.classList.contains("clicked") && p.classList.contains("animate-loop") && !reduce) {
      const next = id + 1 > items.length ? 1 : id + 1;
      p.dataset.cur = next;
      const cur = items[id - 1], nx = items[next - 1];
      const bar = cur.querySelector(".bar i");
      bar.classList.remove("active"); $(bar).fadeIn(); bar.offsetWidth; bar.classList.add("active");
      setTimeout(() => {
        if (p.classList.contains("clicked")) return;
        $(cur).find(".text").slideToggle();
        $(bar).fadeOut();
        $(p).find(`.layer[data-id="${id}"]`).fadeOut();
        cur.classList.remove("active"); cur.removeAttribute("data-bubble");
        $(nx).find(".text").slideToggle();
        $(p).find(`.layer[data-id="${next}"]`).fadeIn();
        nx.classList.add("active"); nx.dataset.bubble = "learn";
        accLoop(p);
      }, 6000);
    } else if (!p.classList.contains("clicked")) setTimeout(() => accLoop(p), 500);
  }

  /* ── Phone team photos: slick center mode (10% on each side · 5s auto) ── */
  function sliders() {
    if (innerWidth >= 768 || !$.fn.slick) return;
    $("#swup .sm-gallery-m.slick-slider").slick("unslick");
    $("#swup .sm-gallery-m").slick({ arrows: false, dots: false, centerMode: true, centerPadding: "10%", fade: false, swipe: true, infinite: true, slidesToShow: 1, autoplay: !reduce, autoplaySpeed: 5000, pauseOnHover: false, pauseOnFocus: true });
  }

  /* ── Next page strip ── */
  function fillNextUp() {
    const src = document.querySelector("#swup [data-next-up]");
    const a = document.querySelector(".sm-nextup");
    const clone = document.querySelector(".transition-next-up");
    if (!a || !src) return;
    a.href = src.dataset.href;
    a.innerHTML = src.innerHTML;
    if (clone) clone.innerHTML = src.innerHTML;
  }
  // Place the clone at the same spot as the strip (margin-top −lift), and when pressed drop it by the lift so it touches the top of the screen
  function placeNextUp() {
    const a = document.querySelector(".sm-nextup"), clone = document.querySelector(".transition-next-up");
    if (!a || !clone || clone.classList.contains("clicked")) return;
    const move = innerHeight - a.getBoundingClientRect().top;
    clone.style.marginTop = -move + "px";
    clone.style.setProperty("--move", move + "px");
  }
  addEventListener("scroll", placeNextUp, { passive: true });
  addEventListener("resize", placeNextUp);

  function pageInit() {
    fillNextUp();
    accInit();
    sliders();
    magic();
    // The Hero header exists only in this section
    document.body.classList.toggle("has-hero", !!document.querySelector("#swup .sm-hero"));
    document.body.dataset.page = document.querySelector("#swup").dataset.page || "";
    document.querySelectorAll(".sm-menu-links a, .sm-footer .links a").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === location.pathname.split("/").pop()));
    onScroll();
    placeNextUp();
  }

  /* ── Swup 3: swaps only the body panel. Original hook order kept as is ── */
  const swup = new Swup({ containers: ["#swup"], linkSelector: 'a[href$=".html"]:not([data-no-swup])' });
  window.smSwup = swup;
  swup.on("clickLink", (e) => {
    document.querySelectorAll(".sm-bubble__label").forEach((l) => l.classList.add("clicked"));
    if (html.classList.contains("next-up-active")) { placeNextUp(); document.querySelector(".transition-next-up")?.classList.add("clicked"); }
    const card = e?.delegateTarget?.closest?.(".sm-preview") || e?.target?.closest?.(".sm-preview");
    if (card && navi.classList.contains("active")) { navi.classList.add("cards-animating"); card.classList.add("clicked"); }
  });
  swup.on("animationOutDone", () => {
    if (html.classList.contains("color-bubble-active")) html.classList.add("square-bg-preperations");
    lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
    if (html.classList.contains("next-up-active")) { bubble?.classList.remove("active"); document.querySelector(".transition-next-up")?.classList.add("fade-out"); }
    if (navi.classList.contains("cards-animating")) setTimeout(() => { bubble?.classList.remove("active"); navi.classList.add("fade-out"); }, 200);
  });
  swup.on("contentReplaced", () => { magic(); });
  swup.on("animationInDone", () => {
    nav.classList.remove("scrolled");
    html.classList.remove("color-bubble-active");
    if (html.classList.contains("next-up-active")) {
      bubble?.classList.remove("active");
      setTimeout(() => { html.classList.remove("next-up-active"); document.querySelector(".transition-next-up")?.classList.remove("clicked", "fade-out"); }, 1000);
    }
    if (navi.classList.contains("cards-animating")) {
      navi.style.display = "none";
      setTimeout(() => {
        navi.querySelectorAll(".sm-preview").forEach((p) => p.classList.remove("active", "clicked"));
        navi.querySelector(".veil").classList.remove("active");
        navi.classList.remove("active", "cards-animating", "fade-out");
        menuBtns.forEach((b) => b.classList.remove("rotate-active"));
        document.body.classList.remove("menu-open");
        html.classList.remove("navi-preview-active");
      }, 1000);
    }
    if (html.classList.contains("square-bg-preperations")) {
      bubble?.classList.remove("active");
      const sq = document.querySelector(".transition-square-bg");
      sq.classList.add("active");
      setTimeout(() => { html.classList.remove("square-bg-preperations"); sq.classList.remove("active"); }, 1000);
    }
    pageInit();
  });
  // Tapping the current section again in the menu doesn’t transition, it just closes the menu and scrolls to top
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".sm-preview");
    if (!card || !navi.classList.contains("active")) return;
    const here = location.pathname.split("/").pop() || "index.html";
    if (card.getAttribute("href") === here) {
      e.preventDefault(); e.stopPropagation();
      closeNavi();
      lenis ? lenis.scrollTo(0, { duration: 0.3 }) : scrollTo({ top: 0, behavior: "smooth" });
    }
  }, true);

  pageInit();
})();
