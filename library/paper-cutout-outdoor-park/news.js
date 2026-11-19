// Notifications: fill twelve slots of news, and the URL’s ?cate= Turns on category buttons to filter the list (the original moves to a section of the same type per category).
(() => {
  const items = [
    ["notice", "[00 News] A two-line seasonal walk news title goes here", "Bird flying over a lake · autumn mountain · landscape 4:3", 1],
    ["notice", "【00 News】 Your autumn food news headline goes here", "Calm lake and mountains · daytime · landscape 4:3"],
    ["event", "0/0/0000 ~ 0 Enter the outdoor play event title here", "Food event poster illustration · landscape 4:3"],
    ["event", "Your two-line seasonal experience event title here", "Child enjoying a forest activity · daytime · horizontal 4:3", 1],
    ["event", "Your forest adventure event title here", "Tightrope walkers · forest · landscape 4:3"],
    ["important", "【Important】 Your business change notice title goes here.", "Tiled-roof lodging front · daytime · landscape 4:3"],
    ["notice", "Your autumn mountain news title goes here", "Mountain under a blue sky · daytime · landscape 4:3"],
    ["event", "Headline for the news that the water play area is open.", "Water park signboard art · landscape 4:3"],
    ["notice", "Your event entry news title goes here", "Two staff members commemorative photo · indoor · landscape 4:3"],
    ["notice", "Your seasonal scenery news title here", "Cloudy mountain ridge · landscape 4:3"],
    ["event", "Your summer festival news title goes here.", "Lakeside festival sign · daytime · landscape 4:3"],
    ["event", "Your kids’ play event title goes here.", "Children running on lawn · daytime · landscape 4:3"],
  ];
  const label = { event: "Event", notice: "Notice", important: "Important" };
  const cate = new URLSearchParams(location.search).get("cate") || "";
  document.querySelectorAll(".nw-cate__link").forEach((a) => a.classList.toggle("is-current", a.dataset.cate === cate));
  document.querySelector("[data-news]").innerHTML = items.filter(([c]) => !cate || c === cate).map(([c, t, ph, n]) =>
    `<li class="nw-item${n ? " is-new" : ""}"><a class="nw-item__link" href="#">
      <figure class="nw-item__img gp-ph"><div class="wf-img" data-label="${ph}"></div></figure>
      <div class="nw-item__in"><p class="nw-item__txt">${t}</p><p class="nw-item__meta"><span class="gp-en">2026.00.00</span><span class="nw-item__cate nw-item__cate--${c}">${label[c]}</span></p></div>
    </a>${n ? '<span class="nw-item__new gp-hand">New</span>' : ""}</li>`).join("");
})();
