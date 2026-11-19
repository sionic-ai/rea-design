// Same order as the original tab.js — the old panel drops is-visible after 10ms (fades out over .5s) and is hidden 250ms later, the new panel is unhidden and gets is-visible 10ms after
document.querySelectorAll(".js-tablist").forEach((tabList) => {
  const tabs = tabList.querySelectorAll(".js-tab");
  const panels = tabList.closest(".js-tablist").parentNode.querySelectorAll(".js-tabpanel");
  const activate = (newTab) => {
    tabs.forEach((tab) => {
      const on = tab === newTab;
      tab.setAttribute("aria-selected", on);
      tab.setAttribute("tabindex", on ? "0" : "-1");
    });
    panels.forEach((panel) => {
      if (panel.hidden) return;
      setTimeout(() => {
        panel.classList.remove("is-visible");
        setTimeout(() => (panel.hidden = true), 250);
      }, 10);
    });
    const next = document.getElementById(newTab.getAttribute("aria-controls"));
    if (next) {
      next.hidden = false;
      setTimeout(() => next.classList.add("is-visible"), 10);
    }
    newTab.focus();
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));
  tabList.addEventListener("keydown", (e) => {
    const i = [...tabs].indexOf(document.activeElement);
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    else return;
    e.preventDefault();
    tabs[n].focus();
  });
});

// Original common.js client masonry — two Macy columns, gap data-margin-x/y(22), two columns at 1000 and below, 22px at 768 and below, one column at 540 and below
document.querySelectorAll(".js-guest-list").forEach((list) => {
  if (!window.Macy) return;
  const columns = parseInt(list.dataset.column, 10) || 3;
  const mx = parseInt(list.dataset.marginX, 10) || 50;
  const my = parseInt(list.dataset.marginY, 10) || 50;
  new Macy({
    container: list,
    trueOrder: false,
    waitForImages: false,
    useOwnImageLoader: false,
    margin: { x: mx, y: my },
    columns,
    breakAt: { 1000: { columns: 2, margin: { x: mx, y: my } }, 768: { columns: 2, margin: { x: 22, y: 22 } }, 540: { columns: 1 } },
  });
});
