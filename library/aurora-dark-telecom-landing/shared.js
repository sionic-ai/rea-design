// Fill the header, footer, bottom benefit strip and question tabs in the same shape on every page, and hook up menu expand and collapsible rows.
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const I = {
    house: '<path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5"/>',
    flat: '<path d="M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M3 21h18"/>',
    chev: '<path d="m4 9 8 7 8-7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    out: '<path d="M8 16 16 8M9 8h7v7"/>',
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.2a9.5 9.5 0 0 1 13 0M8.6 15.4a5 5 0 0 1 6.8 0"/><circle cx="12" cy="18.6" r=".9"/>',
    chat: '<rect x="2" y="3" width="20" height="14" rx="3"/><path d="M8 17v4l4-4"/><circle cx="7.5" cy="10" r="1"/><circle cx="12" cy="10" r="1"/><circle cx="16.5" cy="10" r="1"/>',
    win: '<rect x="3" y="7" width="12" height="12" rx="1"/><path d="M8 4h12v12"/>',
    pause: '<path d="M9 6v12M15 6v12"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="m15 5-7 7 7 7"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
  };
  const icon = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ""}</svg>`;
  window.nrIcon = icon;

  const drop = (items) => `<div class="nr-drop" role="menu">${items.map((t) => `<a href="campaign.html" role="menuitem">${t}</a>`).join("")}</div>`;
  const headHTML = `
    <header class="nr-head" data-slot="header">
      <div class="nr-head__sony">BRAND</div>
      <div class="nr-head__bar">
        <a class="nr-logo" href="index.html">BRAND<small>Light</small></a>
        <nav class="nr-gnav" aria-label="Main menu">
          <div class="nr-gnav__item"><button class="nr-gnav__btn" type="button" aria-expanded="false">${icon("house")}<span>Detached house</span><svg class="i chev" viewBox="0 0 24 24">${I.chev}</svg></button>${drop(["Pricing · Specs", "Option", "Steps before use", "Frequently asked questions", "Before You Apply", "After You Apply"])}</div>
          <div class="nr-gnav__item"><button class="nr-gnav__btn" type="button" aria-expanded="false">${icon("flat")}<span>Apartment</span><svg class="i chev" viewBox="0 0 24 24">${I.chev}</svg></button>${drop(["Pricing · Specs", "Option", "Steps before use", "Frequently asked questions", "Before You Apply", "After You Apply"])}</div>
        </nav>
        <div class="nr-head__right"><a class="nr-btn-sm" href="about.html">My page</a><a class="nr-btn-sm is-holo" href="campaign.html">Apply</a></div>
      </div>
    </header>`;
  const footHTML = `
    <footer class="nr-foot" data-slot="footer"><div class="nr-foot__in">
      <div class="nr-foot__cols">
        <div><h4>More economical</h4><ul><li><a href="campaign.html">Friend referral coupon</a></li><li><a href="campaign.html">Mobile bundle discount</a></li></ul><h4 style="margin-top:20px">Peace of mind through use</h4><ul><li><a href="campaign.html">Rental Wi-Fi</a></li></ul></div>
        <div><h4>Peace of mind after use</h4><ul><li><a href="about.html">My page</a></li><li><a href="about.html">Member app</a></li><li><a href="about.html">Member Support</a></li><li><a href="about.html">Member Perks</a></li><li><a href="about.html">When moving</a></li></ul></div>
        <div><h4>Others</h4><ul><li><a href="about.html">Home AI Service</a></li><li><a href="about.html">Solicitation Damage Notice</a></li><li><a href="about.html">Manual list</a></li><li><a href="about.html">Authorized dealer notice</a></li><li><a href="about.html">Sales partner · universal service</a></li></ul></div>
      </div>
      <div class="nr-foot__svc">${[["Individual Customer", "Optical 20G"], ["Corporate internet service", "Biz"], ["Sole proprietors · small businesses", "Fiber 2G / 10G"], ["Bundled service for apartment buildings", "Brand Connect"], ["Corporate local 5G platform", "5G"], ["Wholesale line consultation", "Circuit wholesale · rebranding"]].map(([a, b]) => `<a class="nr-glow" href="about.html">${a}<small>${b}</small></a>`).join("")}</div>
      <div class="nr-foot__bnr"><div class="wf-img" data-label="Brand banner · black-and-white person · landscape"></div><div class="wf-img" data-label="Affiliate service logo banner · white background"></div><div class="wf-img" data-label="Game character banner · blue"></div><div class="wf-img" data-label="Company logo banner · white background"></div></div>
      <div class="nr-foot__links">${["IPv6 Support", "Personal data handling", "Copyright · Trademark", "Website Conditions of Use", "Web accessibility policy"].map((t) => `<a class="nr-link" href="about.html"><span class="dot">${icon("out")}</span>${t}</a>`).join("")}</div>
      <p class="nr-foot__copy">Telecommunications carrier registration no. 000 · agency report no. C0000000<br>© Your Network Inc.</p>
    </div></footer>
    <a class="nr-cta" href="campaign.html" data-modal="cashback" data-slot="sticky-cta"><span class="nr-cta__date">Until 11/1</span><span>In addition to this page’s special perks</span><b>5,000 won cashback</b><span class="nr-cta__go">${icon("arrow")}</span></a>
    <a class="nr-ask" href="campaign.html" data-slot="ask-tab">${icon("chat")}<span>Have a question?</span></a>`;

  const head = document.querySelector("[data-slot='header']");
  if (head && !head.children.length) head.outerHTML = headHTML;
  // On the light panel the benefits strip attaches at the very top of the header, not at the bottom
  if (body.classList.contains("nr--light")) {
    const h = document.querySelector(".nr-head");
    h?.insertAdjacentHTML("afterbegin", `<a class="nr-topbar" href="campaign.html" data-modal="cashback" data-slot="campaign-bar"><span class="tag">In addition to this page’s special perks</span><b>5,000</b>Cashback in won<i>Until 11/1</i>${icon("win")}</a>`);
    h?.querySelectorAll(".nr-gnav__btn span").forEach((s, i) => s.insertAdjacentHTML("beforeend", " <small>Pricing · Plans</small>"));
    const ap = h?.querySelector(".nr-btn-sm.is-holo");
    if (ap) ap.insertAdjacentHTML("beforeend", icon("arrow"));
  }
  const foot = document.querySelector("[data-slot='footer']");
  if (foot && !foot.children.length) foot.outerHTML = footHTML;

  // Menu expand — press to open, outside click or Esc closes
  const items = [...document.querySelectorAll(".nr-gnav__item")];
  const shut = (except) => items.forEach((it) => { if (it !== except) { it.classList.remove("is-open"); it.querySelector("button").setAttribute("aria-expanded", "false"); } });
  items.forEach((it) => it.querySelector("button").addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !it.classList.contains("is-open");
    shut(it);
    it.classList.toggle("is-open", open);
    e.currentTarget.setAttribute("aria-expanded", String(open));
  }));
  document.addEventListener("click", (e) => { if (!e.target.closest(".nr-gnav__item")) shut(); });
  addEventListener("keydown", (e) => e.key === "Escape" && shut());

  // Collapsible row
  document.addEventListener("click", (e) => {
    const h = e.target.closest(".nr-acc__head");
    if (!h) return;
    const it = h.closest(".nr-acc__item");
    const open = !it.classList.contains("is-open");
    it.classList.toggle("is-open", open);
    h.setAttribute("aria-expanded", String(open));
  });

  // Notice modal — [data-modal="Name"] opens #modal-name when pressed. Closes via close button, outside click, or Esc
  const modalHTML = (id, badge, title, rows, p) => `<dialog class="nr-modal" id="modal-${id}" aria-label="${title}"><div class="nr-modal__body"><button class="nr-modal__close" type="button" aria-label="Close">${icon("x")}</button><div class="nr-modal__hero">${badge ? `<span class="nr-modal__badge">${badge}</span>` : ""}<h2>${title}</h2></div><h3>Content</h3><div class="nr-modal__table">${rows.map(([a, b]) => `<span>${a}</span><span>${b}</span>`).join("")}</div><p class="nr-modal__p">${p}</p></div></dialog>`;
  if (!document.querySelector(".nr-modal") && document.querySelector("[data-modal]")) {
    body.insertAdjacentHTML("beforeend",
      modalHTML("cashback", "Limited time until 11/1", "5,000 won cashback campaign now running", [["Pricing plans", "Cashback"], ["10G (H) · 10G (M) · Fiber (H) · Fiber (M)", "5,000 won"]], "Your notice goes here in two lines that campaigns may end or change without prior notice, plus the conditions that apply.") +
      modalHTML("koji", "", "On basic construction costs being effectively free", [["Base construction cost", "000,000 won (36 installments)"], ["Activation month ~ month 36", "Monthly discount equal to the installment amount"]], "Your text goes here stating the amount left when the discount conditions are met and when you cancel midway."));
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-modal]");
    if (t) { const m = document.getElementById("modal-" + t.dataset.modal); if (m?.showModal) { e.preventDefault(); m.showModal(); } return; }
    if (e.target.closest(".nr-modal__close")) e.target.closest("dialog").close();
    else if (e.target.matches?.(".nr-modal")) e.target.close();
  });

  // The benefit band moves down out of the way when it reaches the footer
  const cta = document.querySelector(".nr-cta"), ft = document.querySelector(".nr-foot");
  if (cta && ft && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => cta.classList.toggle("is-away", en.isIntersecting)).observe(ft);
  }
  if (reduce) document.documentElement.classList.add("is-reduced");
})();
