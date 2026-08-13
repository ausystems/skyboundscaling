/* ==========================================================================
   SKYBOUND SCALING - get-started.js
   Runtime for the VSL-style Get Started funnel. Jobs, in order:

     1. Film grain + hero intro choreography (masked headline lines).
     2. The playable video sales letter: a GSAP-driven kinetic type reel
        inside the video frame, with live progress, timestamp, pause and
        an end-card CTA. When a real VSL lands it drops into this shell.
     3. The hero background: the supplied animated-gradient shader, ported
        from React to vanilla WebGL2 and driven by the shared GSAP ticker.
     4. Scroll choreography: the VSL settling out of a slight tilt, and
        the word "average" corroding as it enters view.
     5. Micro-interactions: cursor glow on cards, tilt, magnetic CTAs.
     6. The before/after slider, FAQ accordion, sticky bar, header staging.
   ========================================================================== */
(function(){
'use strict';

var SKY     = window.SKY || {};
var reduced = SKY.reduced != null ? SKY.reduced : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = SKY.hasGSAP != null ? SKY.hasGSAP : typeof gsap !== 'undefined';
var hasST   = SKY.hasST   != null ? SKY.hasST   : typeof ScrollTrigger !== 'undefined';
var pxr     = SKY.pxr || function(){ return Math.min(window.devicePixelRatio || 1, 2); };
var fine    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

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
if (hasGSAP && !reduced && h1){
  // wrap each headline line in an overflow mask
  qsa('.gs-h1-line', h1).forEach(function(line){
    var mask = document.createElement('span'); mask.className = 'gs-mask';
    var inner = document.createElement('span'); inner.className = 'gs-mask-in';
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
    .to('.gsi-vsl', { opacity: 1, y: 0, scale: 1, duration: 1.25, ease: 'power3.out' }, .9);

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

  var state = "idle";  // idle | playing | paused | ended
  // The placeholder bloom is driven by CSS off .is-playing, no JS needed.

  function start(){
    if (end) end.hidden = true;
    vsl.classList.add('is-playing');
    play.setAttribute('aria-label', 'Pause the pitch');
    state = 'playing';
    tl.play();
  }
  function pause(){
    vsl.classList.remove('is-playing');
    play.setAttribute('aria-label', 'Resume the pitch');
    state = 'paused';
    tl.pause();
  }
  function onEnd(){
    state = 'ended';
    vsl.classList.remove('is-playing');
    play.setAttribute('aria-label', 'Replay the pitch');
    play.style.opacity = 0;
    play.style.pointerEvents = 'none';
    if (end){ end.hidden = false; gsap.from(end, { autoAlpha: 0, duration: .6, ease: 'power2.out' }); }
  }
  function restart(){
    if (end) end.hidden = true;
    play.style.opacity = '';
    play.style.pointerEvents = '';
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

/* ---------- 3. Hero background: the animated gradient field --------------
   A vanilla port of the supplied React component. Same WebGL2 shader and
   same uniform set; the React wrapper's useEffect/ResizeObserver/rAF loop
   become a plain IIFE driven by the page's shared GSAP ticker, so it stays
   in step with everything else and pauses with the tab.

   Tuned as a custom preset in the site's own blue: near-black base, a low
   proportion so only thin filaments of colour show, and half speed. The
   canvas fades in once the first frame is on screen, so a blocked or
   unsupported context simply leaves the hero as it was. */
(function(){
  var canvas = qs('#gs-hero-shader');
  var host   = canvas && canvas.parentElement;
  if (!canvas || !host || reduced || !hasGSAP) return;

  var P = {
    color1: '#04060C',   // page black, so the field sits on brand ground
    color2: '#2E6BFF',   // --gsB, the blue used across the site
    color3: '#BBD4FF',   // ice highlight
    rotation: -50, proportion: 6, scale: 0.05, speed: 13, distortion: 0,
    swirl: 50, swirlIterations: 16, softness: 47, offset: -299,
    shape: 0 /* Checks */, shapeSize: 45
  };

  var gl;
  try {
    gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: true });
  } catch(e){ return; }
  if (!gl) return;

  var VERT = [
    '#version 300 es',
    'in vec4 a_position;',
    'void main(){ gl_Position = a_position; }'
  ].join('\n');

  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'uniform float u_time; uniform float u_pixelRatio; uniform vec2 u_resolution;',
    'uniform float u_scale; uniform float u_rotation;',
    'uniform vec4 u_color1; uniform vec4 u_color2; uniform vec4 u_color3;',
    'uniform float u_proportion; uniform float u_softness; uniform float u_shape;',
    'uniform float u_shapeScale; uniform float u_distortion; uniform float u_swirl;',
    'uniform float u_swirlIterations;',
    'out vec4 fragColor;',
    '#define TWO_PI 6.28318530718',
    '#define PI 3.14159265358979323846',
    'vec2 rotate(vec2 uv, float th){ return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv; }',
    'float random(vec2 st){ return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }',
    'float noise(vec2 st){',
    '  vec2 i = floor(st); vec2 f = fract(st);',
    '  float a = random(i);',
    '  float b = random(i + vec2(1.0, 0.0));',
    '  float c = random(i + vec2(0.0, 1.0));',
    '  float d = random(i + vec2(1.0, 1.0));',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  float x1 = mix(a, b, u.x); float x2 = mix(c, d, u.x);',
    '  return mix(x1, x2, u.y);',
    '}',
    'vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur){',
    '  vec3 color1 = c1.rgb * c1.a;',
    '  vec3 color2 = c2.rgb * c2.a;',
    '  vec3 color3 = c3.rgb * c3.a;',
    '  float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);',
    '  float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);',
    '  vec3 blended_color_2 = mix(color1, color2, r1);',
    '  float blended_opacity_2 = mix(c1.a, c2.a, r1);',
    '  vec3 c = mix(blended_color_2, color3, r2);',
    '  float o = mix(blended_opacity_2, c3.a, r2);',
    '  return vec4(c, o);',
    '}',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;',
    '  float t = .5 * u_time;',
    '  float noise_scale = .0005 + .006 * u_scale;',
    '  uv -= .5;',
    '  uv *= (noise_scale * u_resolution);',
    '  uv = rotate(uv, u_rotation * .5 * PI);',
    '  uv /= u_pixelRatio;',
    '  uv += .5;',
    '  float n1 = noise(uv * 1. + t);',
    '  float n2 = noise(uv * 2. - t);',
    '  float angle = n1 * TWO_PI;',
    '  uv.x += 4. * u_distortion * n2 * cos(angle);',
    '  uv.y += 4. * u_distortion * n2 * sin(angle);',
    '  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));',
    '  for (float i = 1.; i <= iterations_number; i++){',
    '    uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);',
    '    uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);',
    '  }',
    '  float proportion = clamp(u_proportion, 0., 1.);',
    '  float shape = 0.; float mixer = 0.;',
    '  if (u_shape < .5){',
    '    vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);',
    '    shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);',
    '    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);',
    '  } else if (u_shape < 1.5){',
    '    vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);',
    '    float f = fract(stripes_shape_uv.y);',
    '    shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);',
    '    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);',
    '  } else {',
    '    float sh = 1. - uv.y;',
    '    sh -= .5;',
    '    sh /= (noise_scale * u_resolution.y);',
    '    sh += .5;',
    '    float shape_scaling = .2 * (1. - u_shapeScale);',
    '    shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));',
    '    mixer = shape;',
    '  }',
    '  vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);',
    '  fragColor = vec4(color_mix.rgb, color_mix.a);',
    '}'
  ].join('\n');

  function compile(type, src){
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ gl.deleteShader(s); return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ['u_time','u_resolution','u_pixelRatio','u_scale','u_rotation','u_color1','u_color2',
   'u_color3','u_proportion','u_softness','u_shape','u_shapeScale','u_distortion',
   'u_swirl','u_swirlIterations'].forEach(function(n){ U[n] = gl.getUniformLocation(prog, n); });

  // #rgb / #rrggbb / #rrggbbaa -> normalised rgba
  function hexToRgba(hex){
    var c = hex.replace('#',''), r = 0, g = 0, b = 0, a = 1;
    if (c.length === 3){
      r = parseInt(c[0]+c[0],16)/255; g = parseInt(c[1]+c[1],16)/255; b = parseInt(c[2]+c[2],16)/255;
    } else if (c.length >= 6){
      r = parseInt(c.slice(0,2),16)/255; g = parseInt(c.slice(2,4),16)/255; b = parseInt(c.slice(4,6),16)/255;
      if (c.length === 8) a = parseInt(c.slice(6,8),16)/255;
    }
    return [r,g,b,a];
  }
  var C1 = hexToRgba(P.color1), C2 = hexToRgba(P.color2), C3 = hexToRgba(P.color3);

  // Cap the ratio, and feed the SAME value to the shader that sized the
  // buffer: u_pixelRatio divides the uv, so a mismatch rescales the pattern.
  function ratio(){ return Math.min(window.devicePixelRatio || 1, 1.6); }

  function resize(){
    var w = host.clientWidth, h = host.clientHeight, pr = ratio();
    if (!w || !h) return;
    canvas.width  = Math.round(w * pr);
    canvas.height = Math.round(h * pr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);

  var visible = true, hidden = false, t0 = null, lit = false;
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      entries.forEach(function(en){ visible = en.isIntersecting; });
    }, { rootMargin: '80px' }).observe(host);
  }
  document.addEventListener('visibilitychange', function(){ hidden = document.hidden; });
  canvas.addEventListener('webglcontextlost', function(ev){
    ev.preventDefault(); host.classList.remove('is-live'); visible = false;
  });

  gsap.ticker.add(function(time){
    if (hidden || !visible) return;
    if (t0 === null) t0 = time;
    var elapsed = time - t0;
    var speed = (P.speed / 100) * 5;

    gl.useProgram(prog);
    gl.uniform1f(U.u_time, elapsed * speed + P.offset * 0.01);
    gl.uniform2f(U.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(U.u_pixelRatio, ratio());
    gl.uniform1f(U.u_scale, P.scale);
    gl.uniform1f(U.u_rotation, (P.rotation * Math.PI) / 180);
    gl.uniform4f(U.u_color1, C1[0], C1[1], C1[2], C1[3]);
    gl.uniform4f(U.u_color2, C2[0], C2[1], C2[2], C2[3]);
    gl.uniform4f(U.u_color3, C3[0], C3[1], C3[2], C3[3]);
    gl.uniform1f(U.u_proportion, P.proportion / 100);
    gl.uniform1f(U.u_softness, P.softness / 100);
    gl.uniform1f(U.u_shape, P.shape);
    gl.uniform1f(U.u_shapeScale, P.shapeSize / 100);
    gl.uniform1f(U.u_distortion, P.distortion / 50);
    gl.uniform1f(U.u_swirl, P.swirl / 100);
    gl.uniform1f(U.u_swirlIterations, P.swirl === 0 ? 0 : P.swirlIterations);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (!lit){ lit = true; host.classList.add('is-live'); }
  });
})();

/* ---------- 4. Scroll choreography --------------------------------------- */
if (hasGSAP && hasST && !reduced){

  // VSL frame settles from a slight backward tilt as it enters
  gsap.fromTo('#gs-vsl', { rotationX: 7 }, {
    rotationX: 0, ease: 'none',
    scrollTrigger: { trigger: '.gs-vsl-wrap', start: 'top 92%', end: 'top 34%', scrub: .6 }
  });

}

/* ---------- 4b. The cost deck --------------------------------------------
   A physical card deck that advances as the section scrolls. The split
   holds sticky (CSS, no ScrollTrigger pin, so nothing fights Lenis or the
   overflow:clip ancestors) while a scrubbed timeline lifts the leading
   card away and promotes the one behind it. Wide viewports only: below
   901px the cards stay a plain stacked list, which is also the no-JS and
   reduced-motion state. */
if (hasGSAP && hasST && !reduced && typeof gsap.matchMedia === 'function'){
  gsap.matchMedia().add('(min-width:901px) and (prefers-reduced-motion: no-preference)', function(){
    var track = qs('#gs-prob-track');
    var deck  = qs('#gs-deck');
    if (!track || !deck) return;
    var cards = qsa('.gs-dcard', deck);
    var segs  = qsa('.gs-deck-seg', track);
    if (cards.length < 2) return;

    var HOLD = .55, MOVE = 1;                 // timeline units per beat
    var LAST = cards.length - 1;

    // Resting pose for a card sitting `d` places back in the deck.
    function pose(d){
      return {
        yPercent: 9 * d,
        scale: 1 - .06 * d,
        opacity: d === 0 ? 1 : (d === 1 ? .5 : .22),
        filter: 'blur(' + (d * 2.2) + 'px)',
        rotationX: 0
      };
    }

    // The deck is absolutely stacked, so the container needs an explicit
    // height: the tallest card. Measured, not guessed, so copy can change.
    function sizeDeck(){
      deck.style.height = 'auto';
      var h = 0;
      cards.forEach(function(c){ h = Math.max(h, c.offsetHeight); });
      if (h) deck.style.height = h + 'px';
    }

    function setActive(i){
      cards.forEach(function(c, n){ c.classList.toggle('is-active', n === i); });
      segs.forEach(function(s, n){
        s.classList.toggle('is-active', n === i);
        s.classList.toggle('is-past', n < i);
      });
    }

    deck.classList.add('is-deck');
    track.classList.add('is-deck');
    sizeDeck();

    var ctx = gsap.context(function(){
      cards.forEach(function(c, i){
        gsap.set(c, { zIndex: cards.length - i, transformOrigin: '50% 100%' });
        gsap.set(c, pose(i));
      });

      var tl = gsap.timeline({
        onUpdate: function(){
          var t = tl.time(), idx = 0;
          for (var i = 1; i <= LAST; i++){
            if (t >= HOLD + (i - 1) * (MOVE + HOLD) + MOVE * .45) idx = i;
          }
          setActive(idx);
        },
        scrollTrigger: {
          trigger: track, start: 'top top', end: 'bottom bottom',
          scrub: .7, invalidateOnRefresh: true
        }
      });

      var at = HOLD;
      for (var i = 1; i <= LAST; i++){
        // The leading card peels off the top of the deck. Its fade runs at
        // half the travel time so it is gone well before the next card is
        // legible: overlap the two and both headlines read at once, which
        // looks like a mistake rather than a transition.
        tl.to(cards[i - 1], {
          yPercent: -78, rotationX: 34, scale: .9,
          duration: MOVE * .85, ease: 'power2.in'
        }, at);
        tl.to(cards[i - 1], {
          opacity: 0, filter: 'blur(10px)',
          duration: MOVE * .5, ease: 'power2.in'
        }, at);
        // Everything still in the deck advances one place, starting a beat
        // later so the promotion lands into a clear frame.
        for (var j = i; j <= LAST; j++){
          tl.to(cards[j], Object.assign({ duration: MOVE * .78, ease: 'power3.out' }, pose(j - i)), at + MOVE * .22);
        }
        at += MOVE + HOLD;
      }
      // a final beat so the last card holds fully before the section releases
      tl.to({}, { duration: HOLD });
    }, track);

    var rT;
    function onResize(){ clearTimeout(rT); rT = setTimeout(function(){ sizeDeck(); ScrollTrigger.refresh(); }, 160); }
    window.addEventListener('resize', onResize, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ sizeDeck(); ScrollTrigger.refresh(); });

    // Teardown when the media query stops matching: hand the cards back to
    // normal flow with no inline transforms left behind.
    return function(){
      window.removeEventListener('resize', onResize);
      clearTimeout(rT);
      ctx.revert();
      deck.classList.remove('is-deck');
      track.classList.remove('is-deck');
      deck.style.height = '';
      setActive(0);
    };
  });
}

/* ---------- 5. Micro-interactions ---------------------------------------- */
if (fine && hasGSAP && !reduced){

  // cursor-tracked glow inside every card and the cost panel
  qsa('.gs-card, .gs-panel').forEach(function(card){
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
    qs('.gs-faq-q', item).addEventListener('click', function(){
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
