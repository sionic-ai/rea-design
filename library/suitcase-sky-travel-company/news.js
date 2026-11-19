// Ten News rows — photo 30% · text 65%
(() => {
  const box = document.querySelector("[data-news]");
  if (!box) return;
  const photos = ["Person holding a puppy · Seaside · 3:2", "Seminar notice banner · teal · 3:2", "Event poster · Night · 3:2", "Old street scene · daytime · 3:2", "Discount notice banner · 3:2", "Interviewee · office · 3:2", "Expo illustration · 3:2", "Survey results table · 3:2", "Island sea · clear daytime · 3:2", "Two people smiling · indoors · 3:2"];
  box.innerHTML = photos
    .map((p, i) => `
<article data-fx="wipe-through-hover"><a href="news.html">
  <figure><div class="kk-ph"><div class="wf-img" data-label="${p}"></div></div></figure>
  <div class="kk-list__info">
    <h2>${i % 3 === 0 ? "News title about one and a half lines long. The second line continues here" : "Your one-line news title goes here"}</h2>
    <p>Your two-line News summary here. Your following text here. Your following text here. Your closing text…</p>
    <div class="kk-list__sub"><ul class="kk-list__cat"><li>Category</li>${i % 2 ? "" : "<li>Category Two</li>"}</ul><time>0000.00.00</time></div>
  </div>
</a></article>`)
    .join("");
})();
