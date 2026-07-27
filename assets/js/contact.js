/* ==========================================================================
   SKYBOUND SCALING - contact.js
   The contact page experience:
     1. The particle beacon - the brand orb (lat/lon sphere + tilted orbital
        rings) rendered as a contained visual in the left rail. Same round-dot
        sprite, palette, and cursor-magnetic deformation as the home scenes.
        No background particles - the beacon is the page's one particle moment.
     2. The brief form - inline validation, a honeypot, an endpoint-or-mailto
        submit flow, and a cinematic success state.

   Loads after core.js. Degrades gracefully without WebGL, GSAP, or motion.
   ========================================================================== */
(function(){
'use strict';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = typeof gsap !== 'undefined';
var hasTHREE = typeof THREE !== 'undefined';
var pxr = (window.SKY && window.SKY.pxr) || function(){
  var dpr = window.devicePixelRatio || 1;
  var w = window.innerWidth;
  var cap = (w < 600) ? 1.5 : (w < 1024) ? 1.75 : 2;
  return Math.min(dpr, cap);
};

/* ---------- The particle beacon ---------- */
function buildBeacon(){
  if (!hasTHREE) return;
  var canvas = document.getElementById('beacon-canvas');
  if (!canvas) return;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e){ return; }
  renderer.setPixelRatio(pxr());

  // Identical soft round sprite to every other particle scene on the site
  var circleTexture = (function(){
    var size = 128;
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    var grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grd.addColorStop(0,    'rgba(255,255,255,1)');
    grd.addColorStop(0.5,  'rgba(255,255,255,1)');
    grd.addColorStop(0.85, 'rgba(255,255,255,0.55)');
    grd.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
    ctx.fill();
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  })();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.z = 8.4;   // auto-framed in place() so nothing clips

  var ink = new THREE.Color(0x0A0A0C);
  var blue = new THREE.Color(0x2230FE);
  var orange = new THREE.Color(0xFF4D00);

  var baseArr = [], colorsArr = [];
  function push(x, y, z, c){ baseArr.push(x, y, z); colorsArr.push(c.r, c.g, c.b); }

  // SPHERE - the brand globe, same distribution as the hero orb
  var dens = (window.innerWidth < 700) ? 0.7 : 1;
  var R = 1.32;
  var lats = Math.round(30 * dens), lons = Math.round(56 * dens);
  for (var i = 0; i <= lats; i++){
    var phi = (i / lats) * Math.PI;
    var sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
    for (var j = 0; j < lons; j++){
      var theta = (j / lons) * Math.PI * 2;
      var rand = Math.random();
      var c = rand < 0.045 ? orange : (rand < 0.16 ? blue : ink);
      push(R * sinPhi * Math.cos(theta), R * cosPhi, R * sinPhi * Math.sin(theta), c);
    }
  }
  // TWO ORBITAL RINGS - the beacon reads as a signal, not just a planet
  function ring(rad, tilt, nn){
    var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    for (var k = 0; k < nn; k++){
      var a = (k / nn) * Math.PI * 2;
      var jit = (Math.random() - 0.5) * 0.05;
      var x = Math.cos(a) * (rad + jit);
      var y = jit * 0.5;
      var z = Math.sin(a) * (rad + jit);
      var ty = y * cosT - z * sinT;
      var tz = y * sinT + z * cosT;
      var rd = Math.random();
      var cr = rd < 0.22 ? blue : (rd < 0.28 ? orange : ink);
      push(x, ty, tz, cr);
    }
  }
  ring(R * 1.55, 0.34, Math.round(900 * dens));
  ring(R * 1.86, -0.72, Math.round(520 * dens));

  var N = baseArr.length / 3;
  var basePositions = new Float32Array(baseArr);
  var positions = new Float32Array(baseArr);
  var displacements = new Float32Array(baseArr.length);

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colorsArr, 3));
  var mat = new THREE.PointsMaterial({
    size: 0.072,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.94,
    map: circleTexture,
    alphaTest: 0.05,
    depthWrite: false
  });
  var points = new THREE.Points(geo, mat);
  var group = new THREE.Group();
  group.add(points);
  group.rotation.x = 0.16;
  group.rotation.z = 0.10;
  scene.add(group);

  /* intro reveal - driven per-frame so it never conflicts with resize logic */
  var intro = { v: (reduced || !hasGSAP) ? 1 : 0.0001 };
  if (!reduced && hasGSAP){
    gsap.to(intro, { v: 1, duration: 1.7, ease: 'expo.out', delay: 0.45 });
  }

  // Cursor: gentle tilt + the same magnetic push as the manifesto helix
  var cursorActive = false;
  var cursorScreen = new THREE.Vector2(-1000, -1000);
  var cursorLocal = new THREE.Vector3(100, 100, 100);
  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var tmpVec = new THREE.Vector3();
  var tiltX = 0, tiltY = 0, curTX = 0, curTY = 0;

  if (!reduced){
    canvas.addEventListener('pointermove', function(e){
      var rect = canvas.getBoundingClientRect();
      cursorScreen.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      cursorScreen.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      cursorActive = true;
      tiltX = cursorScreen.x * 0.55;
      tiltY = -cursorScreen.y * 0.3;
    }, { passive: true });
    canvas.addEventListener('pointerleave', function(){
      cursorActive = false;
      tiltX = 0; tiltY = 0;
    });
  }

  function updateCursorLocal(){
    if (!cursorActive){
      cursorLocal.set(100, 100, 100);
      return;
    }
    raycaster.setFromCamera(cursorScreen, camera);
    if (raycaster.ray.intersectPlane(plane, tmpVec)){
      cursorLocal.copy(tmpVec);
      group.worldToLocal(cursorLocal);
    }
  }

  // Half-extent the camera must frame: the widest orbital ring (R*1.86 ≈ 2.46)
  // plus headroom for the intro breathing (×1.012) and the cursor magnetic push
  // (hoverStrength ≈ 0.26 outward), so the rings are never clipped at any edge -
  // at rest or during an active hover - on any aspect ratio. Kept tight so the
  // globe fills the box (~0.84 of frame at rest) while a pessimistic full-outward
  // push scan across every particle still stays inside the frustum (≤0.96 NDC).
  var FIT_HALF = R * 1.86 + 0.55;
  function place(){
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    var aspect = w / h;
    camera.aspect = aspect;
    var tan = Math.tan(camera.fov * Math.PI / 180 / 2);
    var dV = FIT_HALF / tan;                 // distance so it fits vertically
    var dH = FIT_HALF / (tan * aspect);      // distance so it fits horizontally
    camera.position.z = Math.max(dV, dH);    // whichever needs more room wins
    camera.updateProjectionMatrix();
  }
  place();
  window.addEventListener('resize', place);

  // Render only while the beacon is on screen
  var isVisible = true;
  if ('IntersectionObserver' in window){
    isVisible = false;
    new IntersectionObserver(function(entries){
      isVisible = entries[0].isIntersecting;
    }, { rootMargin: '120px' }).observe(canvas);
  }

  var spin = reduced ? 0 : 0.0032;
  var time = 0;
  var hoverRadius = 1.05;
  var hoverRadiusSq = hoverRadius * hoverRadius;
  // gentle push so the globe can be framed tightly (big) yet never clip on hover
  var hoverStrength = 0.26;

  function tick(){
    requestAnimationFrame(tick);
    if (!isVisible) return;
    time += 0.016;

    points.rotation.y += spin;
    curTX += (tiltX - curTX) * 0.05;
    curTY += (tiltY - curTY) * 0.05;
    group.rotation.y = curTX;
    group.rotation.x = 0.16 + curTY;
    group.position.y = Math.sin(time * 0.5) * 0.05;

    var breath = 1 + Math.sin(time * 0.4) * 0.012;
    group.scale.setScalar(breath * intro.v);
    mat.opacity = 0.94 * Math.min(1, intro.v);

    group.updateMatrixWorld(true);
    updateCursorLocal();
    var cx = cursorLocal.x, cy = cursorLocal.y, cz = cursorLocal.z;
    var posArr = geo.attributes.position.array;

    for (var pi = 0; pi < N; pi++){
      var i3 = pi * 3;
      var bx = basePositions[i3];
      var by = basePositions[i3 + 1];
      var bz = basePositions[i3 + 2];

      var dx = bx - cx, dy = by - cy, dz = bz - cz;
      var distSq = dx*dx + dy*dy + dz*dz;

      var tDx = 0, tDy = 0, tDz = 0;
      if (cursorActive && distSq < hoverRadiusSq && distSq > 0.0001){
        var dist = Math.sqrt(distSq);
        var f = 1 - dist / hoverRadius;
        f = f * f;
        var k = f * hoverStrength / dist;
        tDx = dx * k; tDy = dy * k; tDz = dz * k;
      }
      var lf = (tDx === 0 && tDy === 0 && tDz === 0) ? 0.065 : 0.1;
      displacements[i3]     += (tDx - displacements[i3])     * lf;
      displacements[i3 + 1] += (tDy - displacements[i3 + 1]) * lf;
      displacements[i3 + 2] += (tDz - displacements[i3 + 2]) * lf;

      posArr[i3]     = bx + displacements[i3];
      posArr[i3 + 1] = by + displacements[i3 + 1];
      posArr[i3 + 2] = bz + displacements[i3 + 2];
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  if (reduced){ renderer.render(scene, camera); }
  else { tick(); }
}
buildBeacon();

/* ---------- The brief form ---------- */
(function(){
  var form = document.getElementById('brief');
  var success = document.getElementById('form-success');
  if (!form || !success) return;

  var fields = {
    name: document.getElementById('f-name'),
    email: document.getElementById('f-email'),
    message: document.getElementById('f-message')
  };
  var errs = {
    name: document.getElementById('err-name'),
    email: document.getElementById('err-email'),
    message: document.getElementById('err-message')
  };
  var submitBtn = form.querySelector('.form-submit');
  var submitLabel = submitBtn ? submitBtn.querySelector('.cta-label') : null;
  var successCopy = document.getElementById('success-copy');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(key, msg){
    var input = fields[key], err = errs[key];
    if (!input) return;
    input.classList.toggle('is-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
  }

  function validate(){
    var firstBad = null;
    var checks = [
      ['name',    function(v){ return v.trim().length >= 2; },  'Please add your name'],
      ['email',   function(v){ return EMAIL_RE.test(v.trim()); }, 'Enter a valid work email'],
      ['message', function(v){ return v.trim().length >= 10; }, 'Tell us a little more, one sentence is plenty']
    ];
    for (var i = 0; i < checks.length; i++){
      var key = checks[i][0], ok = checks[i][1](fields[key].value), msg = checks[i][2];
      setError(key, ok ? '' : msg);
      if (!ok && !firstBad) firstBad = fields[key];
    }
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  // Clear an error the moment the field is corrected
  Object.keys(fields).forEach(function(key){
    fields[key].addEventListener('input', function(){
      if (fields[key].classList.contains('is-error')) setError(key, '');
    });
  });

  function collect(){
    var services = Array.prototype.slice
      .call(form.querySelectorAll('input[name="services"]:checked'))
      .map(function(el){ return el.value; });
    var budget = form.querySelector('input[name="budget"]:checked');
    return {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      company: (document.getElementById('f-company') || { value: '' }).value.trim(),
      budget: budget ? budget.value : '',
      services: services.join(', '),
      message: fields.message.value.trim(),
      page: location.href
    };
  }

  function setBusy(v){
    if (!submitBtn) return;
    submitBtn.classList.toggle('is-busy', v);
    if (submitLabel) submitLabel.textContent = v ? 'Sending…' : 'Send the brief';
  }

  function showSuccess(viaMailto, data){
    if (successCopy){
      successCopy.textContent = viaMailto
        ? 'Your email app has a draft ready. Send it and a senior strategist will reply within one business day.'
        : 'A senior strategist will reply to ' + data.email + ' within one business day.';
    }
    function centerSuccess(){
      var r = success.getBoundingClientRect();
      var target = window.scrollY + r.top - Math.max(0, (window.innerHeight - r.height) / 2);
      var lenis = window.__lenis;
      if (lenis && lenis.scrollTo){ lenis.scrollTo(Math.max(0, target), { duration: 0.9 }); }
      else { try { window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' }); } catch(_){ window.scrollTo(0, Math.max(0, target)); } }
    }
    var reducedNow = reduced || !hasGSAP;
    if (reducedNow){
      form.hidden = true;
      success.hidden = false;
    } else {
      gsap.timeline()
        .to(form, { autoAlpha: 0, y: -16, duration: 0.4, ease: 'power2.in' })
        .add(function(){
          form.hidden = true;
          success.hidden = false;
          centerSuccess();
        })
        .fromTo(success, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        .fromTo('.success-ring', { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.45')
        .fromTo('.success-ring svg path', { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25')
        .fromTo(['.success-eyebrow', '.success-title', '.success-copy', '.success-home'],
          { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, '-=0.4');
    }
    success.setAttribute('tabindex', '-1');
    try { success.focus({ preventScroll: true }); } catch(_){}
  }

  function mailtoFallback(data){
    var subject = 'Project brief from ' + data.name + (data.company ? ' (' + data.company + ')' : '');
    var body = [
      'Name: ' + data.name,
      'Email: ' + data.email,
      data.company ? 'Company: ' + data.company : null,
      data.budget ? 'Budget: ' + data.budget : null,
      data.services ? 'Services: ' + data.services : null,
      '',
      data.message
    ].filter(Boolean).join('\n');
    location.href = 'mailto:hello@skyboundscaling.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();

    // Honeypot: bots fill it, humans can't see it. Pretend-success, send nothing.
    var hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value){ showSuccess(false, collect()); return; }

    if (!validate()) return;
    var data = collect();

    /* Production hook: set data-endpoint on the <form> to your handler
       (Formspree, Basin, a serverless function, …) and the brief is POSTed
       there as JSON. With no endpoint configured we fall back to a prefilled
       mailto: draft, so the form is never a dead end. */
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();

    if (endpoint){
      setBusy(true);
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function(res){
        setBusy(false);
        if (res.ok){ showSuccess(false, data); }
        else { mailtoFallback(data); showSuccess(true, data); }
      }).catch(function(){
        setBusy(false);
        mailtoFallback(data);
        showSuccess(true, data);
      });
    } else {
      mailtoFallback(data);
      showSuccess(true, data);
    }
  });
})();
})();
