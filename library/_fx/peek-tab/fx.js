(() => {
  // A panel hiding with only its tab sticking out from the screen edge slides out when the tab is pressed, and goes back when pressing outside or pressing again.
  // when show is given, the panel (tab) appears only after scrolling down that height (px) (or once the element’s bottom edge passes above the viewport) — because on the first screen the header line shows the same content.
  // With hide, the element’s top edge goes past the hide-at line (share of screen height, default 0 = top of the screen) it hides again on contact — when Contact and Footer show the same menu
  kfFx.register("peek-tab", (el, { options, scroller }) => {
    const tab = el.querySelector('[data-fx-part="tab"]');
    if (!tab) return;
    const ac = new AbortController(), signal = ac.signal, box = scroller || window;
    const pick = (v) => (v == null || v === "" ? null : isNaN(+v) ? v : +v);
    const show = pick(options.show), hide = pick(options.hide);
    const hideAt = +(options["hide-at"] ?? 0);
    const closeOnScroll = options.close === "scroll";
    const top = () => (scroller ? scroller.scrollTop : window.scrollY);
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    const edge = (sel, side) => {
      const t = typeof sel === "string" ? document.querySelector(sel) : null;
      if (!t) return null;
      const r = t.getBoundingClientRect(), base = scroller ? scroller.getBoundingClientRect().top : 0;
      return (side === "bottom" ? r.bottom : r.top) - base;
    };
    const passed = () => {
      if (show == null) return true;
      if (typeof show === "number") return top() > show;
      const b = edge(show, "bottom");
      return b == null ? true : b < 0;
    };
    const gone = () => {
      if (hide == null) return false;
      if (typeof hide === "number") return top() > hide;
      const t = edge(hide, "top");
      return t != null && t <= view() * hideAt;
    };
    const set = (open) => { el.classList.toggle("is-fx-open", open); tab.setAttribute("aria-expanded", String(open)); };
    const seen = () => {
      const on = passed() && !gone();
      el.classList.toggle("is-fx-seen", on);
      if (!on && el.classList.contains("is-fx-open")) set(false);
    };
    tab.setAttribute("aria-expanded", "false");
    tab.addEventListener("click", (e) => { e.stopPropagation(); set(!el.classList.contains("is-fx-open")); }, { signal });
    document.addEventListener("click", (e) => { if (!el.contains(e.target)) set(false); }, { signal });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); }, { signal });
    box.addEventListener("scroll", () => { if (closeOnScroll) set(false); seen(); }, { passive: true, signal });
    addEventListener("resize", seen, { signal });
    seen();
    return () => { ac.abort(); el.classList.remove("is-fx-open", "is-fx-seen"); tab.removeAttribute("aria-expanded"); };
  });
})();
