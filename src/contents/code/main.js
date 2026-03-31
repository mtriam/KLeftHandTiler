print("KLeftHandTiler – loaded");

// ──────────────────────────────────────────────────────────────
// SHORTCUTS
// ──────────────────────────────────────────────────────────────
registerShortcut("RestoreLastMinimized", "---Restore last minimized window", "Ctrl+!", restoreLastMinimized);
registerShortcut("CycleActiveWindow", "---Switch to next visible window", "Ctrl+Esc", cycleActiveWindow);
registerShortcut("ToggleMaxOrMin", "---Toggle Maximize / double tap → Minimize", "Ctrl+`", ToggleMaxOrMin);
registerShortcut("DoubleTapToggleFullscreen", "---Double Ctrl+CapsLock → toggle fullscreen", "Ctrl+CapsLock", handleDoubleTap);
registerShortcut("RotateWindowsClockwiseKeepFocus","---Rotate windows clockwise (keep focus)", "Shift+Ctrl+Esc", rotateWindowsClockwiseKeepFocus);
registerShortcut("cycleMainRatioPresets", "---Cycle main ratio presets", "Ctrl+Shift+F1", cycleMainRatioPresets);
registerShortcut("SmartTileOrCycle", "---Smart Tile / Cycle / DoubleTap Maximize", "Ctrl+~", smartTileHandler);
registerShortcut("SetAutoRetileOff", "Auto-retile OFF", "Ctrl+Shift+F2", setAutoRetileOff);
registerShortcut("SetAutoRetileTiledOnly", "Auto-retile: Tiled only", "Ctrl+Shift+F3", setAutoRetileTiledOnly);
registerShortcut("SetAutoRetileAlways", "Auto-retile: Always", "Ctrl+Shift+F4", setAutoRetileAlways);
registerShortcut("SwapWindowLeft",  "---Swap with left window",  "Meta+Ctrl+Alt+Left",  () => swapWindowInDirection("left"));
registerShortcut("SwapWindowRight", "---Swap with right window", "Meta+Ctrl+Alt+Right", () => swapWindowInDirection("right"));
registerShortcut("SwapWindowUp",    "---Swap with top window",   "Meta+Ctrl+Alt+Up",    () => swapWindowInDirection("top"));
registerShortcut("SwapWindowDown",  "---Swap with bottom window","Meta+Ctrl+Alt+Down",  () => swapWindowInDirection("bottom"));
registerShortcut("GrowActiveWindow", "---Grow active window", "Meta+Alt+X", growActiveWindow);
registerShortcut("ShrinkActiveWindow", "---Shrink active window", "Meta+Alt+Z", shrinkActiveWindow);


// ──────────────────────────────────────────────────────────────
// GLOBAL VARIABLES & STATE
// ──────────────────────────────────────────────────────────────
const DEBUG = false;  // change to true for verbose logging
const MAX_WINDOWS = 10;
const LIVE_RESIZE_THROTTLE = 30;   // 50–80 idealne
const MAX_FIRST_ROW = 3;

let scriptGeometryChange = false;
let movingWindow = null;
let movingStartCenter = null;
let minimizedStack = [];
let lastTapTime = 0;
let smartTileLastTap = 0;
let smartTilePrevFirstRowMode = 0;
let manualResizeInProgress = false;
let layoutModel = null;
let forceModelRebuild = false;
let resizeThrottleTimer = null;
let lastResizeClient = null;
let lastResizeGeometry = null;
let resizeEdges = new Map();
let floatingWindows = new Set();
let lastDesktopId = null;


// ──────────────────────────────────────────────────────────────
// CONFIGURATION FROM KDE SETTINGS
// ──────────────────────────────────────────────────────────────
const AUTO_LAYOUT_ON_DESKTOP_CHANGE = readConfig("autoLayoutOnDesktopChange", false);
const AUTO_LAYOUT_ON_ACTIVITY_CHANGE = readConfig("autoLayoutOnActivityChange", false);
const AUTO_LAYOUT_ON_NEW_WINDOW = readConfig("autoLayoutOnNewWindow", true);
const AUTO_LAYOUT_ON_WINDOW_CLOSE = readConfig("autoLayoutOnWindowClose", true);
const AUTO_LAYOUT_ON_WINDOW_MINIMIZE = readConfig("autoLayoutOnWindowMinimize", true);
const AUTO_LAYOUT_ON_WINDOW_RESTORE = readConfig("autoLayoutOnWindowRestore", true);
const AUTO_RETILE_MODE = readConfig("autoRetileMode", 1); // 0=off, 1=tiled only, 2=always
const TILE_ON_START = readConfig("tileOnStart", false);
const DEFAULT_PRESET_INDEX = readConfig("defaultPresetIndex", 0);
const DOUBLE_TAP_THRESHOLD = readConfig("doubleTapThresholdMs", 300);
const REORDER_SLOT_THRESHOLD = readConfig("reorderSlotThreshold", 0.35);
const GAP = readConfig("gapBetweenWindows", 4);
const MARGIN = readConfig("screenMargin", 4);
const IGNORE_TILING_1 = readConfig("ignoreWordsTiling1", "print,find,replace,confirm,settings,preferences,properties,org.kde.plasma-systemmonitor").split(",");
const IGNORE_TILING_2 = readConfig("ignoreWordsTiling2", "drukuj,znajdź,zamień,potwierdź,ustawienia,właściwości").split(",");
const IGNORE_CYCLING_1 = readConfig("ignoreWordsCycling1", "").split(",");
const IGNORE_CYCLING_2 = readConfig("ignoreWordsCycling2", "").split(",");
var IGNORE_TRANSIENT_WINDOWS = readConfig("ignoreTransientWindows", true);

function buildIgnoreList(key1, key2, def1, def2) {

    var out = [];

    var raw1 = readConfig(key1, def1);
    var raw2 = readConfig(key2, def2);

    // 🔥 KLUCZ: zabezpieczenie
    if (typeof raw1 !== "string") raw1 = def1 || "";
    if (typeof raw2 !== "string") raw2 = def2 || "";

    var a1 = raw1.split(",");
    var a2 = raw2.split(",");

    for (var i = 0; i < a1.length; i++) {
        var s = a1[i];
        if (!s) continue;

        s = s.trim().toLowerCase();
        if (s.length > 0 && out.indexOf(s) === -1) {
            out.push(s);
        }
    }

    for (var i = 0; i < a2.length; i++) {
        var s = a2[i];
        if (!s) continue;

        s = s.trim().toLowerCase();
        if (s.length > 0 && out.indexOf(s) === -1) {
            out.push(s);
        }
    }

    return out;
}

const IGNORE_TILING = buildIgnoreList(
    "ignoreWordsTiling1",
    "ignoreWordsTiling2",
    "print,find,replace,confirm,settings,preferences,properties,org.kde.plasma-systemmonitor",
    "drukuj,znajdź,zamień,potwierdź,ustawienia,właściwości"
);

const IGNORE_CYCLING = buildIgnoreList("ignoreWordsCycling1", "ignoreWordsCycling2");

if (DEBUG) {
    print("IGNORE_TILING:", IGNORE_TILING);
    print("IGNORE_CYCLING:", IGNORE_CYCLING);
}




// ──────────────────────────────────────────────────────────────
// PRESETS
// ──────────────────────────────────────────────────────────────
const MAIN_RATIO_PRESETS = [
    [1.5, 1.5],
    [2.0, 2.0],
    [3.0, 3.0],
    [1.0, 1.0]
];

// ──────────────────────────────────────────────────────────────
// STATE PER ACTIVITY + DESKTOP + SCREEN
// ──────────────────────────────────────────────────────────────
const states = {};

function getCurrentDesktopIdentifier() {
    const cd = workspace.currentDesktop;
    if (typeof cd === "number") {
        return cd.toString();
    }
    if (cd && typeof cd === "object") {
        if (cd.id && typeof cd.id === "string" && cd.id.length > 0) {
            return cd.id;
        }
        if (typeof cd.x11DesktopNumber === "number" && cd.x11DesktopNumber > 0) {
            return cd.x11DesktopNumber.toString();
        }
        if (workspace.desktopGridWidth && workspace.desktopGridHeight) {
            const row = (cd.row !== undefined && typeof cd.row === "number") ? cd.row : 0;
            const col = (cd.column !== undefined && typeof cd.column === "number") ? cd.column : 0;
            return (row * workspace.desktopGridWidth + col + 1).toString();
        }
    }
    if (DEBUG) print("KLeftHandTiler WARNING: Failed to determine current desktop ID – using '1'");
    return "1";
}

function getCurrentActivityId() {
    if (workspace.currentActivity && typeof workspace.currentActivity === "string") {
        return workspace.currentActivity;
    }
    if (DEBUG) print("KLeftHandTiler WARNING: Failed to determine current activity ID – using 'default'");
    return "default";
}

let cachedScreenId = null;
let screenWarningLogged = false;

function getStateKey() {
    const activityId = getCurrentActivityId();
    const desktopId = getCurrentDesktopIdentifier();
    if (cachedScreenId === null) {
        let screenId = workspace.activeScreen;
        if (typeof screenId !== 'number' || screenId < 0) {
            if (!screenWarningLogged) {
                if (DEBUG) print("KLeftHandTiler: activeScreen at startup is not a valid number ("
                      + (typeof screenId) + " = " + screenId + ") → fallback to 0");
                screenWarningLogged = true;
            }
            screenId = 0;
        }
        const screens = workspace.screens || [];
        if (screenId >= screens.length) {
            if (!screenWarningLogged) {
                if (DEBUG) print(`KLeftHandTiler: activeScreen=${screenId} out of range (screens=${screens.length}) → fallback to 0`);
                screenWarningLogged = true;
            }
            screenId = 0;
        }
        cachedScreenId = screenId;
        if (DEBUG) print(`KLeftHandTiler: determined screenId = ${cachedScreenId} (screens: ${screens.length || "??"} )`);
    }
    return `${activityId}:${desktopId}:${cachedScreenId}`;
}

function getCurrentState() {
    const key = getStateKey();
    if (!states[key]) {
        const preset = MAIN_RATIO_PRESETS[DEFAULT_PRESET_INDEX];
        states[key] = {
            lastTiledOrder: [],
            leftRatio: preset[0],
            topRatio: preset[1],
            firstRowMode: 0
        };
    }
    return states[key];
}

function getLastTiledOrder() { return getCurrentState().lastTiledOrder; }
function setLastTiledOrder(order) { getCurrentState().lastTiledOrder = order; }
function getLeftRatio() { return getCurrentState().leftRatio; }
function setLeftRatio(value) { getCurrentState().leftRatio = value; }
function getTopRatio() { return getCurrentState().topRatio; }
function setTopRatio(value) { getCurrentState().topRatio = value; }
function getFirstRowWindowsMode() { return getCurrentState().firstRowMode; }
function setFirstRowWindowsMode(value){ getCurrentState().firstRowMode = value; }

// ──────────────────────────────────────────────────────────────
// AUTO-RETILE LOGIC
// ──────────────────────────────────────────────────────────────
let autoRetileMode = AUTO_RETILE_MODE;

function canAutoRetile() {
    if (autoRetileMode === 0) return false;
    if (autoRetileMode === 2) return true;
    const visible = getVisibleWindows();
    const hasMaximized = visible.some(w => w.maximizeMode !== 0);
    if (hasMaximized) {
        if (DEBUG) print("KLeftHandTiler: auto-retile skipped (Tiled only mode + maximized present)");
        return false;
    }
    return true;
}

function applyAutoRetileMode(newMode) {
    const modes = ["Off", "Tiled only", "Always"];

    const changed = (autoRetileMode !== newMode);
    autoRetileMode = newMode;

    const msg = "Auto-retile:\n " + modes[autoRetileMode];

    if (DEBUG) {
        print("KLeftHandTiler auto-retile mode: " + modes[autoRetileMode] + (changed ? " (changed)" : " (same)"));
    }

    // ZAWSZE pokazuj OSD
    showOSD(msg);

    // Relayout tylko jeśli faktycznie zmiana
    if (changed && canAutoRetile()) {
        scheduleRelayout();
    }
}

function setAutoRetileOff() { applyAutoRetileMode(0); }
function setAutoRetileTiledOnly() { applyAutoRetileMode(1); scheduleRelayout(); }
function setAutoRetileAlways() { applyAutoRetileMode(2); scheduleRelayout(); }

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
function showOSD(message, icon = "object-order") {
    if (!message) return;

    callDBus(
        "org.kde.plasmashell",
        "/org/kde/osdService",
        "org.kde.osdService",
        "showText",
        icon,
        message
    );
}

