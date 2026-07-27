/* ==========================================================================
   SKYBOUND SCALING - core.js
   Shared runtime for every page. Owns: environment flags, Lenis smooth
   scroll, header behavior, in-page navigation, the mobile menu, scroll
   reveals, the site-wide letter-by-letter title reveal, and every footer
   behavior (link rolls, fitted wordmark + magnetic hover, stacking-card
   reveal, back-to-top).

   Page scripts (home.js / contact.js) read the shared environment from
   window.SKY - they never re-derive it.
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
if (reduced) document.documentElement.classList.add('reduced');

/* ---------- GSAP global setup (once, before any page script) ---------- */
if (hasGSAP && hasST){
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/* ---------- Lenis smooth scroll ---------- */
var lenis;
if (!reduced && typeof Lenis !== 'undefined' && hasGSAP && hasST) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
  /* Cap per-frame delta: during heavy startup (scene build + shader compile) a
     single long frame must not fast-forward time-based animations like the
     loader. Frames over ~180ms are clamped to ~33ms instead. */
  gsap.ticker.lagSmoothing(180, 33);
}

/* ---------- Shared environment for page scripts ---------- */
window.SKY = {
  reduced: reduced,
  hasGSAP: hasGSAP,
  hasST: hasST,
  hasTHREE: hasTHREE,
  pxr: pxr,
  lenis: lenis || null
};

/* ---------- Header state ---------- */
var header = document.getElementById('site-header');
var lastY = 0;
function onScroll(){
  if (!header) return;
  var y = window.scrollY;
  header.classList.toggle('scrolled', y > 24);
  header.classList.toggle('hidden', y > lastY && y > 300);
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Smooth in-page navigation (anchor links through Lenis) ---------- */
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  var href = a.getAttribute('href');
  if (!href || href.length < 2) return;
  var el = document.querySelector(href);
  if (!el) return;
  e.preventDefault();
  if (lenis && lenis.scrollTo){
    lenis.scrollTo(el, { offset: -80, duration: 1.1 });
  } else {
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  try { el.focus({ preventScroll: true }); } catch (_){}
  if (history.replaceState) history.replaceState(null, '', href);
});

/* ---------- Scroll reveals ----------
   Any element with .rv / .rv-card inside a [data-rv-scope] container fades
   up as it enters the viewport. The home hero's .rv elements sit outside the
   scope on purpose - the preloader's exit timeline reveals those. */
if (hasGSAP && hasST && !reduced){

  var release = function(t){ gsap.set(t, { willChange: 'auto' }); };

  // Staggered fade-up cascade for every content block
  ScrollTrigger.batch('[data-rv-scope] .rv', {
    start: 'top 86%', once: true,
    onEnter: function(batch){
      gsap.set(batch, { willChange: 'transform,opacity' });
      gsap.to(batch, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        stagger: 0.09, overwrite: true,
        onComplete: function(){ release(batch); }
      });
    }
  });

  // Cards: lift + settle with a touch of scale for depth
  ScrollTrigger.batch('[data-rv-scope] .rv-card', {
    start: 'top 84%', once: true,
    onEnter: function(batch){
      gsap.set(batch, { willChange: 'transform,opacity' });
      gsap.to(batch, {
        opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out',
        stagger: 0.12, overwrite: true,
        onComplete: function(){ release(batch); }
      });
    }
  });

} else {
  // No GSAP or reduced motion: show everything in its final state
  document.querySelectorAll('.rv, .rv-card').forEach(function(el){ el.style.opacity = 1; el.style.transform = 'none'; });
  document.querySelectorAll('.rv-title').forEach(function(el){ el.style.opacity = 1; });
}

/* ---------- Recalculate trigger positions once the brand font paints ----------
   Archivo (display:swap) reflows headings when it replaces the fallback;
   without this, trigger offsets go stale and the first scroll jumps. */
if (hasST && !reduced){
  var refreshST = function(){ try { ScrollTrigger.refresh(); } catch(e) {} };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshST);
  window.addEventListener('load', refreshST);
}
})();

/* ---------- Footer: fit the statement wordmark to the card width ---------- */
/* Fit the footer statement wordmark to the available width - single line on
   desktop/tablet, two stacked lines on mobile. Measures the real rendered text,
   so it fills the width with no overflow, clipping, or wrapping in any font, and
   re-fits on resize and once the brand font has loaded. */
