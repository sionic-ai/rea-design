// Shared by all pages: draws the header logo, four-edge section names, round button and right drawer, lifts the loader, and changes the header color per section (white over photos · symbol logo).
// Original values: loader .5s (all photos loaded or 2.5s) · drawer curtain 150ms/75ms · panel 300ms ease-out/ease-in · header color 300ms cubic-bezier(.4,0,.2,1)
(() => {
  const page = document.body.dataset.page || "home";
  const home = page === "home";
  const wrap = document.getElementById("wrapper");
  const RY = (window.RY = { reduced: matchMedia("(prefers-reduced-motion: reduce)").matches });

  // A newly drawn placeholder instead of the original symbol — a quarter circle + a small triangle
  const mark = '<svg viewBox="0 0 180 167" aria-hidden="true"><path class="ry-fill" d="M20 120 A80 80 0 0 1 100 40 L100 120 Z"/><path class="ry-fill" d="M112 150 L170 150 L141 104 Z"/></svg>';
  RY.mark = mark;
  const at = (id) => (home ? `#${id}` : `index.html#${id}`);

  // Five section names — start slots 0 (top)·1 (left)·2 (bottom-left)·3 (bottom-right)·4 (right). On the first page it rotates one slot every time the section changes.
  const labels = [
    ["Menu 1", "news"],
    ["Menu 5", "section5"],
    ["Menu 4", "section4"],
    ["Menu 3", "section3"],
    ["Menu 2", "section2"],
  ];
  const drawer = [
    ["Menu 1", "Top", "section1"],
    ["Menu 2", "News", "news"],
    ["Menu 3", "Menu 2", "section2"],
    ["Menu 4", "Menu 3", "section3"],
    ["Menu 5", "Menu 4", "section4"],
    ["Menu 6", "Menu 5", "section5"],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      <a class="ry-logo" href="index.html" aria-label="First Page" data-label="Brand name (three Korean syllables · English wordmark) · symbol in other sections">
        <span class="ry-logo__long"><b>Here</b><span>Temple Name Zen Garden Site</span></span>
        <span class="ry-logo__mark">${mark}</span>
      </a>
      <nav class="ry-nav" aria-label="Section name" data-label="Five English section names (News · Contact · Access · About · Reservation)">
        ${labels.map(([t, id], i) => `<div class="ry-nav__item" data-station="${i}"><a href="${at(id)}">${t}</a></div>`).join("")}
      </nav>
      <button class="ry-burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="ry-drawer"><i></i></button>
      <div class="ry-drawer" id="ry-drawer" data-slot="menu-drawer" hidden>
        <div class="ry-drawer__veil"></div>
        <div class="ry-drawer__side">
          <div class="ry-drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
            <div class="ry-drawer__in">
              <ul>${drawer.map(([ko, en, id]) => `<li><a href="${at(id)}"><span class="ry-drawer__ko">${ko}</span><span class="ry-drawer__en">${en}</span></a></li>`).join("")}</ul>
              <ul class="ry-drawer__sub">
                <li><a href="#"><span class="ry-drawer__ko">Privacy policy</span><span class="ry-drawer__en">Privacy Policy</span></a></li>
                <li><a href="#"><span class="ry-drawer__ko">Cookie Policy</span><span class="ry-drawer__en">Cookie Policy</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;
  }
  RY.labels = [...document.querySelectorAll(".ry-nav__item")];

  // Drawer — the button both opens and closes (the original only opens, closing is by panel, curtain and Esc). Tapping anywhere in the panel closes it
  const burger = document.querySelector(".ry-burger");
  const dr = document.getElementById("ry-drawer");
  if (burger && dr) {
    const veil = dr.querySelector(".ry-drawer__veil");
    const panel = dr.querySelector(".ry-drawer__panel");
    const parts = [veil, panel];
    const frame = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
    let endTimer;
    // Open: start hidden with the start state set → make visible → remove the start state on the next frame, and the cover comes in over .15s, the panel over .3s
    const open = () => {
      clearTimeout(endTimer);
      dr.classList.add("is-on");
      dr.classList.remove("is-leaving");
      parts.forEach((p) => p.classList.add("is-from"));
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Close Menu");
      requestAnimationFrame(() => {
        dr.hidden = false;
        dr.classList.add("is-moving");
        frame(() => {
          parts.forEach((p) => p.classList.remove("is-from"));
          endTimer = setTimeout(() => dr.classList.remove("is-moving"), RY.reduced ? 0 : 300);
        });
      });
    };
    const close = () => {
      if (!dr.classList.contains("is-on")) return;
      clearTimeout(endTimer);
      dr.classList.remove("is-on");
      dr.classList.add("is-moving", "is-leaving");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open Menu");
      requestAnimationFrame(() => parts.forEach((p) => p.classList.add("is-from")));
      endTimer = setTimeout(() => {
        dr.hidden = true;
        dr.classList.remove("is-moving", "is-leaving");
        parts.forEach((p) => p.classList.remove("is-from"));
      }, RY.reduced ? 0 : 300);
      burger.focus({ preventScroll: true });
    };
    burger.addEventListener("click", () => (dr.classList.contains("is-on") ? close() : open()));
    veil.addEventListener("click", close);
    panel.addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // Loader — once photos and fonts are loaded (2.5s at the latest) the backdrop panel lifts away in .5s and is removed 510ms later
  const loader = document.querySelector(".ry-loader");
  let gone = false;
  const lift = () => {
    if (!loader || gone) return;
    gone = true;
    loader.style.opacity = 1;
    setTimeout(() => { loader.style.opacity = 0; }, 1);
    setTimeout(() => { loader.style.display = "none"; }, RY.reduced ? 0 : 510);
  };
  setTimeout(lift, 2500);
  addEventListener("load", () => {
    const imgs = [...document.querySelectorAll("#content img")].filter((im) => !im.complete);
    if (!imgs.length) return lift();
    let left = imgs.length;
    imgs.forEach((im) => im.addEventListener("load", () => --left || lift(), { once: true }));
  });

  // Section color — while a data-tone section spans the 5% line from the top of the screen, #wrapper gets that type (is-first: white header over photo / is-symbol: symbol logo)
  addEventListener("load", () => {
    const tones = document.querySelectorAll("[data-tone]");
    if (!tones.length || !wrap) return;
    setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger);
      tones.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 5%",
          end: "bottom 5%",
          toggleClass: { targets: wrap, className: el.dataset.tone },
        });
      });
      ScrollTrigger.config({ ignoreMobileResize: true });
    }, 400);
  });
})();
