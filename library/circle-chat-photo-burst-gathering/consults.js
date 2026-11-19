// Booking calendar, two months — past and full days show a dash, picking one opens the application window in 0.4s (original jQuery fadeIn default)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  // Like the original, draw this month and next — past days show ‹ー›, some days are full
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = now.getDate();
  const holidays = { "0-1": 1, "1-11": 1, "4-3": 1, "4-5": 1, "8-23": 1, "9-12": 1, "10-3": 1, "10-23": 1 };
  const full = { 25: 1, 26: 1 };

  const month = (y0, m0) => {
    const y = y0 + Math.floor(m0 / 12), m = m0 % 12;
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    let cells = Array(first).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));
    while (cells.length % 7) cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    const body = rows.map((r) => `<tr>${r.map((d) => {
      if (!d) return "<td>&nbsp;</td>";
      const key = `${m}-${d}`;
      const past = m === base.getMonth() && y === base.getFullYear() && d < today;
      const cls = holidays[key] ? ' class="holiday"' : "";
      const off = past || (full[d] && m !== base.getMonth()) ? " disabled" : "";
      return `<td${cls}><button class="cs-date" type="button"${off} data-date="${m + 1}Month ${d}Day" data-set="${y}-${m + 1}-${d}">${d}</button></td>`;
    }).join("")}</tr>`).join("");
    return `<section class="cs-month"><h3 class="cs-month__title sr-en"><small>${MONTHS[m]}</small><span>${m + 1}</span></h3>
      <table class="cs-table"><thead><tr>${DOW.map((d) => `<th>${d}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></section>`;
  };
  document.querySelectorAll("[data-cal]").forEach((el) => {
    el.innerHTML = month(base.getFullYear(), base.getMonth()) + month(base.getFullYear(), base.getMonth() + 1);
  });

  const modal = document.querySelector("[data-entry]");
  const dateEl = modal.querySelector("[data-entry-date]");
  const form = modal.querySelector("[data-entry-form]"), tel = modal.querySelector("[data-entry-tel]");
  const show = (txt, set) => {
    // Original: if the chosen day is later than tomorrow, show the request form, otherwise show phone guidance
    const [y, m, d] = set.split("-").map(Number);
    const soon = new Date(y, m - 1, d) <= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    form.hidden = soon;
    tel.hidden = !soon;
    dateEl.textContent = txt;
    modal.hidden = false;
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.4, ease: "sine.inOut" });
  };
  const hide = () => gsap.to(modal, { opacity: 0, duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => { modal.hidden = true; } });
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".cs-date:not([disabled])");
    if (b) show(b.dataset.date, b.dataset.set);
    if (e.target.closest("[data-entry-close]")) hide();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) hide(); });
})();