(function(){
  var wrap = document.querySelector('.foot-wordmark');
  if (!wrap) return;
  var lines = Array.prototype.slice.call(wrap.querySelectorAll('.fw-line'));
  function fit(){
    var cs = getComputedStyle(wrap);
    var avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (avail <= 0) return;
    var maxFs = 0;
    lines.forEach(function(el){
      if (getComputedStyle(el).display === 'none') return;
      el.style.fontSize = '100px';
      var w = el.scrollWidth;
      if (w > 0){ var fs = 100 * avail / w; el.style.fontSize = fs + 'px'; if (fs > maxFs) maxFs = fs; }
    });
    // clearance below the last line so the caps never meet/clip the legal bar
    if (maxFs > 0) wrap.style.paddingBottom = (maxFs * 0.1) + 'px';
  }
  var raf;
  function onResize(){ if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', fit);
  if (document.fonts){
    if (document.fonts.ready) document.fonts.ready.then(fit);
    // Force one more fit once the heavy brand weight is actually applied (display:swap
    // reflows the caps); without this the measurement can stick to the narrower
    // fallback metrics and the wordmark overflows the card.
    try { document.fonts.load('900 100px Archivo').then(fit, function(){}); } catch(e){}
  }
  fit();
})();

/* ============ FOOTER - Awwwards-grade motion ============ */
/* (a) masked text-roll on every footer link */
(function(){
  var links = document.querySelectorAll('.foot-nav a, .foot-legal-links a');
  Array.prototype.forEach.call(links, function(a){
    var label = a.textContent.trim();
    if (!label) return;
    a.textContent = '';
    var roll = document.createElement('span'); roll.className = 'foot-roll';
    var r1 = document.createElement('span'); r1.className = 'r r1'; r1.textContent = label;
    var r2 = document.createElement('span'); r2.className = 'r r2'; r2.setAttribute('aria-hidden','true'); r2.textContent = label;
    roll.appendChild(r1); roll.appendChild(r2); a.appendChild(roll);
  });
})();

/* (b) wordmark: split into letters, staggered reveal, magnetic hover wave */
(function(){
  var wrap = document.querySelector('.foot-wordmark');
  if (!wrap) return;
  var hasGSAP = typeof gsap !== 'undefined';
  var hasST = typeof ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  // split each line into letter spans (spaces preserved by .fw-ch white-space:pre)
  Array.prototype.forEach.call(wrap.querySelectorAll('.fw-line'), function(line){
    if (line.dataset.split) return;
    var text = line.textContent, frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++){
      var s = document.createElement('span'); s.className = 'fw-ch'; s.textContent = text[i];
      frag.appendChild(s);
    }
    line.textContent = ''; line.appendChild(frag); line.dataset.split = '1';
  });
  // re-fit now that letters render as inline-blocks
  window.dispatchEvent(new Event('resize'));

  function chars(){
    return Array.prototype.slice.call(wrap.querySelectorAll('.fw-ch'))
      .filter(function(c){ return c.offsetParent !== null; });
  }

  // The wordmark rides in with the footer's stacking-card reveal, so it is shown
  // immediately (no separate per-letter entrance that would compete with the card).
  // Keep the magnetic hover wave enabled.
  var revealed = true;
  if (hasGSAP) gsap.set(wrap, { autoAlpha: 1 });

  if (hasGSAP && fine && !reduced){
    var letters = [], built = false, hovering = false, fs = 80, ticking = false;
    function build(){
      letters = chars().map(function(c){
        return { el: c, set: gsap.quickSetter(c, 'css'),
                 cx: 0, cury: 0, curs: 1, ty: 0, ts: 1 };
      });
      built = true; measure();
    }
    function measure(){
      letters.forEach(function(o){ var r = o.el.getBoundingClientRect(); o.cx = r.left + r.width / 2; });
      var first = wrap.querySelector('.fw-ch'); if (first) fs = parseFloat(getComputedStyle(first).fontSize) || 80;
    }
    function startTick(){ if (!ticking){ ticking = true; gsap.ticker.add(tick); } }
    function tick(){
      var active = false;
      for (var i = 0; i < letters.length; i++){
        var o = letters[i];
        o.cury += (o.ty - o.cury) * 0.2;
        o.curs += (o.ts - o.curs) * 0.2;
        o.set({ y: o.cury, scale: o.curs });
        if (Math.abs(o.ty - o.cury) > 0.04 || Math.abs(o.ts - o.curs) > 0.002) active = true;
      }
      if (!hovering && !active){
        for (var j = 0; j < letters.length; j++){ letters[j].set({ y: 0, scale: 1 }); letters[j].cury = 0; letters[j].curs = 1; }
        gsap.ticker.remove(tick); ticking = false;
      }
    }
    wrap.addEventListener('pointerenter', function(){
      hovering = true; wrap.classList.add('is-hover');
      if (!built) build(); else measure();
    });
    wrap.addEventListener('pointermove', function(e){
      if (!hovering || !revealed || !built) return;
      startTick();
      var sigma = Math.max(82, fs * 0.95), lift = fs * 0.18;
      for (var i = 0; i < letters.length; i++){
        var o = letters[i], dx = e.clientX - o.cx;
        var inf = Math.exp(-(dx * dx) / (2 * sigma * sigma));
        o.ty = -lift * inf;
        o.ts = 1 + 0.17 * inf;
      }
    });
    wrap.addEventListener('pointerleave', function(){
      hovering = false; wrap.classList.remove('is-hover');
      if (built && revealed){
        for (var i = 0; i < letters.length; i++){ letters[i].ty = 0; letters[i].ts = 1; }
        startTick();
      }
    });
    window.addEventListener('resize', function(){ if (built) measure(); }, { passive: true });
  }
})();

