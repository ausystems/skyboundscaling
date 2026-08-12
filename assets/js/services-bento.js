/* ==========================================================================
   SKYBOUND SCALING - services-bento.js
   The services bento is fully static - the four glass illustrations are
   inline SVG placed by CSS. The only job left here is keeping the fixed
   header in its light-on-dark treatment while the dark stage passes under
   it. Driven from live geometry so pinned sections, Lenis, and mid-page
   reloads can never leave it stale; the svDark flag means we only ever
   remove the class we added ourselves - the hero / manifesto choreography
   in home.js owns the class everywhere else.
   ========================================================================== */
(function(){
'use strict';

var section = document.getElementById('protocol');
if (!section) return;
var stage = section.querySelector('.sv-stage');
if (!stage) return;

var svDark = false;
function syncHeader(){
  var hh = 76;
  var r = stage.getBoundingClientRect();
  var band = r.top < hh && r.bottom > hh;
  if (band && !svDark){
    svDark = true;
    document.body.classList.add('on-dark');
  } else if (!band && svDark){
    svDark = false;
    document.body.classList.remove('on-dark');
  }
}

var tick = false;
window.addEventListener('scroll', function(){
  if (tick) return;
  tick = true;
  requestAnimationFrame(function(){
    tick = false;
    syncHeader();
  });
}, { passive: true });
window.addEventListener('resize', syncHeader, { passive: true });
syncHeader();
})();
