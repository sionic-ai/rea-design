// The top-right pill button (Menu) appears once it passes the Hero (when the top of the after element touches the screen top), and pressing it opens a blurred translucent panel menu under the button.
// The button text swaps by overlapping Menu↔Close and the three lines turn into an X — the swap length · curve · wait time of the panel are --fx-dur · --fx-ease · --fx-wait in fx.css
(() => {
  kfFx.register("pill-veil-menu", (el, { options, reduce, scroller }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]'), panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const set = (open) => {
      el.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const onToggle = () => set(!el.classList.contains("is-open"));
    const onPanel = (e) => e.target.closest("a") && set(false);
    const onKey = (e) => e.key === "Escape" && el.classList.contains("is-open") && set(false);
    toggle.addEventListener("click", onToggle);
    panel.addEventListener("click", onPanel);
    addEventListener("keydown", onKey);
    // With after set, the button appears when that element’s top edge touches the top of the screen, and hides when scrolling back, closing the panel too. On phone (narrow width or below) it is always visible
    const after = options.after ? document.querySelector(String(options.after)) : null;
    const narrow = +(options.narrow ?? 760);
    let st = null;
    if (after && window.ScrollTrigger && !reduce) {
      st = ScrollTrigger.create({ trigger: after, scroller, start: "top top", onEnter: () => el.classList.add("is-shown"), onLeaveBack: () => { el.classList.remove("is-shown"); set(false); } });
    } else el.classList.add("is-shown");
    const mq = matchMedia(`(max-width: ${narrow}px)`);
    const phone = () => el.classList.toggle("is-narrow", mq.matches);
    phone();
    mq.addEventListener("change", phone);
    return () => {
      toggle.removeEventListener("click", onToggle);
      panel.removeEventListener("click", onPanel);
      removeEventListener("keydown", onKey);
      mq.removeEventListener("change", phone);
      st?.kill();
      el.classList.remove("is-open", "is-shown", "is-narrow");
    };
  });
})();
