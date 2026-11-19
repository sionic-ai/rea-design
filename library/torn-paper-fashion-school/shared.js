// Common to all pages: draws in the opening panel, header, blurred-curtain menu, footer and bottom fixed button, and hooks up torn edges, card flip, dialog and header text color.
// Original values: the opening panel lifts in .5s once all images arrive (4s at the latest), the logo hides after scrolling past 30px, header text turns black when the background brightness under the header exceeds 220,
// The fixed bottom button appears past 30px and hides when it reaches the footer. Inner links scroll at 800ms easeInOutQuad (80px above on PC, 40px on phone), dialog close .3s.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth < 769;

  const tear = '<path d="M0 31L0.0 17.0L5.6 15.0L9.6 15.2L12.8 14.9L16.9 12.6L21.9 12.3L26.9 6.6L31.5 7.3L37.4 6.7L41.2 7.0L44.8 5.0L49.8 5.5L54.5 6.1L58.2 7.6L61.1 10.6L66.9 9.6L69.7 11.5L75.4 11.3L78.4 11.9L83.7 11.8L86.7 13.0L90.5 17.8L94.4 16.1L96.9 14.8L99.6 16.9L102.5 14.6L106.7 12.4L111.1 13.6L114.6 11.7L119.4 12.6L122.7 10.7L125.3 11.9L129.2 10.3L134.6 8.2L140.2 9.4L144.2 8.5L148.8 6.3L151.4 5.4L156.5 5.1L161.3 5.7L164.2 7.5L169.5 9.9L173.2 7.6L178.3 7.1L180.9 7.9L186.7 7.5L191.3 9.8L194.4 10.0L200.4 13.7L204.2 11.4L208.2 12.2L213.5 11.2L216.6 9.0L221.4 10.2L225.8 11.1L231.4 13.5L235.2 14.0L238.7 10.3L242.1 12.0L248.0 7.7L251.5 7.0L256.9 5.0L260.8 5.9L263.6 7.9L266.7 10.2L269.8 7.9L272.8 9.0L277.8 9.3L283.2 9.8L286.8 8.0L292.3 6.6L295.9 7.2L301.4 6.9L306.2 8.1L309.8 9.9L315.7 8.2L320.9 14.7L324.7 13.3L327.7 12.5L330.4 13.6L333.4 15.7L339.3 13.4L344.6 13.0L348.9 10.6L353.6 12.1L357.6 10.6L363.6 15.4L367.0 16.6L370.7 18.7L376.6 20.5L379.6 22.8L385.0 22.6L390.7 22.3L396.6 23.7L399.2 23.8L404.0 24.5L407.6 24.5L413.2 23.4L416.9 24.5L421.8 24.1L424.5 24.6L430.2 24.5L433.6 23.3L439.0 19.5L444.9 20.1L448.3 20.5L453.1 22.3L458.2 23.4L463.5 21.8L466.2 22.6L472.2 20.2L477.3 20.5L482.6 21.2L487.9 20.5L492.2 22.4L497.7 20.4L502.5 20.9L505.7 22.4L508.7 20.7L514.7 21.2L518.9 22.7L523.3 23.2L528.6 24.8L533.2 23.7L539.0 24.3L543.3 23.7L547.6 24.0L550.4 22.8L556.0 22.6L560.4 16.4L565.7 17.5L570.1 18.2L574.2 16.0L577.6 17.2L582.9 16.4L586.8 16.3L590.8 17.1L595.8 15.6L601.6 13.3L606.9 14.2L611.9 15.5L617.8 17.6L623.5 15.9L627.9 16.0L632.6 16.6L638.4 16.1L643.0 15.7L646.1 13.3L649.6 11.3L653.3 13.4L658.2 15.0L661.1 15.6L667.0 15.2L670.4 13.2L675.3 12.1L681.2 13.0L687.2 11.3L692.3 12.4L696.7 12.8L699.3 12.2L704.6 5.4L707.8 7.1L710.7 5.6L714.5 5.4L719.8 7.4L723.0 7.7L727.6 8.2L730.3 9.0L735.0 6.7L738.9 7.5L741.4 6.8L746.2 8.2L749.2 9.2L752.6 10.6L756.2 10.5L758.7 9.4L762.9 11.1L766.9 9.7L772.7 12.0L775.6 13.1L779.0 14.6L781.6 15.5L785.5 17.7L788.7 20.0L794.3 12.9L798.1 19.0L803.1 19.4L808.3 21.3L811.0 18.2L814.2 16.2L817.2 14.2L821.5 14.2L826.8 7.0L829.4 7.1L834.8 5.3L838.4 9.3L842.6 7.3L848.1 8.3L854.0 8.9L859.3 7.5L864.9 5.4L868.8 5.7L874.5 5.6L878.8 5.7L881.6 6.2L884.3 5.1L887.2 6.6L889.8 8.1L894.8 6.0L900.6 5.2L904.3 6.9L907.3 8.9L913.2 11.1L918.2 8.8L922.6 7.6L926.4 7.4L930.9 7.6L934.1 9.1L939.4 8.9L942.2 8.7L948.0 10.6L953.1 12.3L958.0 11.4L960.6 11.8L966.2 12.4L969.2 10.1L974.5 9.5L978.9 8.1L982.6 7.2L986.0 6.4L991.8 5.3L995.3 5.6L1000 5.6L1000 31Z" fill="currentColor"/>';
  document.querySelectorAll("svg[data-tear-slot]").forEach((svg) => (svg.innerHTML = tear));
  document.querySelectorAll("[data-tear]").forEach((el) => {
    // rise is the top edge where that section’s own ink sheet tears upward (in the original the section background image has a torn top edge) — color settings apply only to bottom·top
    el.dataset.tear.split(" ").forEach((side) => el.insertAdjacentHTML("beforeend", `<svg class="yf-tear -${side}${el.dataset.tearTone && side !== "rise" ? " -" + el.dataset.tearTone : ""}" viewBox="0 0 1000 31" preserveAspectRatio="none" aria-hidden="true">${tear}</svg>`));
  });

  // Crown-shaped symbol plus School name text in place of the original logo
  const logo = '<svg viewBox="0 0 182 30" aria-hidden="true"><path d="M2 26V9l7 6 6-9 6 9 7-6v17Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><text x="36" y="22" font-size="19" font-weight="700" fill="currentColor" style="font-family: var(--kf-font-sans)">School name here</text></svg>';

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("yf-head");
    head.innerHTML = `
      <div class="yf-head__inner">
        <a class="yf-logo" href="index.html">${logo}<span class="text">Fashion Creator Dept.</span></a>
        <button class="yf-menu-btn" type="button" aria-expanded="false" aria-label="Open Menu"><span class="text">MENU</span><span class="hamburger"></span></button>
      </div>
      <nav class="yf-nav" aria-label="Menu" data-slot="drawer"><div class="yf-nav__inner">
        <div class="yf-nav__main">
          <ul class="yf-nav__courses">
            <li><a href="course.html"><span class="en">Top Creator</span><span class="jp">Top Creator Course</span></a></li>
            <li><a href="course.html"><span class="en">Fashion Creator</span><span class="jp">Fashion creator course</span></a></li>
            <li><a href="course.html"><span class="en">Costume Designer</span><span class="jp">Costume designer course</span></a></li>
          </ul>
          <ul class="yf-nav__cta"><li style="display:contents"><a href="#"><span class="en">Open Campus</span><span class="jp">Open Campus</span></a></li><li style="display:contents"><a href="#"><span class="en">Request</span><span class="jp">Brochure Request</span></a></li></ul>
        </div>
        <div class="yf-nav__foot">
          <ul class="yf-nav__articles"><li><a href="news.html" data-fx="line-redraw-hover">News · Topics</a></li><li><a href="index.html#program" data-fx="line-redraw-hover">Special program</a></li><li><a href="index.html#instructor" data-fx="line-redraw-hover">Guest Instructor</a></li></ul>
          <ul class="yf-nav__others"><li><a href="#" data-fx="line-redraw-hover">School official site</a></li><li><a href="#" data-fx="line-redraw-hover">Application guidelines</a></li><li><a href="#" data-fx="line-redraw-hover">Tuition</a></li><li><a href="#" data-fx="line-redraw-hover">Directions</a></li></ul>
        </div>
      </div></nav>`;
  }
  if (document.querySelector("[data-fixed-links]")) {
    document.body.insertAdjacentHTML("beforeend", '<div class="yf-fixed" data-slot="fixed-links"><a href="#">Open Campus</a><a href="#">Brochure Request</a></div>');
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("yf-foot", "yf-paper");
    foot.insertAdjacentHTML("beforeend", `<svg class="yf-tear -top -white" viewBox="0 0 1000 31" preserveAspectRatio="none" aria-hidden="true">${tear}</svg>`);
    foot.insertAdjacentHTML("beforeend", `<div class="yf-foot__inner">
      <a class="yf-foot__main" href="#"><span class="en">Open Campus</span><span class="jp">Open Campus</span></a>
      <a class="yf-foot__main" href="#"><span class="en">Request</span><span class="jp">Brochure Request</span></a>
      <ul class="yf-foot__subs"><li><a href="#" data-fx="line-redraw-hover">Official school site ↗</a></li><li><a href="#" data-fx="line-redraw-hover">Recruitment guide ↗</a></li><li><a href="#" data-fx="line-redraw-hover">Tuition ↗</a></li><li><a href="#" data-fx="line-redraw-hover">Directions ↗</a></li></ul>
      <div class="yf-foot__bottom"><a class="yf-logo" href="index.html">${logo}<span class="text">Fashion Creator Dept.</span></a><p class="yf-foot__copy">©SCHOOL NAME HERE.</p></div>
    </div>`);
  }

  // Menu
  const btn = document.querySelector(".yf-menu-btn"), nav = document.querySelector(".yf-nav"), logoEl = document.querySelector(".yf-head .yf-logo");
  const label = (on) => { btn.setAttribute("aria-expanded", String(on)); btn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu"); btn.querySelector(".text").textContent = on ? "CLOSE" : "MENU"; };
  btn?.addEventListener("click", () => {
    const on = !btn.classList.contains("is-active");
    btn.classList.toggle("is-active", on);
    nav.classList.toggle("is-open", on);
    document.body.classList.toggle("scrollLock", on);
    label(on);
    if (logoEl) logoEl.classList.toggle("is-hidden", !on && scrollY >= 30);
  });

  // Logo hide (30px), bottom fixed button, header text color — once per frame
  const fixed = document.querySelector(".yf-fixed");
  const headEl = document.querySelector(".yf-head");
  // Base brightness — null if transparent, and if it is an image background, treated as dark (50) like the original
  const lumOf = (cs) => {
    const n = (cs.backgroundColor.match(/[\d.]+/g) || []).map(Number);
    if (n.length >= 3 && (n.length < 4 || n[3] > 0)) return 0.299 * n[0] + 0.587 * n[1] + 0.114 * n[2];
    return cs.backgroundImage && cs.backgroundImage !== "none" ? 50 : null;
  };
  const tone = () => {
    if (!headEl) return;
    // The original looks up the background of the dot under the header, going upward — white text on photo · video sections, black text on a light background
    const r = headEl.querySelector(".yf-menu-btn").getBoundingClientRect();
    headEl.style.pointerEvents = "none";
    let el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    headEl.style.pointerEvents = "";
    let lum = 255;
    for (let n = 0; el && n < 20; n++, el = el.parentElement) {
      if (el.matches?.("[data-tone=dark]")) return headEl.classList.remove("is-black");
      const v = lumOf(getComputedStyle(el));
      if (v !== null) { lum = v; break; }
    }
    headEl.classList.toggle("is-black", lum > 220);
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (logoEl && !btn.classList.contains("is-active")) logoEl.classList.toggle("is-hidden", scrollY >= 30);
      if (fixed) {
        const ft = foot ? foot.getBoundingClientRect().top + scrollY : Infinity;
        fixed.classList.toggle("is-visible", scrollY >= 30 && scrollY + innerHeight < ft);
      }
      tone();
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  // Internal links — 800ms easeInOutQuad
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const id = a?.getAttribute("href").slice(1);
    const t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    const from = scrollY, to = t.getBoundingClientRect().top + scrollY - (innerWidth <= 768 ? 40 : 80), t0 = performance.now();
    if (reduced) return scrollTo(0, to);
    const step = (now) => {
      const p = Math.min((now - t0) / 800, 1), q = p < 0.5 ? 2 * p * p : (4 - 2 * p) * p - 1;
      scrollTo(0, from + (to - from) * q);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    history.pushState(null, "", "#" + id);
  });

  // Card slide, original jsSlider: with four or more cards (more on phones) it appends four extra sets to loop endlessly, and fades the card straddling the right edge
  const clip = (s) => { const edge = s.el.getBoundingClientRect().right; s.slides.forEach((x) => { const r = x.getBoundingClientRect(); x.classList.toggle("is-clipped", r.right > edge && r.left < edge); }); };
  document.querySelectorAll(".yf-slider").forEach((box) => {
    const wrap = box.querySelector(".swiper-wrapper");
    if (!wrap || typeof Swiper === "undefined") return;
    const n = wrap.children.length, many = phone() || n >= 4, pick = box.classList.contains("-pickup");
    const next = box.querySelector(".swiper-button-next");
    if (many) for (let k = 0; k < 4; k++) [...wrap.children].slice(0, n).forEach((c) => { const d = c.cloneNode(true); d.classList.add("swiper-slide-duplicate"); d.setAttribute("aria-hidden", "true"); d.querySelectorAll("a, button").forEach((b) => b.setAttribute("tabindex", "-1")); wrap.append(d); });
    const sw = new Swiper(box.querySelector(".swiper"), {
      slidesPerView: "auto", spaceBetween: pick ? 16 : 32, loop: false, speed: reduced ? 0 : 600,
      allowTouchMove: many, navigation: many ? { nextEl: next } : false,
      on: {
        init() { clip(this); }, setTranslate() { clip(this); }, slideChangeTransitionStart() { clip(this); },
        slideChangeTransitionEnd() { if (many && this.activeIndex >= 2 * n) { this.setTransition(0); this.slideTo(this.activeIndex - n, 0); setTimeout(() => this.setTransition(600), 50); } clip(this); },
      },
    });
    // The original, the moment the next button is pressed, picks in advance the card that straddles the spot after moving one cell (current card width + gap) — it brightens and fades over .3s while moving
    next?.addEventListener("click", () => {
      const edge = sw.el.getBoundingClientRect().right, cur = sw.slides[sw.activeIndex];
      const shift = cur ? cur.getBoundingClientRect().width + (pick ? 16 : 32) : 0;
      sw.slides.forEach((x) => { const r = x.getBoundingClientRect(); x.classList.toggle("is-clipped", r.right - shift > edge && r.left - shift < edge); });
    });
    if (!many && next) next.hidden = true;
    if (many) setTimeout(() => { sw.slideTo(n, 0); setTimeout(() => clip(sw), 100); }, 100);
  });

  // Instructor dialog — appears in .3s on open, closes .3s after closing
  document.querySelectorAll("[data-modal-trigger]").forEach((t) => {
    const dlg = document.getElementById(t.dataset.modalTrigger);
    if (!dlg) return;
    const close = () => { dlg.classList.remove("is-open"); setTimeout(() => { dlg.close(); document.body.classList.remove("scrollLock"); t.focus(); }, reduced ? 0 : 300); };
    if (!dlg.dataset.bound) {
      dlg.dataset.bound = "1";
      dlg.addEventListener("click", (e) => e.target === dlg && close());
      dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
      dlg.querySelectorAll("[data-modal-close]").forEach((c) => c.addEventListener("click", (e) => { e.preventDefault(); close(); }));
    }
    t.addEventListener("click", (e) => { e.preventDefault(); dlg.showModal(); document.body.classList.add("scrollLock"); requestAnimationFrame(() => dlg.classList.add("is-open")); });
  });

  // Opening panel — the original lifts once fonts and images have all arrived (4 seconds at the latest). .1s after it starts lifting, it announces yfLoaderFadeOut.
  const loader = document.querySelector(".yf-loader");
  const done = () => {
    if (!loader || loader.classList.contains("is-fadeout")) return;
    loader.classList.add("is-fadeout");
    document.body.classList.remove("scrollLock");
    setTimeout(() => dispatchEvent(new CustomEvent("yfLoaderFadeOut")), 100);
    setTimeout(() => (loader.style.display = "none"), 500);
  };
  if (loader) {
    document.body.classList.add("scrollLock");
    headEl?.classList.add("is-black");
    let f = 0;
    // Like the original, the KV video waits until metadata arrives (3 seconds at most)
    const kv = document.querySelector("video");
    const meta = kv && kv.readyState < 1 ? new Promise((r) => { kv.addEventListener("loadedmetadata", r, { once: true }); kv.addEventListener("error", r, { once: true }); setTimeout(r, 3000); }) : null;
    const settle = () => (++f >= 3 ? Promise.all([document.fonts.ready, meta]).then(done) : requestAnimationFrame(settle));
    addEventListener("load", () => requestAnimationFrame(settle), { once: true });
    setTimeout(done, 4000);
  }
  addEventListener("yfLoaderFadeOut", onScroll);
  onScroll();
})();
