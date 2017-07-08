var state = [];

var isIssueOrPull = () => /^\/[^/]+\/[^/]+\/(issues\/|pull)/.test(location.pathname);

var markup = () => {
  var comments = $('.comment').map((_index, element) => ({
    element: element,
    top: $(element).offset().top / $(document).height(),
    height: $(element).height() / $(document).height(),
    reactions: $(element).find('.reaction-summary-item').not('.add-reaction-btn').map((_index, reaction) => ({
      name: $(reaction).find('g-emoji').attr("alias"),
      count: $(reaction).contents().not($(reaction).children()).text().trim()
    })).get()
  })).get();

  comments.filter(comment => comment.reactions.length > 0).forEach(comment => {
    var karmaMap = {
      "+1": 1,
      "-1": -1,
      "thinking_face": -1,
      "heart": 1,
      "tada": 1,
      "smile": 1
    };
    var karma = comment.reactions.reduce((karma, reaction) => karma + karmaMap[reaction.name] * reaction.count, 0);
    var div = document.createElement("div"); // piece of the minimap
    div.style.position = "fixed";
    div.style.top = comment.top * 100 + '%';
    div.style.width = "12px";
    div.style.opacity = 1 - 10 / (10 + Math.abs(karma));
    div.style.height = comment.height * 100 + '%';
    div.style.background = karma > 0 ? "#0f0" : "#f00";
    div.style.right = "0px";
    state.push(div);
    document.body.appendChild(div);

    // linear interpolation between two colors
    var lerpColor = (r1, g1, b1, r2, g2, b2, s) => {
      var i = (v1, v2) => (1 - s) * v1 + s * v2;
      return [i(r1, r2), i(g1, g2), i(b1, b2)];
    };

    var [_, r1, g1, b1] = $(comment.element).css("border-color").match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); 
    var [r2, g2, b2] = karma > 0 ? [0, 255, 0] : [255, 0, 0];
    var [r, g, b] = lerpColor(r1, g1, b1, r2, g2, b2, 1 - 10 / (10 + Math.abs(karma)));
    $(comment.element).css("border-color", "rgb(" + Math.floor(r) + ", " + Math.floor(g) + ", " + Math.floor(b) + ")");
  });
};

$(document).on('pjax:end', () => isIssueOrPull() && markup());
$(document).on('pjax:start', () => {
  state.forEach(t => $(t).remove());
  state = [];
});
isIssueOrPull() && markup();
