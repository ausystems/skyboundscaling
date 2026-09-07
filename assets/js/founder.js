/* ==========================================================================
   SKYBOUND SCALING - founder.js  (v3, minimal)
   One job: while a dark founder section (.ak-wing) sits under the fixed
   header, the header flips to its light variant via the site's existing
   body.on-dark convention. Everything else the old gallery script did is
   gone; the section is static and core.js owns its .rv reveals.
   ========================================================================== */
(function(){
'use strict';
var wings = document.querySelectorAll('.ak-wing');
if (!wings.length) return;
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
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
})();
