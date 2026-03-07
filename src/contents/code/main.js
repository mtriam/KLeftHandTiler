print("KLeftHandTiler – loaded");

const DEBUG = false;  // change to true for verbose logging

// ──────────────────────────────────────────────────────────────
// GLOBAL VARIABLES & STATE
// ──────────────────────────────────────────────────────────────
let scriptGeometryChange = false;
let movingWindow = null;
let movingStartCenter = null;
let minimizedStack = [];
let lastTapTime = 0;
let smartTileLastTap = 0;
let smartTilePrevFirstRowMode = 0;

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
const IGNORE_TILING_1 = readConfig("ignoreWordsTiling1", "print,find,replace,confirm,settings,preferences,properties").split(",");
const IGNORE_TILING_2 = readConfig("ignoreWordsTiling2", "drukuj,znajdź,zamień,potwierdź,ustawienia,właściwości").split(",");
const IGNORE_TILING = [...IGNORE_TILING_1, ...IGNORE_TILING_2]
  .map(s => s.trim().toLowerCase())
  .filter(s => s.length > 0);
const IGNORE_CYCLING_1 = readConfig("ignoreWordsCycling1", "").split(",");
const IGNORE_CYCLING_2 = readConfig("ignoreWordsCycling2", "").split(",");
const IGNORE_CYCLING = [...IGNORE_CYCLING_1, ...IGNORE_CYCLING_2]
  .map(s => s.trim().toLowerCase())
  .filter(s => s.length > 0);
let autoRetileMode = AUTO_RETILE_MODE;
var IGNORE_TRANSIENT_WINDOWS = readConfig("ignoreTransientWindows", true);

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
    if (autoRetileMode === newMode) return;
    autoRetileMode = newMode;
    const modes = ["Off", "Tiled only", "Always"];
    if (DEBUG) print("KLeftHandTiler auto-retile mode changed to: " + modes[autoRetileMode]);
    if (canAutoRetile()) scheduleRelayout();
}

function setAutoRetileOff() { applyAutoRetileMode(0); }
function setAutoRetileTiledOnly() { applyAutoRetileMode(1); scheduleRelayout(); }
function setAutoRetileAlways() { applyAutoRetileMode(2); scheduleRelayout(); }

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
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

