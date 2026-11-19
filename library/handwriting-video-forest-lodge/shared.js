// Shared across the whole site — builds the header bar, menu drawer, footer and chat slot with the same markup on every page, and hooks up modal open/close, header color change and bleed mask
(() => {
  const page = document.body.dataset.page || "home";
  const home = page === "home" ? "" : "index.html";

  // Wordmark — placeholder for the original logo video (an alpha video where handwriting is written in 4 seconds). Two strokes (one for the word + a tail stretching sideways) and a small place-name line
  const MARK = (draw) => `
    <svg class="kt-mark" viewBox="0 0 500 150" aria-hidden="true" ${draw ? 'data-fx="sign-draw" data-fx-sign-draw="dur: 4"' : ""}>
      <path ${draw ? 'data-fx-part="stroke" data-at="0 2.6" pathLength="1"' : ""} d="M40 108C70 100 108 70 118 42C124 22 108 14 98 30C88 48 82 84 80 104C79 116 96 116 112 106C124 98 132 86 138 74C134 88 130 102 140 107C152 112 166 92 172 74C168 92 166 106 176 107C186 108 194 92 200 80C204 74 206 74 208 76C206 88 204 100 202 108C210 90 222 74 234 74C246 74 242 96 240 102C238 112 250 112 262 104C270 98 276 88 280 80C272 70 252 72 248 90C244 106 264 112 276 96C281 89 284 80 286 74C282 90 280 104 288 108C300 112 316 100 326 90"/>
      <path ${draw ? 'data-fx-part="stroke" data-at="2.7 3.15" pathLength="1"' : ""} d="M196 62C270 54 380 50 470 58C480 59 488 62 492 66"/>
      <text class="kt-mark__sub" x="470" y="140" text-anchor="end">Place</text>
    </svg>`;
  document.querySelectorAll("[data-mark]").forEach((el) => { el.innerHTML = MARK(el.dataset.mark === "draw"); });

  const NAV = [
    ["Concept", `${home}#concept`], ["Rooms", `${home}#rooms`], ["Spa & Pool", `${home}#pool`], ["Pet Stay", `${home}#pet`],
    ["Dining", `${home}#dining`], ["Local Guide", `${home}#guide`], ["News", "news.html"], ["Access", `${home}#access`], ["FAQ", "#"],
  ];
  const LEGAL = ["Privacy policy", "Stay Terms", "Terms of use", "Facility usage rules", "Pet dog policy", "Notation Notes"];
  const navItems = (cls = "") => NAV.map(([t, h]) => `<li><a class="kt-line ${cls}" href="${h}"><span>${t}</span></a></li>`).join("");
  const INSTA = `<a class="kt-insta" href="#" aria-label="Social Media"><svg viewBox="0 0 18 18"><rect x="1" y="1" width="16" height="16" rx="4.5"/><circle cx="9" cy="9" r="3.8"/><circle cx="13.6" cy="4.4" r=".5"/></svg></a>`;
  const LANG = `<ul class="kt-lang"><li class="is-on"><a href="#">KO</a></li><li><a href="#">EN</a></li></ul>`;
  const X = `<svg viewBox="0 0 20 20"><path d="M3 3 17 17M17 3 3 17"/></svg>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "kt-head";
    head.innerHTML = `
      <div class="kt-head__pc">
        <a class="kt-head__logo" href="index.html" aria-label="Lodging name in English">${MARK(false)}</a>
        <div class="kt-head__menu">
          <nav class="kt-head__nav"><ul class="kt-head__list">${navItems()}</ul>${INSTA}${LANG}</nav>
          <a class="kt-btn" href="#">Book now</a>
        </div>
      </div>
      <div class="kt-head__sp">
        ${INSTA}
        <a class="kt-btn" href="#">Book now</a>
        <button class="kt-burger" type="button" data-open="kt-drawer" aria-label="Open Menu"><svg viewBox="0 0 35 35"><path d="M6 11c7-1.4 15 1.2 23-.4M6 17.6c7-1.2 15 1.3 23-.3M6 24.2c7-1.3 15 1.2 23-.4"/></svg></button>
        <dialog class="kt-modal is-drawer kt-drawer" id="kt-drawer">
          <div class="kt-modal__close-wrap"><button class="kt-modal__close" type="button" data-close aria-label="Close">${X}</button></div>
          <nav>
            <ul class="kt-drawer__list">${navItems("is-ink")}</ul>
            <ul class="kt-drawer__sub">${LEGAL.map((t) => `<li><a href="page.html">${t}</a></li>`).join("")}</ul>
          </nav>
          <a class="kt-btn is-ink" href="#">Book now</a>
          ${LANG}
        </dialog>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "kt-foot";
    foot.innerHTML = `
      <div class="kt-container">
        <div class="kt-foot__info">
          <a class="kt-foot__logo" href="index.html" aria-label="Lodging name in English">${MARK(false)}</a>
          <address class="kt-foot__addr">
            <div><p>Postal code 000-0000</p><p>Your lodging address here in one line 00-00</p></div>
            <div style="margin-top:16px">
              <dl class="kt-foot__dl"><dt>Tel</dt><dd>0000-00-0000</dd></dl>
              <dl class="kt-foot__dl"><dt>Mail</dt><dd>info@example.com</dd></dl>
            </div>
            <div style="margin-top:24px"><a class="kt-pin kt-line" href="#"><svg viewBox="0 0 18 24"><path d="M9 23C4 16 1.5 12 1.5 8.5a7.5 7.5 0 0 1 15 0C16.5 12 14 16 9 23Z"/><circle cx="9" cy="8.5" r="2.6"/></svg><span>Google Map</span></a></div>
            <div style="margin-top:32px"><span class="kt-foot__badge">Opened 0/0/0000</span></div>
          </address>
          <div class="kt-foot__menus">
            <div class="kt-foot__links"><a class="kt-btn is-ink" href="#">Reservation</a></div>
            <ul class="kt-foot__nav">${navItems()}</ul>
          </div>
        </div>
        <div class="kt-foot__bottom">
          <ul class="kt-foot__legal">${LEGAL.map((t) => `<li><a class="kt-line" href="page.html"><span>${t}</span></a></li>`).join("")}</ul>
          <small class="kt-foot__copy">copyright© Studio Name All Right Reserved</small>
        </div>
      </div>`;
  }

  const chat = document.createElement("div");
  chat.className = "kt-chat";
  chat.dataset.slot = "chat-widget";
  chat.innerHTML = `<span class="kt-chat__bubble">How can we help?<i></i></span><span class="kt-chat__btn" aria-label="Chat widget slot">${MARK(false)}</span>`;
  document.body.append(chat);

  // ── Modal: original showModal → is-opening on the next frame, on close remove the class and close on transitionend ──
  const open = (id) => {
    const d = document.getElementById(id);
    if (!d || d.open) return;
    d.showModal();
    requestAnimationFrame(() => d.classList.add("is-opening"));
    requestAnimationFrame(() => requestAnimationFrame(() => (d.scrollTop = 0)));
    d.dispatchEvent(new CustomEvent("kt:open"));
  };
  const close = (d) => {
    if (!d || !d.open) return;
    d.classList.remove("is-opening");
    d.addEventListener("transitionend", () => d.close(), { once: true });
    d.dispatchEvent(new CustomEvent("kt:close"));
  };
  window.ktModal = { open, close };
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); open(o.dataset.open); return; }
    const c = e.target.closest("[data-close]");
    if (c) { close(c.closest("dialog")); return; }
    // Pressing the backdrop (outside) closes it — judged by whether the click is outside the dialog box, like the original
    if (e.target.matches("dialog.kt-modal")) {
      const r = e.target.getBoundingClientRect();
      if (!(r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right)) close(e.target);
    }
  });
  document.addEventListener("cancel", (e) => { if (e.target.matches("dialog.kt-modal")) e.target.classList.remove("is-opening"); }, true);
  document.addEventListener("click", (e) => { if (e.target.closest(".kt-drawer a")) close(document.getElementById("kt-drawer")); });

  // ── Header color change, bleed mask ──
  gsap.registerPlugin(ScrollTrigger);
  const hd = document.querySelector(".kt-head");
  const hasStage = !!document.querySelector("[data-bg]");
  if (hd) {
    hd.classList.toggle("is-ink", !hasStage);
    document.querySelectorAll("[data-bg]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el, start: "top top", end: "bottom top", invalidateOnRefresh: true,
        onEnter: () => hd.classList.remove("is-ink"), onEnterBack: () => hd.classList.remove("is-ink"),
        onLeave: () => hd.classList.add("is-ink"), onLeaveBack: () => hd.classList.add("is-ink"),
      });
    });
    if (hasStage) addEventListener("scroll", () => { if (scrollY === 0) hd.classList.remove("is-ink"); }, { passive: true });
  }
  document.querySelectorAll("[data-fade]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: "top 100%", end: "180% 0%", invalidateOnRefresh: true,
      onEnter: () => el.classList.add("is-in"), onEnterBack: () => el.classList.add("is-in"),
    });
  });
  ScrollTrigger.addEventListener("refresh", () => ScrollTrigger.sort());
  addEventListener("load", () => ScrollTrigger.refresh());
})();
