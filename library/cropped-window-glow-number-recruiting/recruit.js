// Recruitment info tabs — only the pressed tab gets is-active and aria-selected, only its paired panel is shown and the rest are hidden. No transition motion (only the tab background color .32s)
(() => {
  const tabs = [...document.querySelectorAll('.ew-rc-req__tab-item[role="tab"]')];
  const panels = [...document.querySelectorAll('.ew-rc-req__category[role="tabpanel"]')];
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    const id = tab.getAttribute("aria-controls");
    tabs.forEach((t) => { t.classList.toggle("is-active", t === tab); t.setAttribute("aria-selected", String(t === tab)); });
    panels.forEach((p) => { p.hidden = p.id !== id; });
    window.ScrollTrigger?.refresh();
  }));
})();
