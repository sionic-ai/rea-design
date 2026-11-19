// Blog list: six cards. The hover interaction that sets each card’s tilt on open is handled by the random-tilt-hover part (original -2.5~-.5° · .5~2.5°)
(() => {
  const grid = document.querySelector("[data-posts]");
  if (!grid) return;
  const T = ["The 0 Best Tools for One Job in 0000", "Essential Tools for Remote Teams in 0000", "How to Record Calls in 0000", "How to Write Meeting Notes — Tips & Tricks", "What Are Intake Meetings — Benefits, Tips, Examples", "What Is Remote Closing (Types, Techniques)"];
  grid.innerHTML = T.map(
    (t) => `<div class="am-post" data-fx="random-tilt-hover"><a href="article.html"><div class="am-post__card">
      <h2 data-label="Post title in English">${t}</h2>
      <p>Put a four-to-five-line article summary here. Cover what was compared, the criteria used to choose, and what the reader can do after reading, so the card height matches the original.</p>
    </div></a></div>`,
  ).join("");
})();
