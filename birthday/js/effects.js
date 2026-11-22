/* 视觉特效:星空背景 + 流星 + 烟花(纯 Canvas,无依赖) */
(function () {
  "use strict";
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var W = innerWidth, H = innerHeight;

  /* ---------- 背景星空 ---------- */
  var bg = document.getElementById("bg");
  var bctx = bg.getContext("2d");
  var stars = [], shooters = [], nextShoot = 2500;

  function fit(c) {
    c.width = Math.round(W * DPR);
    c.height = Math.round(H * DPR);
  }
  function initStars() {
    var n = reduce ? 70 : Math.min(230, Math.round((W * H) / 6500));
    stars = [];
    for (var i = 0; i < n; i++) {
      var z = Math.random();
      stars.push({
        x: Math.random(), y: Math.random(), z: z,
        r: 0.4 + z * 1.3,
        tw: Math.random() * 6.28, sp: rand(0.6, 2.2),
        warm: Math.random() < 0.22
      });
    }
  }
  function resize() {
    W = innerWidth; H = innerHeight;
    fit(bg); fit(fx);
    bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!stars.length || Math.abs(stars.length - Math.round((W * H) / 6500)) > 40) initStars();
  }

  var last = performance.now();
  function drawBg(now) {
    var dt = Math.min(now - last, 60); last = now;
    var t = now / 1000, sy = window.scrollY || 0;
    bctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var y = (s.y * H - sy * s.z * 0.12) % H; if (y < 0) y += H;
      var a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.sp + s.tw));
      bctx.globalAlpha = reduce ? 0.7 : a;
      bctx.fillStyle = s.warm ? "#ffe9b8" : "#e4e8ff";
      bctx.beginPath(); bctx.arc(s.x * W, y, s.r, 0, 6.2832); bctx.fill();
    }
    bctx.globalAlpha = 1;

    if (!reduce) {
      nextShoot -= dt;
      if (nextShoot <= 0) {
        nextShoot = rand(4500, 9000);
        var ang = rand(0.45, 0.7);
        shooters.push({ x: rand(W * 0.2, W * 1.0), y: rand(0, H * 0.35), vx: -Math.cos(ang) * 11, vy: Math.sin(ang) * 11, life: 1 });
      }
      for (var k = shooters.length - 1; k >= 0; k--) {
        var m = shooters[k];
        m.x += m.vx * dt / 16; m.y += m.vy * dt / 16; m.life -= dt / 900;
        if (m.life <= 0) { shooters.splice(k, 1); continue; }
        var g = bctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        g.addColorStop(0, "rgba(255,255,255," + m.life + ")");
        g.addColorStop(1, "rgba(255,255,255,0)");
        bctx.strokeStyle = g; bctx.lineWidth = 1.6; bctx.lineCap = "round";
        bctx.beginPath(); bctx.moveTo(m.x, m.y); bctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9); bctx.stroke();
      }
    }
    requestAnimationFrame(drawBg);
  }

  /* ---------- 烟花 ---------- */
  var fx = document.getElementById("fx");
  var fctx = fx.getContext("2d");
  var parts = [], rockets = [], running = false;
  var COLORS = [[247, 220, 149], [255, 159, 194], [183, 167, 255], [150, 220, 255], [255, 255, 255], [255, 190, 120]];
  var pick = function () { return COLORS[(Math.random() * COLORS.length) | 0]; };

  function burst(x, y, opt) {
    opt = opt || {};
    var n = opt.n || (reduce ? 22 : 70);
    var col = opt.color || pick();
    var speed = opt.speed || rand(2.6, 5.2);
    for (var i = 0; i < n; i++) {
      var vx, vy;
      if (opt.shape === "heart") {
        var t = (i / n) * 6.2832;
        vx = 16 * Math.pow(Math.sin(t), 3) / 16 * speed;
        vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 * speed;
      } else {
        var a = (i / n) * 6.2832 + rand(-0.08, 0.08);
        var s = speed * rand(0.35, 1);
        vx = Math.cos(a) * s; vy = Math.sin(a) * s;
      }
      parts.push({
        x: x, y: y, vx: vx, vy: vy, life: 1,
        decay: rand(0.010, 0.022), size: rand(1.2, 2.4),
        col: Math.random() < 0.15 ? [255, 255, 255] : col
      });
    }
    start();
  }
  function launch(tx, ty) {
    rockets.push({ x: tx + rand(-30, 30), y: H + 10, ty: ty, vy: -rand(9, 12), col: pick() });
    start();
  }
  /* 一连串烟花 */
  function show(count) {
    var c = count || (reduce ? 3 : 9);
    for (var i = 0; i < c; i++) {
      (function (i) {
        setTimeout(function () {
          launch(rand(W * 0.15, W * 0.85), rand(H * 0.15, H * 0.5));
        }, i * 360 + rand(0, 160));
      })(i);
    }
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }

  function loop() {
    fctx.globalCompositeOperation = "destination-out";
    fctx.fillStyle = "rgba(0,0,0,0.2)";
    fctx.fillRect(0, 0, W, H);
    fctx.globalCompositeOperation = "lighter";

    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.y += r.vy; r.vy *= 0.985;
      fctx.fillStyle = "rgba(255,240,200,.9)";
      fctx.beginPath(); fctx.arc(r.x, r.y, 1.8, 0, 6.2832); fctx.fill();
      if (r.y <= r.ty || r.vy > -2.2) {
        burst(r.x, r.y, { color: r.col, shape: Math.random() < 0.18 ? "heart" : null, n: Math.random() < 0.18 ? 60 : undefined });
        rockets.splice(i, 1);
      }
    }
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j];
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.045;
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0) { parts.splice(j, 1); continue; }
      fctx.fillStyle = "rgba(" + p.col[0] + "," + p.col[1] + "," + p.col[2] + "," + p.life.toFixed(2) + ")";
      fctx.beginPath(); fctx.arc(p.x, p.y, p.size * (0.5 + p.life * 0.6), 0, 6.2832); fctx.fill();
    }
    if (parts.length || rockets.length) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      fctx.globalCompositeOperation = "source-over";
      fctx.clearRect(0, 0, W, H);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(drawBg);

  window.FX = {
    burst: burst,
    show: show,
    sparkle: function (x, y) { burst(x, y, { n: reduce ? 10 : 18, color: [247, 220, 149], speed: 2.2 }); },
    heart: function (x, y) { burst(x, y, { n: 60, shape: "heart", speed: 4.2, color: [255, 159, 194] }); }
  };
})();
