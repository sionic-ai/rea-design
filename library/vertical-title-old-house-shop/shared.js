// Menu · phone menu · directions · footer are the same on every page, so build them once here and plug them in — fix one place and all five pages change together
(() => {
  const ICON = {
    bag: '<i class="ss-ico ss-ico--bag" aria-hidden="true"></i>',
    arrow: '<i class="ss-ico ss-ico--arrow" aria-hidden="true"></i>',
    cam: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>',
    note: '<svg width="46" height="14" viewBox="0 0 46 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1" y="1" width="44" height="12" rx="6"/><path d="M10 7h26"/></svg>',
  };
  const store = (cls = "") => `<span class="ss-store ${cls}">${ICON.bag}<span class="ss-store__label">Online store${ICON.arrow}</span></span>`;
  // Logo: two-letter name on top, one brushed signature stroke below (100×84, same as the original spot)
  const LOGO = '<svg viewBox="0 0 100 84" aria-label="Brand logo here"><text class="ss-logo__word" x="2" y="44">Mutual</text><path d="M6 80c10-2 14-14 9-15-6-1-9 14-1 15 9 1 15-6 22-6 6 0 4 5 10 5s7-5 13-5 6 5 12 5 10-4 22-6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  const SIGN = '<svg viewBox="0 10 346 137" aria-label="Signature logo slot"><path d="M46 140c-30 4-44-8-20-12 40-6 72-40 86-86 8-26-6-40-14-16-10 30-8 74-6 100" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M120 108c8-14 30-14 30 0s-24 14-30 0Zm48 6c14-10 26-12 22-2-4 8-18 6-6-2m30 0c8-14 30-14 30 0s-24 14-30 0Zm36 0c30-4 70-6 112-8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  const SHOP = ["Store name 1", "Store name 2", "Store name 3", "Store name 4"];
  const SPACE = ["Space name 1", "Space name 2"];
  const sub = (items) => `<ul class="ss-sub">${items.map((t, i) => `<li><a href="product.html">${t}</a></li>`).join("")}</ul>`;
  const menu = (live) => `<ul class="ss-menu">
      <li><a class="ss-navlink" href="about.html">About</a></li>
      <li data-sub><span>Shop</span>${live ? sub(SHOP) : ""}</li>
      <li data-sub><span>Space</span>${live ? sub(SPACE) : ""}</li>
      <li><a class="ss-navlink" href="news.html">Event</a></li>
      <li><a class="ss-navlink" href="news.html">Diary</a></li>
      <li class="ss-menu__divider" aria-hidden="true"></li>
      <li><a class="ss-navlink" href="https://example.com/store" target="_blank" rel="noopener">${store()}</a></li>
    </ul>`;

  document.querySelectorAll("[data-store-label]").forEach((el) => { el.innerHTML = store(); });

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    const split = document.body.dataset.header === "split";
    head.className = `ss-head${split ? " is-split" : ""}`;
    head.innerHTML = `<a href="index.html" aria-label="Home"><span class="ss-logo">${LOGO}</span></a>
      <button class="ss-burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
      <nav aria-label="Main menu">${menu(true)}</nav>`;
    if (split) {
      for (const tone of ["is-dark", "is-light"]) {
        const half = document.createElement("div");
        half.className = `ss-head__half ${tone}`;
        half.setAttribute("aria-hidden", "true");
        half.innerHTML = menu(false);
        head.after(half);
      }
    }
    const nav = document.createElement("div");
    nav.className = "ss-nav";
    nav.setAttribute("aria-hidden", "true");
    const group = (title, items) => `<div class="ss-nav__group"><p class="ss-nav__title">${title}</p><ul>${items}</ul></div>`;
    nav.innerHTML = `<div class="ss-nav__in">
      ${group("Shop &amp; Space", [...SHOP, ...SPACE].map((t) => `<li><a href="product.html">${t}</a></li>`).join(""))}
      ${group("Information", `<li><a href="about.html">About</a></li><li><a href="news.html">Event</a></li><li><a href="news.html">Diary</a></li><li><a href="news.html">Notice</a></li><li><a href="#contact">Inquiry</a></li><li><a href="#" target="_blank" rel="noopener">${store()}</a></li>`)}
    </div>`;
    head.append(nav);

    const burger = head.querySelector(".ss-burger");
    const setOpen = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      nav.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("is-locked", open);
      nav.classList.toggle("is-open", open);
      nav.classList.toggle("is-closing", !open);
    };
    burger.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("animationend", (e) => { if (e.target === nav && nav.classList.contains("is-closing")) nav.classList.remove("is-closing"); });
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });

  }

  const access = document.querySelector('[data-slot="access"]');
  if (access) {
    access.innerHTML = `<div class="ss-access__head">
        <div class="ss-tc is-left"><h2 class="ss-vt"><span class="ss-vt__en" data-label="Section English name">Access</span><span class="ss-vt__ja">Getting here</span></h2></div>
        <dl class="ss-access__info">
          <div class="ss-access__row"><dt>Address</dt><dd>Your one-line address here 000-00<br><a class="ss-access__btn" href="https://example.com/map" target="_blank" rel="noopener">View on map</a></dd></div>
          <div class="ss-access__row"><dt>Transport</dt><dd>Your directions from the nearest station here<br>One-line parking note<br>Nearby parking info, one line</dd></div>
          <div class="ss-access__row"><dt>Business hours</dt><dd>00:00–00:00 (weekends only 00:00–00:00)<br>Days off: one line here</dd></div>
          <div class="ss-access__row"><dt>Equipment</dt><dd>Your facilities notice here, one line</dd></div>
        </dl>
      </div>
      <div class="ss-access__photo" data-fx="fade-up" data-fx-fade-up="y: 20; duration: .35; ease: 0.35,0.17,0.3,0.86; start: 15% bottom-=40">
        <div class="wf-img is-dark" data-label="Seaside waves · blue sunset light · full-width landscape strip"></div>
      </div>
      <div class="ss-contact" id="contact">
        <p class="ss-contact__text">Your one line goes here saying inquiries about purchase, booking and rental are accepted.</p>
        <a class="ss-access__btn" href="index.html#contact">Contact Us</a>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ss-foot";
    foot.innerHTML = `<div class="ss-foot__row">
        <div class="ss-foot__left">
          <p class="ss-foot__addr">000-0000<br>Your address line here 000<br><a href="#">View on map</a></p>
          <p class="ss-foot__time">Business hours 00:00-00:00<br>One-line closed-day notice, details on social media<br>One line of parking info (nearby car park)<br>One-line facility guide</p>
        </div>
        <div class="ss-foot__menu">
          <div class="ss-foot__col"><p class="ss-foot__title ss-en">Shop &amp; Space</p><ul>${[...SHOP, ...SPACE].map((t) => `<li><a href="product.html">${t}</a></li>`).join("")}</ul></div>
          <div class="ss-foot__col"><p class="ss-foot__title ss-en">Information</p><ul><li><a href="about.html">About</a></li><li><a href="news.html">Event</a></li><li><a href="news.html">Diary</a></li><li><a href="news.html">Notice</a></li><li><a href="#" target="_blank" rel="noopener">${store()}</a></li></ul></div>
          <div class="ss-foot__col is-sns"><p class="ss-foot__title ss-en">SNS</p><div class="ss-foot__sns"><a href="#" aria-label="SNS 1">${ICON.cam}</a><a href="#" aria-label="SNS 2">${ICON.note}</a></div></div>
        </div>
      </div>
      <div class="ss-foot__bottom"><p class="ss-foot__copy ss-en">© brand-name</p><div class="ss-foot__logo">${SIGN}</div></div>`;
  }
})();