/* ============ FOOTER - stacking-card reveal + back-to-top ============ */
(function(){
  var hasGSAP = typeof gsap !== 'undefined';
  var hasST   = typeof ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* (a) Stacking-card reveal: as the footer enters, the card rises and scales into
     place (scrubbed to scroll for a physical feel) and, via its negative top margin,
     settles overlapping the section above - so it reads as a card stacked on top.
     Reduced motion / no-GSAP: the card is simply shown in its final resting state. */
  var card = document.querySelector('.sf-card');
  if (card && hasGSAP && hasST && !reduced){
    gsap.fromTo(card,
      { y: 96, scale: 0.945 },
      { y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.sf', start: 'top bottom', end: 'top 56%', scrub: 0.6 } });
  }

  /* (b) Back-to-top: smooth scroll via Lenis when present, otherwise native. */
  var toTop = document.querySelector('.sf-totop');
  if (toTop){
    toTop.addEventListener('click', function(){
      if (window.__lenis && typeof window.__lenis.scrollTo === 'function'){
        window.__lenis.scrollTo(0, reduced ? { immediate: true } : { duration: 1.1 });
      } else {
        try { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
        catch(e){ window.scrollTo(0, 0); }
      }
    });
  }
})();

/* ============ SITE-WIDE TITLE REVEAL ============
   Every section title animates in letter-by-letter (fast sequential stagger with
   a smooth fade + subtle rise). One consistent style across the whole site.
   - Normal-flow titles (CTA, case studies): revealed on scroll into view.
   - Pinned-stack titles (protocol, roadmap): the first reveals when its section
     enters; the rest reveal as the pin's HUD counter advances (decoupled from the
     pin internals, so the cinematic choreography is never disturbed).
   The hero headline (typewriter) and footer wordmark already reveal per-letter. */
(function(){
  var hasGSAP = typeof gsap !== 'undefined';
  var hasST   = typeof ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEL = '.rv-title, .case-title, .proto-title, .rm-title';
  var titles = Array.prototype.slice.call(document.querySelectorAll(SEL));
  if (!titles.length) return;

  // Recursive splitter: wraps every character in a .tl span while preserving
  // <br> line breaks and any inline accent spans (&, ?, ., etc.). Letters of
  // one word are grouped inside a .tw wrapper (inline-block, nowrap) - bare
  // inline-block letter spans would otherwise be legal break points, letting
  // the browser wrap MID-WORD on narrow viewports.
  function split(el){
    if (el.dataset.tlSplit) return;
    el.dataset.tlSplit = '1';
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3){
          var t = n.nodeValue, frag = document.createDocumentFragment(), word = null;
          for (var i = 0; i < t.length; i++){
            var ch = t[i];
            if (ch === ' ' || ch === '\n' || ch === '\t'){
              word = null;
              frag.appendChild(document.createTextNode(ch));
              continue;
            }
            if (!word){
              word = document.createElement('span'); word.className = 'tw';
              frag.appendChild(word);
            }
            var s = document.createElement('span'); s.className = 'tl'; s.textContent = ch;
            word.appendChild(s);
          }
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR'){
          walk(n);
        }
      });
    })(el);
  }
  function letters(el){ return Array.prototype.slice.call(el.querySelectorAll('.tl')); }

  // Reduced motion / no GSAP: show titles statically, no split.
  if (!hasGSAP || reduced){ titles.forEach(function(t){ t.style.opacity = '1'; }); return; }

  titles.forEach(function(t){
    split(t);
    t.style.opacity = '1';                          // container visible; letters carry the reveal
    gsap.set(letters(t), { yPercent: 55, autoAlpha: 0 });
  });

  function reveal(t){
    if (!t || t.dataset.tlDone) return; t.dataset.tlDone = '1';
    gsap.to(letters(t), {
      yPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out',
      stagger: 0.022, overwrite: true
    });
  }

  if (!hasST){ titles.forEach(function(t){ gsap.set(letters(t), { yPercent: 0, autoAlpha: 1 }); }); return; }

  // normal-flow titles
  Array.prototype.slice.call(document.querySelectorAll('.rv-title')).forEach(function(t){
    ScrollTrigger.create({ trigger: t, start: 'top 88%', once: true, onEnter: function(){ reveal(t); } });
  });
  Array.prototype.slice.call(document.querySelectorAll('.case-title')).forEach(function(t){
    ScrollTrigger.create({ trigger: t, start: 'top 80%', once: true, onEnter: function(){ reveal(t); } });
  });

  // pinned-stack titles: first on section enter, the rest as the HUD counter advances
  function wirePinned(sectionSel, titleSel, counterId){
    var sec = document.querySelector(sectionSel);
    if (!sec) return;
    var ts = Array.prototype.slice.call(sec.querySelectorAll(titleSel));
    if (!ts.length) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 75%', once: true, onEnter: function(){ reveal(ts[0]); } });
    var counter = document.getElementById(counterId);
    if (counter && window.MutationObserver){
      new MutationObserver(function(){
        var n = parseInt((counter.textContent || '').replace(/\D/g, ''), 10);
        if (n >= 1 && ts[n - 1]) reveal(ts[n - 1]);
      }).observe(counter, { childList: true, characterData: true, subtree: true });
    }
  }
  wirePinned('#protocol', '.proto-title', 'proto-cur');
  wirePinned('#roadmap',  '.rm-title',    'rm-cur');
})();

