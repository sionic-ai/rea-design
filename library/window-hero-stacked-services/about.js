(() => {
  // Four value rows — number cell · icon cell · English name + short Korean subtitle · description
  const list = document.querySelector("[data-values]");
  if (!list) return;
  const icons = [
    '<svg viewBox="0 0 54 54" fill="none" stroke="currentColor"><rect x="9" y="14" width="36" height="26"/><path d="M15 22h24M15 28h16"/></svg>',
    '<svg viewBox="0 0 54 54" fill="none" stroke="currentColor"><path d="M10 30c6-10 12-10 17 0 5-10 11-10 17 0"/><circle cx="27" cy="20" r="5"/></svg>',
    '<svg viewBox="0 0 54 54" fill="none" stroke="currentColor"><path d="M27 8v38M14 22l13-14 13 14"/></svg>',
    '<svg viewBox="0 0 54 54" fill="none" stroke="currentColor"><circle cx="18" cy="27" r="9"/><circle cx="36" cy="27" r="9"/><path d="M27 40v6"/></svg>',
  ];
  const rows = [
    ["Value Name One", "Your short subtitle here", "Put a roughly two-line sentence here about ownership — pushing things forward on your own without waiting for orders."],
    ["Value Two", "Your short subtitle here", "Your two lines go here, saying you deeply respect the makers, the region and your colleagues, and meet them with honesty."],
    ["Value Three", "Your short subtitle here", "About two lines here: to make meaningful change, break the familiar mold and rewrite yesterday’s answers yourself."],
    ["Value Name Four", "Your short subtitle here", "Your sentence here in about two lines — believing in possibility through any adversity and resounding as one."],
  ];
  list.innerHTML = rows.map(([t, s, p], i) => `
    <li class="vrow">
      <div class="vrow__left">
        <span class="vrow__no">${i + 1}</span>
        <span class="vrow__sp"><b>${t}</b><small>${s}</small></span>
        <span class="vrow__icon" data-label="Value ${i + 1} Icon · Line art">${icons[i]}</span>
      </div>
      <div class="vrow__body"><h3>${t}<small>${s}</small></h3><p>${p}</p></div>
    </li>`).join("");
})();
