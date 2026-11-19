// Shared by the whole site: inserts header, drawer, purchase strip and footer with the same markup, and handles Lenis (lerp .1), entrances, FAQ folding, chunks and small characters.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const V = (window.V = { reduce });
  const page = document.body.dataset.page;

  // Four blobs — hand-copied shapes of the original KV’s round balls pulling at each other and squashing (viewBox 200)
  V.BLOBS = [
    "M104 8c40 2 78 30 86 72 8 44-18 92-62 108-40 14-92 2-114-36C-6 116 4 64 30 36 50 16 76 6 104 8z",
    "M96 4c44-4 92 26 100 72 8 40-22 70-40 96-20 28-60 32-92 22C28 182 0 148 4 104 8 54 50 8 96 4z",
    "M112 6c34 8 62 40 76 76 14 38-4 86-44 104-38 18-88 10-118-22C0 136 2 86 22 52 44 16 78-2 112 6z",
    "M70 10c30-14 74-8 100 18 26 26 30 70 14 104-18 38-60 66-104 60C40 186 4 154 2 110 0 66 34 26 70 10z",
  ];
  V.blob = (el) => {
    const i = Number(el.dataset.shape || 0) % V.BLOBS.length;
    el.setAttribute("viewBox", "0 0 200 200");
    el.setAttribute("preserveAspectRatio", "none");
    el.innerHTML = `<path d="${V.BLOBS[i]}"/>`;
  };
  // Small figure — the original 3D miniature person (seen obliquely from above, floor shadow) flattened into SVG
  V.person = (el) => {
    const top = el.dataset.top ? ` is-${el.dataset.top}` : "";
    el.setAttribute("viewBox", "0 0 60 130");
    el.innerHTML =
      `<ellipse class="p-shadow" cx="34" cy="122" rx="24" ry="6"/>` +
      `<path class="p-legs" d="M22 82h8l1 38h-8zM32 82h8l-1 38h-7z"/>` +
      `<path class="p-top${top}" d="M18 44c0-8 6-12 12-12s12 4 12 12l2 40H16z"/>` +
      `<path class="p-skin" d="M14 50l4-4 2 26-4 1zM46 50l-4-4-2 26 4 1z"/>` +
      `<circle class="p-skin" cx="30" cy="22" r="10"/>` +
      `<path class="p-hair" d="M20 20c0-8 6-12 10-12s11 4 10 13c-4-5-12-6-20-1z"/>` +
      (el.dataset.prop ? `<rect class="p-prop" x="40" y="60" width="16" height="22" rx="2"/>` : "");
  };

  const LINKS = [
    ["about.html", "About the service"], ["index.html#steps", "How to use"], ["index.html#story", "User stories"], ["index.html#voice", "Words from the expert"],
    ["news.html", "Column"], ["index.html#faq", "Frequently asked questions"], ["#", "Corporate contact", 1], ["product.html", "Official Online Store", 1],
  ];
  const ext = (x) => (x ? '<i class="v-ext"></i>' : "");
  const bag = '<svg viewBox="0 0 14 14"><path d="M2.5 5h9l-.8 7.5H3.3zM5 5V3.6a2 2 0 0 1 4 0V5"/></svg>';
  const logo = '<svg viewBox="0 0 50 40" aria-hidden="true"><path class="v-logo__blob" d="M26 1c13 0 23 8 23 19S39 39 25 39 1 32 1 20 13 1 26 1z"/><text class="v-logo__txt" x="25" y="24" text-anchor="middle">logo</text></svg>';

  const head = document.querySelector("[data-v-head]");
  if (head) {
    head.outerHTML = `
      <header class="v-head" data-slot="header">
        <a class="v-logo" href="index.html" aria-label="Back to start">${logo}</a>
        <div class="v-head__right">
          <nav class="v-nav" aria-label="Menu">${[0, 4, 1, 5, 2, 6, 3, 7].map((k) => `<a href="${LINKS[k][0]}"><span class="v-roll"><span>${LINKS[k][1]}</span><span aria-hidden="true">${LINKS[k][1]}</span></span>${ext(LINKS[k][2])}</a>`).join("")}</nav>
          <button class="v-menu-btn" type="button" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>
          <a class="v-buy" href="product.html"><span class="v-rarrow v-buy__icon"><span class="is-in">${bag}</span><span class="is-out">${bag}</span></span>Buy Now</a>
        </div>
      </header>
      <nav class="v-drawer" data-slot="menu-drawer" aria-label="Phone menu">${LINKS.map((l) => `<a href="${l[0]}">${l[1]}${ext(l[2])}</a>`).join("")}</nav>`;
  }
  const cta = document.querySelector("[data-v-cta]");
  if (cta) {
    cta.outerHTML = `
      <section class="v-cta" data-slot="cta-band">
        <div class="wf-img v-cta__img" data-label="Product box and phone on a pile of vegetables and fruit · bright natural light on white · wide composition spilling to the right"></div>
        <div class="v-wrap v-cta__inner">
          <div class="v-cta__txt">
            <div class="v-cta__crumb"><a href="index.html">Home</a><span>›</span><span>${document.title.split(" — ")[0]}</span></div>
            <h2><span>Your one-line preface here</span><span>「Here」</span><span>With ”Swap It”.</span></h2>
            <p>Your two lines of body text here. Your two lines of body text here.<br>Your closing line goes here.</p>
            <a class="v-buybig" href="product.html"><span class="wf-img v-buybig__stick" data-label="Strip"></span><span><small>Your price info here 00,000 won</small><strong>Buy Now</strong></span><span class="v-rarrow"><i class="v-arrow is-in"></i><i class="v-arrow is-out"></i></span></a>
          </div>
        </div>
      </section>`;
  }
  const foot = document.querySelector("[data-v-foot]");
  if (foot) {
    foot.outerHTML = `
      <footer class="v-foot" data-slot="footer">
        <div class="v-wrap">
          <div class="v-foot__top">
            <div>
              <svg class="v-foot__logo" viewBox="0 0 210 80" role="img" aria-label="Your logo here"><text x="0" y="66">logo</text></svg>
              <div class="v-foot__people">
                <svg class="v-person" data-top="yellow" style="left: 90px; top: 70px; width: 34px; height: 74px"></svg>
                <svg class="v-person" data-top="red" data-prop="1" style="left: 160px; top: 140px; width: 34px; height: 74px"></svg>
                <svg class="v-person" data-top="purple" style="left: 300px; top: 10px; width: 30px; height: 66px"></svg>
              </div>
            </div>
            <div class="v-foot__right">
              <nav class="v-foot__links" aria-label="Footer Menu">${[0, 4, 1, 5, 2, 6, 3, 7].map((k) => `<a href="${LINKS[k][0]}">${LINKS[k][1]}${ext(LINKS[k][2])}</a>`).join("")}</nav>
              <div class="v-foot__app"><p>Your app download guide, one line, goes here</p><div class="v-foot__badges" data-label="Two app store download button images go here."><span class="v-badge">App Market 1</span><span class="v-badge">App Market 2</span></div></div>
              <a class="v-totop" href="#top">Back to Top</a>
            </div>
          </div>
          <div class="v-foot__bottom">
            <nav aria-label="Terms"><a href="#">Operator site${ext(1)}</a><a href="#">Terms of trade${ext(1)}</a><a href="#">Privacy Policy${ext(1)}</a></nav>
            <div class="v-foot__corp"><span class="wf-logo">Company logo</span><span>© 0000 Company Name. All Rights Reserved.</span></div>
          </div>
        </div>
      </footer>`;
  }
  document.querySelectorAll("svg.v-blob").forEach(V.blob);
  document.querySelectorAll("svg.v-person").forEach(V.person);

  // Sub hero — blobs swell with back.out(.5), then the figure and title follow, then every 6 seconds the blobs shift slightly
  const sub = document.querySelector(".v-subhero");
  if (sub && !reduce) {
    const bs = sub.querySelectorAll(".v-blob");
    gsap.timeline()
      .from(bs, { scale: 0, transformOrigin: "50% 50%", duration: 1, ease: "back.out(0.5)", stagger: 0.1 })
      .from(sub.querySelectorAll(".v-person"), { opacity: 0, y: -24, duration: 0.8, ease: "back.out(0.5)", stagger: 0.1 }, 0.5)
      .from(sub.querySelector("h1"), { opacity: 0, y: 30, duration: 1, ease: "power2.out" }, 0.4);
    bs.forEach((b, i) => gsap.to(b, { xPercent: i % 2 ? -5 : 5, yPercent: i % 2 ? 4 : -4, scale: 1.05, duration: 3, ease: "power2.inOut", yoyo: true, repeat: -1, repeatDelay: 3, delay: 1.2 + i * 0.2 }));
  }

  // Phone drawer
  const btn = document.querySelector(".v-menu-btn");
  const drawer = document.querySelector(".v-drawer");
  const inOut = CustomEase.create("common-easeInOut", "M0,0 C0.71,0.165 0.185,1 1,1");
  let busy = false;
  if (btn && drawer) btn.addEventListener("click", () => {
    if (busy) return;
    const on = !document.documentElement.classList.contains("is-menu");
    busy = true;
    btn.setAttribute("aria-expanded", on);
    btn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    if (on) document.documentElement.classList.add("is-menu");
    else drawer.classList.add("is-closing"), document.documentElement.classList.remove("is-menu");
    gsap.fromTo(drawer, { "--open-percentage": on ? "100%" : "0%" }, {
      "--open-percentage": on ? "0%" : "100%", duration: reduce ? 0 : 0.8, ease: inOut,
      onComplete: () => { busy = false; drawer.classList.remove("is-closing"); },
    });
    if (V.lenis) on ? V.lenis.stop() : V.lenis.start();
  });

  // Header menu text roll (original RotateText)
  const rollEase = CustomEase.create("common-easeOut", "M0,0 C0.14,0.785 0.19,1 1,1");
  document.querySelectorAll(".v-roll").forEach((roll) => {
    const [before, after] = [...roll.children].map((span) => {
      const text = span.textContent;
      span.textContent = "";
      return [...text].map((ch) => { const i = document.createElement("i"); i.textContent = ch; span.append(i); return i; });
    });
    if (!after || reduce) return;
    gsap.set(before, { transformOrigin: "bottom right" });
    gsap.set(after, { transformOrigin: "top left", skewY: 10 });
    const link = roll.closest("a") || roll;
    const go = (on) => {
      gsap.to(before, { yPercent: on ? -100 : 0, skewY: on ? 10 : 0, duration: 0.8, ease: rollEase, stagger: { each: 0.02 }, overwrite: true });
      gsap.to(after, { yPercent: on ? -100 : 0, skewY: on ? 0 : 10, duration: 0.8, ease: rollEase, stagger: { each: 0.02 }, overwrite: true });
    };
    link.addEventListener("mouseenter", () => go(true));
    link.addEventListener("mouseleave", () => go(false));
  });

  // Lenis — original lerp .1, smooth wheel. Runs on the same clock as ScrollTrigger
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  if (!reduce && window.Lenis) {
    V.lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    V.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => V.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Video modal (original ModalBackdrop): on open, backdrop 0 → .8 (1s), close button 0 → 1 (1s), content 100% → 0 (.8s, phone 1s). On close, content moves 0 → 120% downward. All common-easeInOut
  document.querySelectorAll("[data-modal-open]").forEach((opener) => {
    const modal = document.querySelector(`[data-modal="${opener.dataset.modalOpen}"]`);
    if (!modal) return;
    const bg = modal.querySelector(".v-modal__bg"), content = modal.querySelector(".v-modal__content"), btnBox = modal.querySelector(".v-modal__btn");
    const sp = () => innerWidth <= 820, d = (x) => (reduce ? 0 : x);
    let open = false;
    const show = (e) => {
      e?.preventDefault();
      if (open) return;
      open = true;
      modal.hidden = false;
      V.lenis?.stop();
      gsap.timeline()
        .fromTo(bg, { opacity: 0 }, { opacity: 0.8, duration: d(1), ease: inOut }, 0)
        .fromTo(btnBox, { opacity: 0 }, { opacity: 1, duration: d(1), ease: inOut }, 0)
        .fromTo(content, { yPercent: 100 }, { yPercent: 0, duration: d(sp() ? 1 : 0.8), ease: inOut }, 0);
      modal.querySelector(".v-modal__close").focus({ preventScroll: true });
    };
    const hide = () => {
      if (!open) return;
      open = false;
      gsap.timeline({ onComplete: () => { modal.hidden = true; V.lenis?.start(); opener.focus({ preventScroll: true }); } })
        .fromTo(content, { yPercent: 0 }, { yPercent: 120, duration: d(sp() ? 1 : 0.8), ease: inOut }, 0)
        .fromTo(bg, { opacity: 0.8 }, { opacity: 0, duration: d(1), ease: inOut }, 0)
        .fromTo(btnBox, { opacity: 1 }, { opacity: 0, duration: d(1), ease: inOut }, 0);
    };
    opener.addEventListener("click", show);
    bg.addEventListener("click", hide);
    modal.querySelector(".v-modal__close").addEventListener("click", hide);
    addEventListener("keydown", (e) => e.key === "Escape" && hide());
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = a.getAttribute("href") === "#top" ? 0 : document.querySelector(a.getAttribute("href"));
    if (t === null) return;
    e.preventDefault();
    V.lenis ? V.lenis.scrollTo(t, { duration: 1.2 }) : scrollTo(0, t ? t.offsetTop : 0);
  });

  // Header — hides once you scroll past the hero, returns on scroll up
  let lastY = 0;
  const onScroll = (y) => {
    document.documentElement.classList.toggle("is-head-hidden", y > innerHeight * 0.9 && y > lastY && !document.documentElement.classList.contains("is-menu"));
    lastY = y;
  };
  V.lenis ? V.lenis.on("scroll", (l) => onScroll(l.scroll)) : addEventListener("scroll", () => onScroll(scrollY), { passive: true });

  // Section title entrance (original SectionTitle — once): title letters rise from 110% below at .01s stagger over 1.75s common-easeOut, and .4s later the English tail rises from 110% below over 1.65s.
  // A title already on screen at first load waits 1.37s after loading, then rises. The original puts no entrance motion on cards or photos
  const titleEase = CustomEase.create("common-easeOut", "M0,0 C0.14,0.785 0.19,1 1,1");
  // Attach after the body-end script has run, so it catches titles made by page scripts (column categories)
  const setupTitles = () => {
  const titles = [...document.querySelectorAll(".v-title.v-rise")].map((box) => {
    const h = box.querySelector("h2");
    if (!h) return null;
    const small = h.querySelector("small");
    const chars = [];
    [...h.childNodes].forEach((n) => {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const wrap = document.createElement("span");
      wrap.className = "v-title__line";
      n.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { wrap.append(w); return; }
        const word = document.createElement("span");
        word.className = "v-title__word";
        [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "v-title__char"; c.textContent = ch; word.append(c); chars.push(c); });
        wrap.append(word);
      });
      n.replaceWith(wrap);
    });
    if (small) { const s = document.createElement("span"); s.className = "v-title__sub"; small.replaceWith(s); s.append(small); }
    return { box, chars, sub: small };
  }).filter(Boolean);
  if (reduce) titles.forEach((t) => t.box.classList.add("is-in"));
  else {
    titles.forEach(({ chars, sub }) => { gsap.set(chars, { yPercent: 110 }); if (sub) gsap.set(sub, { yPercent: 110 }); });
    const play = ({ box, chars, sub }) => {
      box.classList.add("is-in");
      const tl = gsap.timeline().to(chars, { yPercent: 0, duration: 1.75, ease: titleEase, stagger: { each: 0.01 } });
      if (sub) tl.to(sub, { yPercent: 0, duration: 1.65, ease: titleEase }, "<+=0.4");
    };
    const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
    let ready = false;
    loaded.then(() => setTimeout(() => (ready = true), 1370));
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      const t = titles.find((x) => x.box === en.target);
      io.unobserve(en.target);
      ready ? play(t) : loaded.then(() => setTimeout(() => play(t), 1370));
    }));
    titles.forEach((t) => io.observe(t.box));
  }
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", setupTitles) : setupTitles();

  // FAQ (original data-accordion): opening animates height to auto in .9s, closing to 0 in .8s common-easeOut. No re-press while it is moving
  const faqEase = (window.CustomEase && CustomEase.create("common-easeOut", "M0,0 C0.14,0.785 0.19,1 1,1")) || "power3.out";
  document.querySelectorAll(".v-faq__q").forEach((q) => q.addEventListener("click", () => {
    const item = q.closest(".v-faq__item");
    if (item.dataset.busy) return;
    const a = item.querySelector(".v-faq__a");
    const open = !item.classList.contains("is-open");
    item.classList.toggle("is-open", open);
    q.setAttribute("aria-expanded", open);
    item.dataset.busy = "1";
    gsap.to(a, { height: open ? "auto" : 0, duration: reduce ? 0 : open ? 0.9 : 0.8, ease: faqEase, onComplete: () => { delete item.dataset.busy; ScrollTrigger.refresh(); } });
  }));

  addEventListener("load", () => ScrollTrigger.refresh());
  document.documentElement.dataset.page = page || "";
})();
