const REGISTERS = [
  { id: "land", name: "Land", note: "Ground that is cut, drained, burned — and can be brought back. The older extraction, with a memory measured in millennia." },
  { id: "data", name: "Data", note: "The same habit moved indoors. Harvested continuously, on ground that has to be cooled and watered." },
  { id: "time", name: "Time", note: "Obsolescence. What here is genuinely future, and what is mysticism accruing around the technologies we imagine will save us." }
];

const GROUPS = [
  { id: "dc",     name: "Data centre",   reg: "data", href: "data-ai.html#data-centre",  note: "The working floor: servers, racks, halls, and everything that keeps them cool and powered." },
  { id: "net",    name: "Network",       reg: "data", href: "data-ai.html#network",      note: "Routers, switches, exchange points, fibre — the machinery of moving data between places." },
  { id: "sub",    name: "Subsea",        reg: "data", href: "data-ai.html#subsea",       note: "Roughly 99% of intercontinental data travels through cable on the sea floor." },
  { id: "acc",    name: "Last mile",     reg: "data", href: "data-ai.html#access",       note: "Towers, cabinets, routers, satellites — the layer where the divide is actually felt." },
  { id: "divide", name: "The divide",    reg: "data", href: "data-ai.html#divide-map",   note: "Median broadband speed by country, against where the data centres and cables actually are." },
  { id: "power",  name: "Power & land",  reg: "land", href: "data-ai.html#power",        note: "Substations, cooling towers, water intake — and peatland, listed as component 32. The seam of the project.", also: "data" },
  { id: "cover",  name: "Land cover",    reg: "land", href: "regeneration.html#landcover-map", note: "Dominant land-cover type, with the world's peatlands laid over the top." },
  { id: "sites",  name: "Case sites",    reg: "land", href: "regeneration.html#ireland", note: "Ireland, Virginia and Ohio — three grounds where peat and data centres share a map.", also: "data" },
  { id: "life",   name: "Lifecycle",     reg: "time", href: "obsolescence.html", note: "How long this infrastructure lasts, against how long the ground remembers." },
  { id: "persist",name: "Persistence",   reg: "time", href: "obsolescence.html", note: "What survives: carbon in peat, data in archives, concrete in the ground." },
  { id: "myst",   name: "Mysticism",     reg: "time", href: "obsolescence.html", note: "The gap between what the technology does and what we imagine it will do for us.", also: "data" }
];

const ITEMS = [
  ["Server","dc"],["Server rack","dc"],["Data hall","dc"],["Cooling unit","dc"],["Chiller","dc"],
  ["UPS","dc"],["Backup generator","dc"],["Power distribution","dc"],
  ["Core router","net"],["Network switch","net"],["Exchange point","net"],["Fibre-optic cable","net"],
  ["DWDM transport","net"],["Patch panel","net"],["Firewall","net"],
  ["Submarine cable","sub"],["Landing station","sub"],["Optical repeater","sub"],["Branching unit","sub"],["Cable-laying ship","sub"],
  ["Cell tower","acc"],["Small cell","acc"],["Street cabinet","acc"],["Home router","acc"],
  ["LEO satellite","acc"],["Fixed wireless","acc"],["Wi-Fi access point","acc"],
  ["Broadband speed","divide"],["Data centre locations","divide"],["Cable routes","divide"],
  ["Rural access","divide"],["Urban access","divide"],
  ["Substation","power"],["Transformer","power"],["Cooling tower","power"],["Water intake","power"],["Peatland","power"],
  ["Peat bog","cover"],["Moor & heath","cover"],["Pasture","cover"],["Arable","cover"],
  ["Forest","cover"],["Wetland","cover"],["Water","cover"],
  ["Ireland","sites"],["Virginia","sites"],["Ohio","sites"],["Developed land","sites"],["Global peatlands","sites"],
  ["Hardware refresh","life"],["Decommissioning","life"],["E-waste","life"],["Site remediation","life"],
  ["Carbon store","persist"],["Drained emissions","persist"],["Data archive","persist"],["Ruins","persist"],
  ["AI hype","myst"],["Imagined futures","myst"],["Automation","myst"]
];

