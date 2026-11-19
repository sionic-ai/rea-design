// Job list filtering — search text, department picker, remote option and brand chips stack together, and the remaining posting count is recounted in the strip and department headers. Only a few show at first and ”Show more” expands the list
(() => {
  const bar = document.querySelector(".bx-filter");
  if (!bar) return;
  const depts = [...document.querySelectorAll(".bx-dept")];
  const jobs = [...document.querySelectorAll(".bx-job")];
  const q = bar.querySelector(".bx-filter__search input");
  const remote = bar.querySelector(".bx-toggle__input");
  const chips = [...bar.querySelectorAll(".bx-chip")];
  const teamMenu = bar.querySelector('.bx-select[data-kind="team"] .bx-select__menu');
  const more = document.querySelector(".bx-more");
  const STEP = 12;
  let limit = STEP;

  depts.forEach((d, i) => {
    const l = document.createElement("label");
    l.innerHTML = `<span></span><input type="checkbox" value="${i}">`;
    l.firstChild.textContent = d.querySelector("h2").textContent;
    teamMenu.append(l);
  });

  const apply = () => {
    const words = q.value.trim().toLowerCase();
    const teams = [...teamMenu.querySelectorAll("input:checked")].map((x) => x.value);
    const brands = chips.filter((c) => c.getAttribute("aria-pressed") === "true").map((c) => c.dataset.brand);
    let shown = 0, total = 0;
    depts.forEach((d) => {
      let n = 0;
      d.querySelectorAll(".bx-job").forEach((j) => {
        const ok = (!words || j.textContent.toLowerCase().includes(words))
          && (!teams.length || teams.includes(d.dataset.team))
          && (!brands.length || brands.includes(j.dataset.brand))
          && (!remote.checked || j.dataset.remote === "true");
        if (ok) total++;
        const vis = ok && shown < limit;
        if (vis) { shown++; n++; }
        j.hidden = !vis;
      });
      d.hidden = n === 0;
      d.querySelector(".bx-dept__n").textContent = n;
    });
    bar.querySelector(".bx-filter__n").textContent = total;
    document.querySelector(".bx-rc-hero__btn .bx-btn__text").firstChild.textContent = `${total} Open Jobs `;
    document.querySelector(".bx-jobs__empty").hidden = total > 0;
    more.querySelector(".bx-more__shown").textContent = shown;
    more.querySelector(".bx-more__all").textContent = total;
    more.querySelector(".bx-more__btn").hidden = shown >= total;
  };

  q.addEventListener("input", () => { limit = STEP; apply(); });
  remote.addEventListener("change", () => { limit = STEP; apply(); });
  teamMenu.addEventListener("change", () => { limit = STEP; apply(); });
  chips.forEach((c) => c.addEventListener("click", () => {
    c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true"));
    limit = STEP; apply();
  }));
  bar.querySelector(".bx-filter__reset").addEventListener("click", () => {
    q.value = ""; remote.checked = false;
    teamMenu.querySelectorAll("input").forEach((x) => (x.checked = false));
    chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
    limit = STEP; apply();
  });
  more.querySelector(".bx-more__btn").addEventListener("click", () => { limit += STEP; apply(); });

  // Select dropdown — only one open at a time, click outside to close
  const selects = [...bar.querySelectorAll(".bx-select")];
  const close = (except) => selects.forEach((s) => {
    if (s === except) return;
    s.querySelector(".bx-select__btn").setAttribute("aria-expanded", "false");
    s.querySelector(".bx-select__menu").classList.remove("is-open");
  });
  selects.forEach((s) => s.querySelector(".bx-select__btn").addEventListener("click", () => {
    const btn = s.querySelector(".bx-select__btn");
    const on = btn.getAttribute("aria-expanded") !== "true";
    close(s);
    btn.setAttribute("aria-expanded", String(on));
    s.querySelector(".bx-select__menu").classList.toggle("is-open", on);
  }));
  document.addEventListener("click", (e) => { if (!e.target.closest(".bx-select")) close(); });

  bar.querySelector(".bx-filter__toggle").addEventListener("click", (e) => {
    const on = bar.classList.toggle("is-open");
    e.currentTarget.setAttribute("aria-expanded", String(on));
  });

  apply();
})();
