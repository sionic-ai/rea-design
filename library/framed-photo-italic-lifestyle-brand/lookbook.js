// Gallery: original gallery_body — shuffled photos laid out in rows of 18-photo batches (a 3 · normal 6 · b 3 · normal 6), 15 shown at a time, filtered by branch, press opens a window
jQuery(($) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TYPES = ["1step|white", "2step|black", "3step|gray", "premium|yellow", "2step|pink", "1step|black", "3step|white", "2step|gray", "3step|pink"];
  const SCENES = ["Ladder beside clothes rack · industrial-style shop", "Person placing items on a shelf · bright wall", "Ladder in front of a bookshelf · wooden shelves", "Yellow ladder and person by a window · afternoon light", "Folded ladder beside the kitchen island", "Brick wall and ladder at the entrance", "Ladder in the middle of a corridor · concrete", "Pink ladder beside a chair · Living room", "Bare feet on white ladder · Wooden floor"];
  const view = 15, repeat = 18;
  const def = $(".gallery_body .default");
  for (let i = 0; i < 40; i++) def.append(`<li class="evt" data-anim="fadeIn" data-type="${TYPES[i % TYPES.length]}"><a href="#"><div class="wf-img" data-label="${SCENES[i % SCENES.length]} · Photo ${String(i + 1).padStart(2, "0")}"></div></a></li>`);
  let org = def.children("li").toArray().map((li) => $(li));
  for (let i = org.length - 1; i > 0; i--) { const r = Math.floor(Math.random() * (i + 1)); [org[i], org[r]] = [org[r], org[i]]; }

  const build = (list) => {
    const box = $(".gallery_body .list").empty();
    let ul;
    list.forEach((li, i) => {
      const k = i % repeat;
      if (!ul || k === 0) ul = $('<ul class="a">').appendTo(box);
      else if (k === 3 || k === 12) ul = $("<ul>").appendTo(box);
      else if (k === 9) ul = $('<ul class="b">').appendTo(box);
      ul.append(li.clone());
    });
    $(".gallery_body .more").toggle(list.length > view);
    box.find("li").each(function (i) { if (i >= view) $(this).removeClass("evt").hide(); });
  };
  build(org);

  $(".gallery_nav a").on("click", function () {
    $(".gallery_nav a").removeClass("active");
    $(this).addClass("active");
    const cate = $(this).attr("href");
    build(cate === "all" ? org : org.filter((li) => String(li.data("type")).split("|").includes(cate)).map((li) => li.clone().removeClass("evt")));
    window.lcMotion?.();
    return false;
  });
  $(".gallery_body .more a").on("click", function () {
    let n = 0;
    const list = $(".gallery_body .list li");
    list.each(function () { if (n < view && $(this).css("display") === "none") { n += 1; $(this).fadeIn(reduce ? 0 : 400); } });
    if (list.last().css("display") !== "none") $(this).parent().hide();
    return false;
  });
  // Window: jQuery fadeIn/fadeOut(400ms)
  $(document).on("click", ".gallery_body li a", function () {
    $(".gallery_modal figure .wf-img").attr("data-label", $(this).find(".wf-img").attr("data-label"));
    $(".gallery_modal").fadeIn(reduce ? 0 : 400);
    $("body").addClass("show-modal");
    return false;
  });
  let clicked = false;
  $(".popup-modal a").on("click", () => { clicked = true; setTimeout(() => { clicked = false; }, 500); });
  $(".popup-modal").on("click", () => {
    if (clicked) return;
    $(".popup-modal").fadeOut(reduce ? 0 : 400);
    $("body").removeClass("show-modal");
    return false;
  });
  window.lcMotion?.();
});