const SIGNAL = [
  ["Peatland","Peat bog","sym"],["Peatland","Global peatlands","sym"],
  ["Water intake","Water","ext"],["Cooling tower","Wetland","ext"],
  ["Submarine cable","Cable routes","ext"],["Fibre-optic cable","Cable routes","ext"],
  ["Broadband speed","Rural access","ext"],["Cell tower","Rural access","ext"],
  ["LEO satellite","Rural access","ext"],["Street cabinet","Urban access","ext"],
  ["Wi-Fi access point","Urban access","ext"],["Data hall","Developed land","ext"],
  ["Substation","Virginia","ext"],["Data centre locations","Virginia","ext"],
  ["Data centre locations","Ohio","ext"],["Backup generator","Drained emissions","ext"],
  ["Server","Hardware refresh","ext"],["Server rack","E-waste","ext"],
  ["Automation","Hardware refresh","ext"],["Imagined futures","Broadband speed","ext"],
  ["Drained emissions","Ireland","ext"],["Arable","Peat bog","ext"],
  ["Decommissioning","Site remediation","sym"],["Site remediation","Peat bog","sym"],
  ["Carbon store","Peat bog","sym"],["Carbon store","Global peatlands","sym"],
  ["Moor & heath","Peat bog","sym"],["Forest","Global peatlands","sym"],
  ["Water","Wetland","sym"],["Data archive","Ruins","sym"],["Ruins","Developed land","sym"],
  ["Peat bog","Ireland","sym"]
];

const GROUP_TIES = [
  ["dc","net","tie"],["net","sub","tie"],["net","acc","tie"],["sub","divide","tie"],
  ["acc","divide","ext"],["dc","power","ext"],["power","cover","ext"],["power","sites","ext"],
  ["cover","sites","tie"],["sites","divide","tie"],["life","dc","ext"],["myst","divide","ext"],
  ["persist","cover","sym"],["persist","sites","sym"],["persist","life","tie"],["myst","life","tie"]
];
const REG_TIES = [["land","data","ext"],["data","time","ext"],["land","time","sym"]];

const NOTES = {
  "Peatland": "Component 32 in the data-centre catalogue: carbon-rich degraded land, listed beside the transformers.",
  "Peat bog": "Dominant land cover across the west and midlands of Ireland in CORINE 2018.",
  "Carbon store": "Peat covers about 3% of land but holds over 600 Gt of carbon — roughly twice all the world's forests.",
  "Drained emissions": "Drained peatland is under 0.4% of land yet produces roughly 5% of human greenhouse emissions.",
  "Submarine cable": "Carries roughly 99% of intercontinental data.",
  "Virginia": "NLCD 2021 — the developed cluster in the north-east is Data Center Alley.",
  "Ohio": "NLCD 2021 — Columbus and the New Albany data-centre cluster.",
  "Ireland": "CORINE 2018, shown as a hex overview you can peel back to the detailed map.",
  "Water intake": "Draws the water used for evaporative cooling.",
  "Rural access": "Where the divide is measured: median fixed download speed, country by country."
};

const css = getComputedStyle(document.documentElement);
const tone = v => css.getPropertyValue(v).trim();
const BG = tone("--bg"), FAINT = tone("--faint");
const EXT = tone("--orange"), SYM = tone("--green");
const REG_TONE = { land: tone("--orange"), data: tone("--pink"), time: tone("--blue") };
const REG_END  = { land: tone("--ochre"),  data: tone("--purple"), time: tone("--yellow") };

const W = 1000, H = 1200, NET_R = 690;
const BAND = { 3: 130, 2: 470, 1: 900 };
const REG_X = { data: 200, land: 380, time: 545 };

