/* ==========================================================================
   SKYBOUND SCALING - get-started.js
   Runtime for the VSL-style Get Started funnel. Jobs, in order:

     1. Film grain + hero intro choreography (masked headline lines).
     2. The playable video sales letter: a GSAP-driven kinetic type reel
        inside the video frame, with live progress, timestamp, pause and
        an end-card CTA. When a real VSL lands it drops into this shell.
     3. Three.js scenes, all intentional and standalone:
          a. #gs-bg      - fixed particle depth field behind the page
          b. #gs-vsl-canvas - volumetric blue halo + drifting dust in the frame
          c. #gs-ribbon  - glowing fresnel ribbon behind the shift statement
        One shared ticker, IntersectionObserver gating, DPR caps, context
        loss handling. No WebGL, no GSAP or reduced motion all fall back to
        the CSS-only look.
     4. Scroll choreography: chip parallax, VSL settle, shift emphasis swap.
     5. Micro-interactions: cursor glow on cards, tilt, magnetic CTAs.
     6. The before/after slider, FAQ accordion, sticky bar, header staging.
   ========================================================================== */
(function(){
'use strict';

var SKY     = window.SKY || {};
var reduced = SKY.reduced != null ? SKY.reduced : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = SKY.hasGSAP != null ? SKY.hasGSAP : typeof gsap !== 'undefined';
var hasST   = SKY.hasST   != null ? SKY.hasST   : typeof ScrollTrigger !== 'undefined';
var hasTHREE= SKY.hasTHREE!= null ? SKY.hasTHREE: typeof THREE !== 'undefined';
var pxr     = SKY.pxr || function(){ return Math.min(window.devicePixelRatio || 1, 2); };
var fine    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
var mobile  = window.innerWidth < 768;

function qs(s, el){ return (el || document).querySelector(s); }
function qsa(s, el){ return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

/* ---------- 0. Film grain (tiny generated tile, one layer, no repaints) --- */
(function(){
  var host = qs('.gs-grain');
  if (!host) return;
  try {
    var c = document.createElement('canvas'); c.width = 96; c.height = 96;
    var x = c.getContext('2d');
    var img = x.createImageData(96, 96), d = img.data;
    for (var i = 0; i < d.length; i += 4){
      var v = (Math.random() * 255) | 0;
      d[i] = d[i+1] = d[i+2] = v; d[i+3] = 26;
    }
    x.putImageData(img, 0, 0);
    host.style.backgroundImage = 'url(' + c.toDataURL() + ')';
  } catch(e){}
})();

/* ---------- 1. Hero intro ------------------------------------------------ */
var h1 = qs('#gs-h1');
if (hasGSAP && !reduced){
  // wrap each headline line in an overflow mask
  qsa('.gs-h1-line', h1).forEach(function(line){
    var mask = document.createElement('span'); mask.className = 'gs-mask';
    var inner = document.createElement('span'); inner.className = 'gs-mask-in';
    if (line.classList.contains('gs-h1-accent')) inner.classList.add('gs-h1-accent-in');
    while (line.firstChild) inner.appendChild(line.firstChild);
    mask.appendChild(inner); line.appendChild(mask);
  });
  var masks = qsa('.gs-mask-in', h1);
  gsap.set(masks, { yPercent: 118 });
  gsap.set(h1, { opacity: 1 });

  var intro = gsap.timeline({ delay: .12, defaults: { ease: 'power3.out' } });
  intro
    .to('#gs-hero-pill', { opacity: 1, y: 0, duration: .7 }, 0)
    .to(masks, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger: .11 }, .18)
    .to(qsa('.gs-hero-inner .gsi').filter(function(el){ return el.id !== 'gs-hero-pill'; }),
        { opacity: 1, y: 0, duration: .85, stagger: .1 }, .72)
    .to('.gsi-vsl', { opacity: 1, y: 0, scale: 1, duration: 1.25, ease: 'power3.out' }, .9)
    .from('.gs-fchip', { autoAlpha: 0, scale: .55, duration: .9, ease: 'back.out(1.6)', stagger: .08, clearProps: 'opacity,visibility' }, 1.0);

  // perpetual float: yPercent + rotation, composing cleanly with the
  // ScrollTrigger parallax below (which owns plain y)
  qsa('.gs-fchip').forEach(function(chip, i){
    gsap.to(chip, {
      yPercent: -14 - (i % 2) * 6, rotation: i % 2 ? 2.4 : -2.4,
      duration: 2.6 + i * .45, yoyo: true, repeat: -1,
      ease: 'sine.inOut', delay: 1.6 + i * .3
    });
  });

  // Watchdog: if rAF is throttled (hidden tab, constrained device), the
  // intro must never strand the hero half-revealed. Force-complete it.
  setTimeout(function(){
    if (intro.progress() < 1) intro.progress(1);
  }, 4500);
} else {
  // No GSAP or reduced motion: everything lands in its final state
  qsa('.gsi, .gsi-vsl').forEach(function(el){ el.style.opacity = 1; el.style.transform = 'none'; });
  if (h1) h1.style.opacity = 1;
}

/* ---------- 2. The video sales letter ------------------------------------ */
(function(){
  var vsl    = qs('#gs-vsl');
  if (!vsl) return;
  var poster = qs('#gs-vsl-poster');
  var slides = qsa('.gs-slide', vsl);
  var play   = qs('#gs-vsl-play');
  var end    = qs('#gs-vsl-end');
  var replay = qs('#gs-vsl-replay');
  var bar    = qs('#gs-vsl-bar');
  var timeEl = qs('#gs-vsl-time');

  if (!hasGSAP || reduced){ if (play) play.style.display = 'none'; return; }

  // per-slide hold times (longer lines breathe longer); lands at ~40s total
  var HOLDS = [4.4, 4.4, 4.4, 4.4, 5.8, 4.6, 5.5];
  var CROSS = .75;
  var tl = gsap.timeline({ paused: true, onUpdate: onTick, onComplete: onEnd });

  // poster out
  tl.to(poster, { autoAlpha: 0, scale: .96, duration: .8, ease: 'power2.inOut' }, 0);
  // slides in sequence, each crossfading into the next
  var at = .45;
  slides.forEach(function(s, i){
    var hold = HOLDS[i] != null ? HOLDS[i] : 4.4;
    tl.fromTo(s,
      { autoAlpha: 0, scale: .95, filter: 'blur(14px)' },
      { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: CROSS, ease: 'power2.out' }, at);
    tl.to(s,
      { autoAlpha: 0, scale: 1.045, filter: 'blur(10px)', duration: CROSS, ease: 'power2.in' },
      at + CROSS + hold);
    at += CROSS + hold;
  });

  var TOTAL = tl.duration();
  function fmt(t){
    t = Math.max(0, Math.round(t));
    var m = (t / 60) | 0, s = t % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  var totalLabel = fmt(TOTAL);
  var lastShown = -1;
  function onTick(){
    var t = tl.time();
    if (bar) bar.style.width = (t / TOTAL * 100).toFixed(2) + '%';
    var whole = Math.floor(t);
    if (whole !== lastShown && timeEl){
      lastShown = whole;
      timeEl.textContent = fmt(t) + ' / ' + totalLabel;
    }
  }
  if (timeEl) timeEl.textContent = '00:00 / ' + totalLabel;

  var state = 'idle';  // idle | playing | paused | ended
  function setBoost(v){ if (window.__gsHaloBoost) window.__gsHaloBoost(v); }

  function start(){
    if (end){ end.hidden = true; }
    vsl.classList.add('is-playing');
    play.setAttribute('aria-label', 'Pause the pitch');
    state = 'playing';
    setBoost(1);
    tl.play(state === 'ended' ? 0 : undefined);
  }
  function pause(){
    vsl.classList.remove('is-playing');
    play.setAttribute('aria-label', 'Resume the pitch');
    state = 'paused';
    setBoost(.35);
    tl.pause();
  }
  function onEnd(){
    state = 'ended';
    vsl.classList.remove('is-playing');
    play.setAttribute('aria-label', 'Replay the pitch');
    if (play) play.style.opacity = 0;
    if (play) play.style.pointerEvents = 'none';
    if (end){ end.hidden = false; gsap.from(end, { autoAlpha: 0, duration: .6, ease: 'power2.out' }); }
    setBoost(.5);
  }
  function restart(){
    if (end) end.hidden = true;
    if (play){ play.style.opacity = ''; play.style.pointerEvents = ''; }
    lastShown = -1;
    tl.pause(0); onTick();
    start();
  }

  play.addEventListener('click', function(){
    if (state === 'playing') pause();
    else if (state === 'ended') restart();
    else start();
  });
  if (replay) replay.addEventListener('click', restart);

  // clicking the frame while playing pauses (links/buttons keep working)
  vsl.addEventListener('click', function(e){
    if (state !== 'playing') return;
    if (e.target.closest('a, button')) return;
    pause();
  });

  // scrolled far away while playing: quietly pause
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting && state === 'playing') pause();
      });
    }, { threshold: .12 }).observe(vsl);
  }
})();

