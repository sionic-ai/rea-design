// Interaction across several pages: the menu drawer at 1025px and below is jquery-drawer 3.1.0 (iScroll) as in the original — the panel enters from the right in 1.2s, and
// Tapping a link in the drawer closes it, and while opening or closing, fixed is applied to html and body to freeze the page behind
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.drawer || !document.querySelector(".drawer")) return;
  $(".drawer").drawer();
  $(".drawer-menu a").on("click", () => $(".drawer").drawer("close"));
  const toggle = document.querySelector(".drawer-toggle");
  $(".drawer").on("drawer.opened drawer.closed", (e) => {
    const open = e.type === "drawer" && e.namespace === "opened";
    document.documentElement.classList.toggle("fixed", open);
    document.body.classList.toggle("fixed", open);
    toggle?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  });
})();
