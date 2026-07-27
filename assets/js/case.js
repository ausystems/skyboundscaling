/* ==========================================================================
   SKYBOUND SCALING - case.js
   Case-study pages (work/). Two jobs:

     1. The page's contained particle formation - one Three.js scene in the
        site's round-dot language (same sprite, palette, cursor-magnetic push,
        and pointer tilt as the home/contact scenes). The formation is chosen
        by the canvas's data-scene attribute:
          "frame"    - Saadi Builds: a detailed house front elevation (gable
                       roof + chimney, door, paned window, shrub, ground line),
                       drawn flat to match the brand's home-builder icon.
          "coin"     - VAZA: a dollar coin, built flat as a dense particle
                       stipple (ring + disc) with the dollar sign as negative space.
          "team"     - Ecom Heroes: three professionals standing together, a
                       blue lead figure in front of two ink teammates.
          "caduceus" - Callura: the medical symbol - winged staff, pommel, and
                       two entwined snakes - built flat to match the healthcare icon.
        No background particles - the formation is the page's one moment.

     2. The stat band's cursor-driven tilt - the same physical hover feel as
        the home page's conversion panel.

   Loads after core.js. Degrades gracefully: no WebGL, no GSAP, or
   prefers-reduced-motion all fall back to a static, readable page.
   ========================================================================== */