/* ---------- 3. Three.js scenes ------------------------------------------- */
var scenes = [];   // { el, visible, render(t, dt), resize() }
(function(){
  if (!hasTHREE || !hasGSAP || reduced) return;

  function makeRenderer(canvas, aa){
    try {
      var r = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !!aa, powerPreference: 'high-performance' });
      r.setClearColor(0x000000, 0);
      return r;
    } catch(e){ canvas.style.display = 'none'; return null; }
  }
  function watchLoss(canvas){
    canvas.addEventListener('webglcontextlost', function(ev){
      ev.preventDefault(); canvas.style.display = 'none';
    });
  }

  /* --- a. Background particle depth field --- */
  (function(){
    var canvas = qs('#gs-bg');
    if (!canvas) return;
    var renderer = makeRenderer(canvas, false);
    if (!renderer) return;
    watchLoss(canvas);

    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(62, 1, .1, 80);
    cam.position.z = 16;

    var N = mobile ? 240 : 620;
    var pos = new Float32Array(N * 3);
    var aSize = new Float32Array(N);
    var aPhase = new Float32Array(N);
    var aTint = new Float32Array(N);
    for (var i = 0; i < N; i++){
      pos[i*3]   = (Math.random() * 2 - 1) * 24;
      pos[i*3+1] = (Math.random() * 2 - 1) * 15;
      pos[i*3+2] = -6 + Math.random() * 14;
      aSize[i]  = .8 + Math.random() * 1.9;
      aPhase[i] = Math.random() * Math.PI * 2;
      aTint[i]  = Math.random();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize',  new THREE.BufferAttribute(aSize, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
    geo.setAttribute('aTint',  new THREE.BufferAttribute(aTint, 1));

    var mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime:   { value: 0 },
        uScroll: { value: 0 },
        uPx:     { value: 1 }
      },
      vertexShader: [
        'attribute float aSize; attribute float aPhase; attribute float aTint;',
        'uniform float uTime; uniform float uScroll; uniform float uPx;',
        'varying float vTint; varying float vTw;',
        'void main(){',
        '  vTint = aTint;',
        '  vec3 p = position;',
        '  p.y += sin(uTime * .14 + aPhase) * .7;',
        '  p.x += cos(uTime * .10 + aPhase * 1.7) * .55;',
        '  float depth = (p.z + 6.0) / 14.0;',
        '  p.y += uScroll * mix(6.5, 1.6, depth);',
        '  p.y = mod(p.y + 15.0, 30.0) - 15.0;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
        '  vTw = .75 + .25 * sin(uTime * .9 + aPhase * 3.0);',
        '  gl_PointSize = aSize * uPx * (26.0 / -mv.z) * vTw;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vTint; varying float vTw;',
        'void main(){',
        '  float d = length(gl_PointCoord - .5);',
        '  float a = smoothstep(.5, .06, d);',
        '  vec3 col = mix(vec3(.26,.45,1.0), vec3(.82,.9,1.0), vTint);',
        '  gl_FragColor = vec4(col, a * .8 * vTw);',
        '}'
      ].join('\n')
    });
    scene.add(new THREE.Points(geo, mat));

    var mx = 0, my = 0, tx = 0, ty = 0;
    if (fine){
      window.addEventListener('pointermove', function(e){
        tx = (e.clientX / window.innerWidth - .5);
        ty = (e.clientY / window.innerHeight - .5);
      }, { passive: true });
    }

    function resize(){
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setPixelRatio(Math.min(pxr(), 1.75));
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    resize();

    scenes.push({
      el: canvas, visible: true, resize: resize,
      render: function(t){
        mat.uniforms.uTime.value = t;
        mat.uniforms.uPx.value = renderer.getPixelRatio();
        var doc = document.documentElement;
        var max = Math.max(1, doc.scrollHeight - window.innerHeight);
        mat.uniforms.uScroll.value = (window.scrollY || 0) / max;
        mx += (tx - mx) * .04; my += (ty - my) * .04;
        cam.position.x = mx * 1.4;
        cam.position.y = -my * 1.0;
        renderer.render(scene, cam);
      }
    });
  })();

  /* --- b. VSL halo + dust --- */
  (function(){
    var canvas = qs('#gs-vsl-canvas');
    var frame  = qs('#gs-vsl');
    if (!canvas || !frame) return;
    var renderer = makeRenderer(canvas, false);
    if (!renderer) return;
    watchLoss(canvas);

    var scene = new THREE.Scene();
    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    cam.position.z = 1;

    var boost = { value: .0 };
    window.__gsHaloBoost = function(v){
      gsap.to(boost, { value: v, duration: 1.2, ease: 'power2.out', overwrite: true });
    };

    var quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: {
          uTime:   { value: 0 },
          uAspect: { value: 1.78 },
          uBoost:  { value: 0 }
        },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: [
          'varying vec2 vUv; uniform float uTime; uniform float uAspect; uniform float uBoost;',
          'void main(){',
          '  vec2 c = vUv - vec2(.5, .46);',
          '  c.x *= uAspect;',
          '  c.x += sin(uTime * .21) * .012;',
          '  c.y += cos(uTime * .17) * .010;',
          '  float r = length(c);',
          '  float breathe = .92 + .08 * sin(uTime * .55);',
          '  float k = 1.0 + uBoost * .55;',
          '  vec3 col = vec3(0.0);',
          '  col += vec3(.62, .76, 1.0) * exp(-r * r * 34.0) * .58 * breathe * k;',
          '  col += vec3(.24, .43, 1.0) * exp(-r * r * 9.5) * .46 * k;',
          '  col += vec3(.08, .16, .55) * exp(-r * r * 3.1) * .5;',
          '  float a = clamp(col.b * 1.15, 0.0, 1.0);',
          '  gl_FragColor = vec4(col, a);',
          '}'
        ].join('\n')
      })
    );
    scene.add(quad);

    // drifting dust inside the light
    var DN = mobile ? 46 : 90;
    var dp = new Float32Array(DN * 3);
    var ds = new Float32Array(DN);
    var dv = new Float32Array(DN);
    for (var i = 0; i < DN; i++){
      dp[i*3]   = (Math.random() * 2 - 1) * .92;
      dp[i*3+1] = (Math.random() * 2 - 1) * .92;
      dp[i*3+2] = 0;
      ds[i] = .6 + Math.random() * 1.5;
      dv[i] = .015 + Math.random() * .05;
    }
    var dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    dgeo.setAttribute('aSize', new THREE.BufferAttribute(ds, 1));
    dgeo.setAttribute('aVel',  new THREE.BufferAttribute(dv, 1));
    var dmat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: [
        'attribute float aSize; attribute float aVel;',
        'uniform float uTime; uniform float uPx;',
        'varying float vA;',
        'void main(){',
        '  vec3 p = position;',
        '  p.y = mod(p.y + uTime * aVel + 1.0, 2.0) - 1.0;',
        '  p.x += sin(uTime * .3 + p.y * 5.0) * .02;',
        '  float centre = 1.0 - clamp(length(p.xy) / 1.15, 0.0, 1.0);',
        '  vA = centre * .75;',
        '  gl_PointSize = aSize * uPx * (1.2 + centre);',
        '  gl_Position = vec4(p.xy, 0.0, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vA;',
        'void main(){',
        '  float d = length(gl_PointCoord - .5);',
        '  float a = smoothstep(.5, .1, d) * vA;',
        '  gl_FragColor = vec4(vec3(.75, .85, 1.0), a);',
        '}'
      ].join('\n')
    });
    scene.add(new THREE.Points(dgeo, dmat));

    function resize(){
      var w = frame.clientWidth || 1, h = frame.clientHeight || 1;
      renderer.setPixelRatio(Math.min(pxr(), 1.75));
      renderer.setSize(w, h, false);
      quad.material.uniforms.uAspect.value = w / h;
    }
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(frame);

    scenes.push({
      el: canvas, visible: true, resize: resize,
      render: function(t){
        quad.material.uniforms.uTime.value = t;
        quad.material.uniforms.uBoost.value = boost.value;
        dmat.uniforms.uTime.value = t;
        dmat.uniforms.uPx.value = renderer.getPixelRatio();
        renderer.render(scene, cam);
      }
    });
  })();

  /* --- c. The shift ribbon: glowing fresnel torus knot --- */
  (function(){
    var canvas = qs('#gs-ribbon');
    if (!canvas) return;
    var wrap = canvas.parentElement;
    var renderer = makeRenderer(canvas, true);
    if (!renderer) return;
    watchLoss(canvas);

    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(45, 1, .1, 30);
    cam.position.z = 4.4;

    var mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.06, .3, mobile ? 160 : 240, mobile ? 24 : 36, 2, 3),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: [
          'varying vec3 vN; varying vec3 vV;',
          'void main(){',
          '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
          '  vN = normalize(normalMatrix * normal);',
          '  vV = normalize(-mv.xyz);',
          '  gl_Position = projectionMatrix * mv;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'varying vec3 vN; varying vec3 vV; uniform float uTime;',
          'void main(){',
          '  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.1);',
          '  vec3 col = mix(vec3(.07, .13, .4), vec3(.62, .78, 1.0), f);',
          '  float glow = f * (1.25 + .2 * sin(uTime * .8));',
          '  gl_FragColor = vec4(col * (glow + .05), clamp(f * 1.4 + .03, 0.0, 1.0));',
          '}'
        ].join('\n')
      })
    );
    scene.add(mesh);

    var scrollRot = { v: 0 };
    if (hasST){
      gsap.to(scrollRot, {
        v: Math.PI * 1.15, ease: 'none',
        scrollTrigger: { trigger: '.gs-shift', start: 'top bottom', end: 'bottom top', scrub: .8 }
      });
    }

    function resize(){
      var w = wrap.clientWidth || 1, h = wrap.clientHeight || 1;
      renderer.setPixelRatio(Math.min(pxr(), 1.75));
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    resize();

    scenes.push({
      el: canvas, visible: false, resize: resize,
      render: function(t){
        mesh.material.uniforms.uTime.value = t;
        mesh.rotation.x = t * .1;
        mesh.rotation.y = scrollRot.v + t * .06;
        renderer.render(scene, cam);
      }
    });
  })();

  /* --- shared loop: one ticker, visibility-gated --- */
  if (scenes.length){
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          scenes.forEach(function(sc){ if (sc.el === en.target) sc.visible = en.isIntersecting; });
        });
      }, { rootMargin: '120px' });
      scenes.forEach(function(sc){ io.observe(sc.el); });
    }
    var hidden = false;
    document.addEventListener('visibilitychange', function(){ hidden = document.hidden; });
    var t0 = null;
    gsap.ticker.add(function(time){
      if (hidden) return;
      if (t0 === null) t0 = time;
      var t = time - t0;
      for (var i = 0; i < scenes.length; i++){
        if (scenes[i].visible) scenes[i].render(t);
      }
    });
    var rT;
    window.addEventListener('resize', function(){
      clearTimeout(rT);
      rT = setTimeout(function(){ scenes.forEach(function(sc){ sc.resize(); }); }, 150);
    }, { passive: true });
  }
})();

