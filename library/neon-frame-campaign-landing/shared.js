// Draws the header bar, menu drawer, fixed apply bar, apply modal, icon shortcuts and footer shared by the four pages in one place — copying per page makes menu links drift apart.
(() => {
  const ARROW = '<svg viewBox="0 0 14 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15V2M2 7l5-5 5 5"/></svg>';
  const logo = (tag = "Your one-line slogan here") => `<span class="logo-mark"><small>${tag}</small><b>logo</b></span>`;

  const NAV = [
    ["service.html", "Service 1"],
    ["service.html#topping", "Menu 2"],
    ["service.html#steps", "Menu 3"],
    ["product.html", "Supported models"],
  ];

  const header = () => `
    <div class="p-header_wrap">
      <div class="p-header_inner">
        <a class="p-header_logo" href="service.html" aria-label="Home">${logo()}</a>
        <nav class="p-header_nav">
          <div class="p-header_links">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div>
          <div class="p-header_btns">
            <div class="p-btn p-header_apply"><a href="#" data-micromodal-trigger="modal-apply">Your application here<br>Button</a></div>
            <div class="p-header_langwrap"><button class="p-header_lang js-lang" type="button" aria-label="Language" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>Language</button><ul class="p-header_langlist">${[["Language 1", "L1"], ["English", "EN"], ["Language 3", "L3"], ["Language 4", "L4"], ["Language 5", "L5"]].map(([t, c], i) => `<li><a href="#" data-code="${c}"${i === 0 ? ' class="is-current"' : ""}>${t}</a></li>`).join("")}</ul></div>
            <button class="p-header_menu js-menu-open" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
          </div>
        </nav>
      </div>
    </div>
    <div class="p-menu js-menu-body">
      <div class="p-menu_inner">
        <div class="p-menu_search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>Your search term here</div>
        <ul class="p-menu_list">
          <li class="p-menu_list_item"><a href="service.html">Home</a></li>
          ${["Menu Group 1", "Menu Group 2", "Menu Group 3"].map((t) => `
          <li class="p-menu_list_item js-menu-acc">
            <button type="button">${t}<span class="c-plus"></span></button>
            <div class="p-menu_listsub"><ul>${["Sub Menu 1", "Sub Menu 2", "Sub Menu 3"].map((s) => `<li><a href="service.html">${s}</a></li>`).join("")}</ul></div>
          </li>`).join("")}
          <li class="p-menu_list_item"><a href="product.html">Supported models</a></li>
          <li class="p-menu_list_item"><a href="index.html">Campaign LP</a></li>
          <li class="p-menu_list_item"><a href="404.html">Frequently asked questions</a></li>
        </ul>
      </div>
    </div>`;

  const fixcv = () => `
    <div class="p-fixcv_inner">
      <div class="p-btn-wrap">
        <div class="p-btn is-yellow"><a href="#" data-micromodal-trigger="modal-apply">”Plan 1”<br class="u-sp">Apply</a></div>
        <div class="p-btn is-green"><a href="#" target="_blank">”Plan 2”<br class="u-sp">Apply</a></div>
      </div>
    </div>`;

  const modal = () => `
    <div class="p-modal" id="modal-apply" aria-hidden="true">
      <div class="p-modal__bg" data-micromodal-close></div>
      <div class="p-modal__inner">
        <button class="p-modal__close" type="button" aria-label="Close" data-micromodal-close></button>
        <div class="p-modal__box">
          <p class="p-modal__hdg">Your plan name here</p>
          <div class="p-btn is-yellow"><a href="#">Your case 1 here</a></div>
          <div class="p-btn is-yellow"><a href="#">Your case 2 here</a></div>
          <div class="p-btn is-yellow"><a href="#">Your case 3 here<br>Third line</a></div>
        </div>
        <button class="p-modal__btn-close" type="button" data-micromodal-close>Close ✕</button>
      </div>
    </div>`;

  // The shortcut icon is one yellow fill plus black lines — redrawn with the same two-color composition as the original picture icon
  const ICONS = [
    ["About the service", '<rect x="18" y="6" width="28" height="52" rx="5" stroke-width="2.4" style="fill:var(--site-surface);stroke:var(--site-ink)"/><rect x="23" y="16" width="18" height="16" rx="3" style="fill:var(--site-yellow)"/><circle cx="32" cy="42" r="5" fill="none" stroke-width="2" style="stroke:var(--site-ink)"/>'],
    ["Usage guide", '<rect x="14" y="10" width="30" height="42" rx="3" stroke-width="2.4" transform="rotate(-8 29 31)" style="fill:var(--site-surface);stroke:var(--site-ink)"/><rect x="22" y="12" width="30" height="42" rx="3" stroke-width="2.4" style="fill:var(--site-surface);stroke:var(--site-ink)"/><path d="M28 24h18M28 32h18M28 40h12" stroke-width="2" style="stroke:var(--site-ink)"/><circle cx="46" cy="46" r="7" style="fill:var(--site-yellow)"/>'],
    ["Calculate Fees", '<rect x="16" y="6" width="32" height="52" rx="4" stroke-width="2.4" style="fill:var(--site-surface);stroke:var(--site-ink)"/><rect x="21" y="12" width="22" height="10" rx="1.5" stroke-width="2" style="fill:var(--site-yellow);stroke:var(--site-ink)"/><g style="fill:var(--site-ink)"><circle cx="25" cy="30" r="2.4"/><circle cx="32" cy="30" r="2.4"/><circle cx="39" cy="30" r="2.4"/><circle cx="25" cy="38" r="2.4"/><circle cx="32" cy="38" r="2.4"/><circle cx="39" cy="38" r="2.4"/><circle cx="25" cy="46" r="2.4"/><circle cx="32" cy="46" r="2.4"/></g><rect x="36.5" y="43.5" width="5" height="7" rx="1.5" stroke-width="1.6" style="fill:var(--site-yellow);stroke:var(--site-ink)"/>'],
    ["Added List", '<path d="M8 14h8l6 28h26l5-20H18" fill="none" stroke-width="2.4" stroke-linejoin="round" style="stroke:var(--site-ink)"/><circle cx="26" cy="50" r="4" fill="none" stroke-width="2.4" style="stroke:var(--site-ink)"/><circle cx="44" cy="50" r="4" fill="none" stroke-width="2.4" style="stroke:var(--site-ink)"/><rect x="34" y="6" width="22" height="16" rx="3" stroke-width="2" style="fill:var(--site-yellow);stroke:var(--site-ink)"/><text x="45" y="18" font-size="9" font-weight="900" text-anchor="middle" style="fill:var(--site-ink)">00</text>'],
    ["Campaign List", '<path d="M10 26h8l22-12v34L18 36h-8z" stroke-width="2.4" stroke-linejoin="round" style="fill:var(--site-yellow);stroke:var(--site-ink)"/><path d="M16 36l4 14h6l-3-14" stroke-width="2.4" stroke-linejoin="round" style="fill:var(--site-surface);stroke:var(--site-ink)"/><path d="M46 22l8-5M48 31h9M46 40l8 5" stroke-width="2.4" stroke-linecap="round" style="stroke:var(--site-ink)"/>'],
    ["Check supported models", '<rect x="14" y="6" width="26" height="46" rx="4" stroke-width="2.4" style="fill:var(--site-surface);stroke:var(--site-ink)"/><circle cx="40" cy="38" r="10" stroke-width="2.4" style="fill:var(--site-yellow);stroke:var(--site-ink)"/><path d="m47 45 8 8" stroke-width="3" stroke-linecap="round" style="stroke:var(--site-ink)"/>'],
  ];
  const iconnav = () => ICONS.map(([t, g]) => `<a href="${t.includes("Model") ? "product.html" : "service.html"}"><svg viewBox="0 0 64 64">${g}</svg>${t}</a>`).join("");

  const footer = () => `
    <div class="p-footer_pagetop"><a href="#top">${ARROW}Page up</a></div>
    <div class="p-footer_inner">
      <div class="p-footer_logo"><a href="service.html">${logo()}</a></div>
      <div class="p-footer_links">${["Important note 1", "App privacy policy", "App terms of use", "Terms", "Your guide link here", "Privacy policy", "Privacy portal", "Social media policy", "Site Policy", "Trademark notice", "Operating environment · Cookie use", "Company info"].map((t) => `<a href="#">${t}</a>`).join("")}</div>
      <p class="p-footer_license">License No. 00000000 · Your company name here</p>
      <p class="p-footer_copy">COPYRIGHT © Your company name here. ALL RIGHTS RESERVED.</p>
    </div>`;

  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { el.innerHTML = html; });
  fill('[data-slot="header"]', header());
  fill('[data-slot="fixcv"]', fixcv());
  fill('[data-slot="icon-nav"]', iconnav());
  fill('[data-slot="footer"]', footer());
  if (document.querySelector('[data-micromodal-trigger]')) document.body.insertAdjacentHTML("beforeend", modal());
  if (document.querySelector(".js-lang")) document.body.insertAdjacentHTML("beforeend", '<div class="p-lang-dim"></div>');

  const body = document.body;

  // Header band that hides on scroll down and returns on scroll up — it starts hiding only after passing 2/3 of the hero
  let lastY = scrollY;
  addEventListener("scroll", () => {
    if (body.classList.contains("is-fixed")) return;
    const y = scrollY;
    if (y < lastY) { body.classList.remove("is-down"); body.classList.add("is-up"); }
    else if (y > lastY) { body.classList.remove("is-up"); body.classList.add("is-down"); }
    lastY = y;
    const h = document.documentElement.clientHeight;
    body.classList.toggle("is-menu-hidden", y > h - h / 3);
  }, { passive: true });

  // On the main site, # links scroll in .6s swing like the original _smoothscroll.js — if the target is within 2/3 of the hero, it scrolls less by the header height. LP uses CSS scroll-behavior
  if (body.classList.contains("site")) document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute("href");
    if (href === "#") return;
    const target = href === "#top" || href === "#pagetop" ? body : document.querySelector(href);
    if (!target) return;
    const winH = document.documentElement.clientHeight;
    const targetY = target.getBoundingClientRect().top + scrollY;
    const to = targetY - (targetY < winH - winH / 3 ? document.querySelector(".p-header")?.offsetHeight || 0 : 0);
    const from = scrollY, t0 = performance.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return scrollTo(0, to);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 600);
      scrollTo(0, from + (to - from) * (0.5 - Math.cos(p * Math.PI) / 2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  // While the drawer is open, body is pinned in place so the page behind does not scroll along
  let keepY = 0;
  document.querySelectorAll(".js-menu-open").forEach((btn) => btn.addEventListener("click", () => {
    const open = !btn.classList.contains("is-active");
    btn.classList.toggle("is-active", open);
    document.querySelector(".js-menu-body")?.classList.toggle("is-active", open);
    if (open) {
      keepY = scrollY;
      body.classList.add("is-fixed");
      Object.assign(body.style, { position: "fixed", top: `-${keepY}px`, width: "100%" });
    } else {
      body.classList.remove("is-fixed");
      body.removeAttribute("style");
      scrollTo(0, keepY);
    }
  }));


  document.addEventListener("click", (e) => {
    const lang = e.target.closest(".js-lang");
    document.querySelectorAll(".js-lang").forEach((b) => {
      const open = b === lang && b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", open);
    });
    body.classList.toggle("is-lang-open", !!lang && lang.getAttribute("aria-expanded") === "true");
  });

  // The application modal is MicroModal as in the original (locks the body on open, closes on Esc or outside click, traps focus inside)
  if (window.MicroModal && document.getElementById("modal-apply")) MicroModal.init({
    onShow: () => body.classList.add("is-fixed", "is-modalopen"),
    onClose: () => body.classList.remove("is-fixed", "is-modalopen"),
  });

  // Main site accordion — original jQuery slideToggle(200) (swing curve = sine.inOut). Links and buttons inside a closed slot cannot be reached with Tab
  document.querySelectorAll(".js-acc, .js-menu-acc").forEach((item) => {
    const btn = item.querySelector(".js-acc-btn, :scope > button");
    const panel = item.querySelector(".js-acc-body, .p-menu_listsub");
    const tabbable = (open) => panel.querySelectorAll("a,input,button,select,textarea").forEach((el) => el.setAttribute("tabindex", open ? "0" : "-1"));
    tabbable(item.classList.contains("is-open"));
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      tabbable(open);
      gsap.to(panel, { height: open ? "auto" : 0, duration: 0.2, ease: "sine.inOut", overwrite: true });
    });
  });
})();
