// Section-level interaction for Brand subpages — reproduces the original Next component behavior as is: timeline video overlay, executive intro panel, pill filter, load more
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Timeline Watch video — a black curtain (.92) turns on in .16s, closed by the close button or Esc
  const box = $(".jt__lightbox");
  if (box) {
    const close = () => { box.hidden = true; document.body.style.overflow = ""; };
    $$("[data-video]").forEach((b) => b.addEventListener("click", () => { box.hidden = false; document.body.style.overflow = "hidden"; $(".jt__close", box).focus(); }));
    $(".jt__close", box).addEventListener("click", close);
    box.addEventListener("click", (e) => e.target === box && close());
    addEventListener("keydown", (e) => e.key === "Escape" && !box.hidden && close());
  }

  // Executive plus — puts a bio panel below that row (original team__bio-item: grid-column 1/-1, .2s ease-out fade). Only one open at a time
  const grid = $(".tm__grid");
  if (grid) {
    let open = null;
    const shut = () => { if (!open) return; open.btn.setAttribute("aria-expanded", "false"); open.btn.textContent = "+"; open.el.remove(); open = null; };
    $$(".tm__toggle", grid).forEach((btn) => btn.addEventListener("click", () => {
      const same = open && open.btn === btn;
      shut();
      if (same) return;
      const member = btn.closest(".tm__member");
      const name = $(".tm__name", member).textContent;
      const el = document.createElement("li");
      el.className = "tm__bio";
      el.innerHTML = `<button type="button" aria-label="Close">×</button><div><h3>${name}</h3><p>Your job title here</p></div><p>Your executive introduction here in two columns, about six lines. A spot for what they have done, what they handle now, and what experience they brought. End the second paragraph with one personal line.</p>`;
      // Insert after the last cell in the same row
      const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      const members = $$(".tm__member", grid), idx = members.indexOf(member);
      const last = members[Math.min(members.length - 1, Math.floor(idx / cols) * cols + cols - 1)];
      last.after(el);
      btn.setAttribute("aria-expanded", "true"); btn.textContent = "−";
      $("button", el).addEventListener("click", shut);
      open = { btn, el };
    }));
    addEventListener("keydown", (e) => e.key === "Escape" && shut());
  }

  // Pill filter — only the chosen pill gets a black fill, and only rows with matching tags remain
  $$("[data-filter]").forEach((bar) => {
    const list = $(bar.dataset.filter);
    if (!list) return;
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-tag]");
      if (!b || b.disabled) return;
      $$("button[data-tag]", bar).forEach((x) => x.classList.toggle("is-on", x === b));
      const tag = b.dataset.tag;
      [...list.children].forEach((li) => (li.hidden = tag !== "all" && li.dataset.tags !== tag));
    });
  });

  // Sort — in the original each press flips newest↔oldest, changing the text and arrow and reversing the card order
  const sort = $(".nc__sort");
  if (sort) sort.addEventListener("click", () => {
    const latest = sort.textContent.includes("latest");
    sort.textContent = latest ? "Sort: oldest ↑" : "Sort: latest ↓";
    const g = $(".nc__grid");
    if (g) [...g.children].reverse().forEach((c) => g.append(c));
  });

  // Load more — the original loads six more at a time. The copy pastes the first three rows
  const more = $(".nc__more-btn"), ncg = $(".nc__grid");
  if (more && ncg) more.addEventListener("click", () => {
    $$(".nc__card", ncg).slice(0, 3).forEach((c) => ncg.append(c.cloneNode(true)));
  });
})();
