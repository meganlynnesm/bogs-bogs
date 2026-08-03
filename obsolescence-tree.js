// ---------------------------------------------------------------------------
// Obsolescence — live D3 tidy tree (d3.tree) of the eight readings.
// Root "Obsolescence" → two poles (Imposed / Chosen) → eight texts as leaves.
// Hover a node to trace its branch back to the root.
// ---------------------------------------------------------------------------
(function () {
  if (!document.getElementById("obstree") || typeof d3 === "undefined") return;

  const DATA = {
    name: "Obsolescence", sub: "one word, eight subjects", kind: "root",
    children: [
      { name: "Happens to us", pole: "IMPOSED", kind: "branch", children: [
        { name: "Loukissas & Wang", subject: "the local", note: "a data setting flattened into a portable set", color: "#5B7A8F" },
        { name: "Lanier", subject: "the worker", note: "the levee erodes; unpaid data providers go first", color: "#7A5B8F" },
        { name: "Crawford", subject: "the device", note: "built to die; obsolescence decided upstream", color: "#B4533A" },
        { name: "Srnicek", subject: "the firm", note: "lean platforms fold when cheap money ends", color: "#2F5D62" },
      ]},
      { name: "We choose", pole: "CHOSEN", kind: "branch", children: [
        { name: "Morozov", subject: "the mindset", note: "solutionism and 'the Internet' retired as ideas", color: "#A6772E" },
        { name: "Vettese & Pendergrass", subject: "the infrastructure", note: "geoengineering refused; Prometheanism extirpated", color: "#4A7C3F" },
        { name: "Benjamin", subject: "the story", note: "the script of inevitability is what has expired", color: "#6E5A9E" },
        { name: "QueerOS", subject: "the goal itself", note: "'welcomes crashes'; ephemeral by design", color: "#8A8178" },
      ]},
    ]
  };

  const W = 1180, H = 660;
  const M = { top: 26, right: 320, bottom: 26, left: 118 };
  const svg = d3.select("#obstree").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

  const root = d3.hierarchy(DATA);
  d3.tree()
    .size([H - M.top - M.bottom, W - M.left - M.right])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.5))(root);

  const linkSel = g.selectAll("path.ot-link").data(root.links()).join("path")
    .attr("class", "ot-link")
    .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

  const nodeSel = g.selectAll("g.ot-node").data(root.descendants()).join("g")
    .attr("class", "ot-node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .on("mouseenter", (e, d) => hover(d))
    .on("mouseleave", reset);

  nodeSel.append("circle")
    .attr("r", d => d.depth === 0 ? 7 : d.depth === 1 ? 6 : 6.5)
    .attr("fill", d => d.data.color || (d.depth === 0 ? "#1F1B16" : "#4A4239"));

  nodeSel.each(function (d) {
    const s = d3.select(this);
    if (d.depth === 2) {                 // leaf reading
      s.append("text").attr("class", "ot-author").attr("x", 13).attr("dy", "-0.25em").text(d.data.name);
      s.append("text").attr("class", "ot-subject").attr("x", 13).attr("dy", "1.0em").text(d.data.subject);
      s.append("text").attr("class", "ot-note").attr("x", 13).attr("dy", "2.35em").text(d.data.note);
    } else if (d.depth === 1) {           // pole
      s.append("text").attr("class", "ot-branch").attr("text-anchor", "middle").attr("dy", "-1.3em").text(d.data.name);
      s.append("text").attr("class", "ot-pole").attr("text-anchor", "middle").attr("dy", "2.0em").text(d.data.pole);
    } else {                             // root
      s.append("text").attr("class", "ot-root").attr("text-anchor", "end").attr("x", -13).attr("dy", "-0.1em").text(d.data.name);
      s.append("text").attr("class", "ot-rootsub").attr("text-anchor", "end").attr("x", -13).attr("dy", "1.3em").text(d.data.sub);
    }
  });

  const ro = document.getElementById("ot-readout");
  const roDefault = ro ? ro.innerHTML : "";

  function hover(d) {
    const anc = new Set(d.ancestors());
    nodeSel.classed("ot-dim", n => !anc.has(n));
    linkSel.classed("ot-dim", l => !anc.has(l.target));
    if (ro && d.depth === 2) ro.textContent = d.data.name + " — " + d.data.subject + ": " + d.data.note;
  }
  function reset() {
    nodeSel.classed("ot-dim", false);
    linkSel.classed("ot-dim", false);
    if (ro) ro.innerHTML = roDefault;
  }
})();
