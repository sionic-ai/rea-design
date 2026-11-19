// One page’s content: Hero light rays (our line drawing), four service cards·three steps·column cards·company table·News filled with placeholders. Text·card entrances use _fx/fade-up (5vh · .5s power2.out · 95% · reverses)
(() => {
  // Light rays — the original is a purple line drawing (svg file) fanning upward from the lens vertex. Redrawn fresh in the same place and texture
  const rays = document.querySelector("[data-rays]");
  if (rays) {
    let s = '<path d="M-260 0 H1260 L500 600 Z" fill="var(--kf-ink)" fill-opacity=".06"/>';
    for (let i = 0; i <= 26; i++) s += `<line x1="500" y1="600" x2="${-260 + (1520 / 26) * i}" y2="0" stroke="var(--kf-ink)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    rays.innerHTML = s;
  }

  const fade = 'data-fx="fade-up" data-fx-fade-up="y: 5vh; duration: 0.5; ease: power2.out; start: top 95%; back: on"';
  const ICON = {
    nodes: '<svg class="mc-card__icon" viewBox="0 0 84 60" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 22 50 14l14 26-36 8z"/><circle cx="14" cy="22" r="6" fill="var(--kf-surface)"/><circle cx="50" cy="14" r="6" fill="var(--kf-surface)"/><circle cx="64" cy="40" r="6" fill="var(--kf-surface)"/><circle cx="28" cy="48" r="6" fill="var(--kf-surface)"/></svg>',
    chart: '<svg class="mc-card__icon" viewBox="0 0 84 60" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4v50h70"/><path d="m16 46 54-28"/><circle cx="24" cy="42" r="3"/><circle cx="38" cy="34" r="3"/><circle cx="50" cy="30" r="3"/><circle cx="62" cy="22" r="3"/></svg>',
    bubbles: '<svg class="mc-card__icon" viewBox="0 0 84 60" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="16" r="7"/><circle cx="42" cy="34" r="5"/><circle cx="60" cy="18" r="8"/><circle cx="26" cy="46" r="4"/><circle cx="66" cy="46" r="5"/></svg>',
    funnel: '<svg class="mc-card__icon" viewBox="0 0 84 60" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h48L48 34v16l-12 6V34z"/><path d="M26 18h32"/></svg>',
  };
  const CARDS = [
    ["is-pink", "Your line on what is sought here", ICON.nodes, ["Display and promotion once run on gut and experience,", "Backed by purchase data"], 5, ["Sample target data", "Your three / four data types here"], ["Topic example", "Your one-line topic and a note here"]],
    ["is-green", "What you understand here", ICON.chart, ["A survey that only walked,", "Reorder by task order"], 4, ["Sample target data", "Data type three here"]],
    ["is-yellow", "What you organize here", ICON.bubbles, ["Free-text responses we couldn’t read in full,", "Turn it into the points to cover"], 5, ["Sample target data", "Data type four here"], ["Topic example", "Your topic line here"]],
    ["is-blue", "Your what-we-reveal line here", ICON.funnel, ["Scattered inflow data,", "Bundle it into one page to decide on in meetings"], 6, ["Sample target data", "Data type three here"]],
  ];
  const body = (n) => "Your explanation of what kind of analysis reveals what. ".repeat(Math.ceil(n / 1.6)).trim();
  const cards = document.querySelector("[data-cards]");
  if (cards) cards.innerHTML = CARDS.map(([cls, badge, icon, title, n, ...meta]) => `
    <article class="mc-card ${cls}" ${fade}>
      <span class="mc-card__badge">${badge}</span>${icon}
      <h3 class="mc-card__title">${title.map((t) => `<span>${t}</span>`).join("<br>")}</h3>
      <p class="mc-card__body">${body(n)}</p>
      <p class="mc-card__meta">${meta.map(([k, v]) => `<b>${k}</b>: ${v}`).join("<br>")}</p>
    </article>`).join("");

  const STEPS = [
    ["Break the challenge down into the business issues to be solved", "Preview what you can do with our data before you start"],
    ["Sorts out what the data you have shows and what it lacks", "Before spending big, you can judge whether it is a problem to solve with data"],
    ["Test hypotheses in short cycles and turn them into action items", "Goes beyond analysis to deliver work that leads to results"],
  ];
  const steps = document.querySelector("[data-steps]");
  if (steps) steps.innerHTML = STEPS.map(([h, m], i) => `
    <article class="mc-step" ${fade}>
      <div class="mc-step__num"><small>step</small><strong>${i + 1}</strong></div>
      <div class="mc-step__card"><h4>${h}</h4><p>Your three or so lines here on what happens at this stage. List listening, sharing and organizing in order, and close with what you hold in hand as a result. Keep sentences short and easy to read.</p><p class="mc-step__msg">${m}</p></div>
    </article>`).join("");

  const post = (d, tag, t) => `<article class="mc-post" ${fade}><a href="#column"><div class="mc-post__meta"><time>${d}</time><span class="mc-tag">${tag}</span></div><h4>${t}</h4></a></article>`;
  const POSTS = {
    pick: [["0000.00.00", "Corporate Case Studies", "Your column title here in two lines — Learning from real cases"], ["0000.00.00", "Analysis Request", "Your slightly long column title here in about three lines — the story of why things fail and a hypothesis."], ["0000.00.00", "Data design", "Your column title here in about two lines — things to think about before starting"]],
    new: [["0000.00.00", "Corporate Case Studies", "Your new column title goes here, about two lines — eight cases"], ["0000.00.00", "Data design", "Your new column title goes here in about two lines — before the tools"], ["0000.00.00", "Reading data", "Your new column title goes here in about two lines"]],
  };
  document.querySelectorAll("[data-posts]").forEach((el) => (el.innerHTML = (POSTS[el.dataset.posts] || []).map((p) => post(...p)).join("")));

  const ROWS = [["Company name", "Your company name here<small>One line with the rename date and former name</small>"], ["Representative", "Add name"], ["Address", "Your one-line address here"], ["Person", "Your executives and partners line here"], ["What we do", "One line on your business here"], ["Advisory attorney", "Your law office name here"]];
  const table = document.querySelector("[data-table]");
  if (table) table.innerHTML = ROWS.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  const NEWS = [["0000.00.00", "Notice", "Your short news line here"], ["0000.00.00", "Media", "Your one line on which media outlet featured you goes here"], ["0000.00.00", "Media", "Your slightly longer news here in about two lines — say where and with what content it was featured."]];
  const news = document.querySelector("[data-news]");
  if (news) news.innerHTML = NEWS.map(([d, t, s]) => `<li><time>${d}</time><span class="mc-tag">${t}</span><span>${s}</span></li>`).join("");
})();
