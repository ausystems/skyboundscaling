/* ==========================================================================
   SKYBOUND SCALING - services.js
   Service hub + service pages. Four jobs:

     1. The page's contained particle formation - one Three.js scene in the
        site's round-dot language (same sprite, palette, cursor tilt, and
        magnetic push as the home/contact scenes). Chosen by the canvas's
        data-scene attribute:
          "map"    - hub: the service system, a hub-and-spoke constellation
          "frame"  - web design: a browser window sketched in dots
          "stack"  - framer: three stacked design layers with a bolt
          "orbit"  - brand identity: a mark with orbiting touchpoints
          "chart"  - seo: bars with a trend line breaking out of the axes
          "target" - google ads: concentric target with an arrow on center
          "venn"   - meta ads: overlapping audiences with a spark
          "bubble" - social: a chat bubble in mid-reply
          "funnel" - funnels: wide top, tight spout, coins out the bottom
        No background particles - the formation is the page's one moment.

     2. Cursor-driven tilt on [data-tilt] panels (proof band, hub cards).
     3. Count-up stats (.svc-count) when the proof band scrolls in.
     4. A soft settle animation when FAQ items open.

   Loads after core.js. Degrades gracefully: no WebGL, no GSAP, or
   prefers-reduced-motion all fall back to a static, readable page.
   ========================================================================== */