/* ---------- 4. Scroll choreography --------------------------------------- */
if (hasGSAP && hasST && !reduced){

  // VSL frame settles from a slight backward tilt as it enters
  gsap.fromTo('#gs-vsl', { rotationX: 7 }, {
    rotationX: 0, ease: 'none',
    scrollTrigger: { trigger: '.gs-vsl-wrap', start: 'top 92%', end: 'top 34%', scrub: .6 }
  });

  // floating chips drift at different depths while the hero scrolls away
  qsa('.gs-fchip').forEach(function(chip){
    var depth = parseFloat(chip.dataset.depth || 30);
    gsap.to(chip, {
      y: -depth * 2.2, ease: 'none',
      scrollTrigger: { trigger: '.gs-hero', start: 'top top', end: 'bottom top', scrub: .7 }
    });
  });

  // the shift statement: attention hands over from line A to line B
  var sa = qs('.gs-shift-a'), sb = qs('.gs-shift-b');
  if (sa && sb){
    gsap.set(sb, { opacity: .14 });
    gsap.timeline({
      scrollTrigger: { trigger: '.gs-shift-title', start: 'top 74%', end: 'top 28%', scrub: .5 }
    })
    .to(sa, { opacity: .28, duration: 1 }, 0)
    .to(sb, { opacity: 1, duration: 1 }, 0);
  }

  // "average" quietly corrodes as it scrolls into view
  var avg = qs('[data-avg]');
  if (avg){
    gsap.fromTo(avg, { opacity: 1, filter: 'blur(0px)' }, {
      opacity: .55, filter: 'blur(1.1px)', ease: 'none',
      scrollTrigger: { trigger: avg, start: 'top 78%', end: 'top 38%', scrub: .6 }
    });
  }
}

