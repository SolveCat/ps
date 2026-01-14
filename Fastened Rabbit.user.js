// ==UserScript==
// @name         Fastened Rabbit
// @namespace    fastened-rabbithole
// @version      26.1.14.1
// @author       upietrzy
// @include      /^https?:\/\/\x65\x75\x2e\x72\x61\x62\x62\x69\x74\x2d\x68\x6f\x6c\x65\x2e\x66\x63\x2e\x61\x6d\x61\x7a\x6f\x6e\x2e\x64\x65\x76\/.*$/
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_info
// @noframes
// @connect      raw.githubusercontent.com
// @icon         https://icons.iconarchive.com/icons/icons8/windows-8/512/Holidays-Easter-Rabbit-icon.png
// @run-at       document-start
// ==/UserScript==

// zmiana sposobu zapisu wersji
// naprawa cookies

(function() {
    'use strict';
    const faviconUrl = 'https://icons.iconarchive.com/icons/icons8/windows-8/512/Holidays-Easter-Rabbit-icon.png';
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = faviconUrl;
    document.head.appendChild(link);

    const UPDATE_URL = "https://raw.githubusercontent.com/SolveCat/ps/main/Fastened%20Rabbit.user.js";
    const CHECK_INTERVAL = 10 * 60 * 100;
    const STORAGE_KEY = 'tm_last_update_check';
    const UPDATE_NEEDED_KEY = 'tm_update_needed';

    function checkUpdate() {
        const now = Date.now();
        const lastCheck = localStorage.getItem(STORAGE_KEY);
        const updateNeeded = localStorage.getItem(UPDATE_NEEDED_KEY) === 'true';

        if (!updateNeeded && lastCheck && (now - lastCheck < CHECK_INTERVAL)) {
            return;
        }

        localStorage.setItem(STORAGE_KEY, now);

        GM_xmlhttpRequest({
            method: "GET",
            url: UPDATE_URL,
            onload: function(response) {
                const match = response.responseText.match(/\/\/ @version\s+([\d.]+)/);
                if (match) {
                    const remoteVersion = match[1];
                    const localVersion = GM_info.script.version;

                    if (isNewer(remoteVersion, localVersion)) {
                        localStorage.setItem(UPDATE_NEEDED_KEY, 'true');
                        createMacOSNotification(remoteVersion);
                    } else {
                        localStorage.setItem(UPDATE_NEEDED_KEY, 'false');
                    }
                }
            }
        });
    }

    function isNewer(remote, local) {
        return remote.localeCompare(local, undefined, { numeric: true, sensitivity: 'base' }) > 0;
    }

    function createMacOSNotification(newVersion) {
        if (document.getElementById('macos-update-notify')) return;

        GM_addStyle(`
            #macos-update-notify {
                position: fixed; top: 20px; right: 20px; width: 340px;
                background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px) saturate(180%);
                border: 0.5px solid rgba(0,0,0,0.1); border-radius: 18px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                padding: 12px 16px; z-index: 1000000; display: flex; align-items: flex-start;
                cursor: pointer; animation: slideIn 0.5s ease-out;
            }
            @keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }
            #macos-icon { width: 60px; height: 60px; border-radius: 10px; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; flex-shrink: 0; }
            #macos-title { font-weight: 600; font-size: 14px; color: #1d1d1f; }
            #macos-desc { font-size: 13px; color: #424245; margin-top: 2px; }
            #macos-desc2 { font-size: 13px; color: #424245; margin-top: 2px; }
        `);

        const notify = document.createElement('div');
        notify.id = 'macos-update-notify';
        notify.innerHTML = `
            <div id="macos-icon">❗</div>
            <div>
                <div id="macos-title">Dostępna aktualizacja (v${newVersion})</div>
                <div id="macos-desc">Kliknij tutaj,</div>
                 <div id="macos-desc2">aby zainstalować nową wersję.</div>
            </div>
        `;

        notify.onclick = () => {
            window.location.href = UPDATE_URL;
        };

        document.body.appendChild(notify);
    }


    const CONFIG_URL = 'https://raw.githubusercontent.com/SolveCat/ps/refs/heads/main/configlinks.json';
    const BASE_URL = atob('aHR0cHM6Ly9ldS5yYWJiaXQtaG9sZS5mYy5hbWF6b24uZGV2');
    const COLORS = { "NSort": "#007aff", "Sortable": "#ff9500", "TeamLift": "#ff3b30", "MarketPlace": "#af52de" };

    let MENU = {}, MP_LINKS = {};

    const sidebar = document.createElement("div");
    sidebar.id = "rabbit-sidebar";
    const panel = document.createElement("div");
    panel.id = "rabbit-panel";

    async function init() {
        checkUpdate();
        try {
            const response = await new Promise((res, rej) =>
                GM_xmlhttpRequest({ method: "GET", url: CONFIG_URL, onload: res, onerror: rej }));
            const config = JSON.parse(response.responseText);
            MENU = config.MENU;
            MP_LINKS = config.MP_LINKS;
            renderSidebar();
        } catch (e) { console.error("Config error", e); }
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

    const getFullUrl = (p) => p.startsWith('http') ? p : BASE_URL + p;

    function openPanel() {
        panel.style.display = 'flex';
        setTimeout(() => panel.classList.add('active'), 10);
    }

    function hidePanel() {
        panel.classList.remove('active');
        setTimeout(() => { if(!panel.classList.contains('active')) panel.style.display = 'none'; }, 300);
    }

    function showCategory(cat) {
        panel.innerHTML = `
            <div class="panel-header"><span class="title" style="color:${COLORS[cat]}">${cat}</span><span class="close-x">✕</span></div>
            <div class="panel-body">
                ${(MENU[cat] || []).map(([name, path]) => `
                    <div class="panel-item" onclick="window.location.href='${getFullUrl(path)}'">${name}</div>
                `).join('')}
            </div>`;
        panel.querySelector(".close-x").onclick = hidePanel;
        openPanel();
    }

    function showMarketPlace() {
        panel.innerHTML = `
            <div class="panel-header"><span class="title" style="color:${COLORS.MarketPlace}">MarketPlace</span><span class="close-x">✕</span></div>
            <div class="panel-body">
                ${Object.keys(MP_LINKS).map(name => `
                    <div class="panel-item mp-main-item" data-name="${name}">${name} <span class="arrow">❯</span></div>
                `).join('')}
            </div>`;
        panel.querySelector(".close-x").onclick = hidePanel;
        panel.querySelectorAll(".mp-main-item").forEach(item => {
            item.onclick = () => renderTypeSelection(item.getAttribute('data-name'));
        });
        openPanel();
    }

    function renderTypeSelection(reportName) {
        panel.innerHTML = `
            <div class="panel-header"><span class="title">Typ: ${reportName}</span><span class="close-x">✕</span></div>
            <div class="panel-body">
                <div class="panel-item back-btn">↩ Wstecz</div>
                <div class="type-grid">
                    <div class="type-btn ns" onclick="window.location.href='${getFullUrl(MP_LINKS[reportName].NS)}'">NS</div>
                    <div class="type-btn sort" onclick="window.location.href='${getFullUrl(MP_LINKS[reportName].Sort)}'">Sort</div>
                </div>
            </div>`;
        panel.querySelector(".close-x").onclick = hidePanel;
        panel.querySelector(".back-btn").onclick = showMarketPlace;
    }

    const DEBOUNCE_TIME = 10000;
    let currentLPN = "";

    const updateDisplay = () => {
        const total = GM_getValue('rh_count', 0);
        const ts = GM_getValue('rh_timestamps', []);
        const now = Date.now();
        const hourly = ts.filter(t => t > (now - 3600000)).length;
        const history = GM_getValue('rh_history', []);

        const totalEl = document.getElementById('rh-count-total');
        const hourEl = document.getElementById('rh-count-hour');
        const histEl = document.getElementById('rh-history-list');

        if (totalEl) totalEl.innerText = `${hourly}/h`;
        if (hourEl) hourEl.innerText = `Wysłane: ${total}`;
        if (histEl) {

    const secretPrefix = "aHR0cHM6Ly9ldS1jcmV0ZmMtdG9vbHMtZHViLmR1Yi5wcm94eS5hbWF6b24uY29tL2dyYXZpcy9yZXR1cm5Vbml0Lw==";

    histEl.innerHTML = history.length > 0
        ? history.map(lpn => {

            const fullUrl = atob(secretPrefix) + lpn + "?selectedLocale=pl_PL";

            return `<a href="${fullUrl}" target="_blank" class="history-item">• ${lpn}</a>`;
        }).join('')
        : '<div class="history-item" style="opacity:0.5">Brak danych</div>';
}
    };

    const handleIncrement = () => {
        const now = Date.now();
        if (now - GM_getValue('rh_last_increment', 0) < DEBOUNCE_TIME) return;

        GM_setValue('rh_last_increment', now);
        GM_setValue('rh_count', GM_getValue('rh_count', 0) + 1);

        let ts = GM_getValue('rh_timestamps', []);
        ts.push(now);
        GM_setValue('rh_timestamps', ts.filter(t => t > (now - 3600000)));

        if (currentLPN) {
            let hist = GM_getValue('rh_history', []).filter(i => i !== currentLPN);
            hist.unshift(currentLPN);
            GM_setValue('rh_history', hist.slice(0, 10));
            currentLPN = "";
        }
        updateDisplay();
    };

function setupLPNListener() {
    const input399 = document.getElementById('399');
    if (!input399) return;

    const _0x4a1 = "aHR0cHM6Ly9ldS1jcmV0ZmMtdG9vbHMtZHViLmR1Yi5wcm94eS5hbWF6b24uY29tL2dldFJldHVyblVuaXREYXRhP2xwbj0=";
    const _0x4a2 = "JmxvY2FsZT1wbF9QTCZpc0F1dGhvcml6ZWRUb1ZpZXdQcmltYXJ5R3JhZGluZ0RhdGE9dHJ1ZQ==";

    input399.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const lpn = input399.value.trim();
            if (!lpn) return;
            currentLPN = lpn;

            GM_xmlhttpRequest({
                method: "GET",
                url: atob(_0x4a1) + lpn + atob(_0x4a2),
                withCredentials: true, // <--- KLUCZOWE: Używa ciasteczek zalogowanego użytkownika
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
                onload: (res) => {
                // Sprawdzenie czy sesja użytkownika jest aktywna
                if (res.status === 401 || res.status === 403) {
                    console.error("Brak dostępu! Użytkownik nie jest zalogowany do narzędzi CRETFC.");
                    // Opcjonalnie: Wyświetl powiadomienie na ekranie
                    alert("Błąd autoryzacji Amazon! Otwórz narzędzie CRETFC w nowej karcie, aby odświeżyć sesję.");
                    return;
                }

                try {
                    const data = JSON.parse(res.responseText);

                    // Zabezpieczenie na wypadek pustej odpowiedzi
                    if (!data || !data[0]) {
                        console.log("Nie znaleziono danych dla tego LPN.");
                        return;
                    }

                    const d = data[0];
                    const oid = d?.packageAttributes?.actualPackageAttributes?.orderId;
                    const esc = d?.socratesActivityDataList?.find(a => a.activityStatus === "ESCALATED")?.associate;

                    console.log("Znaleziono - OrderID:", oid, "EscalatedBy:", esc);

                    // Wypełnianie Order ID (pole 402)
                    if (oid) {
                        const el = document.getElementById('402');
                        if (el) {
                            el.value = oid;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true })); // Czasem wymagane dodatkowo
                        }
                    }

                    // Wypełnianie loginu pracownika (pole 404)
                    if (esc) {
                        const el = document.getElementById('404');
                        if (el) {
                            el.value = esc;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }

                } catch (err) {
                    console.error("Błąd przetwarzania danych:", err);
                }
            },
            onerror: (err) => {
                console.error("Błąd połączenia sieciowego:", err);
            }
        });
        }
    });
}
    GM_addStyle(`
        :root {
            --mac-bg: rgba(255, 255, 255, 0.9);
            --mac-font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
        }

        #rabbit-sidebar {
            position: fixed; right: 12px; top: 50%; transform: translateY(-50%);
            z-index: 100000; display: flex; flex-direction: column; gap: 10px;
        }

        .sidebar-btn {
            background-color: white; color: #333;
            width: 44px; height: 44px; display: flex;
            align-items: center; justify-content: center; cursor: pointer;
            border-radius: 14px; font-weight: 600; font-family: var(--mac-font);
            font-size: 13px; border: 1px solid rgba(0,0,0,0.05);
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            position: relative; overflow: hidden;
        }

        .sidebar-btn:hover {
            background-color: var(--hover-color);
            color: white;
            transform: scale(1.1) translateX(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            border-color: transparent;
        }

        #rabbit-panel {
            position: fixed; right: 75px; top: 50%; transform: translateY(-50%) scale(0.95);
            width: 310px; max-height: 85vh; background: var(--mac-bg);
            backdrop-filter: blur(25px) saturate(190%); -webkit-backdrop-filter: blur(25px) saturate(190%);
            border-radius: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.12);
            display: none; opacity: 0; flex-direction: column;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 999999999999999999999999999999999999; overflow: hidden; font-family: var(--mac-font);
            border: 1px solid rgba(255,255,255,0.4);
        }

        #rabbit-panel.active { opacity: 1; transform: translateY(-50%) scale(1); }

        .panel-header {
            padding: 8px; display: flex; align-items: center; justify-content: space-between;
            border-bottom: 1px solid rgba(0,0,0,0.04);
            color: black;
        }

        .close-x {
            font-size: 16px; color: #bbb; cursor: pointer; transition: color 0.2s;
            padding: 5px; line-height: 1;
        }
        .close-x:hover { color: #ff5f56; }

        .title { font-weight: 700; font-size: 15px; letter-spacing: -0.3px; }

        .panel-body { overflow-y: auto; }

        .panel-item {
            padding: 12px 16px; margin: 4px 0; border-radius: 10px;
            cursor: pointer; font-size: 14px; color: #222;
            transition: all 0.2s ease;
            display: flex; justify-content: space-between; align-items: center;
        }

        .panel-item:hover { background: rgba(0,0,0,0.04); padding-left: 20px; }

        .back-btn { font-weight: 600; color: #007aff; }

        .type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 8px; }
        .type-btn {
            padding: 22px; text-align: center; border-radius: 14px;
            font-weight: 700; font-size: 17px; cursor: pointer;
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
            background: white; border: 1px solid rgba(0,0,0,0.04);
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
        }
        .type-btn:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
        }
        .type-btn.ns { color: #007aff; }
        .type-btn.sort { color: #af52de; }

        .panel-body::-webkit-scrollbar { width: 4px; }
        .panel-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
        #rh-mini-counter {
            position: fixed; bottom: 25px; right: 25px;
            background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);
            color: #000000; padding: 12px 20px; border-radius: 16px;
            border: 1px solid #d0d0d0; font-family: 'Segoe UI', sans-serif;
            z-index: 999999; cursor: pointer;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            display: flex; flex-direction: column; gap: 4px;
            overflow: hidden; max-height: 52px; width: 175px;
            max-height: 35px;

        }
        #rh-mini-counter:hover {
            max-height: 420px; width: 220px;
            background: #ffffff;
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        .main-line { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 15px; min-height: 24px; color: #000000; }
        .hour-line { font-size: 11px; color: #000000; font-weight: 600; margin-left: 20px; opacity: 0.8; }
        .dot { height: 10px; width: 10px; background: #00b894; border-radius: 50%; box-shadow: 0 0 6px rgba(0,184,148,0.4); }
        .history-section {
            margin-top: 12px; padding-top: 12px;
            border-top: 1px solid #eeeeee;
            opacity: 0; transition: opacity 0.3s ease;
        }
        #rh-mini-counter:hover .history-section { opacity: 1; }
        .history-title { font-size: 10px; text-transform: uppercase; color: #000000; letter-spacing: 0.8px; margin-bottom: 8px; font-weight: 900; }
        .history-item {
            font-size: 12px; color: #000000 !important; font-family: 'Consolas', monospace;
            padding: 6px 8px; margin: 1px -8px; border-radius: 6px;
            display: block; text-decoration: none; font-weight: 600;
            transition: all 0.2s;
        }
        .history-item:visited { color: #000000 !important; }
        .history-item:hover {
            background: #f2f2f2;
            color: #00b894 !important;
            padding-left: 12px;
        }
    `);
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', () => {
            if (this.responseURL?.includes('/result') && this.status < 400) handleIncrement();
        });
        return originalSend.apply(this, arguments);
    };

    window.addEventListener('submit', (e) => {
        if (e.target.action?.includes('/result')) handleIncrement();
    }, true);

    document.addEventListener('mousedown', (e) => {
        if (panel.classList.contains('active') && !panel.contains(e.target) && !sidebar.contains(e.target)) hidePanel();
    });

    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupLPNListener();
        const div = document.createElement('div');
        div.id = 'rh-mini-counter';
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; font-weight:bold"><span style="width:8px; height:8px; background:#00b894; border-radius:50%"></span><span id="rh-count-total">0/h</span></div>
            <div id="rh-count-hour" style="font-size:11px; margin: 4px 0 10px 16px">Wysłane: 0</div>
            <div style="border-top:1px solid #eee; padding-top:10px">
                <div style="font-size:10px; font-weight:900; opacity:0.5; margin-bottom:5px">OSTATNIE RAPORTY:</div>
                <div id="rh-history-list"></div>
            </div>`;
        document.body.appendChild(div);
        updateDisplay();
    });

})();
