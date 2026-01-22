// ==UserScript==
// @name         Fastened Rabbit
// @namespace    fastened-rabbithole
// @version      26.1.14.7T
// @author       upietrzy
// @include      /^https?:\/\/\x65\x75\x2e\x72\x61\x62\x62\x69\x74\x2d\x68\x6f\x6c\x65\x2e\x66\x63\x2e\x61\x6d\x61\x7a\x6f\x6e\x2e\x64\x65\x76\/.*$/
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_info
// @connect      *
// @noframes
// @connect      raw.githubusercontent.com
// @icon         https://icons.iconarchive.com/icons/icons8/windows-8/512/Holidays-Easter-Rabbit-icon.png
// @run-at       document-start
// ==/UserScript==

// poprawa wstrzykiwania css
// sugestie, pytania i błędy do @upietrzy

(function() {
    'use strict';

    // ==========================================
    // 1. NATYCHMIASTOWA KONFIGURACJA (PRZED BODY)
    // ==========================================
    const savedTheme = GM_getValue('rh_theme', 'light');
    const themeColors = {
        light: '#f5f7fa',
        dark: '#232526',
        midnight: '#0f0c29',
        sakura: '#ff9a9e',
        forest: '#134e5e'
    };

    // Ustawienie motywu na poziomie HTML (zapobiega białemu mignięciu)
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.backgroundColor = themeColors[savedTheme] || '#f5f7fa';

    // Główny blok stylów wstrzykiwany natychmiast
    const coreStyles = `
        :root {
            --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: 1px solid rgba(255, 255, 255, 0.6);
            --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            --primary-color: #007aff;
            --danger-color: #ff3b30;
            --text-main: #1d1d1f;
            --text-secondary: #86868b;
            --separator-color: rgba(0, 0, 0, 0.06);
            --input-bg: #ffffff;
            --panel-bg: rgba(255, 255, 255, 0.95);
            --hover-item: rgba(255, 255, 255, 0.6);
            --radius-lg: 24px;
            --font-stack: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
        }

        html[data-theme="dark"] {
            --bg-gradient: linear-gradient(135deg, #232526 0%, #414345 100%);
            --glass-bg: rgba(30, 30, 30, 0.85);
            --glass-border: 1px solid rgba(255, 255, 255, 0.1);
            --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
            --primary-color: #0a84ff;
            --danger-color: #ff453a;
            --text-main: #f5f5f7;
            --text-secondary: #a1a1a6;
            --separator-color: rgba(255, 255, 255, 0.1);
            --input-bg: #2c2c2e;
            --panel-bg: rgba(40, 40, 40, 0.95);
            --hover-item: rgba(255, 255, 255, 0.15);
        }

        html[data-theme="sakura"] {
            --bg-gradient: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            --glass-bg: rgba(255, 200, 220, 0.7);
            --glass-border: 1px solid rgba(255, 255, 255, 0.5);
            --primary-color: #ff2d55;
            --text-main: #4a001f;
            --panel-bg: rgba(255, 240, 245, 0.9);
        }

        html[data-theme="midnight"] {
            --bg-gradient: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            --glass-bg: rgba(20, 20, 40, 0.75);
            --primary-color: #bf5af2;
            --text-main: #ffffff;
            --panel-bg: rgba(30, 30, 60, 0.9);
        }

        html[data-theme="forest"] {
            --bg-gradient: linear-gradient(135deg, #134e5e, #71b280);
            --glass-bg: rgba(20, 40, 30, 0.75);
            --primary-color: #34c759;
            --text-main: #f0fff4;
            --panel-bg: rgba(20, 50, 40, 0.9);
        }

        /* RESET I PODSTAWOWY WYGLĄD */
        body {
            background: var(--bg-gradient) !important;
            font-family: var(--font-stack) !important;
            color: var(--text-main) !important;
            margin: 0; padding: 0;
        }

        /* Wymuszenie wyglądu panelu Amazonu */
        .default_panel {
            background: var(--panel-bg) !important;
            backdrop-filter: blur(30px) !important;
            border: 1px solid var(--glass-border) !important;
            border-radius: var(--radius-lg) !important;
            box-shadow: var(--glass-shadow) !important;
        }

        .default_input, input[type="text"] {
            background: var(--input-bg) !important;
            color: var(--text-main) !important;
            border: 1px solid var(--separator-color) !important;
            border-radius: 12px !important;
        }

        /* Naprawa przycisków */
        .default_button, input[type="submit"] {
            background: var(--primary-color) !important;
            color: white !important;
            border-radius: 14px !important;
            transition: all 0.3s !important;
        }

        /* --- STICKY NAV & SIDEBAR --- */
        nav {
            position: sticky !important; top: 20px; z-index: 1000;
            background: var(--glass-bg) !important;
            backdrop-filter: blur(20px) !important;
            border-radius: var(--radius-lg) !important;
        }

        .slide_left {
            position: sticky !important; top: 20px;
            height: calc(100vh - 40px);
            background: var(--glass-bg) !important;
            backdrop-filter: blur(20px) !important;
            border-radius: var(--radius-lg) !important;
        }

        /* Chowanie zbędnych elementów */
        .slide_left > ul > li:nth-child(2), .slide_left li.active, hr { display: none !important; }
    `;

    GM_addStyle(coreStyles);

    // ==========================================
    // 2. KONFIGURACJA I ZMIENNE GLOBALNE
    // ==========================================
    const UPDATE_URL = "https://raw.githubusercontent.com/SolveCat/ps/main/Fastened%20Rabbit.user.js";
    const CONFIG_URL = 'https://raw.githubusercontent.com/SolveCat/ps/refs/heads/main/configlinks.json';
    const BASE_URL = atob('aHR0cHM6Ly9ldS5yYWJiaXQtaG9sZS5mYy5hbWF6b24uZGV2');
    const COLORS = { "NSort": "#007aff", "Sortable": "#ff9500", "TeamLift": "#ff3b30", "MarketPlace": "#af52de" };

    let MENU = {}, MP_LINKS = {};
    const sidebar = document.createElement("div");
    sidebar.id = "rabbit-sidebar";
    const panel = document.createElement("div");
    panel.id = "rabbit-panel";

    // ==========================================
    // 3. FUNKCJE POMOCNICZE I UI
    // ==========================================

    async function init() {
        createLoader();
        checkUpdate();
        try {
            const response = await new Promise((res, rej) =>
                GM_xmlhttpRequest({ method: "GET", url: CONFIG_URL, onload: res, onerror: rej }));
            const config = JSON.parse(response.responseText);
            MENU = config.MENU;
            MP_LINKS = config.MP_LINKS;
            renderSidebar();
            injectThemeButton();
        } catch (e) { console.error("Config load error", e); }
    }

    function createLoader() {
        const loader = document.createElement("div");
        loader.id = "rh-loader";
        loader.innerHTML = `<div class="rh-spinner"></div><span>Pobieranie danych...</span>`;
        document.body.appendChild(loader);
    }

    function renderSidebar() {
        document.body.appendChild(sidebar);
        document.body.appendChild(panel);
        const cats = { "NSort": "NS", "Sortable": "S", "TeamLift": "TL", "MarketPlace": "MP" };
        Object.entries(cats).forEach(([key, label]) => {
            const btn = document.createElement("div");
            btn.className = "sidebar-btn";
            btn.style.setProperty('--hover-color', COLORS[key]);
            btn.textContent = label;
            btn.onclick = (e) => {
                e.stopPropagation();
                key === "MarketPlace" ? showMarketPlace() : showCategory(key);
            };
            sidebar.appendChild(btn);
        });
    }

    // --- LOGIKA LPN & AUTO-FILL ---
    function setupLPNListener() {
        const input399 = document.getElementById('399');
        if (!input399) return;

        input399.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const lpn = input399.value.trim();
                if (!lpn) return;

                document.getElementById('rh-loader').style.display = 'flex';

                const _0x4a1 = "aHR0cHM6Ly9ldS1jcmV0ZmMtdG9vbHMtZHViLmR1Yi5wcm94eS5hbWF6b24uY29tL2dldFJldHVyblVuaXREYXRhP2xwbj0=";
                const _0x4a2 = "JmxvY2FsZT1wbF9QTCZpc0F1dGhvcml6ZWRUb1ZpZXdQcmltYXJ5R3JhZGluZ0RhdGE9dHJ1ZQ==";

                GM_xmlhttpRequest({
                    method: "GET",
                    url: atob(_0x4a1) + lpn + atob(_0x4a2),
                    withCredentials: true,
                    onload: (res) => {
                        document.getElementById('rh-loader').style.display = 'none';
                        try {
                            const data = JSON.parse(res.responseText);
                            const d = data[0];
                            const oid = d?.packageAttributes?.actualPackageAttributes?.orderId;
                            const esc = d?.socratesActivityDataList?.find(a => a.activityStatus === "ESCALATED")?.associate;

                            if (oid) {
                                const el = document.getElementById('402');
                                if (el) { el.value = oid; el.dispatchEvent(new Event('input', { bubbles: true })); }
                            }
                            if (esc) {
                                const el = document.getElementById('404');
                                if (el) { el.value = esc; el.dispatchEvent(new Event('input', { bubbles: true })); }
                            }
                        } catch (err) { console.error("Parsing error", err); }
                    }
                });
            }
        });
    }

    // ==========================================
    // 4. INICJALIZACJA I OBSŁUGA EVENTÓW
    // ==========================================

    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupLPNListener();

        // FontAwesome
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);

        // Licznik
        createCounter();
    });

    // Helper: Dynamiczny przycisk motywu w menu
    function injectThemeButton() {
        const sidebarList = document.querySelector('.slide_left ul');
        if (sidebarList) {
            const li = document.createElement('li');
            li.innerHTML = '<i class="fas fa-palette"></i><a href="#">Motyw</a>';
            li.onclick = (e) => { e.preventDefault(); createThemeModal().open(); };
            sidebarList.appendChild(li);
        }
    }

    // Logika aktualizacji
    function checkUpdate() {
        GM_xmlhttpRequest({
            method: "GET",
            url: UPDATE_URL,
            onload: function(res) {
                const match = res.responseText.match(/\/\/ @version\s+([\d.]+)/);
                if (match && match[1] !== GM_info.script.version) {
                    showUpdateNotify(match[1]);
                }
            }
        });
    }

    // Stylizacja dodatkowych komponentów (Loader, Sidebar, Modale)
    GM_addStyle(`
        #rh-loader { position: fixed; top: 10%; right: 25px; background: var(--glass-bg); backdrop-filter: blur(15px); border: var(--glass-border); border-radius: 14px; padding: 10px 18px; display: none; align-items: center; gap: 12px; z-index: 9999999; box-shadow: var(--glass-shadow); font-family: var(--font-stack); color: var(--primary-color); }
        .rh-spinner { width: 20px; height: 20px; border: 2px solid var(--separator-color); border-top: 2px solid var(--primary-color); border-radius: 50%; animation: rh-spin 0.8s linear infinite; }
        @keyframes rh-spin { to { transform: rotate(360deg); } }

        #rabbit-sidebar { position: fixed; right: 12px; top: 50%; transform: translateY(-50%); z-index: 100000; display: flex; flex-direction: column; gap: 10px; }
        .sidebar-btn { background: var(--input-bg); color: var(--text-main); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 14px; font-weight: 600; font-size: 13px; border: 1px solid var(--separator-color); transition: all 0.3s; }
        .sidebar-btn:hover { background: var(--hover-color); color: white; transform: scale(1.1) translateX(-5px); }

        #rabbit-panel { position: fixed; right: 75px; top: 50%; transform: translateY(-50%) scale(0.95); width: 310px; background: var(--panel-bg); backdrop-filter: blur(25px); border-radius: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.25); display: none; opacity: 0; flex-direction: column; transition: all 0.4s; z-index: 99999999; border: var(--glass-border); color: var(--text-main); }
        #rabbit-panel.active { opacity: 1; transform: translateY(-50%) scale(1); }
    `);

    // --- FUNKCJE UI ---
    function showCategory(cat) {
        panel.innerHTML = `<div class="panel-header" style="padding:15px; border-bottom:1px solid var(--separator-color); display:flex; justify-content:space-between;"><span style="font-weight:700; color:${COLORS[cat]}">${cat}</span><span class="close-x" style="cursor:pointer">✕</span></div><div class="panel-body" style="padding:10px;">${(MENU[cat] || []).map(([name, path]) => `<div class="panel-item" onclick="window.location.href='${BASE_URL + path}'" style="padding:10px; cursor:pointer; border-radius:8px;">${name}</div>`).join('')}</div>`;
        panel.style.display = 'flex';
        setTimeout(() => panel.classList.add('active'), 10);
        panel.querySelector(".close-x").onclick = () => { panel.classList.remove('active'); setTimeout(() => panel.style.display = 'none', 400); };
    }

    function createCounter() {
        const div = document.createElement('div');
        div.id = 'rh-mini-counter';
        div.style.cssText = 'position:fixed; bottom:25px; right:25px; background:var(--panel-bg); backdrop-filter:blur(10px); padding:12px 20px; border-radius:16px; border:1px solid var(--separator-color); z-index:999999; font-family:var(--font-stack); box-shadow:var(--glass-shadow);';
        div.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><span style="width:8px; height:8px; background:#00b894; border-radius:50%"></span><span id="rh-count-total">Statystyki...</span></div>`;
        document.body.appendChild(div);
    }

    function createThemeModal() {
        const overlay = document.createElement('div');
        overlay.id = 'rh-theme-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);backdrop-filter:blur(3px);z-index:10000001;display:none;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';
        overlay.innerHTML = `
            <div id="rh-theme-box" style="background:var(--panel-bg);padding:25px;border-radius:24px;width:320px;border:1px solid var(--glass-border);font-family:var(--font-stack);transform:scale(0.8);transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="color:var(--text-main);font-size:18px;font-weight:700;margin-bottom:20px;text-align:center;">Wybierz motyw</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <button class="t-btn" data-set="light" style="background:#f5f7fa; padding:10px; border-radius:8px; border:1px solid #ddd; cursor:pointer">Jasny</button>
                    <button class="t-btn" data-set="dark" style="background:#232526; color:white; padding:10px; border-radius:8px; border:none; cursor:pointer">Ciemny</button>
                    <button class="t-btn" data-set="midnight" style="background:#0f0c29; color:white; padding:10px; border-radius:8px; border:none; cursor:pointer">Midnight</button>
                    <button class="t-btn" data-set="sakura" style="background:#ff9a9e; padding:10px; border-radius:8px; border:none; cursor:pointer">Sakura</button>
                </div>
                <button id="t-close" style="width:100%; margin-top:15px; background:var(--separator-color); border:none; padding:10px; border-radius:8px; color:var(--text-main); cursor:pointer">Zamknij</button>
            </div>`;
        document.body.appendChild(overlay);

        const open = () => { overlay.style.display = 'flex'; setTimeout(() => overlay.style.opacity = '1', 10); };
        const close = () => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 300); };

        overlay.querySelectorAll('.t-btn').forEach(b => b.onclick = () => {
            const t = b.getAttribute('data-set');
            document.documentElement.setAttribute('data-theme', t);
            document.documentElement.style.backgroundColor = themeColors[t];
            GM_setValue('rh_theme', t);
            close();
        });
        overlay.querySelector('#t-close').onclick = close;
        return { open };
    }

})();
