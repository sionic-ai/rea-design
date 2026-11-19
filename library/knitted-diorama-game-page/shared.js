(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // Sound-effect slots of the original (SoundJS sprite) — original sound files aren’t used, a short sine ”pop” plays at the same moments. Only for people who turned sound on
  const KEY = "kf-yarn-sound";
  let ctx = null;
  window.ySound = {
    get on() { return localStorage.getItem(KEY) === "true"; },
    set(v) { localStorage.setItem(KEY, v ? "true" : "false"); document.documentElement.dataset.sound = v ? "on" : "off"; },
    warm() { if (!ctx && this.on) { try { ctx = new AudioContext(); } catch (e) { /* Environment without sound */ } } },
    blip(freq = 660, dur = 0.12) {
      if (!this.on) return;
      try {
        ctx = ctx || new AudioContext();
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(freq, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(freq * 1.6, ctx.currentTime + dur);
        g.gain.setValueAtTime(0.08, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
      } catch (e) { /* Stay silent if the environment can’t play sound */ }
    },
  };

  // The company header and footer are also injected by a shared script (gheader.js) in the original — pages only leave empty slots and they are filled in here
  const menu = ["Unit · Goods", "Game software", "Topic", "Character", "Support"];
  const mega = (n) => `<div class="n-mega"><div class="n-mega__in">${Array.from({ length: 8 }, (_, i) => `<a href="product.html"><span class="wf-img" data-label="Icon"></span>Menu ${n}-${i + 1}</a>`).join("")}</div></div>`;
  const hdr = document.querySelector("[data-n-hdr]");
  if (hdr) {
    hdr.innerHTML = `<div class="n-hdr__in">
      <a class="n-hdr__logo" href="portal.html" aria-label="Company home page"><span class="n-logo" data-label="Company English logo">Brand</span></a>
      <nav class="n-hdr__nav" aria-label="Main menu">${menu.map((m, i) => `<div class="n-hdr__item"><a href="product.html">${m}</a>${mega(i + 1)}</div>`).join("")}</nav>
      <div class="n-hdr__tools">
        <a href="search.html"><svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="9.5" cy="9.5" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M14.5 14.5l5 5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>Find</a>
        <a href="product.html"><svg viewBox="0 0 22 22" aria-hidden="true"><path d="M4 8h14l-1 12H5z M8 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2"/></svg>Store</a>
        <a href="portal.html"><svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="7" r="4" fill="currentColor"/><path d="M3 20c0-4.5 3.6-7 8-7s8 2.5 8 7z" fill="currentColor"/></svg>Log in</a>
        <button class="n-burger" type="button" aria-expanded="false" aria-label="Menu"><i></i>Menu</button>
      </div>
    </div>
    <nav class="n-drawer" aria-label="Phone menu">${menu.map((m) => `<a href="product.html">${m}</a>`).join("")}</nav>`;
  }
  const foot = document.querySelector("[data-n-foot]");
  if (foot) {
    const col = (h, n) => `<h4>${h}</h4><ul>${Array.from({ length: n }, (_, i) => `<li><a href="product.html">Your link $ here{i + 1}</a></li>`).join("")}</ul>`;
    foot.innerHTML = `<div class="n-foot__bar"><div class="n-foot__bar-in"><span class="n-logo" data-label="Company English logo">Brand</span><span class="n-foot__crumb">${foot.dataset.crumb || "Your current page here"}</span><a class="n-foot__top" href="#" data-to-top aria-label="Back to top">︿</a></div></div>
    <div class="n-foot__in">
      <div class="n-foot__apps">${["Calendar app", "Online store", "Paid Online Service", "To all guardians"].map((s, i) => `<a href="portal.html"><i aria-hidden="true"></i><span><small>${s}</small><b>Service Name ${i + 1}</b></span></a>`).join("")}</div>
      <div class="n-foot__cols">
        <div>${col("Unit · Goods", 7)}</div>
        <div>${col("Game software", 9)}</div>
        <div>${col("Topic", 3)}${col("Character", 8)}</div>
        <div>${col("Support", 9)}</div>
        <div><p class="n-foot__net"><i aria-hidden="true"></i>Network operating status</p><ul class="n-foot__more"><li><a href="portal.html">Company info</a></li><li><a href="portal.html">Cards, card games, etc.</a></li><li><a href="portal.html">Points program</a></li></ul></div>
      </div>
    </div>
    <div class="n-foot__legal"><div class="n-foot__legal-in"><span>© Company</span><a href="portal.html">For health and safety</a><a href="portal.html">Website policy</a><a href="portal.html">Inquiry</a><a class="n-foot__map" href="portal.html">Sitemap</a></div></div>`;
  }

  // Company header: on wide screens a drawer opens on hover (CSS), on touch and keyboard it opens on press
  document.querySelectorAll(".n-hdr__item").forEach((item) => {
    const link = item.querySelector(":scope > a");
    if (!item.querySelector(".n-mega")) return;
    link.addEventListener("click", (e) => {
      if (matchMedia("(hover: hover)").matches) return;
      e.preventDefault();
      const open = !item.classList.contains("is-open");
      document.querySelectorAll(".n-hdr__item.is-open").forEach((o) => o.classList.remove("is-open"));
      item.classList.toggle("is-open", open);
    });
  });
  const burger = document.querySelector(".n-burger");
  const drawer = document.querySelector(".n-drawer");
  burger?.addEventListener("click", () => {
    const open = !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  // The old header’s ”Search” — opens while a pointer is over the button or panel (open .2s · close .6s lingering delay is a CSS delay)
  const findBtn = document.querySelector(".n-ghdr__find"), findPanel = document.querySelector(".n-find");
  if (findBtn && findPanel) {
    const set = (open) => { findPanel.classList.toggle("is-open", open); if (open) findPanel.classList.add("was-open"); findBtn.setAttribute("aria-expanded", String(open)); };
    [findBtn, findPanel].forEach((el) => {
      el.addEventListener("pointerenter", () => set(true));
      el.addEventListener("pointerleave", () => set(false));
    });
    findBtn.addEventListener("click", () => set(true));
    findPanel.addEventListener("focusin", () => set(true));
  }

  // Company footer: on phone, tap the section name to fold and unfold
  document.querySelectorAll(".n-foot__cols h4").forEach((h) => {
    h.addEventListener("click", () => { if (matchMedia("(max-width: 767px)").matches) h.classList.toggle("is-open"); });
  });

  // Footer back-to-top button — the original scrolls up smoothly over about .5s
  document.querySelectorAll("[data-to-top]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
})();
