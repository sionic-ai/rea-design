// Subpage shared — tag row (tapping TAGS at 1020px or below collapses it in .4s), list card fill (Types like Features·News)
(() => {
  const TAGS = ["SNAP", "VINTAGE", "SHOES", "TRAVEL", "FOOD", "LIFE STYLE", "HOROSCOPE", "PRE-FALL", "MOVIE", "TOGA", "Denim", "BRAND", "NAIL", "HAIR ACCESSORIES", "KNIT", "SWIMWEAR", "BAG", "EYEWEAR", "RUNNING", "FISHING"];
  const arrow = '<svg viewBox="0 0 11 10" aria-hidden="true"><path d="M1 8.5 5.5 2 10 8.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  document.querySelectorAll("[data-gh-taglist]").forEach((box) => {
    box.innerHTML = `<p class="gh-taglist__ttl gh-latin">TAGS${arrow}</p><div class="gh-taglist__box">${TAGS.map((t) => `<a href="list.html">${t}</a>`).join("")}</div>`;
    const ttl = box.firstElementChild, tags = ttl.nextElementSibling;
    // Original records the open height after load, and a click toggles between 0 ↔ that height (transition all .4s ease)
    const fit = () => { if (innerWidth <= 1020 && !ttl.classList.contains("is-closed")) tags.style.height = `${tags.scrollHeight}px`; };
    addEventListener("load", fit);
    fit();
    ttl.addEventListener("click", () => {
      if (innerWidth > 1020) return;
      const close = ttl.classList.toggle("is-closed");
      tags.style.height = close ? "0px" : `${tags.scrollHeight}px`;
    });
  });

  // Feature list — most photos are portrait, a few cells are polaroid or poster type
  const FEATURE = [
    ["A time to face yourself with mindfulness. We attended a meditation event!", "Two people sweeping their hair back · purple tops · dim indoor light", "2026.11.13", 1],
    ["Want to know more!<br>How haute couture under a designer’s name comes to life.", "Hand sewing a sky-blue knit · safety pin · window light", "2026.11.12", 1],
    ["Snaps of stylish friends<br>No.085 Name", "ID photo in front of white wall · front flash", "2026.11.10", 1, "poly"],
    ["Everything revealed! Morning Event vol.7 takes place on Saturday, November 7.", "Event poster art · Red line sun and running person · Mint background", "2026.11.06"],
    ["Local address book<br>“Shop Name” vol.01", "Speakers and display cases in an old shop with a blue sign · daytime", "2026.11.05"],
    ["Snaps of stylish friends<br>No.084 Name", "Short-hair ID portrait · gray hoodie · front flash", "2026.11.03", 0, "poly"],
    ["Follow the words and discover who you are.", "Full-body person standing before a bookshelf · green knit · bright room", "2026.11.03"],
    ["The new brand you want to know now!<br>― BRAND ―", "Still life of blue knit and magazine layered, shot from above", "2026.10.31"],
    ["Music by Artist Name, revealing what is ”just as it is.”", "Bob-haircut person upper body at window · striped cardigan", "2026.10.28"],
    ["Holiday gifts from the Brand name again this year.", "Three perfume bottles and a gift box · cream fabric · soft light", "2026.10.23"],
    ["Want to know more about the film we’re screening? A club for talking it over. No.127 ‹Film Title›", "Two movie scenes inside a film strip border · night street", "2026.10.21"],
    ["Your two-line article title goes here. It runs on to the second line.", "Person walking an autumn forest path from behind · daytime · backlit", "2026.10.20"],
    ["Music by Artist Name, revealing what is ”just as it is.”", "Upper body of a bob-haircut person standing by the window · checked shirt", "2026.10.19"],
    ["Snaps of stylish friends<br>No.082 Name", "Curly-haired ID photo · front flash", "2026.10.17", 0, "poly"],
    ["Holiday gifts from the Brand name again this year.", "Perfume bottle and box, two shots stacked · cream fabric", "2026.10.15"],
    ["I want to know more about the movies now showing! No.126 『Movie Title』", "Night street scene inside a film strip border", "2026.10.14"],
    ["Snaps of stylish friends<br>No.081 Name", "Short-haired person ID photo · white wall", "2026.10.10", 0, "poly"],
    ["Your two-line article title goes here. It runs on to the second line.", "Upper body of person in mesh knit · indoors", "2026.10.08"],
    ["Add an article title here in one line.", "Still life of several striped knits laid out · top view", "2026.10.06"],
    ["Snaps of stylish friends<br>No.080 Name", "ID photo of person with glasses · white wall", "2026.10.03", 0, "poly"],
    ["Local address book<br>“Shop Name” vol.00", "Alley shop sign · daytime", "2026.10.01"],
    ["Follow the words and discover who you are.", "Person in profile at a desk · window light", "2026.09.29"],
    ["The new brand you want to know now!<br>― BRAND ―", "Bag and hat still life · white background", "2026.09.26"],
    ["Snaps of stylish friends<br>No.079 Name", "Single portrait ID photo · front flash", "2026.09.24", 0, "poly"],
  ];
  const NEWS = [
    ["Brand name / A Brand name pop-up opens at a department store", "Black-and-white pop-up event poster · model in an embroidered jacket, upper body", "2026.11.13", 1],
    ["A hat shop opens a new store themed ”Classic”", "Curtains and display cases in a dark shop · warm lighting", "2026.11.13", 1],
    ["Brand × Brand collab part 2, featuring leather goods", "Burgundy leather wallet still life · dark backdrop", "2026.11.13", 1],
    ["The brand collaborates with a film! The movie’s world retold through craft.", "Small doll and craft items in a glass jar · bright still life", "2026.11.12", 1],
    ["A new scent born from plants. The fragrance brand is coming to your country!", "Three brown pump bottles on a round tray · brown still life", "2026.11.11", 1],
    ["Your news title in one line goes here", "Pair of white sneakers · gray backdrop · top view", "2026.11.10"],
    ["Your news title in two lines. It continues through the second line", "New bag product cutout · white background · front", "2026.11.10"],
    ["Your news title in one line goes here", "Gallery entrance and poster · daytime", "2026.11.09"],
    ["Your news title in two lines. It continues through the second line", "Three lipsticks still life · pink background", "2026.11.08"],
    ["Your news title in one line goes here", "Cake and coffee on a café table · window light", "2026.11.07"],
    ["Your news title in two lines. It continues through the second line", "Heart-shaped prop still life · White background", "2026.11.06"],
    ["Your news title in one line goes here", "Person in a white dress, upper body · bright interior", "2026.11.06"],
    ["Your news title in two lines. It continues through the second line", "Row of red heart cushions · white background", "2026.11.05"],
    ["Your news title in one line goes here", "Large park tree · clear daytime", "2026.11.05"],
    ["Your news title in two lines. It continues through the second line", "Two pairs of sneakers still life · gray background", "2026.11.04"],
    ["Your news title in one line goes here", "Perfume bottle and blue box · Top view", "2026.11.04"],
    ["Your news title in two lines. It continues through the second line", "Checkered board game and hands · red background", "2026.11.03"],
    ["Your news title in one line goes here", "Full-length person in checked shirt · white wall", "2026.11.03"],
    ["Your news title in one line goes here", "White sneaker side view · Gray background", "2026.11.02"],
    ["Your news title in two lines. It continues through the second line", "Magazine spread · Top view", "2026.11.02"],
    ["Your news title in one line goes here", "Chessboard-pattern bag · red background", "2026.11.01"],
    ["Your news title in two lines. It continues through the second line", "Full-length person in a cap · white wall", "2026.11.01"],
  ];
  const sticker = `<span class="gh-sticker" aria-hidden="true">＿人人人人人人人人人人人＿
› Snaps of stylish friends ‹
￣Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^￣<small>&lt;FASHION LOVER SNAP&gt;</small></span>`;
  const card = ([title, pic, date, fresh, kind], href, shape) => `<li><a class="gh-card" href="${href}">${
    kind === "poly"
      ? `<span class="gh-card__img is-poly"><span class="gh-polaroid"><span class="gh-ph"><span class="wf-img" data-label="${pic} · Polaroid · square"></span></span>${sticker}</span></span>`
      : `<span class="gh-card__img gh-ph"><span class="wf-img" data-label="${pic} · ${shape}"></span></span>`
  }<h2 class="gh-card__title">${title}</h2><p class="gh-card__date">${date}${fresh ? '<span class="gh-new">new</span>' : ""}</p></a></li>`;
  document.querySelectorAll("[data-gh-list]").forEach((ul) => {
    const news = ul.dataset.ghList === "news";
    ul.innerHTML = (news ? NEWS : FEATURE).map((d) => card(d, news ? "article-news.html" : "article.html", news ? "Landscape 3:2" : "Vertical 3:4")).join("");
  });
})();
