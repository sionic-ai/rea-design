// Shared by all pages: draws the corner white boxes (header, top right, bottom-left bar) and the footer (statement, bar), and
// As the footer rises it darkens over the body (original background deepens to gray), spins light around the wordmark while loading, and removes only the body on page transition.
// The bar text that differs per page is received through the body’s data-tr (name|tail) and data-bl (name|tail|address).
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  root.classList.add("is-loading");
  // The logo glow shows while loading (original Header_loader, measured ~.5s on the hero)
  addEventListener("DOMContentLoaded", () => setTimeout(() => root.classList.remove("is-loading"), page === "home" ? 450 : 0));

  const btn = (name, suf, href, cls = "") =>
    `<${href ? `a href="${href}"` : 'button type="button"'} class="bc-btn ${cls}" data-fx="char-swap-hover"><span data-fx-part="text">${name}</span>${suf ? `<span class="bc-suf" data-fx-part="text">${suf}</span>` : ""}</${href ? "a" : "button"}>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "bc-head";
    head.innerHTML = `
      <div class="bc-head__line bc-head__top"><a class="bc-logo" href="index.html" aria-label="Home" data-label="Brand wordmark (wide italic uppercase)"><b>BRANDMARK</b></a></div>
      <div class="bc-head__line bc-head__menu bc-row">
        <span class="bc-menu">${btn("All", "27", "list.html")}${btn("Stories", "04", "lookbook.html")}</span>
        ${btn("Menu", "", "", "bc-head__menuBtn")}
        <span class="bc-spacer"></span>
        ${btn("Cart", "00", "", "bc-cartBtn")}
      </div>
      <div class="bc-drawer" aria-hidden="true"><div>
        <a href="list.html" class="bc-btn"><span>All</span><span class="bc-suf">27</span></a>
        <a href="lookbook.html" class="bc-btn"><span>Stories</span><span class="bc-suf">04</span></a>
        <a href="page.html" class="bc-btn"><span>Size guide</span><span class="bc-suf"></span></a>
      </div></div>
      <div class="bc-cart" aria-hidden="true"><div><p><span>Your empty cart message here</span><span class="bc-dim">00</span></p></div></div>`;
    // Menu and cart: when open, the button label changes to Close (gray) and a dim overlay covers the screen behind. Closes with the overlay or Esc
    const veil = document.createElement("div");
    veil.className = "bc-veil";
    body.append(veil);
    const panels = { menu: [".bc-head__menuBtn", ".bc-drawer", "is-menu", "Menu"], cart: [".bc-cartBtn", ".bc-cart", "is-cart", "Cart"] };
    const set = (key, on) => {
      Object.entries(panels).forEach(([k, [b, p, cls, name]]) => {
        const open = k === key && on;
        head.classList.toggle(cls, open);
        head.querySelector(p).setAttribute("aria-hidden", String(!open));
        // Only on phone the label changes to Close (on desktop the original button width stays the same)
        if (matchMedia("(max-width: 740px)").matches) head.querySelector(`${b} [data-fx-part="text"]`).textContent = open ? "Close" : name;
      });
      veil.classList.toggle("is-on", on);
    };
    Object.entries(panels).forEach(([k, [b, , cls]]) => head.querySelector(b).addEventListener("click", () => set(k, !head.classList.contains(cls))));
    veil.addEventListener("click", () => set("menu", false));
    addEventListener("keydown", (e) => e.key === "Escape" && set("menu", false));
  }

  // Page info and corner bars are gathered in a sticky panel at the very start of main — stuck on screen only during the main span, and rising together with the footer when it arrives
  const main = document.querySelector(".bc-page");
  const pin = document.createElement("div");
  pin.className = "bc-pin";
  main?.prepend(pin);
  const into = (el) => (main ? pin.append(el) : body.append(el));
  document.querySelectorAll(".bc-info, .bc-products").forEach(into);
  const flow = main && [...main.children].find((el) => el !== pin && !["absolute", "fixed"].includes(getComputedStyle(el).position));
  if (flow) flow.style.marginTop = `calc(${getComputedStyle(flow).marginTop} - 100vh)`;

  const [trName, trSuf] = (body.dataset.tr || "Collection|01 / 01").split("|");
  const tr = document.createElement("div");
  tr.className = "bc-bar bc-bar--tr";
  tr.setAttribute("data-slot", "bar-top-right");
  tr.innerHTML = `<div class="bc-bar__item"><span>${trName} <span class="bc-dim" style="margin-left:6px">${trSuf}</span></span></div>
    <span class="bc-bar__tail">${(body.dataset.thumbs || "1").split(",").map((n, i) => `<a class="bc-thumb${i === 0 ? " is-current" : ""}" href="${i === 0 ? "#" : "lookbook.html"}" aria-label="Collection ${n}"><i class="wf-img" data-label="Collection hero video · full-body model · portrait · 24px slot"></i></a>`).join("")}</span>`;
  into(tr);

  if (body.dataset.bl) {
    const [blName, blSuf, blHref] = body.dataset.bl.split("|");
    const bl = document.createElement("div");
    bl.className = "bc-bar bc-bar--bl";
    bl.setAttribute("data-slot", "bar-bottom-left");
    bl.innerHTML = `<a class="bc-bar__item" href="${blHref || "list.html"}" data-fx="char-swap-hover"><span data-fx-part="text">${blName}</span><span class="bc-suf" data-fx-part="text">${blSuf}</span></a>`;
    into(bl);
  }

  const dim = document.createElement("div");
  dim.className = "bc-dimmer";
  dim.setAttribute("aria-hidden", "true");
  body.append(dim);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "bc-foot";
    foot.innerHTML = `
      <p class="bc-mani bc-heading" data-slot="manifesto" data-label="Manifesto (wide uppercase English, about twelve centered lines)">Built for the long ride, shaped for the street. Tough, protective and boldly made, every piece gives the wearer room to move freely. A quiet push to pick your own road, with no shortcut and no excuse.</p>
      <nav class="bc-foot__bars">
        <div class="bc-foot__bar bc-row">${btn("Terms of service", "", "page.html")}${btn("Shipping policy", "", "page.html")}${btn("Size guide", "", "page.html")}</div>
        <div class="bc-foot__bar bc-row">${btn("hello@brand.com", "", "#", "bc-ext")}${btn("Instagram", "", "#")}</div>
      </nav>`;
    // As the footer top rises from the bottom of the screen (0 → screen height), the overlay above the body darkens — the gray (about #5d5d5d) of the original’s end screen
    const max = parseFloat(getComputedStyle(root).getPropertyValue("--site-dim-max")) || 0.62;
    const tick = () => {
      const top = foot.getBoundingClientRect().top, h = innerHeight;
      const p = Math.min(Math.max((h - top) / h, 0), 1);
      dim.style.opacity = (reduce ? 0 : p * max).toFixed(4);
    };
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    tick();
  }

  // Page transition — original Page bottom-overlay: on click, while the next page data loads (measured .4~.6s) the screen stays as is, then the new page comes over a dark curtain
  // and are clipped as they rise from the bottom (.7s quintOut). Corner cells stay as they are. The copy that opens a new document leaves an ‹arrived› mark in the session so the next page handles the rising side
  if (sessionStorage.getItem("bc-nav") === "1" && !reduce) {
    root.classList.add("is-entering");
    setTimeout(() => root.classList.remove("is-entering"), 750);
  }
  sessionStorage.removeItem("bc-nav");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:)/.test(href)) return;
    if (reduce) return;
    e.preventDefault();
    sessionStorage.setItem("bc-nav", "1");
    setTimeout(() => (location.href = href), 400);
  });
  window.bcPage = page;
})();
