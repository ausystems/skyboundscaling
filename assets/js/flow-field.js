/* ==========================================================================
   SKYBOUND SCALING - flow-field.js
   The stripe-flow background: a Stripe-style flowing mesh gradient in black
   and blues, drawn on a single fullscreen triangle by one small fragment
   shader. Raw WebGL, no dependencies.

   Lifted verbatim out of home.js so the home page manifesto and the Get
   Started close share ONE implementation rather than two copies that drift.
   Both call it with their own canvas id; the shader, the palette, and the
   performance gates are identical by construction.

   It runs only while its canvas is on screen (IntersectionObserver plus a
   visibility gate), caps pixel ratio per device, renders a single static
   frame under reduced motion, and returns silently if WebGL is unavailable
   so the section's CSS gradient shows through untouched.

   Usage:  SkyboundFlow('man-flow')
   ========================================================================== */
(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.SkyboundFlow = function(canvasId){
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }) ||
             canvas.getContext('experimental-webgl');
    if (!gl) return;

    var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FRAG = [
      'precision highp float;',
      'uniform vec2 r;uniform float t;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
      '  return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}',
      'void main(){',
      '  vec2 uv=gl_FragCoord.xy/r.xy;',
      '  vec2 p=uv;p.x*=r.x/r.y;',
      '  float w1=fbm(p*1.35+vec2(t*.045,-t*.03));',
      '  float w2=fbm(p*2.1-vec2(t*.025,t*.04)+w1);',
      '  float band=sin((uv.x*1.6-uv.y*1.15)*3.14159+t*.11+w1*2.6)*.5+.5;',
      '  float m1=smoothstep(.15,.85,band*.62+w2*.55);',
      '  float m2=smoothstep(.25,.95,fbm(p*1.05+vec2(-t*.035,t*.02))*1.18);',
      '  vec3 black=vec3(.012,.02,.045);',      /* #030512 deep space */
      '  vec3 navy=vec3(.035,.075,.21);',       /* #091335 midnight navy */
      '  vec3 ultr=vec3(.10,.17,.80);',         /* #1A2BCC ultramarine */
      '  vec3 sky=vec3(.33,.62,.90);',          /* #54A0E6 sky crest */
      '  vec3 col=mix(black,navy,m2);',
      '  col=mix(col,ultr,m1*m2*.8);',
      '  col+=sky*pow(max(w2*band-.44,0.)*1.65,2.2)*.5;',
      '  float vig=smoothstep(1.28,.32,distance(uv,vec2(.5,.44)));',
      '  col*=mix(.5,1.,vig);',
      '  col+=(h(gl_FragCoord.xy+fract(t))-.5)*.045;',
      '  gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');

    function compile(type, src){
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'r');
    var uT = gl.getUniformLocation(prog, 't');

    function size(){
      var dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 600 ? 1.25 : 1.75);
      var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var hh = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== hh){
        canvas.width = w; canvas.height = hh;
        gl.viewport(0, 0, w, hh);
      }
    }

    var t0 = performance.now();
    function frame(){
      size();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, (performance.now() - t0) / 1000 * 3.2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add('is-live');
    }

    if (reduced){ requestAnimationFrame(frame); return; }   /* one still frame */

    var raf = 0, inView = false;
    function loop(){
      frame();
      raf = requestAnimationFrame(loop);
    }
    function setRunning(on){
      if (on && !raf && !document.hidden){ raf = requestAnimationFrame(loop); }
      else if (!on && raf){ cancelAnimationFrame(raf); raf = 0; }
    }
    var io = new IntersectionObserver(function(entries){
      inView = entries[0].isIntersecting;
      setRunning(inView);
    }, { rootMargin: '120px 0px' });
    io.observe(canvas);
    document.addEventListener('visibilitychange', function(){ setRunning(inView && !document.hidden); });
    window.addEventListener('resize', size, { passive: true });
  };
})();
