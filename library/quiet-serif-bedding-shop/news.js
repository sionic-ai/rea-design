// News list · single News item — fills only cards of the same type (the only motion is the blur reveal in shared.js)
(() => {
  const photos = ["Event notice illustration under the night sky · deep navy", "Mattress in a hotel room", "Mattress on display in store", "Two people in pajamas", "Person hugging a pillow", "Hotel Room Bed", "Morning bedroom window", "Hand unrolling a mattress", "Mattress taken out of the box"];
  const grid = document.querySelector(".nw-list__grid");
  if (grid) grid.innerHTML = photos.slice(0, +(grid.dataset.count || 9)).map((p, i) => `<li><a href="article.html"><div class="nm-ph"><div class="wf-img" data-label="${p} · Landscape 330:195"></div></div>
    <h3>Your news title goes here, long enough to run nearly three lines ${String(i + 1).padStart(2, "0")} — Add one more line on who you joined and what you did</h3><time>2026.00.${String(28 - i * 3).padStart(2, "0")}</time></a></li>`).join("");
  const col = document.querySelector(".ab-column__grid");
  if (col) col.innerHTML = [1, 2, 3].map((i) => `<a href="article.html"><article><div class="nm-ph"><div class="wf-img" data-label="Orange large-type column cover ${i} · Over a blurred bedroom photo · landscape 330:195"></div></div><h3>A long column title running close to three lines goes here ${i} — Your note on how to choose goes here</h3></article></a>`).join("");
})();
