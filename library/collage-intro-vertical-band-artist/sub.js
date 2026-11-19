/* Sub pages — category list (shuffle typing), phone picker panel (slideToggle), and relocating the share row of a news item */
(() => {
  const { typed, vlabel } = window.SK.parts;
  const MODE = "start: top bottom; delay: .15";
  document.querySelectorAll("[data-cats]").forEach((box) => {
    const items = box.dataset.cats.split(",");
    box.innerHTML = `${vlabel("CATEGORY", MODE)}<ul>${items.map((t, i) => `<li${i === 0 ? ' class="is-on"' : ""}>${typed(t, MODE, "", "a", ' href="#"')}</li>`).join("")}</ul>`;
  });
  document.querySelectorAll("[data-select]").forEach((ul) => {
    ul.innerHTML = ul.dataset.select.split("|").map((group) => {
      const [name, list] = group.split(":");
      return `<li><span class="sk-select__btn">${name}</span><div class="sk-select__panel">${list.split(",").map((t, i) => `<label><input type="radio" name="${name}"${i === 0 ? " checked" : ""}><span>${t}</span></label>`).join("")}</div></li>`;
    }).join("");
  });
  const $ = window.jQuery;
  if ($ && innerWidth < 1000) $(".sk-select__btn").on("click", function () { $(this).next().stop().slideToggle(); });

  // On phones the original moves the share row below the body
  const share = document.querySelector(".sk-detail .sk-share");
  if (share) {
    const lsubTtl = document.querySelector(".sk-detail__ttl"), r = document.querySelector(".sk-detail__r");
    const place = () => { if (innerWidth > 999) lsubTtl.after(share); else r.after(share); };
    place();
    addEventListener("resize", place);
  }
})();
