/* ==========================================================================
   SKYBOUND SCALING - case.js
   Case-study pages (work/). Two jobs:
     1. the site-screenshot panel's cursor-driven tilt, the same physical
        hover feel as the home page's conversion panel
     2. the arrow controls on the all-work shelf that closes the page

   Loads after core.js. Degrades gracefully: no pointer, or
   prefers-reduced-motion, falls back to a static, readable page.
   ========================================================================== */
(function(){
'use strict';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Site panel: cursor-driven tilt + lift ---------- */
(function(){
  var panel = document.querySelector('.cs-frame');
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
      'perspective(1400px) rotateX(' + ry.toFixed(2) + 'deg) rotateY(' + rx.toFixed(2) + 'deg)' +
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
    tlift = -6; tscale = 1.008;
    kick();
  });
  panel.addEventListener('pointermove', function(e){
    var r = panel.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;
    var py = (e.clientY - r.top) / r.height;
    trx = (px - 0.5) * 6;
    try_ = (0.5 - py) * 5;
    kick();
  });
  panel.addEventListener('pointerleave', function(){
    trx = 0; try_ = 0; tlift = 0; tscale = 1;
    kick();
  });
})();

/* ---------- All-work shelf: arrow controls ----------
   The shelf itself is native scroll-snap and works with no JS at all, so
   the arrows stay hidden until this runs and confirms the track actually
   overflows. They scroll by exactly one card, and disable at each end so
   the control never lies about where you are. */
(function(){
  var viewport = document.querySelector('[data-cw-viewport]');
  var track    = document.querySelector('[data-cw-track]');
  var nav      = document.querySelector('[data-cw-nav]');
  if (!viewport || !track || !nav) return;

  var prev = nav.querySelector('[data-cw-prev]');
  var next = nav.querySelector('[data-cw-next]');
  if (!prev || !next) return;

  function step(){
    var item = track.querySelector('.cw-item');
    if (!item) return viewport.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return item.getBoundingClientRect().width + gap;
  }

  function overflows(){
    // a sub-pixel slack keeps the arrows from appearing on a shelf that fits
    return track.scrollWidth - viewport.clientWidth > 2;
  }

  function sync(){
    if (!overflows()){ nav.hidden = true; return; }
    nav.hidden = false;
    var max = track.scrollWidth - viewport.clientWidth;
    prev.disabled = viewport.scrollLeft <= 2;
    next.disabled = viewport.scrollLeft >= max - 2;
  }

  function scrollBy(dir){
    viewport.scrollBy({
      left: dir * step(),
      behavior: reduced ? 'auto' : 'smooth'
    });
  }

  prev.addEventListener('click', function(){ scrollBy(-1); });
  next.addEventListener('click', function(){ scrollBy(1); });

  var ticking = false;
  viewport.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ sync(); ticking = false; });
  }, {passive:true});

  window.addEventListener('resize', sync, {passive:true});
  // late-loading cover images change scrollWidth, so re-check once settled
  window.addEventListener('load', sync);
  sync();
})();
})();
