/* 页面交互:读取 config.js 渲染内容,并绑定所有互动 */
(function () {
  "use strict";
  var C = window.BIRTHDAY_CONFIG, FX = window.FX;
  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------- 基本文案 ---------- */
  var nick = C.nickname || C.name;
  document.title = nick + " · " + C.ageText + "岁生日快乐";
  document.querySelectorAll("[data-name]").forEach(function (e) { e.textContent = nick; });
  document.querySelectorAll("[data-fullname]").forEach(function (e) { e.textContent = C.name; });
  $("intro-sub").textContent = C.introText;
  $("tagline").textContent = C.tagline;
  $("age").textContent = C.age;
  $("date").textContent = C.year + " · " + pad(C.month) + " · " + pad(C.day);
  $("photos-sub").textContent = C.photosSub;
  $("future-kicker").textContent = C.future.kicker;
  $("future-title").textContent = C.future.title;

  if (C.avatar) {
    $("avatar").hidden = false;
    $("avatar").querySelector("img").src = C.avatar;
  }

  /* ---------- 信 ---------- */
  var body = $("letter-body");
  C.letter.forEach(function (para) {
    var box = el("div", "para");
    para.forEach(function (t, i) {
      var p = el("p", "line reveal", t);
      p.style.setProperty("--d", i * 0.3 + "s");
      box.appendChild(p);
    });
    body.appendChild(box);
  });

  /* ---------- 明年夏天 ---------- */
  var fb = $("future-body");
  C.future.paras.forEach(function (t, i) {
    var p = el("p", "reveal", t);
    p.style.setProperty("--d", i * 0.2 + "s");
    fb.appendChild(p);
  });

  /* ---------- 结尾 ---------- */
  var ft = $("finale-text");
  C.finale.forEach(function (t) { ft.appendChild(el("span", null, t)); });
  $("from").textContent = C.from;

  /* ---------- 倒计时 ---------- */
  var target = new Date(C.year, C.month - 1, C.day, 0, 0, 0);
  var isBirthday = false;
  function tick() {
    var now = new Date(), diff = target - now;
    var cd = $("cd"), label = $("cd-label");
    if (diff > 0) {
      var s = Math.floor(diff / 1000);
      $("cd-d").textContent = Math.floor(s / 86400);
      $("cd-h").textContent = pad(Math.floor(s % 86400 / 3600));
      $("cd-m").textContent = pad(Math.floor(s % 3600 / 60));
      $("cd-s").textContent = pad(s % 60);
      label.textContent = "距离你的" + C.ageText + "岁,还有";
      cd.hidden = false;
    } else {
      cd.hidden = true;
      var days = Math.floor(-diff / 864e5);
      if (days < 1) {
        isBirthday = true;
        label.textContent = "今天,是属于你的日子 ✦";
      } else {
        label.textContent = C.ageText + "岁的第 " + (days + 1) + " 天,愿每一天都闪闪发光";
      }
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- 十八颗星 ---------- */
  var POS = [
    [10, 86], [21, 75], [15, 61], [29, 54], [40, 66], [51, 78], [63, 70], [58, 56], [46, 44],
    [35, 34], [25, 24], [38, 17], [52, 25], [64, 37], [74, 28], [82, 41], [87, 24], [91, 11]
  ];
  var N = Math.min(C.wishes.length, POS.length);
  var sky = $("sky"), svg = $("sky-svg");
  var lit = new Array(N).fill(false), litCount = 0, allDone = false;
  var segs = [], starEls = [];
  $("prog-n").textContent = N;
  $("sky-name").textContent = C.constellation;
  $("wish-no").textContent = "已点亮 0 / " + N;
  $("wish-text").textContent = C.starsHint;

  var NS = "http://www.w3.org/2000/svg";
  for (var i = 0; i < N - 1; i++) {
    var ln = document.createElementNS(NS, "line");
    ln.setAttribute("x1", POS[i][0]); ln.setAttribute("y1", POS[i][1]);
    ln.setAttribute("x2", POS[i + 1][0]); ln.setAttribute("y2", POS[i + 1][1]);
    ln.setAttribute("class", "seg");
    svg.appendChild(ln); segs.push(ln);
  }
  C.wishes.slice(0, N).forEach(function (w, idx) {
    var b = el("button", "star");
    b.type = "button";
    b.setAttribute("aria-label", "第 " + (idx + 1) + " 颗星:" + w.title);
    b.style.left = POS[idx][0] + "%";
    b.style.top = POS[idx][1] + "%";
    b.style.setProperty("--td", (idx * 0.37 % 3).toFixed(2) + "s");
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      lightStar(idx, b);
    });
    sky.appendChild(b); starEls.push(b);
  });

  function showWish(no, text) {
    var card = $("wish-card");
    $("wish-no").textContent = no;
    $("wish-text").textContent = text;
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
  }
  function updateSegs() {
    segs.forEach(function (s, k) { s.classList.toggle("on", lit[k] && lit[k + 1]); });
  }
  function lightStar(idx, btn) {
    var w = C.wishes[idx];
    var r = btn.getBoundingClientRect();
    if (!lit[idx]) {
      lit[idx] = true; litCount++;
      btn.classList.add("lit");
      $("prog").textContent = litCount;
      updateSegs();
      FX.sparkle(r.left + r.width / 2, r.top + r.height / 2);
    }
    showWish("第 " + (idx + 1) + " 颗 · " + w.title, w.text);
    if (litCount === N && !allDone) {
      allDone = true;
      setTimeout(function () {
        sky.classList.add("done");
        showWish(C.starsDoneTitle, C.starsDone);
        FX.show(7);
      }, 1500);
    }
  }

  /* ---------- 相册 ---------- */
  var track = $("track");
  var items = C.photos.length ? C.photos : [
    { ph: true, caption: "第一张" }, { ph: true, caption: "第二张" }, { ph: true, caption: "第三张" }
  ];
  var tilt = [-2.2, 1.8, -1.2, 2.4, -1.8, 1.2];
  items.forEach(function (it, i) {
    var fig = el("figure", "polaroid");
    fig.style.setProperty("--r", tilt[i % tilt.length] + "deg");
    if (it.ph) {
      var ph = el("div", "ph");
      ph.style.whiteSpace = "pre-line";
      ph.textContent = "这里将放上\n你的照片 ✦";
      fig.appendChild(ph);
    } else {
      var img = el("img");
      img.src = it.src; img.alt = it.caption || ""; img.loading = "lazy";
      if (it.pos) img.style.objectPosition = it.pos;
      img.addEventListener("click", function (e) { e.stopPropagation(); openLb(it); });
      fig.appendChild(img);
    }
    if (it.caption) fig.appendChild(el("figcaption", null, it.caption));
    track.appendChild(fig);
  });
  function slide(dir) {
    var card = track.querySelector(".polaroid");
    var step = card ? card.offsetWidth + 22 : 300;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }
  $("g-prev").addEventListener("click", function () { slide(-1); });
  $("g-next").addEventListener("click", function () { slide(1); });

  var lb = $("lb");
  function openLb(it) {
    $("lb-img").src = it.src; $("lb-cap").textContent = it.caption || "";
    lb.classList.add("open");
  }
  lb.addEventListener("click", function (e) { e.stopPropagation(); lb.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("open"); });

  /* ---------- 蛋糕 ---------- */
  var out = false, cakeMsg = $("cake-msg"), blow = $("blow");
  function setCake(text) {
    cakeMsg.textContent = text;
    cakeMsg.classList.remove("swap"); void cakeMsg.offsetWidth; cakeMsg.classList.add("swap");
  }
  cakeMsg.textContent = C.cake.before;
  blow.addEventListener("click", function (e) {
    e.stopPropagation();
    out = !out;
    $("cake-wrap").classList.toggle("out", out);
    blow.textContent = out ? "重新点燃" : "吹灭蜡烛";
    setCake(out ? C.cake.after : C.cake.before);
    if (out) FX.show(8);
  });
  $("replay").addEventListener("click", function (e) { e.stopPropagation(); FX.show(10); });

  /* ---------- 音乐 ---------- */
  var mbtn = $("music"), hint = $("music-hint"), audio = null;
  var playing = false, userPaused = false, resumeAfterHide = false;
  var UNLOCK = ["pointerup", "touchend", "click", "keydown"];

  function paintMusic() {
    mbtn.classList.toggle("on", playing);
    mbtn.setAttribute("aria-pressed", String(playing));
    // 被浏览器拦截、且还停留在开屏页时,显示一行轻提示
    if (hint) hint.classList.toggle("show", !!audio && !playing && !userPaused);
  }
  /* 浏览器拦截自动播放时:用户在页面上的第一次操作(点击/按键)就开始播放 */
  function unlock(e) {
    if (e && e.target && e.target.closest && e.target.closest("#music")) return;
    if (!userPaused) setMusic(true);
  }
  function armUnlock() { UNLOCK.forEach(function (n) { document.addEventListener(n, unlock, true); }); }
  function disarmUnlock() { UNLOCK.forEach(function (n) { document.removeEventListener(n, unlock, true); }); }

  function setMusic(on) {
    if (!audio) return;
    if (on) {
      var pr = audio.play();
      var ok = function () { playing = true; disarmUnlock(); paintMusic(); };
      var fail = function () { playing = false; paintMusic(); };
      if (pr && pr.then) pr.then(ok, fail); else ok();
    } else {
      audio.pause(); playing = false; paintMusic();
    }
  }
  if (C.music) {
    audio = new Audio(C.music);
    audio.loop = true; audio.preload = "auto"; audio.volume = 0.8;
    audio.addEventListener("error", function () { mbtn.hidden = true; audio = null; disarmUnlock(); paintMusic(); });
    mbtn.hidden = false;
    mbtn.addEventListener("click", function (e) {
      e.stopPropagation();
      userPaused = playing;            // 正在播放时点击 = 用户主动暂停
      if (userPaused) disarmUnlock();
      setMusic(!playing);
    });
    document.addEventListener("visibilitychange", function () {
      if (!audio) return;
      if (document.hidden) { resumeAfterHide = playing; if (playing) setMusic(false); }
      else if (resumeAfterHide) { resumeAfterHide = false; setMusic(true); }
    });
    // 微信内置浏览器:桥接就绪后允许直接播放
    document.addEventListener("WeixinJSBridgeReady", function () { setMusic(true); }, false);
    // 页面一打开就尝试播放;失败则等待用户的第一次操作
    armUnlock();
    setMusic(true);
  }

  /* ---------- 开场 ---------- */
  var intro = $("intro");
  $("open").addEventListener("click", function (e) {
    e.stopPropagation();
    html.classList.remove("locked");
    html.classList.add("ready");
    intro.classList.add("hide");
    window.scrollTo(0, 0);
    if (!userPaused) setMusic(true);
    FX.show(isBirthday ? 12 : 5);
    setTimeout(function () { intro.remove(); }, 1600);
  });

  /* ---------- 滚动浮现 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (n) { io.observe(n); });

    var fio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        fio.disconnect();
        setTimeout(function () {
          FX.show(8);
          FX.heart(innerWidth / 2, innerHeight * 0.32);
        }, 900);
      }
    }, { threshold: 0.6 });
    fio.observe(ft);
  } else {
    revealEls.forEach(function (n) { n.classList.add("in"); });
  }

  /* ---------- 点哪里,烟花放哪里 ---------- */
  document.addEventListener("click", function (e) {
    if (html.classList.contains("locked")) return;
    if (e.target.closest("button,a,.lb,.polaroid")) return;
    FX.burst(e.clientX, e.clientY);
  });
})();
