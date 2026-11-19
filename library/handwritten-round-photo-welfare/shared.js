// Header · menu · hiring strip · Footer are identical on every page so they are mounted in one place. The original adds and removes classes with jQuery and CSS transition handles the motion — keep the same class order
(() => {
  const page = document.body.dataset.page;
  const ARROW = '<svg class="kg-arrow" data-fx-part="arrow" viewBox="0 0 36 14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M0 7h33M27 1l6 6-6 6"/></svg>';
  const PIN = '<svg class="kg-ui__svg" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 27s-8-8.5-8-14a8 8 0 0 1 16 0c0 5.5-8 14-8 14Z"/><circle cx="15" cy="13" r="3"/></svg>';
  const ROLL = '<svg class="kg-ui__svg" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><ellipse cx="11" cy="9" rx="6" ry="4"/><path d="M5 9v12c0 2.2 2.7 4 6 4h13V9M17 9h7"/><ellipse cx="11" cy="9" rx="1.6" ry="1"/></svg>';
  window.kgArrow = ARROW;

  const logo = '<a class="kg-logo" href="index.html" data-label="Organization logo · vertical writing · small corporate name + large organization name"><span class="kg-logo__in"><span class="kg-logo__sub">Social Welfare Corporation</span><span class="kg-logo__main">Institution name</span></span></a>';
  const ui = `<div class="kg-ui">
      <button class="kg-toggle" type="button" data-open="Menu" data-close="Close" aria-label="Menu"><i></i><i></i><i></i></button>
      <a href="about.html#access" class="kg-ui__icon is-access">${PIN}<span class="kg-ui__line">Getting here</span></a>
      <a href="product.html" class="kg-ui__icon is-tp">${ROLL}<span class="kg-ui__line">Product<br>Order<br>Guide</span></a>
    </div>`;
  const nav = [
    ["index.html", "First Page"], ["about.html", "About the organization"], ["about.html#life", "Activity About", "is-local"], ["about.html#work", "About the Facility", "is-local is-last"],
    ["product.html", "Product intro"], ["product.html#tp", "Featured Product Order", "is-wide is-local"], ["detail.html", "Product Story", "is-wide is-local is-last"],
    ["about.html", "Supporters", "is-half"], ["recruit.html", "Hiring guide", "is-half"], ["news.html", "News", "is-half"], ["recruit.html#apply", "Contact Us", "is-half"],
  ];
  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.classList.add("kg-header");
    header.innerHTML = `<div class="kg-head">${logo}${ui}</div>
      <div class="kg-menu" id="kg-menu">
        <div class="kg-menu__ph"><span class="kg-ph wf-img" data-label="Person sitting on grass playing guitar · clear daytime · tall portrait photo"></span></div>
        <nav class="kg-navi"><ul class="kg-daruma">${nav.map(([h, t, c]) => `<li class="${c || ""}"><a href="${h}">${t}</a></li>`).join("")}</ul></nav>
      </div>`;
    // The home page has one extra header (head_home) attached below — only this shows in the hero, and it swaps to the upper header once you enter the body
    if (page === "home") header.insertAdjacentHTML("beforeend", `<div class="kg-head kg-head--home">${logo}${ui}</div>`);
  }

  const job = document.querySelector('[data-slot="job-banner"]');
  if (job) {
    job.classList.add("kg-job");
    job.innerHTML = `<div class="kg-job__ph"><span class="kg-ph wf-img" data-label="Staff and resident facing each other and smiling indoors · warm afternoon light · full-width landscape photo"></span></div>
      <h2 class="kg-vt">Hiring guide</h2>
      <div class="kg-job__in">
        <div class="kg-job__text w-1-2w"><h3 class="kg-job__st kg-daruma">Your hiring title here<br>Split into three lines<br>Adding it</h3>
          <p>Body copy introducing how people work goes here. Write about four lines on how many people live and work together, how the day flows, and what they do on days off. Keep it close to the original length so the text block above the photo has the same weight.</p></div>
        <a href="recruit.html" class="kg-btn" data-fx="overshoot-pop-hover"><span class="kg-arrow-wrap">To careers info${ARROW}</span></a>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("kg-footer");
    foot.innerHTML = `<div class="kg-footer__in">
        <div class="kg-footer__info">
          <h2 class="kg-footer__title"><span class="is-sh">Social Welfare Corporation</span><span class="is-main">Institution name</span><span class="is-sub">(Headquarters Name)</span></h2>
          <p>Fax: 000-000-0000<br>Address: One line for the organization address here</p>
          <span class="kg-tel">000-000-0000</span>
        </div>
        <div class="kg-sitemap">
          <ul><li><a href="about.html">About the organization</a></li><li class="is-local"><a href="about.html#life">Activity About</a></li><li class="is-local"><a href="about.html#work">About the Facility</a></li></ul>
          <ul><li><a href="product.html">Product intro</a></li><li class="is-local"><a href="product.html#tp">Featured Product Order</a></li><li class="is-local"><a href="detail.html">Product Story</a></li><li><a href="about.html">Supporters</a></li><li><a href="recruit.html">Hiring guide</a></li><li><a href="news.html">News</a></li><li><a href="recruit.html#apply">Contact Us</a></li></ul>
        </div>
      </div>
      <p class="kg-footer__bottom"><a href="about.html">Corporate overview</a>｜<a href="about.html">Transaction Notices</a><br>© Organization Name</p>
      <a class="kg-top" href="#top" aria-label="Back to top"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 11l5-5 5 5"/></svg></a>`;
  }

  // Menu — the original flips active on the toggle, normal on the header and menuopen on the body together
  const toggles = () => document.querySelectorAll(".kg-toggle");
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".kg-toggle");
    if (!t) return;
    const open = !header.classList.contains("is-open");
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("is-menu", open);
    toggles().forEach((b) => { b.classList.toggle("is-active", open); b.setAttribute("aria-expanded", String(open)); });
  });

  // Inner links use jQuery animate 750ms swing (= sine.inOut) going down. Only ”Back to top” on the first page jumps up immediately, like the original
  gsap.registerPlugin(ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const target = id && id !== "top" ? document.getElementById(id) : null;
    const y = target ? target.getBoundingClientRect().top + scrollY : 0;
    const instant = reduce || (page === "home" && a.classList.contains("kg-top"));
    gsap.to(window, { scrollTo: y, duration: instant ? 0.001 : 0.75, ease: "sine.inOut", overwrite: true });
  });

  // The faint overlay on the sub-page header photo lifts on load (body.load in sub.js)
  const loaded = () => document.body.classList.add("is-load");
  if (page !== "home") { if (document.readyState === "complete") loaded(); else addEventListener("load", loaded, { once: true }); }
})();
