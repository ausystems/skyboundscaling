/* ==========================================================================
   SKYBOUND SCALING - home.js
   The home page experience: preloader handoff, the hero particle orb, the
   manifesto helix, the two pinned cinematic scenes (Services + Process,
   fed by the point-cloud data in assets/js/data/), the hero typewriter,
   wordmark cursor kerning, CTA panel tilt, and the home-only scroll
   choreography (statement scrub, revenue counter, manifesto parallax).

   Loads after core.js. All scenes degrade gracefully: no WebGL, no GSAP,
   or prefers-reduced-motion each fall back to a static, fully readable page.
   ========================================================================== */
(function(){
'use strict';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = typeof gsap !== 'undefined';
var hasST = typeof ScrollTrigger !== 'undefined';
var hasTHREE = typeof THREE !== 'undefined';
/* Cap renderer pixel ratio: full on desktop, lighter on phones/tablets so the
   particle scenes stay smooth on mobile GPUs without a visible quality drop. */
function pxr(){
  var dpr = window.devicePixelRatio || 1;
  var w = window.innerWidth;
  var cap = (w < 600) ? 1.5 : (w < 1024) ? 1.75 : 2;
  return Math.min(dpr, cap);
}

/* Hero visibility gate - the orb's render loop skips all work once the
   viewport has scrolled past the hero. */
var heroInView = true;
function heroGate(){ heroInView = window.scrollY < window.innerHeight * 1.25; }
window.addEventListener('scroll', heroGate, { passive: true });
heroGate();

/* ---------- Three.js particle orb ---------- */
function buildOrb(){
  if (!hasTHREE) return;
  var canvas = document.getElementById('orb-canvas');
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e){ return; }
  renderer.setPixelRatio(pxr());

  // Circular sprite - same as process & services sections so all dots are round
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
  camera.position.z = 4.6;

  var R = 1.32;
  var positions = [], colors = [];
  var ink = new THREE.Color(0x0A0A0C);
  var blue = new THREE.Color(0x2230FE);
  var orange = new THREE.Color(0xFF4D00);

  function push(x, y, z, c){ positions.push(x, y, z); colors.push(c.r, c.g, c.b); }

  // SPHERE: lat/lon distributed particles, like a brand globe
  var dens = (window.innerWidth < 700) ? 0.6 : (window.innerWidth < 1024 ? 0.78 : 1);
  var lats = Math.round(30 * dens), lons = Math.round(56 * dens);
  for (var i = 0; i <= lats; i++){
    var phi = (i / lats) * Math.PI;
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);
    for (var j = 0; j < lons; j++){
      var theta = (j / lons) * Math.PI * 2;
      var x = R * sinPhi * Math.cos(theta);
      var y = R * cosPhi;
      var z = R * sinPhi * Math.sin(theta);
      var rand = Math.random();
      var c = rand < 0.045 ? orange : (rand < 0.16 ? blue : ink);
      push(x, y, z, c);
    }
  }

  // ORBITAL RING: tilted ring of particles around the sphere
  var ringN = Math.round(1100 * dens);
  var ringR = R * 1.55;
  var tilt = 0.34; // tilt around X axis
  var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
  for (var k = 0; k < ringN; k++){
    var a = (k / ringN) * Math.PI * 2;
    var jit = (Math.random() - 0.5) * 0.05;
    var rr = ringR + jit;
    var bx = Math.cos(a) * rr;
    var by = jit * 0.5;
    var bz = Math.sin(a) * rr;
    // tilt around X
    var ty = by * cosT - bz * sinT;
    var tz = by * sinT + bz * cosT;
    var rd = Math.random();
    var cr = rd < 0.22 ? blue : (rd < 0.27 ? orange : ink);
    push(bx, ty, tz, cr);
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  var mat = new THREE.PointsMaterial({
    size: 0.048,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.92,
    map: circleTexture,
    alphaTest: 0.05,
    depthWrite: false
  });
  var orb = new THREE.Points(geo, mat);
  var group = new THREE.Group();
  group.add(orb);
  group.rotation.x = 0.18;
  group.rotation.z = 0.12;
  scene.add(group);

  /* intro reveal: scale + fade the orb up on load (driven each frame so it
     never conflicts with the resize/pointer logic below) */
  var orbIntro = { v: (reduced || !hasGSAP) ? 1 : 0.0001 };

  var mx = 0, my = 0, tx = 0, ty = 0;
  if (!reduced){
    window.addEventListener('pointermove', function(e){
      tx = (e.clientX / window.innerWidth - 0.5) * 0.9;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.6;
    }, { passive: true });
  }

  function place(){
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    var narrow = w < 720 || h > w;   // phone, or any portrait (incl. portrait tablet)
    group.position.x = narrow ? 0.1 : (w > 1300 ? 1.3 : 0.95);
    group.position.y = narrow ? 0.62 : 0.34;
    group.userData.bs = narrow ? 0.44 : 0.78;
    group.scale.setScalar(group.userData.bs * orbIntro.v);
    camera.updateProjectionMatrix();
  }
  place();
  window.addEventListener('resize', place);
  if (!reduced && hasGSAP){
    gsap.to(orbIntro, { v: 1, duration: 1.8, ease: 'expo.out', delay: 2.95 });
  }

  var spin = reduced ? 0 : 0.0032;
  function tickFrame(){
    requestAnimationFrame(tickFrame);
    if (!heroInView) return;          /* skip all work when scrolled past the hero */
    orb.rotation.y += spin;
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;
    group.rotation.y = mx;
    group.rotation.x = 0.18 + my;
    group.scale.setScalar((group.userData.bs || 0.78) * orbIntro.v);
    mat.opacity = 0.92 * Math.min(1, orbIntro.v);
    renderer.render(scene, camera);
  }
  if (reduced){ renderer.render(scene, camera); }
  else { tickFrame(); }
}
buildOrb();

/* ---------- Three.js particle twist (manifesto) ---------- */
function buildTwist(){
  if (!hasTHREE) return;
  var canvas = document.getElementById('twist-canvas');
  if (!canvas) return;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e){ return; }
  renderer.setPixelRatio(pxr());

  // Circular sprite - matches the round dots on every other section
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
  camera.position.z = 5.9;

  var basePositionsArr = [];
  var colorsArr = [];
  var ink = new THREE.Color(0x0A0A0C);
  var blue = new THREE.Color(0x2230FE);
  var orange = new THREE.Color(0xFF4D00);

  function pushP(x, y, z, c){
    basePositionsArr.push(x, y, z);
    colorsArr.push(c.r, c.g, c.b);
  }

  // OUTER MULTI-STRAND HELIX: 6 strands twisting around the vertical axis.
  // Scaled up significantly with denser particles per strand for thicker visual weight.
  var strands = 6;
  var twDens = (window.innerWidth < 700) ? 0.6 : (window.innerWidth < 1024 ? 0.8 : 1);
  var ppS = Math.round(260 * twDens);
  var height = 3.7;
  var radius = 1.2;
  var twists = 1.7;

  for (var s = 0; s < strands; s++){
    var phase = (s / strands) * Math.PI * 2;
    for (var i = 0; i < ppS; i++){
      var t = i / (ppS - 1);
      var theta = phase + t * twists * Math.PI * 2;
      var r = radius * (1 + Math.sin(t * Math.PI * 3 + s * 0.7) * 0.045);
      var x = r * Math.cos(theta);
      var z = r * Math.sin(theta);
      var y = (t - 0.5) * height;
      var rand = Math.random();
      var c = rand < 0.22 ? orange : (rand < 0.70 ? blue : ink);
      pushP(x, y, z, c);
    }
  }

  // INNER COUNTER-HELIX: 3 strands twisting opposite direction at smaller radius
  var iStrands = 3;
  var ippS = Math.round(200 * twDens);
  var iRadius = 0.62;
  var iTwists = -2.3;

  for (var s2 = 0; s2 < iStrands; s2++){
    var phase2 = (s2 / iStrands) * Math.PI * 2;
    for (var i2 = 0; i2 < ippS; i2++){
      var t2 = i2 / (ippS - 1);
      var theta2 = phase2 + t2 * iTwists * Math.PI * 2;
      var x2 = iRadius * Math.cos(theta2);
      var z2 = iRadius * Math.sin(theta2);
      var y2 = (t2 - 0.5) * height * 0.96;
      var r2 = Math.random();
      var c2 = r2 < 0.22 ? orange : (r2 < 0.70 ? blue : ink);
      pushP(x2, y2, z2, c2);
    }
  }

  var particleCount = basePositionsArr.length / 3;
  var basePositions = new Float32Array(basePositionsArr);
  var positions = new Float32Array(basePositionsArr);
  var displacements = new Float32Array(basePositionsArr.length);

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colorsArr, 3));

  // Round circle dots matching the visual weight of the other sections
  var mat = new THREE.PointsMaterial({
    size: 0.072,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 1.0,
    map: circleTexture,
    alphaTest: 0.05,
    depthWrite: false
  });
  var twist = new THREE.Points(geo, mat);
  var group = new THREE.Group();
  group.add(twist);
  group.rotation.x = 0.06;
  scene.add(group);

  // Cursor tracking for the interactive hover deformation field
  var cursorActive = false;
  var cursorScreen = new THREE.Vector2(-1000, -1000);
  var cursorLocal = new THREE.Vector3(100, 100, 100);
  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var tmpVec = new THREE.Vector3();
  var tyTarget = 0;
  var my = 0;

  if (!reduced){
    canvas.addEventListener('pointermove', function(e){
      var rect = canvas.getBoundingClientRect();
      cursorScreen.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      cursorScreen.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      cursorActive = true;
      tyTarget = -cursorScreen.y * 0.32;
    }, { passive: true });
    canvas.addEventListener('pointerleave', function(){
      cursorActive = false;
      tyTarget = 0;
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

  function place(){
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 360 ? 7.6 : (w < 520 ? 6.7 : 5.9);
    camera.updateProjectionMatrix();
  }
  place();
  window.addEventListener('resize', place);

  var isVisible = true;
  if (hasST && !reduced){
    ScrollTrigger.create({
      trigger: '#manifesto',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: function(self){
        isVisible = self.isActive;
        if (!isVisible){ cursorActive = false; tyTarget = 0; }
      }
    });
  }

  var spin = reduced ? 0 : 0.0032;
  var time = 0;

  // Hover deformation parameters - tuned for fluid, premium feel
  var hoverRadius = 1.05;
  var hoverRadiusSq = hoverRadius * hoverRadius;
  var hoverStrength = 0.42;
  var pushFactor = 0.1;     // how fast particles respond to cursor
  var returnFactor = 0.065; // slower return for elegant settle

  function tickFrame(){
    if (isVisible){
      time += 0.016;

      // Twisting motion - layered + eased so the spin breathes instead of
      // running at a flat, mechanical rate. The speed easing is a pure sine
      // (fully differentiable), so the rotation never jerks.
      var spinVel = spin * (1 + Math.sin(time * 0.18) * 0.4);   // ~0.6x .. 1.4x speed
      twist.rotation.y += spinVel;

      // Floating sway: two low frequencies keep the rise/fall from looping
      // obviously, plus a very gentle roll for a refined, drifting 3D feel.
      group.position.y = Math.sin(time * 0.55) * 0.055 + Math.sin(time * 0.21) * 0.03;
      group.rotation.z = Math.sin(time * 0.26) * 0.035;

      // Cursor-driven tilt (unchanged response) with a faint idle nod layered on top
      my += (tyTarget - my) * 0.05;
      group.rotation.x = 0.06 + my * 0.55 + Math.sin(time * 0.31) * 0.02;

      // Subtle breathing scale for depth and life
      var twBreath = 1 + Math.sin(time * 0.4) * 0.012;
      group.scale.set(twBreath, twBreath, twBreath);

      // Resolve cursor into local space so the deformation rotates with the helix
      group.updateMatrixWorld(true);
      updateCursorLocal();

      var cx = cursorLocal.x;
      var cy = cursorLocal.y;
      var cz = cursorLocal.z;

      var posArr = geo.attributes.position.array;

      // Per-particle displacement pass: compute target push, lerp, write to buffer
      for (var pi = 0; pi < particleCount; pi++){
        var i3 = pi * 3;
        var bx = basePositions[i3];
        var by = basePositions[i3 + 1];
        var bz = basePositions[i3 + 2];

        var dx = bx - cx;
        var dy = by - cy;
        var dz = bz - cz;
        var distSq = dx*dx + dy*dy + dz*dz;

        var tDx = 0, tDy = 0, tDz = 0;
        if (cursorActive && distSq < hoverRadiusSq && distSq > 0.0001){
          var dist = Math.sqrt(distSq);
          var f = 1 - dist / hoverRadius;
          f = f * f;  // ease-out curve for soft falloff at edges
          var k = f * hoverStrength / dist;
          tDx = dx * k;
          tDy = dy * k;
          tDz = dz * k;
        }

        // Different lerp speeds for push vs. return - feels more organic
        var lf = (tDx === 0 && tDy === 0 && tDz === 0) ? returnFactor : pushFactor;
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
    requestAnimationFrame(tickFrame);
  }
  if (reduced){ renderer.render(scene, camera); }
  tickFrame();
}
buildTwist();

/* ---------- Three.js cinematic process scene ---------- */
function buildProcess(){
  if (!hasTHREE) return;
  var canvas = document.getElementById('rm-canvas');
  if (!canvas) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e){ return; }
  renderer.setPixelRatio(pxr());

  // Circular sprite texture - converts default square points into round dots
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
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  })();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  var ink = new THREE.Color(0x0A0A0C);
  var blue = new THREE.Color(0x2230FE);
  var orange = new THREE.Color(0xFF4D00);

  // === ICON POINT-CLOUD FORMATIONS =============================
  // Four formations decoded from embedded little-endian Int16 point
  // clouds. Each holds exactly CLOUD_MASTER points (1:1 morph), so
  // particles sweep coherently from one icon to the next on scrub.
  var CLOUD_MASTER = 7200, CLOUD_Q = 10000;
  /* Decoded from assets/js/data/process-shapes.js (kept out of this file
     so the scene logic stays readable). */
  var CLOUD_B64 = (window.SKY_DATA || {}).PROCESS_CLOUDS;
  if (!CLOUD_B64 || !CLOUD_B64.audit) return;

  function decodeCloud(b64){
    var binStr = atob(b64);
    var len = binStr.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
    var ints = new Int16Array(bytes.buffer);            // LE, x,y interleaved
    var out = new Float32Array(ints.length);
    for (var j = 0; j < ints.length; j++) out[j] = ints[j] / CLOUD_Q;
    return out;                                          // [x0,y0,x1,y1,...]
  }

  var srcForms = [
    decodeCloud(CLOUD_B64.audit),
    decodeCloud(CLOUD_B64.strategy),
    decodeCloud(CLOUD_B64.build),
    decodeCloud(CLOUD_B64.scale)
  ];

  // Device tier: stride-subsample (NOT prefix - clouds are angle-sorted).
  // Identical indices across all 4 forms keep the morph strictly 1:1.
  var stride = (window.innerWidth < 700) ? 2 : 1;   // mobile ~3600 pts, else 7200
  var idxList = [];
  for (var sIdx = 0; sIdx < CLOUD_MASTER; sIdx += stride) idxList.push(sIdx);
  var N = idxList.length;

  var ICON = 2.5;            // world half-extent multiplier
  var Z_JITTER = 0.10;       // subtle depth so the flat icon has body

  // Per-particle constants (shared across all 4 forms)
  var pZ = new Float32Array(N);           // fixed depth per particle
  var pPhase = new Float32Array(N);       // breathing phase offset
  var dispDir = new Float32Array(N * 3);  // coherent bloom dir (peaks mid-morph)
  for (var n = 0; n < N; n++){
    pZ[n] = (Math.random() - 0.5) * 2 * Z_JITTER * ICON;
    pPhase[n] = Math.random() * Math.PI * 2;
    var dvx = (Math.random() - 0.5) * 2;
    var dvy = (Math.random() - 0.5) * 2;
    var dvz = (Math.random() - 0.5) * 2;
    var dl = Math.sqrt(dvx*dvx + dvy*dvy + dvz*dvz) || 1;
    var dmag = 0.5 + Math.random() * 0.9;          // 0.5 .. 1.4
    dispDir[n*3]   = (dvx / dl) * dmag;
    dispDir[n*3+1] = (dvy / dl) * dmag;
    dispDir[n*3+2] = (dvz / dl) * dmag * 0.6;
  }

  // Build the 4 world-space formations
  var forms = [];
  for (var fi = 0; fi < 4; fi++){
    var srcF = srcForms[fi];
    var buf = new Float32Array(N * 3);
    for (var k = 0; k < N; k++){
      var srcI = idxList[k] * 2;
      buf[k*3]   = srcF[srcI]     * ICON;
      buf[k*3+1] = srcF[srcI + 1] * ICON;
      buf[k*3+2] = pZ[k];
    }
    forms.push(buf);
  }

  // === COLORS ==================================================
  var colorsArr = new Float32Array(N * 3);
  for (var ci = 0; ci < N; ci++){
    var rand = Math.random();
    var col = rand < 0.22 ? orange : (rand < 0.70 ? blue : ink);   // ~22% orange, 48% blue, 30% ink (matches Services balance)
    colorsArr[ci*3]   = col.r;
    colorsArr[ci*3+1] = col.g;
    colorsArr[ci*3+2] = col.b;
  }

  // === MAIN PARTICLE FIELD =====================================
  var positions = new Float32Array(N * 3);
  positions.set(forms[0]);
  var displacements = new Float32Array(N * 3);

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

  var mat = new THREE.PointsMaterial({
    size: (window.innerWidth < 700) ? 0.082 : 0.072,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 1.0,
    map: circleTexture,
    alphaTest: 0.05,
    depthWrite: false
  });

  var mainPoints = new THREE.Points(geo, mat);
  scene.add(mainPoints);

  // === STATE ===================================================
  var state = {
    scrollProgress: 0,
    phaseProgress: 0,
    activePhase: 0,
    scrollVel: 0,
    cursorActive: false,
    cursorScreen: new THREE.Vector2(0, 0),
    cursorLocal: new THREE.Vector3(100, 100, 100),
    isVisible: false,
    camTargetX: 0,
    camTargetY: 0,
    camSmoothX: 0,
    camSmoothY: 0,
    scrollSpreadSmooth: 0,
    pSmooth: 0
  };

  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var tmpVec = new THREE.Vector3();

  if (!reduced){
    canvas.addEventListener('pointermove', function(e){
      var rect = canvas.getBoundingClientRect();
      state.cursorScreen.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.cursorScreen.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      state.cursorActive = true;
      state.camTargetX = state.cursorScreen.x * 0.35;
      state.camTargetY = state.cursorScreen.y * 0.18;
    }, { passive: true });
    canvas.addEventListener('pointerleave', function(){
      state.cursorActive = false;
      state.camTargetX = 0;
      state.camTargetY = 0;
    });
  }

  function updateCursorLocal(){
    if (!state.cursorActive){
      state.cursorLocal.set(100, 100, 100);
      return;
    }
    raycaster.setFromCamera(state.cursorScreen, camera);
    if (raycaster.ray.intersectPlane(plane, tmpVec)){
      state.cursorLocal.copy(tmpVec);
    }
  }

  // Auto-frame the icon for ANY column aspect (portrait or landscape)
  var FIT_HALF = ICON * 0.96;
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
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = Math.max(dV, dH) * 1.12;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  place();
  window.addEventListener('resize', place);

  // === SCROLLTRIGGER PIN + SCRUB ===============================
  var phaseEls = document.querySelectorAll('.rm-phase');
  var rmCur = document.getElementById('rm-cur');
  var rmProgressBars = document.querySelectorAll('.rm-progress i');

  if (hasST && !reduced){
    ScrollTrigger.create({
      trigger: '.rm-stage',
      start: 'top top',
      end: '+=340%',
      pin: true,
      pinSpacing: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onEnter: function(){ state.isVisible = true; place(); },
      onLeave: function(){ state.isVisible = false; state.cursorActive = false; state.camTargetX = 0; state.camTargetY = 0; },
      onEnterBack: function(){ state.isVisible = true; place(); },
      onLeaveBack: function(){ state.isVisible = false; state.cursorActive = false; state.camTargetX = 0; state.camTargetY = 0; },
      onUpdate: function(self){
        state.scrollProgress = self.progress;
        state.scrollVel = Math.min(Math.abs(self.getVelocity()) / 1800, 1);
      }
    });

    // Approach-render: pre-render the canvas as the stage approaches viewport bottom
    ScrollTrigger.create({
      trigger: '.rm-stage',
      start: 'top 120%',
      end: 'top top',
      onToggle: function(self){
        if (self.isActive){ state.isVisible = true; place(); }
      }
    });
  } else {
    state.isVisible = true;
  }

  function updatePhaseText(){
    var sp = state.scrollProgress;
    var quartile = 0.25;
    var fadeRange = 0.12;  // % of quartile used for fade in/out

    for (var i = 0; i < phaseEls.length; i++){
      var el = phaseEls[i];
      var qStart = i * quartile;
      var qEnd = (i + 1) * quartile;
      var local = (sp - qStart) / quartile;  // 0..1 within own quartile

      var opacity;
      if (local < 0 || local > 1){
        opacity = 0;
      } else {
        var fadingIn  = (local < fadeRange) && (i > 0);          // phase 0 starts solid
        var fadingOut = (local > 1 - fadeRange) && (i < 3);      // phase 3 ends solid
        if (fadingIn){
          opacity = local / fadeRange;
        } else if (fadingOut){
          opacity = (1 - local) / fadeRange;
        } else {
          opacity = 1;
        }
      }

      var smoothedOp = opacity * opacity * (3 - 2 * opacity);
      var center = (qStart + qEnd) / 2;
      var translate = (sp - center) * 60;

      el.style.opacity = smoothedOp;
      el.style.transform = 'translateY(' + (-translate) + 'px)';
    }

    // Counter advances cleanly at quartile boundaries regardless of fade state
    var activeIdx = Math.max(0, Math.min(3, Math.floor(sp / quartile + 0.0001)));
    if (sp >= 1) activeIdx = 3;
    if (activeIdx !== state.activePhase){
      state.activePhase = activeIdx;
      if (rmCur) rmCur.textContent = String(activeIdx + 1).padStart(2, '0');
      for (var b = 0; b < rmProgressBars.length; b++){
        rmProgressBars[b].classList.toggle('on', b <= activeIdx);
      }
    }
  }

  // === MORPH TIMING (equal screen time, crisp held icons) ======
  // Each icon is HELD crisp around its quartile center, then morphs to
  // the next. Centers match updatePhaseText() quartiles exactly so the
  // card cross-fade and the icon morph stay locked together.
  var CENTERS = [0.125, 0.375, 0.625, 0.875];
  var HOLD = 0.055;
  function morphAt(p){
    if (p <= CENTERS[0]) return [0, 0, 0, 0];
    if (p >= CENTERS[3]) return [3, 3, 0, 0];
    var i = 0;
    for (i = 0; i < 3; i++){ if (p < CENTERS[i+1]) break; }
    var lo = CENTERS[i] + HOLD;
    var hi = CENTERS[i+1] - HOLD;
    if (p <= lo) return [i, i, 0, 0];
    if (p >= hi) return [i+1, i+1, 0, 0];
    var t = (p - lo) / (hi - lo);
    var et = t * t * (3 - 2 * t);          // smoothstep
    var bloom = Math.sin(t * Math.PI);     // 0 at ends, 1 mid-morph
    return [i, i + 1, et, bloom];
  }

  // === ANIMATION LOOP ==========================================
  var time = 0;
  var hoverRadius = 1.5;
  var hoverRadiusSq = hoverRadius * hoverRadius;
  var hoverStrength = 0.6;
  var BLOOM_AMP = 0.42;

  function tick(){
    if (state.isVisible){
      time += 0.02;

      // Silky decouple from scroll jerk
      state.pSmooth += (state.scrollProgress - state.pSmooth) * 0.12;

      // Smoothed cursor for parallax
      state.camSmoothX += (state.camTargetX - state.camSmoothX) * 0.06;
      state.camSmoothY += (state.camTargetY - state.camSmoothY) * 0.06;

      // Subtle wobble + cursor parallax (NO full spin - flat icons stay legible)
      mainPoints.rotation.y = Math.sin(time * 0.28) * 0.05 + state.camSmoothX * 0.18;
      mainPoints.rotation.x = Math.cos(time * 0.22) * 0.03 - state.camSmoothY * 0.12;

      // Scroll velocity radial breathe
      var targetSpread = Math.min(state.scrollVel * 0.18, 0.06);
      state.scrollSpreadSmooth += (targetSpread - state.scrollSpreadSmooth) * 0.08;
      var spread = state.scrollSpreadSmooth;

      // Morph state with crisp holds
      var ms = morphAt(state.pSmooth);
      var A = forms[ms[0]];
      var B = forms[ms[1]];
      var ef = ms[2];
      var bloom = ms[3] * BLOOM_AMP;

      updateCursorLocal();
      var cx = state.cursorLocal.x;
      var cy = state.cursorLocal.y;
      var cz = state.cursorLocal.z;

      var posArr = geo.attributes.position.array;

      for (var i = 0; i < N; i++){
        var i3 = i * 3;
        var ax = A[i3],   ay = A[i3+1],   az = A[i3+2];
        var bx = B[i3],   by = B[i3+1],   bz = B[i3+2];

        var px = ax + (bx - ax) * ef;
        var py = ay + (by - ay) * ef;
        var pz = az + (bz - az) * ef;

        // Breathing depth - life at rest, never breaks the silhouette
        pz += Math.sin(time + pPhase[i]) * 0.035 * ICON;

        // Coherent bloom - peaks mid-morph, zero at formations (icons stay crisp)
        if (bloom > 0.0001){
          px += dispDir[i3]   * bloom;
          py += dispDir[i3+1] * bloom;
          pz += dispDir[i3+2] * bloom;
        }

        // Scroll velocity radial spread
        if (spread > 0.001){
          var s1 = 1 + spread;
          px *= s1; py *= s1; pz *= s1;
        }

        // Cursor magnetic push
        var dx = px - cx;
        var dy = py - cy;
        var dz = pz - cz;
        var dsq = dx*dx + dy*dy + dz*dz;

        var tDx = 0, tDy = 0, tDz = 0;
        if (state.cursorActive && dsq < hoverRadiusSq && dsq > 0.0001){
          var dis = Math.sqrt(dsq);
          var ff = 1 - dis / hoverRadius;
          ff = ff * ff;
          var kk = ff * hoverStrength / dis;
          tDx = dx * kk;
          tDy = dy * kk;
          tDz = dz * kk;
        }

        var lf = (tDx === 0 && tDy === 0 && tDz === 0) ? 0.07 : 0.12;
        displacements[i3]   += (tDx - displacements[i3])   * lf;
        displacements[i3+1] += (tDy - displacements[i3+1]) * lf;
        displacements[i3+2] += (tDz - displacements[i3+2]) * lf;

        posArr[i3]   = px + displacements[i3];
        posArr[i3+1] = py + displacements[i3+1];
        posArr[i3+2] = pz + displacements[i3+2];
      }

      geo.attributes.position.needsUpdate = true;

      updatePhaseText();

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }

  if (reduced){
    renderer.render(scene, camera);
    for (var pe = 0; pe < phaseEls.length; pe++){
      phaseEls[pe].style.opacity = 1;
    }
  }
  // Same as the services section: in reduced motion the phases render as a static
  // stack, so the scrub/render loop must not run or it would force phases 2+ back
  // to opacity 0 (scrollProgress stays 0), leaving only the first phase visible.
  if (!reduced) tick();
}


/* ---------- Three.js cinematic services / disciplines scene ---------- */
function buildProtocol(){
  if (!hasTHREE) return;
  var canvas = document.getElementById('proto-canvas');
  if (!canvas) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e){ return; }
  renderer.setPixelRatio(pxr());

  // Reusable circular sprite - turns square Points into soft round dots
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
  var camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 0, 7.6);

  var ink = new THREE.Color(0x0A0A0C);
  var blue = new THREE.Color(0x2230FE);
  var orange = new THREE.Color(0xFF4D00);

  var DATA_N = 4200;                                   // points stored per shape
  var N = (window.innerWidth < 700) ? 2400 : (window.innerWidth < 1024 ? 3200 : 4200);

  // === SHAPE LAYOUTS - particles morph: globe -> megaphone -> play ===
  // Point clouds sampled from the three section icons. Each particle holds a
  // consistent angular slot across all shapes, so the morph sweeps smoothly
  // (radial sweep, no chaotic crossing). z adds depth: the globe domes into 3D.
  var SHAPE_SCALE = 5.4;
  /* Point clouds live in assets/js/data/services-shapes.js. */
  var SHAPE_DATA = (window.SKY_DATA || {}).SERVICE_SHAPES;
  if (!SHAPE_DATA) return;
  function buildShapes(){
    var bin = atob(SHAPE_DATA);
    var half = SHAPE_SCALE * 0.5;
    var shapes = [new Float32Array(N*3), new Float32Array(N*3), new Float32Array(N*3)];
    for (var sh = 0; sh < 3; sh++){
      var arr = shapes[sh];
      var b = sh * DATA_N * 2;                          // byte offset uses stored count
      for (var i = 0; i < N; i++){
        var di = (N === DATA_N) ? i : Math.floor(i * DATA_N / N);   // even subset (angle-sorted)
        var cx = (bin.charCodeAt(b + di*2)     / 255 - 0.5) * SHAPE_SCALE;
        var cy = (bin.charCodeAt(b + di*2 + 1) / 255 - 0.5) * SHAPE_SCALE;
        var x = cx;
        var y = cy;
        var rr = Math.sin((i + 1) * (12.9 + sh * 7.3)) * 43758.5453; rr -= Math.floor(rr);
        var jit = (rr - 0.5) * 0.16;
        var z;
        if (sh === 0){                       // globe: dome the flat icon into 3D (about its own center)
          var inside = half*half - (cx*cx + cy*cy);
          z = (inside > 0 ? Math.sqrt(inside) * 0.5 : 0) + jit * 0.4;
        } else {
          z = jit;                            // megaphone / play: slight thickness
        }
        arr[i*3] = x; arr[i*3+1] = y; arr[i*3+2] = z;
      }
    }
    return shapes;
  }
  var phases = buildShapes();
  // Responsive placement of the formation (right column on wide, centered+lifted on narrow).
  var shapePlace = { x: 0, y: 0, s: 1 };

  // === COLOR SYSTEM =============================================
  // Each particle has a fixed random "seed". That seed maps to a color
  // differently in each phase, producing the dominance shift between
  // blue / orange / ink - no new colors ever introduced.
  var seeds = new Float32Array(N);
  for (var s = 0; s < N; s++) seeds[s] = Math.random();

  function colorForPhase(seed, phaseIdx){
    // Phase 0 (Web & Brand): blue dominant
    //   orange < .06  |  blue < .62  |  else ink     → ~6 / 56 / 38
    // Phase 1 (Paid & Rank): orange dominant
    //   orange < .50  |  blue < .72  |  else ink     → 50 / 22 / 28
    // Phase 2 (Social & Content): ink-led, blue secondary
    //   orange < .05  |  blue < .46  |  else ink     → 5 / 41 / 54
    if (phaseIdx === 0){
      return (seed < 0.06) ? orange : (seed < 0.62) ? blue : ink;
    } else if (phaseIdx === 1){
      return (seed < 0.50) ? orange : (seed < 0.72) ? blue : ink;
    } else {
      return (seed < 0.04) ? orange : (seed < 0.66) ? blue : ink;
    }
  }

  var colorPhases = [
    new Float32Array(N*3),
    new Float32Array(N*3),
    new Float32Array(N*3)
  ];
  for (var phs = 0; phs < 3; phs++){
    for (var ci = 0; ci < N; ci++){
      var col = colorForPhase(seeds[ci], phs);
      colorPhases[phs][ci*3]   = col.r;
      colorPhases[phs][ci*3+1] = col.g;
      colorPhases[phs][ci*3+2] = col.b;
    }
  }

  // === MAIN PARTICLE FIELD ======================================
  var positions = new Float32Array(N*3);
  positions.set(phases[0]);
  var colorsArr = new Float32Array(N*3);
  colorsArr.set(colorPhases[0]);

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

  var mat = new THREE.PointsMaterial({
    size: 0.072,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 1.0,
    map: circleTexture,
    alphaTest: 0.05,
    depthWrite: false
  });
  var mainPoints = new THREE.Points(geo, mat);
  scene.add(mainPoints);

  // === STATE ====================================================
  var state = {
    scrollProgress: 0,
    phaseProgress: 0,
    activePhase: 0,
    scrollVel: 0,
    cursorActive: false,
    cursorScreen: new THREE.Vector2(0, 0),
    isVisible: false,
    camTargetX: 0,
    camTargetY: 0,
    camSmoothX: 0,
    camSmoothY: 0,
    scrollSpreadSmooth: 0
  };

  var hoverEl = canvas.parentElement || canvas;   // canvas sits behind the cards; listen on the stage
  if (!reduced){
    hoverEl.addEventListener('pointermove', function(e){
      var rect = canvas.getBoundingClientRect();
      state.cursorScreen.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.cursorScreen.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      state.cursorActive = true;
      state.camTargetX = state.cursorScreen.x * 0.42;
      state.camTargetY = state.cursorScreen.y * 0.22;
    }, { passive: true });
    hoverEl.addEventListener('pointerleave', function(){
      state.cursorActive = false;
      state.camTargetX = 0;
      state.camTargetY = 0;
    });
  }

  // === CURSOR MAGNETIC PUSH (same hover effect as the Process section) ==========
  var displacements = new Float32Array(N * 3);
  var cursorLocal = new THREE.Vector3(100, 100, 100);
  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var tmpVec = new THREE.Vector3();
  var hoverRadius = 1.5;
  var hoverRadiusSq = hoverRadius * hoverRadius;
  var hoverStrength = 0.6;
  function updateCursorLocal(){
    if (!state.cursorActive){
      cursorLocal.set(100, 100, 100);
      return;
    }
    camera.updateMatrixWorld();
    raycaster.setFromCamera(state.cursorScreen, camera);
    if (raycaster.ray.intersectPlane(plane, tmpVec)){
      cursorLocal.copy(tmpVec);
    }
  }

  function place(){
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 720 ? 9.6 : (w < 1100 ? 8.4 : 7.6);
    camera.updateProjectionMatrix();
    // Place the particle formation: beside the card on wide screens (card sits
    // left, shape sits right), centered + lifted when stacked on narrow screens.
    if (w >= 1100){        shapePlace.x = 1.78; shapePlace.y = 0.05;  shapePlace.s = 0.88; }
    else if (w >= 860){    shapePlace.x = 1.55; shapePlace.y = 0.05;  shapePlace.s = 0.80; }
    else {                 shapePlace.x = 0;    shapePlace.y = 2.15;  shapePlace.s = 0.62; }
  }
  place();
  window.addEventListener('resize', place);

  // === SCROLLTRIGGER PIN + SCRUB ================================
  var cards = document.querySelectorAll('.proto-card');
  var protoCur = document.getElementById('proto-cur');

  if (hasST && !reduced){
    ScrollTrigger.create({
      trigger: '.proto-stage',
      start: 'top top',
      end: '+=300%',
      pin: true,
      pinSpacing: true,
      scrub: 0.7,
      invalidateOnRefresh: true,
      onEnter: function(){ state.isVisible = true; place(); },
      onLeave: function(){ state.isVisible = false; state.cursorActive = false; state.camTargetX = 0; state.camTargetY = 0; },
      onEnterBack: function(){ state.isVisible = true; place(); },
      onLeaveBack: function(){ state.isVisible = false; state.cursorActive = false; state.camTargetX = 0; state.camTargetY = 0; },
      onUpdate: function(self){
        var p = self.progress;
        state.scrollProgress = p;
        // phaseProgress synced to the card windows: each shape HOLDS fully formed
        // while its card holds, and morphs only during the two card transitions,
        // so every service gets equal screen time and its shape is clearly shown.
        var pp;
        if (p <= 0.25)       pp = 0;                              // card 0 - globe
        else if (p < 0.375)  pp = (p - 0.25) / 0.125;             // morph globe -> mega
        else if (p <= 0.625) pp = 1;                              // card 1 - megaphone
        else if (p < 0.75)   pp = 1 + (p - 0.625) / 0.125;        // morph mega -> play
        else                 pp = 2;                              // card 2 - play
        state.phaseProgress = pp;
        state.scrollVel = Math.min(Math.abs(self.getVelocity()) / 2000, 1);
      }
    });

    // Approach-render: warm up the canvas before the section is pinned
    ScrollTrigger.create({
      trigger: '.proto-stage',
      start: 'top 120%',
      end: 'top top',
      onToggle: function(self){
        if (self.isActive){ state.isVisible = true; place(); }
      }
    });
  } else {
    state.isVisible = true;
  }

  // === CARD HORIZONTAL TRANSITIONS ==============================
  // Three cards, three equal-length hold zones (each 0.25 of pinned
  // scroll), two equal-length transitions (each 0.125 wide) - the
  // scroll experience is the same length for every card.
  //
  //   0 ────── 0.25 ── 0.375 ────── 0.625 ── 0.75 ────── 1.0
  //   |  card 0 |  trans 0→1  | card 1 |  trans 1→2 | card 2 |
  //
  // Card 0 stays fully sharp from progress 0 - no entry animation.
  // Card 2 stays fully sharp until progress 1 - no exit animation.
  // Between cards we slide horizontally right→left with rotateY and
  // a touch of Z-depth so the panels appear to pass each other in 3D.
  var cardWindows = [
    { exitStart: 0.25,  exitEnd: 0.375 },
    { enterStart: 0.25, enterEnd: 0.375, exitStart: 0.625, exitEnd: 0.75 },
    { enterStart: 0.625, enterEnd: 0.75 }
  ];
  var TX_MAX = 200;   // px horizontal travel (kept tight for the left column)
  var TZ_MAX = -90;   // px Z recession at the deepest point
  var ROT_MAX = 13;   // deg rotateY
  var SCALE_MIN = 0.92;

  function smoothstep(t){ return t * t * (3 - 2 * t); }
  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

  function applyState(el, opacity, tx, tz, rotY, scale){
    el.style.opacity = opacity;
    el.style.transform =
      'translate3d(' + tx.toFixed(1) + 'px,0,' + tz.toFixed(1) + 'px)' +
      ' rotateY(' + rotY.toFixed(2) + 'deg)' +
      ' scale3d(' + scale.toFixed(3) + ',' + scale.toFixed(3) + ',1)';
  }

  function updateCardText(){
    var sp = state.scrollProgress;

    for (var i = 0; i < cards.length; i++){
      var el = cards[i];
      var w = cardWindows[i];

      // Default hold state
      var opacity = 1, tx = 0, tz = 0, rotY = 0, scale = 1;
      var inEnter = false;

      // Check enter window first
      if (w.enterStart != null && sp < w.enterEnd){
        if (sp < w.enterStart){
          // Parked off to the right, fully hidden
          opacity = 0;
          tx = TX_MAX;
          tz = TZ_MAX;
          rotY = ROT_MAX;
          scale = SCALE_MIN;
        } else {
          // Sliding in from the right
          var t = (sp - w.enterStart) / (w.enterEnd - w.enterStart);
          var ease = smoothstep(clamp01(t));
          var inv = 1 - ease;
          opacity = ease;
          tx = inv * TX_MAX;
          tz = inv * TZ_MAX;
          rotY = inv * ROT_MAX;
          scale = SCALE_MIN + ease * (1 - SCALE_MIN);
          inEnter = true;
        }
      }

      // Check exit window
      if (w.exitStart != null && sp >= w.exitStart && !inEnter){
        if (sp >= w.exitEnd){
          // Parked off to the left, fully hidden
          opacity = 0;
          tx = -TX_MAX;
          tz = TZ_MAX;
          rotY = -ROT_MAX;
          scale = SCALE_MIN;
        } else {
          // Sliding out to the left
          var et = (sp - w.exitStart) / (w.exitEnd - w.exitStart);
          var ease2 = smoothstep(clamp01(et));
          opacity = 1 - ease2;
          tx = -ease2 * TX_MAX;
          tz = ease2 * TZ_MAX;
          rotY = -ease2 * ROT_MAX;
          scale = 1 - ease2 * (1 - SCALE_MIN);
        }
      }

      applyState(el, opacity, tx, tz, rotY, scale);
    }

    // HUD counter - snaps at the midpoint of each transition.
    // Counter color stays ink/black across all phases.
    var activeIdx;
    if (sp < 0.3125) activeIdx = 0;
    else if (sp < 0.6875) activeIdx = 1;
    else activeIdx = 2;
    if (activeIdx !== state.activePhase){
      state.activePhase = activeIdx;
      if (protoCur){
        protoCur.textContent = String(activeIdx + 1).padStart(2, '0');
      }
    }
  }

  // === ANIMATION LOOP ===========================================
  var time = 0;

  function tick(){
    if (state.isVisible){
      time += 0.022;  // faster, matches orb/twist/process speed

      // Camera parallax: smoothed cursor offset + scroll-driven sway
      state.camSmoothX += (state.camTargetX - state.camSmoothX) * 0.06;
      state.camSmoothY += (state.camTargetY - state.camSmoothY) * 0.06;

      var p = state.scrollProgress;
      // Cinematic dolly: in through middle phase, back out at end
      var dolly = Math.sin(p * Math.PI) * 0.55;
      var swayX = Math.sin(p * Math.PI * 1.4) * 0.7;
      var swayY = Math.cos(p * Math.PI * 1.1) * 0.28;
      var baseZ = canvas.clientWidth < 720 ? 9.6 : (canvas.clientWidth < 1100 ? 8.4 : 7.6);

      camera.position.x = state.camSmoothX + swayX;
      camera.position.y = state.camSmoothY + swayY;
      camera.position.z = baseZ - dolly;
      camera.rotation.z = Math.sin(p * Math.PI * 1.2) * 0.04;  // very subtle roll
      camera.lookAt(state.camSmoothX * 0.3, state.camSmoothY * 0.3, 0);

      // Scroll velocity → radial spread (field "breathes" with scroll speed)
      var targetSpread = Math.min(state.scrollVel * 0.14, 0.06);
      state.scrollSpreadSmooth += (targetSpread - state.scrollSpreadSmooth) * 0.08;
      var spread = state.scrollSpreadSmooth;

      // Phase morph - pp 0..2 maps to globe -> mega -> play.
      // (Indexing kept so pp=2 lands fully on play, not the previous phase.)
      var pp = state.phaseProgress;
      if (pp < 0) pp = 0; else if (pp > 2) pp = 2;
      var phaseInt = Math.floor(pp);
      if (phaseInt > 1) phaseInt = 1;
      var phaseFrac = pp - phaseInt;
      var nextPhaseInt = phaseInt + 1;
      var ef = phaseFrac * phaseFrac * (3 - 2 * phaseFrac);

      updateCursorLocal();
      var cx = cursorLocal.x, cy = cursorLocal.y, cz = cursorLocal.z;

      var posArr = geo.attributes.position.array;
      var colArr = geo.attributes.color.array;
      var phaseA = phases[phaseInt];
      var phaseB = phases[nextPhaseInt];
      var colA = colorPhases[phaseInt];
      var colB = colorPhases[nextPhaseInt];

      // Globe (phase 0) gets a subtle 3D turn; every shape gets gentle life.
      var w0 = (phaseInt === 0 ? 1 - ef : (nextPhaseInt === 0 ? ef : 0));
      var globeTurn = Math.sin(time * 0.42) * 0.18 * w0;
      var ctn = Math.cos(globeTurn), stn = Math.sin(globeTurn);

      for (var i = 0; i < N; i++){
        var i3 = i * 3;
        var ax = phaseA[i3],   ay = phaseA[i3+1],   az = phaseA[i3+2];
        var bx = phaseB[i3],   by = phaseB[i3+1],   bz = phaseB[i3+2];

        var px = ax + (bx - ax) * ef;
        var py = ay + (by - ay) * ef;
        var pz = az + (bz - az) * ef;

        // gentle idle so the icon stays crisp yet never feels frozen
        var seed = seeds[i];
        px += Math.sin(time * 0.6  + seed * 9.0) * 0.020;
        py += Math.cos(time * 0.55 + seed * 7.0) * 0.018;
        pz += Math.sin(time * 0.5  + seed * 5.0) * 0.030;

        // globe: slow turn about Y so the domed icon reads as a rotating globe
        if (w0 > 0.01){
          var rx = px * ctn + pz * stn;
          var rz = -px * stn + pz * ctn;
          px = rx; pz = rz;
        }

        // Velocity-driven radial expansion
        if (spread > 0.001){
          var s1 = 1 + spread;
          px *= s1; py *= s1; pz *= s1;
        }

        // Place the formation in its responsive column (right on wide, centered on narrow)
        px = px * shapePlace.s + shapePlace.x;
        py = py * shapePlace.s + shapePlace.y;
        pz = pz * shapePlace.s;

        // Cursor magnetic push - identical to the Process section
        var dx = px - cx;
        var dy = py - cy;
        var dz = pz - cz;
        var dsq = dx*dx + dy*dy + dz*dz;
        var tDx = 0, tDy = 0, tDz = 0;
        if (state.cursorActive && dsq < hoverRadiusSq && dsq > 0.0001){
          var dis = Math.sqrt(dsq);
          var ff = 1 - dis / hoverRadius;
          ff = ff * ff;
          var kk = ff * hoverStrength / dis;
          tDx = dx * kk;
          tDy = dy * kk;
          tDz = dz * kk;
        }
        var lf = (tDx === 0 && tDy === 0 && tDz === 0) ? 0.07 : 0.12;
        displacements[i3]   += (tDx - displacements[i3])   * lf;
        displacements[i3+1] += (tDy - displacements[i3+1]) * lf;
        displacements[i3+2] += (tDz - displacements[i3+2]) * lf;

        posArr[i3]   = px + displacements[i3];
        posArr[i3+1] = py + displacements[i3+1];
        posArr[i3+2] = pz + displacements[i3+2];

        // Lerp colors between phase profiles → dominance shift
        colArr[i3]   = colA[i3]   + (colB[i3]   - colA[i3])   * ef;
        colArr[i3+1] = colA[i3+1] + (colB[i3+1] - colA[i3+1]) * ef;
        colArr[i3+2] = colA[i3+2] + (colB[i3+2] - colA[i3+2]) * ef;
      }

      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;

      updateCardText();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }

  if (reduced){
    renderer.render(scene, camera);
    // Show all cards in stacked layout when motion is reduced
    var section = document.querySelector('.proto-cinematic');
    if (section) section.classList.add('no-pin');
    for (var pe = 0; pe < cards.length; pe++){
      cards[pe].style.opacity = 1;
      cards[pe].style.transform = '';
      cards[pe].style.filter = '';
    }
  }
  // In reduced motion the canvas is hidden and cards are shown stacked, so the
  // render/scrub loop must NOT run - otherwise updateCardText() keeps forcing
  // cards 2+ back to opacity 0 (scrollProgress stays 0) and only the first
  // service card stays visible. Render once above; do not start the rAF loop.
  if (!reduced) tick();
}
buildProtocol();
buildProcess();

// After both pinning scenes are registered, force ScrollTrigger to recalculate
// all trigger positions so each pin accounts for any pinSpacing added later.
if (hasST && !reduced) {
  try { ScrollTrigger.refresh(); } catch(e) {}
  // Recalculate again once the web font swaps in and after full load. The brand
  // font (Archivo, display:swap) reflows headings when it replaces the fallback;
  // without this, pin start/end offsets stay stale and the first scroll jumps.
  var __refreshST = function(){ try { ScrollTrigger.refresh(); } catch(e) {} };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(__refreshST);
  window.addEventListener('load', __refreshST);
}

/* ---------- Wordmark cursor kerning ---------- */
(function(){
  var wm = document.getElementById('wordmark');
  if (!wm) return;
  var letters = Array.prototype.slice.call(wm.querySelectorAll('span'));
  if (reduced || !hasGSAP || !window.matchMedia('(pointer:fine)').matches) return;
  var setters = letters.map(function(el){
    return gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
  });
  var hero = document.getElementById('hero');
  var mid = (letters.length - 1) / 2;
  hero.addEventListener('pointermove', function(e){
    letters.forEach(function(el, i){
      var b = el.getBoundingClientRect();
      var cx = b.left + b.width / 2;
      var d = e.clientX - cx;
      var dist = Math.abs(d);
      var range = 260;
      if (dist < range && e.clientY > b.top - 140){
        var force = (1 - dist / range) * 32 * (d > 0 ? -1 : 1);
        setters[i](force);
      } else {
        setters[i](0);
      }
    });
  });
  hero.addEventListener('pointerleave', function(){
    setters.forEach(function(s){ s(0); });
  });
})();

/* ---------- CTA card: dynamic cursor-driven tilt + lift ---------- */
(function(){
  var panel = document.getElementById('cta-panel');
  if (!panel) return;
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;

  var raf = null;
  var rx = 0, ry = 0, lift = 0, scale = 1;          // current
  var trx = 0, try_ = 0, tlift = 0, tscale = 1;     // target

  function loop(){
    // ease current toward target for a fluid, dynamic feel
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
    panel.classList.add('is-hover');
    tlift = -10; tscale = 1.015;
    kick();
  });
  panel.addEventListener('pointermove', function(e){
    var r = panel.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;   // 0..1
    var py = (e.clientY - r.top) / r.height;   // 0..1
    // stronger, more dynamic tilt (max ~9deg)
    trx = (px - 0.5) * 18;     // rotateY
    try_ = (0.5 - py) * 14;    // rotateX
    kick();
  });
  panel.addEventListener('pointerleave', function(){
    panel.classList.remove('is-hover');
    trx = 0; try_ = 0; tlift = 0; tscale = 1;
    kick();
  });
})();