let lastOSDTime = 0;

function showOSDSafe(msg, icon) {
   const now = Date.now();
   if (now - lastOSDTime < 400) return;
   lastOSDTime = now;
   showOSD(msg, icon);
}



// ──────────────────────────────────────────────────────────────
function showUnifiedLayoutOSD(extraInfo = "") {
    const name = getLayoutName();
    let text = "Layout:\n " + name;
    if (extraInfo) {
        text += "\n" + extraInfo;
    }
    showOSD(text, "view-grid");
}

function sortByAngle(windows) {
    let cx = 0, cy = 0;
    windows.forEach(w => {
        const g = w.frameGeometry;
        cx += g.x + g.width / 2;
        cy += g.y + g.height / 2;
    });
    cx /= windows.length || 1;
    cy /= windows.length || 1;
    return windows.slice().sort((a, b) => {
        const ga = a.frameGeometry;
        const gb = b.frameGeometry;
        return Math.atan2(ga.y + ga.height/2 - cy, ga.x + ga.width/2 - cx) -
               Math.atan2(gb.y + gb.height/2 - cy, gb.x + gb.width/2 - cx);
    });
}

function matchesIgnoreList(win, list) {
    if (!win || !list || list.length === 0) return false;

    const cap  = (win.caption || "").toLowerCase();
    const cls  = (win.resourceClass || "").toLowerCase();
    const name = (win.resourceName || "").toLowerCase();

    for (let raw of list) {
        if (!raw) continue;

        const term = raw.trim().toLowerCase();
        if (!term) continue;

        if (
            cap.includes(term) ||
            cls.includes(term) ||
            name.includes(term)
        ) {
            return true;
        }
    }

    return false;
}

// Dodaj tę funkcję (np. obok getVisibleWindows)
function getTiledOrder() {
    const visible = getVisibleWindows();
    let ordered = [];
    const currentOrder = getLastTiledOrder();

    for (let w of currentOrder) {
        if (visible.includes(w) && !w.deleted) ordered.push(w);
    }
    for (let w of visible) {
        if (!ordered.includes(w)) ordered.push(w);
    }
    return { ordered, visible };
}


function getVisibleWindows() {
    const currentDesk = workspace.currentDesktop;
    const currentActivity = workspace.currentActivity;
    const activeScreen = workspace.activeScreen;

    return workspace.windowList().filter(w => {
        if (!w.normalWindow || !w.managed || w.minimized || w.specialWindow || w.dock ||
            w.desktopWindow || w.skipTaskbar || w.popup || w.dialog || w.utilityWindow ||
            w.deleted || matchesIgnoreList(w, IGNORE_TILING)) {
            return false;
        }

        // ───── FILTR AKTYWNOŚCI (było OK) ─────
        if (currentActivity && !w.onAllActivities && !w.activities.includes(currentActivity)) {
            return false;
        }

        // ───── NOWY FILTR PULPITU (KLUCZOWA POPRAWKA) ─────
        const onCurrentDesktop = w.desktops.some(d => {
            if (typeof currentDesk === "number") {
                return d === currentDesk;
            }
            if (d && typeof d === "object" && d.id) {
                return d.id === currentDesk.id;
            }
            return false;
        });
        if (!onCurrentDesktop) return false;

        // ───── FILTR GEOMETRII (ekran) ─────
        const geo = w.frameGeometry;
        const screenGeo = workspace.clientArea(KWin.FullScreenArea, activeScreen, currentDesk);
        const centerX = geo.x + geo.width / 2;
        const centerY = geo.y + geo.height / 2;

        return centerX >= screenGeo.x && centerX < screenGeo.x + screenGeo.width &&
               centerY >= screenGeo.y && centerY < screenGeo.y + screenGeo.height;
    });
}

function getCyclingWindows() {
    const currentDesk = workspace.currentDesktop;
    const currentActivity = workspace.currentActivity;
    const activeScreen = workspace.activeScreen;

    return workspace.windowList().filter(w => {

        if (!w.normalWindow ||
            !w.managed ||
            w.minimized ||
            w.specialWindow ||
            w.dock ||
            w.desktopWindow ||
            w.skipTaskbar ||
            w.popup ||
            w.dialog ||
            w.utilityWindow ||
            w.deleted ||
            matchesIgnoreList(w, IGNORE_CYCLING)
        ) {
            return false;
        }

        if (currentActivity &&
            !w.onAllActivities &&
            !w.activities.includes(currentActivity)) {
            return false;
        }

        const onCurrentDesktop = w.desktops.some(d => {
            if (typeof currentDesk === "number") {
                return d === currentDesk;
            }
            if (d && typeof d === "object" && d.id) {
                return d.id === currentDesk.id;
            }
            return false;
        });

        if (!onCurrentDesktop) return false;

        const geo = w.frameGeometry;
        const screenGeo = workspace.clientArea(KWin.FullScreenArea, activeScreen, currentDesk);

        const centerX = geo.x + geo.width / 2;
        const centerY = geo.y + geo.height / 2;

        return centerX >= screenGeo.x &&
               centerX < screenGeo.x + screenGeo.width &&
               centerY >= screenGeo.y &&
               centerY < screenGeo.y + screenGeo.height;
    });
}

