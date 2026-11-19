// Image bundle and interaction reactions shared by all sections — the original doesn’t use GSAP on these sections, it adds classes and moves with CSS transition.
// So the values live in shared.css, and here we only add the class at the same moment as the original.
(() => {
  const html = document.documentElement;

  // Mascot (droplet kid) · symptom eye icon · phone and calendar — new drawings of our own in the spot of the original’s squid character, at the same size and stroke weight
  const body = (limbs) => `
    <path class="me-s-paper me-s-stroke" d="M40 6C40 6 12 40 12 62a28 28 0 0 0 56 0C68 40 40 6 40 6Z"/>
    <path class="me-s-line-acc" d="M23 50q3-10 10-18"/>
    <circle class="me-s-acc" cx="55" cy="12" r="3.2"/>
    <ellipse class="me-s-ink" cx="30" cy="62" rx="4.4" ry="6"/><ellipse class="me-s-ink" cx="50" cy="62" rx="4.4" ry="6"/>
    <circle class="me-s-paper" cx="31.6" cy="59.4" r="1.5"/><circle class="me-s-paper" cx="51.6" cy="59.4" r="1.5"/>
    <ellipse class="me-s-bub" cx="22.5" cy="72" rx="3.6" ry="2.2"/><ellipse class="me-s-bub" cx="57.5" cy="72" rx="3.6" ry="2.2"/>
    <path class="me-s-line" d="M35.5 74q4.5 4.5 9 0"/>${limbs}`;
  const legs = `<path class="me-s-line" d="M33 89.5l-2 15M47 89.5l2 15"/><path class="me-s-paper me-s-stroke" d="M24 106.5c0-3 3.5-4 7-4s5 1.5 5 4zM44 106.5c0-3 1.5-4 5-4s7 1 7 4z"/>`;
  const SPRITE = `<svg class="me-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <symbol id="me-m-wave" viewBox="0 0 80 130">${body(`<path class="me-s-line" d="M13.5 66L4 76M66.5 62L76 48"/>${legs}`)}</symbol>
    <symbol id="me-m-point" viewBox="0 0 80 130">${body(`<path class="me-s-line" d="M13.5 66L4 60M66.5 66l9 6"/><circle class="me-s-paper me-s-stroke" cx="77" cy="73" r="2.6"/>${legs}`)}</symbol>
    <symbol id="me-m-sit" viewBox="0 0 80 130">${body(`<path class="me-s-line" d="M13.5 68l-6 10M66.5 68l6 10"/><path class="me-s-line" d="M33 89l-6 12M47 89l6 12"/>`)}</symbol>
    <symbol id="me-m-head" viewBox="0 0 80 100">${body("")}</symbol>
    <symbol id="me-eye-red" viewBox="0 0 76 82">
      <path class="me-s-paper me-s-stroke" d="M6 42C16 26 27 19 38 19s22 7 32 23C60 58 49 65 38 65S16 58 6 42Z"/>
      <path class="me-s-line-acc" d="M12 42l7-3m-4 9l7-2M64 42l-7-3m4 9l-7-2"/>
      <circle class="me-s-paper me-s-stroke" cx="38" cy="42" r="12"/><circle class="me-s-ink" cx="38" cy="42" r="6"/><circle class="me-s-paper" cx="40.5" cy="39.5" r="2"/>
      <path class="me-s-line" d="M22 13l-3-6M38 10V3M54 13l3-6"/>
    </symbol>
    <symbol id="me-eye-swell" viewBox="0 0 76 82">
      <path class="me-s-paper me-s-stroke" d="M8 46c6-18 18-30 30-30s24 12 30 30"/>
      <path class="me-s-paper me-s-stroke" d="M10 46C19 36 28 32 38 32s19 4 28 14C57 58 48 63 38 63S19 58 10 46Z"/>
      <circle class="me-s-ink" cx="38" cy="47" r="7"/><circle class="me-s-paper" cx="40.5" cy="44.5" r="2"/>
      <path class="me-s-line-acc" d="M60 10c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10Z"/>
    </symbol>
    <symbol id="me-eye-tired" viewBox="0 0 76 82">
      <path class="me-s-paper me-s-stroke" d="M8 44C18 30 28 25 38 25s20 5 30 19C58 57 48 62 38 62S18 57 8 44Z"/>
      <path class="me-s-ink" d="M27 44a11 11 0 0 0 22 0Z"/>
      <path class="me-s-line" d="M8 40c10-6 20-8 30-8s20 2 30 8"/>
      <path class="me-s-line" d="M30 70q4-3 8 0t8 0"/><path class="me-s-line-acc" d="M64 14v8m-4-4h8M12 18v6m-3-3h6"/>
    </symbol>
    <symbol id="me-i-tel" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z"/></symbol>
    <symbol id="me-i-cal" viewBox="0 0 24 24"><path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3Zm12 7H5v10h14ZM7 11h4v4H7Z"/></symbol>
    <symbol id="me-i-crowd" viewBox="0 0 24 24"><path d="M8 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm8 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM1.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5Zm14.5 0c0-2-.7-3.9-2-5.3a5.6 5.6 0 0 1 8.5 5.3Z"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  const isSp = () => innerWidth <= 767;

  // Header — once scrolled down even one step, html.is-scroll (the original checks every 100ms)
  const onScrollState = () => html.classList.toggle("is-scroll", Math.round(scrollY) > 0);
  let tScroll = 0;
  addEventListener("scroll", () => {
    if (tScroll) return;
    tScroll = setTimeout(() => { tScroll = 0; onScrollState(); }, 100);
  }, { passive: true });
  onScrollState();

  // Phone drawer — pressing the three-line button or the overlay toggles html.is-nav-active
  const burger = document.querySelector(".me-burger");
  const layer = document.querySelector(".me-backlayer");
  const toggleNav = () => {
    const on = html.classList.toggle("is-nav-active");
    burger?.setAttribute("aria-expanded", on ? "true" : "false");
  };
  burger?.addEventListener("click", toggleNav);
  layer?.addEventListener("click", toggleNav);
  let wasSp = isSp();
  addEventListener("resize", () => {
    if (wasSp !== isSp()) { wasSp = isSp(); html.classList.remove("is-nav-active"); }
  });

  // Cursor: a 24px dot follows the mouse directly (no interpolation), hidden on touch devices
  const cursor = document.querySelector(".me-cursor");
  if (cursor) {
    if ("ontouchstart" in window || navigator.maxTouchPoints) cursor.classList.add("is-touch");
    document.addEventListener("mousemove", (e) => {
      if (innerWidth > 767) cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }

  // Side button — if the screen is wider than 1600 it aligns to the right edge of the body, and hides downward when the footer enters the screen
  const side = document.querySelector(".me-side");
  const foot = document.querySelector(".me-foot");
  if (side) {
    const place = () => { side.style.right = innerWidth >= 1600 ? `${(innerWidth - 1600) / 2}px` : ""; };
    const hide = () => side.classList.toggle("is-hide", !!foot && foot.getBoundingClientRect().top <= innerHeight);
    addEventListener("resize", place);
    addEventListener("scroll", hide, { passive: true });
    place();
    hide();
  }

  // In-section link, smooth scroll minus the header height (110 · phone 80)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const to = id && document.getElementById(id);
      if (!to) return;
      e.preventDefault();
      scrollTo({ top: to.getBoundingClientRect().top + scrollY - (innerWidth > 767 ? 110 : 80), behavior: "smooth" });
    });
  });

  // Scroll reveal — is-show is added when the element’s top edge crosses the line 100px from the screen bottom (same threshold as the original). Attached after load like the original
  const reveal = () => {
    document.querySelectorAll(".me-reveal:not(.is-show)").forEach((el) => {
      if (el.getBoundingClientRect().top <= innerHeight - 100) el.classList.add("is-show");
    });
  };
  addEventListener("load", () => {
    gsap.matchMedia().add({ normal: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.reduce) {
        document.querySelectorAll(".me-reveal").forEach((el) => el.classList.add("is-show"));
        return;
      }
      addEventListener("scroll", reveal, { passive: true });
      reveal();
      return () => removeEventListener("scroll", reveal);
    });
    html.classList.add("is-loaded");
    if (location.hash) document.querySelector(`a[href="${location.hash}"]`)?.click();
  });
})();
