// Common to all pages: draws the header (always attached, the dropdown menu opens on press and comes down from 15px above in .3s ease), the phone drawer and the footer, and
// Sets up the blur appear (original .js-blur-*: blur 10px → 0 · 2s custom curve 0.16,1,0.3,1, when it reaches the bottom edge of the screen) and Q&A (height·opacity·top margin .5s ease-in-out).
// Original libraries as they are: GSAP 3 + ScrollTrigger + CustomEase. The original is an e-commerce theme, so it navigates normally without page transitions.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const NM = (window.NM = { reduced, ease: CustomEase.create("brand", "M0,0 C0.16,1 0.3,1 1,1") });
  const page = document.body.dataset.page || "home";

  const caret = '<svg class="nm-caret" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  const menus = [
    { label: "All products", items: [["Product list", "list.html"], ["Mattress", "list.html"], ["Pillow", "list.html"], ["Pajamas", "list.html"], ["Nightcap", "list.html"]] },
    { label: "About the Brand", items: [["Brand", "about.html"], ["Company overview", "#"], ["News", "news.html"]] },
    { label: "Column", items: [["Sleep column", "news.html"]] },
  ];
  const links = [["Frequently asked questions", "#"], ["Contact Us", "#"]];
  const user = '<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="7.5" r="4"/><path d="M3.5 20c.8-4.2 3.8-6.4 7.5-6.4s6.7 2.2 7.5 6.4z"/></svg>';
  const bag = '<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M4.5 7.5h13l-1 12h-11z"/><path d="M8 9V6a3 3 0 0 1 6 0v3"/></svg>';
  NM.icons = { caret };

  const head = document.querySelector('[data-slot="header"]');
  head.classList.add("nm-head");
  head.innerHTML = `<div class="nm-head__in">
      <a class="nm-logo" href="index.html" aria-label="Home" data-label="Brand English Wordmark"><span>Brand</span></a>
      <ul class="nm-nav">
        ${menus.map((m) => `<li><button type="button" aria-expanded="false">${m.label}${caret}</button><ul class="nm-drop" data-slot="drop-menu">${m.items.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></li>`).join("")}
        ${links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}
      </ul>
      <div class="nm-icons"><a href="#" aria-label="Account">${user}</a><a href="#" aria-label="Cart">${bag}</a></div>
      <button class="nm-burger" type="button" aria-label="Menu"><i></i><i></i><i></i>menu</button>
    </div>`;
  head.insertAdjacentHTML("afterend", `<nav class="nm-drawer" data-slot="mobile-menu" aria-label="Phone menu"><ul>
      ${menus.map((m) => `<li><details><summary>${m.label}${caret}</summary><ul>${m.items.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></details></li>`).join("")}
      ${links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}
    </ul></nav>`);

  const items = [...head.querySelectorAll(".nm-nav > li")].filter((li) => li.querySelector(".nm-drop"));
  const close = (except) => items.forEach((li) => { if (li !== except) { li.classList.remove("is-open"); li.querySelector("button").setAttribute("aria-expanded", "false"); } });
  items.forEach((li) => li.querySelector("button").addEventListener("click", (e) => {
    e.stopPropagation();
    close(li);
    const on = li.classList.toggle("is-open");
    li.querySelector("button").setAttribute("aria-expanded", String(on));
  }));
  document.addEventListener("click", (e) => { if (!e.target.closest(".nm-nav")) close(); });
  addEventListener("keydown", (e) => e.key === "Escape" && close());

  const burger = head.querySelector(".nm-burger");
  const drawer = document.querySelector(".nm-drawer");
  burger.addEventListener("click", () => {
    const on = burger.classList.toggle("is-open");
    drawer.classList.toggle("is-open", on);
    document.documentElement.style.overflow = on ? "hidden" : "";
  });

  const foot = document.querySelector('[data-slot="footer"]');
  foot.classList.add("nm-foot");
  const crumb = foot.dataset.crumb;
  const ig = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="3.5"/><circle cx="7" cy="7" r="2.8"/></svg>';
  const x = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12"/></svg>';
  foot.innerHTML = `${crumb ? `<p class="nm-foot__crumb"><a href="index.html">Home</a> / ${crumb}</p>` : ""}
    <a class="nm-foot__mark" href="index.html" aria-label="Home" data-label="Brand English Wordmark">Brand</a>
    <div class="nm-foot__grid">
      <div class="nm-foot__col"><h3>All products</h3><ul><li><a href="list.html">Product list</a></li><li><a href="list.html">Mattress</a><ul><li><a href="list.html">· Custom Mattress</a></li><li><a href="list.html">· Three-tier mattress</a></li></ul></li><li><a href="list.html">Pillow</a></li><li><a href="list.html">Pajamas</a></li><li><a href="list.html">Nightcap</a></li><li><a href="list.html">Box seat</a></li></ul></div>
      <div class="nm-foot__col"><h3>About the Brand</h3><ul><li><a href="about.html">Brand</a></li><li><a href="#">Company overview</a></li><li><a href="news.html">News</a></li></ul></div>
      <div class="nm-foot__col"><h3>Column</h3><ul><li><a href="news.html">Sleep column</a></li></ul></div>
      <div class="nm-foot__col"><h3>Help</h3><ul><li><a href="#">Frequently asked questions</a></li><li><a href="#">Contact Us</a></li></ul></div>
      <div class="nm-foot__col is-follow"><h3>follow us</h3><ul><li><a href="#">${ig}Instagram</a></li><li><a href="#">${x}X</a></li></ul></div>
    </div>
    <div class="nm-foot__bottom"><span>©Brand</span><a href="#">Return policy</a><a href="#">Privacy policy</a><a href="#">Terms of service</a><a href="#">Shipping policy</a><a href="#">Transaction Display</a></div>`;

  // Blur reveal — original plays once when it starts to show (top bottom)
  function blurs() {
    const els = gsap.utils.toArray(".nm-blur");
    if (reduced) return void gsap.set(els, { filter: "blur(0px)", opacity: 1, y: 0 });
    els.forEach((el) => {
      const img = el.classList.contains("nm-blur--img");
      gsap.to(el, { filter: "blur(0px)", opacity: 1, ...(img ? { y: 0 } : {}), duration: 2, ease: NM.ease, scrollTrigger: { trigger: el, start: "top bottom" } });
    });
  }

  // FAQ — the original uses WAAPI for height, opacity and top margin at .5s ease-in-out
  function accordions() {
    document.querySelectorAll(".nm-qa").forEach((qa) => {
      const sum = qa.querySelector("summary"), a = qa.querySelector(".nm-qa__a");
      sum.addEventListener("click", (e) => e.preventDefault());
      qa.addEventListener("click", () => {
        const d = reduced ? 0 : 500;
        if (qa.open) {
          const an = a.animate({ opacity: [1, 0], height: [a.offsetHeight + "px", 0], marginTop: ["20px", 0] }, { duration: d, easing: "ease-in-out" });
          an.onfinish = () => qa.removeAttribute("open");
        } else {
          qa.setAttribute("open", "true");
          a.animate({ opacity: [0, 1], height: [0, a.offsetHeight + "px"], marginTop: [0, "20px"] }, { duration: d, easing: "ease-in-out" });
        }
      });
    });
  }

  // Floating photo strip — exactly the Swiper 9.4.1 values of the original script-section-decoration-slide
  function decos() {
    if (!window.Swiper) return;
    document.querySelectorAll(".nm-deco").forEach((el) => new Swiper(el, {
      spaceBetween: 20, slidesPerView: 2, loop: true, speed: 8000, allowTouchMove: false, centeredSlides: true,
      autoplay: reduced ? false : { delay: 0, disableOnInteraction: false },
      breakpoints: { 519: { spaceBetween: 58, slidesPerView: 3 } },
    }));
  }
  // WebGL panel — in the original the gradient circle starts on load and the white tube starts as soon as the module loads
  const gl = () => {
    if (!NM.gradient) return;
    document.querySelectorAll('[data-gl="wave"]').forEach((el) => NM.wave(el));
    const grad = () => document.querySelectorAll('[data-gl="gradient"]').forEach((el) => NM.gradient(el));
    document.readyState === "complete" ? grad() : addEventListener("load", grad);
  };

  const start = () => { blurs(); accordions(); decos(); gl(); (NM.page || (() => {}))(); };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
  NM.pageName = page;
})();