function centerOf(w) {
    const g = w.frameGeometry;
    return { x: g.x + g.width / 2, y: g.y + g.height / 2 };
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function indexOfClosestSlot(win) {
    const c = centerOf(win);
    const order = getLastTiledOrder();
    let bestIndex = -1;
    let best = Infinity;
    for (let i = 0; i < order.length; i++) {
        const w = order[i];
        if (!w || w === win || w.deleted) continue;
        const d = distance(c, centerOf(w));
        if (d < best) {
            best = d;
            bestIndex = i;
        }
    }
    return bestIndex;
}

function overlapRatio(a, b) {
    const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    const overlapArea = xOverlap * yOverlap;
    const minArea = Math.min(a.width * a.height, b.width * b.height);
    return minArea > 0 ? overlapArea / minArea : 0;
}

function minimizeIgnoredWindows() {
    const currentDesk = workspace.currentDesktop;
    const allWindows = workspace.windowList();
    for (let w of allWindows) {
        if (
            w.desktops.some(d => d.id === currentDesk.id) &&
            !w.minimized &&
            IGNORE_TILING.some(word => (w.caption || "").toLowerCase().includes(word)) &&
            w.minimizable
        ) {
            w.minimized = true;
            if (DEBUG) print("KLeftHandTiler: minimized ignored window: " + (w.caption || w.resourceClass));
        }
    }
}

function isLauncher(client) {
    if (!client) return false;
    const rc = (client.resourceClass || "").toLowerCase();
    return rc === "org.kde.plasmashell" &&
           client.specialWindow &&
           client.skipTaskbar &&
           !client.normalWindow;
}








function tileGridToModel(ordered, area) {
    const count = ordered.length;
    if (count === 0) return null;

    const model = { rows: [] };

    // ───── GLOBAL FAILSAFE ─────
    let minSingle = 0;
    for (let w of ordered) {
        minSingle = Math.max(minSingle, getMinWidth(w));
    }
    if (minSingle > area.width) {
        if (DEBUG) print("IMPOSSIBLE (single too wide) – keep old model");
        return layoutModel || null;
    }

    // ───── 2 OKNA ─────
    if (count === 2) {
        const vertical = getFirstRowWindowsMode() > 0;
        if (vertical) {
            const total = getTopRatio() + 1;
            model.rows.push({ heightRatio: getTopRatio() / total, windows: [{ win: ordered[0], widthRatio: 1 }] });
            model.rows.push({ heightRatio: 1 / total, windows: [{ win: ordered[1], widthRatio: 1 }] });
            return model;
        }
        const total = getLeftRatio() + 1;
        model.rows.push({
            heightRatio: 1,
            windows: [
                { win: ordered[0], widthRatio: getLeftRatio() / total },
                { win: ordered[1], widthRatio: 1 / total }
            ]
        });
        return model;
    }

    // ───── LEFT MAIN ───── (bez zmian)
    if (getFirstRowWindowsMode() === -1 && count > 1) {
        const main = ordered[0];
        const rest = ordered.slice(1);
        const usableWidth = area.width;
        const total = getLeftRatio() + 1;
        let leftW = (getLeftRatio() / total) * usableWidth;
        const minLeft = getMinWidth(main);
        const maxRightWidth = usableWidth - minLeft - GAP;

        let rightCols;

        // 🔥 SPECJALNY PRZYPADEK: 2 okna w grid → pion (1 kolumna)
        // zapobiega 3 oknom w jednym rzędzie
        if (rest.length === 2) {
            rightCols = 1;
        } else {
            rightCols = Math.ceil(Math.sqrt(rest.length));
            rightCols = Math.max(1, rightCols);
        }
        let fits = false;
        while (rightCols > 1) {
            const rows = Math.ceil(rest.length / rightCols);
            fits = true;
            let idx = 0;
            for (let r = 0; r < rows; r++) {
                const inRow = Math.min(rightCols, rest.length - idx);
                let required = 0;
                for (let i = 0; i < inRow; i++) {
                    required += getMinWidth(rest[idx + i]);
                    if (i > 0) required += GAP;
                }
                if (required > maxRightWidth) {
                    fits = false;
                    break;
                }
                idx += inRow;
            }
            if (fits) break;
            rightCols--;
        }

        const rightRows = Math.ceil(rest.length / rightCols);
        let minGrid = 0;
        let tmpIdx = 0;
        for (let r = 0; r < rightRows; r++) {
            const inRow = Math.min(rightCols, rest.length - tmpIdx);
            let rowMin = 0;
            for (let i = 0; i < inRow; i++) {
                rowMin += getMinWidth(rest[tmpIdx++]);
                if (i > 0) rowMin += GAP;
            }
            minGrid = Math.max(minGrid, rowMin);
        }

        if (minGrid + minLeft + GAP > usableWidth) {
            if (DEBUG) print("IMPOSSIBLE LEFT+GRID");
            return null;
        }

        const maxLeft = usableWidth - GAP - minGrid;
        if (maxLeft <= minLeft) {
            leftW = minLeft;
        } else {
            leftW = Math.max(minLeft, Math.min(maxLeft, leftW));
        }

        let idx = 0;
        for (let r = 0; r < rightRows; r++) {
            const inRow = Math.min(rightCols, rest.length - idx);
            const row = { heightRatio: 1 / rightRows, windows: [] };
            for (let c = 0; c < inRow && idx < rest.length; c++) {
                row.windows.push({ win: rest[idx++], widthRatio: 1 / inRow });
            }
            model.rows.push(row);
        }
        model.leftMain = { win: main, widthRatio: leftW / usableWidth };
        return model;
    }

    // ───── GRID MODE – poprawiona logika first row (auto + fixed) ─────
    let firstRowCount;

    if (getFirstRowWindowsMode() > 0) {
        // Tryb ręczny (np. 3 okna na górze)
        firstRowCount = Math.min(getFirstRowWindowsMode(), count);
    } else {
        // AUTO – bezpieczna wersja
        firstRowCount = Math.ceil(Math.sqrt(count));   // start od klasycznego

        // Zmniejszaj liczbę okien w pierwszym rzędzie dopóki się nie zmieści
        while (firstRowCount > 1) {
            let minSum = 0;
            for (let i = 0; i < firstRowCount; i++) {
                minSum += getMinWidth(ordered[i]);
                if (i > 0) minSum += GAP;
            }
            if (minSum <= area.width) break;
            firstRowCount--;
        }
        if (firstRowCount < 1) firstRowCount = 1;
    }

    let idx = 0;

    // ───── FIRST ROW ─────
    {
        const usableW = area.width - GAP * Math.max(0, firstRowCount - 1);
        let minSum = 0;
        const mins = [];

        for (let i = 0; i < firstRowCount; i++) {
            const m = getMinWidth(ordered[idx + i]);
            mins.push(m);
            minSum += m;
        }

        if (minSum > usableW) {
            if (DEBUG) print(`FIRST ROW IMPOSSIBLE – minSum=${minSum} > usableW=${usableW} (firstRowCount=${firstRowCount})`);
            return null;
        }

        const extra = usableW - minSum;
        const windows = [];

        if (firstRowCount > 1) {
            const normalCount = firstRowCount - 1;
            const totalW = getLeftRatio() + normalCount;

            windows.push({
                win: ordered[idx++],
                widthRatio: (mins[0] + extra * (getLeftRatio() / totalW)) / usableW
            });

            for (let i = 1; i < firstRowCount; i++) {
                windows.push({
                    win: ordered[idx++],
                    widthRatio: (mins[i] + extra * (1 / totalW)) / usableW
                });
            }
        } else {
            windows.push({ win: ordered[idx++], widthRatio: 1 });
        }

        model.rows.push({ heightRatio: 1, windows: windows });
    }

    // ───── DYNAMIC GRID – reszta okien ─────
    while (idx < count) {
        let row = [];
        let rowMin = 0;

        while (idx < count) {
            const w = ordered[idx];
            const minW = getMinWidth(w);
            const nextCount = row.length + 1;
            const required = rowMin + (row.length > 0 ? GAP : 0) + minW + GAP * (nextCount - 1);

            if (required > area.width) break;

            row.push(w);
            rowMin += minW;
            idx++;
        }

        if (row.length === 0 && idx < count) {
            row.push(ordered[idx++]);
            rowMin = getMinWidth(row[0]);
        }

        const usableW = area.width - GAP * Math.max(0, row.length - 1);
        const extra = usableW - rowMin;
        const windows = [];

        for (let i = 0; i < row.length; i++) {
            const minW = getMinWidth(row[i]);
            const ratio = (minW + extra / row.length) / usableW;
            windows.push({ win: row[i], widthRatio: ratio });
        }

        model.rows.push({ heightRatio: 1, windows: windows });
    }

    // ───── HEIGHT NORMALIZATION ─────
    if (model.rows.length > 1) {
        const totalWeight = getTopRatio() + (model.rows.length - 1);
        for (let i = 0; i < model.rows.length; i++) {
            const isFirst = i === 0;
            model.rows[i].heightRatio = isFirst 
                ? getTopRatio() / totalWeight 
                : 1 / totalWeight;
        }
    } else if (model.rows.length === 1) {
        model.rows[0].heightRatio = 1;
    }

    return model;
}
// ──────────────────────────────────────────────────────────────
// CORE ENGINE
// ──────────────────────────────────────────────────────────────
function distributeSizesWithMin(items, totalSize, gap, getMin, getRatio) {

    const n = items.length;
    if (n === 0) return [];

    // ───── SAFE USABLE ─────
    const totalGap = gap * (n - 1);
    let usable = totalSize - totalGap;

    if (!isFinite(usable) || usable <= 0) {
        return new Array(n).fill(1);
    }

    // ───── ratios ─────
    let ratioSum = 0;
    const ratios = [];

    for (let i = 0; i < n; i++) {
        let r = getRatio(items[i]);
        if (!isFinite(r) || r < 0) r = 0;

        ratios.push(r);
        ratioSum += r;
    }

    if (ratioSum <= 0) {
        ratioSum = n;
        for (let i = 0; i < n; i++) ratios[i] = 1;
    }

    // ───── mins (SAFE CLAMP) ─────
    const mins = [];
    let sumMin = 0;

    for (let i = 0; i < n; i++) {

        let m = getMin(items[i]);

        if (!isFinite(m) || m < 0) m = 0;

        // 🔥 KLUCZ: clamp żeby pojedyncze okno nie rozwaliło layoutu
        m = Math.min(m, usable);

        mins.push(m);
        sumMin += m;
    }

    // ───── initial sizes (source of truth) ─────
    let sizes = [];

    for (let i = 0; i < n; i++) {
        sizes[i] = usable * (ratios[i] / ratioSum);
    }

    // ───── clamp do minimum ─────
    for (let i = 0; i < n; i++) {
        if (sizes[i] < mins[i]) {
            sizes[i] = mins[i];
        }
    }

    // ───── LOCAL overflow handling (ORYGINALNA LOGIKA) ─────
    let sum = sizes.reduce((a, b) => a + b, 0);

    if (sum > usable) {

        let overflow = sum - usable;

        // 🔥 zdejmujemy dokładnie tyle ile trzeba (bez ratio!)
        let i = 0;

        while (overflow > 0 && n > 0) {

            const idx = i % n;

            const min = mins[idx];
            const canShrink = sizes[idx] - min;

            if (canShrink > 0) {

                const take = Math.min(canShrink, overflow);

                sizes[idx] -= take;
                overflow -= take;
            }

            i++;

            // safety
            if (i > n * 20) break;
        }

        // 🔥 HARD SAFETY (rzadkie – ale bezpieczne)
        if (overflow > 0) {

            if (DEBUG) {
                print("⚠️ EXTREME OVERFLOW → equal fallback");
            }

            const base = Math.max(1, Math.floor(usable / n));

            for (let i = 0; i < n; i++) {
                sizes[i] = base;
            }

            return sizes;
        }
    }

    // ───── rounding ─────
    sizes = sizes.map(s => Math.max(1, Math.round(s)));

    // ───── exact fit correction ─────
    let finalSum = sizes.reduce((a, b) => a + b, 0);
    let diff = usable - finalSum;

    let i = 0;

    while (diff !== 0 && n > 0) {

        const idx = i % n;

        if (diff > 0) {
            sizes[idx]++;
            diff--;
        } else {
            if (sizes[idx] > mins[idx]) {
                sizes[idx]--;
                diff++;
            }
        }

        i++;

        // safety
        if (i > n * 20) break;
    }

    // ───── FINAL SAFETY ─────
    for (let i = 0; i < n; i++) {

        if (!isFinite(sizes[i]) || sizes[i] <= 0) {

            if (DEBUG) print("❌ INVALID SIZE → fallback");

            const base = Math.max(1, Math.floor(usable / n));
            return new Array(n).fill(base);
        }
    }

    return sizes;
}

function normalizeModelWithConstraints(model, usable) {

    if (!model || !model.rows) return;

    const totalH = usable.height;
    const totalW = usable.width;

    // ───── HEIGHT (ROWS) ─────

    let minHeights = [];
    let sumRatios = 0;

    for (let row of model.rows) {

        let minH = 0;

        for (let item of row.windows) {
            if (!item.win) continue;
            minH = Math.max(minH, getMinHeight(item.win));
        }

        minHeights.push(minH);
        sumRatios += row.heightRatio;
    }

    if (sumRatios <= 0) {
        sumRatios = model.rows.length;
        model.rows.forEach(r => r.heightRatio = 1);
    }

    // normalizacja bazowa
    for (let row of model.rows) {
        row.heightRatio /= sumRatios;
    }

    // clamp do minimum
    for (let i = 0; i < model.rows.length; i++) {

        const minRatio = minHeights[i] / totalH;

        if (model.rows[i].heightRatio < minRatio) {
            model.rows[i].heightRatio = minRatio;
        }
    }

    // scale jeśli overflow
    let sumAfterClamp = model.rows.reduce((a, r) => a + r.heightRatio, 0);

    if (sumAfterClamp > 1) {
        const scale = 1 / sumAfterClamp;
        for (let row of model.rows) {
            row.heightRatio *= scale;
        }

        // 🔥 KLUCZ: ponowny clamp (naprawia edge-case)
        for (let i = 0; i < model.rows.length; i++) {
            const minRatio = minHeights[i] / totalH;
            if (model.rows[i].heightRatio < minRatio) {
                model.rows[i].heightRatio = minRatio;
            }
        }
    }

    // ───── WIDTH (PER ROW) ─────

    for (let row of model.rows) {

        let minWidths = [];
        let sumRatiosW = 0;

        for (let item of row.windows) {
            const minW = getMinWidth(item.win);
            minWidths.push(minW);
            sumRatiosW += item.widthRatio;
        }

        if (sumRatiosW <= 0) {
            sumRatiosW = row.windows.length;
            row.windows.forEach(w => w.widthRatio = 1);
        }

        for (let item of row.windows) {
            item.widthRatio /= sumRatiosW;
        }

        for (let i = 0; i < row.windows.length; i++) {

            const minRatio = minWidths[i] / totalW;

            if (row.windows[i].widthRatio < minRatio) {
                row.windows[i].widthRatio = minRatio;
            }
        }

        let sumAfter = row.windows.reduce((a, w) => a + w.widthRatio, 0);

        if (sumAfter > 1) {
            const scale = 1 / sumAfter;
            for (let item of row.windows) {
                item.widthRatio *= scale;
            }
        }
    }
}


function validateLayoutBySimulation(model, usable) {

    if (!model || !model.rows) return false;

    // ───────── LEFT MAIN ─────────
    if (model.leftMain) {

        const mainW = Math.max(1, Math.round(model.leftMain.widthRatio * usable.width));

        const rightWidthTotal = Math.max(1, usable.width - mainW - GAP);

        const rowHeights = distributeSizesWithMin(
            model.rows,
            usable.height,
            GAP,
            row => {
                let m = 0;
                for (let w of row.windows) m = Math.max(m, getMinHeight(w.win));
                return m;
            },
            row => row.heightRatio
        );

        for (let r = 0; r < model.rows.length; r++) {

            const row = model.rows[r];
            const rowH = rowHeights[r];

            if (rowH <= 0) return false;

            const widths = distributeSizesWithMin(
                row.windows,
                rightWidthTotal,
                GAP,
                item => getMinWidth(item.win),
                                                  item => item.widthRatio
            );

            for (let i = 0; i < widths.length; i++) {
                if (widths[i] <= 0) return false;
            }
        }

        return true;
    }

    // ───────── GRID ─────────

    const rowHeights = distributeSizesWithMin(
        model.rows,
        usable.height,
        GAP,
        row => {
            let m = 0;
            for (let w of row.windows) m = Math.max(m, getMinHeight(w.win));
            return m;
        },
        row => row.heightRatio
    );

    for (let r = 0; r < model.rows.length; r++) {

        const row = model.rows[r];
        const rowH = rowHeights[r];

        if (rowH <= 0) return false;

        const widths = distributeSizesWithMin(
            row.windows,
            usable.width,
            GAP,
            item => getMinWidth(item.win),
                                              item => item.widthRatio
        );

        for (let i = 0; i < widths.length; i++) {
            if (widths[i] <= 0) return false;
        }
    }

    return true;
}



function canApplyLayoutModel(model, usable) {

    if (!model || !model.rows) return false;

    // LEFT MAIN
    if (model.leftMain) {

        const mainW = Math.round(model.leftMain.widthRatio * usable.width);

        if (!isFinite(mainW) || mainW <= 0) return false;

        const rightWidth = usable.width - mainW - GAP;
        if (rightWidth <= 0) return false;

        const rowHeights = distributeSizesWithMin(
            model.rows,
            usable.height,
            GAP,
            row => {
                let m = 0;
                for (let w of row.windows) m = Math.max(m, getMinHeight(w.win));
                return m;
            },
            row => row.heightRatio
        );

        if (!rowHeights) return false;

        for (let h of rowHeights) {
            if (!isFinite(h) || h <= 0) return false;
        }

        for (let row of model.rows) {

            const widths = distributeSizesWithMin(
                row.windows,
                rightWidth,
                GAP,
                item => getMinWidth(item.win),
                                                  item => item.widthRatio
            );

            if (!widths) return false;

            for (let w of widths) {
                if (!isFinite(w) || w <= 0) return false;
            }
        }

        return true;
    }

    // GRID

    const rowHeights = distributeSizesWithMin(
        model.rows,
        usable.height,
        GAP,
        row => {
            let m = 0;
            for (let w of row.windows) m = Math.max(m, getMinHeight(w.win));
            return m;
        },
        row => row.heightRatio
    );

    if (!rowHeights) return false;

    for (let h of rowHeights) {
        if (!isFinite(h) || h <= 0) return false;
    }

    for (let row of model.rows) {

        const widths = distributeSizesWithMin(
            row.windows,
            usable.width,
            GAP,
            item => getMinWidth(item.win),
                                              item => item.widthRatio
        );

        if (!widths) return false;

        for (let w of widths) {
            if (!isFinite(w) || w <= 0) return false;
        }
    }

    return true;
}


function canFitHeightStrict(model, area) {

    if (!model || !model.rows) return false;

    let totalMinHeight = 0;

    for (let r = 0; r < model.rows.length; r++) {

        let rowMin = 0;

        for (let item of model.rows[r].windows) {
            rowMin = Math.max(rowMin, getMinHeight(item.win));
        }

        totalMinHeight += rowMin;

        if (r > 0) totalMinHeight += GAP;
    }

    return totalMinHeight <= area.height;
}



function buildAndValidateModel(windows, usable) {

    if (!windows || windows.length === 0) return null;

    let model = tileGridToModel(windows, usable);

    if (!model || !model.rows) return null;

    normalizeModelWithConstraints(model, usable);

    // 🔥 NOWY HARD CHECK (KLUCZ)
    if (!canFitHeightStrict(model, usable)) {
        if (DEBUG) print("HEIGHT HARD FAIL");
        return null;
    }

    if (!canApplyLayoutModel(model, usable)) return null;

    return model;
}




function reLayout() {
    let { ordered, visible } = getTiledOrder();
    
    if (visible.length === 0) return;
    if (visible.every(w => w.minimized)) return;

    // ───── DETEKCJA ZMIANY DESKTOPU ─────
    const currentDesk = workspace.currentDesktop;
    const isDesktopSwitch = lastDesktopId !== null && lastDesktopId !== currentDesk.id;
    lastDesktopId = currentDesk.id;

    // ───── LIMIT MAX_WINDOWS ─────
    let tooMany = false;
    if (ordered.length > MAX_WINDOWS) {
        tooMany = true;
        if (DEBUG) print(`Too many windows (${ordered.length} > ${MAX_WINDOWS}) → limiting to ${MAX_WINDOWS}`);
        
        // Zachowujemy tylko pierwsze MAX_WINDOWS okien w ordered
        ordered = ordered.slice(0, MAX_WINDOWS);
        
        // Resztę wrzucamy do floating
        if (typeof floatingWindows !== "undefined") {
            for (let i = MAX_WINDOWS; i < visible.length; i++) {
                floatingWindows.add(visible[i]);
            }
        }
    }

    // ───── reset maximize/fullscreen ─────
    for (let w of visible) {
        if (!w || w.deleted) continue;
        if (w.fullScreen) w.fullScreen = false;
        if (w.maximizeMode !== 0) w.setMaximize(false, false);
    }

    setLastTiledOrder(ordered);   // zapisujemy okrojoną listę

    // ───── AREA ─────
    const area = workspace.clientArea(
        KWin.FullScreenArea,
        workspace.activeScreen,
        workspace.currentDesktop
    );
    const usable = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    if (usable.width < 50 || usable.height < 50) {
        if (DEBUG) print("ABORT: usable area too small");
        showOSDSafe("Screen too small", "dialog-error");
        return;
    }

    const state = getCurrentState();

    const needRebuild =
        !layoutModel ||
        layoutModel._count !== ordered.length ||
        forceModelRebuild ||
        state._layoutDirty;

    if (needRebuild) {
        let newModel = buildAndValidateModel(ordered, usable);
        let removedWindows = [];

        while (!newModel && ordered.length > 1) {
            const removed = ordered.pop();
            if (removed) removedWindows.push(removed);
            newModel = buildAndValidateModel(ordered, usable);
        }

        // Zarządzanie floating windows
        if (typeof floatingWindows !== "undefined") {
            floatingWindows.clear();
            for (let w of removedWindows) {
                floatingWindows.add(w);
            }
            // Jeśli było za dużo okien na początku - już dodaliśmy je wyżej
        }

        // OSD tylko przy rzeczywistym braku miejsca (po redukcji)
        if (!isDesktopSwitch && removedWindows.length > 0 && ordered.length > 0) {
            const last = removedWindows[removedWindows.length - 1];
            const name = last?.caption || last?.resourceClass;
            if (name && name.trim() !== "") {
   //             showOSDSafe("No space for:\n" + name, "dialog-warning");
            }
        }

        // Informacja o limicie MAX_WINDOWS
        if (tooMany) {
      //      showOSDSafe(`Too many windows!\nTiling only ${MAX_WINDOWS}`, "dialog-warning");
        }

        if (!newModel) {
            if (DEBUG) print("MODEL BUILD FAILED (even after reduction)");
            showOSDSafe("Layout impossible", "dialog-error");
            layoutModel = null;
            forceModelRebuild = true;
            return;
        }

        newModel._count = ordered.length;
        layoutModel = newModel;
        forceModelRebuild = false;
        state._layoutDirty = false;
        setLastTiledOrder(ordered);

        if (DEBUG) print("MODEL REBUILT OK");
    }

    if (!layoutModel || !layoutModel.rows || !canApplyLayoutModel(layoutModel, usable)) {
        if (DEBUG) print("ABORT APPLY (invalid layout)");
        showOSDSafe("Layout broken", "dialog-error");
        layoutModel = null;
        forceModelRebuild = true;
        return;
    }

    scriptGeometryChange = true;
    applyLayoutModel(layoutModel, usable);
    scriptGeometryChange = false;

    if (workspace.activeWindow) {
        workspace.raiseWindow(workspace.activeWindow);
    }
}

// ──────────────────────────────────────────────────────────────
// TOGGLE ALL WINDOWS
// ──────────────────────────────────────────────────────────────
function toggleAllWindows(forceMode = null) {
    const visible = getVisibleWindows();
    if (visible.length === 0) return;
    for (let w of visible) {
        if (w.fullScreen) w.fullScreen = false;
    }
    const shouldTile = forceMode === "tile" ? true :
                       forceMode === "maximize" ? false :
                       visible.some(w => w.maximizeMode !== 0);
    if (shouldTile) {
        minimizeIgnoredWindows();
        scheduleRelayout();
    } else {
        visible.forEach(w => {
            if (w.maximizable) {
                w.setMaximize(false, false);
                w.setMaximize(true, true);
            }
        });
    }
    if (workspace.activeWindow) workspace.raiseWindow(workspace.activeWindow);
}

// ──────────────────────────────────────────────────────────────
// CYCLE RATIO PRESETS
// ──────────────────────────────────────────────────────────────
function getRatioOSD() {
    const left = getLeftRatio();
    const top  = getTopRatio();

    // przelicz na procent (czytelniejsze niż ratio)
    const leftPercent = Math.round((left / (left + 1)) * 100);
    const topPercent  = Math.round((top  / (top  + 1)) * 100);

    return {
        leftPercent,
        topPercent,
        text: `Main ratio:\n ${leftPercent}% / ${100 - leftPercent}%`
    };
}



function cycleMainRatioPresets() {

    let currentIndex = -1;
    let minDiff = Infinity;

    MAIN_RATIO_PRESETS.forEach((p, i) => {
        const diff = Math.abs(getLeftRatio() - p[0]) + Math.abs(getTopRatio() - p[1]);
        if (diff < minDiff) {
            minDiff = diff;
            currentIndex = i;
        }
    });

    if (minDiff > 0.3) currentIndex = -1;

    const nextIndex = (currentIndex + 1) % MAIN_RATIO_PRESETS.length;

    setLeftRatio(MAIN_RATIO_PRESETS[nextIndex][0]);
    setTopRatio(MAIN_RATIO_PRESETS[nextIndex][1]);

    getCurrentState()._layoutDirty = true;   // 🔥 KLUCZ

    const ratio = getRatioOSD();
    showOSD(ratio.text, "view-split-left-right");

    minimizeIgnoredWindows();
    scheduleRelayout();
}

// ──────────────────────────────────────────────────────────────
// CYCLE FIRST ROW MODE
// ──────────────────────────────────────────────────────────────

function getLayoutName() {
    const mode = getFirstRowWindowsMode();
    const count = getVisibleWindows().length;

    if (count === 2) {
        return mode > 0 ? "Split Vertical ↕" : "Split Horizontal ↔";
    }
    if (mode === -1) return "Left Master ⬅";
    if (mode === 0) return "Auto Grid ▦";

    // Top N tylko jeśli ma sens
    if (mode > 0) {
        return `Top ${mode} ▤`;
    }
    return "Unknown";
}



function cycleFirstRowWindows() {
    const { ordered, visible } = getTiledOrder();
    const count = visible.length;
    if (count < 2) return;

    const area = workspace.clientArea(
        KWin.FullScreenArea,
        workspace.activeScreen,
        workspace.currentDesktop
    );
    const usable = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    const currentMode = getFirstRowWindowsMode();
    let newMode = findNextPossibleLayout(currentMode, ordered, usable);

    if (count === 2) {
        newMode = (currentMode > 0) ? 0 : 1;
    }

    if (newMode === currentMode) {
        newMode = (currentMode === 0) ? -1 : 0;
    }

    setFirstRowWindowsMode(newMode);
    getCurrentState()._layoutDirty = true;

    minimizeIgnoredWindows();
    scheduleRelayout(0);

    // ───── Budujemy komunikat z problemami ─────
    let extra = "";
    if (visible.length > MAX_WINDOWS) {
        extra = `Too many windows! (only ${MAX_WINDOWS} tiled)`;
    } else {
        // Sprawdzamy czy aktualny model mieści wszystkie okna
        const model = buildAndValidateModel(ordered, usable);
        if (!model) {
            extra = "Some windows don't fit";
        }
    }

    showUnifiedLayoutOSD(extra);
}

// ──────────────────────────────────────────────────────────────
// ROTATE WINDOWS
// ──────────────────────────────────────────────────────────────
function rotateWindowsClockwiseKeepFocus() {

    const wins = getVisibleWindows();
    if (wins.length < 2) return;

    const activeBefore = workspace.activeWindow;

    let order = getLastTiledOrder();

    order = [order[order.length - 1], ...order.slice(0, -1)]
    .filter(w => wins.includes(w) && !w.deleted);

    setLastTiledOrder(order);

    getCurrentState()._layoutDirty = true;   // 🔥

    minimizeIgnoredWindows();
    scheduleRelayout();

    if (activeBefore && !activeBefore.deleted) {
        workspace.activeWindow = activeBefore;
        workspace.raiseWindow(activeBefore);
    }
}

// ──────────────────────────────────────────────────────────────
// CYCLE ACTIVE WINDOW
// ──────────────────────────────────────────────────────────────
function cycleActiveWindow() {
    let windows = getCyclingWindows();
    if (windows.length < 2) return;
    windows = sortByAngle(windows);
    let idx = windows.indexOf(workspace.activeWindow);
    if (idx === -1) idx = 0;
    const next = windows[(idx + 1) % windows.length];
    workspace.activeWindow = next;
    workspace.raiseWindow(next);
}

// ──────────────────────────────────────────────────────────────
// MINIMIZE STACK + RESTORE
// ──────────────────────────────────────────────────────────────
function trackWindowMinimizeRestore(c) {
    if (!c.normalWindow || c.specialWindow || c.dock || c.skipTaskbar) return;
    if (c._minimizeRestoreTracked) return;

    c.minimizedChanged.connect(() => {

        if (c.minimized) minimizedStack.push(c);

        // ───── RESTORE ─────
        if (AUTO_LAYOUT_ON_WINDOW_RESTORE && canAutoRetile() && !c.minimized) {

            let timer = new QTimer();
            timer.interval = 100;

            timer.timeout.connect(() => {
                timer.stop();

                if (canAutoRetile()) {
                    if (DEBUG) print("KLeftHandTiler: retile after restoring minimized window");
                    scheduleRelayout();
                }
            });

            timer.start();
        }

        // ───── MINIMIZE ─────
        if (AUTO_LAYOUT_ON_WINDOW_MINIMIZE && canAutoRetile() && c.minimized) {

            let timer = new QTimer();
            timer.interval = 80;

            timer.timeout.connect(() => {
                timer.stop();

                if (canAutoRetile()) {
                    if (DEBUG) print("KLeftHandTiler: retile after minimizing window");
                    scheduleRelayout();
                }
            });

            timer.start();
        }
    });

    c._minimizeRestoreTracked = true;
}


workspace.windowAdded.connect(trackWindowMinimizeRestore);
workspace.windowList().forEach(trackWindowMinimizeRestore);

function restoreLastMinimized() {
    while (minimizedStack.length) {
        const w = minimizedStack.pop();
        if (w.deleted || !w.minimized) continue;
        w.minimized = false;
        workspace.activeWindow = w;
        workspace.raiseWindow(w);
        showOSD("Restore window", "window-restore");
        return;
    }
}

// ──────────────────────────────────────────────────────────────
// TOGGLE MAX OR MIN
// ──────────────────────────────────────────────────────────────
function ToggleMaxOrMin() {
    const w = workspace.activeWindow;
    if (!w || !w.normalWindow || w.deleted || !w.managed) return;
    const now = Date.now();
    const isDouble = (now - lastTapTime < DOUBLE_TAP_THRESHOLD);
    lastTapTime = now;
    if (w.fullScreen) {
        w.fullScreen = false;
        w.setMaximize(false, false);
    } else {
        const isMaximized = (w.maximizeMode !== 0);
        if (isMaximized) {
            w.setMaximize(false, false);
        } else {
            w.setMaximize(true, true);
        }
        workspace.raiseWindow(w);
    }
    if (isDouble) {
        w.minimized = true;
        lastTapTime = 0;
    }
}

// ──────────────────────────────────────────────────────────────
// DOUBLE TAP FULLSCREEN
// ──────────────────────────────────────────────────────────────
function handleDoubleTap() {
    if (!handleDoubleTap.lastPressTime) handleDoubleTap.lastPressTime = 0;
    const now = Date.now();
    if (now - handleDoubleTap.lastPressTime <= DOUBLE_TAP_THRESHOLD) {
        const w = workspace.activeWindow;
        if (w) w.fullScreen = !w.fullScreen;
        handleDoubleTap.lastPressTime = 0;
    } else {
        handleDoubleTap.lastPressTime = now;
    }
}

// ──────────────────────────────────────────────────────────────
// SMART TILE HANDLER
// ──────────────────────────────────────────────────────────────
function smartTileHandler() {
    const visible = getVisibleWindows();
    if (visible.length === 0) return;
    const now = Date.now();
    if (now - smartTileLastTap < DOUBLE_TAP_THRESHOLD) {
        smartTileLastTap = 0;
        setFirstRowWindowsMode(smartTilePrevFirstRowMode);
        for (let w of visible) {
            if (w.maximizable) {
                w.setMaximize(false, false);
                w.setMaximize(true, true);
            }
        }
        showOSD("Maximize all", "view-fullscreen");
        return;
    }
    smartTileLastTap = now;
    const anyMax = visible.some(w => w.maximizeMode !== 0);
    if (anyMax && visible.length > 1) {
        minimizeIgnoredWindows();
        scheduleRelayout();
    } else {
        smartTilePrevFirstRowMode = getFirstRowWindowsMode();
        cycleFirstRowWindows();
    }
}


function getMinRowWidth(row) {
    if (!row || !row.windows) return 0;

    let sum = 0;

    for (let item of row.windows) {
        if (!item || !item.win) continue;
        sum += getMinWidth(item.win);
    }

    const gaps = GAP * Math.max(0, row.windows.length - 1);
    return sum + gaps;
}

// ──────────────────────────────────────────────────────────────
// Znajduje następny możliwy układ (z ograniczeniem MAX_FIRST_ROW)
// ──────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────
// Znajduje następny możliwy i ODMENNY układ
// (respektuje MAX_FIRST_ROW + rzeczywistą liczbę okien)
// ──────────────────────────────────────────────────────────────
function findNextPossibleLayout(currentMode, ordered, usable) {
    const n = ordered.length;

    // ───── dynamiczny limit Top N (nie więcej niż okien) ─────
    const effectiveMaxTop = Math.min(MAX_FIRST_ROW, n);

    const candidates = [-1, 0];                    // Left Master + Auto Grid

    // Top 1 … effectiveMaxTop
    for (let i = effectiveMaxTop; i >= 1; i--) {
        candidates.unshift(i);
    }

    let idx = candidates.indexOf(currentMode);
    if (idx === -1) idx = 0;

    // Szukamy następnego układu, który jest inny i się mieści
    for (let i = 1; i < candidates.length + 10; i++) {   // +10 = safety
        const nextMode = candidates[(idx + i) % candidates.length];

        if (nextMode <= 0) {
            // Auto Grid i Left Master zawsze są dozwolone
            return nextMode;
        }

        // Sprawdzenie czy Top N się realnie mieści
        let minSum = 0;
        const count = Math.min(nextMode, n);
        for (let j = 0; j < count; j++) {
            minSum += getMinWidth(ordered[j]);
        }
        const usableW = usable.width - GAP * Math.max(0, count - 1);

        if (minSum <= usableW) {
            return nextMode;
        }
    }

    return 0; // ostateczny fallback = Auto Grid
}



// ──────────────────────────────────────────────────────────────
// HELPER: maksymalna liczba okien w pierwszym rzędzie, która się realnie mieści
// ──────────────────────────────────────────────────────────────
function getMaxPossibleFirstRowCount(ordered, usable) {
    if (!ordered || ordered.length === 0) return 1;
    let maxN = ordered.length;
    while (maxN > 1) {
        let minSum = 0;
        for (let i = 0; i < maxN; i++) {
            if (i >= ordered.length) break;
            minSum += getMinWidth(ordered[i]);
        }
        const usableW = usable.width - GAP * Math.max(0, maxN - 1);
        if (minSum <= usableW) {
            return maxN;
        }
        maxN--;
    }
    return 1;
}

// ──────────────────────────────────────────────────────────────
// AUTO-SKIP niemożliwych firstRowMode – przechodzi do następnego możliwego
// ──────────────────────────────────────────────────────────────
function findNextPossibleFirstRowMode(currentMode, ordered, usable) {
    const possibleModes = [-1, 0]; // Left Master i Auto Grid zawsze na końcu

    // Dodajemy wszystkie sensowne Top N (od największego do 1)
    const maxPossible = getMaxPossibleFirstRowCount(ordered, usable);
    for (let n = maxPossible; n >= 1; n--) {
        possibleModes.unshift(n); // wstawiamy na początek
    }

    // Usuwamy duplikaty
    const unique = [...new Set(possibleModes)];

    let idx = unique.indexOf(currentMode);
    if (idx === -1) idx = 0;

    // Zaczynamy od następnego po obecnym
    for (let i = 1; i < unique.length; i++) {
        const nextIdx = (idx + i) % unique.length;
        const candidate = unique[nextIdx];

        if (candidate <= 0) return candidate; // Left / Auto zawsze akceptujemy

        // Sprawdzamy czy ten Top N się mieści
        let minSum = 0;
        for (let j = 0; j < candidate && j < ordered.length; j++) {
            minSum += getMinWidth(ordered[j]);
        }
        const usableW = usable.width - GAP * Math.max(0, candidate - 1);
        if (minSum <= usableW) {
            return candidate;
        }
    }
    return 0; // fallback na Auto Grid
}


function getMinWidth(win) {
    if (!win || win.deleted) {
        return 240;
    }

    // Najbardziej wiarygodne źródło – minimumSize
    if (win.minimumSize && typeof win.minimumSize.width === "number" && win.minimumSize.width > 0) {
        return Math.max(180, Math.min(620, win.minimumSize.width));   // twardy cap
    }

    // Starsza właściwość (dla kompatybilności)
    if (win.minSize && typeof win.minSize.width === "number" && win.minSize.width > 0) {
        return Math.max(180, Math.min(620, win.minSize.width));
    }

    // Fallback na podstawie resourceClass / resourceName
    const cls = (win.resourceClass || "").toLowerCase();
    const name = (win.resourceName || "").toLowerCase();

    if (cls.includes("brave") || cls.includes("chrome") || cls.includes("chromium") ||
        cls.includes("electron") || cls.includes("vscode") || name.includes("brave")) {
        return 460;        // bezpieczna wartość dla Brave (działa dobrze w praktyce)
    }

    if (cls.includes("konsole") || cls.includes("terminal") || cls.includes("kitty") || cls.includes("alacritty")) {
        return 280;
    }

    // Domyślna wartość dla pozostałych aplikacji
    return 260;
}

function getMinHeight(win) {
    if (!win || win.deleted) {
        return 160;
    }

    if (win.minimumSize && typeof win.minimumSize.height === "number" && win.minimumSize.height > 0) {
        return Math.max(120, Math.min(820, win.minimumSize.height));
    }

    if (win.minSize && typeof win.minSize.height === "number" && win.minSize.height > 0) {
        return Math.max(120, Math.min(820, win.minSize.height));
    }

    const cls = (win.resourceClass || "").toLowerCase();

    if (cls.includes("konsole") || cls.includes("terminal")) {
        return 180;
    }

    if (cls.includes("brave") || cls.includes("chrome") || cls.includes("chromium") ||
        cls.includes("electron") || cls.includes("vscode")) {
        return 260;
    }

    return 180;
}






function applyLayoutModel(model, area, skipClient = null) {

    if (!model || !model.rows) return;

    // 🔥 HARD STOP — absolutna ochrona
    if (!canApplyLayoutModel(model, area)) {
        if (DEBUG) print("applyLayoutModel BLOCKED (invalid layout)");
        return;
    }

    scriptGeometryChange = true;

    try {

        // ───────── LEFT MAIN ─────────
        if (model.leftMain) {

            const mainWin = model.leftMain.win;
            const mainW = Math.max(1, Math.round(model.leftMain.widthRatio * area.width));

            if (mainWin && !mainWin.deleted && !(skipClient && mainWin === skipClient)) {
                mainWin.frameGeometry = {
                    x: area.x,
                    y: area.y,
                    width: mainW,
                    height: area.height
                };
            }

            let y = area.y;
            const rightWidthTotal = Math.max(1, area.width - mainW - GAP);

            const rowHeights = distributeSizesWithMin(
                model.rows,
                area.height,
                GAP,
                row => {
                    let m = 0;
                    for (let w of row.windows) m = Math.max(m, getMinHeight(w.win));
                    return m;
                },
                row => row.heightRatio
            );

            for (let r = 0; r < model.rows.length; r++) {

                const row = model.rows[r];
                const rowH = Math.max(1, rowHeights[r]);

                let x = area.x + mainW + GAP;

                const widths = distributeSizesWithMin(
                    row.windows,
                    rightWidthTotal,
                    GAP,
                    item => getMinWidth(item.win),
                    item => item.widthRatio
                );

                for (let i = 0; i < row.windows.length; i++) {

                    const item = row.windows[i];
                    const width = Math.max(1, widths[i]);

                    if (item.win && !item.win.deleted && !(skipClient && item.win === skipClient)) {
                        item.win.frameGeometry = {
                            x: x,
                            y: y,
                            width: width,
                            height: rowH
                        };
                    }

                    x += width + GAP;
                }

                y += rowH + GAP;
            }

            return;
        }

        // ───────── GRID ─────────
        let y = area.y;

        const rowHeights = distributeSizesWithMin(
            model.rows,
            area.height,
            GAP,
            row => {
                let m = 0;
                for (let w of row.windows) m = Math.max(m, getMinHeight(w.win));
                return m;
            },
            row => row.heightRatio
        );

        for (let r = 0; r < model.rows.length; r++) {

            const row = model.rows[r];
            const rowH = Math.max(1, rowHeights[r]);

            let x = area.x;

            const widths = distributeSizesWithMin(
                row.windows,
                area.width,
                GAP,
                item => getMinWidth(item.win),
                item => item.widthRatio
            );

            for (let i = 0; i < row.windows.length; i++) {

                const item = row.windows[i];
                const width = Math.max(1, widths[i]);

                if (item.win && !item.win.deleted && !(skipClient && item.win === skipClient)) {
                    item.win.frameGeometry = {
                        x: x,
                        y: y,
                        width: width,
                        height: rowH
                    };
                }

                x += width + GAP;
            }

            y += rowH + GAP;
        }

    } finally {
        scriptGeometryChange = false;
    }
}

function syncStateWithModel() {

    if (!layoutModel) return;

    // LEFT MAIN
    if (layoutModel.leftMain) {
        setLeftRatio(layoutModel.leftMain.widthRatio / (1 - layoutModel.leftMain.widthRatio));
    }

    // TOP ROW
    if (layoutModel.rows && layoutModel.rows.length > 1) {
        const first = layoutModel.rows[0].heightRatio;
        const rest  = 1 - first;

        if (rest > 0) {
            setTopRatio(first / rest);
        }
    }

    // 🔥 KLUCZ – NIE resetujemy firstRowMode!
    // bo to jest struktura layoutu, nie proporcja

    //if (DEBUG) print("State synced with model");
}


function getMinGridWidth(model) {
    if (!model || !model.rows) return 0;

    let maxRowMin = 0;

    for (let row of model.rows) {
        const rowMin = getMinRowWidth(row);
        if (rowMin > maxRowMin) {
            maxRowMin = rowMin;
        }
    }

    return maxRowMin;
}

function clampLeftMainWidth(newMainW, usable, layoutModel, activeRow = null) {

    const minLeft = getMinWidth(layoutModel.leftMain.win);

    const minGridGlobal = getMinGridWidth(layoutModel);
    const minGridRow = activeRow ? getMinRowWidth(activeRow) : 0;

    // 🔥 KLUCZ: bierzemy NAJWIĘKSZE ograniczenie
    const minGrid = Math.max(minGridGlobal, minGridRow);

    const maxMain = usable.width - GAP - minGrid;

    // fallback bezpieczeństwa
    if (maxMain <= minLeft) {
        return minLeft;
    }

    return Math.max(minLeft, Math.min(maxMain, newMainW));
}




function getMinRowHeight(row) {

    if (!row || !row.windows) return 0;

    let maxH = 0;

    for (let item of row.windows) {

        if (!item || !item.win) continue;

        maxH = Math.max(maxH, getMinHeight(item.win));
    }

    return maxH;
}


function recomputeHeightsFromGeometry(model, usable, activeWin) {

    if (!model || model.rows.length < 2) return;

    const edge = resizeEdges.get(activeWin);
    if (!edge) return;

    const g = activeWin.frameGeometry;

    const totalGap = GAP * (model.rows.length - 1);
    const usableH = usable.height - totalGap;
    if (usableH <= 0) return;

    let rowIndex = -1;

    for (let r = 0; r < model.rows.length; r++) {
        for (let item of model.rows[r].windows) {
            if (item.win === activeWin) {
                rowIndex = r;
                break;
            }
        }
        if (rowIndex !== -1) break;
    }

    if (rowIndex === -1) return;

    const movingBottom =
        Math.abs((g.y + g.height) - (edge.lastY + edge.lastH)) >
        Math.abs(g.y - edge.lastY);

    let upperRow, lowerRow, isUpper;

    if (movingBottom) {
        if (rowIndex >= model.rows.length - 1) return;
        upperRow = model.rows[rowIndex];
        lowerRow = model.rows[rowIndex + 1];
        isUpper = true;
    } else {
        if (rowIndex <= 0) return;
        upperRow = model.rows[rowIndex - 1];
        lowerRow = model.rows[rowIndex];
        isUpper = false;
    }

    const upperH = upperRow.heightRatio * usableH;
    const lowerH = lowerRow.heightRatio * usableH;
    const pairSum = upperH + lowerH;

    // 🔥 delta względem modelu
    const realDelta = g.height - (isUpper ? upperH : lowerH);

    if (Math.abs(realDelta) < 1.5) return;

    let newUpperH, newLowerH;

    if (isUpper) {
        newUpperH = upperH + realDelta;
        newLowerH = pairSum - newUpperH;
    } else {
        newLowerH = lowerH + realDelta;
        newUpperH = pairSum - newLowerH;
    }

    const minUpper = getMinRowHeight(upperRow);
    const minLower = getMinRowHeight(lowerRow);

    if (newUpperH < minUpper) {
        newUpperH = minUpper;
        newLowerH = pairSum - newUpperH;
    }

    if (newLowerH < minLower) {
        newLowerH = minLower;
        newUpperH = pairSum - newLowerH;
    }

    upperRow.heightRatio = newUpperH / usableH;
    lowerRow.heightRatio = newLowerH / usableH;

    edge.lastY = g.y;
    edge.lastH = g.height;
}

function recomputeRowFromGeometry(row, usableWidth, activeWin) {
    if (!row || row.windows.length < 2) return;

    const edge = resizeEdges.get(activeWin);
    if (!edge) return;

    const g = activeWin.frameGeometry;

    const totalGap = GAP * (row.windows.length - 1);
    const usable = usableWidth - totalGap;
    if (usable <= 0) return;

    let idx = -1;
    for (let i = 0; i < row.windows.length; i++) {
        if (row.windows[i].win === activeWin) {
            idx = i;
            break;
        }
    }
    if (idx === -1) return;

    const activeItem = row.windows[idx];

    // 🔥 KLUCZ: delta względem modelu, ale bazowana na REAL width
    const modelWidth = activeItem.widthRatio * usable;
    const realDelta = g.width - modelWidth;

    if (Math.abs(realDelta) < 1.5) return;

    const draggingRightEdge =
        Math.abs(g.x + g.width - (edge.lastX + edge.lastW)) >
        Math.abs(g.x - edge.lastX);

    let leftItem, rightItem, deltaForLeft;

    if (draggingRightEdge) {
        if (idx + 1 >= row.windows.length) return;
        leftItem = activeItem;
        rightItem = row.windows[idx + 1];
        deltaForLeft = realDelta;
    } else {
        if (idx - 1 < 0) return;
        leftItem = row.windows[idx - 1];
        rightItem = activeItem;
        deltaForLeft = -realDelta;
    }

    let leftW = leftItem.widthRatio * usable;
    let rightW = rightItem.widthRatio * usable;
    const pairSum = leftW + rightW;

    let newLeftW = leftW + deltaForLeft;

    const minLeft = getMinWidth(leftItem.win);
    const minRight = getMinWidth(rightItem.win);

    newLeftW = Math.max(minLeft, Math.min(newLeftW, pairSum - minRight));

    const newRightW = pairSum - newLeftW;

    leftItem.widthRatio = newLeftW / usable;
    rightItem.widthRatio = newRightW / usable;

    edge.lastX = g.x;
    edge.lastW = g.width;
    edge.lastY = g.y;
    edge.lastH = g.height;
}


function recomputeLeftMainFromGeometry(model, usable, activeWin) {
    if (!model || !model.leftMain || model.leftMain.win !== activeWin) return;

    const edge = resizeEdges.get(activeWin);
    if (!edge) return;

    const g = activeWin.frameGeometry;

    // 🔥 REAL WIDTH (zamiast modelu)
    const realMainW = g.width;

    // clamp
    let newMainW = clampLeftMainWidth(realMainW, usable, model);

    model.leftMain.widthRatio = newMainW / usable.width;

    const newGridW = usable.width - newMainW - GAP;

    // 🔥 KLUCZ: używamy REALNEJ geometrii okien
    for (let row of model.rows) {
        if (!row.windows || row.windows.length === 0) continue;

        for (let i = 0; i < row.windows.length; i++) {

            const win = row.windows[i].win;
            if (!win || win.deleted) continue;

            const gw = win.frameGeometry.width;

            // 🔥 ratio liczone z REAL px
            row.windows[i].widthRatio = gw / newGridW;
        }
    }

    // update edge
    edge.lastX = g.x;
    edge.lastW = g.width;
    edge.lastY = g.y;
    edge.lastH = g.height;
}

function recomputeMainFromGridBoundary(model, usable, activeWin, row, winIndex) {

    if (!model.leftMain) return;
    if (winIndex !== 0) return;

    const edge = resizeEdges.get(activeWin);
    if (!edge) return;

    const g = activeWin.frameGeometry;

    const currentMainW = model.leftMain.widthRatio * usable.width;
    const currentGridW = usable.width - currentMainW - GAP;

    const item = row.windows[0];

    const currentColW = item.widthRatio * currentGridW;

    const realDelta = currentColW - g.width;
    if (Math.abs(realDelta) < 1.5) return;

    // ───── MAIN ─────
    let newMainW = currentMainW + realDelta;
    newMainW = clampLeftMainWidth(newMainW, usable, model);

    const appliedDelta = newMainW - currentMainW;

    model.leftMain.widthRatio = newMainW / usable.width;

    const newGridW = usable.width - newMainW - GAP;

    // ───── PIERWSZA KOLUMNA ─────
    let newColW = currentColW - appliedDelta;

    const minW = getMinWidth(item.win);
    newColW = Math.max(minW, newColW);

    if (newColW > newGridW) newColW = newGridW;

    item.widthRatio = newColW / newGridW;

    // ───── 🔥 KLUCZ: RESZTA OKIEN – ZACHOWAJ PX ─────
    for (let r of model.rows) {

        for (let i = 1; i < r.windows.length; i++) {

            const w = r.windows[i];

            const oldPx = w.widthRatio * currentGridW;

            // 🔥 utrzymujemy px → zmieniamy ratio
            w.widthRatio = oldPx / newGridW;
        }
    }

    edge.lastX = g.x;
    edge.lastW = g.width;
    edge.lastY = g.y;
    edge.lastH = g.height;
}




function updateLayoutFromGeometry(activeWin) {
    if (!layoutModel || !activeWin || activeWin.deleted) return;
    if (scriptGeometryChange) return;

    const area = workspace.clientArea(
        KWin.FullScreenArea,
        workspace.activeScreen,
        workspace.currentDesktop
    );

    const usable = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    const edge = resizeEdges.get(activeWin);
    if (!edge) return;

    const g = activeWin.frameGeometry;

    const dx = g.width - edge.lastW;
    const dy = g.height - edge.lastH;

    const isCornerResize = Math.abs(dx) > 2 && Math.abs(dy) > 2;

    const isLeftMainMode = !!layoutModel.leftMain;
    const mainWin = isLeftMainMode ? layoutModel.leftMain.win : null;

    // ───── znajdź row + index ─────
    let targetRow = null;
    let winIndex = -1;

    for (let r = 0; r < layoutModel.rows.length; r++) {
        const row = layoutModel.rows[r];
        for (let i = 0; i < row.windows.length; i++) {
            if (row.windows[i].win === activeWin) {
                targetRow = row;
                winIndex = i;
                break;
            }
        }
        if (targetRow) break;
    }

    // ==========================================================
    // LEFT MAIN / BOUNDARY
    // ==========================================================
    let isMainBoundary = false;

    if (isLeftMainMode) {
        if (activeWin === mainWin) {
            isMainBoundary = true;
        }
        else if (targetRow && winIndex === 0) {
            isMainBoundary = true;
        }
    }

    if (isMainBoundary) {

        // ───── resize MAIN ─────
        if (activeWin === mainWin) {

            recomputeLeftMainFromGeometry(layoutModel, usable, activeWin);

        }
        // ───── resize pierwszej kolumny GRID ─────
        else if (targetRow && winIndex === 0) {

            const deltaLeft  = g.x - edge.lastX;
            const deltaRight = (g.x + g.width) - (edge.lastX + edge.lastW);

            const movingLeftEdge = Math.abs(deltaLeft) > Math.abs(deltaRight);

            if (movingLeftEdge) {

                // 👉 kontakt z main
                recomputeMainFromGridBoundary(
                    layoutModel,
                    usable,
                    activeWin,
                    targetRow,
                    winIndex
                );

            } else {

                // 👉 zwykły resize w grid (prawa krawędź)
                const usableWidthForRow = usable.width -
                    (layoutModel.leftMain.widthRatio * usable.width) - GAP;

                recomputeRowFromGeometry(
                    targetRow,
                    usableWidthForRow,
                    activeWin
                );
            }
        }
    }

    // ==========================================================
    // GRID RESIZE (pozostałe przypadki)
    // ==========================================================
    if (!isMainBoundary && targetRow && winIndex >= 0) {

        const usableWidthForRow = isLeftMainMode
            ? usable.width - (layoutModel.leftMain.widthRatio * usable.width) - GAP
            : usable.width;

        recomputeRowFromGeometry(
            targetRow,
            usableWidthForRow,
            activeWin
        );
    }

    // ==========================================================
    // VERTICAL RESIZE
    // ==========================================================
    if (
        layoutModel.rows.length > 1 &&
        (!isCornerResize || Math.abs(dy) >= Math.abs(dx))
    ) {
        recomputeHeightsFromGeometry(layoutModel, usable, activeWin);
    }

    // ───── APPLY ─────
    syncStateWithModel();

    scriptGeometryChange = true;
    applyLayoutModel(layoutModel, usable, activeWin);
    scriptGeometryChange = false;
}
// ──────────────────────────────────────────────────────────────
// 1. trackResizeEvents – z debugiem na wszystkie kluczowe decyzje
// ──────────────────────────────────────────────────────────────
// Globalne

// ──────────────────────────────────────────────────────────────
// LIVE RESIZE – throttlowany re-layout
// ──────────────────────────────────────────────────────────────



function scheduleLiveResizeUpdate(client) {
    if (!client || client.deleted) return;
    if (!layoutModel) return;
    if (scriptGeometryChange) return;
    if (!manualResizeInProgress) return;

    const g = client.frameGeometry;

    // 🔥 DEADZONE – ignoruj mikro zmiany
    if (lastResizeGeometry) {
        const dx = Math.abs(g.width - lastResizeGeometry.width);
        const dy = Math.abs(g.height - lastResizeGeometry.height);

        if (dx < 2 && dy < 2) return;
    }

    lastResizeGeometry = { width: g.width, height: g.height };
    lastResizeClient = client;

    if (resizeThrottleTimer) return;

    resizeThrottleTimer = new QTimer();
    resizeThrottleTimer.interval = LIVE_RESIZE_THROTTLE;

    resizeThrottleTimer.timeout.connect(() => {

        // 🔥 KLUCZ – robimy singleShot ręcznie
        resizeThrottleTimer.stop();
        resizeThrottleTimer = null;

        const c = lastResizeClient;
        if (!c || c.deleted) return;

        const area = workspace.clientArea(
            KWin.FullScreenArea,
            workspace.activeScreen,
            workspace.currentDesktop
        );

        const usable = {
            x: area.x + MARGIN,
            y: area.y + MARGIN,
            width: area.width - 2 * MARGIN,
            height: area.height - 2 * MARGIN
        };

        updateLayoutFromGeometry(c);

        scriptGeometryChange = true;
        applyLayoutModel(layoutModel, usable, c);
        scriptGeometryChange = false;
    });

    resizeThrottleTimer.start();
}

function trackResizeEvents(client) {

    if (!client || !client.normalWindow) return;
    if (client._kwin_resizeTracked) return;

    client._kwin_resizeTracked = true;

    let isResizing = false;

    client.moveResizedChanged.connect(function() {

        if (client.resize) {

            if (!isResizing) {
                isResizing = true;
                manualResizeInProgress = true;

                const g = client.frameGeometry;

                resizeEdges.set(client, {
                    lastX: g.x,
                    lastY: g.y,
                    lastW: g.width,
                    lastH: g.height,
                });

                if (DEBUG) print("[RESIZE START]");
            }

        } else {

            if (isResizing) {

                isResizing = false;
                manualResizeInProgress = false;

                if (DEBUG) print("[RESIZE END → NORMALIZE ONLY]");

                if (layoutModel) {

                    const area = workspace.clientArea(
                        KWin.FullScreenArea,
                        workspace.activeScreen,
                        workspace.currentDesktop
                    );

                    const usable = {
                        x: area.x + MARGIN,
                        y: area.y + MARGIN,
                        width: area.width - 2 * MARGIN,
                        height: area.height - 2 * MARGIN
                    };

                    // 🔥 nie odbudowujemy modelu – tylko normalizacja
                    normalizeModelWithConstraints(layoutModel, usable);

                    scriptGeometryChange = true;
                    applyLayoutModel(layoutModel, usable);
                    scriptGeometryChange = false;

                    syncStateWithModel();
                }

                // ─────────────────────────────────────────────
                // 🔥 RESET GLOBAL STATE (ważne!)
                // ─────────────────────────────────────────────
                lastResizeClient = null;
                lastResizeGeometry = null;

                // ─────────────────────────────────────────────
                // 🔥 OPÓŹNIONE usunięcie resizeEdges
                // ─────────────────────────────────────────────
                let cleanupTimer = new QTimer();
                cleanupTimer.interval = 100;

                cleanupTimer.timeout.connect(() => {
                    cleanupTimer.stop();
                    resizeEdges.delete(client);
                });

                cleanupTimer.start();

                scheduleRelayout(0);
            }
        }
    });

    client.frameGeometryChanged.connect(function() {
        if (!isResizing) return;
        if (scriptGeometryChange) return;

        scheduleLiveResizeUpdate(client);
    });
}

//-------------+_size--------------------------------
const RESIZE_STEP = 0.1;   // 8% – możesz zmienić (0.05–0.12 sensowne)

// ──────────────────────────────────────────────────────────────
// GROW / SHRINK ACTIVE WINDOW (ratio-based)
// ──────────────────────────────────────────────────────────────

function growActiveWindow() {
    resizeActiveWindowByStep(+RESIZE_STEP);
}

function shrinkActiveWindow() {
    resizeActiveWindowByStep(-RESIZE_STEP);
}

function resizeActiveWindowByStep(step) {

    const win = workspace.activeWindow;
    if (!win || !layoutModel || win.deleted) return;

    const area = workspace.clientArea(
        KWin.FullScreenArea,
        workspace.activeScreen,
        workspace.currentDesktop
    );

    const usable = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    const isLeftMainMode = !!layoutModel.leftMain;

    // ───── LEFT MAIN ─────
    if (isLeftMainMode && layoutModel.leftMain.win === win) {

        let current = layoutModel.leftMain.widthRatio;
        let newRatio = current + step;

        // clamp
        newRatio = Math.max(0.1, Math.min(0.9, newRatio));

        // 🔥 clamp do min constraints
        const newW = newRatio * usable.width;

        const clamped = clampLeftMainWidth(
            newW,
            usable,
            layoutModel
        );

        layoutModel.leftMain.widthRatio = clamped / usable.width;

        applyAndSync();
        return;
    }

    // ───── ZNAJDŹ ROW + INDEX ─────
    let targetRow = null;
    let rowIndex = -1;
    let idx = -1;

    for (let r = 0; r < layoutModel.rows.length; r++) {
        const row = layoutModel.rows[r];
        for (let i = 0; i < row.windows.length; i++) {
            if (row.windows[i].win === win) {
                targetRow = row;
                rowIndex = r;
                idx = i;
                break;
            }
        }
        if (targetRow) break;
    }

    if (!targetRow) return;

    // ───── HORIZONTAL (preferowane) ─────
    const hasNeighbor =
    idx < targetRow.windows.length - 1 ||
    idx > 0;

    if (hasNeighbor) {

        let neighborIdx = (idx < targetRow.windows.length - 1)
        ? idx + 1
        : idx - 1;

        const item = targetRow.windows[idx];
        const neighbor = targetRow.windows[neighborIdx];

        let thisRatio = item.widthRatio;
        let neighRatio = neighbor.widthRatio;

        const sum = thisRatio + neighRatio;

        let newThis = thisRatio + step;
        let newNeigh = sum - newThis;

        // 🔥 MIN constraints
        const usableWidth = isLeftMainMode
        ? usable.width - (layoutModel.leftMain.widthRatio * usable.width) - GAP
        : usable.width;

        const minThis = getMinWidth(win) / usableWidth;
        const minNeigh = getMinWidth(neighbor.win) / usableWidth;

        if (newThis < minThis) {
            newThis = minThis;
            newNeigh = sum - newThis;
        }

        if (newNeigh < minNeigh) {
            newNeigh = minNeigh;
            newThis = sum - newNeigh;
        }

        item.widthRatio = newThis;
        neighbor.widthRatio = newNeigh;

        applyAndSync();
        return;
    }

    // ───── VERTICAL fallback ─────
    if (layoutModel.rows.length > 1) {

        let neighborRow =
        (rowIndex < layoutModel.rows.length - 1)
        ? layoutModel.rows[rowIndex + 1]
        : layoutModel.rows[rowIndex - 1];

        if (!neighborRow) return;

        let thisRatio = targetRow.heightRatio;
        let neighRatio = neighborRow.heightRatio;

        const sum = thisRatio + neighRatio;

        let newThis = thisRatio + step;
        let newNeigh = sum - newThis;

        const usableHeight = usable.height;

        const minThis = getMinHeight(win) / usableHeight;
        const neighWin = neighborRow.windows[0]?.win;
        const minNeigh = getMinHeight(neighWin) / usableHeight;

        if (newThis < minThis) {
            newThis = minThis;
            newNeigh = sum - newThis;
        }

        if (newNeigh < minNeigh) {
            newNeigh = minNeigh;
            newThis = sum - newNeigh;
        }

        targetRow.heightRatio = newThis;
        neighborRow.heightRatio = newNeigh;

        applyAndSync();
    }
}


// ──────────────────────────────────────────────────────────────
// APPLY + SYNC helper
// ──────────────────────────────────────────────────────────────
function applyAndSync() {

    const area = workspace.clientArea(
        KWin.FullScreenArea,
        workspace.activeScreen,
        workspace.currentDesktop
    );

    const usable = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    scriptGeometryChange = true;
    applyLayoutModel(layoutModel, usable);
    scriptGeometryChange = false;

    syncStateWithModel();
}



//------------------reorder------------------------------------------------------------------------
const EDGE_TOLERANCE = GAP + 6;


function touchingRight(a, b) {

    const ga = a.frameGeometry;
    const gb = b.frameGeometry;

    const dist = gb.x - (ga.x + ga.width);

    return Math.abs(dist - GAP) <= EDGE_TOLERANCE;

}

function touchingLeft(a, b) {

    const ga = a.frameGeometry;
    const gb = b.frameGeometry;

    const dist = ga.x - (gb.x + gb.width);

    return Math.abs(dist - GAP) <= EDGE_TOLERANCE;

}

function touchingBottom(a, b) {

    const ga = a.frameGeometry;
    const gb = b.frameGeometry;

    const dist = gb.y - (ga.y + ga.height);

    return Math.abs(dist - GAP) <= EDGE_TOLERANCE;

}

function touchingTop(a, b) {

    const ga = a.frameGeometry;
    const gb = b.frameGeometry;

    const dist = ga.y - (gb.y + gb.height);

    return Math.abs(dist - GAP) <= EDGE_TOLERANCE;

}


function verticalOverlap(a, b) {
    const ga = a.frameGeometry;
    const gb = b.frameGeometry;
    const top    = Math.max(ga.y, gb.y);
    const bottom = Math.min(ga.y + ga.height, gb.y + gb.height);
    return (bottom - top) > 20;   // ← musi być min. 20 px nakładki w pionie
}

function horizontalOverlap(a, b) {
    const ga = a.frameGeometry;
    const gb = b.frameGeometry;
    const left  = Math.max(ga.x, gb.x);
    const right = Math.min(ga.x + ga.width, gb.x + gb.width);
    return (right - left) > 20;   // ← min. 20 px nakładki w poziomie
}





function getAllNeighbors(win, direction) {

    const wins = getVisibleWindows();
    const neighbors = [];
    for (let w of wins) {

        if (!w || w === win || w.deleted) continue;

        if (direction === "right") {
            if (touchingRight(win, w) && verticalOverlap(win, w))
                neighbors.push(w);
        }

        else if (direction === "left") {
            if (touchingLeft(win, w) && verticalOverlap(win, w))
                neighbors.push(w);
        }

        else if (direction === "top") {
            if (touchingTop(win, w) && horizontalOverlap(win, w))
                neighbors.push(w);
        }

        else if (direction === "bottom") {
            if (touchingBottom(win, w) && horizontalOverlap(win, w))
                neighbors.push(w);
        }
    }

    // SORT – krytyczne
    if (direction === "right")
        neighbors.sort((a,b)=>a.frameGeometry.x-b.frameGeometry.x);

    if (direction === "left")
        neighbors.sort((a,b)=>b.frameGeometry.x-a.frameGeometry.x);

    if (direction === "bottom")
        neighbors.sort((a,b)=>a.frameGeometry.y-b.frameGeometry.y);

    if (direction === "top")
        neighbors.sort((a,b)=>b.frameGeometry.y-a.frameGeometry.y);

    return neighbors;
}


function getBestNeighborInDirection(win, direction) {

    const neighbors = getAllNeighbors(win, direction);
    if (!neighbors || neighbors.length === 0) return null;

    const wc = centerOf(win);

    let best = null;
    let bestDist = Infinity;

    for (let n of neighbors) {
        const nc = centerOf(n);

        let dist;

        if (direction === "left" || direction === "right") {
            dist = Math.abs(nc.x - wc.x);
        } else {
            dist = Math.abs(nc.y - wc.y);
        }

        if (dist < bestDist) {
            bestDist = dist;
            best = n;
        }
    }

    return best;
}



function swapWindowsInOrder(w1, w2) {

    const order = getLastTiledOrder();
    const i1 = order.indexOf(w1);
    const i2 = order.indexOf(w2);

    if (i1 === -1 || i2 === -1) return;

    [order[i1], order[i2]] = [order[i2], order[i1]];

    setLastTiledOrder(order);
}


function swapWindowInDirection(direction) {

    var win = workspace.activeWindow;
    if (!win || !win.normalWindow) return;

    var neighbor = getBestNeighborInDirection(win, direction);
    if (!neighbor) return;

    if (DEBUG) {
        print("SWAP (hybrid): " +
        (win.caption || "?") + " <-> " +
        (neighbor.caption || "?") +
        " dir=" + direction);
    }

    const order = getLastTiledOrder();
    const inLayout =
    layoutModel &&
    order &&
    order.length > 0 &&
    order.includes(win) &&
    order.includes(neighbor);

    // ==========================================================
    // ✔ TRYB 1: layout istnieje → swap przez model
    // ==========================================================
    if (inLayout) {

        swapWindowsInOrder(win, neighbor);

        getCurrentState()._layoutDirty = true;

        scheduleRelayout(0);
        return;
    }

    // ==========================================================
    // ✔ TRYB 2: fallback → swap geometrii (jak oryginał)
    // ==========================================================
    scriptGeometryChange = true;

    try {

        var g1 = win.frameGeometry;
        var g2 = neighbor.frameGeometry;

        var newG1 = {
            x: g2.x,
            y: g2.y,
            width: g2.width,
            height: g2.height
        };

        var newG2 = {
            x: g1.x,
            y: g1.y,
            width: g1.width,
            height: g1.height
        };

        win.frameGeometry = newG1;
        neighbor.frameGeometry = newG2;

    } finally {
        scriptGeometryChange = false;
    }
}

// ──────────────────────────────────────────────────────────────
// MANUAL DROP REORDER
// ──────────────────────────────────────────────────────────────
function handleManualDrop(win) {
    if (!win || win.deleted) return;

    if (scriptGeometryChange) return;
    if (!getLastTiledOrder().includes(win)) return;

    const g = win.frameGeometry;
    if (g.width < 80 || g.height < 60) return;

    const endCenter = centerOf(win);
    if (movingStartCenter && distance(movingStartCenter, endCenter) < 40) {
        if (DEBUG) print("Drop ignorowany – brak realnego ruchu (resize?)");
        return;
    }

    const newIndex = indexOfClosestSlot(win);
    if (newIndex === -1) return;

    const order = getLastTiledOrder();
    const target = order[newIndex];
    if (!target) return;

    const ratio = overlapRatio(win.frameGeometry, target.frameGeometry);

    if (ratio < REORDER_SLOT_THRESHOLD) {
        if (DEBUG) print("Drop anulowany – za małe overlap");
        scheduleRelayout();
        return;
    }

    const i1 = order.indexOf(win);

    if (i1 === newIndex) return; // 🔥 brak sensu swapu

    [order[i1], order[newIndex]] = [order[newIndex], order[i1]];
    setLastTiledOrder(order);

    if (DEBUG) {
        print(`REORDER: ${win.caption || "?"} → slot ${newIndex}`);
    }

    getCurrentState()._layoutDirty = true;   // 🔥 ważne!

    scheduleRelayout();
}

function trackMoveEvents(c) {
    if (!c.normalWindow) return;
    if (c._kwin_moveTracked) return;

    c.moveResizedChanged.connect(() => {

        if (c.move && !movingWindow) {
            movingWindow = c;
            movingStartCenter = centerOf(c);
            return;
        }

        if (!c.move && movingWindow === c) {

            manualResizeInProgress = false;

            handleManualDrop(c);

            movingWindow = null;
            movingStartCenter = null;
        }

        if (!c.move && !c.resize) {
            manualResizeInProgress = false;
        }

    });

    c._kwin_moveTracked = true;
}


workspace.windowList().forEach(client => {
    if (!client) return;

    trackMoveEvents(client);
    trackResizeEvents(client);
});

// ──────────────────────────────────────────────────────────────
// DEBOUNCE
// ──────────────────────────────────────────────────────────────
var relayoutTimer = new QTimer();
relayoutTimer.singleShot = true;
relayoutTimer.interval = 70;
relayoutTimer.timeout.connect(function () {
    reLayout();
});

// Throttlowany live-relayout (tylko applyLayoutState – najszybsza ścieżka)


function scheduleRelayout(delay) {
    if (typeof delay === 'undefined') delay = 70;

    if (manualResizeInProgress) {
        if (DEBUG) print("scheduleRelayout zablokowane – manualResizeInProgress = true");
        return;
    }

    relayoutTimer.stop();
    relayoutTimer.interval = delay;
    relayoutTimer.start();

    if (DEBUG) print("scheduleRelayout uruchomione | delay = " + delay);
}

// ──────────────────────────────────────────────────────────────
// DESKTOP & ACTIVITY CHANGE HANDLERS
// ──────────────────────────────────────────────────────────────
function onDesktopChanged() {
    if (AUTO_LAYOUT_ON_DESKTOP_CHANGE && canAutoRetile()) {
        scheduleRelayout();
    }
}

function onActivityChanged() {
    if (AUTO_LAYOUT_ON_ACTIVITY_CHANGE && canAutoRetile()) {
        if (DEBUG) print("KLeftHandTiler: activity changed → scheduling retile");
        cachedScreenId = null;
        scheduleRelayout(120);
    }
}

if (AUTO_LAYOUT_ON_DESKTOP_CHANGE) {
    workspace.currentDesktopChanged.connect(onDesktopChanged);
}

if (workspace.currentActivityChanged) {
    workspace.currentActivityChanged.connect(onActivityChanged);
} else {
    if (DEBUG) print("KLeftHandTiler WARNING: currentActivityChanged signal not available – no auto-retile on activity switch");
}

function attachDesktopChangeHandler(client) {
    if (!client) return;
    if (typeof client.desktopsChanged !== 'function') return;
    if (client._kwin_desktopChangeAttached) return;
    client.desktopsChanged.connect(() => {
        if (!client || client.deleted) return;
        if (client.desktops.length === 0) return;
        const newDesktops = client.desktops;
        for (let key in states) {
            const [deskIdPart] = key.split(':');
            if (newDesktops.some(d => d.id === deskIdPart)) continue;
            const state = states[key];
            if (state && state.lastTiledOrder) {
                state.lastTiledOrder = state.lastTiledOrder.filter(w => w !== client);
            }
        }
        if ( canAutoRetile() &&
            newDesktops.some(d => d.id === workspace.currentDesktop.id)) {
            scheduleRelayout();
        }
    });
    client._kwin_desktopChangeAttached = true;
}

workspace.windowList().forEach(attachDesktopChangeHandler);

// ──────────────────────────────────────────────────────────────
// SPECIAL WINDOW IGNORE
// ──────────────────────────────────────────────────────────────
const IGNORED_RESOURCE_CLASSES = [
    "org.freedesktop.impl.portal.desktop.kde",
    "org.freedesktop.portal.Desktop",
    "xdg-desktop-portal"
];
const IGNORED_RESOURCE_NAMES = [
    "xdg-desktop-portal",
    "xdg-desktop-portal-kde"
];

function isIgnoredSpecialWindow(client) {
    if (!client) return false;
    const rClass = (client.resourceClass || "").toLowerCase();
    const rName = (client.resourceName || "").toLowerCase();
    return IGNORED_RESOURCE_CLASSES.some(cls => rClass.includes(cls)) ||
           IGNORED_RESOURCE_NAMES.some(name => rName.includes(name));
}

workspace.windowAdded.connect(client => {
    if (!client) return;
    if (isLauncher(client) || isIgnoredSpecialWindow(client)) {
        if (DEBUG) print("IGNORED windowAdded:", client.resourceClass);
        return;
    }
    trackMoveEvents(client);
    trackResizeEvents(client);
    trackWindowMinimizeRestore(client);
    attachDesktopChangeHandler(client);

    if (!(AUTO_LAYOUT_ON_NEW_WINDOW && canAutoRetile())) return;

    let timer = new QTimer();
    timer.interval = 160;
    timer.timeout.connect(() => {
        timer.stop();
        if (!client || client.deleted) return;
        if (isLauncher(client) || isIgnoredSpecialWindow(client)) return;

        const { ordered, visible } = getTiledOrder();
        const area = workspace.clientArea(
            KWin.FullScreenArea,
            workspace.activeScreen,
            workspace.currentDesktop
        );
        const usable = {
            x: area.x + MARGIN,
            y: area.y + MARGIN,
            width: area.width - 2 * MARGIN,
            height: area.height - 2 * MARGIN
        };

        if (visible.length > MAX_WINDOWS) {
            if (typeof floatingWindows !== "undefined") floatingWindows.add(client);
            showOSDSafe(`Too many windows!\nTiling only ${MAX_WINDOWS}`, "dialog-warning");
            scheduleRelayout(0);
            return;
        }

        let testOrdered = ordered.slice();
        if (!testOrdered.includes(client)) testOrdered.push(client);

        const testModel = buildAndValidateModel(testOrdered, usable);

        if (!testModel) {
            if (typeof floatingWindows !== "undefined") floatingWindows.add(client);
            const name = client.caption || client.resourceClass || "?";
            showOSDSafe("No space in the tile for:\n" + name, "dialog-warning");
            scheduleRelayout(0);
            return;
        }

        // Okno się mieści → brak OSD
        if (typeof floatingWindows !== "undefined") floatingWindows.delete(client);
        scheduleRelayout(0);
    });
    timer.start();
});

// ──────────────────────────────────────────────────────────────
// WINDOW REMOVED
// ──────────────────────────────────────────────────────────────
function isWindowInLayoutModel(model, client) {

    if (!model || !client) return false;

    // LEFT MAIN
    if (model.leftMain && model.leftMain.win === client) {
        return true;
    }

    // GRID / ROWS
    if (model.rows) {
        for (let row of model.rows) {
            for (let item of row.windows) {
                if (item && item.win === client) {
                    return true;
                }
            }
        }
    }

    return false;
}

function handleWindowRemoved(client) {

    if (!client) return;

    // 🔥 CLEANUP floating windows
    if (typeof floatingWindows !== "undefined") {
        floatingWindows.delete(client);
    }

    const currentOrder = getLastTiledOrder();

    // 🔥 tylko jeśli był w layout
    const wasTiled = currentOrder.includes(client);

    minimizedStack = minimizedStack.filter(w => w !== client && !w.deleted);

    // usuń z wszystkich stanów
    for (let key in states) {
        const state = states[key];
        if (state && state.lastTiledOrder) {
            state.lastTiledOrder = state.lastTiledOrder.filter(w => w !== client);
        }
    }

    // 🔥 KLUCZ: jeśli był tiled → wymuś przebudowę
    if (wasTiled) {
        if (DEBUG) print("WINDOW REMOVED → force rebuild");

        layoutModel = null;          // 💥 najważniejsze
        forceModelRebuild = true;    // dodatkowy bezpiecznik

        getCurrentState()._layoutDirty = true;
    }

    if (!AUTO_LAYOUT_ON_WINDOW_CLOSE || !canAutoRetile()) return;

    if (IGNORE_TRANSIENT_WINDOWS && (client.transient || client.modal)) return;
    if (IGNORE_TRANSIENT_WINDOWS && isIgnoredSpecialWindow(client)) return;
    if (isLauncher(client)) return;

    scheduleRelayout();
}

if (typeof workspace.windowRemoved === 'function') {
    workspace.windowRemoved.connect(handleWindowRemoved);
} else if (typeof workspace.clientRemoved === 'function') {
    workspace.clientRemoved.connect(handleWindowRemoved);
}

let lastScreenCount = workspace.screens?.length ?? 0;

function updateScreenCache() {
    const currentCount = workspace.screens?.length ?? 0;

    if (currentCount < lastScreenCount) {
        if (DEBUG) print("Screen removed → retile");
        cachedScreenId = null;
        scheduleRelayout(150);
    }

    lastScreenCount = currentCount;
}

if (workspace.screensChanged) {
    workspace.screensChanged.connect(updateScreenCache);
    if (DEBUG) print("KLeftHandTiler: connected to screensChanged signal");
} else {
    if (DEBUG) print("KLeftHandTiler WARNING: workspace.screensChanged signal not available");
}

// mtrackResizeEvents();

// ──────────────────────────────────────────────────────────────
// CLEANUP ORPHANED STATES
// ──────────────────────────────────────────────────────────────
function getDesktopId(desktopObj) {
    if (!workspace.desktops || workspace.desktops.length === 0) {
        if (DEBUG) print("KLeftHandTiler: workspace.desktops not ready yet");
        return "pending";
    }
    if (typeof desktopObj === "number") return desktopObj.toString();
    if (desktopObj && typeof desktopObj === "object") {
        if (desktopObj.id && typeof desktopObj.id === "string") return desktopObj.id;
        if (typeof desktopObj.x11DesktopNumber === "number") return desktopObj.x11DesktopNumber.toString();
        if (workspace.desktopGridWidth && workspace.desktopGridHeight) {
            const row = desktopObj.row ?? 0;
            const col = desktopObj.column ?? 0;
            return (row * workspace.desktopGridWidth + col + 1).toString();
        }
    }
    return null;
}

function cleanupOrphanedStates() {
    if (!workspace.desktops || workspace.desktops.length === 0) {
        if (DEBUG) print("KLeftHandTiler: workspace.desktops not ready yet");
        return;
    }
    const activeActivities = new Set(workspace.activities || []);
    const currentDesktops = new Set(
        workspace.desktops
            .map(getDesktopId)
            .filter(id => id !== null)
    );
    for (let key in states) {
        const [actId, deskIdPart] = key.split(':');
        if (!activeActivities.has(actId) || !currentDesktops.has(deskIdPart)) {
            if (DEBUG) print(`KLeftHandTiler: cleaning up orphaned state → ${key} (activity: ${actId}, desktop: ${deskIdPart})`);
            delete states[key];
        }
    }
}

cleanupOrphanedStates();

if (typeof workspace.desktopsChanged === "function") {
    workspace.desktopsChanged.connect(cleanupOrphanedStates);
}

if (typeof workspace.activitiesChanged === "function") {
    workspace.activitiesChanged.connect(cleanupOrphanedStates);
}
