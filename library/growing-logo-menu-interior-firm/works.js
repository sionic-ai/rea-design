/* Projects: switch between grid/list view (chosen view is remembered) */
(() => {
  const grid = document.querySelector(".tw-pgrid"), list = document.querySelector("[data-project-list]");
  list.innerHTML = Array.from({ length: 14 }, (_, i) => `<li><a href="works.html"><strong data-label="Your project English name here">Project Name ${String(i + 1).padStart(2, "0")}</strong><span>Neighborhood name</span><span>Grade B</span><div class="wf-img tw-ph" data-label="Main photo · Landscape"></div></a></li>`).join("");
  const KEY = "tw-projects-view";
  let now = "";
  const set = (v, anim) => {
    if (v === now) return;
    now = v;
    document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("is-on", b.dataset.view === v));
    const show = v === "list" ? list : grid, hide = v === "list" ? grid : list;
    const swap = () => { hide.hidden = true; show.hidden = false; show.classList.remove("is-fading"); ScrollTrigger.refresh(); };
    if (!anim) return swap();
    hide.classList.add("is-fading"); show.classList.add("is-fading");
    setTimeout(swap, 300);
    try { localStorage.setItem(KEY, v); } catch {}
  };
  document.addEventListener("tw:built", () => { let v = "grid"; try { v = localStorage.getItem(KEY) || "grid"; } catch {} set(v, false); });
  document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => set(b.dataset.view, true)));
})();
