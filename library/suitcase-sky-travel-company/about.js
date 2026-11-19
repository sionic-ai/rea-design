// Four About menu cards — same notched-corner card frame as the expand panel and Contact panel
(() => {
  const { card } = window.kkParts;
  const list = document.querySelector("[data-amenu]");
  if (!list) return;
  list.innerHTML = [
    ["Company logo panel · white background · landscape", "MISSION", "What we do"],
    ["Staff group photo · office · landscape", "COMPANY", "Address · Founded"],
    ["CEO half-body · outdoor greenery · landscape", "MESSAGE", "Message from the CEO"],
    ["Phone app screen · teal panel · landscape", "LOCAL BRANCH", "About branch"],
  ].map(([l, en, ja]) => `<li>${card("about.html", l, en, ja, true)}</li>`).join("");
})();
