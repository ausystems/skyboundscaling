/* ==========================================================================
   SKYBOUND SCALING - get-started.js
   Choreography for the Get Started funnel. Five jobs:

     1. The hero transformation - the page loads as its "average" self and a
        scanline re-renders it as the brand. Runs once, ~1.6s, then cleans up.
     2. Header staging - body.on-dark (the site's existing header system)
        follows whichever stage is under the header line.
     3. The shift emphasis swap - scrub-driven, no pin.
     4. The before/after slider - pointer drag + a real range input, so it
        works by touch, mouse, and keyboard alike.
     5. The sticky bar - appears after the first viewport, retires while the
        booking chamber or the footer is on screen.

   Everything except the slider is presentation, so reduced motion and no-JS
   both land on the finished page (the CSS hides the average layer by
   default; core.js keeps the .rv reveals accessible). The slider stays
   functional under reduced motion - it is interaction, not decoration.
   ========================================================================== */
(function(){
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined';
  var hasST   = typeof ScrollTrigger !== 'undefined';

  /* ---------- 0. The close chamber's stripe-flow ------------------------
     Same module the home page manifesto runs, so the two fields are the same
     background by construction. It self-gates on WebGL, visibility, and
     reduced motion; without it the section keeps its CSS gradient. */
  if (window.SkyboundFlow) window.SkyboundFlow('gs-flow');

  /* ---------- 4. Before/after slider (always on - it is the content) ---- */
  document.querySelectorAll('[data-ba]').forEach(function(ba){
    var frame = ba.querySelector('.gs-ba-frame');
    var range = ba.querySelector('.gs-ba-range');
    if (!frame || !range) return;

    function set(p){
      p = Math.max(0, Math.min(100, p));
      ba.style.setProperty('--pos', p.toFixed(2) + '%');
      if (String(Math.round(p)) !== range.value) range.value = Math.round(p);
    }
    range.addEventListener('input', function(){ set(parseFloat(range.value)); });

    var dragging = false;
    function fromEvent(e){
      var r = frame.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    }
    frame.addEventListener('pointerdown', function(e){
      // the range input handles its own pointer; everything else drags
      dragging = true;
      frame.setPointerCapture && frame.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    frame.addEventListener('pointermove', function(e){ if (dragging) fromEvent(e); });
    ['pointerup','pointercancel'].forEach(function(t){
      frame.addEventListener(t, function(){
        if (!dragging) return;
        dragging = false;
        // a touch of spring on release - juice, not physics homework
        if (hasGSAP && !reduced){
          var now = parseFloat(getComputedStyle(ba).getPropertyValue('--pos'));
          gsap.fromTo(ba, { '--pos': (now + (now > 50 ? -1.2 : 1.2)) + '%' },
                          { '--pos': now + '%', duration: .45, ease: 'elastic.out(1,.45)' });
        }
      });
    });
    set(50);
  });

  /* ---------- 5. Sticky bar --------------------------------------------- */
  var bar  = document.getElementById('gs-bar');
  var book = document.getElementById('book');
  var foot = document.querySelector('.sf');
  if (bar){
    var quiet = 0;  // how many "retire the bar" zones are on screen
    if ('IntersectionObserver' in window && (book || foot)){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ quiet += en.isIntersecting ? 1 : -1; });
        quiet = Math.max(0, quiet);
        update();
      }, { rootMargin: '0px 0px -10% 0px' });
      if (book) io.observe(book);
      if (foot) io.observe(foot);
    }
    var update = function(){
      var past = window.scrollY > window.innerHeight * 0.85;
      bar.classList.toggle('is-on', past && quiet === 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 2. Header staging ----------------------------------------- */
  // body starts with on-dark hardcoded (the hero is dark). From here on, the
  // class simply follows how many dark stages sit under the header line.
  if (hasST){
    var darkCount = 0;
    document.querySelectorAll('.gs-dark, .gs-close').forEach(function(sec){
      ScrollTrigger.create({
        trigger: sec, start: 'top 72px', end: 'bottom 72px',
        onToggle: function(self){
          darkCount += self.isActive ? 1 : -1;
          document.body.classList.toggle('on-dark', darkCount > 0);
        }
      });
    });
  }

  if (!hasGSAP || reduced) return;   // everything below is decoration

  /* ---------- 1. Hero transformation ------------------------------------ */
  var hero = document.querySelector('.gs-hero');
  if (hero){
    hero.classList.add('gs-anim');          // shows avg layer, clips pro layer
    var pro  = hero.querySelector('.gs-hero-pro');
    var scan = hero.querySelector('.gs-scan');
    var kids = pro ? Array.prototype.slice.call(pro.children) : [];

    gsap.set(kids, { y: 26, autoAlpha: 0 });
    var tl = gsap.timeline({ delay: .55 });
    tl.to(scan, { top: '100%', duration: 1.05, ease: 'power3.inOut' }, 0)
      .to(pro,  { clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power3.inOut' }, 0)
      .to(kids, { y: 0, autoAlpha: 1, duration: .8, ease: 'power3.out', stagger: .09 }, .45)
      .add(function(){
        // drop the class BEFORE clearing the inline clip - the .gs-anim rule
        // re-clips the layer to nothing otherwise, and it also retires the
        // average layer and the scanline via their own display gates
        hero.classList.remove('gs-anim');
        gsap.set(pro, { clearProps: 'clipPath' });
      });

    // Insurance: GSAP's ticker rides requestAnimationFrame, which browsers
    // suspend in background tabs. If the page loads unseen, land on the
    // finished hero no later than 4s in; the visitor never meets the average
    // layer without its payoff.
    setTimeout(function(){
      if (hero.classList.contains('gs-anim')) tl.progress(1).kill();
    }, 4000);
  }

  /* ---------- 3. Shift emphasis swap ------------------------------------ */
  if (hasST){
    var a = document.querySelector('.gs-shift-a');
    var b = document.querySelector('.gs-shift-b');
    if (a && b){
      gsap.set(b, { opacity: .16 });
      gsap.timeline({
        scrollTrigger: { trigger: '.gs-shift-title', start: 'top 72%', end: 'top 26%', scrub: .5 }
      })
      .to(a, { opacity: .26, duration: 1 }, 0)
      .to(b, { opacity: 1, y: 0, duration: 1 }, 0);
    }

    /* magnetic pull on the final CTA - pointer devices only */
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      var big = document.querySelector('.gs-cta-xl');
      if (big){
        var qx = gsap.quickTo(big, 'x', { duration: .4, ease: 'power3.out' });
        var qy = gsap.quickTo(big, 'y', { duration: .4, ease: 'power3.out' });
        big.addEventListener('pointermove', function(e){
          var r = big.getBoundingClientRect();
          qx(((e.clientX - r.left) / r.width - .5) * 14);
          qy(((e.clientY - r.top) / r.height - .5) * 10);
        });
        big.addEventListener('pointerleave', function(){ qx(0); qy(0); });
      }
    }
  }
})();