/* ---------- Mobile / tablet menu ---------- */
(function(){
  var toggle = document.getElementById('nav-toggle');
  var menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  var isOpen = false;
  var lastFocus = null;
  var focusables = menu.querySelectorAll('a[href], button');

  function setOpen(v){
    if (v === isOpen) return;
    isOpen = v;
    document.body.classList.toggle('menu-open', v);
    toggle.setAttribute('aria-expanded', v ? 'true' : 'false');
    toggle.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', v ? 'false' : 'true');
    // lock scrolling under the overlay
    if (window.__lenis){ if (v) window.__lenis.stop(); else window.__lenis.start(); }
    document.documentElement.style.overflow = v ? 'hidden' : '';
    if (v){
      lastFocus = document.activeElement;
      if (focusables.length) setTimeout(function(){ focusables[0].focus(); }, 300);
    } else if (lastFocus){
      lastFocus.focus();
    }
  }

  toggle.addEventListener('click', function(){ setOpen(!isOpen); });

  // close after choosing a destination (let the hash navigation proceed)
  menu.querySelectorAll('a[href]').forEach(function(a){
    a.addEventListener('click', function(){ setOpen(false); });
  });

  document.addEventListener('keydown', function(e){
    if (!isOpen) return;
    if (e.key === 'Escape'){ setOpen(false); return; }
    // simple focus trap
    if (e.key === 'Tab' && focusables.length){
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  // auto-close if the viewport grows past the tablet breakpoint
  var mq = window.matchMedia('(max-width:1024px)');
  (mq.addEventListener ? mq.addEventListener.bind(mq,'change') : mq.addListener.bind(mq))(function(e){
    if (!e.matches && isOpen) setOpen(false);
  });
})();
