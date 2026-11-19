// Feature text — the header sticks up from 40px to 20px over scroll 0 → 100px (1020px and above), and the title box, once the photo’s bottom edge passes the box’s top edge,
// Settles below the photo (once)
(() => {
  const ICO = GH.ICO;
  document.querySelectorAll("[data-gh-share]").forEach((s) => { s.innerHTML = ["fb", "x", "spot"].map((k) => `<a href="#" aria-label="Share ${k}">${ICO[k]}</a>`).join(""); });
  const root = document.documentElement;
  const key = document.querySelector(".gh-key");
  const img = key.querySelector(".gh-key__img");
  const txt = key.querySelector(".gh-key__txt");
  const pad = () => key.style.setProperty("--gh-ktxt-h", innerWidth >= 768 ? `${txt.offsetHeight}px` : "0px");
  const onScroll = () => {
    const y = scrollY;
    root.style.setProperty("--gh-head-top", `${y >= 100 ? 20 : 40 - (y / 100) * 20}px`);
    if (!txt.classList.contains("is-parked") && img.getBoundingClientRect().bottom <= txt.getBoundingClientRect().top) txt.classList.add("is-parked");
  };
  pad();
  addEventListener("resize", pad);
  addEventListener("load", pad);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
