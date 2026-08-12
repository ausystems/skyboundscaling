/* ==========================================================================
   SKYBOUND SCALING - case-showcase.js
   Scroll signal for the CASE STUDIES section.

   One number does all the work. For every spread currently on screen it sets
   two custom properties and lets CSS decide what they mean:

     --p   0 -> 1, the card's travel across the viewport   (drives the shot pan)
     --pc  the same travel remapped so it completes as the
           card reaches centre                              (draws the accent rule)

   The section rail gets --sp, the list's own progress, so the underline under
   "CASE STUDIES" fills as you move through the four.

   Only cards an IntersectionObserver reports as visible are measured, the loop
   parks itself when none are, and every write is a custom property on an
   element that is already composited - so a scroll frame costs a handful of
   getBoundingClientRect calls and nothing else. Reduced motion opts out
   entirely; the CSS then paints every fill at its finished state.

   It hooks on data attributes rather than class names, so the two case-study
   components - the poster wall on the home page and the spreads on /work/ -
   share one signal without sharing a stylesheet:
     [data-cs]        the section
     [data-cs-list]   the run of cases, whose travel becomes --sp
     [data-cs-card]   one case, which gets --p and --pc
   ========================================================================== */
(function(){
  'use strict';

  var sec = document.querySelector('[data-cs]');
  if (!sec) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var list  = sec.querySelector('[data-cs-list]');
  var cards = Array.prototype.slice.call(sec.querySelectorAll('[data-cs-card]'));
  if (!list || !cards.length) return;

  // Hands the rails and the shot pan over to the scroll signal. Until this is
  // set the CSS holds them at their finished state, so a blocked or broken
  // script degrades to a static section rather than an empty one.
  sec.setAttribute('data-cs-live', '');

  var watched = [list].concat(cards);
  var visible = [];
  var running = false;

  function clamp(n){ return n < 0 ? 0 : n > 1 ? 1 : n; }

  /* Travel of an element across the viewport: 0 the instant its top edge
     reaches the bottom of the screen, 1 the instant its bottom edge clears the
     top. Denominator is viewport + element height, which is exactly that span. */
  function travel(rect, vh){
    return clamp((vh - rect.top) / (vh + rect.height));
  }

  function frame(){
    var vh = window.innerHeight || document.documentElement.clientHeight;

    for (var i = 0; i < visible.length; i++){
      var el = visible[i];
      var p  = travel(el.getBoundingClientRect(), vh);

      if (el === list){
        // the rail lives in the head, a sibling of the list, so this one rides
        // on the section - custom properties inherit down, never sideways
        sec.style.setProperty('--sp', p.toFixed(4));
      } else {
        el.style.setProperty('--p',  p.toFixed(4));
        // remap 0.18-0.62 of the travel onto 0-1 so the rule finishes drawing
        // about when the card settles at centre, not when it leaves
        el.style.setProperty('--pc', clamp((p - 0.18) / 0.44).toFixed(4));
        // peak: 1 with the card dead centre, 0 at either edge of its travel.
        // The home page lifts the poster's scrim by this, so a project's site
        // is at its clearest exactly while you are looking at it.
        el.style.setProperty('--pk', (1 - Math.abs(p - 0.5) * 2).toFixed(4));
      }
    }

    if (visible.length) requestAnimationFrame(frame);
    else running = false;
  }

  function start(){
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var at = visible.indexOf(entry.target);
      if (entry.isIntersecting && at < 0) visible.push(entry.target);
      else if (!entry.isIntersecting && at >= 0) visible.splice(at, 1);
    });
    if (visible.length) start();
  }, { rootMargin: '15% 0px 15% 0px' });

  watched.forEach(function(el){ io.observe(el); });

  // Viewport changes move every card's travel; recompute on the next frame.
  window.addEventListener('resize', start, { passive: true });
  window.addEventListener('orientationchange', start, { passive: true });
})();
