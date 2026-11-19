// Fills five popular posts and six related articles in the same Type, and the table of contents moves by smooth scroll.
(() => {
  const POP = ["Original doodle · black-and-white sketch", "Meeting shot · Two people at a monitor", "Person shot · Woman by the window", "Work shot · editing screen", "Graphic · Light-bleed abstract"];
  document.querySelector(".nw-side .pop").innerHTML = POP.map((l, i) => `<li><a href="news.html"><div class="wf-img" data-label="${l}"></div><span>Your popular post title ${i + 1}, set in two lines</span></a></li>`).join("");
  const REL = ["Person shot · woman sitting on a chair by the window · daytime natural light", "Person shot · man standing in a rooftop garden · overcast day", "Person shot · woman walking a forest path · green backlight", "Interview shot · man in front of yellow poster · indoor lighting", "Original doodle · B&W character sheet · white paper", "Meeting shot · talking in front of a monitor · indoor lighting"];
  const box = document.querySelector(".nw-related .co-cards");
  box.innerHTML = REL.map((l) => `<li class="co-card cursorarea co-load"><a href="news.html"><div class="wf-img" data-label="${l} · Landscape 16:10"></div><dl><dt>0000.00.00</dt><dd><h4>Your two related article titles here, with similar stories</h4><p class="cap"><span>Our story</span></p></dd></dl></a></li>`).join("");

  const cursor = document.querySelector(".co-cursor");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("move"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  box.querySelectorAll(".co-card").forEach((el) => {
    io.observe(el);
    el.addEventListener("mouseenter", () => cursor.classList.add("active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
  });
  if (document.documentElement.classList.contains("rm")) box.querySelectorAll(".co-load").forEach((el) => el.classList.add("move"));

  document.querySelectorAll(".toc a").forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    window.LTW.lenis ? window.LTW.lenis.scrollTo(t, { offset: -100 }) : t.scrollIntoView({ behavior: "smooth" });
  }));
})();