function getVisibleWindows() {
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
            !w.desktops.some(d => d === currentDesk || d.id === currentDesk.id) ||
            IGNORE_TILING.some(word => (w.caption || "").toLowerCase().includes(word))) {
            return false;
        }
        if (currentActivity &&
            !w.onAllActivities &&
            !w.activities.includes(currentActivity)) {
            return false;
        }
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
            IGNORE_CYCLING.some(word => (w.caption || "").toLowerCase().includes(word))) {
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

// ──────────────────────────────────────────────────────────────
// CORE ENGINE
// ──────────────────────────────────────────────────────────────
function reLayout() {
    const wins = getVisibleWindows();
    if (wins.length === 0) return;
    if (wins.every(w => w.minimized)) return;

    for (let w of wins) {
        if (!w || w.deleted) continue;
        if (w.fullScreen) w.fullScreen = false;
        if (w.maximizeMode !== 0) w.setMaximize(false, false);
    }

    let ordered = [];
    const currentOrder = getLastTiledOrder();
    for (let w of currentOrder) {
        if (wins.includes(w) && !w.deleted) ordered.push(w);
    }
    for (let w of wins) {
        if (!ordered.includes(w)) ordered.push(w);
    }
    setLastTiledOrder(ordered);

    const area = workspace.clientArea(KWin.FullScreenArea, workspace.activeScreen, workspace.currentDesktop);
    const usable = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    scriptGeometryChange = true;
    tileGrid(ordered, usable);
    scriptGeometryChange = false;

    if (workspace.activeWindow) {
        workspace.raiseWindow(workspace.activeWindow);
    }
}

// ──────────────────────────────────────────────────────────────
// GRID LAYOUT
// ──────────────────────────────────────────────────────────────
function tileGrid(ordered, area) {
    const count = ordered.length;
    if (count === 0) return;

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    if (count === 2) {
        const w1 = ordered[0];
        const w2 = ordered[1];
        const vertical = getFirstRowWindowsMode() > 0;
        if (vertical) {
            const total = getTopRatio() + 1;
            const topH = Math.floor(area.height * getTopRatio() / total);
            const botH = area.height - topH - GAP;
            w1.frameGeometry = { x: area.x, y: area.y, width: area.width, height: topH };
            w2.frameGeometry = { x: area.x, y: area.y + topH + GAP, width: area.width, height: botH };
        } else {
            const total = getLeftRatio() + 1;
            const leftW = Math.floor(area.width * getLeftRatio() / total);
            const rightW = area.width - leftW - GAP;
            w1.frameGeometry = { x: area.x, y: area.y, width: leftW, height: area.height };
            w2.frameGeometry = { x: area.x + leftW + GAP, y: area.y, width: rightW, height: area.height };
        }
        return;
    }

    if (getFirstRowWindowsMode() === -1 && count > 1) {
        let idx = 0;
        const mainWin = ordered[idx++];
        const rightCount = count - 1;
        const leftW = Math.floor(area.width * getLeftRatio() / (getLeftRatio() + 1));
        const rightW = area.width - leftW - GAP;
        mainWin.frameGeometry = { x: area.x, y: area.y, width: leftW, height: area.height };
        let rightCols = 1;
        if (rightCount <= 3) rightCols = 1;
        else if (rightCount <= 8) rightCols = 2;
        else rightCols = Math.min(3, Math.ceil(Math.sqrt(rightCount)));
        const rightRows = Math.ceil(rightCount / rightCols);
        const rowH = Math.floor((area.height - (rightRows - 1) * GAP) / rightRows);
        let winIdx = idx;
        let xStart = area.x + leftW + GAP;
        for (let r = 0; r < rightRows; r++) {
            const inRow = Math.min(rightCols, rightCount - r * rightCols);
            if (inRow <= 0) break;
            let colW = Math.floor((rightW - (inRow - 1) * GAP) / inRow);
            let x = xStart;
            for (let c = 0; c < inRow && winIdx < count; c++) {
                const w = ordered[winIdx++];
                let thisW = (c === inRow - 1) ? rightW - (x - xStart) : colW;
                if (thisW < 60) thisW = colW;
                w.frameGeometry = { x, y: area.y + r * (rowH + GAP), width: thisW, height: rowH };
                x += thisW + GAP;
            }
        }
        return;
    }

    const base = Math.floor(count / rows);
    const remainder = count % rows;
    const autoFirstRow = base + (remainder > 0 ? 1 : 0);
    let firstRowWindows = autoFirstRow;
    if (getFirstRowWindowsMode() > 0) {
        firstRowWindows = Math.min(getFirstRowWindowsMode(), count);
    } else if (getFirstRowWindowsMode() === -1) {
        firstRowWindows = 1;
    }
    let firstRowH = area.height;
    let otherRowH = area.height;
    if (rows > 1) {
        const totalWeight = getTopRatio() + (rows - 1);
        firstRowH = Math.floor(area.height * getTopRatio() / totalWeight);
        otherRowH = Math.floor((area.height - firstRowH - (rows - 1) * GAP) / (rows - 1));
    }
    let idx = 0;
    let y = area.y;
    for (let row = 0; idx < count; row++) {
        const isFirst = row === 0;
        let windowsInRow = isFirst ? firstRowWindows : Math.ceil((count - idx) / Math.max(1, rows - row));
        const rowH = isFirst ? firstRowH : otherRowH;
        if (isFirst && windowsInRow > 1) {
            const normalCount = windowsInRow - 1;
            const total = getLeftRatio() + normalCount;
            const mainW = Math.floor(area.width * getLeftRatio() / total);
            const normW = Math.floor((area.width - mainW - normalCount * GAP) / normalCount);
            const mainWin = ordered[idx++];
            mainWin.frameGeometry = { x: area.x, y, width: mainW, height: rowH };
            let x = area.x + mainW + GAP;
            for (let i = 0; i < normalCount && idx < count; i++) {
                const w = ordered[idx++];
                w.frameGeometry = { x, y, width: normW, height: rowH };
                x += normW + GAP;
            }
        } else {
            const colW = Math.floor((area.width - (windowsInRow - 1) * GAP) / windowsInRow);
            let x = area.x;
            for (let i = 0; i < windowsInRow && idx < count; i++) {
                const w = ordered[idx++];
                w.frameGeometry = { x, y, width: colW, height: rowH };
                x += colW + GAP;
            }
        }
        y += rowH + GAP;
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
    minimizeIgnoredWindows();
    scheduleRelayout();
}

// ──────────────────────────────────────────────────────────────
// CYCLE FIRST ROW MODE
// ──────────────────────────────────────────────────────────────
function cycleFirstRowWindows() {
    const visible = getVisibleWindows();
    const count = visible.length;
    if (count < 2) return;
    if (count === 2) {
        const mode = getFirstRowWindowsMode();
        setFirstRowWindowsMode(mode > 0 ? 0 : 1);
        minimizeIgnoredWindows();
        scheduleRelayout();
        return;
    }
    const layouts = [-1, 0];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const base = Math.floor(count / rows);
    const remainder = count % rows;
    const autoFirstRow = base + (remainder > 0 ? 1 : 0);
    for (let i = 1; i <= autoFirstRow; i++) {
        if (i !== autoFirstRow) layouts.push(i);
    }
    const uniqueLayouts = [...new Set(layouts)];
    let idx = uniqueLayouts.indexOf(getFirstRowWindowsMode());
    if (idx === -1) idx = 0;
    setFirstRowWindowsMode(uniqueLayouts[(idx + 1) % uniqueLayouts.length]);
    minimizeIgnoredWindows();
    scheduleRelayout();
}

// ──────────────────────────────────────────────────────────────
// ROTATE WINDOWS
// ──────────────────────────────────────────────────────────────
function rotateWindowsClockwiseKeepFocus() {
    const wins = getVisibleWindows();
    if (wins.length < 2) return;
    const activeBefore = workspace.activeWindow;
    let order = getLastTiledOrder();
    order = [order[order.length - 1], ...order.slice(0, -1)].filter(w => wins.includes(w) && !w.deleted);
    setLastTiledOrder(order);
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
        if (AUTO_LAYOUT_ON_WINDOW_RESTORE && canAutoRetile() && !c.minimized) {
            let timer = new QTimer();
            timer.singleShot = true;
            timer.interval = 100;
            timer.timeout.connect(() => {
                if (canAutoRetile()) {
                    if (DEBUG) print("KLeftHandTiler: retile after restoring minimized window");
                    scheduleRelayout();
                }
            });
            timer.start();
        }
        if (AUTO_LAYOUT_ON_WINDOW_MINIMIZE && canAutoRetile() && c.minimized) {
            let timer = new QTimer();
            timer.singleShot = true;
            timer.interval = 80;
            timer.timeout.connect(() => {
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

// ──────────────────────────────────────────────────────────────
// MANUAL DROP REORDER
// ──────────────────────────────────────────────────────────────
function handleManualDrop(win) {
    if (scriptGeometryChange) return;
    if (!getLastTiledOrder().includes(win)) return;
    const endCenter = centerOf(win);
    if (movingStartCenter && distance(movingStartCenter, endCenter) < 40) return;
    const newIndex = indexOfClosestSlot(win);
    if (newIndex === -1) return;
    const order = getLastTiledOrder();
    const target = order[newIndex];
    if (!target) return;
    const ratio = overlapRatio(win.frameGeometry, target.frameGeometry);
    if (ratio < REORDER_SLOT_THRESHOLD) {
        scheduleRelayout();
        return;
    }
    const i1 = order.indexOf(win);
    [order[i1], order[newIndex]] = [order[newIndex], order[i1]];
    setLastTiledOrder(order);
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
            handleManualDrop(c);
            movingWindow = null;
            movingStartCenter = null;
        }
    });
    c._kwin_moveTracked = true;
}

workspace.windowAdded.connect(client => {
    if (client) trackMoveEvents(client);
});

workspace.windowList().forEach(client => {
    if (client) trackMoveEvents(client);
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

function scheduleRelayout(delay = 70) {
    relayoutTimer.stop();
    relayoutTimer.interval = delay;
    relayoutTimer.start();
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
        if (AUTO_LAYOUT_ON_WINDOW_MOVE && canAutoRetile() &&
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

// ──────────────────────────────────────────────────────────────
// WINDOW ADDED
// ──────────────────────────────────────────────────────────────
workspace.windowAdded.connect(client => {
    attachDesktopChangeHandler(client);
    if (!client) return;
    if (IGNORE_TRANSIENT_WINDOWS && (client.transient || client.modal)) return;
    if (IGNORE_TRANSIENT_WINDOWS && isIgnoredSpecialWindow(client)) return;
    if (isLauncher(client)) return;
    if (AUTO_LAYOUT_ON_NEW_WINDOW && canAutoRetile()) {
        let timer = new QTimer();
        timer.singleShot = true;
        timer.interval = 120;
        timer.timeout.connect(() => {
            if (!client || client.deleted || !client.managed || !client.normalWindow ||
                client.transient || client.modal) return;
            const currentDesk = workspace.currentDesktop;
            if (!client.desktops.some(d => d.id === currentDesk.id)) return;
            if (IGNORE_TRANSIENT_WINDOWS && isIgnoredSpecialWindow(client)) return;
            const caption = (client.caption || "").toLowerCase();
            if (IGNORE_TILING.some(word => caption.includes(word))) return;
            if (canAutoRetile()) scheduleRelayout();
        });
        timer.start();
    }
});

// ──────────────────────────────────────────────────────────────
// WINDOW REMOVED
// ──────────────────────────────────────────────────────────────
function handleWindowRemoved(client) {

    // 1️⃣ Jeśli to nie było okno w layout — ignoruj
    const currentOrder = getLastTiledOrder();
    if (!currentOrder.includes(client)) {
        if (DEBUG) print("Ignored removal (not tiled window)");
        return;
    }

    minimizedStack = minimizedStack.filter(w => w !== client && !w.deleted);

    for (let key in states) {
        const state = states[key];
        if (state && state.lastTiledOrder) {
            state.lastTiledOrder = state.lastTiledOrder.filter(w => w !== client);
        }
    }

    if (!AUTO_LAYOUT_ON_WINDOW_CLOSE || !canAutoRetile()) return;

    if (IGNORE_TRANSIENT_WINDOWS && client && (client.transient || client.modal)) return;
    if (IGNORE_TRANSIENT_WINDOWS && client && isIgnoredSpecialWindow(client)) return;
    if (client && isLauncher(client)) return;

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
