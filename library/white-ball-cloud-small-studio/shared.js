(() => {
  const html = document.documentElement;
  const page = document.body.dataset.page;
  const main = document.querySelector("[data-hy-page]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Original (Nuxt) starts the page transition only after fetching the next page data (CMS) following a click — measured four times at 244~277ms
  const WAIT = 240;
  const LEAVE = 400;
  const KEY = "hy-nav";

  // Draw the line on the current page’s menu — detail pages draw it on no menu, like the original
  document.querySelectorAll(".hy-nav a[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === page));

  const scroller = document.querySelector("[data-hy-scroll]");
  if (scroller && window.SimpleBar) new SimpleBar(scroller, { autoHide: false });

  // If arriving from inside, the new body settles in over .4s — on first open it just stands, like the original
  if (html.classList.contains("hy-enter")) {
    sessionStorage.removeItem(KEY);
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove("hy-enter")));
  }

  let leaving = false;
  const leave = (go) => {
    if (leaving) return;
    leaving = true;
    setTimeout(() => {
      sessionStorage.setItem(KEY, "1");
      if (main) main.classList.add("is-leaving");
      document.dispatchEvent(new CustomEvent("hy:leave"));
      setTimeout(go, reduce ? 0 : LEAVE);
    }, reduce ? 0 : WAIT);
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
    e.preventDefault();
    if (url.pathname === location.pathname) return;
    const back = a.hasAttribute("data-hy-back") && document.referrer && new URL(document.referrer).origin === location.origin;
    leave(() => (back ? history.back() : location.assign(url.href)));
  });

  // A page revived by back stays frozen as it was when leaving — restore it
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    sessionStorage.removeItem(KEY);
    if (main) main.classList.remove("is-leaving");
    document.dispatchEvent(new CustomEvent("hy:back"));
  });
})();
