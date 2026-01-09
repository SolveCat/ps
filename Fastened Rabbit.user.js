// ==UserScript==
// @name         Fastened Rabbit
// @namespace    fastened-rabbithole
// @version      4
// @author       upietrzy
// @include      /^https?:\/\/\x65\x75\x2e\x72\x61\x62\x62\x69\x74\x2d\x68\x6f\x6c\x65\x2e\x66\x63\x2e\x61\x6d\x61\x7a\x6f\x6e\x2e\x64\x65\x76\/.*$/
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_info
// @connect      raw.githubusercontent.com
// @icon         https://icons.iconarchive.com/icons/icons8/windows-8/512/Holidays-Easter-Rabbit-icon.png
// ==/UserScript==
(function() {
    'use strict';

    // --- KONFIGURACJA ---
    const UPDATE_URL = "https://raw.githubusercontent.com/TWOJA_NAZWA/REPO/main/skrypt.user.js";
    const CHECK_INTERVAL = 10 * 60 * 1000; //
    const STORAGE_KEY = 'tm_last_update_check';

    function checkUpdate() {
        const now = Date.now();
        const lastCheck = localStorage.getItem(STORAGE_KEY);

        // Sprawdzanie czy minęło 10 minut
        if (lastCheck && (now - lastCheck < CHECK_INTERVAL)) {
            const nextCheck = Math.round((CHECK_INTERVAL - (now - lastCheck)) / 1000);
            console.log(`[Updater] Następne sprawdzenie za ${nextCheck}s.`);
            return;
        }

        console.log("[Updater] Sprawdzanie dostępności aktualizacji na GitHub...");
        localStorage.setItem(STORAGE_KEY, now);

        GM_xmlhttpRequest({
            method: "GET",
            url: UPDATE_URL,
            onload: function(response) {
                const match = response.responseText.match(/\/\/ @version\s+([\d.]+)/);
                if (match) {
                    const remoteVersion = match[1];
                    const localVersion = GM_info.script.version;

                    console.log(`[Updater] Wersja lokalna: ${localVersion}, Wersja zdalna: ${remoteVersion}`);

                    if (isNewer(remoteVersion, localVersion)) {
                        console.log("[Updater] Znaleziono nowszą wersję! Wyświetlam powiadomienie.");
                        createMacOSNotification(remoteVersion);
                    } else {
                        console.log("[Updater] Skrypt jest aktualny.");
                    }
                }
            },
            onerror: function() {
                console.error("[Updater] Błąd podczas pobierania danych z GitHub.");
            }
        });
    }

    function isNewer(remote, local) {
        return remote.localeCompare(local, undefined, { numeric: true, sensitivity: 'base' }) > 0;
    }

    function createMacOSNotification(newVersion) {
        if (document.getElementById('macos-update-notify')) return;

        const notify = document.createElement('div');
        notify.id = 'macos-update-notify';

        const style = document.createElement('style');
        style.innerHTML = `
            #macos-update-notify {
                position: fixed; top: 20px; right: 20px; width: 340px;
                background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 0.5px solid rgba(255, 255, 255, 0.3); border-radius: 18px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                padding: 12px 16px; z-index: 999999; display: flex; align-items: flex-start;
                cursor: pointer; transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                animation: slideIn 0.5s ease-out;
            }
            #macos-update-notify:hover { transform: scale(1.02); }
            @keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }
            #macos-icon {
                width: 40px; height: 40px; background: linear-gradient(135deg, #007aff, #0051af);
                border-radius: 10px; margin-right: 12px; display: flex; align-items: center;
                justify-content: center; color: white; font-size: 20px; flex-shrink: 0;
            }
            #macos-content { flex-grow: 1; }
            #macos-title { font-weight: 600; font-size: 14px; color: #1d1d1f; margin-bottom: 2px; }
            #macos-desc { font-size: 13px; color: #424245; line-height: 1.4; }
            #macos-time { font-size: 11px; color: rgba(0,0,0,0.4); float: right; }
        `;
        document.head.appendChild(style);

        notify.innerHTML = `
            <div id="macos-icon">🚀</div>
            <div id="macos-content">
                <span id="macos-time">teraz</span>
                <div id="macos-title">Aktualizacja skryptu</div>
                <div id="macos-desc">Wersja ${newVersion} jest dostępna. Kliknij tutaj, aby zainstalować zmiany.</div>
            </div>
        `;

        notify.onclick = () => {
            window.location.href = UPDATE_URL;
            notify.remove();
        };

        setTimeout(() => {
            if(notify) {
                notify.style.transform = 'translateX(150%)';
                setTimeout(() => notify.remove(), 300);
            }
        }, 15000); // 15 sekund na kliknięcie

        document.body.appendChild(notify);
    }

    // Uruchomienie sprawdzania przy załadowaniu strony
    checkUpdate();


    const CONFIG_URL = 'https://raw.githubusercontent.com/SolveCat/ps/refs/heads/main/configlinks.json';
    const BASE_URL = atob('aHR0cHM6Ly9ldS5yYWJiaXQtaG9sZS5mYy5hbWF6b24uZGV2');

    let MENU = {};
    let MP_LINKS = {};

    const COLORS = {
        "NSort": "#007aff",
        "Sortable": "#ff9500",
        "TeamLift": "#ff3b30",
        "MarketPlace": "#af52de"
    };

    function loadConfig() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: CONFIG_URL,
                onload: function(response) {
                    try {
                        const config = JSON.parse(response.responseText);
                        MENU = config.MENU;
                        MP_LINKS = config.MP_LINKS;
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: reject
            });
        });
    }

    function getFullUrl(path) {
        return path.startsWith('http') ? path : BASE_URL + path;
    }

    const sidebar = document.createElement("div");
    sidebar.id = "rabbit-sidebar";
    document.body.appendChild(sidebar);

    const panel = document.createElement("div");
    panel.id = "rabbit-panel";
    document.body.appendChild(panel);

    function hidePanel() {
        panel.classList.remove('active');
        setTimeout(() => { if(!panel.classList.contains('active')) panel.style.display = 'none'; }, 300);
    }

    function showCategory(cat) {
        panel.innerHTML = `
            <div class="panel-header">
                <span class="title" style="color:${COLORS[cat]}">${cat}</span>
                <span class="close-x">✕</span>
            </div>
            <div class="panel-body">
                ${(MENU[cat] || []).map(([name, path]) => `
                    <div class="panel-item" onclick="window.location.href='${getFullUrl(path)}'">
                        ${name}
                    </div>
                `).join('')}
            </div>`;

        panel.querySelector(".close-x").onclick = hidePanel;
        openPanel();
    }

    function showMarketPlace() {
        panel.innerHTML = `
            <div class="panel-header">
                <span class="title" style="color:${COLORS["MarketPlace"]}">MarketPlace</span>
                <span class="close-x">✕</span>
            </div>
            <div class="panel-body">
                ${Object.keys(MP_LINKS).map(name => `
                    <div class="panel-item mp-main-item" data-name="${name}">
                        ${name} <span class="arrow">❯</span>
                    </div>
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
            <div class="panel-header">
                <span class="title">Typ: ${reportName}</span>
                <span class="close-x">✕</span>
            </div>
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

    function openPanel() {
        panel.style.display = 'flex';
        setTimeout(() => panel.classList.add('active'), 10);
    }

    loadConfig().then(() => {
        const labels = { "NSort": "NS", "Sortable": "S", "TeamLift": "TL" };
        Object.keys(labels).forEach(cat => {
            const btn = document.createElement("div");
            btn.className = "sidebar-btn";
            btn.style.setProperty('--hover-color', COLORS[cat]);
            btn.textContent = labels[cat];
            btn.onclick = (e) => { e.stopPropagation(); showCategory(cat); };
            sidebar.appendChild(btn);
        });

        const mpBtn = document.createElement("div");
        mpBtn.className = "sidebar-btn";
        mpBtn.style.setProperty('--hover-color', COLORS["MarketPlace"]);
        mpBtn.textContent = "MP";
        mpBtn.onclick = (e) => { e.stopPropagation(); showMarketPlace(); };
        sidebar.appendChild(mpBtn);
    });

    document.addEventListener('mousedown', (e) => {
        if (!panel.contains(e.target) && !sidebar.contains(e.target)) hidePanel();
    });

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
    `);

    const DEBOUNCE_TIME = 10000;
    let currentLPN = "";

    GM_addStyle(`
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

    const commitHistory = () => {
        if (!currentLPN) return;
        let history = GM_getValue('rh_history', []);
        history = history.filter(item => item !== currentLPN);
        history.unshift(currentLPN);
        history = history.slice(0, 10);
        GM_setValue('rh_history', history);
        currentLPN = "";
        updateDisplay();
    };

    const addTimestamp = () => {
        let ts = GM_getValue('rh_timestamps', []);
        const now = Date.now();
        ts.push(now);
        ts = ts.filter(t => t > (now - 3600000));
        GM_setValue('rh_timestamps', ts);
    };

    const getHourlyCount = () => {
        const ts = GM_getValue('rh_timestamps', []);
        const limit = Date.now() - 3600000;
        return ts.filter(t => t > limit).length;
    };

    const canIncrement = () => {
        const now = Date.now();
        const last = GM_getValue('rh_last_increment', 0);
        return (now - last >= DEBOUNCE_TIME);
    };

    const initCounter = () => {
        if (document.getElementById('rh-mini-counter')) return;
        const div = document.createElement('div');
        div.id = 'rh-mini-counter';
        div.innerHTML = `
            <div class="main-line"><span class="dot"></span><span id="rh-count-total">Wysłane: 0</span></div>
            <div class="hour-line" id="rh-count-hour">Godzina: 0</div>
            <div class="history-section">
                <div class="history-title">Ostatnie 10 raportow:</div>
                <div id="rh-history-list"></div>
            </div>
        `;
        div.ondblclick = (e) => {
            e.stopPropagation();
            if(confirm("Resetuj licznik?")) {
                GM_setValue('rh_count', 0); GM_setValue('rh_timestamps', []);
                GM_setValue('rh_history', []); GM_setValue('rh_last_increment', 0);
                updateDisplay();
            }
        };
        document.documentElement.appendChild(div);
        updateDisplay();
        setInterval(updateDisplay, 30000);
    };

    const updateDisplay = () => {
        const total = GM_getValue('rh_count', 0);
        const hourly = getHourlyCount();
        const history = GM_getValue('rh_history', []);
        const totalEl = document.getElementById('rh-count-total');
        const hourEl = document.getElementById('rh-count-hour');
        const histEl = document.getElementById('rh-history-list');
        if (totalEl) totalEl.innerText = `${hourly}/h`;
        if (hourEl) hourEl.innerText = `Wysłane: ${total}`;
        if (histEl) {
            histEl.innerHTML = history.length > 0
                ? history.map(lpn => {
                    const url = `https://eu-cretfc-tools-dub.dub.proxy.amazon.com/gravis/returnUnit/${lpn}?selectedLocale=pl_PL`;
                    return `<a href="${url}" target="_blank" class="history-item">• ${lpn}</a>`;
                }).join('')
                : '<div class="history-item" style="opacity:0.5; pointer-events:none;">Brak danych</div>';
        }
    };

    const handleLPN = () => {
        const input399 = document.getElementById('399');
        if (!input399) return;
        input399.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const lpn = input399.value.trim();
                if (lpn) currentLPN = lpn;
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://eu-cretfc-tools-dub.dub.proxy.amazon.com/getReturnUnitData?lpn=${lpn}&locale=pl_PL&isAuthorizedToViewPrimaryGradingData=true`,
                    headers: {
                        "Cookie": `amzn_sso_rfp="9f20aec6a48cf12b"; amzn_sso_token="eyJ4NXUiOiJodHRwOlwvXC9zZW50cnktcGtpLmFtYXpvbi5jb21cL3B1YmxpY2tleVwvMjc0NDAwNDkiLCJ0eXAiOiJKV1MiLCJhbGciOiJQUzI1NiJ9.eyJzdWIiOiJ1cGlldHJ6eUBBTlQuQU1BWk9OLkNPTSIsImF1ZCI6WyJodHRwczpcL1wvZXUtY3JldGZjLXRvb2xzLWR1Yi5kdWIucHJveHkuYW1hem9uLmNvbTo0NDMiXSwiYWNyIjoia2VyYmVyb3MiLCJhbXIiOlsicHdkIl0sImlzcyI6InNlbnRyeS5hbWF6b24uY29tIiwiZXhwIjoxNzY3OTI2MzI4LCJpYXQiOjE3Njc4OTAzMjgsIm5vbmNlIjoxNDYjk2ZjdlMmRkODljZTQzMjVlMmQwYjkyNDg5OGE1ZTY0YzM0MGExZDQ1ZWU2OWYwODRlYTQ1NjRiY2UzNyJ9.Bi8ifu-bho0C9q5v9EB79Xiy9VXjTmZUTWi8WIFUHsy1g2wvQagfw4ZY5cDzaWv_qdP6eU2kbjPRJnAP4Ekxlb4goxGe5iRivd8urI9nBJSkg2ZfwlZtq-fStbxkh5lNQsPcGpBjmAXXzyY-Qj2-y1Kqf_rJhHakAx0Q4JNUprUO0RG43LRGqlRdQkm0FR1B8zBMWXyhL-BLhad_hBYgO3u0N1wjw-wKo1tOjU9Bqk6amEpXbgzR61txtZA3xLf03SuioZGBmRn5UNU_FBe2lYdGCWjBjDrD1nuibNnPyitwDpCKm0JVhtsI-6PkO-oThcXFsgYQjXUgfKZ9Cgy9CA"; JSESSIONID="F1EBC3A9FA93ED64A6BF34CFC4AB4A7A"; program-cookie="FC_MENU_INTERNAL"`,
                        "Accept": "application/json"
                    },
                    onload: (res) => {
                        try {
                            const d = JSON.parse(res.responseText)[0];
                            const oid = d?.packageAttributes?.actualPackageAttributes?.orderId;
                            const esc = d?.socratesActivityDataList?.find(a => a.activityStatus === "ESCALATED")?.associate;
                            if (oid) fill(402, oid);
                            if (esc) fill(404, esc);
                        } catch(e) {}
                    }
                });
            }
        });
    };

    const fill = (id, val) => {
        const el = document.getElementById(id);
        if (el) { el.value = val; el.dispatchEvent(new Event('input', {bubbles:true})); }
    };

    const triggerIncr = (url) => {
        if (url.includes('/result') && canIncrement()) {
            GM_setValue('rh_last_increment', Date.now());
            GM_setValue('rh_count', GM_getValue('rh_count', 0) + 1);
            addTimestamp();
            commitHistory();
            updateDisplay();
        }
    };

    const rawSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', () => {
            if (this.status >= 200 && this.status < 400) triggerIncr(this.responseURL || '');
        });
        return rawSend.apply(this, arguments);
    };

    window.addEventListener('submit', (e) => {
        if (e.target.action?.includes('/result') && canIncrement()) {
            GM_setValue('rh_last_increment', Date.now());
            GM_setValue('rh_count', GM_getValue('rh_count', 0) + 1);
            addTimestamp();
            commitHistory();
        }
    }, true);

    document.addEventListener('DOMContentLoaded', () => { initCounter(); handleLPN(); });
    setTimeout(() => { initCounter(); handleLPN(); }, 1500);

})();
