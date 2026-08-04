/* ==========================================================================
   SKYBOUND SCALING - case.js
   Case-study pages (work/). One job: the site-screenshot panel's
   cursor-driven tilt - the same physical hover feel as the home page's
   conversion panel.

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
})();