const groupTone = {};
["data","land","time"].forEach(r => {
  const gs = GROUPS.filter(g => g.reg === r);
  const scale = d3.interpolateLab(REG_TONE[r], REG_END[r]);
  gs.forEach((g, i) => { groupTone[g.id] = d3.color(scale(gs.length < 2 ? 0 : i / (gs.length - 1) * 0.85)).formatHex(); });
});

let seed = 20260802;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

const nodes = [], byId = new Map();
REGISTERS.forEach(r => { const n = { ...r, level: 3, colour: REG_TONE[r.id], r: 11, ax: REG_X[r.id], ay: BAND[3] }; nodes.push(n); byId.set("R:" + r.id, n); });
GROUPS.forEach((g, i) => {
  const n = { ...g, level: 2, colour: groupTone[g.id], r: 7.5,
    ax: REG_X[g.reg] + (GROUPS.filter(x => x.reg === g.reg).indexOf(g) - 1) * 78, ay: BAND[2] + (i % 3) * 26 };
  nodes.push(n); byId.set("G:" + g.id, n);
});
ITEMS.forEach(([name, gid]) => {
  const g = GROUPS.find(x => x.id === gid);
  const n = { id: "I:" + name, name, group: gid, reg: g.reg, level: 1, colour: groupTone[gid], r: 5,
    note: NOTES[name] || ("Part of " + g.name.toLowerCase() + "."), href: g.href,
    ax: REG_X[g.reg] + (rnd() - .5) * 130, ay: BAND[1] + (rnd() - .5) * 150 };
  nodes.push(n); byId.set(n.id, n);
});
nodes.forEach(n => { n.x = n.ax + (rnd() - .5) * 20; n.y = n.ay + (rnd() - .5) * 20; });

const kin = [];
GROUPS.forEach(g => {
  const set = ITEMS.filter(([, gid]) => gid === g.id).map(([nm]) => byId.get("I:" + nm));
  for (let i = 0; i < set.length; i++) {
    kin.push({ source: set[i], target: set[(i + 1) % set.length], w: .6 });
    if (set.length > 4) kin.push({ source: set[i], target: set[(i + 3) % set.length], w: .4 });
  }
});
const sig = SIGNAL.map(([a, b, t]) => ({ source: byId.get("I:" + a), target: byId.get("I:" + b), kind: t, lvl: 1 }))
  .concat(GROUP_TIES.map(([a, b, t]) => ({ source: byId.get("G:" + a), target: byId.get("G:" + b), kind: t, lvl: 2 })))
  .concat(REG_TIES.map(([a, b, t]) => ({ source: byId.get("R:" + a), target: byId.get("R:" + b), kind: t, lvl: 3 })))
  .filter(l => l.source && l.target);
GROUPS.forEach(g => {
  const set = ITEMS.filter(([, gid]) => gid === g.id).map(([nm]) => byId.get("I:" + nm));
  set.forEach(it => kin.push({ source: it, target: byId.get("G:" + g.id), w: 0, thread: true }));
});
const threads = [];
ITEMS.forEach(([nm, gid]) => threads.push({ a: byId.get("I:" + nm), b: byId.get("G:" + gid), up: false }));
GROUPS.forEach(g => {
  threads.push({ a: byId.get("G:" + g.id), b: byId.get("R:" + g.reg), up: true });
  if (g.also) threads.push({ a: byId.get("G:" + g.id), b: byId.get("R:" + g.also), up: true });
});

const svg = d3.select("#strata");
svg.append("g").selectAll("text").data([[3, "First level · registers", 66], [2, "Second level · groupings", 96], [1, "Third level · components", 235]])
  .enter().append("text").attr("class", "band-key")
  .attr("x", 24).attr("y", d => BAND[d[0]] - d[2]).text(d => d[1]);

const gThread = svg.append("g");
const gKin = svg.append("g");
const gSig = svg.append("g");
const gNode = svg.append("g");
const gCap = svg.append("g");

const threadSel = gThread.selectAll("path").data(threads).enter().append("path")
  .attr("class", d => "thread " + (d.up ? "up" : ""));
