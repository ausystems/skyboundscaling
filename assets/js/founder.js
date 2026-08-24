/* ==========================================================================
   SKYBOUND SCALING - founder.js  (v2)
   Choreography for the founder gallery (.ak-wing, about) and the home
   band (.ak-band). Seven jobs:

     1. Header handoff: body.on-dark while a wing overlaps the header.
     2. The arrival: the light line cascades in letter by letter, the
        heavy line rises as one mass, then a light sheen scrolls through
        it, driven by scroll position.
     3. The lit portrait: three slices reconstruct the photo on entry,
        the cursor becomes a spotlight that restores true color, and the
        frame leans very slightly toward the pointer. Touch devices get
        a scroll triggered color reveal instead.
     4. The story thread and chapter activation.
     5. The philosophy: a pinned quote lit word by word on scroll.
     6. The mind: a Three.js orbital in the site's round dot language,
        five tilted rings of particles around a glowing core. Renders
        only while on screen. Falls back to a static SVG without WebGL.
     7. Wayfinding dots, and magnetic pull on the closing call to action.

   Loads after core.js. Reads window.SKY. Degrades: without GSAP, or
   under prefers-reduced-motion, every element is set to its final
   visible state and the orbital shows its fallback.
   ========================================================================== */
(function(){
'use strict';
var SKY = window.SKY || {};
var reduced = SKY.reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = typeof gsap !== 'undefined';
var hasST = typeof ScrollTrigger !== 'undefined';
var hasTHREE = typeof THREE !== 'undefined';
var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

var wings = document.querySelectorAll('.ak-wing');
if (!wings.length) return;

/* ---------- Static finish: no motion runtime, or reduced motion ---------- */
function settle(){
  document.querySelectorAll('.akv').forEach(function(el){
    el.style.opacity = 1; el.style.transform = 'none';
  });
  document.querySelectorAll('.ak-name .ak-ch, .ak-name .ak-mass').forEach(function(el){
    el.style.transform = 'none';
  });
  document.querySelectorAll('.ak-mass').forEach(function(el){
    el.style.backgroundPosition = '42% 0';
  });
  document.querySelectorAll('.ak-thread i').forEach(function(el){ el.style.transform = 'none'; });
  document.querySelectorAll('.ak-w').forEach(function(el){ el.classList.add('lit'); });
  document.querySelectorAll('.ak-ch-block').forEach(function(el){ el.classList.add('on'); });
  document.querySelectorAll('.ak-orbit').forEach(function(el){ el.classList.add('ak-orbit-static'); });
}
if (!hasGSAP || !hasST || reduced){
  settle();
  return;
}

/* ---------- 1. Header handoff ---------- */
wings.forEach(function(wing){
  ScrollTrigger.create({
    trigger: wing,
    start: 'top 84px',
    end: 'bottom 84px',
    onToggle: function(self){
      document.body.classList.toggle('on-dark', self.isActive);
    }
  });
});

/* ---------- 2. The arrival ---------- */
document.querySelectorAll('.ak-name').forEach(function(name){
  var chars = name.querySelectorAll('.ak-ch');
  var mass = name.querySelector('.ak-mass');

  if (chars.length || mass){
    if (chars.length) gsap.set(chars, { yPercent: 108 });
    if (mass) gsap.set(mass, { yPercent: 112 });
    ScrollTrigger.create({
      trigger: name, start: 'top 84%', once: true,
      onEnter: function(){
        var tl = gsap.timeline();
        if (chars.length){
          tl.to(chars, {
            yPercent: 0, duration: 1.3, ease: 'power4.out',
            stagger: { each: 0.05, from: 'start' }
          }, 0);
        }
        if (mass){
          tl.to(mass, { yPercent: 0, duration: 1.5, ease: 'power4.out' }, 0.22);
        }
      }
    });
  }
  /* the sheen: light travels through the heavy line as the visitor scrolls */
  if (mass){
    gsap.fromTo(mass,
      { backgroundPosition: '96% 0' },
      {
        backgroundPosition: '8% 0', ease: 'none',
        scrollTrigger: { trigger: name, start: 'top 78%', end: 'bottom 6%', scrub: 0.7 }
      });
  }
  /* proximity: nearby light letters drift from the cursor, desktop only */
  if (fine && chars.length){
    var quicks = [];
    chars.forEach(function(ch){
      quicks.push({
        el: ch,
        x: gsap.quickTo(ch, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(ch, 'y', { duration: 0.6, ease: 'power3.out' })
      });
    });
    var raf = null, px = 0, py = 0;
    name.addEventListener('pointermove', function(e){
      px = e.clientX; py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function(){
        raf = null;
        quicks.forEach(function(q){
          var r = q.el.getBoundingClientRect();
          var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
          var d = Math.hypot(dx, dy), R = 200;
          if (d < R && d > 0.001){
            var f = (1 - d / R) * 9;
            q.x(-dx / d * f); q.y(-dy / d * f);
          } else { q.x(0); q.y(0); }
        });
      });
    });
    name.addEventListener('pointerleave', function(){
      quicks.forEach(function(q){ q.x(0); q.y(0); });
    });
  }
});

/* ---------- generic in-wing reveals (.akv) ---------- */
ScrollTrigger.batch('.ak-wing .akv', {
  start: 'top 86%', once: true,
  onEnter: function(batch){
    gsap.to(batch, {
      opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', stagger: 0.1
    });
  }
});

/* ---------- 3. The lit portrait ---------- */
document.querySelectorAll('.ak-frame').forEach(function(frame){
  var slices = frame.querySelectorAll('.ak-slice');
  if (slices.length === 3){
    gsap.set(slices[0], { yPercent: 10, opacity: 0 });
    gsap.set(slices[1], { yPercent: -8, opacity: 0 });
    gsap.set(slices[2], { yPercent: 13, opacity: 0 });
    ScrollTrigger.create({
      trigger: frame, start: 'top 80%', once: true,
      onEnter: function(){
        gsap.to(slices, {
          yPercent: 0, opacity: 1, duration: 1.5,
          ease: 'power4.out', stagger: 0.12
        });
      }
    });
  }
  gsap.fromTo(frame, { y: 20 }, {
    y: -20, ease: 'none',
    scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
  });

  if (fine){
    var spot = { r: 0 };
    var setR = function(){ frame.style.setProperty('--spot', spot.r.toFixed(1) + 'px'); };
    var grow = gsap.to(spot, {
      r: 230, duration: 0.8, ease: 'power3.out', paused: true, onUpdate: setR
    });
    /* the lean: barely there, the frame notices you */
    var rx = gsap.quickTo(frame, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    var ry = gsap.quickTo(frame, 'rotationY', { duration: 0.9, ease: 'power3.out' });
    frame.addEventListener('pointerenter', function(){ grow.play(); });
    frame.addEventListener('pointerleave', function(){
      grow.reverse(); rx(0); ry(0);
    });
    var fraf = null, fx = 0, fy = 0;
    frame.addEventListener('pointermove', function(e){
      fx = e.clientX; fy = e.clientY;
      if (fraf) return;
      fraf = requestAnimationFrame(function(){
        fraf = null;
        var r = frame.getBoundingClientRect();
        var nx = (fx - r.left) / r.width, ny = (fy - r.top) / r.height;
        frame.style.setProperty('--mx', (nx * 100).toFixed(2) + '%');
        frame.style.setProperty('--my', (ny * 100).toFixed(2) + '%');
        ry((nx - 0.5) * 4.4);
        rx((0.5 - ny) * 4.4);
      });
    });
    var hint = frame.closest('.ak-fig, figure');
    hint = hint ? hint.querySelector('.ak-hint') : null;
    if (hint){
      frame.addEventListener('pointerenter', function(){ hint.style.opacity = 0; }, { once: true });
    }
  } else {
    ScrollTrigger.create({
      trigger: frame, start: 'top 45%', once: true,
      onEnter: function(){
        var color = frame.querySelector('.ak-ph-color');
        if (color){
          color.style.maskImage = 'none';
          color.style.webkitMaskImage = 'none';
          gsap.fromTo(color, { opacity: 0 }, { opacity: 1, duration: 1.8, ease: 'power2.inOut' });
        }
      }
    });
  }
});

/* ---------- 4. The story thread ---------- */
document.querySelectorAll('.ak-story-track').forEach(function(track){
  var line = track.querySelector('.ak-thread i');
  if (line){
    gsap.to(line, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: track, start: 'top 72%', end: 'bottom 55%', scrub: 0.5 }
    });
  }
  track.querySelectorAll('.ak-ch-block').forEach(function(block){
    ScrollTrigger.create({
      trigger: block, start: 'top 64%', end: 'bottom 42%',
      onToggle: function(self){ block.classList.toggle('on', self.isActive); }
    });
  });
});

/* ---------- 5. The philosophy: words lit by scroll ---------- */
document.querySelectorAll('.ak-quote-track').forEach(function(track){
  var words = track.querySelectorAll('.ak-w');
  if (!words.length) return;
  ScrollTrigger.create({
    trigger: track, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: function(self){
      var n = Math.floor(self.progress * (words.length + 1));
      words.forEach(function(w, i){ w.classList.toggle('lit', i < n); });
    }
  });
});

/* ---------- 6. The mind: orbital particles ---------- */
document.querySelectorAll('.ak-orbit').forEach(function(host){
  var canvas = host.querySelector('.ak-orbit-canvas');
  if (!canvas || !hasTHREE){ host.classList.add('ak-orbit-static'); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    host.classList.add('ak-orbit-static'); return;
  }
  var pxr = SKY.pxr ? SKY.pxr() : Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pxr);

  /* round sprite, the site's shared dot */
  var tex = (function(){
    var s = 128, c = document.createElement('canvas');
    c.width = s; c.height = s;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(0.85, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s/2, s/2, s/2, 0, Math.PI*2); ctx.fill();
    var t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
    return t;
  })();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.z = 4.9;

  /* group carries the intro and the cursor tilt; sys carries the idle motion,
     so the two never fight over the same transform */
  var group = new THREE.Group();
  group.rotation.x = 0.55;   /* viewing inclination: rings read as ellipses, not edges */
  scene.add(group);
  var sys = new THREE.Group();
  group.add(sys);

  var paper = new THREE.Color(0xEAF0FF);
  var dimPaper = new THREE.Color(0xA8B4DC);
  var blue = new THREE.Color(0x2E40FF);
  var glow = new THREE.Color(0x9FB0FF);

  function makePoints(list, size, opacity){
    var pos = [], col = [];
    list.forEach(function(p){
      pos.push(p[0], p[1], p[2]);
      col.push(p[3].r, p[3].g, p[3].b);
    });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({
      size: size,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: opacity,
      map: tex,
      alphaTest: 0.05,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geo, mat);
  }

  /* the core: a tight luminous cluster */
  var coreList = [];
  for (var i = 0; i < 180; i++){
    var v = new THREE.Vector3(
      (Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)
    ).normalize().multiplyScalar(0.10 + Math.pow(Math.random(), 2.2) * 0.16);
    var cc = Math.random() < 0.5 ? glow : (Math.random() < 0.6 ? paper : blue);
    coreList.push([v.x, v.y, v.z, cc]);
  }
  var core = makePoints(coreList, 0.085, 0.95);
  core.frustumCulled = false;
  sys.add(core);

  /* five disciplines, five inclined rings */
  var dens = (window.innerWidth < 700) ? 0.6 : (window.innerWidth < 1024 ? 0.8 : 1);
  var RINGS = [
    { r: 0.62, tx: 0.38, tz: 0.08, n: 200, speed: 0.10 },
    { r: 0.85, tx: -0.26, tz: 0.28, n: 240, speed: -0.074 },
    { r: 1.07, tx: 0.14, tz: -0.34, n: 280, speed: 0.056 },
    { r: 1.29, tx: -0.44, tz: -0.10, n: 320, speed: -0.044 },
    { r: 1.50, tx: 0.26, tz: 0.40, n: 360, speed: 0.034 }
  ];
  var rings = [];
  RINGS.forEach(function(R){
    var list = [];
    var n = Math.round(R.n * dens);
    for (var k = 0; k < n; k++){
      var a = (k / n) * Math.PI * 2;
      var jr = R.r + (Math.random() - 0.5) * 0.045;
      var x = Math.cos(a) * jr;
      var y = (Math.random() - 0.5) * 0.02;
      var z = Math.sin(a) * jr;
      var rd = Math.random();
      var c = rd < 0.16 ? blue : (rd < 0.42 ? glow : dimPaper);
      list.push([x, y, z, c]);
    }
    var pts = makePoints(list, 0.070, 1);
    pts.frustumCulled = false;
    pts.rotation.x = R.tx;
    pts.rotation.z = R.tz;
    var holder = { obj: pts, speed: R.speed, targetOpacity: 1 };
    rings.push(holder);
    sys.add(pts);
  });

  /* size to the container */
  function size(){
    var w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  if (typeof ResizeObserver !== 'undefined'){
    new ResizeObserver(size).observe(host);
  } else {
    window.addEventListener('resize', size, { passive: true });
  }

  /* cursor tilt target, lerped in the loop */
  var tiltX = 0, tiltY = 0, curX = 0, curY = 0;
  if (fine){
    host.addEventListener('pointermove', function(e){
      var r = host.getBoundingClientRect();
      tiltY = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      tiltX = ((e.clientY - r.top) / r.height - 0.5) * 0.34;
    });
    host.addEventListener('pointerleave', function(){ tiltX = 0; tiltY = 0; });
  }

  /* render only while the room is on screen and the tab visible */
  var active = false, rafId = null, t0 = null;
  function frameLoop(now){
    rafId = null;
    if (!active) return;
    if (t0 === null) t0 = now;
    var t = (now - t0) / 1000;
    sys.rotation.y = t * 0.05;
    var breathe = 1 + Math.sin(t * 0.5) * 0.012;
    sys.scale.set(breathe, breathe, breathe);
    curX += (tiltX - curX) * 0.05;
    curY += (tiltY - curY) * 0.05;
    group.rotation.x = 0.55 + curX;
    group.rotation.z = curY * 0.4;
    rings.forEach(function(h){ h.obj.rotation.y += h.speed * 0.016; });
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frameLoop);
  }
  function wake(){ if (active && rafId === null) rafId = requestAnimationFrame(frameLoop); }

  ScrollTrigger.create({
    trigger: host, start: 'top bottom', end: 'bottom top',
    onToggle: function(self){ active = self.isActive; wake(); }
  });
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'visible') wake();
  });

  /* assembly: the system breathes in as one the first time it is seen */
  group.scale.set(0.86, 0.86, 0.86);
  ScrollTrigger.create({
    trigger: host, start: 'top 78%', once: true,
    onEnter: function(){
      gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out' });
      gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'power3.out' });
      gsap.from(group.rotation, { y: -0.55, duration: 2.2, ease: 'power3.out' });
    }
  });
});

/* ---------- 7. Wayfinding + magnetics ---------- */
document.querySelectorAll('.ak-wing[data-rail]').forEach(function(wing){
  var dots = wing.querySelectorAll('.ak-dot');
  var rooms = wing.querySelectorAll('[data-room]');
  if (dots.length !== rooms.length) return;
  rooms.forEach(function(room, i){
    ScrollTrigger.create({
      trigger: room, start: 'top 55%', end: 'bottom 55%',
      onToggle: function(self){
        if (self.isActive){
          dots.forEach(function(d, j){ d.classList.toggle('on', j === i); });
        }
      }
    });
  });
});

if (fine){
  document.querySelectorAll('.ak-wing [data-magnet]').forEach(function(el){
    var mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    var my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', function(e){
      var r = el.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.26);
      my((e.clientY - (r.top + r.height / 2)) * 0.26);
    });
    el.addEventListener('pointerleave', function(){ mx(0); my(0); });
  });
}

/* ---------- Recalculate once fonts are in ---------- */
if (document.fonts && document.fonts.ready){
  document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
}
})();
