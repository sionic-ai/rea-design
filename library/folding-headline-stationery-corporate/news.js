// News list — left list filtered by year and rows of thumbnail + date + title (a company mark panel if there is no image)
(() => {
  const $ = (s) => document.querySelector(s);
  $("#tb-years").innerHTML = Array.from({ length: 10 }, (_, i) => `<li><a href="#"${i ? "" : ' class="is-on"'}>${2026 - i}Year</a></li>`).join("");
  const titles = ["Your price adjustment notice here", "Lead change notice goes here", "Your product recall and exchange notice goes here in about two lines. A notice for everyone using this product.", "Your office relocation notice here.", "Add the website refresh news here", "Your product supply notice here"];
  $("#tb-rows").innerHTML = Array.from({ length: 25 }, (_, i) => `
    <li class="row"><a href="#">
      <span class="thumb${i === 9 ? " photo" : ""}">${i === 9 ? '<span class="wf-img" data-label="New website screen · laptop and phone · white background"></span>' : '<span class="mark">Logo</span>'}</span>
      <span class="body"><span class="tb-date">0000.0.${String(i + 1).padStart(2, "0")}</span><span class="t">${titles[i % titles.length]}</span></span>
    </a></li>`).join("");
})();
