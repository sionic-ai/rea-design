// Shared by all pages: header, address panel, footer, cursor, time-transition panel, work card strip, mail signup and scroll-down button.
// The original is a Next app so the header and footer persist across pages — the copy draws the same ones here on every page.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  if (touch) document.documentElement.classList.add("is-touch");
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  const OUT = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 8 8 2M3 2h5v5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  const PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8h14" stroke="currentColor" stroke-width="1.5"/><path data-vertical d="M8 1v14" stroke="currentColor" stroke-width="1.5"/></svg>';
  window.fgIcons = { ARROW, OUT, PLUS };

  const wrap = document.querySelector(".fg-wrap");
  if (wrap && wrap.classList.contains("is-dark")) body.classList.add("is-dark");

  // ───────── Header — always visible within the top 200px, hides after scrolling down more than 20px and reappears after scrolling up more than 10px ─────────
  const header = document.createElement("header");
  header.className = "fg-header";
  header.dataset.slot = "header";
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  header.innerHTML = `<a class="fg-home" href="index.html">Logo</a>
    <nav class="fg-nav" aria-label="Main menu"><ul>
      <li><a href="detail.html"${cur("detail")}>Work</a></li>
      <li><a href="service.html"${cur("service") || cur("workshop")}>Workshop</a></li>
      <li><a href="index.html#who">About</a></li>
      <li><button type="button" aria-controls="fg-contact" aria-expanded="false" data-fg-contact>Inquiry</button></li>
    </ul></nav>`;
  body.prepend(header);
  {
    let prev = null, acc = 0;
    const DOWN = 20, TOP = 200, UP = 10;
    const tick = () => {
      const y = scrollY;
      if (prev !== null) acc += prev - y;
      prev = y;
      const down = acc < -DOWN, up = acc > UP;
      if (down || up) acc = 0;
      if (y < TOP) { header.classList.add("is-top"); header.classList.remove("is-pinned"); }
      else { header.classList.remove("is-top"); if (down) header.classList.remove("is-pinned"); else if (up) header.classList.add("is-pinned"); }
    };
    addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // ───────── Address panel (Contact) ─────────
  const contact = document.createElement("address");
  contact.className = "fg-contact fg-b2";
  contact.id = "fg-contact";
  contact.dataset.slot = "contact";
  contact.innerHTML = `<div class="fg-contact__outer"><div class="fg-contact__inner">
      <a class="fg-contact__mail" href="mailto:hello@example.com">hello@example.com</a>
      <div><a href="#">Your address first line here<br>City name, Region<br>00000</a></div>
      <ul><li><a href="#">@accountname</a></li></ul>
    </div></div>`;
  if (wrap) wrap.append(contact);
  const cBtn = header.querySelector("[data-fg-contact]");
  const outer = contact.querySelector(".fg-contact__outer");
  const measure = () => contact.style.setProperty("--fg-maxh", `${outer.scrollHeight}px`);
  new ResizeObserver(measure).observe(outer.firstElementChild);
  const setContact = (on) => {
    measure();
    contact.classList.toggle("is-open", on);
    cBtn.setAttribute("aria-expanded", String(on));
    header.classList.toggle("is-contact", on);
    if (wrap) wrap.classList.toggle("is-contact", on);
  };
  cBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const on = contact.classList.contains("is-open");
    if (!on) scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    setContact(!on);
  });
  document.addEventListener("click", (e) => {
    if (!contact.classList.contains("is-open") || contact.contains(e.target) || e.target.closest("[data-fg-contact]")) return;
    setContact(false);
  });

  // ───────── Footer ─────────
  const menu = (title, links) => `<nav data-slot="footer-menu"><h3>${title}</h3>
    <div class="fg-exp"><button type="button" class="fg-exp__btn" aria-expanded="false">${title}${PLUS}</button>
      <div class="fg-exp__body"><ul>${links.map(([t, h, ext]) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}${ext ? OUT : ""}</a></li>`).join("")}</ul></div></div></nav>`;
  const foot = document.createElement("footer");
  foot.className = "fg-foot";
  foot.dataset.slot = "footer";
  foot.innerHTML = `<div class="fg-box fg-foot__top fg-b3">
      <div class="fg-foot__titles fg-b2"><h2>Logo</h2><p>Your one-line intro here</p></div>
      ${menu("Browse workshops", [["Step 1 for the company", "workshop.html"], ["Step 2 for the company", "workshop.html"], ["Step 3 for the company", "workshop.html"]])}
      ${menu("Work", [["Work name 1", "detail.html"], ["Work name 2", "detail.html"], ["Work name 3", "detail.html"], ["Work name 4", "detail.html"]])}
      ${menu("Follow", [["Link 1", "#", 1], ["Link 2", "#", 1]])}
    </div>
    <div class="fg-foot__bottom"><div class="fg-box fg-foot__row">
      <div class="fg-foot__copy">© 0000 Logo. Copyright notice spot</div>
      <address class="fg-foot__addr"><a href="#">Address line here, City, Region, 00000</a></address>
      <div class="fg-foot__mail"><a href="mailto:hello@example.com">hello@example.com</a></div>
    </div></div>`;
  const trigger = document.createElement("div");
  trigger.className = "fg-trigger";
  if (wrap) { wrap.after(foot); foot.after(trigger); } else body.append(foot, trigger);
  new IntersectionObserver((es) => es.forEach((en) => {
    foot.classList.toggle("is-on", en.isIntersecting);
    if (wrap) wrap.classList.toggle("is-footer", en.isIntersecting);
  }), { threshold: 0 }).observe(trigger);
  const tall = () => foot.classList.toggle("is-tall", foot.scrollHeight > innerHeight);
  new ResizeObserver(tall).observe(foot);
  addEventListener("resize", tall);

  // Expander (original Expander) — shared by the footer menu (below 1020px) and work photo captions
  window.fgExpander = (root) => root.querySelectorAll(".fg-exp").forEach((x) => {
    const btn = x.querySelector(".fg-exp__btn"), bodyEl = x.querySelector(".fg-exp__body");
    if (!btn || !bodyEl || x.dataset.ready) return;
    x.dataset.ready = "1";
    const m = () => x.style.setProperty("--fg-maxh", `${bodyEl.scrollHeight}px`);
    new ResizeObserver(m).observe(bodyEl);
    btn.addEventListener("click", () => {
      m();
      const on = !x.classList.contains("is-open");
      x.classList.toggle("is-open", on);
      btn.setAttribute("aria-expanded", String(on));
    });
  });
  window.fgExpander(document);

  // ───────── Cursor ─────────
  const cursor = document.createElement("div");
  cursor.className = "fg-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = `<div class="fg-cursor__arrow"><div class="fg-arrow">${ARROW}</div></div>`;
  body.append(cursor);
  {
    const m = { x: 0, y: 0 }, c = { x: 0, y: 0 };
    let raf = 0;
    const step = () => {
      raf = 0;
      if (Math.hypot(m.x - c.x, m.y - c.y) <= 0.5) return;
      c.x = 0.85 * c.x + 0.15 * m.x;
      c.y = 0.85 * c.y + 0.15 * m.y;
      cursor.style.transform = `translateX(${c.x.toFixed(2)}px) translateY(${c.y.toFixed(2)}px)`;
      raf = requestAnimationFrame(step);
    };
    addEventListener("mousemove", (e) => { m.x = e.clientX; m.y = e.clientY; if (!raf) raf = requestAnimationFrame(step); });
  }

  // Brand model table — links four rings in one row and darkens only the ring at position data-fg-model (our own shape instead of the original picture)
  document.querySelectorAll("[data-fg-model]").forEach((el) => {
    const k = +el.dataset.fgModel || 0;
    const xs = [12, 40, 62, 82], rs = [10, 7, 6, 5];
    el.outerHTML = `<svg class="fg-model" viewBox="0 0 100 24" aria-hidden="true"><line x1="22" y1="12" x2="77" y2="12"/>${xs.map((x, i) =>
      `<circle cx="${x}" cy="12" r="${rs[i]}"${i === k ? ' class="is-hi"' : ""}/>${i === k ? `<circle class="fg-model__dot" cx="${x}" cy="12" r="${rs[i] * 0.45}"/>` : ""}`).join("")}</svg>`;
  });

  // ───────── Panel that flips over time ─────────
  window.fgTimed = (root) => root.querySelectorAll("[data-fg-ts]").forEach((ts) => {
    if (ts.dataset.ready) return;
    ts.dataset.ready = "1";
    const items = [...ts.querySelectorAll(".fg-ts__item")];
    const btns = [...ts.querySelectorAll(".fg-ts__buttons button")];
    const interval = +(ts.dataset.fgTs || 10000);
    ts.style.setProperty("--fg-interval", `${interval}ms`);
    let i = 0, timer = 0;
    const show = (k) => {
      i = (k + items.length) % items.length;
      items.forEach((it, n) => it.classList.toggle("is-on", n === i));
      btns.forEach((b, n) => { if (n === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    };
    const run = () => { clearInterval(timer); if (items.length > 1 && !reduce) timer = setInterval(() => show(i + 1), interval); };
    btns.forEach((b, n) => b.addEventListener("click", (e) => { e.preventDefault(); show(n); run(); }));
    ts.querySelectorAll(".fg-ts__back").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); show(i - 1); run(); }));
    ts.querySelectorAll(".fg-ts__fwd").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); show(i + 1); run(); }));
    show(0);
    run();
  });
  window.fgTimed(document);

  // ───────── Work card band (original react-splide — loop · auto width · margin gap · .4s ease-in-out-quad transition) ─────────
  document.querySelectorAll("[data-fg-carousel]").forEach((el) => {
    if (!window.Splide) return;
    const n = el.querySelectorAll(".splide__slide").length;
    new Splide(el, {
      destroy: n < 2, type: "loop", autoWidth: true, gap: "var(--fg-gap)",
      padding: { left: "var(--fg-m)", right: "var(--fg-m)" }, easing: "var(--fg-ease-io)",
      mediaQuery: "min", pagination: false, breakpoints: null, arrows: true,
    }).mount();
  });

  // ───────── Mail signup — a wrong format shows a black notice, a valid one shows a purple notice, gone after 5 seconds ─────────
  document.querySelectorAll("[data-fg-signup]").forEach((form) => {
    const msg = form.querySelector(".fg-msg"), inner = form.querySelector(".fg-msg__in"), input = form.querySelector("input[type=email]");
    let t = 0;
    const say = (status, text) => {
      clearTimeout(t);
      inner.dataset.status = status;
      inner.textContent = text;
      msg.classList.add("is-on");
      t = setTimeout(() => msg.classList.remove("is-on"), 5000);
    };
    const go = (e) => {
      e.preventDefault();
      if (!input.validity.valid || !input.value) say("invalid", "Please double-check your email address.");
      else say("success", "Thank you. We’ll be in touch soon.");
    };
    form.addEventListener("submit", go);
  });

  // ───────── Scroll-down button — 1.9s power4.inOut to the next section (leaving 150px above) ─────────
  document.querySelectorAll("[data-fg-scrollto]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const id = b.dataset.fgScrollto;
    if (!window.gsap || !window.ScrollToPlugin || reduce) { document.getElementById(id)?.scrollIntoView(); return; }
    gsap.registerPlugin(ScrollToPlugin);
    gsap.to(window, { duration: 1.9, scrollTo: { y: `#${id}`, offset: 150 }, ease: "power4.inOut" });
  }));

  // ───────── Hero video — the whole plate is a play·pause button ─────────
  document.querySelectorAll("[data-fg-playtoggle]").forEach((b) => {
    const v = b.parentElement.querySelector("video");
    if (!v) return;
    const sync = () => b.dataset.cursorType = v.paused ? "play" : "pause";
    b.addEventListener("click", () => { if (v.paused) v.play().catch(() => {}); else v.pause(); sync(); });
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    sync();
  });
})();
