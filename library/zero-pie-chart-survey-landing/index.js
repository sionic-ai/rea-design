(() => {
  const { reduce, sp } = window.akSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Text splitting — words are grouped into chunks, with the spaces between<br> Stays as is (so Korean lines never break mid-word)
  const split = (el) => {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const word = document.createElement("span");
            word.className = "ak-word";
            [...w].forEach((ch) => { const s = document.createElement("span"); s.className = "ak-ch1"; s.textContent = ch; word.appendChild(s); out.push(s); });
            frag.appendChild(word);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
      });
    };
    walk(el);
    return out;
  };
  const copyChars = $(".ak-head__copy") ? split($(".ak-head__copy")) : [];
  $$(".ak-split").forEach((el) => { el._chars = split(el); });
  const slides = $$(".ak-slide");
  const charsOf = (slide) => $$(".ak-split", slide).flatMap((el) => el._chars);
  // Original M(): per letter y 4→0 .4s Sine.out, opacity .9s Cubic.out, .056s stagger
  const textIn = (chars) => {
    gsap.to(chars, { y: 0, duration: 0.4, ease: "sine.out", stagger: { each: 0.056 } });
    gsap.to(chars, { opacity: 1, duration: 0.9, ease: "power2.out", stagger: { each: 0.056 } });
  };

  // The declaration section sticks to the bottom edge — top is (screen height − section height)
  const st = $(".ak-st");
  const fitSticky = () => { if (st) st.style.top = sp() ? "" : (innerHeight - st.offsetHeight) + "px"; };
  fitSticky();
  if (st) new ResizeObserver(fitSticky).observe(st);
  addEventListener("resize", fitSticky);

  // Phone menu — comes down from the top with .6s Quart.out and the background darkens over .3s. On closing, .6s Cubic.out
  const menu = $(".ak-menu"), gnav = $(".ak-gnav"), gbg = $(".ak-gnav__bg");
  const setMenu = (open) => {
    if (!menu || !gnav) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", open);
    if (open) {
      gsap.fromTo(gnav, { yPercent: -101 }, { yPercent: 0, duration: reduce ? 0 : 0.6, ease: "power3.out" });
      gsap.fromTo(gbg, { display: "block", opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power3.out" });
    } else {
      gsap.to(gnav, { yPercent: -101, duration: reduce ? 0 : 0.6, ease: "power2.out" });
      gsap.to(gbg, { opacity: 0, duration: reduce ? 0 : 0.6, ease: "power2.out", onComplete: () => gsap.set(gbg, { display: "none" }) });
    }
  };
  menu?.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  gbg?.addEventListener("click", () => setMenu(false));
  document.addEventListener("ak:menu", (e) => { if (menu?.classList.contains("is-open")) setMenu(!!e.detail); });

  // Question row — phone shows only the graph (no photo, no diagonal wipe), wide screens swap photo ↔ graph every 6s
  $$(".ak-q__cover").forEach((cover) => {
    const pie = $(".ak-pie", cover);
    if (sp() || reduce) {
      cover.setAttribute("data-fx-slant-wipe-rotate", cover.getAttribute("data-fx-slant-wipe-rotate") + "; start: wait");
      pie.setAttribute("data-fx-pie-sweep-chart", pie.getAttribute("data-fx-pie-sweep-chart").replace("start: wait", "start: view"));
      return;
    }
    cover.addEventListener("fx:slide", (e) => { if (e.detail.index === 1) pie.dispatchEvent(new Event("fx:draw")); else pie.dispatchEvent(new Event("fx:clear")); });
  });

  // Hero card — each switch brings in the next card: photo 1.16→1 over 9.6s, graph draws after 1.6s, icon·VIEW·view after 3s, title characters after 3s
  const list = $(".ak-fv__list");
  const enter = (slide, base) => {
    if (slide.classList.contains("is-consider")) gsap.fromTo($(".ak-slide__img", slide), { scale: 1.16 }, { scale: 1, duration: 9.6, ease: "none" });
    const pie = $(".ak-pie", slide);
    if (pie) { pie.dispatchEvent(new Event("fx:clear")); setTimeout(() => pie.dispatchEvent(new Event("fx:draw")), base.graph * 1000); }
    const q = $(".ak-slide__q", slide);
    if (q) gsap.fromTo(q, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: base.icon, ease: "power2.inOut" });
    gsap.fromTo($(".ak-slide__view", slide), { opacity: 0 }, { opacity: 1, duration: 0.4, delay: base.icon, ease: "power2.inOut" });
    const chars = charsOf(slide);
    gsap.set(chars, { opacity: 0, y: 4 });
    setTimeout(() => textIn(chars), base.icon * 1000);
    const votes = $$(".ak-vote li", slide);
    if (votes.length) gsap.fromTo(votes, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: base.icon, ease: "power2.inOut", stagger: { each: 0.08 } });
  };
  list?.addEventListener("fx:slide", (e) => enter(slides[e.detail.index], { graph: 1.6, icon: 3 }));

  const logoPie = $(".ak-logo__pie");
  const finishOpening = () => {
    // Original r(): draw the first section graph → 1.9s later icon · VIEW · text → 6s later start paging
    enter(slides[0], { graph: 0, icon: 1.9 });
    setTimeout(() => list?.dispatchEvent(new Event("fx:play")), 6000);
  };

  // The part (fx-core) attaches after DOMContentLoaded, so signals to it are sent after that
  const start = () => {
  if (reduce) {
    $(".ak-head__main")?.classList.add("is-small");
    logoPie?.dispatchEvent(new Event("fx:draw"));
    gsap.set([...$$(".ak-slide__q"), ...$$(".ak-slide__view"), ...$$(".ak-vote li")], { opacity: 1 });
    $$(".ak-pie", list).forEach((p) => p.dispatchEvent(new Event("fx:draw")));
    return;
  }

  const mm = gsap.matchMedia();
  const slideBits = (sel) => slides.map((s) => $(sel, s)).filter(Boolean);
  gsap.set(slideBits(".ak-slide__title"), { opacity: 0 });
  gsap.set(slideBits(".ak-slide__date"), { opacity: 0 });
  gsap.set(slideBits(".ak-slide__head1 .ak-solid"), { scaleX: 0 });
  gsap.set(slideBits(".ak-tag"), { opacity: 0 });
  gsap.set(slideBits(".ak-slide__info"), { opacity: 0 });
  gsap.set(charsOf(slides[0]), { opacity: 0, y: 4 });
  gsap.set(copyChars, { opacity: 0 });
  window.scrollTo(0, 0);
  logoPie?.dispatchEvent(new Event("fx:draw"));

  mm.add("(min-width: 1000px)", () => {
    const main = $(".ak-head__main");
    const A = 1.4;
    gsap.set(".ak-rd", { opacity: 0 });
    gsap.set([".ak-rd__img", ".ak-rd .ak-rd__name", ".ak-rd .ak-arrow"], { opacity: 0 });
    gsap.set(".ak-rd__info .ak-solid", { scaleY: 0 });
    gsap.set(".ak-rd > a > .ak-solid", { scaleX: 0 });
    gsap.set(".ak-logo", { y: 24, scale: 1.61 });
    gsap.set(".ak-head__copy", { scale: 1.61, y: 101 });
    gsap.set(".ak-head__brand", { scale: 1.51, y: 261 });
    gsap.set(".ak-head__brand .ak-brand", { opacity: 0, y: 2 });
    gsap.set(".ak-head__line", { scaleY: 0 });
    const tl = gsap.timeline();
    tl.to(copyChars, { opacity: 1, y: 0, duration: 0.4, ease: "power2.inOut", delay: 2, stagger: { each: 0.042 } })
      .to(".ak-head__brand .ak-brand", { opacity: 1, y: 0, duration: 0.4, ease: "power2.inOut" }, "<1")
      .add(() => {
        main.classList.add("is-small");
        gsap.to(".ak-logo", { y: 0, scale: 1, duration: 1.4, ease: "power2.inOut" });
        gsap.to(".ak-head__copy", { scale: 1, y: 0, duration: 1.4, ease: "power2.inOut" });
        gsap.to(".ak-head__brand", { scale: 1, y: 0, duration: 1.4, ease: "power2.inOut" });
        gsap.to(".ak-head__line", { scaleY: 1, duration: 1, delay: A, ease: "power2.inOut" });
        gsap.to(slideBits(".ak-slide__head1 .ak-solid"), { scaleX: 1, duration: 1, delay: 1.4, ease: "power2.inOut" });
        gsap.to(slideBits(".ak-slide__title"), { opacity: 1, duration: 0.35, delay: 1.45, ease: "power2.inOut" });
        gsap.to(slideBits(".ak-slide__date"), { opacity: 1, duration: 0.35, delay: 1.48, ease: "power2.inOut" });
        gsap.to(slideBits(".ak-tag"), { opacity: 1, duration: 0.35, delay: 1.46, ease: "power2.inOut" });
        gsap.to(slideBits(".ak-slide__info"), { opacity: 1, duration: 0.35, delay: 1.49, ease: "power2.inOut" });
        gsap.set(".ak-rd", { opacity: 1, delay: A });
        gsap.to(".ak-rd > a > .ak-solid", { scaleX: 1, duration: 1, delay: 1.4, ease: "power2.inOut" });
        gsap.to(".ak-rd__info .ak-solid", { scaleY: 1, duration: 0.6, delay: 1.7, ease: "power2.inOut" });
        gsap.to(".ak-rd__img", { opacity: 1, duration: 0.4, delay: 1.74, ease: "power2.inOut" });
        gsap.to(".ak-rd .ak-rd__name", { opacity: 1, duration: 0.4, delay: A + 0.62, ease: "power2.inOut" });
        gsap.to(".ak-rd .ak-arrow", { opacity: 1, duration: 0.4, delay: A + 0.62, ease: "power2.inOut", onComplete: finishOpening });
      }, "<1");
  });

  mm.add("(max-width: 999px)", () => {
    const main = $(".ak-head__main");
    gsap.set(".ak-logo", { y: 225, scale: 2.55 });
    gsap.set(".ak-head__copy", { y: 350 });
    gsap.set(".ak-head__brand", { opacity: 0, y: 2 });
    gsap.set(".ak-head__spinfo", { opacity: 0 });
    gsap.set(".ak-menu .ak-solid", { scaleX: 0 });
    gsap.set(".ak-head__summary", { borderBottomColor: "transparent" });
    const tl = gsap.timeline();
    tl.to(copyChars, { opacity: 1, y: 0, duration: 0.4, ease: "power2.inOut", delay: 2, stagger: { each: 0.014 } })
      .to(".ak-head__brand", { opacity: 1, y: 0, duration: 0.4, ease: "power2.inOut" }, "<1")
      .add(() => {
        main.classList.add("is-small");
        gsap.to(".ak-logo", { y: 0, scale: 1, duration: 1.4, ease: "power2.inOut" });
        gsap.to(".ak-head__copy", { opacity: 0, duration: 0.4, ease: "power2.inOut" });
        gsap.to(".ak-head__brand", { opacity: 0, duration: 0.4, ease: "power2.inOut" });
        gsap.to(".ak-head__summary", { borderBottomColor: getComputedStyle(document.documentElement).getPropertyValue("--kf-line").trim() || "currentColor", duration: 1, delay: 1.4, ease: "power2.inOut" });
        gsap.to(".ak-head__spinfo", { opacity: 1, duration: 0.35, delay: 1.56, ease: "power2.inOut" });
        gsap.to(slideBits(".ak-tag"), { opacity: 1, duration: 0.35, delay: 1.56, ease: "power2.inOut" });
        gsap.to(".ak-menu .ak-solid", { scaleX: 1, duration: 0.35, delay: 1.76, ease: "power2.inOut", stagger: { each: 0.1 } });
        gsap.to(slideBits(".ak-slide__info"), { opacity: 1, duration: 0.35, delay: 1.76, ease: "power2.inOut", onComplete: finishOpening });
      }, "<1");
  });
  };
  const later = () => setTimeout(start, 0);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", later); else later();
})();
