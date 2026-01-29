// ==UserScript==
// @name         Fastened Rabbit
// @namespace    fastened-rabbithole
// @version      26.1.29.01
// @author       upietrzy
// @include      /^https?:\/\/\x65\x75\x2e\x72\x61\x62\x62\x69\x74\x2d\x68\x6f\x6c\x65\x2e\x66\x63\x2e\x61\x6d\x61\x7a\x6f\x6e\x2e\x64\x65\x76\/.*$/
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_info
// @connect      *
// @noframes
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @icon         https://icons.iconarchive.com/icons/icons8/windows-8/512/Holidays-Easter-Rabbit-icon.png
// @run-at       document-start
// ==/UserScript==

// zmiana sposobu zapisu wersji (rok, miesiac, dzien, build)
// naprawa cookies
// dodano motywy
// optymalizacja rozkladu strony

(function() {
    'use strict';
    GM_addStyle(`
    /* Wyśrodkowany tytuł w panelu */
.panel-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 15px;
    background: rgba(0,0,0,0.03);
    border-bottom: 1px solid var(--separator-color);
}

.panel-header .title {
    font-weight: 800;
    text-transform: uppercase;
    text-align: center;
    width: 100%;
}

.close-x {
    position: absolute;
    right: 15px;
}

/* Wyśrodkowane separatory z liniami */
.panel-separator {
    display: flex;
    align-items: center;
    text-align: center;
    padding: 20px 16px 10px 16px;
    font-size: 10px;
    font-weight: 900;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 2px;
}

.panel-separator::before, .panel-separator::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--separator-color);
}
.panel-separator::before { margin-right: 15px; }
.panel-separator::after { margin-left: 15px; }

/* Przyciski plomby */
.seal-grid { display: flex; flex-direction: column; gap: 10px; padding: 15px; }
.seal-btn {
    padding: 16px;
    border-radius: 14px;
    text-align: center;
    font-weight: 800;
    cursor: pointer;
    transition: 0.3s;
    border: 1px solid var(--separator-color);
    background: var(--input-bg);
    color: var(--text-main);
}
.seal-btn.green:hover { background: #34c759; color: white; border-color: #34c759; }
.seal-btn.orange:hover { background: #ff9500; color: white; border-color: #ff9500; }
.seal-btn.red:hover { background: #ff3b30; color: white; border-color: #ff3b30; }
    #rabbit-sidebar-header-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    padding-right: 4px; /* Kompensacja bliskości krawędzi */
    pointer-events: none;
}


#rabbit-sidebar-header {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 800;
    color: var(--primary-color);
    letter-spacing: 1px;
    box-shadow: var(--glass-shadow);
    white-space: nowrap; /* Zapobiega łamaniu tekstu */
}
    #rh-loader {
    position: fixed;
    top: 10%;
    right: 25px;
    background: var(--glass-bg);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 10px 18px;
    display: none; /* Ukryty startowo */
    align-items: center;
    gap: 12px;
    z-index: 9999999;
    box-shadow: var(--glass-shadow);
    font-family: var(--font-stack);
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-color);
}

.rh-spinner {
    width: 40px;
    height: 40px;
    border: 2px solid var(--separator-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: rh-spin 0.8s linear infinite;
}

@keyframes rh-spin {
    to { transform: rotate(360deg); }
}
.default_panel {
    background: var(--panel-bg) !important;
    backdrop-filter: blur(30px) !important;
    border: 1px solid var(--glass-border) !important;
    box-shadow: var(--glass-shadow) !important;
    color: var(--text-main) !important;
}

/* Nagłówek panelu */
.panel_head {
    border-bottom: 1px solid var(--separator-color) !important;
    background: transparent !important;
}

.panel_head h2 {
    color: var(--text-main) !important;
}

/* --- ELEMENTY WEWNĄTRZ PANELU --- */

/* Wszystkie inputy i pola tekstowe */
.default_input,
input[type="text"],
input[type="password"],
select,
textarea {
    background-color: var(--input-bg) !important;
    color: var(--text-main) !important;
    border: 1px solid var(--separator-color) !important;
}

/* Etykiety (Label) */
.default_label, label {
    color: var(--text-secondary) !important;
}

/* Kafelki procesów (Grid) */
.process_panel a,
.process_panel_vertical a {
    background: var(--input-bg) !important;
    color: var(--text-main) !important;
    border: 1px solid var(--separator-color) !important;
}

.process_panel a:hover,
.process_panel_vertical a:hover {
    background: var(--hover-item) !important;
    border-color: var(--primary-color) !important;
}

/* Radio Buttony / Checkboxy (Labele sterujące) */
.checkbox-toolbar label {
    background: var(--input-bg) !important;
    color: var(--text-main) !important;
    border: 1px solid var(--separator-color) !important;
}

.checkbox-toolbar input[type="radio"]:checked + label {
    background: var(--primary-color) !important;
    color: white !important;
    border-color: var(--primary-color) !important;
}

/* Tabele wewnątrz panelu */
.default_table td {
    background: var(--input-bg) !important;
    color: var(--text-main) !important;
    border-color: var(--separator-color) !important;
}

.default_table th {
    color: var(--text-secondary) !important;
}

/* Teksty informacyjne, paragrafy itp. */
.default_panel p,
.default_panel span,
.default_panel div:not([class]) {
    color: var(--text-main) !important;
}
    /* Pływający przycisk motywu w lewym dolnym rogu */
#rh-theme-fab {
    position: fixed;
    bottom: 25px;
    left: 25px;
    width: 48px;
    height: 48px;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999999;
    box-shadow: var(--glass-shadow);
    color: var(--primary-color);
    font-size: 20px;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
#rh-theme-fab:hover {
    transform: scale(1.1) rotate(15deg);
    background: var(--primary-color);
    color: white;
}

/* Fix dla widoczności modala */
#rh-theme-overlay.visible { opacity: 1 !important; }
#rh-theme-overlay.visible #rh-theme-box { transform: scale(1) !important; }
        /* ========================================= */
        /* 1. DEFINICJE ZMIENNYCH I MOTYWÓW          */
        /* ========================================= */
        :root {
            /* Domyślny (Light) */
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

        [data-theme="dark"] {
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
[data-theme="sakura"] {
    --bg-gradient: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    --glass-bg: rgba(255, 200, 220, 0.7);
    --glass-border: 1px solid rgba(255, 255, 255, 0.5);
    --glass-shadow: 0 8px 32px 0 rgba(255, 105, 180, 0.2);
    --primary-color: #ff2d55;
    --danger-color: #ff3b30;
    --text-main: #4a001f; /* Ciemny bordowy dla lepszej czytelności na różu */
    --text-secondary: #a35d7a;
    --separator-color: rgba(255, 255, 255, 0.3);
    --input-bg: rgba(255, 255, 255, 0.5);
    --panel-bg: rgba(255, 240, 245, 0.9);
    --hover-item: rgba(255, 182, 193, 0.4);
}
        [data-theme="midnight"] {
            --bg-gradient: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            --glass-bg: rgba(20, 20, 40, 0.75);
            --glass-border: 1px solid rgba(255, 255, 255, 0.15);
            --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
            --primary-color: #bf5af2;
            --danger-color: #ff3b30;
            --text-main: #ffffff;
            --text-secondary: #d1d1d6;
            --separator-color: rgba(255, 255, 255, 0.15);
            --input-bg: rgba(0,0,0,0.3);
            --panel-bg: rgba(30, 30, 60, 0.9);
            --hover-item: rgba(255, 255, 255, 0.15);
        }

        [data-theme="forest"] {
            --bg-gradient: linear-gradient(135deg, #134e5e, #71b280);
            --glass-bg: rgba(20, 40, 30, 0.75);
            --glass-border: 1px solid rgba(255, 255, 255, 0.2);
            --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
            --primary-color: #34c759;
            --danger-color: #ff3b30;
            --text-main: #f0fff4;
            --text-secondary: #cce3de;
            --separator-color: rgba(255, 255, 255, 0.15);
            --input-bg: rgba(0,0,0,0.2);
            --panel-bg: rgba(20, 50, 40, 0.9);
            --hover-item: rgba(255, 255, 255, 0.2);
        }

        /* ========================================= */
        /* 2. FASTENED RABBIT COMPONENTS             */
        /* (Prawy Sidebar, Panel, Licznik, Modale)   */
        /* ========================================= */

        /* Prawy pasek z ikonami (NS, S, TL...) */
        #rabbit-sidebar {
    position: fixed;
    right: 0; /* Przyklejamy do samej krawędzi */
    top: 50%;
    transform: translateY(-50%);
    z-index: 100000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end; /* Przyciski równają do prawej */
    width: 60px; /* Stała szerokość kontenera zapobiega drganiom nagłówka */
}

        .sidebar-btn {
    background: var(--input-bg);
    color: var(--text-main);
    width: 50px; /* Szerokość bazowa */
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 12px 0 0 12px;
    font-weight: 800;
    border: 1px solid var(--separator-color);
    border-right: none;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: -2px 4px 10px rgba(0,0,0,0.1);
}

        .sidebar-btn:hover {
    background: var(--hover-color);
    color: white;
    width: 80px; /* Przycisk rośnie w lewo */
    transform: translateX(0); /* Zostaje na krawędzi, rośnie w głąb ekranu */
}

        /* Prawy Panel Rozwijany */
        #rabbit-panel {
            position: fixed; right: 75px; top: 50%; transform: translateY(-50%) scale(0.95);
            width: 310px; max-height: 85vh; background: var(--panel-bg);
            backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border-radius: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.25);
            display: none; opacity: 0; flex-direction: column;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 99999999; overflow: hidden; font-family: var(--font-stack);
            border: 1px solid var(--glass-border); color: var(--text-main);
        }

        #rabbit-panel.active { opacity: 1; transform: translateY(-50%) scale(1); }

        .panel-header {
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: center; /* Centrowanie tytułu */
    position: relative; /* Potrzebne do pozycjonowania przycisku zamknięcia */
    border-bottom: 1px solid var(--separator-color);
    background: rgba(0, 0, 0, 0.02); /* Delikatne wyróżnienie tła nagłówka */
}

        .close-x {
    position: absolute;
    right: 15px;
    font-size: 18px;
    font-weight: 400;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.close-x:hover {
    color: var(--danger-color);
    transform: scale(1.2);
}

        .panel-header .title {
    font-weight: 800; /* Extra Bold */
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
    flex: 1; /* Zajmuje całą dostępną przestrzeń, by być na środku */
}
        .panel-body { overflow-y: auto; }

        .panel-item {
            padding: 12px 16px; margin: 4px 0; border-radius: 10px;
            cursor: pointer; font-size: 14px; color: var(--text-main);
            transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center;
        }

        .panel-item:hover { background: var(--hover-item); padding-left: 20px; }
        .back-btn { font-weight: 600; color: var(--primary-color); }

        .type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 8px; }
        .type-btn {
            padding: 22px; text-align: center; border-radius: 14px;
            font-weight: 700; font-size: 17px; cursor: pointer;
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
            background: var(--input-bg); border: 1px solid var(--separator-color);
            box-shadow: 0 2px 5px rgba(0,0,0,0.03); color: var(--text-main);
        }
        .type-btn:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }
        .type-btn.ns { color: var(--primary-color); }
        .type-btn.sort { color: #af52de; }
        .panel-body::-webkit-scrollbar { width: 4px; }
        .panel-body::-webkit-scrollbar-thumb { background: var(--separator-color); border-radius: 10px; }

        /* Mini Licznik (Widget) */
        #rh-mini-counter {
            position: fixed; bottom: 25px; right: 25px;
            background: var(--panel-bg); backdrop-filter: blur(10px);
            color: var(--text-main); padding: 12px 20px; border-radius: 16px;
            border: 1px solid var(--separator-color); font-family: var(--font-stack);
            z-index: 999999; cursor: default;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            display: flex; flex-direction: column; gap: 4px;
            overflow: hidden; max-height: 65px; width: 175px;
        }
        #rh-mini-counter:hover {
            max-height: 420px; width: 220px;
            background: var(--input-bg);
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }
        .history-section {
            margin-top: 12px; padding-top: 12px;
            border-top: 1px solid var(--separator-color);
            opacity: 0; transition: opacity 0.3s ease;
        }
        #rh-mini-counter:hover .history-section { opacity: 1; }
        .history-item {
            font-size: 12px; color: var(--text-main) !important; font-family: 'Consolas', monospace;
            padding: 6px 8px; margin: 1px -8px; border-radius: 6px;
            display: block; text-decoration: none; font-weight: 600;
            transition: all 0.2s;
        }
        .history-item:hover { background: var(--hover-item); color: var(--primary-color) !important; padding-left: 12px; }

        /* Przycisk Reset w Widgecie */
        #rh-reset-btn {
            background-color: var(--danger-color);
            color: white; border: none; border-radius: 6px;
            font-size: 10px; font-weight: 700; padding: 3px 8px;
            cursor: pointer; margin-left: auto; opacity: 0; transition: opacity 0.3s;
        }
        #rh-mini-counter:hover #rh-reset-btn { opacity: 1; }
        #rh-reset-btn:hover { filter: brightness(0.9); }

        /* Style Modalów (Reset & Theme) */
        #rh-modal-overlay, #rh-theme-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(3px);
            z-index: 10000000; display: none; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        }
        #rh-modal-box, #rh-theme-box {
            background: var(--panel-bg);
            backdrop-filter: blur(25px);
            width: 320px; padding: 25px; border-radius: 18px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            font-family: var(--font-stack);
            border: 1px solid var(--glass-border);
            transform: scale(0.9); transition: transform 0.3s;
            color: var(--text-main);
        }
        #rh-modal-overlay.visible, #rh-theme-overlay.visible { opacity: 1; }
        #rh-modal-overlay.visible #rh-modal-box, #rh-theme-overlay.visible #rh-theme-box { transform: scale(1); }

        .modal-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text-main); }
        .modal-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.4; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

        .modal-btn {
            border: none; padding: 8px 16px; border-radius: 8px;
            font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-cancel { background: var(--input-bg); color: var(--text-main); border: 1px solid var(--separator-color); }
        .btn-cancel:hover { background: var(--hover-item); }
        .btn-confirm { background: var(--danger-color); color: white; }
        .btn-confirm:hover { filter: brightness(0.9); box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3); }


        /* ========================================= */
        /* 3. UI REMASTERED (Główny wygląd strony)   */
        /* ========================================= */

        * { box-sizing: border-box; }

        body {
            background: var(--bg-gradient) !important;
            font-family: var(--font-stack); color: var(--text-main);
            min-height: 100vh; margin: 0; padding: 0; overflow-x: hidden; font-size: 14px;
            transition: background 0.5s ease, color 0.5s ease;
        }

        a { text-decoration: none; color: inherit; transition: 0.2s; }
        ul { list-style: none; padding: 0; margin: 0; }

        .flex_container {
            display: flex; padding: 20px; gap: 20px; align-items: flex-start;
        }

        /* Lewy Sidebar (Sticky) */
        .slide_left {
            background: var(--glass-bg); backdrop-filter: blur(20px); border: var(--glass-border);
            box-shadow: var(--glass-shadow); border-radius: var(--radius-lg); padding: 10px;
            position: sticky; top: 20px; height: calc(100vh - 40px);
            width: 280px; flex-shrink: 0; overflow-y: auto; scrollbar-width: none;
            animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
            transition: background 0.3s, border-color 0.3s;
        }
        .slide_left::-webkit-scrollbar { display: none; }

        .slide_left li {
            position: relative; border-bottom: 1px solid var(--separator-color); padding: 12px 15px;
            display: flex; align-items: center; flex-wrap: wrap; cursor: pointer; border-radius: 8px;
            transition: background 0.2s;
        }
        .slide_left li:last-child { border-bottom: none; }
        .slide_left li:hover { background: var(--hover-item); }

        /* Ukrywanie zbędnych elementów menu */
        .slide_left > ul > li:nth-child(2) { display: none !important; }
        .slide_left li.active { display: none !important; }

        .slide_left li a::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
        .slide_left li a { font-weight: 500; font-size: 14px; margin-left: 12px; flex: 1; color: inherit; }

        .slide_left i {
            width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
            background: rgba(125, 125, 125, 0.1); border-radius: 8px; color: var(--primary-color); transition: all 0.2s;
        }
        .slide_left li:hover i { transform: scale(1.05); background: var(--primary-color); color: white; }

        .menu_selected_names { width: 100%; font-size: 11px; opacity: 0.8; margin-top: 6px; padding-left: 44px; color: var(--text-secondary); }
        .menu_selected_names a { position: relative; z-index: 2; }

        /* Górny Pasek (Sticky) */
        .content_right { flex: 1; min-width: 0; }

        nav {
            background: var(--glass-bg); backdrop-filter: blur(20px); border: var(--glass-border);
            border-radius: var(--radius-lg); box-shadow: var(--glass-shadow); margin-bottom: 25px;
            padding: 10px 25px; min-height: 60px;
            display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: 20px; z-index: 1000;
            animation: slideInDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
            transition: background 0.3s, border-color 0.3s;
        }
/* --- TOTALNA NAPRAWA PRZYCISKÓW (Submit, Smaller, Default) --- */

/* Selektor uderzający we wszystkie warianty jednocześnie */
.default_button,
.default_button.smaller,
input[type="submit"].default_button,
button.default_button,
.default_panel input[type="submit"],
.default_panel .default_button {
    /* Używamy zmiennej primary-color, która zmienia się z motywem */
    background: var(--primary-color) !important;
    background-image: none !important; /* Usuwa ewentualne gradienty Amazona */
    color: #ffffff !important; /* Napisy zawsze białe dla kontrastu */
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    font-family: var(--font-stack) !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    height: auto !important; /* Fix dla mniejszych przycisków */
    text-transform: none !important;
}

/* Specyficzny fix dla wariantu .smaller */
.default_button.smaller {
    padding: 6px 12px !important;
    font-size: 12px !important;
    border-radius: 8px !important;
}

/* Efekty Hover dla wszystkich przycisków */
.default_button:hover,
.default_button.smaller:hover,
input[type="submit"]:hover {
    filter: brightness(1.1) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

/* Efekt kliknięcia */
.default_button:active {
    transform: translateY(0px) !important;
    filter: brightness(0.9) !important;
}
        .content_right > nav > i { display: none; }
        nav::before {
            content: "Rabbit Hole"; font-family: var(--font-stack); font-weight: 800; font-size: 22px;
            letter-spacing: -1px; background: linear-gradient(135deg, var(--primary-color) 0%, #00c6ff 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: var(--primary-color);
        }
        .right_icons { display: flex; align-items: center; gap: 15px; }
        .right_text p { margin: 0; font-size: 12px; font-weight: 600; text-align: right; color: var(--text-main); }
        .badge_photo { border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 44px; height: 44px; object-fit: cover; }

        .button_link {
            background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);
            border-radius: 20px; padding: 6px 15px; font-size: 12px; font-weight: 600; display: inline-block;
        }
        .button_link:hover { background: var(--primary-color); color: white; }

        .user_warehouse { background: transparent; border: none; font-weight: 700; color: var(--text-main); cursor: pointer; font-size: 14px; font-family: var(--font-stack); }
        .user_warehouse option { background: var(--input-bg); color: var(--text-main); }

        /* Główny Panel Środkowy */
        .default_panel {
            background: var(--panel-bg); backdrop-filter: blur(30px); border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.08); padding: 40px;
            max-width: 900px; margin: 0 auto; animation: fadeIn 0.8s ease-out; position: relative; z-index: 1;
            transition: background 0.3s;
        }
        .panel_head {
            border-bottom: 1px solid var(--separator-color); padding-bottom: 20px; margin-bottom: 30px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .panel_head h2 { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0; }

        /* Przycisk Ostatni Skan + Overlay */
        /* Naprawa dymka Last Scan */
.last_scan_overlay {
    background: var(--panel-bg) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid var(--glass-border) !important;
    color: var(--text-main) !important;
    box-shadow: var(--glass-shadow) !important;
}

.last_scan_overlay table,
.last_scan_overlay tr,
.last_scan_overlay td,
.last_scan_overlay th {
    background: transparent !important; /* Usuwamy tło tabeli */
    color: var(--text-main) !important;
    border-color: var(--separator-color) !important;
}

.last_scan_overlay th {
    color: var(--text-secondary) !important;
}

        /* Formularze i Inputy */
        .input_each { margin-bottom: 25px; position: relative; }
        .default_label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.5px; }
        input[type="text"], .default_input {
            width: 100%; background: var(--input-bg); border: 1px solid var(--separator-color); border-radius: 12px; padding: 14px 16px;
            font-size: 16px; color: var(--text-main); transition: all 0.2s; font-family: var(--font-stack);
        }
        input[type="text"]:focus, .default_input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15); }

        .checkbox-toolbar fieldset { border: none; padding: 0; margin: 10px 0 0 0; display: flex; gap: 10px; flex-wrap: wrap; }
        .checkbox-toolbar input[type="radio"] { display: none; }
        .checkbox-toolbar label {
            background: var(--input-bg); border: 1px solid var(--separator-color); padding: 12px 20px; border-radius: 12px;
            font-size: 14px; font-weight: 500; color: var(--text-main); cursor: pointer; transition: all 0.2s;
        }
        .checkbox-toolbar label:hover { border-color: var(--primary-color); background: var(--hover-item); transform: translateY(-2px); }
        .checkbox-toolbar input[type="radio"]:checked + label { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3); }

        input[type="submit"], .default_button {
            background: linear-gradient(135deg, #007aff 0%, #005ecb 100%); color: white; border: none; border-radius: 14px;
            padding: 16px 32px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; font-family: var(--font-stack);
            transition: all 0.3s; box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
        }
        input[type="submit"]:hover, .default_button:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(0, 122, 255, 0.4); }

        /* Kafelki Procesów */
        .group_panel { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 40px; border-top: 1px solid var(--separator-color); padding-top: 20px; }
        .group_panel h3 { width: 100%; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin: 0 0 15px 0; font-weight: 700; }
        .process_panel { flex: 1 1 calc(33.333% - 15px); min-width: 200px; }
        .process_panel a {
            display: flex; align-items: center; justify-content: center; height: 100%; min-height: 70px;
            background: var(--input-bg); border: 1px solid var(--separator-color); border-radius: 16px; padding: 15px 20px;
            font-weight: 600; font-size: 14px; text-align: center; color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: all 0.3s;
        }
        .process_panel a:hover { border-color: var(--primary-color); color: var(--primary-color); background: var(--hover-item); transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0, 122, 255, 0.15); }

        .process_panel_vertical { margin-bottom: 10px; display: block; }
        .process_panel_vertical a {
            display: flex; align-items: center; padding: 15px 25px; background: var(--input-bg); border: 1px solid var(--separator-color); border-radius: 16px;
            text-decoration: none; color: var(--text-main); font-weight: 600; font-size: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: all 0.2s;
        }
        .process_panel_vertical a:hover { border-color: var(--primary-color); color: var(--primary-color); background: var(--hover-item); transform: translateX(5px); box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1); }

        /* Flash Messages */
        .flash { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--panel-bg); backdrop-filter: blur(20px); border-radius: 50px; padding: 12px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); font-weight: 600; z-index: 9999; color: var(--text-main); }
        .flash.success { color: #34c759; border: 1px solid #34c759; }

        /* Tabele */
        table { border-collapse: collapse; width: 100%; }
        .default_table { width: 100%; border-spacing: 0 8px; border-collapse: separate; }
        .default_table th { text-align: left; padding: 10px 15px; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
        .default_table td { background: var(--input-bg); padding: 15px; font-size: 14px; border-top: 1px solid var(--separator-color); border-bottom: 1px solid var(--separator-color); color: var(--text-main); }
        .default_table td:first-child { border-left: 1px solid var(--separator-color); border-radius: 10px 0 0 10px; }
        .default_table td:last-child { border-right: 1px solid var(--separator-color); border-radius: 0 10px 10px 0; }

        hr { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    `);

    const faviconUrl = 'https://icons.iconarchive.com/icons/icons8/windows-8/512/Holidays-Easter-Rabbit-icon.png';
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = faviconUrl;
    document.head.appendChild(link);

    const UPDATE_URL = "https://raw.githubusercontent.com/SolveCat/ps/main/Fastened%20Rabbit.user.js";
    const CHECK_INTERVAL = 10 * 60 * 100;
    const STORAGE_KEY = 'tm_last_update_check';
    const log = (msg, type = 'info') => {
        const styles = {
            info: 'color: #007aff; font-weight: bold;',
            success: 'color: #34c759; font-weight: bold;',
            error: 'background: #ff3b30; color: white; padding: 1px 4px; border-radius: 3px;',
            warn: 'color: #ff9500; font-weight: bold;'
        };
        const consoleMethod = type === 'error' ? 'error' : (type === 'warn' ? 'warn' : 'log');
        console[consoleMethod](`%c[Fastened Rabbit] %c${msg}`, styles.info, styles[type] || '');
    };

    log("Krolik przyspieszony!", "success");
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
        /* Styl Loadera */
#rh-loader {
    position: fixed;
    top: 20px;
    right: 80px; /* Obok przycisku powiadomień */
    background: var(--glass-bg);
    backdrop-filter: blur(15px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 8px 15px;
    display: none; /* Ukryty domyślnie */
    align-items: center;
    gap: 10px;
    z-index: 1000001;
    box-shadow: var(--glass-shadow);
    font-family: var(--font-stack);
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-color);
    animation: slideInDown 0.4s ease;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--separator-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
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
    const COLORS = { "NonSort": "#007aff", "Sortable": "#ff9500", "TeamLift": "#ff3b30", "MarketPlace": "#af52de" };
const RED_PHONE_LINKS = {
    "NS": {
        "Nienaruszona": "/result?category_id=522&function_id=238&group_id=826&task_id=5514",
        "Uszkodzona": "/result?category_id=502&function_id=238&group_id=791&task_id=5367",
        "Nieobecna": "/result?category_id=524&function_id=238&group_id=826&task_id=5514"
    },
    "Sort": {
        "Nienaruszona": "/result?category_id=501&function_id=237&group_id=791&task_id=5367",
        "Uszkodzona": "/result?category_id=502&function_id=237&group_id=791&task_id=5367",
        "Nieobecna": "/result?category_id=524&function_id=237&group_id=826&task_id=5514"
    }
};
    // Funkcja pomocnicza do bezpiecznego przypisywania do okna strony
const exportToWindow = (name, fn) => {
    if (typeof unsafeWindow !== 'undefined') {
        unsafeWindow[name] = fn;
    }
    window[name] = fn;
};

// --- REJESTRACJA FUNKCJI W KONTEKŚCIE STRONY ---
exportToWindow('renderRedPhoneFlow', function() {
    if (!panel) return;
    panel.innerHTML = `
        <div class="panel-header"><span class="title">Wybierz Proces</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="location.reload()">↩ Anuluj</div>
            <div class="type-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px;">
                <div class="type-btn ns" style="padding:20px; text-align:center; background:var(--input-bg); border-radius:12px; cursor:pointer; font-weight:800; color:#007aff; border:1px solid var(--separator-color);" onclick="renderRedPhoneFlow_Step2('NS')">NS</div>
                <div class="type-btn sort" style="padding:20px; text-align:center; background:var(--input-bg); border-radius:12px; cursor:pointer; font-weight:800; color:#ff9500; border:1px solid var(--separator-color);" onclick="renderRedPhoneFlow_Step2('Sort')">Sort</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
    openPanel();
});

exportToWindow('renderRedPhoneFlow_Step2', function(type) {
    if (!panel) return;
    panel.innerHTML = `
        <div class="panel-header"><span class="title">Fabryczna? (${type})</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="renderRedPhoneFlow()">↩ Wstecz</div>
            <div class="seal-grid">
                <div class="seal-btn green" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Nienaruszona'])}'">Nienaruszona</div>
                <div class="seal-btn orange" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Uszkodzona'])}'">Uszkodzona</div>
                <div class="seal-btn red" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Nieobecna'])}'">Nie jest obecna</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
});
    let MENU = {}, MP_LINKS = {};

    const sidebar = document.createElement("div");
    sidebar.id = "rabbit-sidebar";
    const panel = document.createElement("div");
    panel.id = "rabbit-panel";

    let isInitialized = false;
// Pomocnik do eksportu funkcji
const exportFn = (name, fn) => {
    if (typeof unsafeWindow !== 'undefined') unsafeWindow[name] = fn;
    window[name] = fn;
};

// --- WYBÓR TYPU DLA ZWYKŁYCH LINKÓW MP (NS/SORT) ---
exportFn('renderTypeSelection', function(reportName) {
    const links = MP_LINKS[reportName];
    if (!links) return;
    panel.innerHTML = `
        <div class="panel-header"><span class="title">${reportName}</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="showMarketPlace()">↩ Wstecz</div>
            <div class="type-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px;">
                <div class="type-btn" style="padding:20px; text-align:center; background:var(--input-bg); border-radius:12px; cursor:pointer; font-weight:800; color:#007aff; border:1px solid var(--separator-color);" onclick="window.location.href='${getFullUrl(links.NS)}'">NS</div>
                <div class="type-btn" style="padding:20px; text-align:center; background:var(--input-bg); border-radius:12px; cursor:pointer; font-weight:800; color:#ff9500; border:1px solid var(--separator-color);" onclick="window.location.href='${getFullUrl(links.Sort)}'">Sort</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
});

// --- WYBÓR PLOMBY (KROK FINALNY) ---
exportFn('renderRedPhoneFlow_Step2', function(type) {
    panel.innerHTML = `
        <div class="panel-header"><span class="title">Fabryczna? (${type})</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="location.reload()">↩ Anuluj</div>
            <div class="seal-grid">
                <div class="seal-btn green" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Nienaruszona'])}'">Nienaruszona</div>
                <div class="seal-btn orange" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Uszkodzona'])}'">Uszkodzona</div>
                <div class="seal-btn red" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Nieobecna'])}'">Nie jest obecne</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
});

// --- WYBÓR PROCESU DLA MP RED PHONE ---
exportFn('renderRedPhoneFlow', function() {
    panel.innerHTML = `
        <div class="panel-header"><span class="title">Wybierz Proces</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="showMarketPlace()">↩ Wstecz</div>
            <div class="type-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px;">
                <div class="type-btn" style="padding:20px; text-align:center; background:var(--input-bg); border-radius:12px; cursor:pointer; font-weight:800; color:#007aff; border:1px solid var(--separator-color);" onclick="renderRedPhoneFlow_Step2('NS')">NS</div>
                <div class="type-btn" style="padding:20px; text-align:center; background:var(--input-bg); border-radius:12px; cursor:pointer; font-weight:800; color:#ff9500; border:1px solid var(--separator-color);" onclick="renderRedPhoneFlow_Step2('Sort')">Sort</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
});

// --- GŁÓWNE MENU KATEGORII ---
exportFn('showCategory', function(cat) {
    const items = MENU[cat] || [];
    panel.innerHTML = `
        <div class="panel-header"><span class="title" style="color:${COLORS[cat]}">${cat}</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            ${items.map(([name, path]) => {
                if (name === "SEP") return `<div class="panel-separator">${path}</div>`;
                const isRedPhone = name.toLowerCase().includes("red phone");
                let action;
                if (isRedPhone) {
                    const type = (cat === "NSort" || cat === "TeamLift") ? "NS" : "Sort";
                    action = `renderRedPhoneFlow_Step2('${type}')`;
                } else {
                    action = `window.location.href='${getFullUrl(path)}'`;
                }
                return `<div class="panel-item" onclick="${action}">${name} ${isRedPhone ? '<span class="arrow">❯</span>' : ''}</div>`;
            }).join('')}
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
    openPanel();
});

// --- MENU MARKETPLACE ---
exportFn('showMarketPlace', function() {
    panel.innerHTML = `
        <div class="panel-header"><span class="title" style="color:${COLORS.MarketPlace}">MarketPlace</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            ${Object.keys(MP_LINKS).map(name => {
                const isRedPhone = name.toLowerCase().includes("red phone");
                const action = isRedPhone ? `renderRedPhoneFlow()` : `renderTypeSelection('${name}')`;
                return `<div class="panel-item" onclick="${action}">${name} <span class="arrow">❯</span></div>`;
            }).join('')}
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
    openPanel();
});
async function init() {

    if (isInitialized) return;
    isInitialized = true;

    log("Inicjalizacja systemu Fastened Rabbit...", 'info');

    // 1. Loader UI
    const loader = document.createElement("div");
    loader.id = "rh-loader";
    loader.innerHTML = `<div class="rh-spinner"></div><span>Pobieranie danych...</span>`;
    document.body.appendChild(loader);

    if (typeof restorePageFromCache === 'function') {
        restorePageFromCache();
    }

    checkUpdate();

    try {
        const response = await new Promise((res, rej) =>
            GM_xmlhttpRequest({
                method: "GET",
                url: CONFIG_URL,
                onload: res,
                onerror: rej,
                timeout: 5000 // Timeout, żeby nie blokować UI przy problemach z GitHubem
            })
        );

        const config = JSON.parse(response.responseText);
        MENU = config.MENU;
        MP_LINKS = config.MP_LINKS;

        log("Konfiguracja załadowana pomyślnie!", 'success');
        renderSidebar();

    } catch (e) {
        log("Błąd ładowania configlinks.json (korzystam z pustego menu): " + e, 'error');
        renderSidebar();
    }
    const fastObserver = new MutationObserver(() => {
        if (typeof nukeOriginalStyles === 'function') nukeOriginalStyles();
        if (typeof cleanHeaderTitle === 'function') cleanHeaderTitle();
    });

    fastObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    document.addEventListener('change', (e) => {
        if (['399', '402', '404'].includes(e.target.id)) {
            if (typeof saveCurrentPageToCache === 'function') {
                saveCurrentPageToCache();
            }
        }
    });

    log("System gotowy do pracy.", "success");
}
    function renderSidebar() {
        // Tworzymy kontener nagłówka, jeśli nie istnieje
        if (!document.getElementById("rabbit-sidebar-header")) {
            const headerContainer = document.createElement("div");
            headerContainer.id = "rabbit-sidebar-header-container";

            const headerBadge = document.createElement("span");
            headerBadge.id = "rabbit-sidebar-header";
            headerBadge.textContent = "SKRÓTY";

            headerContainer.appendChild(headerBadge);
            sidebar.prepend(headerContainer);
        }

        document.body.appendChild(sidebar);
        document.body.appendChild(panel);

        const cats = { "NonSort": "NS", "Sortable": "S", "TeamLift": "TL", "MarketPlace": "MP" };

        // Czyścimy przyciski przed ponownym renderem (żeby uniknąć duplikatów)
        const existingBtns = sidebar.querySelectorAll('.sidebar-btn');
        existingBtns.forEach(b => b.remove());

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

// --- 1. FUNKCJA DLA KATEGORII GŁÓWNYCH (NonSort, Sortable, TeamLift) ---
    window.renderRedPhoneFlow = function() {
    panel.innerHTML = `
        <div class="panel-header"><span class="title">Wybierz Proces</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="location.reload()">↩ Anuluj</div>
            <div class="type-grid">
                <div class="type-btn ns" onclick="window.renderSealSelection('NS')">NS</div>
                <div class="type-btn sort" onclick="window.renderSealSelection('Sort')">Sort</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
    openPanel();
};

window.renderSealSelection = function(type) {
    panel.innerHTML = `
        <div class="panel-header"><span class="title">Plomba (${type})</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="window.renderRedPhoneFlow()">↩ Wstecz</div>
            <div class="seal-grid">
                <div class="seal-btn green" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Nienaruszona'])}'">Nienaruszona</div>
                <div class="seal-btn orange" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Uszkodzona'])}'">Uszkodzona</div>
                <div class="seal-btn red" onclick="window.location.href='${getFullUrl(RED_PHONE_LINKS[type]['Nieobecna'])}'">Nie jest obecne</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
};
window.showCategory = function(cat) {
    const items = MENU[cat] || [];
    panel.innerHTML = `
        <div class="panel-header">
            <span class="title" style="color:${COLORS[cat]}">${cat}</span>
            <span class="close-x">✕</span>
        </div>
        <div class="panel-body">
            ${items.map(([name, path]) => {
                if (name === "SEP") return `<div class="panel-separator">${path}</div>`;

                const isRedPhone = name.toLowerCase().includes("redphone");

                let clickAction;
                if (isRedPhone) {
                    const type = (cat === "NonSort" || cat === "TeamLift") ? "NS" : "Sort";
                    clickAction = `renderRedPhoneFlow_Step2('${type}')`;
                } else {
                    clickAction = `window.location.href='${getFullUrl(path)}'`;
                }

                return `<div class="panel-item" onclick="${clickAction}">${name} ${isRedPhone ? '<span class="arrow">❯</span>' : ''}</div>`;
            }).join('')}
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
    openPanel();
};

// --- 2. FUNKCJA DLA MARKETPLACE ---
window.showMarketPlace = function() {
    const keys = Object.keys(MP_LINKS);
    panel.innerHTML = `
        <div class="panel-header">
            <span class="title" style="color:${COLORS.MarketPlace}">MarketPlace</span>
            <span class="close-x">✕</span>
        </div>
        <div class="panel-body">
            ${keys.map(name => {
                const isRedPhone = name.toLowerCase().includes("red phone");
                // Red Phone w MP zawsze pyta o proces (NS/Sort)
                const clickAction = isRedPhone
                    ? `renderRedPhoneFlow()`
                    : `renderTypeSelection('${name}')`;

                return `<div class="panel-item" onclick="${clickAction}">${name} <span class="arrow">❯</span></div>`;
            }).join('')}
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
    openPanel();
};

// --- POMOCNICZA FUNKCJA DLA TYPÓW MP (NIE-RED PHONE) ---
window.renderTypeSelection = function(reportName) {
    const links = MP_LINKS[reportName];
    panel.innerHTML = `
        <div class="panel-header"><span class="title">${reportName}</span><span class="close-x">✕</span></div>
        <div class="panel-body">
            <div class="panel-item back-btn" onclick="window.showMarketPlace()">↩ Wstecz</div>
            <div class="type-grid">
                <div class="type-btn ns" onclick="window.location.href='${getFullUrl(links.NS)}'">NS</div>
                <div class="type-btn sort" onclick="window.location.href='${getFullUrl(links.Sort)}'">Sort</div>
            </div>
        </div>`;
    panel.querySelector(".close-x").onclick = hidePanel;
};
const PAGE_CACHE_KEY = 'rh_page_history_cache';

const saveCurrentPageToCache = () => {
    const currentUrl = window.location.href;
    if (currentUrl.endsWith('.dev/') || currentUrl.includes('/dashboard')) return;

    let cache = JSON.parse(sessionStorage.getItem(PAGE_CACHE_KEY) || '{}');

    const pageData = {
        timestamp: Date.now(),
        fields: {
            '399': document.getElementById('399')?.value || '',
            '402': document.getElementById('402')?.value || '',
            '404': document.getElementById('404')?.value || '',
            'header': document.querySelector('div.panel_head_box:nth-child(2) > h2:nth-child(1)')?.textContent || ''
        }
    };

    cache[currentUrl] = pageData;
    const keys = Object.keys(cache);
    if (keys.length > 10) {
        const oldestKey = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp)[0];
        delete cache[oldestKey];
    }

    sessionStorage.setItem(PAGE_CACHE_KEY, JSON.stringify(cache));
};

const restorePageFromCache = () => {
    const currentUrl = window.location.href;
    const cache = JSON.parse(sessionStorage.getItem(PAGE_CACHE_KEY) || '{}');




};

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

        if (totalEl) totalEl.innerText = `${hourly}/h~`;
        if (hourEl) hourEl.innerText = `Wysłane: ${total}~`;
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
const lpnCache = new Map();

function setupLPNListener() {
    const input399 = document.getElementById('399');
    const loaderEl = document.getElementById('rh-loader');

    const fields = {
        orderId: document.getElementById('402'),
        associate: document.getElementById('404')
    };

    if (!input399) return;

    const _0x4a1 = "aHR0cHM6Ly9ldS1jcmV0ZmMtdG9vbHMtZHViLmR1Yi5wcm94eS5hbWF6b24uY29tL2dldFJldHVyblVuaXREYXRhP2xwbj0=";
    const _0x4a2 = "JmxvY2FsZT1wbF9QTCZpc0F1dGhvcml6ZWRUb1ZpZXdQcmltYXJ5R3JhZGluZ0RhdGE9dHJ1ZQ==";

    input399.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;

        const lpn = input399.value.trim();
        if (!lpn) return;

        currentLPN = lpn;

        // --- SPRAWDZANIE CACHE ---
        if (lpnCache.has(lpn)) {
            log(`Pobieranie danych z CACHE dla LPN: ${lpn}`, 'success');
            fillFields(lpnCache.get(lpn), fields);
            return;
        }

        log(`Pobieranie danych z SIECI dla LPN: ${lpn}`, 'info');
        if (loaderEl) loaderEl.style.display = 'flex';

        GM_xmlhttpRequest({
            method: "GET",
            url: atob(_0x4a1) + lpn + atob(_0x4a2),
            withCredentials: true,
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            onload: (res) => {
                if (loaderEl) loaderEl.style.display = 'none';

                try {
                    const data = JSON.parse(res.responseText);
                    if (!data || !data[0]) return;
const el408 = document.getElementById('408');
if (el408) {
    el408.value = "N/A";
    el408.dispatchEvent(new Event('input', { bubbles: true }));
    el408.dispatchEvent(new Event('change', { bubbles: true }));
    log("Pole 408 ustawione na N/A", "info");
}
                    const d = data[0];
                    const socratesList = d?.socratesActivityDataList || [];
                    // Ekstrakcja danych
                    let auditAssociate = null;
                    let escalatedAssociate = null;
                    const auditPattern = /audit/i;

                    for (const entry of socratesList) {
                        if (!auditAssociate && auditPattern.test(entry.sortCode || "")) auditAssociate = entry.associate;
                        if (!escalatedAssociate && entry.activityStatus === "ESCALATED") escalatedAssociate = entry.associate;
                        if (auditAssociate && escalatedAssociate) break;
                    }

                    const result = {
                        oid: d?.packageAttributes?.actualPackageAttributes?.orderId,
                        audit: auditAssociate,
                        escalated: escalatedAssociate,
                        fallback: d?.socratesLastActivityData?.associate || (socratesList[0]?.associate || "")
                    };
                    lpnCache.set(lpn, result);

                    fillFields(result, fields);

                } catch (err) { log("Błąd JSON: " + err, "error"); }
            },
            onerror: () => { if (loaderEl) loaderEl.style.display = 'none'; }
        });
    });
}

function fillFields(data, fields) {
    const headerEl = document.querySelector('div.panel_head_box:nth-child(2) > h2:nth-child(1)');
    const isAuditPage = headerEl?.textContent.toLowerCase().includes("audyt");

    // Order ID
    if (data.oid && fields.orderId) {
        fields.orderId.value = data.oid;
        fields.orderId.dispatchEvent(new Event('input', { bubbles: true }));
        fields.orderId.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Associate
    if (fields.associate) {
        fields.associate.value = isAuditPage ? (data.audit || "") : (data.escalated || data.fallback);
        fields.associate.dispatchEvent(new Event('input', { bubbles: true }));
        fields.associate.dispatchEvent(new Event('change', { bubbles: true }));
    }
}
    

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

    // --- LOGIKA MODALA ---
    function createResetModal() {
        const overlay = document.createElement('div');
        overlay.id = 'rh-modal-overlay';
        overlay.innerHTML = `
            <div id="rh-modal-box">
                <div class="modal-title">Reset statystyk</div>
                <div class="modal-desc">Czy na pewno chcesz wyzerować licznik, statystyki godzinowe oraz całą historię LPN? Tej operacji nie można cofnąć.</div>
                <div class="modal-actions">
                    <button class="modal-btn btn-cancel" id="rh-modal-cancel">Anuluj</button>
                    <button class="modal-btn btn-confirm" id="rh-modal-confirm">Resetuj</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = () => {
            overlay.classList.remove('visible');
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        };

        document.getElementById('rh-modal-cancel').onclick = close;
        document.getElementById('rh-modal-confirm').onclick = () => {
            // Zerowanie danych
            GM_setValue('rh_count', 0);
            GM_setValue('rh_timestamps', []);
            GM_setValue('rh_history', []);
            updateDisplay();
            close();
        };

        // Zamykanie kliknięciem w tło
        overlay.onclick = (e) => { if (e.target === overlay) close(); };

        return {
            open: () => {
                overlay.style.display = 'flex';
                // Małe opóźnienie dla animacji CSS
                setTimeout(() => { overlay.classList.add('visible'); }, 10);
            }
        };
    }
// --- LOGIKA MOTYWÓW ---
    function createThemeModal() {
    if (document.getElementById('rh-theme-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'rh-theme-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);backdrop-filter:blur(3px);z-index:10000001;display:none;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';

    overlay.innerHTML = `
        <div id="rh-theme-box" style="background:var(--panel-bg);padding:25px;border-radius:24px;width:340px;box-shadow:0 25px 50px rgba(0,0,0,0.3);border:1px solid var(--glass-border);font-family:var(--font-stack);transform:scale(0.8);transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="color:var(--text-main);font-size:18px;font-weight:700;margin-bottom:20px;text-align:center;">Wybierz motyw</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <button class="theme-btn" data-set="light" style="background:linear-gradient(135deg, #f5f7fa, #c3cfe2);color:#333;border:none;padding:15px;border-radius:12px;cursor:pointer;font-weight:600;">Jasny</button>
                <button class="theme-btn" data-set="dark" style="background:linear-gradient(135deg, #2c3e50, #000000);color:#fff;border:none;padding:15px;border-radius:12px;cursor:pointer;font-weight:600;">Ciemny</button>
                <button class="theme-btn" data-set="midnight" style="background:linear-gradient(135deg, #0f0c29, #302b63, #24243e);color:#fff;border:none;padding:15px;border-radius:12px;cursor:pointer;font-weight:600;">Midnight</button>
                <button class="theme-btn" data-set="sakura" style="background:linear-gradient(135deg, #ff9a9e, #fecfef);color:#4a001f;border:none;padding:15px;border-radius:12px;cursor:pointer;font-weight:600;">Sakura</button>
                <button class="theme-btn" data-set="forest" style="background:linear-gradient(135deg, #134e5e, #71b280);color:#fff;border:none;padding:15px;border-radius:12px;cursor:pointer;font-weight:600;">Leśny</button>
            </div>
            <button id="rh-theme-close" style="width:100%;margin-top:20px;padding:12px;border:none;background:var(--hover-item);border-radius:12px;cursor:pointer;font-weight:600;color:var(--text-main);">Zamknij</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
        overlay.classList.remove('visible');
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    };

    overlay.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => {
            const theme = btn.getAttribute('data-set');
            document.body.setAttribute('data-theme', theme);
            GM_setValue('rh_theme', theme);
            close();
        };
    });

    document.getElementById('rh-theme-close').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    return {
        open: () => {
            overlay.style.display = 'flex';
            setTimeout(() => { overlay.classList.add('visible'); }, 10);
        }
    };
}
    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupLPNListener();

        const modal = createResetModal();

        const div = document.createElement('div');
        div.id = 'rh-mini-counter';
        // Dodano przycisk Reset w nagłówku
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; font-weight:bold; width:100%">
                <span style="width:8px; height:8px; background:#00b894; border-radius:50%"></span>
                <span id="rh-count-total">0/h~</span>
                <button id="rh-reset-btn">Reset</button>
            </div>
            <div id="rh-count-hour" style="font-size:11px; margin: 4px 0 10px 16px">Wysłane: 0</div>
            <div class="history-section">
                <div style="font-size:10px; font-weight:900; opacity:0.5; margin-bottom:5px">OSTATNIE RAPORTY:</div>
                <div id="rh-history-list"></div>
            </div>`;
        document.body.appendChild(div);

        // Obsługa kliknięcia w przycisk Reset
        document.getElementById('rh-reset-btn').onclick = (e) => {
            e.stopPropagation(); // Zapobiega innym akcjom
            modal.open();
        };

        updateDisplay();
        // Inicjalizacja motywu
        const savedTheme = GM_getValue('rh_theme', 'light');
        document.body.setAttribute('data-theme', savedTheme);
        const themeModal = createThemeModal();

        // Dodanie przycisku do lewego menu
        const sidebarList = document.querySelector('.slide_left ul');
        if (sidebarList) {
            const li = document.createElement('li');
            // Dodajemy klasę, żeby style CSS na niego zadziałały (np. hover)
            li.innerHTML = '<i class="fas fa-palette"></i><a href="#">Motyw</a>';
            li.style.cursor = 'pointer';
            li.onclick = (e) => {
                e.preventDefault();
                themeModal.open();
            };
            sidebarList.appendChild(li);
        }
    });

// Import FontAwesome
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);

    // Czyszczenie stylów
    // --- POPRAWIONE USUWANIE STYLÓW ---
    // Optymalizacja czyszczenia stylów
const nukeOriginalStyles = () => {
    // Pobieramy tylko te, których jeszcze nie wyłączyliśmy
    const links = document.querySelectorAll('link[rel="stylesheet"]:not([disabled])');
    links.forEach(link => {
        if (link.href && link.href.includes('/assets/') && !link.href.includes('font-awesome')) {
            link.disabled = true;
            link.media = 'none';
        }
    });
};

// Optymalizacja czyszczenia nagłówka - wykonaj tylko gdy tekst się zmieni
let lastCleanedText = "";
const cleanHeaderTitle = () => {
    const headerElement = document.querySelector('div.panel_head_box:nth-child(2) > h2:nth-child(1)');
    if (headerElement && headerElement.textContent !== lastCleanedText) {
        const cleaned = headerElement.textContent.replace(/^\d{2}-[A-Z]\s+/, '');
        if (headerElement.textContent !== cleaned) {
            headerElement.textContent = cleaned;
            lastCleanedText = cleaned;
            log(`Oczyszczono nagłówek: ${cleaned}`, 'success');
        }
    }
};

// Wydajny obserwator - odpalany tylko gdy zmienia się struktura head lub body
const fastObserver = new MutationObserver(() => {
    nukeOriginalStyles();
    cleanHeaderTitle();
});

fastObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Uruchamiamy czyszczenie z lekkim opóźnieniem (setTimeout),
    // aby pozwolić skryptom walidacyjnym zainicjować się poprawnie.
    const styleObserver = new MutationObserver((mutations) => {
        // Używamy requestAnimationFrame dla płynności i braku kolizji z JS
        requestAnimationFrame(nukeOriginalStyles);
        cleanHeaderTitle();
    });


    styleObserver.observe(document.documentElement, { childList: true, subtree: true });

    const css = `
        :root {
            --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            --glass-bg: rgba(255, 255, 255, 0.75);
            --glass-border: 1px solid rgba(255, 255, 255, 0.6);
            --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            --primary-color: #007aff;
            --text-main: #1d1d1f;
            --text-secondary: #86868b;
            --separator-color: rgba(0, 0, 0, 0.06);
            --radius-lg: 24px;
            --font-stack: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
        }

        /* --- UKRYWANIE ELEMENTÓW --- */
        .slide_left > ul > li:nth-child(2) { display: none !important; }
        .slide_left li.active { display: none !important; }

        * { box-sizing: border-box; }
        body {
            background: var(--bg-gradient); font-family: var(--font-stack); color: var(--text-main);
            min-height: 100vh; margin: 0; padding: 0; overflow-x: hidden; font-size: 14px;
        }
        a { text-decoration: none; color: inherit; transition: 0.2s; }
        ul { list-style: none; padding: 0; margin: 0; }

        .flex_container {
            display: flex; padding: 20px; gap: 20px;
            align-items: flex-start; /* Ważne dla sticky! */
        }

        /* --- SIDEBAR (STICKY) --- */
        .slide_left {
            background: var(--glass-bg); backdrop-filter: blur(20px); border: var(--glass-border);
            box-shadow: var(--glass-shadow); border-radius: var(--radius-lg); padding: 10px;

            position: sticky; top: 20px; height: calc(100vh - 40px);
            width: 280px; flex-shrink: 0; overflow-y: auto; scrollbar-width: none;

            animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .slide_left::-webkit-scrollbar { display: none; }

        .slide_left li {
            position: relative; border-bottom: 1px solid var(--separator-color); padding: 12px 15px;
            display: flex; align-items: center; flex-wrap: wrap; cursor: pointer; border-radius: 8px;
        }
        .slide_left li:last-child { border-bottom: none; }
        .slide_left li:hover { background: rgba(255, 255, 255, 0.5); }

        .slide_left li a::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
        .slide_left li a { font-weight: 500; font-size: 14px; margin-left: 12px; flex: 1; color: inherit; }

        .slide_left i {
            width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
            background: rgba(0, 122, 255, 0.1); border-radius: 8px; color: var(--primary-color); transition: all 0.2s;
        }
        .slide_left li:hover i { transform: scale(1.05); }

        .menu_selected_names { width: 100%; font-size: 11px; opacity: 0.8; margin-top: 6px; padding-left: 44px; color: var(--text-secondary); }
        .menu_selected_names a { position: relative; z-index: 2; }


        /* --- NAV (STICKY) --- */
        .content_right { flex: 1; min-width: 0; }

        nav {
            background: var(--glass-bg); backdrop-filter: blur(20px); border: var(--glass-border);
            border-radius: var(--radius-lg); box-shadow: var(--glass-shadow); margin-bottom: 25px;
            padding: 10px 25px; min-height: 60px;
            display: flex; align-items: center; justify-content: space-between;

            /* STICKY LOGIC */
            position: sticky;
            top: 20px;
            z-index: 1000; /* Musi być wyżej niż reszta treści, żeby szkło działało */

            animation: slideInDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .content_right > nav > i { display: none; }
        nav::before {
            content: "Rabbit Hole"; font-family: var(--font-stack); font-weight: 800; font-size: 22px;
            letter-spacing: -1px; background: linear-gradient(135deg, var(--primary-color) 0%, #00c6ff 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: var(--primary-color);
        }
        .right_icons { display: flex; align-items: center; gap: 15px; }
        .right_text p { margin: 0; font-size: 12px; font-weight: 600; text-align: right; }
        .badge_photo { border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 44px; height: 44px; object-fit: cover; }
        .button_link {
            background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color);
            border-radius: 20px; padding: 6px 15px; font-size: 12px; font-weight: 600; display: inline-block;
        }
        .button_link:hover { background: var(--primary-color); color: white; }
        .user_warehouse { background: transparent; border: none; font-weight: 700; color: var(--text-main); cursor: pointer; font-size: 14px; font-family: var(--font-stack); }

        /* --- GŁÓWNY PANEL --- */
        .default_panel {
            background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.8);
            border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.08); padding: 40px;
            max-width: 900px; margin: 0 auto; animation: fadeIn 0.8s ease-out; position: relative; z-index: 1;
        }
        .panel_head {
            border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 20px; margin-bottom: 30px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .panel_head h2 { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0; }

        /* Last Scan */
        .last_scan { position: relative; display: inline-block; z-index: 500; }
        .last_scan button {
            background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 8px;
            cursor: pointer; color: var(--text-secondary); font-weight: 600; transition: all 0.2s;
        }
        .last_scan button:hover { border-color: var(--primary-color); color: var(--primary-color); background: #f0f7ff; }
        .last_scan_overlay {
            position: absolute; top: 110%; right: 0; width: max-content; min-width: 250px;
            background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(20px); border: 1px solid rgba(0,0,0,0.1);
            border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.15); padding: 15px; z-index: 1000;
            opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .last_scan_overlay[style*="display: block"] { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; display: block !important; }
        .last_scan_overlay table { width: 100%; font-size: 12px; }
        .last_scan_overlay th { text-align: left; color: #888; padding: 4px; }
        .last_scan_overlay td { padding: 4px; border-bottom: 1px solid #eee; }

        /* --- INNE ELEMENTY --- */
        .input_each { margin-bottom: 25px; position: relative; }
        .default_label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.5px; }
        input[type="text"], .default_input {
            width: 100%; background: white; border: 1px solid #e1e1e6; border-radius: 12px; padding: 14px 16px;
            font-size: 16px; color: var(--text-main); transition: all 0.2s; font-family: var(--font-stack);
        }
        input[type="text"]:focus, .default_input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15); }

        .checkbox-toolbar fieldset { border: none; padding: 0; margin: 10px 0 0 0; display: flex; gap: 10px; flex-wrap: wrap; }
        .checkbox-toolbar input[type="radio"] { display: none; }
        .checkbox-toolbar label {
            background: white; border: 1px solid #e1e1e6; padding: 12px 20px; border-radius: 12px;
            font-size: 14px; font-weight: 500; color: var(--text-main); cursor: pointer; transition: all 0.2s;
        }
        .checkbox-toolbar label:hover { border-color: var(--primary-color); background: #f0f7ff; transform: translateY(-2px); }
        .checkbox-toolbar input[type="radio"]:checked + label { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3); }

        .default_button,
input[type="submit"] {
    background: var(--primary-color) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(255, 45, 85, 0.3) !important;
}
        input[type="submit"]:hover, .default_button:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(0, 122, 255, 0.4); }

        .group_panel { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 40px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px; }
        .group_panel h3 { width: 100%; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin: 0 0 15px 0; font-weight: 700; }
        .process_panel { flex: 1 1 calc(33.333% - 15px); min-width: 200px; }
        .process_panel a {
            display: flex; align-items: center; justify-content: center; height: 100%; min-height: 70px;
            background: white; border: 1px solid #e1e1e6; border-radius: 16px; padding: 15px 20px;
            font-weight: 600; font-size: 14px; text-align: center; color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: all 0.3s;
        }
        .process_panel a:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(255,255,255,0.9); transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0, 122, 255, 0.15); }

        .process_panel_vertical { margin-bottom: 10px; display: block; }
        .process_panel_vertical a {
            display: flex; align-items: center; padding: 15px 25px; background: white; border: 1px solid #e1e1e6; border-radius: 16px;
            text-decoration: none; color: var(--text-main); font-weight: 600; font-size: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: all 0.2s;
        }
        .process_panel_vertical a:hover { border-color: var(--primary-color); color: var(--primary-color); background: #f0f7ff; transform: translateX(5px); box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1); }

        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 10000; display: none; justify-content: center; align-items: center; }
        .modal[style*="display: block"] { display: flex !important; }
        .modal-content { border-radius: 24px; border: 1px solid rgba(255,255,255,0.8); background: white; box-shadow: 0 25px 50px rgba(0,0,0,0.15); padding: 30px; position: relative; max-width: 600px; width: 90%; animation: fadeIn 0.3s; }
        .modal-close { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 28px; color: #999; cursor: pointer; }
        .modal-close:hover { color: #ff3b30; }

        .flash { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 50px; padding: 12px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); font-weight: 600; z-index: 9999; }
        .flash.success { color: #34c759; border: 1px solid #34c759; }

        table { border-collapse: collapse; width: 100%; }
        .default_table { width: 100%; border-spacing: 0 8px; border-collapse: separate; }
        .default_table th { text-align: left; padding: 10px 15px; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
        .default_table td { background: white; padding: 15px; font-size: 14px; border-top: 1px solid #f0f0f5; border-bottom: 1px solid #f0f0f5; }
        .default_table td:first-child { border-left: 1px solid #f0f0f5; border-radius: 10px 0 0 10px; }
        .default_table td:last-child { border-right: 1px solid #f0f0f5; border-radius: 0 10px 10px 0; }
        hr { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    `;

    GM_addStyle(css);
    window.addEventListener('DOMContentLoaded', () => {
        const inputs = document.querySelectorAll('input[type="text"]');
        inputs.forEach(input => { input.setAttribute('placeholder', ' '); });
    });
})();
