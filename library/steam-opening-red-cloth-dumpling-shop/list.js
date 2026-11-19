// Store finder section: store cards share one shape so one frame stamps them all, and only the number of opening-hours lines varies, ragged like the original.
window.JD.view("list", (root) => {
  const hours = [
    [["Previous day", "00:00~00:00(L.O 00:00)"]],
    [["Mon~Thu", "Lunch 00:00~00:00\nDinner 00:00~00:00"], ["Fri and day before holidays", "Lunch 00:00~00:00\nDinner 00:00~00:00"], ["Sat·Sun·Holidays", "00:00~00:00"]],
    [["Weekday", "Lunch 00:00~00:00\nDinner 00:00~00:00"], ["Sat·Sun", "00:00~00:00"]],
    [["Mon~Sun", "00:00~00:00(L.O 00:00)"]],
  ];
  const list = root.querySelector(".result__list");
  const tpl = root.querySelector("#shop");
  hours.forEach((rows, i) => {
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.querySelector(".shop__dl").innerHTML =
      `<dt>Business hours</dt><dd>${rows.map(([d, t]) => `<span class="d">${d}</span><span class="t">${t.replace("\n", "<br>")}</span>`).join("")}</dd><dt>Regular holiday</dt><dd><span class="t">Your closure rules here</span></dd>`;
    if (i === 1 || i === 3) li.querySelector(".pill:nth-child(2)").remove();
    if (i !== 1) li.querySelector(".shop__note").remove();
    list.append(li);
  });

  // The original changes the address and reopens when a region·brand is picked — here only the selected mark moves
  ["sel", "tile"].forEach((k) => root.querySelectorAll(`.${k}`).forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(`.${k}.is-on`).forEach((o) => o.classList.remove("is-on"));
    b.classList.add("is-on");
  })));
});
