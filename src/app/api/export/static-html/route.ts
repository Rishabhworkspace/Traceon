import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { graphData, repoName } = await req.json();

        if (!graphData || !graphData.nodes) {
            return NextResponse.json({ error: 'Invalid graph data' }, { status: 400 });
        }

        const nodes = graphData.nodes || [];
        const edges = graphData.edges || [];
        const metrics = graphData.metrics || {};

        const htmlContent = generateStaticHTML(nodes, edges, metrics, repoName || 'Untitled');

        return new NextResponse(htmlContent, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="traceon-${repoName || 'graph'}-viewer.html"`,
            },
        });
    } catch (error) {
        console.error('Static HTML generation error:', error);
        return NextResponse.json({ error: 'Failed to generate HTML' }, { status: 500 });
    }
}

function generateStaticHTML(
    nodes: Array<{ id: string; label: string; type: string; loc: number; inDegree: number; outDegree: number }>,
    edges: Array<{ source: string; target: string; relationship: string }>,
    metrics: Record<string, unknown>,
    repoName: string
): string {
    const nodesJSON = JSON.stringify(nodes);
    const edgesJSON = JSON.stringify(edges);
    const metricsJSON = JSON.stringify(metrics);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Traceon — ${escapeHtml(repoName)} Dependency Graph</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080808;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;overflow:hidden;height:100vh}
#header{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:rgba(13,13,13,0.95);border-bottom:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(16px)}
.logo{display:flex;align-items:center;gap:8px}
.logo svg{width:20px;height:20px}
.logo span{font-size:14px;font-weight:700;color:#10b981;letter-spacing:0.5px}
.repo-name{font-size:12px;color:#9ca3af;font-weight:500}
.metrics-bar{display:flex;gap:16px;align-items:center}
.metric{text-align:center}
.metric-value{font-size:13px;font-weight:700;color:white}
.metric-label{font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:1px}
#canvas{width:100vw;height:100vh;padding-top:52px}
svg{width:100%;height:100%}
.node-group{cursor:pointer}
.node-rect{rx:12;ry:12;fill:#111;stroke:rgba(255,255,255,0.08);stroke-width:1.5;transition:stroke 0.2s}
.node-group:hover .node-rect{stroke:#10b981;stroke-width:2}
.node-label{font-size:11px;fill:#f3f4f6;font-weight:600;text-anchor:middle;pointer-events:none}
.node-meta{font-size:9px;fill:#6b7280;text-anchor:middle;pointer-events:none}
.edge-line{stroke:rgba(16,185,129,0.25);stroke-width:1.5;fill:none;marker-end:url(#arrowhead)}
.edge-line:hover{stroke:rgba(16,185,129,0.6);stroke-width:2.5}
.tooltip{position:fixed;padding:10px 14px;background:rgba(13,13,13,0.97);border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:11px;color:#d1d5db;pointer-events:none;z-index:200;display:none;max-width:280px;box-shadow:0 8px 32px rgba(0,0,0,0.5)}
.tooltip .tt-title{font-weight:700;color:white;margin-bottom:4px;font-size:12px}
.tooltip .tt-row{display:flex;justify-content:space-between;gap:16px;margin-top:2px}
.tooltip .tt-key{color:#6b7280}
.tooltip .tt-val{color:#10b981;font-weight:600;font-family:monospace}
.legend{position:fixed;bottom:16px;left:16px;padding:12px 16px;background:rgba(13,13,13,0.95);border:1px solid rgba(255,255,255,0.06);border-radius:12px;z-index:100}
.legend-title{font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.legend-item{display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px;color:#9ca3af}
.legend-dot{width:8px;height:8px;border-radius:50%}
.search-box{position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:100;display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(13,13,13,0.95);border:1px solid rgba(255,255,255,0.06);border-radius:10px}
.search-box input{background:transparent;border:none;color:#e5e5e5;font-size:12px;outline:none;width:180px}
.search-box input::placeholder{color:#4b5563}
.watermark{position:fixed;bottom:16px;right:16px;font-size:9px;color:rgba(255,255,255,0.1);font-family:monospace;z-index:100}
</style>
</head>
<body>
<div id="header">
    <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <span>traceon</span>
        <span class="repo-name">— ${escapeHtml(repoName)}</span>
    </div>
    <div class="metrics-bar">
        <div class="metric"><div class="metric-value">${(metrics as Record<string, number>).totalFiles || nodes.length}</div><div class="metric-label">Files</div></div>
        <div class="metric"><div class="metric-value">${(metrics as Record<string, number>).totalDependencies || edges.length}</div><div class="metric-label">Deps</div></div>
    </div>
</div>

<div class="search-box">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="text" id="searchInput" placeholder="Search files..." oninput="filterNodes(this.value)">
</div>

<div id="canvas"></div>
<div class="tooltip" id="tooltip"></div>

<div class="legend">
    <div class="legend-title">Legend</div>
    <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div>Entry Point</div>
    <div class="legend-item"><div class="legend-dot" style="background:#8b5cf6"></div>Component</div>
    <div class="legend-item"><div class="legend-dot" style="background:#06b6d4"></div>Utility</div>
    <div class="legend-item"><div class="legend-dot" style="background:#10b981"></div>Module</div>
    <div class="legend-item"><div class="legend-dot" style="background:#f97316"></div>Config</div>
    <div class="legend-item"><div class="legend-dot" style="background:#64748b"></div>Other</div>
</div>

<div class="watermark">Generated by Traceon • ${new Date().toLocaleDateString()}</div>

<script>
const TYPE_COLORS = {entry:'#f59e0b',component:'#8b5cf6',utility:'#06b6d4',module:'#10b981',config:'#f97316',other:'#64748b'};
const nodes = ${nodesJSON};
const edges = ${edgesJSON};

// Simple force-directed layout
const width = window.innerWidth;
const height = window.innerHeight - 52;

// Initialize positions using a grid-based approach for stability
const cols = Math.ceil(Math.sqrt(nodes.length));
nodes.forEach((n, i) => {
    n.x = (i % cols) * 200 + 150 + Math.random() * 40;
    n.y = Math.floor(i / cols) * 120 + 100 + Math.random() * 40;
    n.vx = 0; n.vy = 0;
});

// Build adjacency for force simulation
const edgeMap = new Map();
edges.forEach(e => {
    if (!edgeMap.has(e.source)) edgeMap.set(e.source, []);
    edgeMap.get(e.source).push(e.target);
});

// Run force simulation
function simulate(iterations) {
    for (let iter = 0; iter < iterations; iter++) {
        // Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                let dx = nodes[j].x - nodes[i].x;
                let dy = nodes[j].y - nodes[i].y;
                let dist = Math.sqrt(dx*dx + dy*dy) || 1;
                let force = 8000 / (dist * dist);
                let fx = (dx / dist) * force;
                let fy = (dy / dist) * force;
                nodes[i].vx -= fx; nodes[i].vy -= fy;
                nodes[j].vx += fx; nodes[j].vy += fy;
            }
        }
        // Attraction along edges
        edges.forEach(e => {
            let src = nodes.find(n => n.id === e.source);
            let tgt = nodes.find(n => n.id === e.target);
            if (!src || !tgt) return;
            let dx = tgt.x - src.x;
            let dy = tgt.y - src.y;
            let dist = Math.sqrt(dx*dx + dy*dy) || 1;
            let force = (dist - 180) * 0.01;
            let fx = (dx / dist) * force;
            let fy = (dy / dist) * force;
            src.vx += fx; src.vy += fy;
            tgt.vx -= fx; tgt.vy -= fy;
        });
        // Center gravity
        nodes.forEach(n => {
            n.vx += (width/2 - n.x) * 0.001;
            n.vy += (height/2 - n.y) * 0.001;
            n.x += n.vx * 0.5;
            n.y += n.vy * 0.5;
            n.vx *= 0.85;
            n.vy *= 0.85;
        });
    }
}

simulate(150);

// Render SVG
const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('viewBox', calculateViewBox());
svg.setAttribute('xmlns', svgNS);

// Defs for arrowhead
const defs = document.createElementNS(svgNS, 'defs');
const marker = document.createElementNS(svgNS, 'marker');
marker.setAttribute('id', 'arrowhead');
marker.setAttribute('markerWidth', '8');
marker.setAttribute('markerHeight', '6');
marker.setAttribute('refX', '8');
marker.setAttribute('refY', '3');
marker.setAttribute('orient', 'auto');
const arrowPath = document.createElementNS(svgNS, 'path');
arrowPath.setAttribute('d', 'M0,0 L0,6 L8,3 Z');
arrowPath.setAttribute('fill', 'rgba(16,185,129,0.4)');
marker.appendChild(arrowPath);
defs.appendChild(marker);
svg.appendChild(defs);

// Render edges
edges.forEach(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    if (!src || !tgt) return;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', src.x);
    line.setAttribute('y1', src.y);
    line.setAttribute('x2', tgt.x);
    line.setAttribute('y2', tgt.y);
    line.setAttribute('class', 'edge-line');
    line.setAttribute('data-source', src.id);
    line.setAttribute('data-target', tgt.id);
    svg.appendChild(line);
});

// Render nodes
nodes.forEach(n => {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'node-group');
    g.setAttribute('data-id', n.id);
    g.setAttribute('data-label', n.label.toLowerCase());

    const rectWidth = Math.max(140, n.label.length * 8 + 40);
    const rectHeight = 52;

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', n.x - rectWidth/2);
    rect.setAttribute('y', n.y - rectHeight/2);
    rect.setAttribute('width', rectWidth);
    rect.setAttribute('height', rectHeight);
    rect.setAttribute('class', 'node-rect');
    rect.setAttribute('stroke', TYPE_COLORS[n.type] || '#64748b');

    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', n.x);
    label.setAttribute('y', n.y - 4);
    label.setAttribute('class', 'node-label');
    label.textContent = n.label;

    const meta = document.createElementNS(svgNS, 'text');
    meta.setAttribute('x', n.x);
    meta.setAttribute('y', n.y + 12);
    meta.setAttribute('class', 'node-meta');
    meta.textContent = n.loc + ' LOC  ↓' + n.inDegree + '  ↑' + n.outDegree;

    // Type indicator dot
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', n.x - rectWidth/2 + 12);
    dot.setAttribute('cy', n.y);
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', TYPE_COLORS[n.type] || '#64748b');

    g.appendChild(rect);
    g.appendChild(dot);
    g.appendChild(label);
    g.appendChild(meta);

    // Tooltip events
    g.addEventListener('mouseenter', (ev) => showTooltip(ev, n));
    g.addEventListener('mouseleave', hideTooltip);

    svg.appendChild(g);
});

document.getElementById('canvas').appendChild(svg);

// Pan & Zoom
let viewBox = calculateViewBox().split(' ').map(Number);
let isPanning = false, startX, startY;
svg.addEventListener('mousedown', e => { isPanning = true; startX = e.clientX; startY = e.clientY; });
svg.addEventListener('mousemove', e => {
    if (!isPanning) return;
    const dx = (e.clientX - startX) * (viewBox[2] / width);
    const dy = (e.clientY - startY) * (viewBox[3] / height);
    viewBox[0] -= dx; viewBox[1] -= dy;
    svg.setAttribute('viewBox', viewBox.join(' '));
    startX = e.clientX; startY = e.clientY;
});
svg.addEventListener('mouseup', () => isPanning = false);
svg.addEventListener('mouseleave', () => isPanning = false);
svg.addEventListener('wheel', e => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.08 : 0.92;
    const mx = e.clientX / width;
    const my = e.clientY / height;
    const newW = viewBox[2] * scale;
    const newH = viewBox[3] * scale;
    viewBox[0] += (viewBox[2] - newW) * mx;
    viewBox[1] += (viewBox[3] - newH) * my;
    viewBox[2] = newW; viewBox[3] = newH;
    svg.setAttribute('viewBox', viewBox.join(' '));
}, {passive: false});

function calculateViewBox() {
    if (nodes.length === 0) return '0 0 ' + width + ' ' + height;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x); maxY = Math.max(maxY, n.y); });
    const pad = 200;
    return (minX-pad) + ' ' + (minY-pad) + ' ' + (maxX-minX+pad*2) + ' ' + (maxY-minY+pad*2);
}

function showTooltip(ev, node) {
    const tt = document.getElementById('tooltip');
    tt.innerHTML = '<div class="tt-title">' + node.label + '</div>'
        + '<div class="tt-row"><span class="tt-key">Type</span><span class="tt-val">' + node.type + '</span></div>'
        + '<div class="tt-row"><span class="tt-key">Lines</span><span class="tt-val">' + node.loc + '</span></div>'
        + '<div class="tt-row"><span class="tt-key">In-Degree</span><span class="tt-val">' + node.inDegree + '</span></div>'
        + '<div class="tt-row"><span class="tt-key">Out-Degree</span><span class="tt-val">' + node.outDegree + '</span></div>';
    tt.style.display = 'block';
    tt.style.left = (ev.clientX + 12) + 'px';
    tt.style.top = (ev.clientY + 12) + 'px';
}

function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

function filterNodes(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.node-group').forEach(g => {
        const label = g.getAttribute('data-label');
        const match = !q || label.includes(q);
        g.style.opacity = match ? '1' : '0.15';
    });
}
</script>
</body>
</html>`;
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
