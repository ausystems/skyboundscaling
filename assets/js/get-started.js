/* ==========================================================================
   SKYBOUND SCALING - get-started.js
   Runtime for the VSL-style Get Started funnel. Jobs, in order:

     1. Film grain + hero intro choreography (masked headline lines).
     2. The playable video sales letter: a GSAP-driven kinetic type reel
        inside the video frame, with live progress, timestamp, pause and
        an end-card CTA. When a real VSL lands it drops into this shell.
     3. One Three.js scene, and only one: the volumetric halo behind the
        pitch inside the video frame. It brightens while the pitch plays.
        Gated on WebGL, visibility and reduced motion; without it the CSS
        halo carries the same look.
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
var hasTHREE= SKY.hasTHREE!= null ? SKY.hasTHREE: typeof THREE !== 'undefined';
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

  var state = 'idle';  // idle | playing | paused | ended
  function setBoost(v){ if (window.__gsHaloBoost) window.__gsHaloBoost(v); }

  function start(){
    if (end) end.hidden = true;
    vsl.classList.add('is-playing');
    play.setAttribute('aria-label', 'Pause the pitch');
    state = 'playing';
    setBoost(1);
    tl.play();
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
    play.style.opacity = 0;
    play.style.pointerEvents = 'none';
    if (end){ end.hidden = false; gsap.from(end, { autoAlpha: 0, duration: .6, ease: 'power2.out' }); }
    setBoost(.5);
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

/* ---------- 3. The VSL halo (the page's only WebGL scene) ---------------- */
(function(){
  if (!hasTHREE || !hasGSAP || reduced) return;
  var canvas = qs('#gs-vsl-canvas');
  var frame  = qs('#gs-vsl');
  if (!canvas || !frame) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
  } catch(e){ canvas.style.display = 'none'; return; }
  canvas.addEventListener('webglcontextlost', function(ev){ ev.preventDefault(); canvas.style.display = 'none'; });

  var scene = new THREE.Scene();
  var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  cam.position.z = 1;

  var boost = { value: 0 };
  window.__gsHaloBoost = function(v){
    gsap.to(boost, { value: v, duration: 1.2, ease: 'power2.out', overwrite: true });
  };

  var mat = new THREE.ShaderMaterial({
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
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function resize(){
    var w = frame.clientWidth || 1, h = frame.clientHeight || 1;
    renderer.setPixelRatio(Math.min(pxr(), 1.75));
    renderer.setSize(w, h, false);
    mat.uniforms.uAspect.value = w / h;
  }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(frame);

  var visible = true, hidden = false, t0 = null;
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      entries.forEach(function(en){ visible = en.isIntersecting; });
    }, { rootMargin: '140px' }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function(){ hidden = document.hidden; });

  gsap.ticker.add(function(time){
    if (hidden || !visible) return;
    if (t0 === null) t0 = time;
    mat.uniforms.uTime.value = time - t0;
    mat.uniforms.uBoost.value = boost.value;
    renderer.render(scene, cam);
  });

  var rT;
  window.addEventListener('resize', function(){
    clearTimeout(rT); rT = setTimeout(resize, 150);
  }, { passive: true });
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
