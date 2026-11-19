// Booking — flip months, tap a day to show that day’s time slots, tap a time and ‹Confirm› slides out beside it (same flow as the original booking widget)
(() => {
  const cal = document.querySelector("[data-cal]");
  if (!cal) return;
  const days = cal.querySelector("[data-cal-days]"), title = cal.querySelector("[data-cal-title]"), dayLabel = cal.querySelector("[data-cal-day]"), slots = cal.querySelector("[data-cal-slots]");
  let view = new Date(2026, 9, 1), fmt = 24;
  const open = (d) => d.getDay() > 0 && d.getDay() < 6 && d >= new Date(2026, 9, 20);
  const draw = () => {
    title.textContent = `${view.getFullYear()}Year ${view.getMonth() + 1}Month`;
    const first = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    const n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let h = "";
    for (let i = 0; i < first; i++) h += "<span></span>";
    for (let d = 1; d <= n; d++) {
      const dt = new Date(view.getFullYear(), view.getMonth(), d);
      h += open(dt) ? `<button type="button" aria-pressed="false" data-d="${d}">${d}</button>` : `<span>${d}</span>`;
    }
    days.innerHTML = h;
  };
  const time = (m) => { const hh = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0"); return fmt === 24 ? `${hh}:${mm}` : `${((hh + 11) % 12) + 1}:${mm}${hh < 12 ? "am" : "pm"}`; };
  let picked = null;
  const drawSlots = () => {
    if (!picked) { slots.innerHTML = ""; return; }
    const list = [];
    for (let m = 9 * 60; m <= 17 * 60 + 30; m += 15) list.push(m);
    slots.innerHTML = list.map((m) => `<div class="c-slot"><button type="button">${time(m)}</button><button type="button" class="is-go">Confirm</button></div>`).join("");
  };
  days.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-d]"); if (!b) return;
    days.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    picked = +b.dataset.d;
    dayLabel.textContent = `${view.getMonth() + 1}Month ${picked}Day`;
    drawSlots();
  });
  slots.addEventListener("click", (e) => {
    const row = e.target.closest(".c-slot"); if (!row) return;
    slots.querySelectorAll(".c-slot").forEach((r) => r.classList.toggle("is-picked", r === row && !row.classList.contains("is-picked")));
  });
  cal.querySelector("[data-cal-prev]").addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); picked = null; draw(); drawSlots(); });
  cal.querySelector("[data-cal-next]").addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); picked = null; draw(); drawSlots(); });
  cal.querySelectorAll("[data-fmt]").forEach((b) => b.addEventListener("click", () => { fmt = +b.dataset.fmt; cal.querySelectorAll("[data-fmt]").forEach((x) => x.setAttribute("aria-pressed", x === b)); drawSlots(); }));
  draw();
  const first = days.querySelector("button[data-d]");
  if (first) first.click();
})();
