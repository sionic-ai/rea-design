// News section: 12 news cards — the original also repeats same-shaped cards in 3 columns. Only the photo types are mixed at the original ratio.
window.JD.view("news", (root) => {
  const kinds = [
    ["Character sticker notification art · green background · square", true, "Your news title here for up to three lines. Add more text here!"],
    ["Logo-only white image · Square", false, "【Notice】 Your news title, two lines"],
    ["Stamp card guide illustration · green · square", true, "【Starts 0000/0/0】 Your news headline here, three lines"],
    ["Course meal table setting · top-down · square", false, "【Reservations Open】 Your course name here (8 dishes)"],
    ["Course meal table setting · top-down · square", false, "【Reservations Open】 Your course name here (8 dishes)"],
    ["Course meal table setting · top-down · square", false, "【Reservations Open】 Your course name here (8 dishes)"],
    ["Event poster · red background with gold text · square", true, "Your one-line event title here ♪"],
    ["Another brand logo · white background · square", true, "【Notice】 Your news title here"],
    ["Thanksgiving event notice · large text on navy background · square", false, "Your thanksgiving festival title here"],
    ["Logo-only white image · Square", true, "Two lines here on holiday opening hours"],
    ["Stamp event graphic · square", true, "[Limited Quantity] Your event title here, up to three lines"],
    ["Opening announcement poster · red background · square", true, "Your new store opening news here, three lines"],
  ];
  root.querySelector(".ngrid").innerHTML = kinds.map(([label, chip, title]) =>
    `<a class="ncard fade-in" href="#"><div class="ncard__thumb"><div class="wf-img" data-label="${label}"></div></div><div class="ncard__meta">${chip ? '<span class="jd-chip">Notice</span>' : "<span></span>"}<time>0000.00.00</time></div><p class="ncard__cat">Your group · Brand name here</p><p class="ncard__title">${title}</p></a>`).join("");

  root.querySelectorAll(".tax__list").forEach((ul) => ul.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    ul.querySelector(".is-on")?.classList.remove("is-on");
    a.classList.add("is-on");
  }));
});