/* ---------- 5. Micro-interactions ---------------------------------------- */
if (fine && hasGSAP && !reduced){

  // cursor-tracked glow inside every card
  qsa('.gs-card').forEach(function(card){
    card.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    });
  });

  // gentle 3D tilt on bento cards
  if (window.innerWidth > 1024){
    qsa('[data-tilt]').forEach(function(card){
      var rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3.out' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        rx(-((e.clientY - r.top) / r.height - .5) * 3.6);
        ry(((e.clientX - r.left) / r.width - .5) * 4.4);
      });
      card.addEventListener('pointerleave', function(){ rx(0); ry(0); });
    });
  }

  // magnetic pull on the main CTAs
  qsa('[data-magnet]').forEach(function(btn){
    var qx = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3.out' });
    var qy = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3.out' });
    btn.addEventListener('pointermove', function(e){
      var r = btn.getBoundingClientRect();
      qx(((e.clientX - r.left) / r.width - .5) * 12);
      qy(((e.clientY - r.top) / r.height - .5) * 9);
    });
    btn.addEventListener('pointerleave', function(){ qx(0); qy(0); });
  });
}

/* ---------- 6. Before/after slider (always on: it is the content) -------- */
qsa('[data-ba]').forEach(function(ba){
  var frame = ba.querySelector('.gs-ba-frame');
  var range = ba.querySelector('.gs-ba-range');
  if (!frame || !range) return;

  function set(p){
    p = Math.max(0, Math.min(100, p));
    frame.style.setProperty('--pos', p.toFixed(2) + '%');
    if (String(Math.round(p)) !== range.value) range.value = Math.round(p);
  }
  range.addEventListener('input', function(){ set(parseFloat(range.value)); });

  var dragging = false;
  function fromEvent(e){
    var r = frame.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  }
  frame.addEventListener('pointerdown', function(e){
    dragging = true;
    frame.setPointerCapture && frame.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  frame.addEventListener('pointermove', function(e){ if (dragging) fromEvent(e); });
  ['pointerup','pointercancel'].forEach(function(t){
    frame.addEventListener(t, function(){
      if (!dragging) return;
      dragging = false;
      if (hasGSAP && !reduced){
        var now = parseFloat(getComputedStyle(frame).getPropertyValue('--pos'));
        gsap.fromTo(frame, { '--pos': (now + (now > 50 ? -1.2 : 1.2)) + '%' },
                           { '--pos': now + '%', duration: .45, ease: 'elastic.out(1,.45)' });
      }
    });
  });
  set(50);
});

/* ---------- 7. FAQ accordion (single open, animated, accessible) --------- */
(function(){
  var items = qsa('.gs-faq-item');
  if (!items.length) return;

  function close(item){
    var q = qs('.gs-faq-q', item), a = qs('.gs-faq-a', item);
    item.classList.remove('open');
    q.setAttribute('aria-expanded', 'false');
    if (hasGSAP && !reduced){
      gsap.to(a, { height: 0, opacity: 0, duration: .45, ease: 'power3.inOut',
        onComplete: function(){ a.hidden = true; gsap.set(a, { clearProps: 'height,opacity' }); } });
    } else { a.hidden = true; }
  }
  function open(item){
    var q = qs('.gs-faq-q', item), a = qs('.gs-faq-a', item);
    item.classList.add('open');
    q.setAttribute('aria-expanded', 'true');
    a.hidden = false;
    if (hasGSAP && !reduced){
      gsap.fromTo(a, { height: 0, opacity: 0 },
        { height: a.scrollHeight, opacity: 1, duration: .55, ease: 'power3.out',
          onComplete: function(){ gsap.set(a, { height: 'auto' }); } });
    }
  }
  items.forEach(function(item){
    var q = qs('.gs-faq-q', item);
    q.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      items.forEach(function(other){ if (other !== item && other.classList.contains('open')) close(other); });
      if (isOpen) close(item); else open(item);
    });
  });
})();

/* ---------- 8. Sticky bar ------------------------------------------------ */
(function(){
  var bar  = qs('#gs-bar');
  var book = qs('#book');
  var foot = qs('.sf');
  if (!bar) return;
  var quiet = 0;
  var update = function(){
    var past = window.scrollY > window.innerHeight * .85;
    bar.classList.toggle('is-on', past && quiet === 0);
  };
  if ('IntersectionObserver' in window && (book || foot)){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ quiet += en.isIntersecting ? 1 : -1; });
      quiet = Math.max(0, quiet);
      update();
    }, { rootMargin: '0px 0px -10% 0px' });
    if (book) io.observe(book);
    if (foot) io.observe(foot);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- 9. Header staging: dark page, light footer ------------------- */
if (hasST){
  ScrollTrigger.create({
    trigger: '.sf', start: 'top 72px', end: 'bottom top',
    onToggle: function(self){
      document.body.classList.toggle('on-dark', !self.isActive);
    }
  });
}
})();
