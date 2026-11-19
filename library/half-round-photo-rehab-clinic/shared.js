// Shared by the whole site — plugs the header, phone menu, ”Find Info” tab, contact panel, address card and bottom row into every page with the same markup,
// Header hides and drops back (original Menu._scroll), reveal (original ScrollAnim: is-animated once it enters above the bottom 20% of the screen), tab panel open/close, and News category tabs are wired up
(() => {
  const page = document.body.dataset.page || "home";
  const svg = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/></svg>',
    tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg>',
    play: '<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="5" width="24" height="16" rx="5" fill="currentColor"/><path d="M11 9.5v7l6-3.5z" fill="var(--kf-bg)"/></svg>',
    cam: '<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="2" y="2" width="22" height="22" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="13" cy="13" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="19.5" cy="6.5" r="1.4" fill="currentColor"/></svg>',
    help: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22zm0 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 12.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 6a3.6 3.6 0 0 1 1.5 6.9c-.5.2-.7.6-.7 1.1v.4h-1.6V14c0-1.2.6-2.1 1.6-2.5A2 2 0 1 0 10 9.6H8.4A3.6 3.6 0 0 1 12 6z"/></svg>',
  };
  const logo = (tag = "a") => `<${tag} class="rr-logo" ${tag === "a" ? 'href="index.html"' : ""} data-label="Facility logo — boxed two-line English mark + facility name"><span class="rr-logo__mark" lang="en">R+R<br>NAME</span><span class="rr-logo__name">Your facility name here</span></${tag}>`;
  const gnav = [["index.html", "Menu 1 Hero", "home"], ["about.html", "Menu 2 Facility About", "about"], ["about.html#flow", "Menu 3 usage flow and pricing", "flow"], ["news.html", "Menu 4 News", "news"]];
  const circles = `<li><a class="rr-circle" href="index.html#access" aria-label="Directions">${svg.pin}</a></li><li><a class="rr-circle" href="index.html#contact" aria-label="Phone">${svg.tel}</a></li><li><a class="rr-circle is-fill" href="index.html#contact" aria-label="Contact form">${svg.mail}</a></li>`;

  const header = `
    ${logo()}
    <div class="rr-head__mail"><a class="rr-circle is-fill" href="index.html#contact" aria-label="Contact form">${svg.mail}</a></div>
    <button class="rr-menubtn" type="button" aria-label="Menu" aria-expanded="false"><span><i></i><i></i><i></i></span><small class="is-menu">Menu</small><small class="is-close">Close</small></button>
    <div class="rr-navwrap">
      <nav class="rr-nav" aria-label="Main menu">
        <ul class="rr-gnav">${gnav.map(([h, l, k]) => `<li><a href="${h}"${k === page ? ' class="is-current"' : ""}>${l}</a></li>`).join("")}</ul>
        <ul class="rr-subnav">${circles}</ul>
        <div class="rr-sns"><p class="rr-sns__t" lang="en">OFFICIAL<br>SNS</p><a class="is-video" href="news.html" aria-label="Video channel">${svg.play}</a><a class="is-photo" href="news.html" aria-label="Photo SNS">${svg.cam}</a></div>
      </nav>
    </div>`;

  const supLinks = (n, prefix) => Array.from({ length: n }, (_, i) => `<li><a href="about.html">${prefix} ${String(i + 1).padStart(2, "0")}</a></li>`).join("");
  const support = `
    <div class="rr-sup__inner">
      <button class="rr-sup__btn" type="button" aria-expanded="false"><span class="rr-sup__btninner">${svg.help}<b>The information you’re looking for<br>Is it here?</b></span></button>
      <div class="rr-sup__panel" role="dialog" aria-label="Info you seek">
        <button class="rr-sup__close" type="button" aria-label="Close">×</button>
        <div class="rr-sup__box">
          <p class="rr-sup__t">New here</p><ul class="rr-sup__list">${supLinks(3, "Guide link")}</ul>
          <p class="rr-sup__t">Users</p><ul class="rr-sup__list">${supLinks(4, "Guide link")}</ul>
          <p class="rr-sup__t">Family · Associates</p><ul class="rr-sup__list">${supLinks(2, "Guide link")}</ul>
        </div>
        <div class="rr-sup__contact"><a href="index.html#contact">${svg.tel}<span lang="en">000-000-0000</span></a><a class="is-fill" href="index.html#contact">${svg.mail}<span>Contact Us</span></a></div>
      </div>
    </div>
    <div class="rr-sup__bg"></div>
    <button class="rr-sup__btn is-sp" type="button" aria-expanded="false"><span class="rr-sup__btninner">${svg.help}<b>Is the info you need here?</b></span></button>`;

  const footer = `
    <div class="rr-contact rr-anim is-faderight" id="contact" data-slot="contact-band">
      <figure class="rr-contact__bg"><div class="wf-img" data-label="Spacious rehab room · bright windows · softly blurred background photo"></div></figure>
      <div class="rr-wrap">
        <p class="rr-contact__title">Inquiry</p>
        <p class="rr-contact__text">Your contact guidance here, in two lines<br>Add it here. Feel free to get in touch.</p>
        <ul class="rr-contact__btns">
          <li class="rr-contact__btn is-tel"><a href="tel:000-000-0000"><span class="rr-contact__ico">${svg.tel}</span><div class="rr-contact__body"><p class="rr-contact__num" lang="en">000-000-0000</p><p class="rr-contact__hour">Hours: 0:00~00:00 (closed on holidays)</p></div></a></li>
          <li class="rr-contact__btn is-mail"><a href="about.html"><span class="rr-contact__ico">${svg.mail}</span><div class="rr-contact__body"><p class="rr-contact__lbl">Contact form</p></div></a></li>
        </ul>
      </div>
    </div>
    <div class="rr-wrap">
      <div class="rr-info" id="access" data-slot="access-card">
        ${logo()}
        <dl><dt>Address</dt><dd>〒000-0000 Your address here<br>Your building name 1F here<br>Your facility name here</dd><dt>Phone number</dt><dd><span class="num" lang="en">000-000-0000</span></dd></dl>
        <div class="rr-work"><table><tr><td>Operations<br>Time</td><td>Month</td><td>Fire</td><td>Number</td><td>Neck</td><td>Gold</td><td>Earth</td><td>Sun·Holiday</td></tr><tr><td lang="en">0:00-00:00</td><td class="mk">●</td><td class="mk">●</td><td class="mk">●</td><td class="mk">●</td><td class="mk">●</td><td class="mk">●</td><td class="mk">―</td></tr></table></div>
        <div class="rr-info__map"><div class="wf-img" data-label="Map slot — external map embed (one pin, zoom buttons)"></div></div>
      </div>
      <div class="rr-bottom">
        <a class="rr-logo" href="index.html"><span class="rr-logo__mark" lang="en">R+R<br>NAME</span></a>
        <p class="rr-bottom__quote">“Your big phrase here”<br>Facility name that never lets go</p>
        <div class="rr-bottom__right">
          <div class="rr-bottom__contact"><a class="rr-bottom__tel" href="tel:000-000-0000" lang="en">${svg.tel}000-000-0000</a><a class="rr-bottom__btn" href="index.html#contact">${svg.mail}Inquiry</a></div>
          <ul class="rr-fnav">${gnav.map(([h, l]) => `<li><a href="${h}">${l.replace(/^Menu \d /, "")}</a></li>`).join("")}</ul>
        </div>
      </div>
      <p class="rr-copy" lang="en">© 0000 Placeholder Facility Name</p>
    </div>`;

  // When the document is ready (original jQuery ready) load-complete — attach it to the frame only after the first calculation finishes, so the subpage header floats up after the delay
  requestAnimationFrame(() => document.documentElement.classList.add("load-complete"));

  const fill = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; return el; };
  const head = fill('[data-slot="header"]', header);
  const sup = fill('[data-slot="support"]', support);
  fill('[data-slot="footer"]', footer);

  // Header — past the first screen it sticks as a white panel, hides while scrolling down and comes back down in .6s when scrolling up (original Menu._scroll)
  if (head) {
    let last = scrollY;
    const startY = 120;
    const onScroll = () => {
      const y = scrollY;
      if (y > startY) head.classList.add("is-fixed");
      else if (y <= 0) head.classList.remove("is-fixed", "is-show", "is-hide");
      if (head.classList.contains("is-fixed")) {
        if (y > last) { if (head.classList.contains("is-show")) { head.classList.add("is-hide"); head.classList.remove("is-show"); } }
        else { head.classList.add("is-show"); head.classList.remove("is-hide"); }
      }
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    const btn = head.querySelector(".rr-menubtn");
    btn.addEventListener("click", () => { const open = document.documentElement.classList.toggle("is-menuopen"); btn.setAttribute("aria-expanded", String(open)); });
    head.querySelectorAll(".rr-navwrap a").forEach((a) => a.addEventListener("click", () => document.documentElement.classList.remove("is-menuopen")));
  }

  // ”Looking for” tab — pressing it brings the panel out with .4s ease-in-out, and pressing again or clicking outside or close puts it back in
  if (sup) {
    const btns = sup.querySelectorAll(".rr-sup__btn");
    const set = (open) => { sup.classList.add("is-anim"); sup.classList.toggle("is-show", open); btns.forEach((b) => b.setAttribute("aria-expanded", String(open))); };
    btns.forEach((b) => b.addEventListener("click", () => set(!sup.classList.contains("is-show"))));
    sup.querySelectorAll(".rr-sup__bg, .rr-sup__close, .rr-sup__list a").forEach((el) => el.addEventListener("click", () => set(false)));
    addEventListener("scroll", () => sup.classList.remove("is-anim"), { passive: true });
  }

  // News category tabs — the current list disappears in .2s, then the chosen list appears in .5s (original jQuery fadeOut 200 → fadeIn 500, swing)
  document.querySelectorAll("[data-tabs]").forEach((box) => {
    const btns = box.querySelectorAll("[data-tab]");
    const swing = "cubic-bezier(0.37, 0, 0.63, 1)";
    btns.forEach((b) => b.addEventListener("click", () => {
      if (b.classList.contains("is-current")) return;
      btns.forEach((x) => x.classList.toggle("is-current", x === b));
      const cur = box.querySelector("[data-panel]:not([hidden])"), next = box.querySelector(`[data-panel="${b.dataset.tab}"]`);
      if (!next || cur === next) return;
      const show = () => { if (cur) cur.hidden = true; next.hidden = false; next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: swing }); };
      if (cur) cur.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: swing }).onfinish = show; else show();
    }));
  });

  // On phones only six questions show, and ”More” opens the rest (original top_faq_more)
  document.querySelectorAll(".rr-faq__more").forEach((m) => m.addEventListener("click", () => { m.closest(".rr-faq")?.classList.add("is-all"); m.hidden = true; }));

  // Collapsible questions — height opens and closes in .3s (original top_faq_item_answer)
  document.querySelectorAll(".rr-faq__item").forEach((item) => {
    const ans = item.querySelector(".rr-faq__a");
    item.querySelector("button").addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      ans.style.height = ans.scrollHeight + "px";
      if (!open) requestAnimationFrame(() => { ans.style.height = "0px"; });
      item.classList.toggle("is-open", open);
      item.querySelector("button").setAttribute("aria-expanded", String(open));
    });
  });

  // Appearance — original ScrollAnim: when the element’s top crosses the 1/1.3 line of the screen height it gets is-animated (here is-done)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [...document.querySelectorAll(".rr-anim")];
  const check = () => {
    const line = innerHeight / 1.3;
    items.forEach((el) => { if (!el.classList.contains("is-done") && (reduce || el.getBoundingClientRect().top < line)) el.classList.add("is-done"); });
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  requestAnimationFrame(check);
})();
