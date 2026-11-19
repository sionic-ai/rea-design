// About: set up six items and four feature cards in the same type, and add light parallax to the value photo.
(() => {
  const icons = [
    '<path d="M11 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z"/>',
    '<path d="M4 18l9-14 5 3-9 14z"/>',
    '<circle cx="11" cy="11" r="8"/>',
    '<path d="M6 4a3 3 0 0 1 4 4l4 4a3 3 0 1 1-2 2l-4-4a3 3 0 1 1-2-6z"/>',
    '<path d="M3 13l8-9 8 9-8 6z"/>',
    '<circle cx="8" cy="11" r="5"/><circle cx="15" cy="11" r="5"/>',
  ];
  document.querySelector(".a-feat__six").innerHTML = icons.map((d, i) => `
    <li><span class="a-icon"><svg viewBox="0 0 22 22">${d}</svg></span><div><b>Item name ${i + 1}</b><p>Put an item description here in three lines. Description goes here. Description goes here.</p></div></li>`).join("");
  const tones = ["yellow", "red", "purple", "teal"];
  document.querySelector(".a-feat__cards").innerHTML = tones.map((t, i) => `
    <article class="a-feat__card is-in" data-tone="${t}">
      <div class="a-feat__card-txt"><span class="a-num v-label">0${i + 2}</span><h3>Your feature title here<br>Place it in two lines</h3><p>Your three-line feature description here. Your description here. Your description here.</p></div>
      <div class="a-feat__card-img"><span class="wf-img" data-label="App screen ${i + 2} Phone Cutout · Vertical"></span></div>
    </article>`).join("");

  // Photo parallax (original [data-parallax-background]): a photo 20% larger than its frame rises in a straight line with scroll, at 0 when the frame enters from the bottom of the screen and at −(photo − frame) when it leaves at the top
  const frames = gsap.utils.toArray(".a-value__img, .a-tech__img, .a-story__photo .wf-img").map((img) => {
    const frame = document.createElement("div");
    frame.className = img.className.replace(/\bwf-img\b/, "").trim() + " a-par";
    img.className = "wf-img a-par__bg";
    img.replaceWith(frame);
    frame.append(img);
    return frame;
  });
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    frames.forEach((frame) => {
      const bg = frame.querySelector(".a-par__bg");
      gsap.fromTo(bg, { y: 0 }, { y: () => -(bg.offsetHeight - frame.offsetHeight), ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  });
})();
