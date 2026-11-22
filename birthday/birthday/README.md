# 严傲萍 · 十八岁生贺网页

纯静态页面(HTML + CSS + JS),无后端、无依赖,双击 `index.html` 即可预览。

## 目录
```
index.html          页面结构
css/style.css       样式
js/config.js        ★ 所有文字、日期、照片、音乐都在这里改
js/effects.js       星空 / 流星 / 烟花
js/main.js          交互逻辑
assets/photos/      放照片
assets/music/       放背景音乐
```

## 放入照片和音乐
1. 照片放进 `assets/photos/`(建议先压缩到单张 500KB 以内,宽度 1200px 左右)。
2. 在 `js/config.js` 里填写:
   ```js
   avatar: "assets/photos/avatar.jpg",       // 首屏圆形头像,可留空
   photos: [
     { src: "assets/photos/1.jpg", caption: "一句话说明" },
     { src: "assets/photos/2.jpg", caption: "……" }
   ],
   music: "assets/music/bgm.mp3",            // 文件名对应即可
   ```
3. 音乐在点击"拆开"时开始播放(浏览器要求用户操作后才能自动播放),右上角可开关。若没有音乐文件,按钮会自动隐藏。

## 部署
- **GitHub Pages**:把整个文件夹内容推到仓库根目录 → Settings → Pages → 选择分支 `main` / root。
- **云服务器**:把整个文件夹放到 Nginx/Apache 的网站目录即可。

## 小提示
- 倒计时按访问者本地时间走;11 月 27 日 00:00 起自动变成"今天是属于你的日子",打开时烟花更多。
- 所有路径都是相对路径,放在子目录下(如 `用户名.github.io/repo/`)也能正常使用。
- 手机竖屏体验已重点适配,建议发链接时让她用手机打开。
