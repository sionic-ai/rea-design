// Whole site: header icon · menu panel · mascot color switch (yellow↔blue, persists to the next section) · italic button fill · customer pill · footer
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PP = (window.PP = { reduce });
  const KEY = "pp-blue-mode";
  const readBlue = () => { try { return localStorage.getItem(KEY) === "true"; } catch (e) { return false; } };
  document.body.classList.toggle("pp-blue-mode", readBlue());

  /* ── Placeholders: header icon · menu panel · stickers · footer are shared by all sections */
  const navSlot = document.querySelector('[data-slot="nav"]');
  if (navSlot) {
    const items = [["index.html#work", "Work", "We do these pretty damn well.", ""], ["play.html", "Play", "When not working for others, we work for ourselves.", ""], ["about.html", "About", "Pulling back the curtain.", ""], ["#", "Shop", "Objects that wink", "is-blue"]];
    navSlot.innerHTML = `<header class="pp-nav"><button class="pp-nav__icon" type="button" aria-label="Open Menu" aria-expanded="false" data-label="Small Lottie icon slot (plays once on hover)">
  <svg viewBox="0 0 50 50" aria-hidden="true"><g class="pp-icon__paddle"><circle cx="22" cy="20" r="14" fill="currentColor"/><rect x="19" y="31" width="6" height="14" rx="3" fill="currentColor"/></g><circle class="pp-icon__ball" cx="38" cy="10" r="4" fill="currentColor"/></svg></button></header>
<div class="pp-menu" id="pp-menu" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="pp-menu__top"><a class="pp-menu__logo" href="index.html" data-label="Studio logo wordmark">Studio Name</a><button class="pp-menu__close" type="button" aria-label="Close Menu">✕</button></div>
  <ul class="pp-menu__list">${items.map(([h, w, d, c]) => `<li class="pp-menu__item"><a class="${c}" href="${h}"><span class="pp-menu__word"><i class="pp-menu__ball"></i>${w}</span><span class="pp-menu__desc">$ here{w === "Shop" ? "Shop" : w === "Play" ? "Play" : w === "About" ? "About" : "Work"} One-line description.</span></a></li>`).join("")}</ul>
  <div class="pp-menu__foot"><div><h6>On the studio menu today</h6><p class="mono" data-menu-today>Your one line for today’s menu & one line for today’s chatter here</p></div><div class="mono"><a href="#">Faqs</a> · <a href="#">hello@studio-name.com</a></div></div>
</div>
<span class="pp-ribbon" aria-live="polite">Your award news here in one line in the band <button type="button" data-ribbon-back>Go back ×</button></span>
<div class="pp-switch" data-slot="colour-switch">
  <button class="pp-sticker" type="button" aria-pressed="false" aria-label="Change site color">
    <svg class="pp-sticker__ring" viewBox="0 0 132 132" aria-hidden="true"><defs><path id="pp-ring" d="M66 66m-52 0a52 52 0 1 1 104 0a52 52 0 1 1 -104 0"/></defs><text><textPath href="#pp-ring">TAP FOR A BIG WIN · TAP FOR A BIG WIN ·</textPath></text></svg>
    <svg class="pp-sticker__elephant is-start" viewBox="0 0 60 60" aria-hidden="true" data-label="Standing elephant illustration (original still PNG)"><path d="M12 40c0-14 8-24 22-24 9 0 16 6 16 15v10h-5v-6h-3v6h-5v-6H22v6h-5v-6c-2 1-3 4-3 7h-4c0-3 1-6 2-8z" fill="currentColor"/><path d="M48 30c4 1 6 5 5 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="24" r="1.6" fill="var(--kf-bg)"/></svg>
    <svg class="pp-sticker__elephant is-motion" viewBox="0 0 60 60" aria-hidden="true" data-label="Walking elephant illustration (original is a transparent video)"><path d="M12 40c0-14 8-24 22-24 9 0 16 6 16 15v10h-5v-6h-3v6h-5v-6H22v6h-5v-6c-2 1-3 4-3 7h-4c0-3 1-6 2-8z" fill="currentColor"/><path d="M48 30c4 1 6 5 5 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="24" r="1.6" fill="var(--kf-bg)"/></svg>
    <svg class="pp-sticker__elephant is-end" viewBox="0 0 60 60" aria-hidden="true" data-label="Elephant drawing turned around after crossing (original still PNG)"><path d="M12 40c0-14 8-24 22-24 9 0 16 6 16 15v10h-5v-6h-3v6h-5v-6H22v6h-5v-6c-2 1-3 4-3 7h-4c0-3 1-6 2-8z" fill="currentColor"/><path d="M48 30c4 1 6 5 5 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="24" r="1.6" fill="var(--kf-bg)"/></svg>
  </button>
</div>`;
  }
  const footSlot = document.querySelector('footer[data-slot="footer"]');
  if (footSlot) {
    footSlot.innerHTML = `<div class="pp-foot">
  <h2 class="pp-foot__title" data-label="Decorative italic English single word">Footnotes</h2>
  <div class="pp-foot__row">
    <div class="pp-foot__record"><svg viewBox="0 0 100 100" aria-hidden="true" data-label="Vinyl record — round label graphic in the center"><circle cx="50" cy="50" r="49" fill="var(--kf-ink)"/><g fill="none" stroke="var(--kf-dim)" stroke-width=".3" opacity=".6"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="32"/><circle cx="50" cy="50" r="28"/></g><circle cx="50" cy="50" r="18" fill="var(--pp-accent)"/><path d="M50 32a18 18 0 0 1 18 18H50z" fill="var(--site-blue)"/><circle cx="50" cy="50" r="2" fill="var(--kf-ink)"/></svg></div>
    <div class="pp-foot__spots"><a class="pp-foot__spot wf-img" href="#" data-label="Flowering tree and blue sky · landscape strip"><span>Spot us in City One</span></a><a class="pp-foot__spot wf-img" href="#" data-label="Red-walled building window · horizontal strip"><span>Spot us in City Two</span></a></div>
    <div class="pp-foot__thanks"><p>Thank you for<br>stopping by!</p><small>write to us at<br>hello@studio-name.com</small></div>
  </div>
  <div class="pp-foot__bar"><span><b>Typefaces</b> Three typeface names</span><span class="pp-foot__social"><a href="#" aria-label="Photo account"><svg viewBox="0 0 18 18"><rect x="2" y="2" width="14" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="9" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a><a href="#" aria-label="Post account"><svg viewBox="0 0 18 18"><path d="M2 15V3h3l4 7 4-7h3v12" fill="none" stroke="currentColor" stroke-width="2"/></svg></a></span><span><b>Developers</b> Maker name</span></div>
  <div class="pp-foot__band"><span class="narrow">Ping</span><p>Let's play a round?</p><span class="narrow">Pong</span></div>
</div>`;
  }

  /* ── Header icon ── on hover plays once from the start (original Lottie goToAndPlay(0)) — our drawing: a ball bounces off a racket and the racket shakes 1s */
  const icon = document.querySelector(".pp-nav__icon");
  const menu = document.querySelector(".pp-menu");
  if (icon && window.gsap && !reduce) {
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(".pp-icon__ball", { x: 0, y: 0 }, { x: -12, y: 8, duration: 0.25, ease: "power2.in" })
      .to(".pp-icon__ball", { x: 0, y: -4, duration: 0.35, ease: "power2.out" })
      .to(".pp-icon__ball", { x: 0, y: 0, duration: 0.4, ease: "bounce.out" })
      .fromTo(".pp-icon__paddle", { rotation: 0, svgOrigin: "22 45" }, { rotation: -14, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1, svgOrigin: "22 45" }, 0.15);
    icon.addEventListener("mouseenter", () => tl.restart());
  }
  if (icon && menu) {
    const set = (on) => {
      menu.classList.toggle("is-open", on);
      icon.setAttribute("aria-expanded", on);
      document.body.style.overflow = on ? "hidden" : "";
      if (on) menu.querySelector(".pp-menu__close").focus(); else icon.focus();
    };
    icon.addEventListener("click", () => set(true));
    menu.querySelector(".pp-menu__close").addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && menu.classList.contains("is-open") && set(false));
  }

  /* ── Elephant sticker ── at 1440 it takes 1.58s (proportional to distance, between 1.18 and 2.84s), on phone 1.05s in place. Color changes the instant it’s pressed and persists on the next section */
  const sw = document.querySelector(".pp-switch");
  if (sw) {
    const sticker = sw.querySelector(".pp-sticker");
    let busy = false;
    const apply = (blue) => {
      document.body.classList.toggle("pp-blue-mode", blue);
      sticker.setAttribute("aria-pressed", blue);
      try { localStorage.setItem(KEY, blue ? "true" : "false"); } catch (e) {}
      dispatchEvent(new CustomEvent("pingpong-colour-change", { detail: { blueMode: blue } }));
    };
    sticker.setAttribute("aria-pressed", readBlue());
    sticker.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      const toBlue = !document.body.classList.contains("pp-blue-mode");
      const phone = matchMedia("(max-width: 767px)").matches;
      const size = sw.offsetWidth, edge = parseFloat(getComputedStyle(sw).getPropertyValue("--pp-sticker-edge")) || 24;
      const dist = Math.max(1, innerWidth - size - edge * 2), ref = 1440 - 132 - 48;
      const dur = phone ? 1.05 : Math.max(1.58 * 0.75, Math.min(1.58 * 1.8, 1.58 * (dist / ref)));
      if (!reduce && !phone) {
        sw.style.setProperty("--pp-travel", `${dur}s`);
        sw.classList.add("is-moving");
        void sw.offsetWidth;
      }
      // When the body class changes, the switch transform (the crossed spot) moves with the is-moving transition
      apply(toBlue);
      // The still elephant drops out the moment it is pressed and shows the end image after travel + 30ms (original setTimeout(travelMs + 30)) — the switch starts 30ms late.
      if (!reduce && !phone) {
        sw.classList.add("is-swapping");
        setTimeout(() => sw.classList.remove("is-swapping"), dur * 1000 + 30);
      }
      setTimeout(() => { sw.classList.remove("is-moving"); busy = false; }, reduce || phone ? 0 : (0.03 + dur) * 1000 + 30);
    });
    document.querySelector("[data-ribbon-back]")?.addEventListener("click", (e) => { e.stopPropagation(); if (document.body.classList.contains("pp-blue-mode")) sticker.click(); });
  }

  /* ── Italic button ── sets the fill origin where the pointer enters and leaves */
  document.querySelectorAll(".pp-btn").forEach((b) => {
    if (b.classList.contains("is-plain")) return;
    if (!b.querySelector(":scope > i")) b.prepend(document.createElement("i"));
    const dot = b.querySelector(":scope > i");
    ["mouseenter", "mouseout"].forEach((ev) => b.addEventListener(ev, (e) => {
      const r = b.getBoundingClientRect();
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
    }));
  });

  /* ── Client pills ── two groups alternate across 16 original spots (%) — .4s flicker when the group switches */
  PP.clients = (root) => {
    if (!root) return;
    const pills = [...root.querySelectorAll(".pp-clients__pills .pp-pill")];
    const groups = [1, 2].map((g) => pills.filter((p) => p.dataset.group == g));
    let cur = 0;
    const show = (i) => {
      groups.forEach((g, k) => g.forEach((p) => { p.classList.toggle("is-off", k !== i); p.classList.remove("is-blink"); }));
      if (!reduce) groups[i].forEach((p) => { void p.offsetWidth; p.classList.add("is-blink"); });
    };
    show(0);
    if (reduce || matchMedia("(max-width: 768px)").matches) { pills.forEach((p) => p.classList.remove("is-off")); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cur = (cur + 1) % 2; show(cur); } }, { threshold: [0.5] });
    io.observe(root);
    setInterval(() => { if (document.visibilityState === "visible") { cur = (cur + 1) % 2; show(cur); } }, 3200);
  };

  if (window.AOS) AOS.init({ disable: reduce });
})();
