// Subpage: blog topic and search filtering, history tabs, step picker, strikethrough of deleted words, terminal typing, read-more advance, post table of contents tracking
(() => {
  const { reduced } = AG;

  // ───── Blog — pick one topic, filter titles by the search text
  const topics = document.querySelector(".ag-topics");
  if (topics) {
    const rows = [...document.querySelectorAll(".ag-row[data-topic]")], search = document.querySelector(".ag-search input");
    let topic = "Entire";
    const apply = () => {
      const q = search.value.trim();
      rows.forEach((r) => (r.hidden = (topic !== "Entire" && r.dataset.topic !== topic) || (q && !r.textContent.includes(q))));
      ScrollTrigger.refresh();
    };
    topics.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      topics.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      topic = b.dataset.topic;
      apply();
    });
    search.addEventListener("input", apply);
  }

  // ───── History — click a year and the right card jumps to that period (.5s rise)
  const years = document.querySelector(".ag-years");
  if (years) {
    const card = document.querySelector(".ag-era");
    years.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.getAttribute("aria-selected") === "true") return;
      years.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      const i = +b.dataset.era;
      card.querySelector("[data-era-num]").textContent = String(i + 1).padStart(2, "0");
      card.querySelector("[data-era-name]").textContent = b.querySelector("small").textContent;
      card.querySelector("[data-era-title]").textContent = `$ here{b.querySelector("small").textContent} One-line title for the period`;
      if (!reduced) gsap.fromTo(card.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: AG.ease("0.16,1,0.3,1") });
    });
  }

  // ───── Steps — the clicked step fills in
  document.querySelectorAll("[data-steps]").forEach((list) => list.addEventListener("click", (e) => {
    const b = e.target.closest(".ag-step");
    if (!b) return;
    list.querySelectorAll(".ag-step").forEach((x) => (x === b ? x.setAttribute("aria-current", "step") : x.removeAttribute("aria-current")));
  }));

  // ───── Struck-out word — when visible, the gradient line is drawn from the left (.8s)
  document.querySelectorAll("[data-strike]").forEach((el) => {
    if (reduced) return;
    el.style.setProperty("--strike", 0);
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(el, { "--strike": 1, duration: 0.8, delay: 0.4, ease: AG.ease("0.16,1,0.3,1") }) });
  });

  // ───── Terminal — when visible, the command is typed one character at a time and result lines follow
  const term = document.querySelector("[data-term]");
  if (term) {
    const lines = [["$ ", "plan --scope your-task-here"], ["  ", "✓ Scoped out · 0 risk"], ["$ ", "design --system"], ["  ", "✓ 00 components · 00 connections"], ["$ ", "ship --stage"], ["  ", "✓ Deployed"]];
    const type = async () => {
      term.innerHTML = "";
      for (const [p, t] of lines) {
        const row = document.createElement("div");
        row.innerHTML = `<span>${p}</span><b></b>`;
        term.appendChild(row);
        const b = row.querySelector("b");
        for (const ch of t) { b.textContent += ch; await new Promise((r) => setTimeout(r, reduced ? 0 : 28)); }
        await new Promise((r) => setTimeout(r, reduced ? 0 : 260));
      }
      term.insertAdjacentHTML("beforeend", '<span class="ag-term__cursor" aria-hidden="true"></span>');
    };
    ScrollTrigger.create({ trigger: term, start: "top 85%", once: true, onEnter: type });
  }

  // ───── More to read — flip the card strip one at a time
  const more = document.querySelector("[data-more]");
  if (more && window.AG_POSTS) {
    more.innerHTML = window.AG_POSTS.slice(1, 7).map(([t, tag]) => `<a class="ag-post" href="article.html"><div class="ag-post__head"><p class="ag-kicker" style="color:var(--kf-dim)">Serial</p><h3 class="ag-post__title">${t}</h3><p class="ag-post__ex">Add a two-line article summary here.</p></div><div class="ag-post__foot"><span class="ag-pill">${tag}</span><span class="ag-post__meta"><span>00/00 · 0 min</span></span></div></a>`).join("");
    document.querySelectorAll(".ag-more__arrows button").forEach((b) => b.addEventListener("click", () => {
      const step = more.firstElementChild.getBoundingClientRect().width + 16;
      more.scrollBy({ left: +b.dataset.dir * step, behavior: reduced ? "auto" : "smooth" });
    }));
  }

  // ───── Article table of contents — the row for the section crossing the screen center is highlighted
  const toc = document.querySelector(".ag-toc");
  if (toc) {
    const links = [...toc.querySelectorAll("a")];
    links.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 50%", end: () => `+=${Math.max(1, (sec.nextElementSibling?.offsetTop ?? sec.offsetTop + 400) - sec.offsetTop)}`, onToggle: (st) => { if (st.isActive) links.forEach((x) => (x === a ? x.setAttribute("aria-current", "true") : x.removeAttribute("aria-current"))); } });
      a.addEventListener("click", (e) => { e.preventDefault(); AG.lenis ? AG.lenis.scrollTo(sec, { offset: -32 }) : sec.scrollIntoView({ behavior: "smooth" }); });
    });
  }
})();