(function(){
'use strict';
var SKY = window.SKY || {};
var reduced = SKY.reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGSAP = typeof gsap !== 'undefined';
var hasST = typeof ScrollTrigger !== 'undefined';
var hasTHREE = typeof THREE !== 'undefined';
var pxr = SKY.pxr || function(){
  var dpr = window.devicePixelRatio || 1;
  var w = window.innerWidth;
  var cap = (w < 600) ? 1.5 : (w < 1024) ? 1.75 : 2;
  return Math.min(dpr, cap);
};

/* ---------- Shape sampling helpers ----------
   Every formation is a list of {x,y,c} dots in a roughly [-17,17] x [-13,13]
   plane. Paths are sampled twice with a small offset so outlines read as the
   same hand-stippled double stroke used across the site. */
var PTS = [];
var INK = 0, BLUE = 1, ORANGE = 2;

function dot(x, y){
  var c = INK;
  var r = Math.random();
  if (r > 0.955) c = ORANGE;
  else if (r > 0.80) c = BLUE;
  PTS.push({ x: x + (Math.random() - 0.5) * 0.26,
             y: y + (Math.random() - 0.5) * 0.26,
             c: c });
}
function seg(x1, y1, x2, y2){
  var len = Math.hypot(x2 - x1, y2 - y1);
  var n = Math.max(2, Math.round(len * 5.2));
  for (var pass = 0; pass < 2; pass++){
    var ox = (Math.random() - 0.5) * 0.22, oy = (Math.random() - 0.5) * 0.22;
    for (var i = 0; i <= n; i++){
      var t = i / n;
      dot(x1 + (x2 - x1) * t + ox, y1 + (y2 - y1) * t + oy);
    }
  }
}
function arc(cx, cy, rx, ry, a0, a1, rot){
  rot = rot || 0;
  var len = Math.abs(a1 - a0) * Math.max(rx, ry);
  var n = Math.max(6, Math.round(len * 5.2));
  var cr = Math.cos(rot), sr = Math.sin(rot);
  for (var pass = 0; pass < 2; pass++){
    var ox = (Math.random() - 0.5) * 0.2, oy = (Math.random() - 0.5) * 0.2;
    for (var i = 0; i <= n; i++){
      var a = a0 + (a1 - a0) * (i / n);
      var px = Math.cos(a) * rx, py = Math.sin(a) * ry;
      dot(cx + px * cr - py * sr + ox, cy + px * sr + py * cr + oy);
    }
  }
}
function circle(cx, cy, r){ arc(cx, cy, r, r, 0, Math.PI * 2); }
function rrect(x, y, w, h, r){
  var x2 = x + w, y2 = y + h;
  seg(x + r, y, x2 - r, y);   seg(x + r, y2, x2 - r, y2);
  seg(x, y + r, x, y2 - r);   seg(x2, y + r, x2, y2 - r);
  arc(x + r,  y + r,  r, r, Math.PI, Math.PI * 1.5);
  arc(x2 - r, y + r,  r, r, Math.PI * 1.5, Math.PI * 2);
  arc(x2 - r, y2 - r, r, r, 0, Math.PI * 0.5);
  arc(x + r,  y2 - r, r, r, Math.PI * 0.5, Math.PI);
}
function cluster(cx, cy, r, n){
  for (var i = 0; i < n; i++){
    var a = Math.random() * Math.PI * 2;
    var d = Math.sqrt(Math.random()) * r;
    dot(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
  }
}

/* ---------- The nine formations ---------- */
var SCENES = {
  map: function(){
    cluster(0, 0, 1.7, 150);
    circle(0, 0, 2.9);
    var R = 8.6;
    for (var i = 0; i < 8; i++){
      var a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      var nx = Math.cos(a) * R, ny = Math.sin(a) * R * 0.92;
      cluster(nx, ny, 0.85, 46);
      circle(nx, ny, 1.35);
      seg(Math.cos(a) * 3.1, Math.sin(a) * 3.1 * 0.92, nx - Math.cos(a) * 1.6, ny - Math.sin(a) * 1.6 * 0.92);
    }
    arc(0, 0, 12.6, 11.4, -0.4, 1.15);
    arc(0, 0, 12.6, 11.4, Math.PI - 0.5, Math.PI + 1.05);
  },
  frame: function(){
    rrect(-12.5, -8.5, 25, 17, 1.6);
    seg(-12.5, 5.4, 12.5, 5.4);
    cluster(-10.9, 6.9, 0.28, 10); cluster(-9.7, 6.9, 0.28, 10); cluster(-8.5, 6.9, 0.28, 10);
    seg(-9.9, 2.2, -0.6, 2.2);
    seg(-9.9, 0.2, -3.2, 0.2);
    rrect(-9.9, -4.6, 6.4, 2.5, 1.1);
    rrect(2.2, -5.4, 8.1, 8.6, 0.9);
    seg(2.2, -5.4, 10.3, 3.2);
    seg(2.2, 3.2, 10.3, -5.4);
  },
  stack: function(){
    function plane(cy){
      seg(-9.5, cy, 0, cy + 4.6); seg(0, cy + 4.6, 9.5, cy);
      seg(9.5, cy, 0, cy - 4.6);  seg(0, cy - 4.6, -9.5, cy);
    }
    plane(5.4); plane(0.6); plane(-4.2);
    seg(-9.5, 5.4, -9.5, -4.2); seg(9.5, 5.4, 9.5, -4.2);
    seg(0, 10, 0, -8.8);
    seg(1.4, 3.4, -1.1, 0.3); seg(-1.1, 0.3, 1.1, 0.1); seg(1.1, 0.1, -1.4, -3.1);
    cluster(0, 0.2, 0.5, 26);
  },
  orbit: function(){
    cluster(0, 0, 1.5, 130);
    circle(0, 0, 2.7);
    arc(0, 0, 6.6, 6.6, 0, Math.PI * 2);
    var s1 = [0.65, 2.6, 4.6];
    for (var i = 0; i < 3; i++){
      var a = s1[i];
      cluster(Math.cos(a) * 6.6, Math.sin(a) * 6.6, 0.62, 30);
    }
    arc(0, 0, 11.4, 6.1, 0, Math.PI * 2, 0.35);
    var s2 = [0.2, 1.9, 3.6, 5.2];
    for (var j = 0; j < 4; j++){
      var b = s2[j];
      var px = Math.cos(b) * 11.4, py = Math.sin(b) * 6.1;
      var cr = Math.cos(0.35), sr = Math.sin(0.35);
      cluster(px * cr - py * sr, px * sr + py * cr, 0.5, 22);
    }
  },
  chart: function(){
    seg(-11.5, 8, -11.5, -8); seg(-11.5, -8, 12.5, -8);
    var bx = [-8.6, -4.6, -0.6, 3.4], bh = [2.6, 4.4, 6.4, 8.8];
    for (var i = 0; i < 4; i++){
      rrect(bx[i], -8, 2.4, bh[i], 0.4);
    }
    seg(-7.4, -5.2, -3.4, -3.4); seg(-3.4, -3.4, 0.6, -1.4); seg(0.6, -1.4, 4.6, 1);
    seg(4.6, 1, 11.2, 7.4);
    seg(11.2, 7.4, 8.6, 7.1); seg(11.2, 7.4, 10.6, 4.9);
    cluster(-7.4, -5.2, 0.3, 12); cluster(-3.4, -3.4, 0.3, 12);
    cluster(0.6, -1.4, 0.3, 12); cluster(4.6, 1, 0.3, 12);
  },
  target: function(){
    circle(1.6, -0.6, 3.1); circle(1.6, -0.6, 6.3); circle(1.6, -0.6, 9.5);
    cluster(1.6, -0.6, 1.15, 110);
    seg(1.6, 9.7, 1.6, 11.5); seg(1.6, -10.9, 1.6, -12.7);
    seg(11.9, -0.6, 13.7, -0.6); seg(-8.7, -0.6, -10.5, -0.6);
    seg(-13.5, 10.5, 0.4, 0.4);
    seg(0.4, 0.4, -3, 1.4); seg(0.4, 0.4, -0.7, 3.5);
    seg(-13.5, 10.5, -11.9, 10.9); seg(-13.5, 10.5, -13.1, 8.9);
  },
  venn: function(){
    circle(-3.6, 0, 6.6);
    circle(3.6, 0, 6.6);
    cluster(0, 0, 2.5, 170);
    seg(0, 8.6, 0, 10.6); seg(-0.9, 9.6, 0.9, 9.6);
    cluster(-8.2, 5.8, 0.4, 14); cluster(8.4, -6, 0.4, 14);
  },
  bubble: function(){
    rrect(-9.5, -3.4, 19, 10.4, 3);
    seg(-5.6, -3.4, -7.4, -7.2); seg(-7.4, -7.2, -2.4, -3.4);
    cluster(-4.2, 1.8, 0.62, 34); cluster(0, 1.8, 0.62, 34); cluster(4.2, 1.8, 0.62, 34);
    circle(9.8, 8.2, 2.5);
    cluster(9.8, 8.2, 0.5, 20);
  },
  funnel: function(){
    seg(-10.5, 8.5, 10.5, 8.5);
    seg(-10.5, 8.5, -3, -2.5); seg(10.5, 8.5, 3, -2.5);
    seg(-3, -2.5, -3, -5.5); seg(3, -2.5, 3, -5.5);
    seg(-8.1, 5, 8.1, 5);
    seg(-5.4, 1, 5.4, 1);
    for (var i = 0; i < 26; i++){
      dot((Math.random() - 0.5) * 2.4, -6.2 - Math.random() * 3.4);
    }
    circle(0, -11.3, 2.1);
    cluster(0, -11.3, 1.5, 60);
  },
  wall: function(){
    function mini(cx, cy, hot){
      rrect(cx - 6, cy - 4, 12, 8, 0.9);
      seg(cx - 6, cy + 2.4, cx + 6, cy + 2.4);
      seg(cx - 4.6, cy + 0.6, cx + 1.4, cy + 0.6);
      seg(cx - 4.6, cy - 1, cx - 0.4, cy - 1);
      if (hot){ rrect(cx + 1.2, cy - 2.9, 3.6, 3.1, 0.5); seg(cx + 1.2, cy - 2.9, cx + 4.8, cy + 0.2); }
      else { rrect(cx - 4.6, cy - 3.1, 3.4, 1.6, 0.5); }
    }
    mini(-7.2, 5.2, false); mini(7.2, 5.2, true);
    mini(-7.2, -5.2, true); mini(7.2, -5.2, false);
  },
  plane: function(){
    seg(13, 2, -10, 9); seg(13, 2, -12, -1); seg(13, 2, -6, -8);
    seg(-10, 9, -12, -1); seg(-6, -8, -12, -1);
    seg(13, 2, -8.6, -3.2);
    arc(-13.5, 5.5, 2.6, 2.6, Math.PI * 0.2, Math.PI * 0.9);
    arc(-14.5, 1.5, 1.7, 1.7, Math.PI * 0.1, Math.PI * 0.8);
    cluster(13, 2, 0.4, 16);
  },
  tiers: function(){
    seg(-13, -8, 13, -8);
    rrect(-11.2, -8, 4.4, 4.2, 0.7);
    rrect(-5.2, -8, 4.4, 6.6, 0.7);
    rrect(0.8, -8, 4.4, 9.2, 0.7);
    rrect(6.8, -8, 4.4, 11.8, 0.7);
    circle(9, 6.6, 1.9);
    cluster(9, 6.6, 1.3, 44);
  },
  steps: function(){
    var x = -12, y = -7, w = 5.2, h = 3;
    for (var i = 0; i < 4; i++){
      seg(x, y, x, y + h);
      seg(x, y + h, x + w, y + h);
      x += w; y += h;
    }
    seg(x, y, x, -7); seg(x, -7, -12, -7);
    seg(-11, -4.4, 9.6, 7.6);
    seg(9.6, 7.6, 6.9, 7.2); seg(9.6, 7.6, 8.9, 4.9);
    cluster(-11, -4.4, 0.32, 12);
  },
  summit: function(){
    seg(-14, -8, -3, 8); seg(-3, 8, 2, 0.5);
    seg(2, 0.5, 7.5, 5); seg(7.5, 5, 14, -8);
    seg(-14, -8, 14, -8);
    seg(-5.4, 4.6, -3.9, 6.2); seg(-3.9, 6.2, -2.4, 4.8); seg(-2.4, 4.8, -1.1, 5.6);
    seg(-3, 8, -3, 11.2);
    seg(-3, 11.2, 0.4, 10.1); seg(0.4, 10.1, -3, 9.4);
    for (var i = 0; i < 16; i++){
      var t = i / 15;
      dot(-12 + t * 8.4, -7.4 + t * 13.2 + Math.sin(t * 9) * 0.7);
    }
  },
  house: function(){
    seg(-8, 1, -8, -7); seg(8, 1, 8, -7);
    seg(-10, 1, 0, 9); seg(0, 9, 10, 1);
    seg(-10, 1, 10, 1);
    rrect(-2.2, -7, 4.4, 5.6, 0.6);
    rrect(3, -4, 3.8, 3.8, 0.4);
    seg(4.9, -4, 4.9, -0.2); seg(3, -2.1, 6.8, -2.1);
    seg(4.6, 5.3, 4.6, 9.6); seg(6.6, 3.7, 6.6, 9.6); seg(4.6, 9.6, 6.6, 9.6);
    seg(-12.5, -7, 12.5, -7);
    arc(10.6, -6.2, 1.6, 1.6, 0, Math.PI);
    cluster(10.6, -6.4, 0.9, 22);
  },
  cross: function(){
    rrect(-7, -5.6, 14, 14, 2.6);
    rrect(-1.9, -1.5, 3.8, 9.4, 0.6);
    rrect(-4.7, 1.3, 9.4, 3.8, 0.6);
    seg(-13, -9.8, -8.4, -9.8); seg(-8.4, -9.8, -7, -7.2);
    seg(-7, -7.2, -5, -12.2); seg(-5, -12.2, -3.4, -9.8);
    seg(-3.4, -9.8, 13, -9.8);
    cluster(-5, -12.2, 0.3, 10);
  },
  cart: function(){
    seg(-9, 3.5, 9.4, 3.5); seg(9.4, 3.5, 7.2, -3.5); seg(7.2, -3.5, -7, -3.5); seg(-7, -3.5, -9, 3.5);
    seg(-9, 3.5, -11.2, 7); seg(-11.2, 7, -13.6, 7);
    circle(-4.4, -6, 1.5); circle(4.4, -6, 1.5);
    cluster(-4.4, -6, 0.5, 12); cluster(4.4, -6, 0.5, 12);
    seg(-3.2, 3.5, -2.4, -3.5); seg(2.6, 3.5, 2, -3.5);
    seg(1.8, 9.2, -0.6, 6.6); seg(-0.6, 6.6, 1.2, 6.4); seg(1.2, 6.4, -1.2, 4.2);
  },
  brief: function(){
    rrect(-9.5, -6.5, 19, 11, 1.6);
    rrect(-2.7, 4.5, 5.4, 2.8, 1.1);
    seg(-9.5, -0.6, -1.6, -0.6); seg(1.6, -0.6, 9.5, -0.6);
    rrect(-1.6, -1.8, 3.2, 2.4, 0.5);
    cluster(0, -0.6, 0.5, 14);
    cluster(-8.2, -5.2, 0.22, 6); cluster(8.2, -5.2, 0.22, 6);
    cluster(-8.2, 3.2, 0.22, 6); cluster(8.2, 3.2, 0.22, 6);
  },
  rocket: function(){
    arc(0, 6.5, 2.9, 4.4, 0, Math.PI);
    seg(-2.9, 6.5, -2.9, -4); seg(2.9, 6.5, 2.9, -4);
    seg(-2.9, -4, -6, -8.2); seg(-6, -8.2, -2.9, -6.4);
    seg(2.9, -4, 6, -8.2); seg(6, -8.2, 2.9, -6.4);
    seg(-2.9, -6.4, 2.9, -6.4);
    circle(0, 3.2, 1.7);
    cluster(0, 3.2, 1.1, 30);
    for (var i = 0; i < 34; i++){
      var t = Math.random();
      dot((Math.random() - 0.5) * (2.4 - t * 1.8), -7.4 - t * 4.6);
    }
    arc(-8.5, 2, 2.2, 2.2, Math.PI * 1.1, Math.PI * 1.8);
    arc(8.5, 5, 1.8, 1.8, Math.PI * 1.2, Math.PI * 1.9);
  },
  pin: function(){
    arc(0, 2.8, 6.2, 6.2, -0.42, Math.PI + 0.42);
    seg(-5.6, 0.2, 0, -8.6); seg(5.6, 0.2, 0, -8.6);
    circle(0, 3, 2.4);
    cluster(0, 3, 1.6, 60);
    arc(0, -9.6, 9.5, 2.6, Math.PI * 0.15, Math.PI * 0.85);
    arc(0, -9.6, 13.5, 3.6, Math.PI * 0.2, Math.PI * 0.8);
  },
  routes: function(){
    rrect(-11, -2.5, 9, 6, 0.8);
    rrect(-2, -2.5, 4.6, 4.2, 0.6);
    seg(-2, -0.6, 2.6, -0.6);
    circle(-8, -4.4, 1.4); circle(-4.6, -4.4, 1.4); circle(0.6, -4.4, 1.4);
    cluster(-8, -4.4, 0.4, 10); cluster(-4.6, -4.4, 0.4, 10); cluster(0.6, -4.4, 0.4, 10);
    seg(-13.5, -6.4, 13.5, -6.4);
    circle(9.5, 6.5, 1.1); circle(13, 1.5, 1.1); circle(7.5, 10.8, 1.1);
    seg(3, 3.5, 8.6, 6); seg(9.5, 6.5, 12.2, 2.3); seg(9.8, 7.5, 8, 9.9);
    cluster(9.5, 6.5, 0.35, 8); cluster(13, 1.5, 0.35, 8); cluster(7.5, 10.8, 0.35, 8);
  },
  crane: function(){
    seg(-6, -8, -6, 9); seg(-4.6, -8, -4.6, 9);
    seg(-6, -8, -4.6, -6.4); seg(-4.6, -8, -6, -6.4);
    seg(-6, -4.8, -4.6, -3.2); seg(-4.6, -4.8, -6, -3.2);
    seg(-6, -1.6, -4.6, 0); seg(-4.6, -1.6, -6, 0);
    seg(-6, 1.6, -4.6, 3.2); seg(-4.6, 1.6, -6, 3.2);
    seg(-6, 4.8, -4.6, 6.4); seg(-4.6, 4.8, -6, 6.4);
    seg(-9.5, 9, 13, 9);
    seg(-5.3, 11.4, -9.5, 9); seg(-5.3, 11.4, 4, 9); seg(-5.3, 11.4, -5.3, 9);
    seg(9.8, 9, 9.8, 3.2);
    rrect(8.9, 1.4, 1.8, 1.8, 0.3);
    seg(-13, -8, 13.5, -8);
    rrect(3, -8, 6.5, 4.2, 0.4);
    seg(3, -5.9, 9.5, -5.9);
  },
  chip: function(){
    rrect(-6.5, -6.5, 13, 13, 1.4);
    rrect(-3.2, -3.2, 6.4, 6.4, 0.8);
    cluster(0, 0, 1.9, 60);
    for (var i = 0; i < 4; i++){
      var o = -4.9 + i * 3.2;
      seg(o, 6.5, o, 9.8); seg(o, -6.5, o, -9.8);
      seg(6.5, o, 9.8, o); seg(-6.5, o, -9.8, o);
    }
    seg(-6.5, 6.5, -3.2, 3.2); seg(6.5, -6.5, 3.2, -3.2);
  },
  shield: function(){
    seg(-8, 8, 8, 8);
    seg(-8, 8, -8, -1); seg(8, 8, 8, -1);
    arc(0, -1, 8, 8.6, Math.PI, Math.PI * 2);
    seg(-4.6, 0.4, -1.4, -3); seg(-1.4, -3, 5, 4.2);
    circle(0, 0.6, 5.2);
    cluster(-11.8, 10.6, 0.32, 9); cluster(11.8, 10.6, 0.32, 9);
  },
  signal: function(){
    seg(-3.2, -9, 0, 3.5); seg(3.2, -9, 0, 3.5);
    seg(-2.1, -5.2, 2.1, -5.2); seg(-1.2, -1.2, 1.2, -1.2);
    seg(-3.2, -9, 3.2, -9);
    cluster(0, 4.4, 0.55, 26);
    arc(0, 4.4, 3.4, 3.4, Math.PI * 0.22, Math.PI * 0.78);
    arc(0, 4.4, 6.2, 6.2, Math.PI * 0.26, Math.PI * 0.74);
    arc(0, 4.4, 9, 9, Math.PI * 0.3, Math.PI * 0.7);
    arc(0, 4.4, 3.4, 3.4, Math.PI * 1.22, Math.PI * 1.78);
    arc(0, 4.4, 6.2, 6.2, Math.PI * 1.26, Math.PI * 1.74);
    cluster(-9.8, -1.4, 0.34, 10); cluster(10.2, 1.8, 0.34, 10);
  }
};

/* ---------- Scene build ---------- */
function buildScene(){
  var canvas = document.getElementById('svc-canvas');
  if (!canvas || !hasTHREE) return;
  var wrap = canvas.parentElement;
  var key = canvas.getAttribute('data-scene');
  if (!SCENES[key]) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch(e){ wrap.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(pxr());

  // Identical soft round sprite to every other particle scene on the site
  var sprite = (function(){
    var size = 128, c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(0.85, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    return t;
  })();

  PTS = [];
  SCENES[key]();

  var N = PTS.length;
  var base = new Float32Array(N * 3);
  var pos = new Float32Array(N * 3);
  var col = new Float32Array(N * 3);
  var phase = new Float32Array(N);
  var speed = new Float32Array(N);
  var PALETTE = [
    [0.075, 0.075, 0.1],                       // ink
    [0.133, 0.188, 0.996],                     // blue #2230FE
    [1.0, 0.302, 0.0]                          // orange #FF4D00
  ];
  for (var i = 0; i < N; i++){
    base[i*3]   = PTS[i].x;
    base[i*3+1] = PTS[i].y;
    base[i*3+2] = (Math.random() - 0.5) * 0.9;
    var p = PALETTE[PTS[i].c];
    col[i*3] = p[0]; col[i*3+1] = p[1]; col[i*3+2] = p[2];
    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 0.5 + Math.random() * 0.9;
  }
  pos.set(base);

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var mat = new THREE.PointsMaterial({
    size: 0.34, map: sprite, vertexColors: true,
    transparent: true, alphaTest: 0.05, depthWrite: false,
    sizeAttenuation: true
  });
  var points = new THREE.Points(geo, mat);
  var group = new THREE.Group();
  group.add(points);

  var scene = new THREE.Scene();
  scene.add(group);
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  camera.position.z = 46;

  function size(){
    var w = wrap.clientWidth || 2, h = wrap.clientHeight || 2;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size);

  /* Cursor: gentle tilt + magnetic push, same feel as the other scenes */
  var trx = 0, try_ = 0, mx = 1e4, my = 1e4;
  var fine = window.matchMedia('(pointer:fine)').matches;
  if (fine && !reduced){
    wrap.addEventListener('pointermove', function(e){
      var r = wrap.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      try_ = nx * 0.22; trx = ny * -0.16;
      var half = 14.5;
      mx = nx * 2 * half;
      my = -ny * 2 * half * (r.height / r.width);
    });
    wrap.addEventListener('pointerleave', function(){
      trx = 0; try_ = 0; mx = 1e4; my = 1e4;
    });
  }

  var running = false, raf = null, t0 = performance.now();
  function tick(now){
    raf = null;
    var t = (now - t0) / 1000;
    group.rotation.x += (trx - group.rotation.x) * 0.06;
    group.rotation.y += (try_ - group.rotation.y) * 0.06;
    var R = 3.6, R2 = R * R;
    for (var i = 0; i < N; i++){
      var bx = base[i*3], by = base[i*3+1];
      var wx = bx + Math.sin(t * speed[i] + phase[i]) * 0.12;
      var wy = by + Math.cos(t * speed[i] * 0.9 + phase[i]) * 0.12;
      var dx = wx - mx, dy = wy - my;
      var d2 = dx * dx + dy * dy;
      if (d2 < R2){
        var d = Math.sqrt(d2) || 0.001;
        var f = (1 - d / R) * 1.9;
        wx += (dx / d) * f;
        wy += (dy / d) * f;
      }
      pos[i*3]   += (wx - pos[i*3]) * 0.14;
      pos[i*3+1] += (wy - pos[i*3+1]) * 0.14;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(tick);
  }

  if (reduced){
    renderer.render(scene, camera);
    return;
  }
  /* Only animate while the formation is on screen - no offscreen work */
  var io = new IntersectionObserver(function(entries){
    var vis = entries[0].isIntersecting;
    if (vis && !running){ running = true; raf = requestAnimationFrame(tick); }
    else if (!vis && running){ running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0.05 });
  io.observe(wrap);
}
buildScene();

/* ---------- [data-tilt] panels: cursor-driven tilt + lift ---------- */
(function(){
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
  Array.prototype.slice.call(document.querySelectorAll('[data-tilt]')).forEach(function(panel){
    var raf = null;
    var rx = 0, ry = 0, lift = 0, scale = 1;
    var trx = 0, try_ = 0, tlift = 0, tscale = 1;
    function loop(){
      rx += (trx - rx) * 0.12;
      ry += (try_ - ry) * 0.12;
      lift += (tlift - lift) * 0.12;
      scale += (tscale - scale) * 0.12;
      panel.style.transform =
        'perspective(1300px) rotateX(' + ry.toFixed(2) + 'deg) rotateY(' + rx.toFixed(2) + 'deg)' +
        ' translateY(' + lift.toFixed(1) + 'px) scale(' + scale.toFixed(4) + ')';
      if (Math.abs(trx - rx) > 0.01 || Math.abs(try_ - ry) > 0.01 ||
          Math.abs(tlift - lift) > 0.05 || Math.abs(tscale - scale) > 0.0005){
        raf = requestAnimationFrame(loop);
      } else { raf = null; }
    }
    function kick(){ if (!raf) raf = requestAnimationFrame(loop); }
    panel.addEventListener('pointerenter', function(){ tlift = -5; tscale = 1.006; kick(); });
    panel.addEventListener('pointermove', function(e){
      var r = panel.getBoundingClientRect();
      trx = ((e.clientX - r.left) / r.width - 0.5) * 5;
      try_ = (0.5 - (e.clientY - r.top) / r.height) * 4;
      kick();
    });
    panel.addEventListener('pointerleave', function(){
      trx = 0; try_ = 0; tlift = 0; tscale = 1; kick();
    });
  });
})();

/* ---------- Count-up stats ---------- */
(function(){
  var els = Array.prototype.slice.call(document.querySelectorAll('.svc-count'));
  if (!els.length) return;
  function finish(el){
    el.textContent = el.getAttribute('data-count');
  }
  if (reduced || !hasGSAP || !hasST){ els.forEach(finish); return; }
  els.forEach(function(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: function(){ el.textContent = obj.v.toFixed(dec); },
      onComplete: function(){ finish(el); }
    });
  });
})();

/* ---------- Article reading progress ---------- */
(function(){
  var bar = document.querySelector('.post-progress span');
  var body = document.querySelector('.post-body');
  if (!bar || !body || reduced) return;
  if (hasGSAP && hasST){
    gsap.to(bar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: body, start: 'top 80%', end: 'bottom 60%', scrub: 0.4 }
    });
  }
})();

/* ---------- FAQ: soft settle on open ---------- */
(function(){
  if (!hasGSAP || reduced) return;
  Array.prototype.slice.call(document.querySelectorAll('details.svc-faq')).forEach(function(d){
    d.addEventListener('toggle', function(){
      if (!d.open) return;
      var a = d.querySelector('.svc-faq-a');
      if (a) gsap.fromTo(a, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
    });
  });
})();
})();