const kinSel = gKin.selectAll("path").data(kin.filter(k => !k.thread)).enter().append("path").attr("class", "kin");
const sigSel = gSig.selectAll("path").data(sig).enter().append("path")
  .attr("class", "sig")
  .attr("stroke", d => d.kind === "sym" ? SYM : d.kind === "ext" ? EXT : tone("--muted"))
  .attr("stroke-width", d => d.kind === "tie" ? 1 : d.lvl === 3 ? 3.2 : d.lvl === 2 ? 2.2 : 1.8)
  .attr("stroke-opacity", d => d.kind === "tie" ? .35 : .78);

const dotSel = gNode.selectAll("circle").data(nodes).enter().append("circle")
  .attr("class", "dot").attr("r", d => d.r).attr("fill", d => d.colour)
  .attr("tabindex", 0)
  .on("mouseenter focus", (e, d) => lite(d))
  .on("mouseleave blur", () => lite(null))
  .on("click", (e, d) => { if (d.href) window.location.href = d.href; });

const capSel = gCap.selectAll("text").data(nodes.filter(n => n.level > 1)).enter().append("text")
  .attr("class", d => "cap " + (d.level === 3 ? "top" : "")).attr("text-anchor", "middle")
  .text(d => d.name);

const sim = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(kin.filter(k => !k.thread).concat(sig))
    .distance(d => !d.kind ? 34 : d.lvl === 3 ? 165 : d.lvl === 2 ? 108 : 90)
    .strength(d => !d.kind ? .32 : d.lvl === 1 ? .08 : .2))
  .force("charge", d3.forceManyBody().strength(d => d.level === 3 ? -900 : d.level === 2 ? -420 : -42))
  .force("collide", d3.forceCollide().radius(d => d.level === 1 ? 9 : d.r + 30).iterations(2))
  .force("x", d3.forceX(d => d.ax).strength(d => d.level === 1 ? .05 : .3))
  .force("y", d3.forceY(d => d.ay).strength(d => d.level === 1 ? .07 : .5))
  .alphaDecay(.022)
  .on("tick", tick);

