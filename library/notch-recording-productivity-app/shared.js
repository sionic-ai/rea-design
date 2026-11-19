// Shared by all pages: draws in the header (logo, feature dropdown, pricing, login, start button) and footer, and hooks up the dropdown and accordion.
// Original values: color change .15s cubic-bezier(.4,0,.2,1) (Tailwind transition-colors) · dropdown panel .2s (Radix menu) · FAQ height .2s
(() => {
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AM = (window.AM = { reduced, page });
  // Placeholder symbol of four overlapping petal circles instead of the original symbol
  const mark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5a7.5 7.5 0 0 0-10.5 10.5 7.5 7.5 0 0 0 10.5 10.5 7.5 7.5 0 0 0 10.5-10.5A7.5 7.5 0 0 0 12 1.5Zm-3 8a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Zm6 0a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"/></svg>';
  const chev = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>';
  AM.icons = { mark, chev };

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("am-head");
    head.innerHTML = `
      <nav class="am-nav" aria-label="Main menu">
        <ul class="am-nav__list">
          <li><a class="am-nav__logo" href="index.html" aria-label="Home">${mark}</a></li>
          <li><button class="am-nav__item am-nav__trigger" type="button" aria-expanded="false" data-label="Your menu English name here">Features</button></li>
          <li><a class="am-nav__item" href="pricing.html">Pricing</a></li>
          <div class="am-drop" role="menu" data-slot="features-menu">
            <p class="am-drop__label" data-label="Bundle name in English">Features</p>
            ${[["Meeting Notes", "is-green"], ["Chat", "is-ink"], ["Integrations", "is-ink"], ["Pages", "is-purple"], ["Scheduling", "is-orange"], ["Server", "is-ink"]]
              .map(([t, c]) => `<a href="index.html" role="menuitem"><i class="${c}"></i><b>${t}</b></a>`)
              .join("")}
          </div>
        </ul>
        <div class="am-nav__end">
          <a class="am-nav__item is-sub" href="#">Login</a>
          <a class="am-btn is-blue is-sm" href="#">Get started</a>
        </div>
      </nav>`;
    const trig = head.querySelector(".am-nav__trigger");
    const drop = head.querySelector(".am-drop");
    let t;
    const isOpen = () => drop.dataset.state === "open";
    const set = (on) => {
      clearTimeout(t);
      if (on === isOpen()) return;
      // On close, the board is lowered after scaleOut has finished
      drop.dataset.state = on ? "open" : "closed";
      trig.setAttribute("aria-expanded", String(on));
      // Like the Radix viewport, measures the content size on open and sets width and height straight from 0 to that value
      if (on) {
        drop.style.width = drop.style.height = "";
        // The opening keyframe has already shrunk it to .9x, so measure the layout size, not the on-screen box
        const w = drop.offsetWidth, h = drop.offsetHeight;
        drop.style.width = drop.style.height = "0px";
        requestAnimationFrame(() => { drop.style.width = w + "px"; drop.style.height = h + "px"; });
      }
    };
    // When the close scaleOut(.2s) ends, take the plate down — like Radix Presence
    drop.addEventListener("animationend", () => { if (drop.dataset.state === "closed") delete drop.dataset.state; });
    // Measured from the original: opens right as the hand arrives (57ms), closes 150ms after it leaves. Clicking flips it immediately
    trig.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; clearTimeout(t); set(true); });
    trig.addEventListener("click", () => set(!isOpen()));
    [trig, drop].forEach((n) => {
      n.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { clearTimeout(t); t = setTimeout(() => set(false), 150); } });
    });
    drop.addEventListener("pointerenter", () => clearTimeout(t));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("am-foot");
    const col = (items, cls = "") => `<div class="am-foot__col ${cls}">${items.map((x) => `<a href="${x[1] || "#"}">${x[0]}</a>`).join("")}</div>`;
    foot.innerHTML = `
      <div class="am-wrap">
        <div class="am-foot__cols" data-label="Link name in English">
          ${col([["Blog", "blog.html"], ["Our Story", "stories.html"], ["Calendar"], ["Changelog"], ["Tools"], ["Templates"], ["Alternatives"], ["Best Apps"], ["Server"], ["Recording API"], ["Routines"], ["Response Generator"]])}
          ${col([["Contact us"], ["Download"], ["Affiliates"], ["Reviews"], ["Art"]])}
          ${col([["LinkedIn"], ["Instagram"], ["x.com"]], "is-social")}
        </div>
        <div class="am-foot__low">
          <div class="am-foot__sig" data-label="Handwritten signature, one English line">Designed by the sea</div>
          <div class="am-foot__legal"><a href="#">Privacy Policy</a><a href="#">Terms of use</a><a href="#">Imprint</a><span>© Product 0000</span></div>
        </div>
      </div>`;
  }

  // FAQ — on click the answer expands in height over .2s and the chevron turns 180°. Only one open at a time
  // Email below FAQ — click to copy and briefly show a small 「Copied」 tag above it
  document.querySelectorAll("[data-copy-mail]").forEach((m) => {
    let t;
    const go = () => {
      (navigator.clipboard ? navigator.clipboard.writeText(m.firstChild.textContent) : Promise.resolve()).catch(() => {});
      m.classList.add("is-copied");
      clearTimeout(t);
      t = setTimeout(() => m.classList.remove("is-copied"), 2000);
    };
    m.addEventListener("click", go);
    m.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
  });

  const plus = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  document.querySelectorAll("[data-faq]").forEach((list) => {
    if (!list.children.length)
      list.innerHTML = [1, 2, 3, 4, 5, 6, 7]
        .map((n) => `<div class="am-faq__item"><button class="am-faq__q" type="button" aria-expanded="false"><span>Your frequently asked question $ here{n} In one line?</span>${plus}</button><div class="am-faq__a"><p>Put the answer here in two or three lines. Say where and what to click, what to do to use it together at work, and who to email if it still doesn’t work, matching the length of the original answer.</p></div></div>`)
        .join("");
    // Like original Radix, measures content height into --am-h and runs slideDown and slideUp keyframes
    const toggle = (item, open) => {
      const a = item.querySelector(".am-faq__a");
      item.classList.add("is-open");
      a.style.setProperty("--am-h", a.scrollHeight + "px");
      item.classList.toggle("is-open", open);
      a.classList.remove("is-down", "is-up");
      void a.offsetWidth;
      a.classList.add(open ? "is-down" : "is-up");
      item.querySelector(".am-faq__q").setAttribute("aria-expanded", String(open));
    };
    list.addEventListener("animationend", (e) => e.target.classList.remove("is-down", "is-up"));
    list.addEventListener("click", (e) => {
      const b = e.target.closest(".am-faq__q");
      if (!b) return;
      const item = b.parentElement;
      const open = !item.classList.contains("is-open");
      list.querySelectorAll(".am-faq__item.is-open").forEach((x) => x !== item && toggle(x, false));
      toggle(item, open);
    });
  });
})();
