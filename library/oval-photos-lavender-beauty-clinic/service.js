// Treatment menu: category buttons by specialty are drawn in the original counts (plastic surgery 6 groups · dermatology 9 groups)
(() => {
  const groups = [
    ["Plastic Surgery", [["Double eyelid", 4], ["Dark circles", 3], ["Lift up", 2], ["Nose", 1], ["Liposuction", 4], ["Chest", 1]]],
    ["Dermatology", [["Skin injection", 6], ["Melasma·blemishes", 6], ["Acne · scars", 4], ["Sagging · Wrinkles", 7], ["Blush", 2], ["Hair removal", 1], ["Semi-permanent & tattoo", 2], ["Underwear · skincare", 2], ["Others", 3]]],
  ];
  document.querySelector("[data-cats]").innerHTML = groups.map(([v, subs]) => `
    <li><h3 class="pc-cats__v">${v}</h3><div class="pc-cats__body">${subs.map(([h, n]) => `<h3>${h}</h3><ul class="pc-cats__list">${Array.from({ length: n }, (_, i) => `<li><a href="detail.html">Your treatment name $ here{i + 1}</a></li>`).join("")}</ul>`).join("")}</div></li>`).join("");
})();
