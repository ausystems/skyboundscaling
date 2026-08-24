/* ==========================================================================
   SKYBOUND SCALING - founder.js
   Choreography for the founder gallery (.ak-wing on the about page) and
   the compressed home band (.ak-band). Six jobs:

     1. Header handoff: body.on-dark while a wing overlaps the header, so
        the nav flips to its light variant inside the dark rooms.
     2. The arrival: name rises letter by letter, then the outlined line
        fills with brand blue as the visitor scrolls.
     3. The lit portrait: three slices reconstruct the photo on entry, then
        the cursor becomes a spotlight that restores true color inside its
        beam. Touch devices get a scroll-triggered color reveal instead.
     4. The story thread: a light line draws down the chapters and each
        chapter number fills as it becomes the active one.
     5. The philosophy: a pinned quote whose words illuminate one by one,
        mapped to scroll progress. The final word takes the orange.
     6. Wayfinding: rail dots track the active room; the system diagram
        assembles once when it enters.

   Loads after core.js on both pages. Reads window.SKY. Degrades: without
   GSAP, or under prefers-reduced-motion, every element is set to its
   final visible state and only CSS-level polish remains.
   ========================================================================== */
(function(){
'use strict';
var SKY = window.SKY || {};
var reduced = SKY.reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = typeof gsap !== 'undefined';
var hasST = typeof ScrollTrigger !== 'undefined';
var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

var wings = document.querySelectorAll('.ak-wing');
if (!wings.length) return;

/* ---------- Static finish: no motion runtime, or reduced motion ---------- */
function settle(){
  document.querySelectorAll('.akv').forEach(function(el){
    el.style.opacity = 1; el.style.transform = 'none';
  });
  document.querySelectorAll('.ak-name .ak-fill').forEach(function(el){
    el.style.clipPath = 'inset(0 0 0 0)';
  });
  document.querySelectorAll('.ak-thread i').forEach(function(el){
    el.style.transform = 'none';
  });
  document.querySelectorAll('.ak-w').forEach(function(el){ el.classList.add('lit'); });
  document.querySelectorAll('.ak-ch-block').forEach(function(el){ el.classList.add('on'); });
  document.querySelectorAll('.ak-sys').forEach(function(el){ el.classList.add('on'); });
  document.querySelectorAll('.ak-frame').forEach(function(f){ f.classList.add('ak-lit'); });
}
if (!hasGSAP || !hasST || reduced){
  settle();
  /* the color layer is hidden by CSS in these states; nothing else to run */
  return;
}

/* ---------- 1. Header handoff (body.on-dark inside the dark rooms) ---------- */
wings.forEach(function(wing){
  ScrollTrigger.create({
    trigger: wing,
    start: 'top ' + (document.getElementById('site-header') ? '84px' : 'top'),
    end: 'bottom 84px',
    onToggle: function(self){
      document.body.classList.toggle('on-dark', self.isActive);
    }
  });
});

/* ---------- 2. The arrival ---------- */
document.querySelectorAll('.ak-name').forEach(function(name){
  var chars = name.querySelectorAll('.ak-ch');
  if (chars.length){
    gsap.set(chars, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: name, start: 'top 82%', once: true,
      onEnter: function(){
        gsap.to(chars, {
          yPercent: 0, duration: 1.1, ease: 'power4.out',
          stagger: { each: 0.045, from: 'start' }
        });
      }
    });
  }
  var fill = name.querySelector('.ak-fill');
  if (fill){
    gsap.to(fill, {
      clipPath: 'inset(0 0% 0 0)', ease: 'none',
      scrollTrigger: {
        trigger: name, start: 'top 62%', end: 'bottom 18%', scrub: 0.6
      }
    });
  }
  /* proximity tilt: nearby letters lean toward the cursor, desktop only */
  if (fine && chars.length){
    var quicks = [];
    chars.forEach(function(ch){
      quicks.push({
        el: ch,
        x: gsap.quickTo(ch, 'x', { duration: 0.5, ease: 'power3.out' }),
        y: gsap.quickTo(ch, 'y', { duration: 0.5, ease: 'power3.out' })
      });
    });
    var raf = null;
    var px = 0, py = 0;
    name.addEventListener('pointermove', function(e){
      px = e.clientX; py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function(){
        raf = null;
        quicks.forEach(function(q){
          var r = q.el.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dx = px - cx, dy = py - cy;
          var d = Math.hypot(dx, dy);
          var R = 220;
          if (d < R){
            var f = (1 - d / R) * 14;
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
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09
    });
  }
});

/* ---------- 3. The lit portrait ---------- */
document.querySelectorAll('.ak-frame').forEach(function(frame){
  var slices = frame.querySelectorAll('.ak-slice');
  if (slices.length === 3){
    gsap.set(slices[0], { yPercent: 12, opacity: 0 });
    gsap.set(slices[1], { yPercent: -10, opacity: 0 });
    gsap.set(slices[2], { yPercent: 16, opacity: 0 });
    ScrollTrigger.create({
      trigger: frame, start: 'top 78%', once: true,
      onEnter: function(){
        gsap.to(slices, {
          yPercent: 0, opacity: 1, duration: 1.3,
          ease: 'power4.out', stagger: 0.12
        });
      }
    });
  }
  /* gentle parallax drift inside the room */
  gsap.fromTo(frame, { y: 26 }, {
    y: -26, ease: 'none',
    scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
  });

  if (fine){
    /* the spotlight: cursor position and beam radius as CSS variables */
    var spot = { r: 0 };
    var setR = function(){ frame.style.setProperty('--spot', spot.r.toFixed(1) + 'px'); };
    var grow = gsap.to(spot, {
      r: 240, duration: 0.7, ease: 'power3.out', paused: true, onUpdate: setR
    });
    frame.addEventListener('pointerenter', function(){ grow.play(); });
    frame.addEventListener('pointerleave', function(){ grow.reverse(); });
    var fraf = null, fx = 0, fy = 0;
    frame.addEventListener('pointermove', function(e){
      fx = e.clientX; fy = e.clientY;
      if (fraf) return;
      fraf = requestAnimationFrame(function(){
        fraf = null;
        var r = frame.getBoundingClientRect();
        frame.style.setProperty('--mx', ((fx - r.left) / r.width * 100).toFixed(2) + '%');
        frame.style.setProperty('--my', ((fy - r.top) / r.height * 100).toFixed(2) + '%');
      });
    });
    /* fade the caption hint once the visitor has found the light */
    var hint = frame.parentElement.querySelector('.ak-hint');
    if (hint){
      frame.addEventListener('pointerenter', function(){ hint.style.opacity = 0; }, { once: true });
    }
  } else {
    /* touch: the portrait warms to full color as the room is explored */
    ScrollTrigger.create({
      trigger: frame, start: 'top 45%', once: true,
      onEnter: function(){
        var color = frame.querySelector('.ak-ph-color');
        if (color){
          color.style.maskImage = 'none';
          color.style.webkitMaskImage = 'none';
          gsap.fromTo(color, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.inOut' });
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
      scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 55%', scrub: 0.5 }
    });
  }
  track.querySelectorAll('.ak-ch-block').forEach(function(block){
    ScrollTrigger.create({
      trigger: block, start: 'top 62%', end: 'bottom 40%',
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

/* ---------- 6. System diagram + rail dots ---------- */
document.querySelectorAll('.ak-sys').forEach(function(svg){
  ScrollTrigger.create({
    trigger: svg, start: 'top 74%', once: true,
    onEnter: function(){ svg.classList.add('on'); }
  });
});

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

/* ---------- Recalculate once fonts are in (headline metrics shift) ---------- */
if (document.fonts && document.fonts.ready){
  document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
}
})();
