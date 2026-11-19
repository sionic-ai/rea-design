/* Shared by both sections: header bar (entrance · scroll strip · phone menu), letter-roll links, section header reveal, testimonials (Splide), closing, booking window */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const mm = gsap.matchMedia();
  // Like the original, it enters after the fonts have all loaded — preconnect to the web font server from the head
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Going line by line, inside it goes from 110% below → in place (1.1s expo, .08s per line)
  function splitLines(el, vars) {
    gsap.set(el, { opacity: 1 });
    if (reduce) return;
    SplitText.create(el, {
      type: "lines", mask: "lines", linesClass: "split-lines", autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 110, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, ...vars }),
    });
  }

  // ---- Header row ----
  function header() {
    const head = $("[data-header-root]");
    if (!head) return;
    const toggle = () => head.classList.toggle("is-scrolled", scrollY > 1);
    toggle();
    addEventListener("scroll", toggle, { passive: true });
    const burger = $(".nd-burger", head);
    burger && burger.addEventListener("click", () => {
      const open = head.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("has-modal", open);
    });
    $$(".nd-nav__menu a, [data-close-menu]", head).forEach((a) => a.addEventListener("click", () => {
      head.classList.remove("is-open");
      document.body.classList.remove("has-modal");
      burger && burger.setAttribute("aria-expanded", "false");
    }));
    const logo = $('[data-header="logo"]', head), items = $$('[data-header="nav-item"]', head), ctas = $$('[data-header="cta"]', head);
    if (reduce) return gsap.set([logo, ...items, ...ctas], { opacity: 1, y: 0 });
    fontsReady.then(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
      tl.to(logo, { opacity: 1, y: 0 }, 0);
      items.length && tl.to(items, { opacity: 1, y: 0, stagger: 0.06 }, 0.15);
      ctas.length && tl.to(ctas, { opacity: 1, y: 0, stagger: 0.06 }, 0.45);
    });
  }

  // ---- Letter-roll link (480 and up · mouse) — on enter .35s from the front, on leave .25s from the back ----
  function staggerLinks() {
    mm.add("(min-width: 480px) and (hover: hover) and (pointer: fine)", () => {
      const links = $$("[data-stagger-link]");
      const split = SplitText.create($$("[data-stagger-link-text]"), { type: "words, chars", wordsClass: "split-word", charsClass: "split-char", autoSplit: true });
      const offs = links.map((link) => {
        const chars = () => link.querySelectorAll("[data-stagger-link-text] .split-char");
        const on = () => gsap.to(chars(), { yPercent: -110, duration: 0.35, ease: "power4.inOut", stagger: { amount: 0.2, from: "start" }, overwrite: true });
        const off = () => gsap.to(chars(), { yPercent: 0, duration: 0.25, ease: "power4.inOut", stagger: { amount: 0.2, from: "end" }, overwrite: true });
        link.addEventListener("mouseenter", on);
        link.addEventListener("mouseleave", off);
        return () => { link.removeEventListener("mouseenter", on); link.removeEventListener("mouseleave", off); };
      });
      return () => { offs.forEach((f) => f()); split.revert(); };
    });
  }

  // ---- Section header: small name (.8s), title row (1.1s expo), subtitle (.9s, .15 later) ----
  function reveals() {
    $$('[data-reveal="caption"]').forEach((el) => {
      if (reduce) return gsap.set(el, { opacity: 1, y: 0 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    $$('[data-reveal="title"]').forEach((el) => splitLines(el, { scrollTrigger: { trigger: el, start: "top 80%" } }));
    $$('[data-reveal="sub"]').forEach((el) => {
      if (reduce) return gsap.set(el, { opacity: 1, y: 0 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.15, scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    $$("[data-reveal-cards]").forEach((wrap) => {
      const cards = $$(wrap.dataset.revealCards, wrap);
      if (reduce) return gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
      gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: wrap, start: "top 85%" } });
    });
  }

  // ---- Splide: original createSplideSlider as is (one slide at a time · flickPower 500 · arrows are outer buttons · settings for 480 and above go in breakpoints) ----
  function slider(el, opts = {}) {
    if (!el || !window.Splide) return null;
    const wrap = el.closest("[data-slider-wrap]") || el.parentElement;
    const prev = $("[data-slider-prev]", wrap), next = $("[data-slider-next]", wrap), counter = $("[data-slider-counter]", wrap);
    const type = opts.type || "slide";
    const s = new Splide(el, {
      perPage: 1, flickPower: 500, arrows: false, pagination: false, trimSpace: true, omitEnd: type !== "fade", focus: 0, type, mediaQuery: "min",
      gap: opts.gap || "2rem",
      breakpoints: { 480: { ...(opts.destroy && { destroy: true }), gap: opts.gap || "2rem" } },
    });
    const pad = (n) => String(n).padStart(2, "0");
    const sync = () => {
      // At 480 and above, a destroyed slider has no Controller — it stands as a grid so there is nothing to count
      if (!s.Components.Controller) return;
      const last = s.Components.Controller.getEnd();
      prev && (prev.disabled = s.index === 0);
      next && (next.disabled = s.index === last);
      counter && (counter.textContent = `${pad(Math.min(s.index + 1, s.length))}/${pad(s.length)}`);
    };
    s.on("mounted move moved resize refresh", sync);
    prev && prev.addEventListener("click", () => s.go("<"));
    next && next.addEventListener("click", () => s.go(">"));
    s.mount();
    return s;
  }

  // ---- Reviews ----
  function testimonials() {
    const sec = $("[data-testimonials]");
    if (!sec) return;
    // On phones the two photo cells are removed from the slide (original excludeFromMobile) — the count only includes review sections
    if (matchMedia("(max-width: 479px)").matches) $$(".nd-testi__slide.is-img", sec).forEach((s) => s.classList.remove("splide__slide"));
    slider($(".nd-testi__splide", sec), { destroy: true });
    const cards = $$(".nd-tcard", sec);
    if (reduce) return gsap.set(cards, { opacity: 1, y: 0 });
    gsap.to(cards, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: $(".nd-testi__splide", sec), start: "top 85%" } });
  }

  // ---- Closing: at 70% of the screen, photo 1.8s · title line · text (.5) · button (.6) · button pieces (.7) ----
  function cta() {
    const sec = $("[data-cta-root]");
    if (!sec) return;
    const bg = $('[data-cta="bg"]', sec), title = $('[data-cta="title"]', sec), text = $('[data-cta="text"]', sec), btn = $('[data-cta="btn"]', sec);
    if (reduce) { gsap.set([bg, text, btn], { y: 0, scale: 1, opacity: 1 }); gsap.set(title, { opacity: 1 }); return; }
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 70%" } });
    tl.to(bg, { scale: 1, duration: 1.8, ease: "power2.out" }, 0);
    splitLines(title, { scrollTrigger: { trigger: sec, start: "top 70%" } });
    tl.to(text, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.5);
    tl.to(btn, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.6);
    tl.from(btn.querySelectorAll(":scope > span"), { yPercent: 60, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.7);
  }

  // ---- Booking window: cover .3 · panel .4 · title line 1.1 expo(.35) · items .5(.35, .09 gap) · choice cards .5(.55, .05 gap) ----
  function booking() {
    const modal = $("[data-booking-modal]");
    if (!modal) return;
    const form = $("[data-booking-form]", modal);
    const steps = $$("[data-step]", form), tabs = $$("[data-tab-step]", modal);
    const next1 = $('[data-next-step="2"]', form), back2 = $('[data-prev-step="1"]', form);
    const radios = (name) => $$(`input[name="${name}"]`, form);
    let last = null, titleSplit = null;
    const valid1 = () => {
      const ok = radios("treatment").some((r) => r.checked) && radios("doctor").some((r) => r.checked);
      next1 && (next1.disabled = !ok);
      return ok;
    };
    const go = (n) => {
      steps.forEach((s) => s.classList.toggle("is-active", +s.dataset.step === n));
      tabs.forEach((t, i) => { t.classList.toggle("is-active", i + 1 === n); t.classList.toggle("is-done", i + 1 < n); });
    };
    const reset = () => { form.reset(); $$(".nd-form__err", form).forEach((e) => e.remove()); $$(".is-error", form).forEach((e) => e.classList.remove("is-error")); valid1(); go(1); };
    const animate = () => {
      const overlay = $(".nd-modal__overlay", modal), box = $('[data-modal-anim="box"]', modal), title = $('[data-modal-anim="title"]', modal);
      const items = $$('[data-modal-anim="item"]', modal), cards = $$('[data-modal-anim="card"]', modal);
      if (reduce) return gsap.set([overlay, box, ...items, ...cards, title], { opacity: 1, y: 0 });
      gsap.set([overlay, box], { opacity: 0 });
      gsap.set(items, { opacity: 0, y: 24 });
      gsap.set(cards, { opacity: 0, y: 16 });
      const tl = gsap.timeline();
      tl.to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0);
      tl.to(box, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.05);
      if (title) {
        titleSplit && titleSplit.revert();
        titleSplit = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-lines", autoSplit: false });
        gsap.set(titleSplit.lines, { yPercent: 110, opacity: 0 });
        tl.to(titleSplit.lines, { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08 }, 0.35);
      }
      items.length && tl.to(items, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.09 }, 0.35);
      cards.length && tl.to(cards, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 }, 0.55);
    };
    const key = (e) => e.key === "Escape" && close();
    const open = (trigger) => {
      last = document.activeElement;
      const t = trigger && trigger.dataset.bookTreatment;
      const r = t && radios("treatment").find((x) => x.value === t);
      r && (r.checked = true);
      valid1();
      modal.classList.add("is-open");
      document.body.classList.add("has-modal");
      animate();
      $("[data-booking-close]", modal).focus();
      document.addEventListener("keydown", key);
    };
    function close() {
      modal.classList.remove("is-open");
      document.body.classList.remove("has-modal");
      document.removeEventListener("keydown", key);
      setTimeout(reset, 0);
      last && last.focus && last.focus();
    }
    document.addEventListener("click", (e) => {
      const o = e.target.closest("[data-book-trigger]");
      if (o) { e.preventDefault(); open(o); return; }
      if (e.target.closest("[data-booking-close]")) { e.preventDefault(); close(); }
    });
    form.addEventListener("change", valid1);
    next1 && next1.addEventListener("click", () => valid1() && go(2));
    back2 && back2.addEventListener("click", () => go(1));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      $$(".nd-form__err", form).forEach((x) => x.remove());
      let ok = true;
      $$("[data-step='2'] [required]", form).forEach((inp) => {
        const bad = !inp.checkValidity() || inp.value.trim().length < (+inp.dataset.min || 1);
        inp.classList.toggle("is-error", bad);
        if (bad) {
          ok = false;
          const m = document.createElement("p");
          m.className = "nd-form__err";
          m.textContent = inp.dataset.msg || "Your guide sentence here";
          inp.after(m);
        }
      });
      ok && go(3);
    });
    valid1();
    go(1);
  }

  addEventListener("DOMContentLoaded", () => {
    header();
    staggerLinks();
    reveals();
    testimonials();
    cta();
    booking();
  });
  window.ND = { reduce, fine, mm, fontsReady, splitLines, slider, $, $$ };
})();
