(() => {
  gsap.registerPlugin(ScrollTrigger);
  const { reduce } = window.ctSite;
  const wrapper = document.getElementById("wrapper");
  const lenis = new Lenis({ anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // The photo unfolds while bowed and the text group grows from .9× and stands (2.5s) — scrolling back up folds it again
  ScrollTrigger.batch(".js-reveal, .js-reveal-txt", {
    start: "top 80%",
    onEnter: (b) => b.forEach((el) => el.classList.add("is-visible")),
    onLeaveBack: (b) => b.forEach((el) => el.classList.remove("is-visible")),
  });
  // Past 80px of the header photo, the bottom-right table of contents hides in .5s
  const menu = document.getElementById("menu");
  ScrollTrigger.create({ trigger: "#kv", start: "top -80", onEnter: () => menu.classList.add("is-hidden"), onLeaveBack: () => menu.classList.remove("is-hidden") });

  // Opens with the cover on, and once fully loaded it lifts up in 1s and then the header logo drops in (original is-loadingEnd → is-loadingEndStart)
  addEventListener("load", () => {
    wrapper.classList.add("is-loaded", "is-cover-out");
    setTimeout(() => {
      wrapper.classList.remove("is-cover-held", "is-cover-out");
      wrapper.classList.add("has-scrolled");
    }, reduce ? 0 : 1000);
  });
})();