(function(){
'use strict';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = typeof gsap !== 'undefined';
var hasTHREE = typeof THREE !== 'undefined';
var pxr = (window.SKY && window.SKY.pxr) || function(){
  var dpr = window.devicePixelRatio || 1;
  var w = window.innerWidth;
  var cap = (w < 600) ? 1.5 : (w < 1024) ? 1.75 : 2;
  return Math.min(dpr, cap);
};

/* ---------- The case formation ---------- */
function buildCaseScene(){
  if (!hasTHREE) return;
  var canvas = document.getElementById('case-canvas');
  if (!canvas) return;
  var sceneKey = canvas.getAttribute('data-scene');
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e){ return; }
  renderer.setPixelRatio(pxr());

  // Identical soft round sprite to every other particle scene on the site
  var circleTexture = (function(){
    var size = 128;
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    var grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grd.addColorStop(0,    'rgba(255,255,255,1)');
    grd.addColorStop(0.5,  'rgba(255,255,255,1)');
    grd.addColorStop(0.85, 'rgba(255,255,255,0.55)');
    grd.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
    ctx.fill();
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  })();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);

  var ink = new THREE.Color(0x0A0A0C);
  var blue = new THREE.Color(0x2230FE);
  var orange = new THREE.Color(0xFF4D00);

  var dens = (window.innerWidth < 700) ? 0.7 : 1;
  var baseArr = [], colorsArr = [];
  function push(x, y, z, c){ baseArr.push(x, y, z); colorsArr.push(c.r, c.g, c.b); }
  // the site-wide accent mix: mostly ink, blue secondary, rare orange
  function brandMix(){
    var r = Math.random();
    return r < 0.05 ? orange : (r < 0.20 ? blue : ink);
  }

  /* === FORMATION BUILDERS ==================================== */

  // Particles distributed evenly along a 3D segment, with light jitter
  function edge(a, b, per, colorFn){
    var steps = Math.max(2, Math.round(per * dens));
    for (var i = 0; i < steps; i++){
      var t = i / (steps - 1);
      var jx = (Math.random() - 0.5) * 0.028;
      var jy = (Math.random() - 0.5) * 0.028;
      var jz = (Math.random() - 0.5) * 0.028;
      push(a[0] + (b[0]-a[0])*t + jx,
           a[1] + (b[1]-a[1])*t + jy,
           a[2] + (b[2]-a[2])*t + jz,
           colorFn());
    }
  }

  function sphereAt(cx, cy, cz, R, lats, lons, colorFn){
    var la = Math.round(lats * dens), lo = Math.round(lons * dens);
    for (var i = 0; i <= la; i++){
      var phi = (i / la) * Math.PI;
      var sp = Math.sin(phi), cp = Math.cos(phi);
      for (var j = 0; j < lo; j++){
        var th = (j / lo) * Math.PI * 2;
        push(cx + R*sp*Math.cos(th), cy + R*cp, cz + R*sp*Math.sin(th), colorFn());
      }
    }
  }

  function ringAt(rad, tilt, nn, colorFn){
    var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    var n = Math.round(nn * dens);
    for (var k = 0; k < n; k++){
      var a = (k / n) * Math.PI * 2;
      var jit = (Math.random() - 0.5) * 0.05;
      var x = Math.cos(a) * (rad + jit);
      var y = jit * 0.5;
      var z = Math.sin(a) * (rad + jit);
      push(x, y*cosT - z*sinT, y*sinT + z*cosT, colorFn());
    }
  }

  /* 2D-icon builders (front-elevation formations live in the XY plane, z≈0) */
  function rectEdges(x0, y0, x1, y1, per, colorFn){
    edge([x0,y0,0],[x1,y0,0], per, colorFn);
    edge([x1,y0,0],[x1,y1,0], per, colorFn);
    edge([x1,y1,0],[x0,y1,0], per, colorFn);
    edge([x0,y1,0],[x0,y0,0], per, colorFn);
  }
  function arc2(cx, cy, r, a0, a1, per, colorFn){
    var steps = Math.max(2, Math.round(per * dens));
    for (var i = 0; i < steps; i++){
      var t = i / (steps - 1);
      var a = a0 + (a1 - a0) * t;
      push(cx + Math.cos(a)*r + (Math.random()-0.5)*0.024,
           cy + Math.sin(a)*r + (Math.random()-0.5)*0.024,
           (Math.random()-0.5)*0.05, colorFn());
    }
  }
  function disc(cx, cy, r, count, colorFn){
    var n = Math.round(count * dens);
    for (var i = 0; i < n; i++){
      var rr = r * Math.sqrt(Math.random()), a = Math.random() * Math.PI * 2;
      push(cx + Math.cos(a)*rr, cy + Math.sin(a)*rr, (Math.random()-0.5)*0.05, colorFn());
    }
  }
  // quadratic bezier stroke - for the caduceus wings + snake curls
  function qbez(p0, c, p1, per, colorFn){
    var steps = Math.max(2, Math.round(per * dens));
    for (var i = 0; i < steps; i++){
      var t = i / (steps - 1), mt = 1 - t;
      var x = mt*mt*p0[0] + 2*mt*t*c[0] + t*t*p1[0];
      var y = mt*mt*p0[1] + 2*mt*t*c[1] + t*t*p1[1];
      push(x + (Math.random()-0.5)*0.02, y + (Math.random()-0.5)*0.02,
           (Math.random()-0.5)*0.05, colorFn());
    }
  }
  // bezier stroke on a chosen z plane - for the coin's dollar sign (drawn in front)
  function qbezZ(p0, c, p1, per, z, colorFn){
    var steps = Math.max(2, Math.round(per * dens));
    for (var i = 0; i < steps; i++){
      var t = i / (steps - 1), mt = 1 - t;
      var x = mt*mt*p0[0] + 2*mt*t*c[0] + t*t*p1[0];
      var y = mt*mt*p0[1] + 2*mt*t*c[1] + t*t*p1[1];
      push(x + (Math.random()-0.5)*0.018, y + (Math.random()-0.5)*0.018,
           z + (Math.random()-0.5)*0.04, colorFn());
    }
  }
  // full circle of points at a chosen z plane, with optional cutout guard
  function ringFlat(cx, cy, r, per, z, colorFn, skip){
    var n = Math.round(per * dens);
    for (var i = 0; i < n; i++){
      var a = (i / n) * Math.PI * 2;
      var x = cx + Math.cos(a)*r + (Math.random()-0.5)*0.025;
      var y = cy + Math.sin(a)*r + (Math.random()-0.5)*0.025;
      if (skip && skip(x, y)) continue;
      push(x, y, z + (Math.random()-0.5)*0.05, colorFn());
    }
  }
  function discZ(cx, cy, r, count, z, colorFn, skip){
    var n = Math.round(count * dens);
    for (var i = 0; i < n; i++){
      var rr = r * Math.sqrt(Math.random()), a = Math.random() * Math.PI * 2;
      var x = cx + Math.cos(a)*rr, y = cy + Math.sin(a)*rr;
      if (skip && skip(x, y)) continue;
      push(x, y, z + (Math.random()-0.5)*0.05, colorFn());
    }
  }

  /* formation setup */
  var FIT_HALF, groupTiltX = 0.16, groupTiltZ = 0.10;
  var flatIcon = false;   // front-elevation symbols get face-on parallax, no spin

  /* frame - Saadi Builds: a detailed house front elevation, drawn to match the
     brand's home-builder icon (gable roof + chimney, door, paned window, shrub,
     and a ground line). Built flat in the XY plane so it reads as the icon. */
  if (sceneKey === 'frame'){
    flatIcon = true;
    var inkMix  = function(){ var r = Math.random(); return r < 0.04 ? orange : (r < 0.20 ? blue : ink); };
    var roofMix = function(){ var r = Math.random(); return r < 0.06 ? orange : (r < 0.52 ? blue : ink); };
    var doorMix = function(){ var r = Math.random(); return r < 0.16 ? orange : (r < 0.30 ? blue : ink); };
    var winMix  = function(){ var r = Math.random(); return r < 0.38 ? blue : (r < 0.44 ? orange : ink); };
    var bushMix = function(){ var r = Math.random(); return r < 0.42 ? blue : (r < 0.48 ? orange : ink); };

    // ground - a thick baseline the house sits on
    edge([-1.78,-1.55,0],[ 1.78,-1.55,0], 230, inkMix);
    edge([-1.74,-1.46,0],[ 1.74,-1.46,0], 220, inkMix);

    // side walls
    edge([-1.12,-1.46,0],[-1.12, 0.14,0], 150, inkMix);
    edge([ 1.02,-1.46,0],[ 1.02, 0.14,0], 150, inkMix);

    // gable roof drawn as a thick hollow chevron (outer + inner edges + eave caps)
    edge([-1.66, 0.02,0],[-0.02, 1.26,0], 180, roofMix);   // outer left slope
    edge([-0.02, 1.26,0],[ 1.54, 0.02,0], 180, roofMix);   // outer right slope
    edge([-1.40, 0.16,0],[-0.02, 1.00,0], 155, roofMix);   // inner left slope
    edge([-0.02, 1.00,0],[ 1.28, 0.16,0], 155, roofMix);   // inner right slope
    edge([-1.66, 0.02,0],[-1.40, 0.16,0],  22, roofMix);   // left eave cap
    edge([ 1.54, 0.02,0],[ 1.28, 0.16,0],  22, roofMix);   // right eave cap

    // chimney - tall narrow stack on the upper right, rising through the roof
    edge([0.60, 0.52,0],[0.60, 1.52,0], 96, inkMix);       // left side
    edge([0.92, 0.30,0],[0.92, 1.52,0], 110, inkMix);      // right side (meets roof lower)
    edge([0.60, 1.52,0],[0.92, 1.52,0], 30, inkMix);       // cap

    // door - tall opening on the left, sitting on the ground
    edge([-0.82,-1.46,0],[-0.82,-0.02,0], 132, doorMix);   // left jamb
    edge([-0.34,-1.46,0],[-0.34,-0.02,0], 132, doorMix);   // right jamb
    edge([-0.82,-0.02,0],[-0.34,-0.02,0],  46, doorMix);   // lintel

    // window - 2×2 paned square on the right
    rectEdges(0.16,-0.52, 0.74, 0.06, 56, winMix);
    edge([0.45,-0.52,0],[0.45, 0.06,0], 56, winMix);        // vertical mullion
    edge([0.16,-0.23,0],[0.74,-0.23,0], 56, winMix);        // horizontal mullion

    // shrub - a rounded three-lobe bush on the ground, front right
    arc2(0.88,-1.44, 0.22, Math.PI*0.04, Math.PI*0.96, 62, bushMix);
    arc2(1.42,-1.44, 0.24, Math.PI*0.04, Math.PI*0.96, 66, bushMix);
    arc2(1.16,-1.30, 0.30, Math.PI*0.02, Math.PI*0.98, 82, bushMix);

    FIT_HALF = 1.82 + 0.5;
    groupTiltX = 0.02;
    groupTiltZ = 0.0;

  /* coin - VAZA: a dollar coin, the stake behind every take. Built flat from a
     dense particle stipple of the icon: a bold outer ring, a clean empty gap,
     and a filled inner disc, with the serif dollar sign left as crisp negative
     space so the light shows through exactly like the white $ on the black coin. */
  } else if (sceneKey === 'coin'){
    flatIcon = true;

    var coinMix = function(){ var r = Math.random(); return r < 0.05 ? orange : (r < 0.20 ? blue : ink); };

    // concentric radii: outer ring [R2,R1], empty gap [R3,R2], inner disc [0,R3]
    var R1 = 1.5, R2 = 1.28, R3 = 1.12;

    // --- the serif dollar sign, kept as a bold hole in the inner disc:
    //     a vertical bar with top/bottom serifs through an S of two curves.
    var dollar = [], DHW = 0.17;
    for (var dv = 0; dv <= 54; dv++) dollar.push([0, 0.9 - dv/54 * 1.8]);        // vertical bar
    for (var ds = -1; ds <= 1; ds += 2){                                          // top + bottom serifs
      for (var dh = 0; dh <= 8; dh++){ dollar.push([-0.11 + dh/8 * 0.22, ds * 0.86]); }
    }
    function bezSample(p0, cc, p1, n){
      for (var s = 0; s <= n; s++){ var t = s/n, mt = 1-t;
        dollar.push([mt*mt*p0[0] + 2*mt*t*cc[0] + t*t*p1[0], mt*mt*p0[1] + 2*mt*t*cc[1] + t*t*p1[1]]); }
    }
    bezSample([ 0.34, 0.52], [-0.5, 0.4 ], [-0.06, 0.02], 46);                    // upper S bowl
    bezSample([-0.06, 0.02], [ 0.5, -0.4], [-0.34, -0.52], 46);                   // lower S bowl
    var DHW2 = DHW * DHW;
    function inDollar(x, y){
      if (x < -0.5 || x > 0.5 || y < -1.0 || y > 1.0) return false;
      for (var i = 0; i < dollar.length; i++){
        var dx = x - dollar[i][0], dy = y - dollar[i][1];
        if (dx*dx + dy*dy < DHW2) return true;
      }
      return false;
    }

    // --- outer ring: uniform-area polar fill of the annulus [R2, R1] ---
    var ringN = Math.round(2500 * dens);
    for (var ri = 0; ri < ringN; ri++){
      var ra = Math.random() * Math.PI * 2;
      var rr = Math.sqrt(R2*R2 + Math.random() * (R1*R1 - R2*R2));
      push(Math.cos(ra) * rr, Math.sin(ra) * rr, (Math.random() - 0.5) * 0.06, coinMix());
    }

    // --- inner disc: uniform-area polar fill of [0, R3], minus the dollar ---
    var discTarget = Math.round(4000 * dens), placed = 0, attempts = 0, maxAtt = discTarget * 6;
    while (placed < discTarget && attempts < maxAtt){
      attempts++;
      var da = Math.random() * Math.PI * 2;
      var dr = R3 * Math.sqrt(Math.random());
      var px = Math.cos(da) * dr, py = Math.sin(da) * dr;
      if (inDollar(px, py)) continue;
      push(px, py, (Math.random() - 0.5) * 0.06, coinMix());
      placed++;
    }

    FIT_HALF = R1 + 0.42;
    groupTiltX = 0.02;
    groupTiltZ = 0.0;

  /* team - Ecom Heroes: a vetted team, three professionals standing together.
     Built flat as a dense particle stipple of the classic team icon: a lead
     figure in front (blue, the hero) flanked by two teammates behind (ink),
     each a head circle over a rounded-shoulder silhouette with a clean neck
     gap, the front figure cutting cleanly into the two behind. */
  } else if (sceneKey === 'team'){
    flatIcon = true;

    var leadMix = function(){ var r = Math.random(); return r < 0.06 ? orange : (r < 0.72 ? blue : ink); };
    var mateMix = function(){ var r = Math.random(); return r < 0.05 ? orange : (r < 0.20 ? blue : ink); };

    // a person: head disc + rounded-shoulder dome with a flat base, neck gap
    function person(cx, cy, s){
      return {
        hx: cx, hy: cy + 0.72*s, hr: 0.34*s,          // head
        sx: cx, sy: cy - 0.75*s, rx: 0.72*s, ry: 1.0*s,  // shoulders ellipse
        base: cy - 1.22*s                              // flat bottom cut
      };
    }
    function inPerson(p, x, y){
      var dx = x - p.hx, dy = y - p.hy;
      if (dx*dx + dy*dy < p.hr*p.hr) return true;      // head
      var ex = (x - p.sx) / p.rx, ey = (y - p.sy) / p.ry;
      return (ex*ex + ey*ey < 1) && (y > p.base);      // shoulders dome
    }
    // reject-sampled stipple of one person, skipping occluded points
    function fillPerson(p, count, z, colorFn, skip){
      var x0 = p.sx - p.rx - 0.02, x1 = p.sx + p.rx + 0.02;
      var y0 = p.base, y1 = p.hy + p.hr + 0.02;
      var placed = 0, att = 0, maxAtt = count * 8;
      while (placed < count && att < maxAtt){
        att++;
        var x = x0 + Math.random() * (x1 - x0);
        var y = y0 + Math.random() * (y1 - y0);
        if (!inPerson(p, x, y)) continue;
        if (skip && skip(x, y)) continue;
        push(x, y, z + (Math.random() - 0.5) * 0.06, colorFn());
        placed++;
      }
    }

    var LEAD = person(0, -0.02, 1.0);                  // front and center
    var PAD  = person(0, -0.02, 1.09);                 // padded silhouette for clean bites
    var LEFT = person(-1.06, 0.16, 0.8);               // teammates behind
    var RIGHT= person( 1.06, 0.16, 0.8);
    function behindSkip(x, y){ return inPerson(PAD, x, y); }

    fillPerson(LEFT,  Math.round(1150 * dens), 0,    mateMix, behindSkip);
    fillPerson(RIGHT, Math.round(1150 * dens), 0,    mateMix, behindSkip);
    fillPerson(LEAD,  Math.round(1800 * dens), 0.12, leadMix, null);

    FIT_HALF = 1.62 + 0.45;
    groupTiltX = 0.02;
    groupTiltZ = 0.0;

  /* caduceus - Callura: the medical symbol (winged staff, pommel, and two
     entwined snakes) built flat in the XY plane to match the healthcare icon.
     Snakes lean blue, the pommel is an orange focal, wings + staff read ink. */
  } else {
    flatIcon = true;
    var staffMix = function(){ var r = Math.random(); return r < 0.06 ? orange : (r < 0.30 ? blue : ink); };
    var wingMix  = function(){ var r = Math.random(); return r < 0.05 ? orange : (r < 0.32 ? blue : ink); };
    var snakeMix = function(){ var r = Math.random(); return r < 0.64 ? blue : (r < 0.74 ? orange : ink); };

    // central staff - a thin filled column tapering to a point at the bottom
    edge([ 0.00,-1.50,0],[ 0.00, 1.12,0], 230, staffMix);
    edge([-0.055,-1.42,0],[-0.055, 1.06,0], 200, staffMix);
    edge([ 0.055,-1.42,0],[ 0.055, 1.06,0], 200, staffMix);
    edge([-0.11,-1.16,0],[ 0.00,-1.60,0], 44, staffMix);   // pointed tip
    edge([ 0.11,-1.16,0],[ 0.00,-1.60,0], 44, staffMix);
    // small cross-guard low on the staff
    edge([-0.30,-1.02,0],[ 0.30,-1.02,0], 40, staffMix);

    // pommel - the round ball at the very top (orange focal)
    edge([0.00,1.10,0],[0.00,1.20,0], 12, staffMix);       // neck
    disc(0.00, 1.34, 0.165, 130, function(){ return Math.random() < 0.62 ? orange : ink; });

    // wings - a feathered fan sweeping out from just below the pommel, mirrored
    for (var wsd = -1; wsd <= 1; wsd += 2){
      // upper wing contour: out and slightly up, curling down at the tip
      qbez([wsd*0.08, 1.05], [wsd*0.52, 1.36], [wsd*1.08, 1.14], 66, wingMix);
      for (var wf = 0; wf < 5; wf++){
        var fr = wf / 4;
        var root = [wsd*0.09, 1.03 - fr*0.015];
        var ctrl = [wsd*(0.30 + fr*0.30), 1.30 - fr*0.12];
        var tip  = [wsd*(0.46 + fr*0.60), 1.16 - fr*0.32];
        qbez(root, ctrl, tip, 40 - wf*3, wingMix);
      }
    }

    // two snakes - sine strands weaving around the staff (opposite phase),
    // each drawn twice with a small offset so the bodies read thick
    var SN_PER = 330, SN_FREQ = 3.0, SN_TOP = 0.94, SN_BOT = -1.02;
    for (var strand = 0; strand < 2; strand++){
      var phase = strand * Math.PI;
      for (var pass = 0; pass < 2; pass++){
        var off = (pass === 0) ? 0.05 : -0.05;
        var steps = Math.round(SN_PER * dens);
        for (var si = 0; si < steps; si++){
          var t = si / (steps - 1);
          var yy = SN_BOT + t * (SN_TOP - SN_BOT);
          var amp = 0.42 * (0.30 + 0.70 * Math.sin(t * Math.PI));
          var ang = t * Math.PI * SN_FREQ + phase;
          push(amp * Math.sin(ang) + off,
               yy + (Math.random()-0.5)*0.02,
               0.14 * Math.cos(ang) + (Math.random()-0.5)*0.03,
               snakeMix());
        }
      }
      // snake head - a small disc + tongue where the strand rises near the top
      var ht = SN_TOP, ha = ht * Math.PI * SN_FREQ + phase;
      var hx = 0.42 * (0.30 + 0.70 * Math.sin(ht * Math.PI)) * Math.sin(ha);
      var hy = SN_BOT + ht * (SN_TOP - SN_BOT);
      disc(hx, hy + 0.06, 0.085, 34, function(){ return Math.random() < 0.75 ? blue : ink; });
      disc(hx + (hx >= 0 ? 0.02 : -0.02), hy + 0.06, 0.02, 5, function(){ return orange; });
    }

    FIT_HALF = 1.66 + 0.5;
    groupTiltX = 0.02;
    groupTiltZ = 0.0;
  }

  var N = baseArr.length / 3;
  var basePositions = new Float32Array(baseArr);
  var positions = new Float32Array(baseArr);
  var displacements = new Float32Array(baseArr.length);

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colorsArr, 3));
  var mat = new THREE.PointsMaterial({
    size: 0.072,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.94,
    map: circleTexture,
    alphaTest: 0.05,
    depthWrite: false
  });
  var points = new THREE.Points(geo, mat);
  var group = new THREE.Group();
  group.add(points);
  group.rotation.x = groupTiltX;
  group.rotation.z = groupTiltZ;
  scene.add(group);

  /* intro reveal - driven per-frame so it never conflicts with resize logic */
  var intro = { v: (reduced || !hasGSAP) ? 1 : 0.0001 };
  if (!reduced && hasGSAP){
    gsap.to(intro, { v: 1, duration: 1.7, ease: 'expo.out', delay: 0.4 });
  }

  // Cursor: gentle tilt + the same magnetic push as the other scenes
  var cursorActive = false;
  var cursorScreen = new THREE.Vector2(-1000, -1000);
  var cursorLocal = new THREE.Vector3(100, 100, 100);
  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var tmpVec = new THREE.Vector3();
  var tiltX = 0, tiltY = 0, curTX = 0, curTY = 0;

  if (!reduced){
    canvas.addEventListener('pointermove', function(e){
      var rect = canvas.getBoundingClientRect();
      cursorScreen.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      cursorScreen.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      cursorActive = true;
      // flat icons get a lighter parallax so their edges never swing out of view
      tiltX = cursorScreen.x * (flatIcon ? 0.3 : 0.5);
      tiltY = -cursorScreen.y * (flatIcon ? 0.2 : 0.28);
    }, { passive: true });
    canvas.addEventListener('pointerleave', function(){
      cursorActive = false;
      tiltX = 0; tiltY = 0;
    });
  }

  function updateCursorLocal(){
    if (!cursorActive){
      cursorLocal.set(100, 100, 100);
      return;
    }
    raycaster.setFromCamera(cursorScreen, camera);
    if (raycaster.ray.intersectPlane(plane, tmpVec)){
      cursorLocal.copy(tmpVec);
      group.worldToLocal(cursorLocal);
    }
  }

  // Auto-frame the formation for any box aspect so nothing ever clips
  function place(){
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    var aspect = w / h;
    camera.aspect = aspect;
    var tan = Math.tan(camera.fov * Math.PI / 180 / 2);
    var dV = FIT_HALF / tan;
    var dH = FIT_HALF / (tan * aspect);
    camera.position.z = Math.max(dV, dH);
    camera.updateProjectionMatrix();
  }
  place();
  window.addEventListener('resize', place);

  // Render only while the formation is on screen
  var isVisible = true;
  if ('IntersectionObserver' in window){
    isVisible = false;
    new IntersectionObserver(function(entries){
      isVisible = entries[0].isIntersecting;
    }, { rootMargin: '120px' }).observe(canvas);
  }

  var time = 0;
  var hoverRadius = 1.1;
  var hoverRadiusSq = hoverRadius * hoverRadius;
  var hoverStrength = 0.26;

  function tick(){
    requestAnimationFrame(tick);
    if (!isVisible) return;
    time += 0.016;

    // idle motion per formation
    if (flatIcon){
      // front-elevation symbols (house / caduceus): stay face-on, add only a
      // gentle drifting parallax + cursor tilt so the shape is always legible
      group.rotation.y = curTX + Math.sin(time * 0.32) * 0.04;
      group.rotation.x = groupTiltX + curTY + Math.sin(time * 0.26) * 0.028;
      group.rotation.z = groupTiltZ + Math.sin(time * 0.2) * 0.012;
    } else {
      // matchup: the two sides orbit the shared arena
      group.rotation.y = time * 0.3 + curTX;
      group.rotation.x = 0.2 + Math.sin(time * 0.4) * 0.03 + curTY;
    }
    curTX += (tiltX - curTX) * 0.05;
    curTY += (tiltY - curTY) * 0.05;
    group.position.y = Math.sin(time * 0.5) * 0.045;

    var breath = 1 + Math.sin(time * 0.4) * 0.012;
    group.scale.setScalar(breath * intro.v);
    mat.opacity = 0.94 * Math.min(1, intro.v);

    group.updateMatrixWorld(true);
    updateCursorLocal();
    var cx = cursorLocal.x, cy = cursorLocal.y, cz = cursorLocal.z;
    var posArr = geo.attributes.position.array;

    for (var pi = 0; pi < N; pi++){
      var i3 = pi * 3;
      var bx = basePositions[i3];
      var by = basePositions[i3 + 1];
      var bz = basePositions[i3 + 2];

      var dx = bx - cx, dy = by - cy, dz = bz - cz;
      var distSq = dx*dx + dy*dy + dz*dz;

      var tDx = 0, tDy = 0, tDz = 0;
      if (cursorActive && distSq < hoverRadiusSq && distSq > 0.0001){
        var dist = Math.sqrt(distSq);
        var f = 1 - dist / hoverRadius;
        f = f * f;
        var k = f * hoverStrength / dist;
        tDx = dx * k; tDy = dy * k; tDz = dz * k;
      }
      var lf = (tDx === 0 && tDy === 0 && tDz === 0) ? 0.065 : 0.1;
      displacements[i3]     += (tDx - displacements[i3])     * lf;
      displacements[i3 + 1] += (tDy - displacements[i3 + 1]) * lf;
      displacements[i3 + 2] += (tDz - displacements[i3 + 2]) * lf;

      posArr[i3]     = bx + displacements[i3];
      posArr[i3 + 1] = by + displacements[i3 + 1];
      posArr[i3 + 2] = bz + displacements[i3 + 2];
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  if (reduced){ renderer.render(scene, camera); }
  else { tick(); }
}
buildCaseScene();

/* ---------- Stat band: cursor-driven tilt + lift ---------- */
(function(){
  var panel = document.querySelector('.case-stat');
  if (!panel) return;
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;

  var raf = null;
  var rx = 0, ry = 0, lift = 0, scale = 1;
  var trx = 0, try_ = 0, tlift = 0, tscale = 1;

  function loop(){
    rx   += (trx   - rx)   * 0.12;
    ry   += (try_  - ry)   * 0.12;
    lift += (tlift - lift) * 0.12;
    scale+= (tscale- scale)* 0.12;
    panel.style.transform =
      'perspective(1100px) rotateX(' + ry.toFixed(2) + 'deg) rotateY(' + rx.toFixed(2) + 'deg)' +
      ' translateY(' + lift.toFixed(1) + 'px) scale(' + scale.toFixed(4) + ')';
    if (Math.abs(trx-rx) > 0.01 || Math.abs(try_-ry) > 0.01 ||
        Math.abs(tlift-lift) > 0.05 || Math.abs(tscale-scale) > 0.0005){
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }
  function kick(){ if (!raf) raf = requestAnimationFrame(loop); }

  panel.addEventListener('pointerenter', function(){
    tlift = -8; tscale = 1.012;
    kick();
  });
  panel.addEventListener('pointermove', function(e){
    var r = panel.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;
    var py = (e.clientY - r.top) / r.height;
    trx = (px - 0.5) * 14;
    try_ = (0.5 - py) * 11;
    kick();
  });
  panel.addEventListener('pointerleave', function(){
    trx = 0; try_ = 0; tlift = 0; tscale = 1;
    kick();
  });
})();
})();
