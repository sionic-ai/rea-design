// Careers — six guideline cards, three culture posts, a numbers panel and four interview cards stamped from the same frame
(() => {
  const { ARROW } = window.kkParts;
  const $ = (s) => document.querySelector(s);
  const vals = ["Value Name 01", "Value Name 02", "Value Name 03", "Value Name 04", "Value Name 05", "A Longer Value Name 06"];
  const valPh = ["Staff at laptop · 3:2", "Employee thinking · 3:2", "Walking staff · 3:2", "Staff member presenting · 3:2", "Meeting scene · 3:2", "Smiling staff · 3:2"];
  if ($("[data-values]")) $("[data-values]").innerHTML = vals.map((v, i) => `
<li><figure><div class="kk-ph"><div class="wf-img" data-label="${valPh[i]}"></div></div></figure>
<div class="kk-recvalue__en" data-label="Your guideline English name here"><span>${v}</span></div>
<div class="kk-recvalue__text"><h3>Your guideline name here</h3><p>Your text explaining the guidelines goes here.<br>Your second line goes here. Your third line goes here.</p></div></li>`).join("");
  if ($("[data-culture]")) $("[data-culture]").innerHTML = ["Office conversation scene · by the window · 3:2", "In front of the meeting room screen · 3:2", "Laptop on a desk · 3:2"].map((p, i) => `
<li><figure><div class="kk-ph"><div class="wf-img" data-label="${p}"></div></div></figure>
<div class="kk-recculture__text"><h3>Your culture $ here{i + 1} <small data-label="Your one-line English culture name here">Short English Label</small></h3><p>Here goes the body explaining the culture. Continued text goes here. Continued text goes here. Closing text goes here.</p><p>Here goes a short English paragraph placeholder of three lines for the culture item text.</p></div></li>`).join("");
  const charts = [[["Item A", 50], ["Item B", 50]], [["Item A", 42.3], ["Item B", 57.7]], [["Item A", 32.7], ["Item B", 67.3]], [["Item A", 50], ["Item B", 48.1], ["Item C", 1.9]]];
  if ($("[data-charts]")) $("[data-charts]").innerHTML = charts.map((c) => `
<li class="kk-recdata__item"><h4>Your one-line question here?</h4>${c.map(([n, v]) => `<div class="kk-recdata__chart"><div class="kk-recdata__left"><div class="kk-recdata__ico wf-img" data-label=""></div><div class="kk-recdata__bar" style="width:${Math.max(v, 8)}%"><span>${n}</span></div></div><div class="kk-recdata__right">${v}<small>%</small></div></div>`).join("")}</li>`).join("");
  if ($("[data-ranks]")) $("[data-ranks]").innerHTML = [0, 1, 2, 3, 4].map((i) => `
<li class="kk-recdata__item${i === 4 ? " is-large" : ""}"><h4>Your one-line question here?</h4><div class="kk-recdata__rank">${[1, 2, 3].map((r) => `<div><b>${r}<small>Above</small></b><span>Your answer $ here{r}</span></div>`).join("")}</div><div class="kk-recdata__mtr wf-img" data-label="Picture"></div></li>`).join("");
  if ($("[data-interviews]")) $("[data-interviews]").innerHTML = ["Family on amusement park ride · landscape", "Staff in front of logo wall · landscape", "Person in front of a city night view · landscape", "Alley market · landscape"].map((p) => `
<article class="kk-pickcard"><a href="news.html">
  <div class="kk-card"><div class="kk-card__in"><div class="kk-card__img is-bite"><div class="kk-card__ph"><div class="wf-img" data-label="${p}"></div></div></div><div class="kk-card__icon">${ARROW}</div></div></div>
  <p class="kk-pickcard__title">Your interview title here in about two lines. The piece runs on to the second line</p>
  <p class="kk-pickcard__ex">Three lines of interview summary here. Continuing text here. Ending text here…</p>
  <div class="kk-info"><span>Staff Interview</span><time>0000.00.00</time></div>
</a></article>`).join("");
})();
