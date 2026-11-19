(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LV = ["Level 1", "Level 2", "Level 3"];
  const themes = ["#Advanced", "#How much did that dream cost you?", "#Career Talk", "#First Start", "#Money & Life", "#Tax Talk", "#Rewards Talk", "#Reading the Market", "#What is an index product", "#FAQ", "#People stories"];
  const cats = document.querySelector("[data-cats]");
  if (cats) cats.innerHTML = themes.map((t) => `<li><a class="fi-round" href="#"><span>${t}</span></a></li>`).join("");
  const arts = document.querySelector("[data-articles]");
  if (arts) {
    const ph = ["Table with masks on it", "Person holding open a newspaper", "Hand taking notes", "Laptop and coffee", "Two people standing at the shop front", "Text-only cover panel", "Two people in a meeting room", "Person reading by the window", "Hand holding a flower", "Receipt on a cafe table"];
    arts.innerHTML = ph.map((p, i) => `
      <li><a href="#"><span class="fi-art__fig"><span class="fi-art__img"><span class="wf-img" data-label="${p} · Bright interior · Landscape 4:3"></span></span><span class="fi-art__lv">${LV[i % 3]}</span></span><span class="fi-art__body"><p class="fi-art__cat">${themes[i % themes.length]}</p><h3 class="fi-art__t">Your article title here, about two lines long — ${i + 1}One more line on the post’s theme.</h3><p class="fi-art__date fi-en">0000.00.00</p></span></a></li>`).join("");
  }
  const pick = document.querySelector("[data-pickup]");
  if (pick) pick.innerHTML = [0, 1, 2].map((i) => `<li><a href="#"><span class="wf-img" data-label="Selected post photo ${i + 1} · Landscape 4:3"></span><span><small>${themes[i]}</small><p>Your featured article title goes here in about two lines</p></span></a></li>`).join("");
  const th = document.querySelector("[data-themes]");
  if (th) th.innerHTML = themes.map((t, i) => `<li><a href="#"><span>${t}</span><b class="fi-en">${(i * 7) % 23 + 1}</b></a></li>`).join("");

  // Page header photo: after the document is drawn, color rises from monochrome and the title slides up (original opening-animation → is-tween)
  // If there is a loader, after it lifts (fx:done) — original onLoadingComplete
  const hero = document.querySelector("[data-tween-load]");
  const loader = document.querySelector("[data-fx~='hue-breath-loader']");
  const heroIn = () => hero?.classList.add("is-in");
  if (hero) {
    if (reduce || !loader) requestAnimationFrame(() => requestAnimationFrame(heroIn));
    else { loader.addEventListener("fx:done", heroIn, { once: true }); setTimeout(() => { if (getComputedStyle(loader).display === "none") heroIn(); }, 50); }
  }
})();
