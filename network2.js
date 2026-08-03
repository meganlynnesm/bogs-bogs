// ---------------------------------------------------------------------------
// Opening diagram — live D3 force-directed network (Abstract page).
// Data from opening-diagram-data.js (NET_NODES / NET_LINKS), extracted from
// opening-diagram.svg. Three tiers: registers, groupings, components.
// Hover a node to highlight its connections and reveal its name.
// ---------------------------------------------------------------------------
(function () {
  if (typeof NET_NODES === "undefined" || !document.getElementById("opennet")) return;

  const W = 1400, H = 1080;
  const BANDY = { 1: 110, 2: 420, 3: 850 };
  const RAD = { 1: 12, 2: 7.5, 3: 4.6 };
  const sx = x => 110 + (x / 2060) * (W - 220);

  const nodes = NET_NODES.map(d => ({ ...d, r: RAD[d.level], seedx: sx(d.x), bandy: BANDY[d.level] }));
  nodes.forEach(n => { n.x = n.seedx; n.y = n.bandy; });
  // pin the three registers, evenly spread across the top
  nodes.filter(n => n.level === 1).sort((a, b) => a.seedx - b.seedx)
    .forEach((n, i) => { n.fx = [0.24, 0.5, 0.76][i] * W; n.fy = BANDY[1]; n.x = n.fx; n.y = n.fy; });
  const byId = new Map(nodes.map(n => [n.id, n]));
  const links = NET_LINKS.filter(l => byId.has(l.source) && byId.has(l.target)).map(l => ({ ...l }));

  const nbr = new Map(nodes.map(n => [n.id, new Set()]));
  links.forEach(l => { nbr.get(l.source).add(l.target); nbr.get(l.target).add(l.source); });

  const svg = d3.select("#opennet")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const gL = svg.append("g");
  const gN = svg.append("g");
  const gC = svg.append("g");

  const LW = { kin: 0.5, sig: 1.3, strong: 2.1, belongs: 0.6 };
  const LO = { kin: 0.22, sig: 0.6, strong: 0.78, belongs: 0.13 };

  const lsel = gL.selectAll("line").data(links).join("line")
    .attr("class", "on-link")
    .attr("fill", "none")
    .attr("stroke", d => d.kind === "belongs" ? "#d2ccbe" : d.color)
    .attr("stroke-width", d => LW[d.kind])
    .attr("stroke-dasharray", d => d.kind === "belongs" ? "4 4" : null)
    .attr("stroke-opacity", d => LO[d.kind]);

  const nsel = gN.selectAll("circle").data(nodes).join("circle")
    .attr("class", "on-node")
    .attr("r", d => d.r)
    .attr("fill", d => d.color)
    .on("mouseenter", (e, d) => hover(d))
    .on("mouseleave", reset);

  const csel = gC.selectAll("text").data(nodes.filter(n => n.level <= 2)).join("text")
    .attr("class", d => "on-cap l" + d.level)
    .attr("text-anchor", "middle")
    .text(d => d.name);

  const hoverLabel = svg.append("text").attr("class", "on-hoverlabel").attr("text-anchor", "middle").style("opacity", 0);
  const ro = document.getElementById("on-readout");
  const roDefault = ro ? ro.textContent : "";
  let held = null;

  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id)
      .distance(d => d.kind === "kin" ? 26 : d.kind === "belongs" ? 120 : 90)
      .strength(d => d.kind === "kin" ? 0.5 : d.kind === "belongs" ? 0.02 : 0.12))
    .force("charge", d3.forceManyBody().strength(d => d.level === 1 ? -520 : d.level === 2 ? -230 : -24))
    .force("x", d3.forceX(d => d.seedx).strength(0.12))
    .force("y", d3.forceY(d => d.bandy).strength(0.55))
    .force("collide", d3.forceCollide().radius(d => d.r + 2).iterations(2))
    .alphaDecay(0.025)
    .on("tick", tick);

  function tick() {
    nodes.forEach(n => {
      const lim = n.level === 3 ? 190 : n.level === 2 ? 90 : 50;
      n.x = Math.max(24, Math.min(W - 24, n.x));
      n.y = Math.max(BANDY[n.level] - lim, Math.min(BANDY[n.level] + lim, n.y));
    });
    lsel.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    nsel.attr("cx", d => d.x).attr("cy", d => d.y);
    csel.attr("x", d => d.x).attr("y", d => d.y - d.r - 6);
    if (held) hoverLabel.attr("x", held.x).attr("y", held.y - held.r - 7);
  }

  function hover(d) {
    held = d;
    const keep = new Set(nbr.get(d.id)); keep.add(d.id);
    nsel.classed("on-dim", n => !keep.has(n.id));
    csel.classed("on-dim", n => !keep.has(n.id));
    lsel.classed("on-dim", l => !(l.source.id === d.id || l.target.id === d.id));
    hoverLabel.text(d.name).attr("x", d.x).attr("y", d.y - d.r - 7).style("opacity", 1);
    if (ro) ro.textContent = d.name + "  ·  " + (d.level === 1 ? "register" : d.level === 2 ? "grouping" : "component");
  }

  function reset() {
    held = null;
    nsel.classed("on-dim", false);
    csel.classed("on-dim", false);
    lsel.classed("on-dim", false);
    hoverLabel.style("opacity", 0);
    if (ro) ro.textContent = roDefault;
  }
})();