function curve(a, b, k) {
  const dx = b.x - a.x, dy = b.y - a.y, r = Math.hypot(dx, dy) * (k || 2.4);
  return `M${a.x},${a.y}A${r},${r} 0 0,1 ${b.x},${b.y}`;
}
function tick() {
  nodes.forEach(n => {
    const lim = n.level === 1 ? 210 : n.level === 2 ? 70 : 40;
    n.x = Math.max(30, Math.min(NET_R, n.x));
    n.y = Math.max(BAND[n.level] - lim, Math.min(BAND[n.level] + lim, n.y));
  });
  threadSel.attr("d", d => `M${d.a.x},${d.a.y}L${d.b.x},${d.b.y}`);
  kinSel.attr("d", d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
  sigSel.attr("d", d => curve(d.source, d.target, 1.6));
  dotSel.attr("cx", d => d.x).attr("cy", d => d.y);
  capSel.attr("x", d => d.x).attr("y", d => d.y - d.r - 8);
}

dotSel.call(d3.drag()
  .on("start", (e, d) => { if (!e.active) sim.alphaTarget(.2).restart(); d.fx = d.x; d.fy = d.y; })
  .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
  .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

const LG = svg.append("g").attr("transform", "translate(740,0)");
function legend(y, head, rows, note) {
  const g = LG.append("g").attr("transform", `translate(0,${y})`);
  g.append("text").attr("class", "lg-head").text(head);
  rows.forEach((r, i) => {
    const row = g.append("g").attr("transform", `translate(0,${22 + i * 19})`)
      .style("cursor", "pointer")
      .on("mouseenter", () => liteGroup(r.key)).on("mouseleave", () => lite(null));
    row.append("circle").attr("cx", 5).attr("cy", -4).attr("r", 5)
      .attr("fill", r.colour).attr("stroke", BG).attr("stroke-width", 1.2);
    row.append("text").attr("class", "lg-item").attr("x", 18).text(r.label);
  });
  if (note) g.append("text").attr("class", "lg-note").attr("y", 22 + rows.length * 19 + 6).text(note);
  return g;
}
legend(BAND[3] - 60, "First level", REGISTERS.map(r => ({ key: "R:" + r.id, label: r.name, colour: REG_TONE[r.id] })));
legend(BAND[2] - 130, "Second level", GROUPS.map(g => ({ key: "G:" + g.id, label: g.name, colour: groupTone[g.id] })));
legend(BAND[1] - 210, "Third level", [], "60 components, coloured by their grouping");
legend(BAND[1] - 140, "Threads", [
  { key: "ext", label: "Extracts from", colour: EXT },
  { key: "sym", label: "Sustains", colour: SYM },
  { key: "agg", label: "Aggregates into", colour: FAINT }
]);

const roT = document.getElementById("ro-title"), roB = document.getElementById("ro-body");
const DEF = { t: roT.textContent, b: roB.innerHTML };

function apply(keepNode, keepEdge) {
  dotSel.classed("dim", n => !keepNode(n));
  capSel.classed("dim", n => !keepNode(n));
  threadSel.classed("dim", t => !(keepNode(t.a) && keepNode(t.b)));
  kinSel.classed("dim", k => !(keepNode(k.source) && keepNode(k.target)));
  sigSel.classed("dim", s => !keepEdge(s));
}
function reset() {
  dotSel.classed("dim", false); capSel.classed("dim", false);
  threadSel.classed("dim", false); kinSel.classed("dim", false); sigSel.classed("dim", false);
  roT.textContent = DEF.t; roB.innerHTML = DEF.b;
}
function lite(d) {
  if (!d) return reset();
  const fam = new Set([d]);
  if (d.level === 1) { fam.add(byId.get("G:" + d.group)); fam.add(byId.get("R:" + d.reg)); }
  if (d.level === 2) {
    fam.add(byId.get("R:" + d.reg)); if (d.also) fam.add(byId.get("R:" + d.also));
    nodes.forEach(n => { if (n.level === 1 && n.group === d.id) fam.add(n); });
  }
  if (d.level === 3) nodes.forEach(n => {
    if (n.level === 2 && (n.reg === d.id || n.also === d.id)) fam.add(n);
    if (n.level === 1 && n.reg === d.id) fam.add(n);
  });
  sig.forEach(s => { if (s.source === d || s.target === d) { fam.add(s.source); fam.add(s.target); } });
  apply(n => fam.has(n), s => s.source === d || s.target === d);
  roT.textContent = d.name;
  roB.textContent = d.note || "";
}
function liteGroup(key) {
  if (key === "ext" || key === "sym") {
    apply(n => n.level === 1, s => s.kind === key);
    roT.textContent = key === "ext" ? "Extracts from" : "Sustains";
    roB.textContent = key === "ext"
      ? "One thing consumes another: water into cooling, land into development, hardware into waste."
      : "One thing holds another up: peat and carbon, remediation and bog, archive and ruin.";
    return;
  }
  if (key === "agg") { reset(); return; }
  lite(byId.get(key));
}

document.getElementById("dl").addEventListener("click", () => {
  const clone = document.getElementById("strata").cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.querySelectorAll(".dim").forEach(el => el.classList.remove("dim"));
  const sheet = document.getElementById("net-style").textContent;
  const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
  st.textContent = sheet + `
    text { font-family: "Montserrat", "Helvetica Neue", Helvetica, Arial, sans-serif; }
    .thread { stroke: ${FAINT}; } .kin { stroke: ${FAINT}; }
    .dot { stroke: ${BG}; } .cap { stroke: ${BG}; fill: ${tone("--ink")}; }
    .band-key { fill: ${FAINT}; } .lg-head { fill: ${tone("--muted")}; }
    .lg-item { fill: ${tone("--ink")}; } .lg-note { fill: ${tone("--muted")}; }`;
  clone.insertBefore(st, clone.firstChild);
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "bogs-network.svg"; a.click();
  URL.revokeObjectURL(a.href);
});
