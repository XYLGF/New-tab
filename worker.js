// ==========================================
// 前端页面代码 (独立提取，避免解析冲突)
// ==========================================
const FRONTEND_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YL New Tab</title>
<style>
  :root { --bg: #ffffff; --text: #111111; --line: #111111; --muted: #888888; --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: var(--font); background-color: var(--bg); background-size: cover; background-position: center;
    color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden; transition: background 0.3s, filter 0.3s;
  }
  
  /* 壁纸模糊和遮罩 */
  body.has-bg::before { 
    content: ''; position: fixed; inset: 0; 
    background: rgba(255, 255, 255, 0.6); 
    z-index: 0; pointer-events: none; 
  }
  body.blur-bg { backdrop-filter: blur(8px); }

  .header { display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; z-index: 10; }
  .logo-area { display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
  
  .user-area { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; cursor: pointer; }
  .user-area svg { width: 28px; height: 28px; stroke: var(--text); fill: none; stroke-width: 2.5; }
  .user-area:hover { opacity: 0.7; }

  .main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; padding-bottom: 100px; }
  .title { font-size: 40px; font-weight: 800; margin-bottom: 30px; letter-spacing: 1px; }

  .search-box { position: relative; width: 100%; max-width: 600px; margin-bottom: 40px; }
  .search-box input {
    width: 100%; padding: 18px 24px; font-size: 18px; font-family: inherit; border: 2px solid var(--line);
    border-radius: 4px; background: rgba(255, 255, 255, 0.9); color: var(--text); outline: none; transition: all 0.2s;
  }
  .search-box input:focus { background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .search-box button { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; }
  .search-box svg { width: 24px; height: 24px; stroke: var(--text); fill: none; stroke-width: 2; }

  .grid { display: flex; gap: 20px; }
  .card {
    width: 100px; height: 100px; border: 2px solid var(--line); border-radius: 4px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; background: rgba(255, 255, 255, 0.9); transition: all 0.2s; position: relative;
  }
  .card:hover { background: #fff; transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .card svg { width: 40px; height: 40px; stroke: var(--text); fill: none; stroke-width: 1.5; }
  .card span { font-size: 13px; font-weight: 600; margin-top: 8px; }

  /* 弹窗 */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: none; justify-content: center; align-items: center; z-index: 100; }
  .modal-overlay.active { display: flex; }
  .modal { background: #fff; border: 2px solid var(--line); width: 100%; max-width: 440px; padding: 30px; box-shadow: 10px 10px 0 rgba(0,0,0,0.05); position: relative; }
  .modal-close { position: absolute; top: 20px; right: 20px; background: none; border: none; cursor: pointer; font-size: 24px; font-weight: bold; }
  .modal h2 { font-size: 20px; margin-bottom: 24px; }
  
  .setting-item { border: 2px solid var(--line); padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
  .setting-item label { font-weight: 600; font-size: 15px; }
  .setting-item button, .setting-item input[type="text"] { border: 2px solid var(--line); padding: 6px 12px; font-size: 14px; background: transparent; outline: none; font-family: inherit; }
  .setting-item button { cursor: pointer; font-weight: 600; }
  .setting-item button:hover { background: var(--line); color: #fff; }
  .setting-item input[type="text"] { width: 140px; text-align: right; }

  .prompt-input { width: 100%; border: 2px solid var(--line); padding: 12px; font-size: 16px; outline: none; margin-bottom: 20px; font-family: inherit; }
  .btn-primary { width: 100%; padding: 12px; border: 2px solid var(--line); background: var(--line); color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; }

  /* 右下角设置按钮 */
  .floating-settings {
    position: fixed; bottom: 40px; right: 40px; width: 50px; height: 50px;
    background: #fff; border: 2px solid var(--line); border-radius: 50%;
    display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 50;
    transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .floating-settings:hover { transform: rotate(90deg); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
  .floating-settings svg { width: 26px; height: 26px; stroke: var(--line); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  /* 开关样式 */
  .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
  .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
  input:checked + .slider { background-color: var(--line); }
  input:checked + .slider:before { transform: translateX(26px); }
</style>
</head>
<body>

  <div class="header">
    <div class="logo-area">
      <span id="page-title-display">YL New Tab</span>
    </div>
    <div class="user-area" id="user-area" onclick="handleLoginClick()">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>
      <span id="user-name">登录YL账户</span>
    </div>
  </div>

  <div class="main">
    <div class="title" id="main-title-display">YL New Tab</div>
    
    <div class="search-box">
      <input type="text" id="search-input" placeholder="搜一下" autocomplete="off">
      <button id="search-btn">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
    </div>

    <div class="grid">
      <div class="card" id="btn-open-bookmarks">
        <svg viewBox="0 0 24 24" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <span>收藏</span>
      </div>
      <div class="card" id="btn-open-history">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>历史记录</span>
      </div>
      <div class="card" id="btn-add-bookmark">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>添加</span>
      </div>
    </div>
  </div>

  <!-- 右下角设置图标 -->
  <div class="floating-settings" id="btn-settings">
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  </div>

  <div class="modal-overlay" id="settings-modal">
    <div class="modal">
      <button class="modal-close" id="btn-close-settings">×</button>
      <h2>设置</h2>
      <div class="setting-item">
        <label>自定义壁纸</label>
        <button id="btn-upload-bg">上传</button>
        <input type="file" id="bg-upload" accept="image/*" style="display:none;">
      </div>
      <div class="setting-item">
        <label>壁纸模糊效果</label>
        <label class="switch">
          <input type="checkbox" id="set-blur">
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <label>标签页名称</label>
        <input type="text" id="set-title" placeholder="YL New Tab">
      </div>
      <div class="setting-item">
        <label>搜索引擎</label>
        <input type="text" id="set-engine" placeholder="必应">
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="prompt-modal">
    <div class="modal" style="max-width: 500px;">
      <button class="modal-close" id="btn-close-prompt">×</button>
      <h2 id="prompt-title">标题</h2>
      <div id="prompt-content" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;"></div>
      <div id="prompt-input-area" style="display: none;">
        <input type="text" class="prompt-input" id="prompt-input-1" placeholder="名称（如：必应）">
        <input type="text" class="prompt-input" id="prompt-input-2" placeholder="链接（https://...）">
        <button class="btn-primary" id="btn-submit-prompt">保存</button>
      </div>
    </div>
  </div>

  <!-- 把 JS 放在这里 -->
  <script>
    var API_BASE = ""; 
    var SSO_URL = "https://acss.ylai.website";
    var userEmail = localStorage.getItem("newtab_email") || null;

    var settings = JSON.parse(localStorage.getItem('yl_settings')) || { title: "YL New Tab", engine: "必应", engineUrl: "https://cn.bing.com/search?q=", blur: false };
    var bookmarks = JSON.parse(localStorage.getItem('yl_bookmarks')) || [];
    var historyList = JSON.parse(localStorage.getItem('yl_history')) || [];
    var promptCallback = null;

    async function init() {
      var urlParams = new URLSearchParams(window.location.search);
      var token = urlParams.get('token');
      var username = urlParams.get('username');
      if (token && username) {
        localStorage.setItem("newtab_email", username);
        userEmail = username;
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (userEmail) {
        document.getElementById('user-name').innerText = userEmail;
        await loadFromCloud();
      }
      applyUI();
    }

    function applyUI() {
      document.getElementById('page-title-display').innerText = settings.title;
      document.getElementById('main-title-display').innerText = settings.title;
      document.getElementById('set-title').value = settings.title;
      document.getElementById('set-engine').value = settings.engine;
      
      var blurToggle = document.getElementById('set-blur');
      blurToggle.checked = settings.blur;
      if (settings.blur) document.body.classList.add('blur-bg');
      else document.body.classList.remove('blur-bg');
      
      var bg = localStorage.getItem('yl_bg');
      if (bg) {
        document.body.style.backgroundImage = 'url(' + bg + ')';
        document.body.classList.add('has-bg');
      }
    }

    // 按钮点击事件绑定
    document.getElementById('user-area').onclick = function() {
      if (userEmail) {
        if(confirm("点击确定退出登录（数据将保留在本地）")) {
          localStorage.removeItem("newtab_email");
          location.reload();
        }
      } else {
        window.location.href = SSO_URL + "?returnUrl=" + encodeURIComponent(window.location.href);
      }
    };

    document.getElementById('btn-settings').onclick = function() { document.getElementById('settings-modal').classList.add('active'); };
    document.getElementById('btn-close-settings').onclick = function() { document.getElementById('settings-modal').classList.remove('active'); };
    
    document.getElementById('btn-open-bookmarks').onclick = openBookmarks;
    document.getElementById('btn-open-history').onclick = openHistory;
    document.getElementById('btn-add-bookmark').onclick = addBookmark;
    
    document.getElementById('search-btn').onclick = doSearch;
    document.getElementById('search-input').onkeypress = function(e) { if(e.key === 'Enter') doSearch(); };

    document.getElementById('btn-close-prompt').onclick = function() { document.getElementById('prompt-modal').classList.remove('active'); };
    document.getElementById('btn-submit-prompt').onclick = submitPrompt;
    
    document.getElementById('btn-upload-bg').onclick = function() { document.getElementById('bg-upload').click(); };
    document.getElementById('bg-upload').onchange = uploadBg;

    document.getElementById('set-title').onchange = function(e) {
      settings.title = e.target.value || "YL New Tab";
      applyUI();
      syncCloud();
    };

    document.getElementById('set-engine').onchange = function(e) {
      var val = e.target.value;
      settings.engine = val || "必应";
      if (val === "百度") settings.engineUrl = "https://www.baidu.com/s?wd=";
      else if (val === "谷歌") settings.engineUrl = "https://www.google.com/search?q=";
      else settings.engineUrl = "https://cn.bing.com/search?q=";
      syncCloud();
    };

    document.getElementById('set-blur').onchange = function(e) {
      settings.blur = e.target.checked;
      if (settings.blur) document.body.classList.add('blur-bg');
      else document.body.classList.remove('blur-bg');
      syncCloud();
    };

    async function loadFromCloud() {
      try {
        var res = await fetch(API_BASE + "/api/sync?email=" + encodeURIComponent(userEmail));
        if (res.ok) {
          var data = await res.json();
          if (data && data.settings) {
            var cloudSettings = JSON.parse(data.settings);
            settings = Object.assign(settings, cloudSettings);
          }
          if (data && data.bookmarks) bookmarks = JSON.parse(data.bookmarks);
          if (data && data.history) historyList = JSON.parse(data.history);
          saveLocal();
        }
      } catch (e) { console.error("云端加载失败", e); }
    }

    async function syncCloud() {
      saveLocal();
      if (!userEmail) return; 
      try {
        await fetch(API_BASE + "/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, settings: settings, bookmarks: bookmarks, history: historyList })
        });
      } catch (e) { console.error("云端同步失败", e); }
    }

    function saveLocal() {
      localStorage.setItem('yl_settings', JSON.stringify(settings));
      localStorage.setItem('yl_bookmarks', JSON.stringify(bookmarks));
      localStorage.setItem('yl_history', JSON.stringify(historyList));
    }

    function showPrompt(title, contentHTML, showInputs, btnText) {
      document.getElementById('prompt-title').innerText = title;
      document.getElementById('prompt-content').innerHTML = contentHTML;
      document.getElementById('prompt-input-area').style.display = showInputs ? 'block' : 'none';
      if (showInputs) {
        document.getElementById('prompt-input-1').value = '';
        document.getElementById('prompt-input-2').value = '';
        document.getElementById('btn-submit-prompt').innerText = btnText || '保存';
      }
      document.getElementById('prompt-modal').classList.add('active');
    }

    function submitPrompt() { if (promptCallback) promptCallback(); }

    function uploadBg(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var base64 = ev.target.result;
        localStorage.setItem('yl_bg', base64);
        document.body.style.backgroundImage = 'url(' + base64 + ')';
        document.body.classList.add('has-bg');
      };
      reader.readAsDataURL(file);
    }

    function doSearch() {
      var q = document.getElementById('search-input').value.trim();
      if (!q) return;
      historyList.unshift({ query: q, time: new Date().toLocaleString() });
      if (historyList.length > 50) historyList.pop();
      syncCloud(); 
      window.location.href = settings.engineUrl + encodeURIComponent(q);
    }

    function addBookmark() {
      showPrompt("添加收藏", "", true, "添加");
      promptCallback = function() {
        var name = document.getElementById('prompt-input-1').value.trim();
        var url = document.getElementById('prompt-input-2').value.trim();
        if (!name || !url) return alert("名称和链接不能为空");
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        bookmarks.push({ name: name, url: url });
        document.getElementById('prompt-modal').classList.remove('active');
        syncCloud();
      };
    }

    function openBookmarks() {
      if (bookmarks.length === 0) return showPrompt("我的收藏", "<p style='color:#888;'>暂无收藏，点击主页的 '+' 添加。</p>", false);
      var html = "";
      bookmarks.forEach(function(b, i) {
        html += '<div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">' +
                '<a href="' + b.url + '" style="color: #333; text-decoration: none; font-weight: bold;">' + b.name + '</a>' +
                '<button onclick="delBookmark(' + i + ')" style="color: red; background: none; border: none; cursor: pointer;">删除</button>' +
                '</div>';
      });
      showPrompt("我的收藏", html, false);
    }

    function delBookmark(index) {
      bookmarks.splice(index, 1);
      syncCloud();
      openBookmarks();
    }

    function openHistory() {
      if (historyList.length === 0) return showPrompt("历史记录", "<p style='color:#888;'>暂无搜索记录。</p>", false);
      var html = "";
      historyList.forEach(function(h) {
        html += '<div style="border-bottom: 1px solid #eee; padding: 10px 0;">' +
                '<span style="font-weight: bold;">' + h.query + '</span>' +
                '<span style="float: right; color: #888; font-size: 12px;">' + h.time + '</span>' +
                '</div>';
      });
      showPrompt("历史记录", html, false);
    }

    init();
  </script>
</body>
</html>
`;

// ==========================================
// 2. 后端 API 逻辑
// ==========================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/sync")) {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };
      if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

      try {
        if (request.method === "GET") {
          const email = url.searchParams.get("email");
          if (!email) return new Response("Missing email", { status: 400, headers: corsHeaders });
          
          const record = await env.DB.prepare("SELECT * FROM user_newtab WHERE email = ?").bind(email).first();
          return new Response(JSON.stringify(record || {}), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "POST") {
          const data = await request.json();
          if (!data.email) return new Response("Missing email", { status: 400, headers: corsHeaders });

          const settingsStr = JSON.stringify(data.settings || {});
          const bookmarksStr = JSON.stringify(data.bookmarks || []);
          const historyStr = JSON.stringify(data.history || []);

          await env.DB.prepare(`
            INSERT INTO user_newtab (email, settings, bookmarks, history) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET 
            settings = excluded.settings, 
            bookmarks = excluded.bookmarks, 
            history = excluded.history
          `).bind(data.email, settingsStr, bookmarksStr, historyStr).run();

          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(FRONTEND_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};