/* ---------- Preloader particle composition ---------- */
/* Reuses the site's particle language - the planet's lat/lon sphere + tilted
   orbital rings and the process helix strands - inverted to luminous tones for
   the dark stage. Particles assemble from a dispersed cloud as load progresses,
   breathe + rotate while alive, then burst outward on exit and hand off to the
   hero orb. State is driven by the intro timeline via plForm / plExit. */
var plForm = 0, plExit = 0, plActive = false, plApi = null;
function buildPreloader(){
  if (!hasTHREE) return null;
  var canvas = document.getElementById('pl-canvas');
  if (!canvas) return null;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true }); }
  catch (e){ return null; }
  renderer.setPixelRatio(pxr());

  // identical soft round sprite to the planet/helix particles
  var sprite = (function(){
    var s = 128, c = document.createElement('canvas'); c.width = c.height = s;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(0.85, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(s/2, s/2, s/2, 0, Math.PI*2); x.fill();
    var t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
    return t;
  })();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 6.4;

  var paper = new THREE.Color(0xEEF2F7), white = new THREE.Color(0xFFFFFF),
      blue = new THREE.Color(0x2230FE), orange = new THREE.Color(0xFF4D00);

  var dens = (window.innerWidth < 720) ? 0.62 : 1;
  var S = [], T = [], C = [], SEED = [];
  function add(tx, ty, tz, col){
    var rr = 3.6 + Math.random()*3.0, u = Math.random()*2-1, th = Math.random()*Math.PI*2, s = Math.sqrt(1-u*u);
    S.push(rr*s*Math.cos(th), rr*u, rr*s*Math.sin(th));
    T.push(tx, ty, tz); C.push(col.r, col.g, col.b); SEED.push(Math.random());
  }
  function pickSphere(){ var r=Math.random(); return r<0.05?orange:(r<0.22?blue:(r<0.30?white:paper)); }

  var R = 1.45;
  var lats = Math.round(32*dens), lons = Math.round(48*dens);
  for (var i=1;i<lats;i++){
    var phi=(i/lats)*Math.PI, sp=Math.sin(phi), cp=Math.cos(phi);
    for (var j=0;j<lons;j++){ var th=(j/lons)*Math.PI*2; add(R*sp*Math.cos(th), R*cp, R*sp*Math.sin(th), pickSphere()); }
  }
  function ring(rad, tilt, nn){
    var ct=Math.cos(tilt), st=Math.sin(tilt);
    for (var k=0;k<nn;k++){
      var a=(k/nn)*Math.PI*2, jit=(Math.random()-0.5)*0.05;
      var x=Math.cos(a)*(rad+jit), y=jit*0.4, z=Math.sin(a)*(rad+jit);
      var ty=y*ct - z*st, tz=y*st + z*ct;
      var rr=Math.random(), col = rr<0.28?blue:(rr<0.36?orange:paper);
      add(x, ty, tz, col);
    }
  }
  ring(2.15, 0.52, Math.round(520*dens));
  ring(2.62, -0.95, Math.round(360*dens));
  var strands=3, perS=Math.round(150*dens), H=4.6, hR=0.62, tw=1.5;
  for (var s2=0;s2<strands;s2++){
    var ph=(s2/strands)*Math.PI*2;
    for (var p=0;p<perS;p++){
      var t=p/(perS-1), theta=ph + t*tw*Math.PI*2;
      add(hR*Math.cos(theta), (t-0.5)*H, hR*Math.sin(theta), Math.random()<0.5?white:blue);
    }
  }

  var n = T.length/3;
  var Sarr = new Float32Array(S), Tarr = new Float32Array(T), seed = new Float32Array(SEED);
  var pos = new Float32Array(Sarr);
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  var mat = new THREE.PointsMaterial({
    size: (window.innerWidth<720)?0.058:0.05, vertexColors: true, sizeAttenuation: true,
    transparent: true, opacity: 0, map: sprite, alphaTest: 0.01, depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  var pts = new THREE.Points(geo, mat);
  var group = new THREE.Group(); group.add(pts); group.rotation.z = 0.1; scene.add(group);

  function resize(){
    var w=canvas.clientWidth||window.innerWidth, h=canvas.clientHeight||window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w/h;
    group.scale.setScalar(w<720 ? 0.8 : (w<1100 ? 0.92 : 1));
    camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener('resize', resize);

  var arr = geo.attributes.position.array, raf = 0, t0 = performance.now();
  function render(){
    var now=(performance.now()-t0)/1000;
    var fe = plForm<0?0:plForm>1?1:plForm;
    var ex = plExit<0?0:plExit>1?1:plExit;
    for (var i=0;i<n;i++){
      var i3=i*3, sd=seed[i];
      var u=(fe - sd*0.22)/0.78; u=u<0?0:u>1?1:u;
      var le=u*u*u*(u*(u*6-15)+10);              // smootherstep assembly
      var sx=Sarr[i3], sy=Sarr[i3+1], sz=Sarr[i3+2];
      var tx=Tarr[i3], ty=Tarr[i3+1], tz=Tarr[i3+2];
      var bx=sx+(tx-sx)*le, by=sy+(ty-sy)*le, bz=sz+(tz-sz)*le;
      var br=1 + Math.sin(now*1.05 + sd*6.283)*0.014*le;   // breathing once formed
      bx*=br; by*=br; bz*=br;
      if (ex>0){                                  // exit burst
        var L=Math.sqrt(bx*bx+by*by+bz*bz)||1, push=ex*ex*(2.6 + sd*2.4);
        bx+=bx/L*push; by+=by/L*push + ex*0.7; bz+=bz/L*push;
      }
      arr[i3]=bx; arr[i3+1]=by; arr[i3+2]=bz;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = (0.18 + 0.82*fe) * (1-ex);
    group.rotation.y = now*0.2;
    group.rotation.x = 0.14 + Math.sin(now*0.26)*0.06;
    renderer.render(scene, camera);
  }
  function loop(){ if (!plActive) return; raf = requestAnimationFrame(loop); render(); }
  function dispose(){
    plActive = false; if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    try { geo.dispose(); mat.dispose(); sprite.dispose(); renderer.dispose(); renderer.forceContextLoss(); } catch(_){}
  }
  return { start: function(){ plActive = true; loop(); }, renderOnce: render, dispose: dispose };
}

/* ---------- Preloader + intro ---------- */
var pl = document.getElementById('preloader');
var plCount = document.getElementById('pl-count');
var plBar = document.getElementById('pl-bar-fill');
var plState = document.getElementById('pl-state');
function finishLoad(){ document.body.classList.add('loaded'); }

plApi = buildPreloader();

if (!hasGSAP || reduced){
  // Reduced motion / no GSAP: render one formed composition, then fade out fast.
  plForm = 1; plExit = 0;
  if (plApi) plApi.renderOnce();
  if (plCount) plCount.textContent = '100';
  if (plBar) plBar.style.transform = 'scaleX(1)';
  if (plState) plState.textContent = 'Ready';
  if (hasGSAP){
    gsap.set('.rv, .rv-card', { opacity: 1, y: 0, scale: 1 });
    gsap.set('.rv-title', { opacity: 1 });
  }
  if (pl){
    pl.style.transition = 'opacity .5s ease';
    setTimeout(function(){
      pl.style.opacity = '0';
      setTimeout(function(){ finishLoad(); if (plApi) plApi.dispose(); }, 520);
    }, reduced ? 280 : 100);
  } else { finishLoad(); }
} else {
  if (plApi) plApi.start();

  /* The percentage is driven by the real wall clock (rAF timestamps), not the
     GSAP ticker, so a long startup frame can never fast-forward it. It always
     counts up over a deliberate ~2.3s of real time. */
  var CDUR = 2300, cStart = null, exitStarted = false;
  function easeInOut(p){ return p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2)/2; }
  function countStep(now){
    if (cStart === null) cStart = now;
    var p = (now - cStart) / CDUR; if (p > 1) p = 1;
    var v = easeInOut(p) * 100;
    plCount.textContent = String(Math.round(v)).padStart(2, '0');
    plForm = v / 100;
    if (plBar) plBar.style.transform = 'scaleX(' + (v/100) + ')';
    if (plState && v > 88) plState.textContent = 'Ready';
    if (p < 1) requestAnimationFrame(countStep);
    else setTimeout(runExit, 300);   // a held beat at 100
  }
  // real-clock count is immune to delta inflation, so one frame to start is enough
  requestAnimationFrame(countStep);

  function runExit(){
    if (exitStarted) return; exitStarted = true;
    var exitObj = { v: 0 };
    gsap.timeline()
      // particles burst outward and fade
      .to(exitObj, { v: 1, duration: 0.85, ease: 'power2.in',
          onUpdate: function(){ plExit = exitObj.v; } }, 0)
      // the percentage swells and dissolves
      .to('.pl-count', { scale: 1.09, opacity: 0, duration: 0.55, ease: 'power2.in', transformOrigin: '50% 50%' }, 0)
      .to('.pl-sub, .pl-ui', { opacity: 0, duration: 0.45, ease: 'power2.in' }, 0)
      // the stage lifts away, revealing the hero beneath
      .to(pl, { opacity: 0, duration: 0.6, ease: 'power2.inOut',
          onComplete: function(){ finishLoad(); if (plApi) plApi.dispose(); } }, 0.22)
      // hero wordmark + content cross-fade in as the loader clears
      .from('#wordmark span', {
        x: function(i, _, arr){ return (i - (arr.length - 1) / 2) * 80; },
        opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.02
      }, 0.35)
      .to('#hero .rv', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, '<+=0.15');
  }

  // Failsafe: never trap the user behind the preloader
  setTimeout(function(){ if (!document.body.classList.contains('loaded')){ finishLoad(); if (plApi) plApi.dispose(); } }, 8000);
}

/* ---------- Home scroll choreography ---------- */
if (hasGSAP && hasST && !reduced){

  // Manifesto: word-by-word ink as you scroll (scrub)
  var st = document.getElementById('statement');
  if (st){
    var html = st.innerHTML;
    st.innerHTML = html.replace(/(<span class="hl">)|(<\/span>)|([^<>\s]+)/g, function(m, open, close, word){
      if (open || close) return m;
      return '<span class="w">' + word + '</span>';
    });
    gsap.to('#statement .w', {
      opacity: 1, stagger: 0.04, ease: 'none',
      scrollTrigger: { trigger: '#manifesto', start: 'top 74%', end: 'top 22%', scrub: true }
    });
  }

  // Revenue counter
  var num = document.getElementById('supply-num');
  if (num){
    var target = parseInt(num.dataset.target, 10);
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 2, ease: 'power2.out',
      onUpdate: function(){ num.textContent = Math.round(obj.v).toLocaleString('en-US'); },
      scrollTrigger: { trigger: '#token', start: 'top 70%', once: true }
    });
  }

  // Subtle parallax depth - desktop + fine pointer only, scrubbed for smoothness
  var mm = gsap.matchMedia();
  mm.add('(min-width: 1021px) and (pointer: fine)', function(){
    gsap.fromTo('.man-visual', { yPercent: 7 }, {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '#manifesto', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  ScrollTrigger.refresh();
} else {
  // No GSAP or reduced motion: final values, cinematic sections stack vertically
  document.querySelectorAll('#statement .w').forEach(function(el){ el.style.opacity = 1; });
  var n = document.getElementById('supply-num');
  if (n) n.textContent = parseInt(n.dataset.target, 10).toLocaleString('en-US');
  var rmSection = document.getElementById('roadmap');
  if (rmSection) rmSection.classList.add('no-pin');
  document.querySelectorAll('.rm-phase').forEach(function(el){ el.style.opacity = 1; });
  var protoSection = document.querySelector('.proto-cinematic');
  if (protoSection) protoSection.classList.add('no-pin');
  document.querySelectorAll('.proto-card').forEach(function(el){ el.style.opacity = 1; el.style.transform = ''; el.style.filter = ''; });
}
})();

/* ---------- Hero headline typewriter ---------- */
/* Hero headline: fast letter-by-letter typewriter in the site's own type.
   Clears the line up front (no flash), then types once the loader has cleared.
   Honors reduced-motion by showing the full line with no caret. */
(function(){
  var h = document.querySelector('.hero-headline');
  if (!h) return;
  var textEl = h.querySelector('.hh-text');
  if (!textEl) return;
  var full = textEl.textContent;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;   // full line already laid out; no animation, no caret

  // Lay out EVERY character up front (each in its own span) so the line breaks
  // are computed once and frozen. Reveal them one at a time via opacity, so the
  // text never reflows or jumps lines while typing.
  textEl.textContent = '';
  var frag = document.createDocumentFragment(), spans = [];
  for (var k = 0; k < full.length; k++){
    var s = document.createElement('span');
    s.className = 'hh-c';
    s.textContent = full[k];        // spaces stay break opportunities (normal wrap)
    frag.appendChild(s); spans.push(s);
  }
  textEl.appendChild(frag);
  textEl.classList.add('typing');

  var started = false;
  function type(){
    if (started) return; started = true;
    var i = -1, prev = null;
    (function step(){
      i++;
      if (i >= spans.length){
        // settle: keep the caret blinking briefly, then drop it (text stays put)
        setTimeout(function(){ textEl.classList.remove('typing'); if (prev) prev.classList.remove('cur'); }, 950);
        return;
      }
      spans[i].classList.add('on');
      if (prev) prev.classList.remove('cur');
      spans[i].classList.add('cur');
      prev = spans[i];
      setTimeout(step, 18 + Math.random() * 12);   // fast, lightly organic
    })();
  }

  // begin once the loading screen has handed off (hero visible), with a fallback
  var t0 = Date.now();
  (function ready(){
    if (document.body.classList.contains('loaded') || Date.now() - t0 > 9000){
      setTimeout(type, 320);
    } else {
      requestAnimationFrame(ready);
    }
  })();
})();
