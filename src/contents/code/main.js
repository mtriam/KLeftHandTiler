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
registerShortcut("CycleAutoRetile","---Cycle auto-retile mode","Ctrl+Shift+F2",cycleAutoRetileMode);
registerShortcut("SwapWindowLeft",  "---Swap with left window",  "Meta+Ctrl+Alt+Left",  () => swapWindowInDirection("left"));
registerShortcut("SwapWindowRight", "---Swap with right window", "Meta+Ctrl+Alt+Right", () => swapWindowInDirection("right"));
registerShortcut("SwapWindowUp",    "---Swap with top window",   "Meta+Ctrl+Alt+Up",    () => swapWindowInDirection("top"));
registerShortcut("SwapWindowDown",  "---Swap with bottom window","Meta+Ctrl+Alt+Down",  () => swapWindowInDirection("bottom"));
registerShortcut("GrowActiveWindow", "---Grow active window", "Meta+Alt+X", growActiveWindow);
registerShortcut("ShrinkActiveWindow", "---Shrink active window", "Meta+Alt+Z", shrinkActiveWindow);
registerShortcut("CapsDoubleFloating", "---Double Caps → Toggle Floating", "CapsLock", handleDoubleTapCapsFloating);
registerShortcut("ShiftCapsDoubleFloatAll","---Shift+Double Caps → Toggle Float All","Shift+CapsLock",handleDoubleTapShiftCapsFloatAll);
//registerShortcut("ToggleFloating", "---Toggle floating window", "Meta+Shift+Space", toggleFloatingActiveWindow);
registerShortcut("MoveWindowLeft",  "---Move window left",  "Meta+Alt+Shift+Left",  () => moveWindowInDirection("left"));
registerShortcut("MoveWindowRight", "---Move window right", "Meta+Alt+Shift+Right", () => moveWindowInDirection("right"));
registerShortcut("MoveWindowUp",    "---Move window up",    "Meta+Alt+Shift+Up",    () => moveWindowInDirection("top"));
registerShortcut("MoveWindowDown",  "---Move window down",  "Meta+Alt+Shift+Down",  () => moveWindowInDirection("bottom"));
registerShortcut("Resize Left", "---Resize Left", "Ctrl+Shift+Left", () => resizeActiveWindowDirectional(-1, 0));
registerShortcut("Resize Right", "---Resize Right", "Ctrl+Shift+Right", () => resizeActiveWindowDirectional(1, 0));
registerShortcut("Resize Up", "---Resize Up", "Ctrl+Shift+Up", () => resizeActiveWindowDirectional(0, 1));
registerShortcut("Resize Down", "---Resize Down", "Ctrl+Shift+Down", () => resizeActiveWindowDirectional(0, -1));
registerShortcut("TileAllFloating","---Tile all floating windows","Meta+Ctrl+Space",tileAllFloatingWindows);
//registerShortcut("ToggleFloatAll","---Toggle tiling / floating mode","Meta+Shift+F",toggleFloatAll);
registerShortcut("ToggleBorderMode","---Toggle border mode","Ctrl+Shift+F3",toggleBorderMode);


// ──────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────
const DEBUG = false;  // change to true for verbose logging
const MAX_WINDOWS = 15;
const LIVE_RESIZE_THROTTLE = 16;   // 50–80 idealne
const MAX_FIRST_ROW = 3;
const RESIZE_STEP = 0.1;
const MAIN_RATIO_PRESETS = [[1.5,1.5],[2.0,2.0],[3.0,3.0],[1.0,1.0]];
const SWAP_THRESHOLD = 0.55;
const MOVE_THRESHOLD = 0.18;
const AREA_CACHE_TTL = 16; // ~1 frame (60fps)
const GEO_CACHE_TTL = 16;
const TILE_ON_START = false;

const TILE_EVEN_IF_NEW_MAXIMIZED = readConfig("tileEvenIfNewMaximized", true);
const AUTO_LAYOUT_ON_DESKTOP_CHANGE = readConfig("autoLayoutOnDesktopChange", false);
const AUTO_LAYOUT_ON_ACTIVITY_CHANGE = readConfig("autoLayoutOnActivityChange", false);
const AUTO_LAYOUT_ON_NEW_WINDOW = readConfig("autoLayoutOnNewWindow", true);
const AUTO_LAYOUT_ON_WINDOW_CLOSE = readConfig("autoLayoutOnWindowClose", true);
const AUTO_LAYOUT_ON_WINDOW_MINIMIZE = readConfig("autoLayoutOnWindowMinimize", true);
const AUTO_LAYOUT_ON_WINDOW_RESTORE = readConfig("autoLayoutOnWindowRestore", true);
const AUTO_RETILE_MODE = readConfig("autoRetileMode", 1); // 0=off, 1=tiled only, 2=always
//const TILE_ON_START = readConfig("tileOnStart", false);
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

let borderMode = readConfig("borderMode", 0); // 0 = tiled no border / floating border  1 = all border  2 = all no border

const IGNORE_TILING = buildIgnoreList(
    "ignoreWordsTiling1",
    "ignoreWordsTiling2",
    "print,find,replace,confirm,settings,preferences,properties,org.kde.plasma-systemmonitor",
    "drukuj,znajdź,zamień,potwierdź,ustawienia,właściwości"
);
const IGNORE_CYCLING = buildIgnoreList("ignoreWordsCycling1", "ignoreWordsCycling2");
const IGNORED_RESOURCE_CLASSES = ["org.freedesktop.impl.portal.desktop.kde","org.freedesktop.portal.Desktop","xdg-desktop-portal"];
const IGNORED_RESOURCE_NAMES = ["xdg-desktop-portal","xdg-desktop-portal-kde"];
const EDGE_TOLERANCE = GAP + 6;


// =====================================================
// GLOBAL STATE
// =====================================================
let scriptGeometryChange = false;
let movingWindow = null;
let movingStartCenter = null;
let lastTapTime = 0;
let smartTileLastTap = 0;
let smartTilePrevFirstRowMode = 0;
let manualResizeInProgress = false;

let resizeThrottleTimer = null;
let lastResizeClient = null;
let lastResizeGeometry = null;
let resizeEdges = new Map();
//let floatingWindows = new Set();
let lastDesktopId = null;
let lastResizeTime = 0


let _visibleCache = null;
let _visibleCacheTime = 0;
let _visibleCacheKey = "";
let _areaCache = null;
let _areaCacheTime = 0;
let _areaCacheKey = "";

let _fullAreaCache = null;
let _fullAreaCacheTime = 0;
let _fullAreaCacheKey = "";

let _geoCache = new Map();
let _geoCacheTime = 0;

let _pendingLayout = null;
let _pendingArea = null;
let _pendingSkip = null;
let _applyScheduled = false;

let coalescedApply = null;
let rafScheduled = false;
let rafTimer = null;


const workspaceState = {};
const layoutModels = {};          // key → model
const layoutMeta = {};
const floatingWindowsMap = {};


let resizeState = new Map();          // win → { tX, tY }
let resizeOriginRect = new Map();     // win → origin
let lastAppliedGeometry = new Map();  // do wykrywania manual change
let lastInternalResizeTime = new Map(); // win → timestamp ms
let autoFloating = new Set();
let lastFreedSlot = null;

const states = {};


// =====================================================
// HELPER FUNCTIONS
// =====================================================
function getWS() {

    const key = getStateKey();

    if (!workspaceState[key]) {

        const preset = MAIN_RATIO_PRESETS[DEFAULT_PRESET_INDEX];

        workspaceState[key] = {

            layoutModel: null,

            layoutMeta: {
                force: false
            },

            floating: new Set(),

            state: {
                autoRetileMode: AUTO_RETILE_MODE,
                allFloating: !!readConfig("allFloating", false),
                _layoutDirty: true,

                lastTiledOrder: [],
                leftRatio: preset[0],
                topRatio: preset[1],
                firstRowMode: 0
            }
        };
    }

    return workspaceState[key];
}


function isFloating(win) {
    const set = getFloatingSet();
    return set.has(win);
}


function isWindowTiled(win) {

    if (getFloatingSet().has(win)) return false;

    const model = getLayoutModel();
    if (!model || !win) return false;

    if (model.leftMain && model.leftMain.win === win) {
        return true;
    }

    if (model.rows) {
        for (let row of model.rows) {
            for (let item of row.windows) {
                if (item.win === win) return true;
            }
        }
    }

    return false;
}

function getFloatingSet() {
    return getWS().floating;
}

function getLayoutKey() {
    return getStateKey(); // już masz: activity:desktop:screen
}

function getLayoutModel() {
    return getWS().layoutModel;
}

function setLayoutModel(model) {
    getWS().layoutModel = model;
}

function clearLayoutModel() {
    getWS().layoutModel = null;
}

function forceRebuildModel() {
    getWS().layoutMeta.force = true;
}

function consumeForceRebuild() {
    const meta = getWS().layoutMeta;
    const val = !!meta.force;
    meta.force = false;
    return val;
}

function buildIgnoreList(key1, key2, def1, def2) {

    const out = [];

    let raw1 = readConfig(key1, def1);
    let raw2 = readConfig(key2, def2);

    if (typeof raw1 !== "string") raw1 = def1 || "";
    if (typeof raw2 !== "string") raw2 = def2 || "";

    const all = (raw1 + "," + raw2).split(",");

    for (let i = 0; i < all.length; i++) {

        let s = all[i];
        if (!s) continue;

        s = s.trim().toLowerCase();

        if (s.length > 0 && out.indexOf(s) === -1) {
            out.push(s);
        }
    }

    return out;
}



// ──────────────────────────────────────────────────────────────
// STATE PER ACTIVITY + DESKTOP + SCREEN
// ──────────────────────────────────────────────────────────────


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



function getStateKey() {
    const activityId = getCurrentActivityId();
    const desktopId = getCurrentDesktopIdentifier();

    let screenId = workspace.activeScreen;

    const screens = workspace.screens || [];

    if (typeof screenId !== 'number' || screenId < 0 || screenId >= screens.length) {
        screenId = 0;
    }

    return `${activityId}:${desktopId}:${screenId}`;
}

function getWorkspaceKey() {
    return getCurrentDesktopIdentifier() + "_" + workspace.activeScreen;
}


function getCurrentDesktopForAPI() {
    const d = workspace.currentDesktop;

    // Plasma 6 → obiekt OK
    if (typeof d === "object") return d;

    // fallback (starsze)
    return d;
}


function getCachedGeometry(win) {

    if (!win || win.deleted) return null;

    const now = Date.now();

    if (now - _geoCacheTime > GEO_CACHE_TTL) {
        _geoCache.clear();
        _geoCacheTime = now;
    }

    if (_geoCache.has(win)) {
        return _geoCache.get(win);
    }

    const g = win.frameGeometry;

    const safe = {
        x: g.x,
        y: g.y,
        width: g.width,
        height: g.height
    };

    _geoCache.set(win, safe);

    return safe;
}


function getAreaCacheKey() {
    return (
        getCurrentActivityId() + ":" +
        getCurrentDesktopIdentifier() + ":" +
        workspace.activeScreen
    );
}


function getUsableArea() {

    const now = Date.now();
    const key = getAreaCacheKey();

    if (
        _areaCache &&
        key === _areaCacheKey &&
        (now - _areaCacheTime < AREA_CACHE_TTL)
    ) {
        return _areaCache;
    }

    const area = workspace.clientArea(
        KWin.FullScreenArea,
        workspace.activeScreen,
        getCurrentDesktopForAPI()
    );

    const result = {
        x: area.x + MARGIN,
        y: area.y + MARGIN,
        width: area.width - 2 * MARGIN,
        height: area.height - 2 * MARGIN
    };

    _areaCache = result;
    _areaCacheTime = now;
    _areaCacheKey = key;

    return result;
}


function getFullArea() {

    const now = Date.now();
    const key = getAreaCacheKey();

    if (
        _fullAreaCache &&
        key === _fullAreaCacheKey &&
        (now - _fullAreaCacheTime < AREA_CACHE_TTL)
    ) {
        return _fullAreaCache;
    }

    const result = workspace.clientArea(
        KWin.FullScreenArea,
        workspace.activeScreen,
        getCurrentDesktopForAPI()
    );

    _fullAreaCache = result;
    _fullAreaCacheTime = now;
    _fullAreaCacheKey = key;

    return result;
}

function invalidateAreaCache() {
    _areaCache = null;
    _fullAreaCache = null;
}


function getCurrentState() {
    return getWS().state;
}

function getLastTiledOrder() {

    const state = getCurrentState();

    if (!Array.isArray(state.lastTiledOrder)) {
        state.lastTiledOrder = [];
    }

    const visible = getVisibleWindows();

    // 🔥 HARD CLEANUP
    state.lastTiledOrder = state.lastTiledOrder.filter(w =>
        w &&
        !w.deleted &&
        visible.includes(w) &&
        !getFloatingSet().has(w)
    );

    return state.lastTiledOrder;
}

function getLeftRatio() {
    const s = getCurrentState();
    return s.leftRatio ?? MAIN_RATIO_PRESETS[DEFAULT_PRESET_INDEX][0];
}
function setLeftRatio(value) { getCurrentState().leftRatio = value; }
function getTopRatio() {
    const s = getCurrentState();
    return s.topRatio ?? MAIN_RATIO_PRESETS[DEFAULT_PRESET_INDEX][1];
}
function setTopRatio(value) { getCurrentState().topRatio = value; }
function getFirstRowWindowsMode() {
    const s = getCurrentState();
    return s.firstRowMode ?? 0;
}
function setFirstRowWindowsMode(value){ getCurrentState().firstRowMode = value; }

function setLastTiledOrder(order) {

    if (!Array.isArray(order)) {
        getCurrentState().lastTiledOrder = [];
        return;
    }

    const visible = getVisibleWindows();
    const floating = getFloatingSet();

    const clean = order.filter(w =>
        w &&
        !w.deleted &&
        visible.includes(w) &&
        !floating.has(w)
    );

    getCurrentState().lastTiledOrder = clean;
    // 🔥 cleanup autoFloating dla okien które są już tiled
    for (let w of clean)  {
        autoFloating.delete(w);
    }
}
// ──────────────────────────────────────────────────────────────
// AUTO-RETILE LOGIC
// ──────────────────────────────────────────────────────────────


function canAutoRetile() {

    const state = getCurrentState();

    if (state.allFloating) return false;

    const mode = state.autoRetileMode ?? AUTO_RETILE_MODE;

    if (mode === 0) return false;

    const visible = getVisibleWindows();
    if (!visible || visible.length === 0) return false;

    const NOW = Date.now();

    let anyMaximized;

    if (TILE_EVEN_IF_NEW_MAXIMIZED) {

        // 🔥 ignoruj świeże okna (timestamp < 400ms)
        anyMaximized = visible.some(w =>
        w.maximizeMode !== 0 &&
        !(w._kwinAddedAt && (NOW - w._kwinAddedAt < 400))
        );

    } else {

        // 🔁 oryginalne zachowanie
        anyMaximized = visible.some(w => w.maximizeMode !== 0);
    }

    if (mode === 2) return true;

    if (anyMaximized) return false;

    return true;
}

function applyAutoRetileMode(newMode) {

    const state = getCurrentState();

    const modes = ["Off", "Tiled only", "Always"];

    const changed = (state.autoRetileMode !== newMode);
    state.autoRetileMode = newMode;

    const msg = "Auto-retile:\n " + modes[state.autoRetileMode];

    showOSDSafe(msg);

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



function safeNumber(v, fallback = 0) {
    return (typeof v === "number" && isFinite(v)) ? v : fallback;
}

function safeSize(v, min = 1) {
    if (!isFinite(v)) return min;
    return Math.max(min, Math.round(v));
}

function safeWidth(w) {
    return Math.max(1, safeNumber(w, 1));
}

function safeHeight(h) {
    return Math.max(1, safeNumber(h, 1));
}

function cleanupFloatingWindows() {
    const set = getFloatingSet();
    if (!set || set.size === 0) return;

    const visible = getVisibleWindows();

    for (let w of Array.from(set)) {
        if (!w || w.deleted || !visible.includes(w)) {
            set.delete(w);
        }
    }
}

function cleanupResizeEdges() {
    for (let [w] of resizeEdges) {
        if (!w || w.deleted) {
            resizeEdges.delete(w);
        }
    }
}



function getDesktopIdSafe(d) {
    if (typeof d === "number") {
        return d.toString();
    }

    if (d && typeof d === "object") {
        if (typeof d.id === "string" && d.id.length > 0) {
            return d.id;
        }

        if (typeof d.x11DesktopNumber === "number" && d.x11DesktopNumber > 0) {
            return d.x11DesktopNumber.toString();
        }

        if (workspace.desktopGridWidth && workspace.desktopGridHeight) {
            const row = (d.row !== undefined && typeof d.row === "number") ? d.row : 0;
            const col = (d.column !== undefined && typeof d.column === "number") ? d.column : 0;
            return (row * workspace.desktopGridWidth + col + 1).toString();
        }
    }

    return "1";
}

function windowOnCurrentDesktop(win, currentDeskId) {
    if (!win || !win.desktops) return false;

    return win.desktops.some(d => getDesktopIdSafe(d) === currentDeskId);
}

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

// ──────────────────────────────────────────────
// OSD QUEUE
// ──────────────────────────────────────────────

let osdQueue = [];
let osdProcessing = false;

const OSD_DISPLAY_TIME = 500;

function showOSDSafe(message, icon = "object-order") {

    if (!message) return;

    osdQueue.push({ message, icon });

    if (osdProcessing) return;

    processOSDQueue();
}

function processOSDQueue() {

    if (osdQueue.length === 0) {
        osdProcessing = false;
        return;
    }

    osdProcessing = true;

    const item = osdQueue.shift();

    // 🔥 NIE BLOKUJEMY niczego – tylko pokazujemy
    showOSD(item.message, item.icon);

    let timer = new QTimer();
    timer.singleShot = true;
    timer.interval = OSD_DISPLAY_TIME;

    timer.timeout.connect(() => {
        timer.stop();
        processOSDQueue();
    });

    timer.start();
}



function showUnifiedLayoutOSD(extraInfo = "") {
    const name = getLayoutName();
    let text = "Layout:\n " + name;
    if (extraInfo) {
        text += "\n" + extraInfo;
    }
    showOSD(text, "view-grid");
}



// ──────────────────────────────────────────────────────────────


function sortByAngle(windows) {
    let cx = 0, cy = 0;
    windows.forEach(w => {
        const g = getCachedGeometry(w);
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

function getTiledOrder() {

    cleanupFloatingWindows();

    const visible = getVisibleWindows();

    const tiledVisible = visible.filter(w => !getFloatingSet().has(w));

    let ordered = [];
    const currentOrder = getLastTiledOrder();

    for (let w of currentOrder) {
        if (tiledVisible.includes(w) && !w.deleted) {
            ordered.push(w);
        }
    }

    for (let w of tiledVisible) {
        if (!ordered.includes(w)) {
            ordered.push(w);
        }
    }

    return { ordered, visible: tiledVisible };
}





function getVisibleWindows() {

    const now = Date.now();

    // 🔥 KLUCZ: activity + desktop + screen
    const cacheKey =
    getCurrentActivityId() + ":" +
    getCurrentDesktopIdentifier() + ":" +
    workspace.activeScreen;

    // 🔥 cache valid (krótki TTL + ten sam kontekst)
    if (
        _visibleCache &&
        cacheKey === _visibleCacheKey &&
        (now - _visibleCacheTime < 50)
    ) {
        return _visibleCache;
    }

    const currentDeskId = getCurrentDesktopIdentifier();
    const currentActivity = workspace.currentActivity;
    const activeScreen = workspace.activeScreen;


    const screenGeo = getFullArea();
    const result = workspace.windowList().filter(w => {

        if (!w ||
            !w.normalWindow ||
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
            matchesIgnoreList(w, IGNORE_TILING)
        ) {
            return false;
        }

        // ACTIVITY
        if (currentActivity &&
            !w.onAllActivities &&
            !w.activities.includes(currentActivity)) {
            return false;
            }

            // DESKTOP
            if (!windowOnCurrentDesktop(w, currentDeskId)) return false;

            // SCREEN (center check)
            const geo = getCachedGeometry(w);

        const centerX = geo.x + geo.width / 2;
        const centerY = geo.y + geo.height / 2;

        return centerX >= screenGeo.x &&
        centerX <  screenGeo.x + screenGeo.width &&
        centerY >= screenGeo.y &&
        centerY <  screenGeo.y + screenGeo.height;
    });

    // 🔥 zapis cache
    _visibleCache = result;
    _visibleCacheTime = now;
    _visibleCacheKey = cacheKey;

    return result;
}

function getCyclingWindows() {
    const currentDeskId = getCurrentDesktopIdentifier();
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

        // DESKTOP — 🔥 UJEDNOLICONE
        if (!windowOnCurrentDesktop(w, currentDeskId)) return false;

        const geo = getCachedGeometry(w);
        const screenGeo = getFullArea();

        const centerX = geo.x + geo.width / 2;
        const centerY = geo.y + geo.height / 2;

        return centerX >= screenGeo.x &&
               centerX < screenGeo.x + screenGeo.width &&
               centerY >= screenGeo.y &&
               centerY < screenGeo.y + screenGeo.height;
    });
}

function centerOf(w) {
    const g = getCachedGeometry(w);
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
    const currentDeskId = getCurrentDesktopIdentifier();
    const allWindows = workspace.windowList();

    for (let w of allWindows) {

        if (
            windowOnCurrentDesktop(w, currentDeskId) &&
            !w.minimized &&
            IGNORE_TILING.some(word => (w.caption || "").toLowerCase().includes(word)) &&
            w.minimizable
        ) {
            w.minimized = true;

            if (DEBUG) {
                print("KLeftHandTiler: minimized ignored window: " + (w.caption || w.resourceClass));
            }
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
        // 🔥 dynamiczne dopasowanie ile okien realnie wejdzie
        let maxFit = 0;
        let runningSum = 0;

        for (let i = 0; i < firstRowCount; i++) {
            const m = getMinWidth(ordered[idx + i]);
            const gaps = GAP * Math.max(0, maxFit);
            if (runningSum + m + gaps > area.width) break;

            runningSum += m;
            maxFit++;
        }

        // 🔥 fallback – zawsze przynajmniej 1
        firstRowCount = Math.max(1, maxFit);

        const usableW = area.width - GAP * Math.max(0, firstRowCount - 1);

        let minSum = 0;
        const mins = [];

        for (let i = 0; i < firstRowCount; i++) {
            const m = getMinWidth(ordered[idx + i]);
            mins.push(m);
            minSum += m;
        }

        // 🔥 safety (powinno się nie zdarzyć po powyższym, ale zostawiamy)
        if (minSum > usableW) {
            if (DEBUG) print(`FIRST ROW IMPOSSIBLE – minSum=${minSum} > usableW=${usableW} (firstRowCount=${firstRowCount})`);
            return null;
        }

        const extra = usableW - minSum;
        const windows = [];

        if (firstRowCount > 1) {

            const normalCount = firstRowCount - 1;
            const totalW = getLeftRatio() + normalCount;

            // 🔥 pierwsze okno (main/left)
            windows.push({
                win: ordered[idx++],
                widthRatio: (mins[0] + extra * (getLeftRatio() / totalW)) / usableW
            });

            // 🔥 reszta okien
            for (let i = 1; i < firstRowCount; i++) {
                windows.push({
                    win: ordered[idx++],
                    widthRatio: (mins[i] + extra * (1 / totalW)) / usableW
                });
            }

        } else {
            // 🔥 single window fallback
            windows.push({
                win: ordered[idx++],
                widthRatio: 1
            });
        }

        model.rows.push({
            heightRatio: 1,
            windows: windows
        });
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
function safeHeightTotal(h) {
    return Math.max(1, safeNumber(h, 1));
}


function distributeSizesWithMin(items, totalSize, gap, getMin, getRatio) {

    const n = items.length;
    if (n === 0) return [];

    const totalGap = gap * (n - 1);

    // 🔥 HARDEN HEIGHT/WIDTH TOTAL
    let usable = safeHeightTotal(totalSize - totalGap);

    if (usable <= 0) return new Array(n).fill(1);

    let ratios = [];
    let ratioSum = 0;

    for (let i = 0; i < n; i++) {
        let r = safeNumber(getRatio(items[i]), 0);
        if (r < 0) r = 0;
        ratios.push(r);
        ratioSum += r;
    }

    if (ratioSum <= 0) {
        ratioSum = n;
        ratios = new Array(n).fill(1);
    }

    const mins = [];
    let sumMin = 0;

    for (let i = 0; i < n; i++) {
        let m = safeNumber(getMin(items[i]), 0);
        m = Math.max(0, Math.min(m, usable));
        mins.push(m);
        sumMin += m;
    }

    // 🔥 JEŚLI MINY NIE MIESZCZĄ SIĘ → fallback
    if (sumMin > usable) {
        const base = Math.max(1, Math.floor(usable / n));
        return new Array(n).fill(base);
    }

    let sizes = [];

    for (let i = 0; i < n; i++) {
        sizes[i] = usable * (ratios[i] / ratioSum);
    }

    for (let i = 0; i < n; i++) {
        if (sizes[i] < mins[i]) sizes[i] = mins[i];
    }

    let sum = sizes.reduce((a, b) => a + b, 0);

    if (sum > usable) {
        let overflow = sum - usable;
        let i = 0;

        while (overflow > 0 && i < n * 20) {
            const idx = i % n;
            const canShrink = sizes[idx] - mins[idx];

            if (canShrink > 0) {
                const take = Math.min(canShrink, overflow);
                sizes[idx] -= take;
                overflow -= take;
            }
            i++;
        }
    }

    sizes = sizes.map(s => safeSize(s, 1));

    let finalSum = sizes.reduce((a, b) => a + b, 0);
    let diff = usable - finalSum;

    let i = 0;
    while (diff !== 0 && i < n * 20) {
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
    }

    // 🔥 FINAL HARD FAILSAFE
    for (let i = 0; i < n; i++) {
        if (!isFinite(sizes[i]) || sizes[i] <= 0) {
            const base = Math.max(1, Math.floor(usable / n));
            return new Array(n).fill(base);
        }
    }

    return sizes;
}

function normalizeModelWithConstraints(model, usable) {

    if (!model || !model.rows) return;

    const totalH = safeHeightTotal(usable.height);
    const totalW = safeWidth(usable.width);

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

        // 🔥 KLUCZ: ponowny clamp (NIE USUWAĆ!)
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

function normalizeModelStructure(model) {

    if (!model) return null;

    const seen = new Set();

    // ─────────────────────────────
    // LEFT MAIN
    // ─────────────────────────────
    if (model.leftMain) {
        const w = model.leftMain.win;

        if (!w || w.deleted) {
            model.leftMain = null;
        } else {
            if (seen.has(w)) {
                model.leftMain = null;
            } else {
                seen.add(w);
            }
        }
    }

    // ─────────────────────────────
    // ROWS
    // ─────────────────────────────
    if (!Array.isArray(model.rows)) {
        model.rows = [];
    }

    const newRows = [];

    for (let row of model.rows) {

        if (!row || !Array.isArray(row.windows)) continue;

        const newWindows = [];

        for (let item of row.windows) {

            if (!item || !item.win) continue;

            const w = item.win;

            if (w.deleted) continue;

            // 🔥 DUPE GUARD
            if (seen.has(w)) continue;

            seen.add(w);

            newWindows.push(item);
        }

        // 🔥 usuń puste rzędy
        if (newWindows.length > 0) {
            row.windows = newWindows;
            newRows.push(row);
        }
    }

    model.rows = newRows;

    // ─────────────────────────────
    // FINAL CLEAN
    // ─────────────────────────────
    if (model.leftMain && seen.has(model.leftMain.win) === false) {
        // OK
    }

    if (model.rows.length === 0 && !model.leftMain) {
        return null;
    }

    return model;
}


function assertModelConsistency(model) {

    if (!DEBUG) return;

    if (!model) {
        print("ASSERT: model = null");
        return;
    }

    const seen = new Set();
    let count = 0;

    // ─────────────────────────────
    // LEFT MAIN
    // ─────────────────────────────
    if (model.leftMain) {
        const w = model.leftMain.win;

        if (!w) {
            print("ASSERT: leftMain has null win");
        } else if (w.deleted) {
            print("ASSERT: leftMain is deleted:", w.caption);
        } else {
            seen.add(w);
            count++;
        }
    }

    // ─────────────────────────────
    // ROWS
    // ─────────────────────────────
    if (!Array.isArray(model.rows)) {
        print("ASSERT: model.rows is not array");
        return;
    }

    for (let r = 0; r < model.rows.length; r++) {
        const row = model.rows[r];

        if (!row) {
            print("ASSERT: row null at", r);
            continue;
        }

        if (!Array.isArray(row.windows)) {
            print("ASSERT: row.windows not array at", r);
            continue;
        }

        for (let i = 0; i < row.windows.length; i++) {
            const item = row.windows[i];

            if (!item || !item.win) {
                print("ASSERT: null item at row", r, "idx", i);
                continue;
            }

            const w = item.win;

            if (w.deleted) {
                print("ASSERT: deleted window in model:", w.caption);
                continue;
            }

            if (seen.has(w)) {
                print("ASSERT: DUPLICATE window:", w.caption);
            }

            seen.add(w);
            count++;
        }
    }

    // ─────────────────────────────
    // CROSS CHECK (optional)
    // ─────────────────────────────
    try {
        const visible = getVisibleWindows();

        for (let w of visible) {
            if (!seen.has(w)) {
                print("ASSERT: visible window NOT in model:", w.caption);
            }
        }

    } catch (e) {
        print("ASSERT: visible check error:", e);
    }

    print("ASSERT OK: windows in model =", count);
}

function validateLayoutBySimulation(model, usable) {

    if (!model || !model.rows) return false;

    // ───────── LEFT MAIN ─────────
    if (model.leftMain) {

        const mainW = safeWidth(Math.round(model.leftMain.widthRatio * usable.width));
        const rightWidthTotal = safeWidth(usable.width - mainW - GAP);

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
            const rowH = safeHeight(rowHeights[r]);

            if (rowH <= 0) return false;

            const widths = distributeSizesWithMin(
                row.windows,
                rightWidthTotal,
                GAP,
                item => getMinWidth(item.win),
                item => item.widthRatio
            );

            for (let i = 0; i < widths.length; i++) {
                if (!isFinite(widths[i]) || widths[i] <= 0) return false;
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
        const rowH = safeHeight(rowHeights[r]);

        if (rowH <= 0) return false;

        const widths = distributeSizesWithMin(
            row.windows,
            usable.width,
            GAP,
            item => getMinWidth(item.win),
            item => item.widthRatio
        );

        for (let i = 0; i < widths.length; i++) {
            if (!isFinite(widths[i]) || widths[i] <= 0) return false;
        }
    }

    return true;
}



function canApplyLayoutModel(model, usable) {

    if (!model || !model.rows) return false;

    // LEFT MAIN
    if (model.leftMain) {

        const mainW = safeWidth(model.leftMain.widthRatio * usable.width);
        const rightWidth = safeWidth(usable.width - mainW - GAP);

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

function sanitizeState() {

    const state = getCurrentState();

    // 🔥 order cleanup
    if (Array.isArray(state.lastTiledOrder)) {
        state.lastTiledOrder = state.lastTiledOrder.filter(w => w && !w.deleted);
    } else {
        state.lastTiledOrder = [];
    }

    // 🔥 savedOrder cleanup
    if (Array.isArray(state._savedOrder)) {
        state._savedOrder = state._savedOrder.filter(w => w && !w.deleted);
    }

    // 🔥 savedFloating cleanup
    if (state._savedFloating instanceof Set) {

        const clean = new Set();

        for (let w of state._savedFloating) {
            if (w && !w.deleted) {
                clean.add(w);
            }
        }

        state._savedFloating = clean;
    }
}


function tryReclaimAutoFloatingWindows() {
    const floating = Array.from(getFloatingSet())
        .filter(w => autoFloating.has(w));
    if (floating.length === 0) return false;

    let { ordered } = getTiledOrder();
    if (!ordered) ordered = [];

    const usable = getUsableArea();
    let changed = false;

    // Próbujemy włożyć od najstarszych auto-floating
    for (let w of floating) {
        if (!w || w.deleted || !autoFloating.has(w)) continue;

        let inserted = false;

        const model = getLayoutModel();
        const startIndex = (model?.leftMain) ? 1 : 0;

        // 🔥 budujemy kolejność prób
        let indices = [];

        // 1. najpierw slot po usuniętym oknie
        if (lastFreedSlot !== null && lastFreedSlot >= startIndex) {
            indices.push(lastFreedSlot);
            if (DEBUG) print("TRY SLOT:", lastFreedSlot);
        }

        // 2. fallback — od końca (żeby uzupełniać grid)
        for (let i = ordered.length; i >= startIndex; i--) {
            if (i !== lastFreedSlot) indices.push(i);
        }

        // 🔁 próbujemy w tych miejscach
        for (let i of indices) {

            const testOrder = ordered.slice();
            testOrder.splice(i, 0, w);

            const testModel = buildAndValidateModel(testOrder, usable);
            if (!testModel) continue;

            // ✔️ SUCCESS
            getFloatingSet().delete(w);
            autoFloating.delete(w);

            ordered.splice(i, 0, w);

            if (DEBUG) print("RECLAIM @", i, ":", w.caption || w.resourceClass);

            lastFreedSlot = null;   // 🔥 slot zużyty
            changed = true;
            inserted = true;

            break;
        }

        if (!inserted && DEBUG) {
            print("Could not reclaim:", w.caption || w.resourceClass);
        }
    }

    if (changed) {
        setLastTiledOrder(ordered);
        // Nie czyścimy modelu tutaj - zostawiamy to handleWindowRemoved
        return true;
    }
    return false;
}




function reLayout() {
    if (getCurrentState().allFloating) return;
    sanitizeState();
    cleanupFloatingWindows();
    cleanupResizeEdges();
    let { ordered, visible: tiledVisible } = getTiledOrder();
    if (!ordered || ordered.length === 0) return;
    if (tiledVisible.every(w => w.minimized)) return;
    const currentDeskId = getCurrentDesktopIdentifier();
    lastDesktopId = currentDeskId;
    // Demaksymalizacja
    const allVisible = getVisibleWindows();
    for (let w of allVisible) {
        if (!w || w.deleted) continue;
        if (w.fullScreen) w.fullScreen = false;
        if (w.maximizeMode !== 0) w.setMaximize(false, false);
    }
    // Obsługa zbyt wielu okien
    if (ordered.length > MAX_WINDOWS) {
        const tooManyWindows = ordered.slice(MAX_WINDOWS);
        ordered = ordered.slice(0, MAX_WINDOWS);
        for (let w of tooManyWindows) {
            if (w && !w.deleted) {
                getFloatingSet().add(w);
                autoFloating.add(w);
            }
        }
    }
    const effectiveOrder = ordered.slice();
    const usable = getUsableArea();
    if (usable.width < 50 || usable.height < 50) {
        showOSDSafe("Screen too small", "dialog-error");
        return;
    }
    const state = getCurrentState();
    let model = getLayoutModel();
    if (model && model._count !== ordered.length) {
        if (DEBUG) print("MODEL DESYNC → clearing");
        clearLayoutModel();
        forceRebuildModel();
        model = null;
    }
    model = normalizeModelStructure(model);
    assertModelConsistency(model);
    const needRebuild = !model ||
        model._count !== ordered.length ||
        consumeForceRebuild() ||
        state._layoutDirty;
    if (needRebuild) {
        let workingOrder = effectiveOrder.slice();
        let newModel = buildAndValidateModel(workingOrder, usable);
        const removedWindows = [];
        while (!newModel && workingOrder.length > 1) {
            const removed = workingOrder.pop();
            if (removed) removedWindows.push(removed);
            newModel = buildAndValidateModel(workingOrder, usable);
        }
        // KLUCZOWE: oznaczamy jako autoFloating przy zmianie układu
        for (let w of removedWindows) {
            if (w && !w.deleted) {
                getFloatingSet().add(w);
                autoFloating.add(w);
                if (DEBUG) print("PUSHED TO AUTOFLOAT (layout change):", w.caption || w.resourceClass);
            }
        }
        if (!newModel) {
            showOSDSafe("Layout impossible", "dialog-error");
            clearLayoutModel();
            forceRebuildModel();
            return;
        }
        newModel = normalizeModelStructure(newModel);
        assertModelConsistency(newModel);
        
        // 🔥 POPRAWKA: _count musi odzwierciedlać rzeczywistą liczbę okien w modelu
        newModel._count = workingOrder.length;   // ← ZMIANA (było effectiveOrder.length)
        
        setLayoutModel(newModel);
        state._layoutDirty = false;
        if (DEBUG) print("MODEL REBUILT (per workspace)");
        //setLastTiledOrder(effectiveOrder);
        setLastTiledOrder(workingOrder);
        // Reclaim po rebuildzie modelu
        const reclaimed = tryReclaimAutoFloatingWindows();
        if (reclaimed) {
            if (DEBUG) print("RECLAIM → rebuilding model (inline)");
            const newOrder = getLastTiledOrder().slice();
            let newModel2 = buildAndValidateModel(newOrder, usable);
            if (newModel2) {
                newModel2 = normalizeModelStructure(newModel2);
                assertModelConsistency(newModel2);
                newModel2._count = newOrder.length;
                setLayoutModel(newModel2);
            }
        }
    }
    model = getLayoutModel();
    if (!model || !canApplyLayoutModel(model, usable)) {
        if (DEBUG) print("LAYOUT BROKEN → attempting recovery");

        const order = getLastTiledOrder().slice();
        let fallbackModel = buildAndValidateModel(order, usable);

        if (fallbackModel) {
            fallbackModel = normalizeModelStructure(fallbackModel);
            assertModelConsistency(fallbackModel);
            fallbackModel._count = order.length;

            setLayoutModel(fallbackModel);

            if (DEBUG) print("RECOVERY SUCCESS");

        } else {
            showOSDSafe("Layout broken", "dialog-error");
            clearLayoutModel();
            forceRebuildModel();
            return;
        }
    }
    scriptGeometryChange = true;
    applyLayoutModel(model, usable);
    scriptGeometryChange = false;
    if (workspace.activeWindow) {
        workspace.raiseWindow(workspace.activeWindow);
    }
    applyBorderMode();
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



//-----------------------------------------------
function applyBorderMode() {

    const visible = getVisibleWindows();
    if (!visible) return;

    for (let w of visible) {

        if (!w || w.deleted) continue;
        if (!w.normalWindow) continue;

        let target;

        if (borderMode === 0) {
            target = isWindowTiled(w); // tiled → bez ramki
        }
        else if (borderMode === 1) {
            target = false; // wszystko z ramką
        }
        else if (borderMode === 2) {
            target = true; // wszystko bez ramki
        }

        if (w.noBorder !== target) {
            w.noBorder = target;
        }
    }
}


function toggleBorderMode() {

    borderMode = (borderMode + 1) % 3;

    applyBorderMode();

    if (borderMode === 0) {
        showOSDSafe("Borders:\nTiled OFF / Floating ON", "window");
    }
    else if (borderMode === 1) {
        showOSDSafe("Borders:\nAll ON", "window");
    }
    else {
        showOSDSafe("Borders:\nAll OFF", "window");
    }
}




//-------------------------------
function cycleAutoRetileMode() {

    const state = getCurrentState();

    let mode = (state.autoRetileMode ?? 0) + 1;
    if (mode > 2) mode = 0;

    state.autoRetileMode = mode;

    let label, icon;

    switch (mode) {
        case 0:
            label = "Auto-retile: OFF";
            icon = "process-stop";
            break;
        case 1:
            label = "Auto-retile: Tiled only";
            icon = "view-grid";
            break;
        case 2:
            label = "Auto-retile: Always";
            icon = "view-refresh";
            break;
    }

    showOSD(label, icon);

    if (canAutoRetile()) {
        scheduleRelayout();
    }
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

    const usable = getUsableArea();

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
// =====================================================
// MINIMIZED STACK – TYLKO NA BIEŻĄCYM PULPICIE / AKTYWNOŚCI / EKRANIE
// =====================================================
const minimizedStacks = {};   // key = getStateKey() → array of windows

function getMinimizedStack() {
    const key = getStateKey();
    if (!minimizedStacks[key]) {
        minimizedStacks[key] = [];
    }
    return minimizedStacks[key];
}

function pushToMinimizedStack(win) {
    if (!win || win.deleted || !win.normalWindow) return;
    const stack = getMinimizedStack();
    // Usuwamy duplikat jeśli już jest
    const idx = stack.indexOf(win);
    if (idx > -1) stack.splice(idx, 1);
    stack.push(win);
}

function restoreLastMinimized() {
    const stack = getMinimizedStack();

    while (stack.length > 0) {
        const w = stack.pop();

        if (!w || w.deleted || !w.minimized) continue;

        // Przywracamy okno
        w.minimized = false;

        // Przełączamy pulpit i aktywność na ten, na którym było okno
        if (w.desktops && w.desktops.length > 0) {
            workspace.currentDesktop = w.desktops[0];
        }
        if (w.activities && w.activities.length > 0 && !w.onAllActivities) {
            workspace.currentActivity = w.activities[0];
        }

        workspace.activeWindow = w;
        workspace.raiseWindow(w);

        showOSDSafe("Restore window", "window-restore");
        return;
    }

    showOSDSafe("No windows to restore on this desktop", "dialog-warning");
}


// =====================================================
// TRACK MINIMIZE / RESTORE
// =====================================================
function trackWindowMinimizeRestore(c) {
    if (!c.normalWindow || c.specialWindow || c.dock || c.skipTaskbar) return;
    if (c._minimizeRestoreTracked) return;

    c.minimizedChanged.connect(() => {
        if (c.minimized) {
            pushToMinimizedStack(c);
        } else {
            const stack = getMinimizedStack();
            const idx = stack.indexOf(c);
            if (idx > -1) stack.splice(idx, 1);
        }

        // Auto-retile po restore
        if (!c.minimized && AUTO_LAYOUT_ON_WINDOW_RESTORE && canAutoRetile()) {
            var timer = new QTimer();
            timer.singleShot = true;
            timer.interval = 100;
            timer.timeout.connect(() => {
                timer.stop();

                // 🔥 INVALIDATE CACHE
                _visibleCache = null;

                if (canAutoRetile()) scheduleRelayout();
            });
                timer.start();
        }

        // Auto-retile po minimize
        if (c.minimized && AUTO_LAYOUT_ON_WINDOW_MINIMIZE && canAutoRetile()) {
            var timer = new QTimer();
            timer.singleShot = true;
            timer.interval = 80;
            timer.timeout.connect(() => {
                timer.stop();

                // 🔥 INVALIDATE CACHE
                _visibleCache = null;

                if (canAutoRetile()) scheduleRelayout();
            });
                timer.start();
        }
    });

    c._minimizeRestoreTracked = true;
}

workspace.windowAdded.connect(trackWindowMinimizeRestore);
workspace.windowList().forEach(trackWindowMinimizeRestore);


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
// DOUBLE TAP CAPS TOGGLE FLOATING
// ──────────────────────────────────────────────────────────────


function handleDoubleTapCapsFloating() {
    if (!handleDoubleTapCapsFloating.lastPressTime)
        handleDoubleTapCapsFloating.lastPressTime = 0;

    const now = Date.now();

    if (now - handleDoubleTapCapsFloating.lastPressTime <= DOUBLE_TAP_THRESHOLD) {

        const w = workspace.activeWindow;
        if (w) {
            toggleFloatingActiveWindow();
        }

        handleDoubleTapCapsFloating.lastPressTime = 0;
    } else {
        handleDoubleTapCapsFloating.lastPressTime = now;
    }
}

// ──────────────────────────────────────────────────────────────
// DOUBLE TAP SHIFT CAPS  TOGGLE FLOATING ALL
// ──────────────────────────────────────────────────────────────


function handleDoubleTapShiftCapsFloatAll() {

    if (!handleDoubleTapShiftCapsFloatAll.lastPressTime)
        handleDoubleTapShiftCapsFloatAll.lastPressTime = 0;

    const now = Date.now();

    if (now - handleDoubleTapShiftCapsFloatAll.lastPressTime <= DOUBLE_TAP_THRESHOLD) {

        if (DEBUG) print("Shift+Caps double → toggleFloatAll");

        toggleFloatAll();

        handleDoubleTapShiftCapsFloatAll.lastPressTime = 0;
        return;
    }

    handleDoubleTapShiftCapsFloatAll.lastPressTime = now;
}

// ──────────────────────────────────────────────────────────────
// SMART TILE HANDLER
// ──────────────────────────────────────────────────────────────
function smartTileHandler() {

    const visible = getVisibleWindows();
    if (visible.length === 0) return;

    const now = Date.now();

    // 🔥 DOUBLE TAP (bez zmian)
    if (now - smartTileLastTap < DOUBLE_TAP_THRESHOLD) {
        smartTileLastTap = 0;
        setFirstRowWindowsMode(smartTilePrevFirstRowMode);
        for (let w of visible) {
            if (w.maximizable) {
                w.setMaximize(false, false);
                w.setMaximize(true, true);
            }
        }
        showOSDSafe("Maximize all", "view-fullscreen");
        return;
    }

    smartTileLastTap = now;

    // ==========================================================
    // 🔥 SINGLE WINDOW → SOFT FULLSCREEN (bez dodatkowego GAP)
    // ==========================================================
    if (visible.length === 1) {

        const win = visible[0];
        if (!win || win.deleted) return;

        const usable = getUsableArea();
        const g = win.frameGeometry;

        const target = {
            x: Math.round(usable.x),
            y: Math.round(usable.y),
            width: Math.round(usable.width),
            height: Math.round(usable.height)
        };

        const isFull =
        Math.abs(g.x - target.x) < 2 &&
        Math.abs(g.y - target.y) < 2 &&
        Math.abs(g.width - target.width) < 2 &&
        Math.abs(g.height - target.height) < 2;

        // 🔁 TOGGLE
        if (!isFull) {

            scriptGeometryChange = true;
            win.frameGeometry = target;
            scriptGeometryChange = false;

            // 🔥 baseline (kluczowe dla resize)
            lastAppliedGeometry.set(win, target);

            resizeState.delete(win);
            resizeOriginRect.delete(win);

            showOSDSafe("Fullscreen", "view-fullscreen");

        } else {

            // powrót do layoutu
            clearLayoutModel();
            forceRebuildModel();
            getCurrentState()._layoutDirty = true;

            scheduleRelayout(0);

            showOSDSafe("Tiled", "view-grid");
        }

        return;
    }

    // ==========================================================
    // 🔥 RESZTA — BEZ ZMIAN
    // ==========================================================

    if (exitFloatAllToTiling()) return;

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
    if (!canApplyLayoutModel(model, area)) return;

    scriptGeometryChange = true;

    try {

        // LEFT MAIN
        if (model.leftMain) {

            const mainWin = model.leftMain.win;
            const mainW = safeWidth(model.leftMain.widthRatio * area.width);

            if (mainWin && !mainWin.deleted && !(skipClient && mainWin === skipClient)) {
                mainWin.frameGeometry = {
                    x: safeNumber(area.x),
                    y: safeNumber(area.y),
                    width: mainW,
                    height: safeHeight(area.height)
                };
            }

            let y = area.y;
            const rightWidthTotal = safeWidth(area.width - mainW - GAP);

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
                const rowH = safeHeight(rowHeights[r]);

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
                    const width = safeWidth(widths[i]);

                    if (item.win && !item.win.deleted && !(skipClient && item.win === skipClient)) {
                        item.win.frameGeometry = {
                            x: safeNumber(x),
                            y: safeNumber(y),
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

        // GRID
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
            const rowH = safeHeight(rowHeights[r]);

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
                const width = safeWidth(widths[i]);

                if (item.win && !item.win.deleted && !(skipClient && item.win === skipClient)) {
                    item.win.frameGeometry = {
                        x: safeNumber(x),
                        y: safeNumber(y),
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

    const model = getLayoutModel();
    if (!model) return;

    if (model.leftMain) {
        setLeftRatio(model.leftMain.widthRatio / (1 - model.leftMain.widthRatio));
    }

    if (model.rows && model.rows.length > 1) {
        const first = model.rows[0].heightRatio;
        const rest  = 1 - first;

        if (rest > 0) {
            setTopRatio(first / rest);
        }
    }
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

function recomputeRowFromDelta(row, usableWidth, winIndex, deltaPx) {

    if (!row || !row.windows || row.windows.length < 2) return;
    if (winIndex < 0 || winIndex >= row.windows.length) return;

    const totalGap = GAP * (row.windows.length - 1);
    const usable = safeWidth(usableWidth - totalGap);
    if (usable <= 0) return;

    const activeItem = row.windows[winIndex];

    // 👉 wybór sąsiada (jak w mouse resize)
    let leftItem, rightItem;

    if (winIndex < row.windows.length - 1) {
        leftItem = activeItem;
        rightItem = row.windows[winIndex + 1];
    } else {
        leftItem = row.windows[winIndex - 1];
        rightItem = activeItem;
        deltaPx = -deltaPx; // odwrócenie kierunku
    }

    const leftW  = leftItem.widthRatio  * usable;
    const rightW = rightItem.widthRatio * usable;

    const pairSum = leftW + rightW;

    let newLeftW = leftW + deltaPx;

    const minLeft  = getMinWidth(leftItem.win);
    const minRight = getMinWidth(rightItem.win);

    // 🔥 HARD CLAMP (zero overlap, zero bounce)
    if (newLeftW < minLeft) {
        newLeftW = minLeft;
    }

    if (newLeftW > pairSum - minRight) {
        newLeftW = pairSum - minRight;
    }

    const newRightW = pairSum - newLeftW;

    // 🔥 zapis do modelu
    leftItem.widthRatio  = newLeftW / usable;
    rightItem.widthRatio = newRightW / usable;
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

let accumulatedHeightDelta = 0;
function recomputeHeightsFromBoundaryDelta(model, usable, upperRowIndex, delta) {
    if (!model || model.rows.length < 2) return;
    if (Math.abs(delta) < 0.8) return;        // filtr szumu

    const totalDelta = delta + accumulatedHeightDelta;

    // Jeśli suma nadal za mała – tylko akumulujemy i wychodzimy
    if (Math.abs(totalDelta) < 5.5) {         // ← próg (dostroisz)
        accumulatedHeightDelta = totalDelta;
        return;
    }

    // ──────── Mamy wystarczającą sumę → wykonujemy resize ────────
    accumulatedHeightDelta = 0;               // zerujemy TYLKO po wykorzystaniu

    const totalGap = GAP * (model.rows.length - 1);
    const usableH = safeHeightTotal(usable.height - totalGap);

    const upper = model.rows[upperRowIndex];
    const lower = model.rows[upperRowIndex + 1];

    if (!upper || !lower) return;

    const upperH = upper.heightRatio * usableH;
    const lowerH = lower.heightRatio * usableH;
    const sum = upperH + lowerH;

    const minU = getMinRowHeight(upper);
    const minL = getMinRowHeight(lower);

    let newUpper = upperH + totalDelta;
    newUpper = Math.max(minU, Math.min(sum - minL, newUpper));

    const newLower = sum - newUpper;

    upper.heightRatio = newUpper / usableH;
    lower.heightRatio = newLower / usableH;
}


let accumulatedWidthDelta   = 0;

function recomputeRowFromGeometry(row, usableWidth, activeWin) {
    if (!row || row.windows.length < 2) return;
    if (!activeWin || activeWin.deleted) return;
    if (!resizeEdges.has(activeWin)) return;

    var edge = resizeEdges.get(activeWin);
    var g = activeWin.frameGeometry;
    var activeEdges = getActiveResizeEdges(edge, g);

    // Interesuje nas tylko resize lewej lub prawej krawędzi
    if (activeEdges.indexOf("left") === -1 && activeEdges.indexOf("right") === -1) return;

    var totalGap = GAP * (row.windows.length - 1);
    var usable = usableWidth - totalGap;
    if (usable <= 0) return;

    var idx = -1;
    for (var i = 0; i < row.windows.length; i++) {
        if (row.windows[i].win === activeWin) {
            idx = i;
            break;
        }
    }
    if (idx === -1) return;

    var activeItem = row.windows[idx];
    var modelWidth = activeItem.widthRatio * usable;
    var realDelta = g.width - modelWidth;

    if (Math.abs(realDelta) < 0.8) return;

    // ==================== AKUMULATOR DLA SZEROKOŚCI ====================
    const totalDelta = realDelta + accumulatedWidthDelta;

    if (Math.abs(totalDelta) < 5.5) {           // ← ten sam próg co przy wysokości
        accumulatedWidthDelta = totalDelta;
        return;
    }

    // Mamy wystarczającą sumę → stosujemy i zerujemy
    accumulatedWidthDelta = 0;
    // =================================================================

    var draggingRightEdge = (activeEdges.indexOf("right") !== -1);
    var leftItem, rightItem, deltaForLeft;

    if (draggingRightEdge) {
        if (idx + 1 >= row.windows.length) return;
        leftItem = activeItem;
        rightItem = row.windows[idx + 1];
        deltaForLeft = totalDelta;
    } else {
        if (idx - 1 < 0) return;
        leftItem = row.windows[idx - 1];
        rightItem = activeItem;
        deltaForLeft = -totalDelta;
    }

    var leftW = leftItem.widthRatio * usable;
    var rightW = rightItem.widthRatio * usable;
    var pairSum = leftW + rightW;

    var newLeftW = leftW + deltaForLeft;
    var minLeft = getMinWidth(leftItem.win);
    var minRight = getMinWidth(rightItem.win);

    newLeftW = Math.max(minLeft, Math.min(newLeftW, pairSum - minRight));
    var newRightW = pairSum - newLeftW;

    leftItem.widthRatio = newLeftW / usable;
    rightItem.widthRatio = newRightW / usable;

    // Aktualizacja ostatniego stanu
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
    const realMainW = safeWidth(g.width);

    // ==================== AKUMULATOR DLA LEFT MAIN ====================
    let totalDelta = (realMainW - (model.leftMain.widthRatio * usable.width)) + accumulatedWidthDelta;

    if (Math.abs(totalDelta) < 5.5) {
        accumulatedWidthDelta = totalDelta;
        return;
    }

    accumulatedWidthDelta = 0;
    // =================================================================

    let newMainW = clampLeftMainWidth(realMainW, usable, model);
    model.leftMain.widthRatio = newMainW / usable.width;

    const newGridW = safeWidth(usable.width - newMainW - GAP);

    // Aktualizacja szerokości okien w gridzie
    for (let row of model.rows) {
        if (!row.windows || row.windows.length === 0) continue;
        for (let i = 0; i < row.windows.length; i++) {
            const win = row.windows[i].win;
            if (!win || win.deleted) continue;
            const gw = safeWidth(win.frameGeometry.width);
            row.windows[i].widthRatio = gw / newGridW;
        }
    }

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
    const currentMainW = safeWidth(model.leftMain.widthRatio * usable.width);
    const currentGridW = safeWidth(usable.width - currentMainW - GAP);

    const item = row.windows[0];
    const currentColW = item.widthRatio * currentGridW;

    const realDelta = currentColW - g.width;

    if (Math.abs(realDelta) < 0.8) return;

    // ==================== AKUMULATOR ====================
    let totalDelta = realDelta + accumulatedWidthDelta;

    if (Math.abs(totalDelta) < 5.5) {
        accumulatedWidthDelta = totalDelta;
        return;
    }

    accumulatedWidthDelta = 0;
    // ====================================================

    let newMainW = currentMainW + totalDelta;   // delta jest już "odwrócona" logiką
    newMainW = clampLeftMainWidth(newMainW, usable, model);

    const appliedDelta = newMainW - currentMainW;
    model.leftMain.widthRatio = newMainW / usable.width;

    const newGridW = safeWidth(usable.width - newMainW - GAP);

    let newColW = currentColW - appliedDelta;
    const minW = getMinWidth(item.win);
    newColW = Math.max(minW, newColW);
    if (newColW > newGridW) newColW = newGridW;

    item.widthRatio = newColW / newGridW;

    // Reszta kolumn w gridzie proporcjonalnie
    for (let r of model.rows) {
        for (let i = 1; i < r.windows.length; i++) {
            const w = r.windows[i];
            const oldPx = w.widthRatio * currentGridW;
            w.widthRatio = oldPx / newGridW;
        }
    }

    edge.lastX = g.x;
    edge.lastW = g.width;
    edge.lastY = g.y;
    edge.lastH = g.height;
}


function updateLayoutFromGeometry(activeWin) {

    if (getCurrentState().allFloating) return;
    let model = getLayoutModel();

    if (!model || !activeWin || activeWin.deleted) return;
    if (scriptGeometryChange) return;

    // 🔥 DODANE: SINGLE WINDOW → NIE INTERFERUJ
    if (
        model.rows &&
        model.rows.length === 1 &&
        model.rows[0].windows &&
        model.rows[0].windows.length === 1
    ) {
        return;
    }

    const g = activeWin.frameGeometry;
    if (!g || !isFinite(g.width) || !isFinite(g.height)) return;

    const usable = getUsableArea();

    const edge = resizeEdges.get(activeWin);
    if (!edge) return;

    const edges = getActiveResizeEdges(edge, g);
    if (edges.length === 0) return;

    let targetRow = null;
    let rowIndex = -1;
    let winIndex = -1;

    for (let r = 0; r < model.rows.length; r++) {
        const row = model.rows[r];
        for (let i = 0; i < row.windows.length; i++) {
            if (row.windows[i].win === activeWin) {
                targetRow = row;
                rowIndex = r;
                winIndex = i;
                break;
            }
        }
        if (targetRow) break;
    }

    const isLeftMainMode = !!model.leftMain;

    // =====================================================
    // 🔥 X AXIS
    // =====================================================
    if (edges.includes("left") || edges.includes("right")) {

        let isMainResize = false;
        let isGridInternalResize = false;

        if (isLeftMainMode) {

            if (activeWin === model.leftMain.win) {
                isMainResize = true;
            }
            else if (targetRow && winIndex === 0) {

                // 🔥 KLUCZ: tylko LEFT = boundary main/grid
                if (edges.includes("left")) {
                    isMainResize = true;
                } else {
                    isGridInternalResize = true;
                }

            } else {
                isGridInternalResize = true;
            }

        } else {
            isGridInternalResize = true;
        }

        if (isMainResize) {

            if (activeWin === model.leftMain.win) {
                recomputeLeftMainFromGeometry(model, usable, activeWin);
            }
            else if (targetRow && winIndex === 0) {
                recomputeMainFromGridBoundary(model, usable, activeWin, targetRow, winIndex);
            }
        }

        if (isGridInternalResize && targetRow && winIndex >= 0) {

            const usableWidthForRow = isLeftMainMode
                ? safeWidth(usable.width - (model.leftMain.widthRatio * usable.width) - GAP)
                : usable.width;

            recomputeRowFromGeometry(targetRow, usableWidthForRow, activeWin);
        }
    }

    // =====================================================
    // 🔥 Y AXIS
    // =====================================================
    if (edges.includes("top") || edges.includes("bottom")) {

        if (model.rows.length > 1 && rowIndex !== -1) {

            const totalGap = GAP * (model.rows.length - 1);
            const usableH = safeHeightTotal(usable.height - totalGap);

            let modelBoundaryY = usable.y;

            for (let r = 0; r < rowIndex; r++) {
                const h = model.rows[r].heightRatio * usableH;
                modelBoundaryY += h + GAP;
            }

            let useTop = false;
            let useBottom = false;

            // 🔥 KLUCZ: DETEKCJA DOMINUJĄCEGO RUCHU (corner fix)
            if (edges.includes("top") && !edges.includes("bottom")) {
                useTop = true;
            } else if (edges.includes("bottom") && !edges.includes("top")) {
                useBottom = true;
            } else {
                const dyTop = Math.abs(g.y - edge.lastY);
                const dyBottom = Math.abs((g.y + g.height) - (edge.lastY + edge.lastH));

                if (dyTop > dyBottom) useTop = true;
                else useBottom = true;
            }

            if (useTop && rowIndex > 0) {

                const boundary = modelBoundaryY;
                const realDelta = g.y - boundary;

                recomputeHeightsFromBoundaryDelta(
                    model,
                    usable,
                    rowIndex - 1,
                    realDelta
                );
            }

            if (useBottom && rowIndex < model.rows.length - 1) {

                const upperH = model.rows[rowIndex].heightRatio * usableH;
                const boundary = modelBoundaryY + upperH;

                const realDelta = (g.y + g.height) - boundary;

                recomputeHeightsFromBoundaryDelta(
                    model,
                    usable,
                    rowIndex,
                    realDelta
                );
            }
        }
    }

    // ─────────────────────────────────────────────
    // UPDATE EDGE
    // ─────────────────────────────────────────────

    syncStateWithModel();
    setLayoutModel(model);

    scriptGeometryChange = true;
    applyLayoutCoalesced(model, usable, activeWin);
    scriptGeometryChange = false;

    edge.lastX = g.x;
    edge.lastY = g.y;
    edge.lastW = g.width;
    edge.lastH = g.height;
}


// ──────────────────────────────────────────────────────────────
// LIVE RESIZE – throttle re-layout
// ──────────────────────────────────────────────────────────────

function getActiveResizeEdges(edge, g) {
    if (!edge || !g) return [];

    const dxLeft   = Math.abs(g.x - edge.lastX);
    const dxRight  = Math.abs((g.x + g.width)  - (edge.lastX + edge.lastW));
    const dyTop    = Math.abs(g.y - edge.lastY);
    const dyBottom = Math.abs((g.y + g.height) - (edge.lastY + edge.lastH));

    const DEADZONE = 3;

    const edges = [];

    if (dxLeft   > DEADZONE) edges.push("left");
    if (dxRight  > DEADZONE) edges.push("right");
    if (dyTop    > DEADZONE) edges.push("top");
    if (dyBottom > DEADZONE) edges.push("bottom");

    return edges;
}

function scheduleRAF() {

    if (rafScheduled) return;

    rafScheduled = true;

    if (rafTimer) return;

    rafTimer = new QTimer();
    rafTimer.singleShot = true;
    rafTimer.interval = 16; // ~60 FPS

    rafTimer.timeout.connect(() => {

        rafTimer.stop();
        rafTimer = null;

        rafScheduled = false;

        flushRAF();
    });

    rafTimer.start();
}

function flushRAF() {

    if (!coalescedApply) return;

    const { model, area, skipClient } = coalescedApply;

    coalescedApply = null;

    if (!model || !area) return;

    scriptGeometryChange = true;
    applyLayoutModel(model, area, skipClient);
    scriptGeometryChange = false;
}




function applyLayoutCoalesced(model, area, skipClient = null) {

    coalescedApply = { model, area, skipClient };

    scheduleRAF();
}


function scheduleLiveResizeUpdate(client) {
    if (getCurrentState().allFloating) return;
    if (!client || client.deleted) return;

    const model = getLayoutModel();
    if (!model) return;

    // 🔥 DODANE: SINGLE WINDOW → NIE INTERFERUJ
    if (
        model.rows &&
        model.rows.length === 1 &&
        model.rows[0].windows &&
        model.rows[0].windows.length === 1
    ) {
        return;
    }

    if (scriptGeometryChange) return;
    if (!manualResizeInProgress) return;

    const g = client.frameGeometry;

    if (!g || !isFinite(g.width) || !isFinite(g.height) || g.width < 10 || g.height < 10) {
        return;
    }

    if (lastResizeGeometry) {
        const dx = Math.abs(g.width - lastResizeGeometry.width);
        const dy = Math.abs(g.height - lastResizeGeometry.height);

        if (dx < 3 && dy < 3) return;
    }

    lastResizeGeometry = { width: g.width, height: g.height };
    lastResizeClient = client;

    if (resizeThrottleTimer) return;

    resizeThrottleTimer = new QTimer();
    resizeThrottleTimer.interval = LIVE_RESIZE_THROTTLE;

    resizeThrottleTimer.timeout.connect(() => {

        resizeThrottleTimer.stop();
        resizeThrottleTimer = null;

        const c = lastResizeClient;
        if (!c || c.deleted) return;

        const usable = getUsableArea();

        updateLayoutFromGeometry(c);

        const modelNow = getLayoutModel();
        if (!modelNow) return;

        scriptGeometryChange = true;
        applyLayoutCoalesced(modelNow, usable, c);
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

            invalidateAreaCache();

            lastResizeTime = Date.now();   // 🔥 DODANE

            if (!isResizing) {
                isResizing = true;
                manualResizeInProgress = true;

                accumulatedHeightDelta = 0;
                accumulatedWidthDelta = 0;

                const g = client.frameGeometry;

                resizeEdges.set(client, {
                    lastX: g.x,
                    lastY: g.y,
                    lastW: g.width,
                    lastH: g.height,
                });
            }

        } else {

            if (isResizing) {

                isResizing = false;
                manualResizeInProgress = false;
                if (getCurrentState().allFloating) {
                    resizeEdges.delete(client);
                    return;
                }

                const model = getLayoutModel();

                // 🔥 SINGLE WINDOW
                if (
                    model &&
                    model.rows &&
                    model.rows.length === 1 &&
                    model.rows[0].windows &&
                    model.rows[0].windows.length === 1
                ) {
                    resizeEdges.delete(client);
                    return;
                }

                if (model) {

                    const usable = getUsableArea();

                    normalizeModelWithConstraints(model, usable);

                    scriptGeometryChange = true;
                    applyLayoutModel(model, usable);
                    scriptGeometryChange = false;

                    syncStateWithModel();
                    setLayoutModel(model);
                }

                lastResizeClient = null;
                lastResizeGeometry = null;

                let cleanupTimer = new QTimer();
                cleanupTimer.interval = 100;

                cleanupTimer.timeout.connect(() => {
                    cleanupTimer.stop();
                    resizeEdges.delete(client);
                });

                cleanupTimer.start();
            }
        }
    });

    client.frameGeometryChanged.connect(function() {

        if (!isResizing) return;
        lastResizeTime = Date.now();

        if (scriptGeometryChange) return;


        // 🔥 FLOAT ALL BLOCK
        if (getCurrentState().allFloating) return;

        const model = getLayoutModel();

        // SINGLE WINDOW → PUŚĆ NATYWNIE
        if (
            model &&
            model.rows &&
            model.rows.length === 1 &&
            model.rows[0].windows &&
            model.rows[0].windows.length === 1
        ) {
            return;
        }

        scheduleLiveResizeUpdate(client);
    });
}

function exitFloatAllToTiling() {

    const state = getCurrentState();
    if (!state.allFloating) return false;

    const visible = getVisibleWindows();
    if (!visible || visible.length === 0) return true;

    const floatingSet = getFloatingSet();

    // 🔥 cleanup
    resetPreview();
    resizeEdges.clear();
    manualResizeInProgress = false;
    movingWindow = null;

    state.allFloating = false;

    let order = getLastTiledOrder() || [];
    let added = 0;

    for (let w of visible) {
        if (!w || w.deleted) continue;

        if (!floatingSet.has(w)) continue;

        floatingSet.delete(w);

        if (!order.includes(w)) {
            order.push(w);
        }

        added++;
    }

    if (added > 0) {
        setLastTiledOrder(order);
    }

    clearLayoutModel();
    forceRebuildModel();
    state._layoutDirty = true;

    scheduleRelayout(0);


    delete state._savedOrder;
    delete state._savedLeftRatio;
    delete state._savedTopRatio;
    delete state._savedFirstRowMode;
    delete state._savedFloating;

    showOSDSafe("Layout reset", "view-grid");

    return true;
}



function toggleFloatingActiveWindow() {

    const win = workspace.activeWindow;
    if (!win || !win.normalWindow) return;

    const state = getCurrentState();

    const name = win.caption || win.resourceClass || "?";

    if (state.allFloating) {

        if (DEBUG) print("IGNORED toggle (allFloating):", name);

        showOSDSafe('Already in floating mode\nAll windows are floating');
        return;
    }


    let order = getLastTiledOrder() || [];

    const isTiled = isWindowTiled(win);

    // ==========================================================
    // 🪟 TILED → FLOATING
    // ==========================================================
    if (isTiled) {

        if (DEBUG) print("TO FLOAT (center):", name);

        const g = win.frameGeometry;

        const area = getFullArea();

        const centered = {
            x: Math.round(area.x + (area.width  - g.width)  / 2),
            y: Math.round(area.y + (area.height - g.height) / 2),
            width: Math.round(g.width),
            height: Math.round(g.height)
        };

        // 🔥 usuń z order
        order = order.filter(w => w !== win);
        setLastTiledOrder(order);

        getFloatingSet().add(win);
        autoFloating.delete(win);

        // 🔥 reset modelu
        clearLayoutModel();
        forceRebuildModel();
        getCurrentState()._layoutDirty = true;

        scriptGeometryChange = true;
        win.frameGeometry = centered;
        scriptGeometryChange = false;

        scheduleRelayout(0);

        workspace.raiseWindow(win);

        // 🔥 OSD
        showOSDSafe(`Floating:\n${name}`, "window");

        return;
    }

    // ==========================================================
    // 🧩 FLOAT → TILE
    // ==========================================================
    if (DEBUG) print("TO TILE:", name);

    getFloatingSet().delete(win);
    autoFloating.delete(win);

    if (!order.includes(win)) {
        order.push(win);
        setLastTiledOrder(order);
    }

    // 🔥 reset modelu
    clearLayoutModel();
    forceRebuildModel();
    getCurrentState()._layoutDirty = true;

    scheduleRelayout(0);

    // 🔥 OSD
    showOSDSafe(`Tiled:\n${name}`, "view-grid");

}


function toggleFloatAll() {

    const state = getCurrentState();
    const visible = getVisibleWindows();
    const hasWindows = visible && visible.length > 0;

    const floatingSet = getFloatingSet();

    // ==========================================================
    // 🟡 ENTER FLOAT ALL
    // ==========================================================
    if (!state.allFloating) {

        resetPreview();
        resizeEdges.clear();
        manualResizeInProgress = false;
        movingWindow = null;

        // 🔥 snapshot
        if (hasWindows) {
            state._savedOrder = (getLastTiledOrder() || []).slice();
            state._savedLeftRatio = getLeftRatio();
            state._savedTopRatio = getTopRatio();
            state._savedFirstRowMode = getFirstRowWindowsMode();
            state._savedFloating = new Set(floatingSet);

            for (let w of visible) {
                if (!w || w.deleted) continue;
                floatingSet.add(w);
            }
        } else {
            // brak okien → tylko ustaw tryb
            state._savedOrder = [];
            state._savedFloating = new Set();
        }

        state.allFloating = true;

        if (!hasWindows && DEBUG) {
            print("toggleFloatAll: no windows → mode only (ENTER)");
        }

        showOSDSafe("Floating mode", "window");
        return;
    }

    // ==========================================================
    // 🟢 EXIT FLOAT ALL → RESTORE SNAPSHOT
    // ==========================================================

    resetPreview();
    resizeEdges.clear();
    manualResizeInProgress = false;
    movingWindow = null;

    state.allFloating = false;

    // restore ratios
    if (state._savedLeftRatio !== undefined) setLeftRatio(state._savedLeftRatio);
    if (state._savedTopRatio !== undefined) setTopRatio(state._savedTopRatio);
    if (state._savedFirstRowMode !== undefined) setFirstRowWindowsMode(state._savedFirstRowMode);

    const visibleNow = getVisibleWindows();
    const hasWindowsNow = visibleNow && visibleNow.length > 0;

    // restore order
    if (hasWindowsNow && state._savedOrder && state._savedOrder.length > 0) {

        const valid = state._savedOrder.filter(w =>
            w &&
            !w.deleted &&
            visibleNow.includes(w)
        );

        setLastTiledOrder(valid);
    }

    // restore floating
    floatingSet.clear();
    if (hasWindowsNow && state._savedFloating) {
        for (let w of state._savedFloating) {
            if (w && !w.deleted) floatingSet.add(w);
        }
    }

    if (hasWindowsNow) {
        clearLayoutModel();
        forceRebuildModel();
        state._layoutDirty = true;

        scheduleRelayout(0);
    } else {
        if (DEBUG) {
            print("toggleFloatAll: no windows → mode only (EXIT)");
        }
    }

    showOSDSafe("Tiling restored", "view-grid");
}



function tileAllFloatingWindows() {

    const visible = getVisibleWindows();
    if (!visible || visible.length === 0) return;

    const floatingSet = getFloatingSet();

    let order = getLastTiledOrder() || [];

    let added = 0;

    for (let w of visible) {

        if (!w || w.deleted) continue;

        // tylko floating
        if (!floatingSet.has(w)) continue;

        floatingSet.delete(w);

        if (!order.includes(w)) {
            order.push(w);
        }

        added++;
    }

    if (added === 0) {
        showOSDSafe("No floating windows", "dialog-information");
        return;
    }

    setLastTiledOrder(order);

    // 🔥 reset modelu → pełny rebuild
    clearLayoutModel();
    forceRebuildModel();
    getCurrentState()._layoutDirty = true;

    scheduleRelayout(0);

    showOSDSafe(`Tiled ${added} window(s)`, "view-grid");
}


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
    if (!win || win.deleted || !win.normalWindow) return;

    if (!isWindowTiled(win)) {
        const origin = resizeOriginRect.get(win);
        const state = resizeState.get(win) || { tX: 0, tY: 0 };
        const area = getUsableArea();
        
        let useX = step;
        let useY = step;

        const EPS = 6;

        // Obliczenie aktualnego stanu okna
        const g = win.frameGeometry;
        const nowFullWidth = 
            Math.abs(g.x - area.x) < EPS && 
            Math.abs((g.x + g.width) - (area.x + area.width)) < EPS;

        const nowFullHeight = 
            Math.abs(g.y - area.y) < EPS && 
            Math.abs((g.y + g.height) - (area.y + area.height)) < EPS;

        if (origin) {
            const originW = origin.right - origin.left;
            const originH = origin.bottom - origin.top;

            const originFullWidth =
                Math.abs(origin.left - area.x) < EPS &&
                Math.abs(originW - area.width) < EPS;

            const originFullHeight =
                Math.abs(origin.top - area.y) < EPS &&
                Math.abs(originH - area.height) < EPS;

            // Zmodyfikowana logika blokad
            if (nowFullWidth && originFullWidth && state.tY > 0) {
                useX = 0;
            }
            if (nowFullHeight && originFullHeight && state.tX > 0) {
                useY = 0;
            }

            if (DEBUG) print(
                "wrapper float:",
                "step:", step,
                "| useX:", useX,
                "| useY:", useY,
                "| tX:", state.tX,
                "| tY:", state.tY,
                "| nowFullW:", nowFullWidth,
                "| nowFullH:", nowFullHeight
            );
        }

        resizeFloatingWindowUnified(win, useX, useY);

    } else {
        // 🔥 UNIFORM MODE
        resizeTiledWindowUnified(win, step/2, step/3, "uniform");
    }
}


function resizeFloatingWindow(win, step) {
    resizeFloatingWindowUnified(win, step, step);
}






function resizeActiveWindowDirectional(dirX, dirY) {

    const win = workspace.activeWindow;
    if (!win || win.deleted || !win.normalWindow) return;

    let stepX = dirX * RESIZE_STEP;
    let stepY = dirY * RESIZE_STEP;

    const tiled = isWindowTiled(win);

    // =========================================================
    // 🔥 FLOAT MAPPING (FIXED — ORIGIN ALWAYS AVAILABLE)
    // =========================================================
    if (!tiled) {

        let origin = resizeOriginRect.get(win);

        // 🔥 KLUCZOWY FIX — fallback na pierwszy tick
        if (!origin) {
            const g = win.frameGeometry;
            origin = {
                left: g.x,
                right: g.x + g.width,
                top: g.y,
                bottom: g.y + g.height
            };
        }

        const usable = getUsableArea();

        // 🔥 lokalny układ (bez offsetów)
        const cx = ((origin.left + origin.right) / 2) - usable.x;
        const cy = ((origin.top + origin.bottom) / 2) - usable.y;

        const screenCx = usable.width / 2;
        const screenCy = usable.height / 2;

        const isRight = cx > screenCx;
        const isTop   = cy < screenCy;

        // 🔥 Twoja reguła
        if (isRight) stepX = -stepX;
        if (isTop)   stepY = -stepY;

        if (DEBUG) {
            print(
                "floatMap:",
                "| cx:", cx.toFixed(1),
                "| cy:", cy.toFixed(1),
                "| right:", isRight,
                "| top:", isTop,
                "| stepX:", stepX.toFixed(3),
                "| stepY:", stepY.toFixed(3)
            );
        }
    }

    // ================= DEBUG =================
    if (DEBUG) {
        const state = resizeState.get(win) || { tX: 0, tY: 0 };

        print(
            "resizeDirectional:",
            "dirX:", dirX,
            "dirY:", dirY,
            "| stepX:", stepX.toFixed(3),
            "| stepY:", stepY.toFixed(3),
            "| tiled:", tiled,
            "| tX:", state.tX.toFixed(3),
            "| tY:", state.tY.toFixed(3),
            "| caption:", win.caption || win.resourceClass || "?"
        );
    }

    // ================= APPLY =================
    if (!tiled) {
        resizeFloatingWindowUnified(win, stepX, stepY);
    } else {
        resizeTiledWindowUnified(win, stepX/2, stepY/3, "directional");
    }
}

function resizeTiledWindowUnified(win, stepX, stepY, mode) {
    const model = getLayoutModel();
    if (!model) return;
    const usable = getUsableArea();
    const isLeftMainMode = !!model.leftMain;

    // =========================================================
    // 🔥 DIRECTION MAPPING
    // =========================================================
    if (mode === "directional") {

        let row = null;
        let rowIndex = -1;
        let idx = -1;
        let isLeftMainWin = false;

        if (isLeftMainMode && model.leftMain.win === win) {
            isLeftMainWin = true;
        }

        if (!isLeftMainWin) {
            for (let r = 0; r < model.rows.length; r++) {
                for (let i = 0; i < model.rows[r].windows.length; i++) {
                    if (model.rows[r].windows[i].win === win) {
                        row = model.rows[r];
                        rowIndex = r;
                        idx = i;
                        break;
                    }
                }
                if (row) break;
            }
        }

        let hasLeft = false;
        let hasRight = false;

        if (isLeftMainWin) {
            hasRight = true;
        } else if (row) {
            hasLeft = idx > 0 || (isLeftMainMode && model.leftMain.win !== win);
            hasRight = idx < row.windows.length - 1;
        }

        if ((hasLeft ^ hasRight)) {
            if (hasLeft && !hasRight) stepX = -stepX;
        }

        let hasTop = false;
        let hasBottom = false;

        if (!isLeftMainWin && row) {
            hasTop = rowIndex > 0;
            hasBottom = rowIndex < model.rows.length - 1;
        }

        if (!isLeftMainWin && (hasTop ^ hasBottom)) {
            if (!hasTop && hasBottom) stepY = -stepY;
        }

        if (DEBUG) {
            print("tiledMap:", "| stepX:", stepX, "| stepY:", stepY);
        }
    }

    // =========================================================
    // 🔥 CROSS-COLUMN (LEFT MAIN → GRID HEIGHTS)
    // =========================================================
    if (
        mode === "directional" &&
        stepY !== 0 &&
        isLeftMainMode &&
        model.leftMain.win === win
    ) {

        let valid = false;
        for (let r of model.rows) {
            if (r.windows.length === 1) {
                valid = true;
                break;
            }
        }

        if (valid && model.rows.length > 1) {

            const deltaPx = -stepY * usable.height;

            for (let i = 0; i < model.rows.length - 1; i++) {
                recomputeHeightsFromBoundaryDelta(
                    model,
                    usable,
                    i,
                    deltaPx
                );
            }

            if (DEBUG) print("cross-column (LEFT MAIN)");

            normalizeModelWithConstraints(model, usable);
            setLayoutModel(model);
            applyLayoutModel(model, usable);
            syncStateWithModel();

            return;
        }
    }

    // =========================================================
    // 🔥 LEFT MAIN (← →)
    // =========================================================
    if (stepX !== 0 && isLeftMainMode && model.leftMain.win === win) {

        const deltaPx = stepX * usable.width;
        const currentW = model.leftMain.widthRatio * usable.width;

        let newW = clampLeftMainWidth(currentW + deltaPx, usable, model);
        model.leftMain.widthRatio = newW / usable.width;

        const oldGridW = usable.width - currentW - GAP;
        const newGridW = usable.width - newW - GAP;

        if (newGridW > 0 && oldGridW > 0) {
            for (let r of model.rows) {
                for (let item of r.windows) {
                    item.widthRatio = (item.widthRatio * oldGridW) / newGridW;
                }
            }
        }

        normalizeModelWithConstraints(model, usable);
        setLayoutModel(model);
        applyLayoutModel(model, usable);
        syncStateWithModel();
    }

    // =========================================================
    // 🔍 FIND WINDOW
    // =========================================================
    let row = null;
    let rowIndex = -1;
    let idx = -1;

    for (let r = 0; r < model.rows.length; r++) {
        for (let i = 0; i < model.rows[r].windows.length; i++) {
            if (model.rows[r].windows[i].win === win) {
                row = model.rows[r];
                rowIndex = r;
                idx = i;
                break;
            }
        }
        if (row) break;
    }
    if (!row) return;

    const usableWidth = isLeftMainMode
        ? usable.width - (model.leftMain.widthRatio * usable.width) - GAP
        : usable.width;

    // =========================================================
    // 🔥 NEW: LEFT MAIN EDGE COUPLING (IDX === 0)
    // =========================================================
    if (
        stepX !== 0 &&
        isLeftMainMode &&
        model.leftMain.win !== win &&
        idx === 0 &&
        (row.windows.length > 1 || mode !== "directional") // 🔥 FIX
    ) {

        const coupling = 0.5;

        const deltaPx = -stepX * usable.width * coupling;

        const currentW = model.leftMain.widthRatio * usable.width;
        let newW = clampLeftMainWidth(currentW + deltaPx, usable, model);

        model.leftMain.widthRatio = newW / usable.width;

        const oldGridW = usable.width - currentW - GAP;
        const newGridW = usable.width - newW - GAP;

        if (newGridW > 0 && oldGridW > 0) {

            for (let item of row.windows) {
                const oldPx = item.widthRatio * oldGridW;
                item.widthRatio = oldPx / newGridW;
            }
        }

        if (DEBUG) print("leftMain edge coupling (idx===0)");
    }

    // =========================================================
    // 🔥 LEFT MAIN EDGE CONTROL (GRID → MAIN)
    // =========================================================
    if (
        mode === "directional" &&
        stepX !== 0 &&
        isLeftMainMode &&
        model.leftMain.win !== win &&
        row.windows.length === 1
    ) {

        const deltaPx = -stepX * usable.width;

        const currentW = model.leftMain.widthRatio * usable.width;
        let newW = clampLeftMainWidth(currentW + deltaPx, usable, model);

        model.leftMain.widthRatio = newW / usable.width;

        const oldGridW = usable.width - currentW - GAP;
        const newGridW = usable.width - newW - GAP;

        if (newGridW > 0 && oldGridW > 0) {
            for (let r of model.rows) {
                for (let item of r.windows) {
                    const oldPx = item.widthRatio * oldGridW;
                    item.widthRatio = oldPx / newGridW;
                }
            }
        }

        if (DEBUG) print("leftMain edge control");

        normalizeModelWithConstraints(model, usable);
        setLayoutModel(model);
        applyLayoutModel(model, usable);
        syncStateWithModel();

        return;
    }

    // =========================================================
    // 🔥 CROSS-ROW
    // =========================================================
    if (
        mode === "directional" &&
        stepX !== 0 &&
        row.windows.length === 1 &&
        model.rows.length > 1
    ) {

        let targetRow =
            (rowIndex === model.rows.length - 1)
                ? model.rows[rowIndex - 1]
                : model.rows[rowIndex + 1];

        if (targetRow && targetRow.windows.length === 2) {

            const usableWidthForRow = isLeftMainMode
                ? safeWidth(usable.width - (model.leftMain.widthRatio * usable.width) - GAP)
                : usable.width;

            recomputeRowFromDelta(
                targetRow,
                usableWidthForRow,
                0,
                stepX * usableWidthForRow
            );

            if (DEBUG) print("cross-row");

            normalizeModelWithConstraints(model, usable);
            setLayoutModel(model);
            applyLayoutModel(model, usable);
            syncStateWithModel();

            return;
        }
    }

    // =========================================================
    // WIDTH (X)
    // =========================================================
    if (stepX !== 0 && row.windows.length > 1) {

        if (idx > 0 && idx < row.windows.length - 1) {
            const L = row.windows[idx - 1];
            const M = row.windows[idx];
            const R = row.windows[idx + 1];

            let rL = L.widthRatio, rM = M.widthRatio, rR = R.widthRatio;

            const minL = getMinWidth(L.win) / usableWidth;
            const minM = getMinWidth(M.win) / usableWidth;
            const minR = getMinWidth(R.win) / usableWidth;

            let newM = Math.max(rM + stepX, minM);
            let newL = Math.max(rL - stepX / 2, minL);
            let newR = Math.max(rR - stepX / 2, minR);

            const scale = (rL + rM + rR) / (newL + newM + newR);

            L.widthRatio = newL * scale;
            M.widthRatio = newM * scale;
            R.widthRatio = newR * scale;
        }
        else {
            let n = (stepX > 0)
                ? (idx < row.windows.length - 1 ? idx + 1 : idx - 1)
                : (idx > 0 ? idx - 1 : idx + 1);

            if (n >= 0 && n < row.windows.length) {
                const A = row.windows[idx];
                const B = row.windows[n];

                let rA = A.widthRatio;
                let rB = B.widthRatio;
                const sum = rA + rB;

                let newA = rA + stepX;
                let newB = sum - newA;

                const minA = getMinWidth(A.win) / usableWidth;
                const minB = getMinWidth(B.win) / usableWidth;

                if (newA < minA) { newA = minA; newB = sum - newA; }
                if (newB < minB) { newB = minB; newA = sum - newB; }

                A.widthRatio = newA;
                B.widthRatio = newB;
            }
        }
    }

    // =========================================================
    // HEIGHT (Y)
    // =========================================================
    if (stepY !== 0 && model.rows.length > 1) {

        const deltaPx = stepY * usable.height;

        if (!(isLeftMainMode && model.leftMain.win === win)) {

            if (rowIndex > 0 && rowIndex < model.rows.length - 1) {
                recomputeHeightsFromBoundaryDelta(model, usable, rowIndex - 1, -deltaPx);
                recomputeHeightsFromBoundaryDelta(model, usable, rowIndex, deltaPx);
            }
            else if (rowIndex === 0) {
                recomputeHeightsFromBoundaryDelta(model, usable, 0, deltaPx);
            }
            else {
                recomputeHeightsFromBoundaryDelta(model, usable, rowIndex - 1, -deltaPx);
            }
        }
    }

    // =========================================================
    // FINAL
    // =========================================================
    normalizeModelWithConstraints(model, usable);
    setLayoutModel(model);
    applyLayoutModel(model, usable);
    syncStateWithModel();
}



function resizeFloatingWindowUnified(win, stepX, stepY) {

    if (!win || win.deleted) return;

    if (!resizeOriginRect.has(win) || !resizeState.has(win)) {
        const g = win.frameGeometry;
        resizeOriginRect.set(win, {
            left: g.x, right: g.x + g.width,
            top: g.y,  bottom: g.y + g.height
        });
        resizeState.set(win, { tX: 0, tY: 0 });
    }

    const usable = getUsableArea();

    const fg = win.frameGeometry;
    const g = {
        x: fg.x,
        y: fg.y,
        width: fg.width,
        height: fg.height
    };

    // ================= MANUAL CHANGE DETECT  =================

    const last = lastAppliedGeometry.get(win);
    const lastTime = lastInternalResizeTime.get(win) || 0;
    const now = Date.now();

    const INTERNAL_WINDOW_MS = 60; // 🔥 kluczowy próg (możesz dać 40–80)

    const isInternalResize = (now - lastTime) < INTERNAL_WINDOW_MS;

    if (last && !isInternalResize) {
        const manualChange =
        Math.abs(g.x - last.x) > 2 ||
        Math.abs(g.y - last.y) > 2 ||
        Math.abs(g.width - last.width) > 2 ||
        Math.abs(g.height - last.height) > 2;

        if (manualChange) {
            // Zamiast return → resetujemy i kontynuujemy z aktualną geometrią
            if (DEBUG) print("KLeftHandTiler: detected manual geometry change after float → resetting resize state");

            resizeState.delete(win);
            resizeOriginRect.delete(win);
            lastAppliedGeometry.delete(win);

            // Natychmiast inicjalizujemy na nowo na podstawie obecnej pozycji
            const currentG = win.frameGeometry;
            resizeOriginRect.set(win, {
                left: currentG.x,
                right: currentG.x + currentG.width,
                top: currentG.y,
                bottom: currentG.y + currentG.height
            });
            resizeState.set(win, { tX: 0, tY: 0 });

        }
    }

    // ================= INIT =================

    let state = resizeState.get(win);
    let origin = resizeOriginRect.get(win);

    if (!state || !origin) {

        state = { tX: 0, tY: 0 };

        origin = {
            left:   g.x,
            right:  g.x + g.width,
            top:    g.y,
            bottom: g.y + g.height
        };

        resizeState.set(win, state);
        resizeOriginRect.set(win, origin);
    }

    const minW = getMinWidth(win);
    const minH = getMinHeight(win);

    const originW = origin.right - origin.left;
    const originH = origin.bottom - origin.top;

    const screenW = usable.width;
    const screenH = usable.height;

    // ================= SHRINK RATIO =================

    let ratioX = (originW - minW) / (screenW - minW);
    let ratioY = (originH - minH) / (screenH - minH);

    if (!isFinite(ratioX)) ratioX = 0.5;
    if (!isFinite(ratioY)) ratioY = 0.5;

    ratioX = Math.max(0.05, Math.min(0.95, ratioX));
    ratioY = Math.max(0.05, Math.min(0.95, ratioY));

    const shrinkX = ratioX;
    const shrinkY = ratioY;

    // ================= LIMIT =================

    const isAtMinW = Math.abs(g.width - minW) < 2;
    const isAtMinH = Math.abs(g.height - minH) < 2;

    const isAtMaxW =
    Math.abs(g.x - usable.x) < 2 &&
    Math.abs((g.x + g.width) - (usable.x + usable.width)) < 2;

    const isAtMaxH =
    Math.abs(g.y - usable.y) < 2 &&
    Math.abs((g.y + g.height) - (usable.y + usable.height)) < 2;

    // ================= UPDATE =================

    if (!(stepX < 0 && isAtMinW) && !(stepX > 0 && isAtMaxW)) {

        const prev = state.tX;
        const next = state.tX + stepX;

        // 🔥 crossing zero → snap to zero
        if (prev !== 0 && Math.sign(prev) !== Math.sign(next)) {
            state.tX = 0;
        } else {
            state.tX = next;
        }
    }

    if (!(stepY < 0 && isAtMinH) && !(stepY > 0 && isAtMaxH)) {

        const prev = state.tY;
        const next = state.tY + stepY;

        if (prev !== 0 && Math.sign(prev) !== Math.sign(next)) {
            state.tY = 0;
        } else {
            state.tY = next;
        }
    }

    // ================= SOFT SYNC (INPUT-DRIVEN) =================

    if (stepX !== 0 && stepY !== 0) {

        const sameDirection =
        (stepX > 0 && stepY > 0) ||
        (stepX < 0 && stepY < 0);

        if (sameDirection) {

            const diff = state.tX - state.tY;

            if (Math.abs(diff) > 0.001) {

                const maxSync = Math.abs(stepX) * 0.5;

                const sync = Math.sign(diff) *
                Math.min(Math.abs(diff) * 0.5, maxSync);

                state.tX -= sync;
                state.tY += sync;
            }
        }
    }

    // 🔥 NOWE – rounding (KLUCZ)
    state.tX = Math.round(state.tX * 100) / 100;
    state.tY = Math.round(state.tY * 100) / 100;

    state.tX = Math.max(-1, Math.min(1, state.tX));
    state.tY = Math.max(-1, Math.min(1, state.tY));

    // ================= NORMALIZE =================

    function normGrow(t) {
        return Math.min(Math.abs(t), 1);
    }

    function normShrink(t, shrink) {
        return Math.min(Math.abs(t) / shrink, 1);
    }

    const ntX = state.tX >= 0
    ? normGrow(state.tX)
    : normShrink(state.tX, shrinkX);

    const ntY = state.tY >= 0
    ? normGrow(state.tY)
    : normShrink(state.tY, shrinkY);

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // ================= X =================

    let left, right;

    if (state.tX >= 0) {

        const distLeft  = origin.left - usable.x;
        const distRight = (usable.x + usable.width) - origin.right;

        left  = origin.left  - distLeft  * ntX;
        right = origin.right + distRight * ntX;

    } else {

        const cx = (origin.left + origin.right) / 2;

        const minLeft   = cx - minW / 2;
        const minRight  = cx + minW / 2;

        left  = lerp(origin.left,  minLeft,  ntX);
        right = lerp(origin.right, minRight, ntX);
    }

    // ================= Y =================

    let top, bottom;

    if (state.tY >= 0) {

        const distTop    = origin.top - usable.y;
        const distBottom = (usable.y + usable.height) - origin.bottom;

        top    = origin.top    - distTop    * ntY;
        bottom = origin.bottom + distBottom * ntY;

    } else {

        const cy = (origin.top + origin.bottom) / 2;

        const minTop    = cy - minH / 2;
        const minBottom = cy + minH / 2;

        top    = lerp(origin.top,    minTop,    ntY);
        bottom = lerp(origin.bottom, minBottom, ntY);
    }

    // ================= APPLY =================

    let newX = Math.round(left);
    let newY = Math.round(top);
    let newW = Math.round(right - left);
    let newH = Math.round(bottom - top);

    const maxRight  = usable.x + usable.width;
    const maxBottom = usable.y + usable.height;

    if (newX < usable.x) newX = usable.x;
    if (newY < usable.y) newY = usable.y;

    if (newX + newW > maxRight)  newX = maxRight - newW;
    if (newY + newH > maxBottom) newY = maxBottom - newH;

    // 🔥 oznacz jako internal resize
    lastInternalResizeTime.set(win, Date.now());

    win.frameGeometry = {
        x: newX,
        y: newY,
        width: newW,
        height: newH
    };

    lastAppliedGeometry.set(win, {
        x: newX,
        y: newY,
        width: newW,
        height: newH
    });

    // ================= SNAP =================

    const SNAP_EPS = 0.05;

    if (Math.abs(state.tX) < SNAP_EPS && Math.abs(state.tY) < SNAP_EPS) {

        win.frameGeometry = {
            x: Math.round(origin.left),
            y: Math.round(origin.top),
            width: Math.round(origin.right - origin.left),
            height: Math.round(origin.bottom - origin.top)
        };

        resizeState.delete(win);
        resizeOriginRect.delete(win);
        lastAppliedGeometry.delete(win);
        lastInternalResizeTime.delete(win);
        return;
    }
}


// ──────────────────────────────────────────────────────────────
// APPLY + SYNC helper
// ──────────────────────────────────────────────────────────────
function applyAndSync() {

    const usable = getUsableArea();

    scriptGeometryChange = true;
    applyLayoutModel(layoutModel, usable);
    scriptGeometryChange = false;

    syncStateWithModel();
}



//------------------reorder------------------------------------------------------------------------


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

        // 🔥 KLUCZ: tylko tiled (model = prawda)
        if (!isWindowTiled(w)) continue;

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

    // SORT
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

    const wc = centerOf(win);

    // 1️⃣ touching neighbors
    let neighbors = getAllNeighbors(win, direction);

    // 2️⃣ fallback (non-touching)
    if (!neighbors || neighbors.length === 0) {

        const wins = getVisibleWindows();
        neighbors = [];

        for (let w of wins) {

            if (!w || w === win || w.deleted) continue;

            const c = centerOf(w);

            // ✅ POPRAWIONE KIERUNKI
            if (direction === "right"  && c.x <= wc.x) continue;
            if (direction === "left"   && c.x >= wc.x) continue;
            if (direction === "bottom" && c.y <= wc.y) continue;
            if (direction === "top"    && c.y >= wc.y) continue;

            neighbors.push(w);
        }

        if (neighbors.length === 0) return null;
    }

    // 3️⃣ scoring
    let best = null;
    let bestScore = Infinity;

    for (let n of neighbors) {

        const nc = centerOf(n);

        let primaryDist, secondaryDist;

        if (direction === "left" || direction === "right") {
            primaryDist   = Math.abs(nc.x - wc.x);
            secondaryDist = Math.abs(nc.y - wc.y);
        } else {
            primaryDist   = Math.abs(nc.y - wc.y);
            secondaryDist = Math.abs(nc.x - wc.x);
        }

        const score = primaryDist + secondaryDist * 0.4;

        if (score < bestScore) {
            bestScore = score;
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

    const win = workspace.activeWindow;
    if (!win || !win.normalWindow) return;

    const neighbor = getBestNeighborInDirection(win, direction);
    if (!neighbor || neighbor === win) return;

    if (DEBUG) {
        print("SWAP: " +
            (win.caption || "?") + " <-> " +
            (neighbor.caption || "?") +
            " dir=" + direction);
    }

    const model = getLayoutModel();

    const winTiled = isWindowTiled(win);
    const neighborTiled = isWindowTiled(neighbor);

    // ==========================================================
    // 🧩 TRYB 1: TILED + MODEL
    // ==========================================================
    if (model && winTiled && neighborTiled) {

        swapWindowsInOrder(win, neighbor);

        let w1 = null;
        let w2 = null;

        if (model.leftMain) {
            if (model.leftMain.win === win) w1 = model.leftMain;
            if (model.leftMain.win === neighbor) w2 = model.leftMain;
        }

        for (let row of model.rows) {
            for (let item of row.windows) {
                if (item.win === win) w1 = item;
                if (item.win === neighbor) w2 = item;
            }
        }

        if (w1 && w2) {
            const tmp = w1.win;
            w1.win = w2.win;
            w2.win = tmp;
        } else {
            if (DEBUG) print("SWAP ERROR: model items not found");
            return;
        }

        const usable = getUsableArea();

        scriptGeometryChange = true;
        applyLayoutModel(model, usable);
        scriptGeometryChange = false;

        return;
    }

    // ==========================================================
    // 🪟 TRYB 2: FALLBACK (FLOATING / BRAK MODELU / MIX)
    // ==========================================================
    scriptGeometryChange = true;

    try {

        const g1 = win.frameGeometry;
        const g2 = neighbor.frameGeometry;

        function snap(g) {
            return {
                x: Math.round(g.x),
                y: Math.round(g.y),
                width: Math.round(g.width),
                height: Math.round(g.height)
            };
        }

        const G1 = snap(g1);
        const G2 = snap(g2);

        win.frameGeometry = G2;
        neighbor.frameGeometry = G1;

        workspace.raiseWindow(neighbor);
        workspace.raiseWindow(win);

    } finally {
        scriptGeometryChange = false;
    }
}


function moveWindowInDirection(direction) {

    const win = workspace.activeWindow;
    if (!win || !win.normalWindow) return;

    const model = getLayoutModel();
    const winTiled = isWindowTiled(win);

    // ==========================================================
    // 🧩 TILED → MOVE IN ORDER
    // ==========================================================
    if (model && winTiled) {

        const neighbor = getBestNeighborInDirection(win, direction);
        if (!neighbor || neighbor === win) return;

        if (!isWindowTiled(neighbor)) return;

        const order = getLastTiledOrder();

        const i1 = order.indexOf(win);
        const i2 = order.indexOf(neighbor);

        if (i1 === -1 || i2 === -1) return;

        order.splice(i1, 1);
        order.splice(i2, 0, win);

        setLastTiledOrder(order);

        getCurrentState()._layoutDirty = true;

        scheduleRelayout(0);

        return;
    }

    // ==========================================================
    // 🪟 FLOATING → PURE PIXEL MOVE (🔥 KLUCZ)
    // ==========================================================
    scriptGeometryChange = true;

    try {

        const g = win.frameGeometry;
        const step = 60; // możesz zwiększyć

        let dx = 0, dy = 0;

        if (direction === "left") dx = -step;
        if (direction === "right") dx = step;
        if (direction === "top") dy = -step;
        if (direction === "bottom") dy = step;

        win.frameGeometry = {
            x: Math.round(g.x + dx),
            y: Math.round(g.y + dy),
            width: g.width,
            height: g.height
        };

        workspace.raiseWindow(win);

    } finally {
        scriptGeometryChange = false;
    }
}

// ──────────────────────────────────────────────────────────────
// MANUAL DROP REORDER
// ──────────────────────────────────────────────────────────────

const PREVIEW_THROTTLE_MS = 60;

const TARGET_LOCK_THRESHOLD   = 0.22; // trzymanie targetu
const TARGET_SWITCH_THRESHOLD = 0.38; // zmiana targetu

const CENTER_RATIO = 0.28; // strefa swap (procent okna)
const DEADZONE_PX  = 14;   // brak reakcji na mikro ruch


// ==========================================================
// 🔧 STATE
// ==========================================================

let previewTimer = null;
let lastPreviewTime = 0;
let lastPreviewSignature = null;

let previewActive = false;
let previewOrderBackup = null;

let lockedTarget = null;
let lockedTargetIndex = -1;
let lastDropDecision = null;
let baseGeometries = null;


function schedulePreview(win) {

    if (!win || win.deleted) return;

    const now = Date.now();
    if (now - lastPreviewTime < PREVIEW_THROTTLE_MS) return;

    lastPreviewTime = now;

    if (previewTimer) return;

    previewTimer = new QTimer();
    previewTimer.singleShot = true;
    previewTimer.interval = 30;

    previewTimer.timeout.connect(() => {
        previewTimer.stop();
        previewTimer = null;

        previewDropStable(win);
    });

    previewTimer.start();
}

function computeDropDecision(win) {

    if (!win || win.deleted) return null;
    if (!isWindowTiled(win)) return null;

    const order = getLastTiledOrder();
    if (!order || order.length < 2) return null;
    if (!order.includes(win)) return null;

    const g = win.frameGeometry;

    let bestTarget = null;
    let bestIndex = -1;
    let bestScore = 0;

    for (let i = 0; i < order.length; i++) {

        const t = order[i];
        if (!t || t === win) continue;
        if (!isWindowTiled(t)) continue;

        const tg = baseGeometries?.get(t);
        if (!tg) continue;

        const score = overlapRatio(g, tg);

        if (score > bestScore) {
            bestScore = score;
            bestTarget = t;
            bestIndex = i;
        }
    }

    if (!bestTarget) return null;

    // 🔥 HYSTERESIS
    if (lockedTarget) {

        const lockedGeom = baseGeometries?.get(lockedTarget);
        if (lockedGeom) {
            const overlapLocked = overlapRatio(g, lockedGeom);

            if (overlapLocked > TARGET_LOCK_THRESHOLD) {
                bestTarget = lockedTarget;
                bestIndex = lockedTargetIndex;
            }
            else if (bestScore < TARGET_SWITCH_THRESHOLD) {
                return null;
            }
        }
    }

    lockedTarget = bestTarget;
    lockedTargetIndex = bestIndex;

    const target = bestTarget;
    const targetIndex = bestIndex;

    const tg = baseGeometries?.get(target);
    if (!tg) return null;

    const tc = {
        x: tg.x + tg.width / 2,
        y: tg.y + tg.height / 2
    };

    const wc = centerOf(win);

    const dx = wc.x - tc.x;
    const dy = wc.y - tc.y;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < DEADZONE_PX && absY < DEADZONE_PX) return null;

    const inCenter =
        absX < tg.width * CENTER_RATIO &&
        absY < tg.height * CENTER_RATIO;

    const oldIndex = order.indexOf(win);
    if (oldIndex === -1) return null;

    let mode = "move";
    let insertIndex = targetIndex;

    if (inCenter) {
        mode = "swap";
    } else {
        if (absX > absY) {
            if (dx > 0) insertIndex = targetIndex + 1;
        } else {
            if (dy > 0) insertIndex = targetIndex + 1;
        }
    }

    return {
        mode,
        targetIndex,
        insertIndex,
        oldIndex
    };
}


function previewDropStable(win) {

    const order = getLastTiledOrder();
    if (!order || order.length < 2) return;

    // 🔥 SNAPSHOT tylko raz
    if (!previewActive) {

        baseGeometries = new Map();

        for (let w of order) {
            if (!w || w.deleted) continue;

            const g = getCachedGeometry(w);
            baseGeometries.set(w, {
                x: g.x,
                y: g.y,
                width: g.width,
                height: g.height
            });
        }
    }

    const decision = computeDropDecision(win);
    if (!decision) return;

    const { mode, targetIndex, insertIndex, oldIndex } = decision;

    const signature = `${targetIndex}|${insertIndex}|${mode}`;
    const prev = lastPreviewSignature;

    if (prev === signature) return;

    let allowUpdate = true;

    if (prev) {

        const [pT, pI, pM] = prev.split("|");

        if (parseInt(pT) === targetIndex) {

            if (parseInt(pI) === insertIndex && pM !== mode) {

                if (mode === "swap") {
                    allowUpdate = true;
                } else {
                    const target = order[targetIndex];
                    const tg = baseGeometries?.get(target);

                    if (tg) {
                        const wc = centerOf(win);
                        const tc = {
                            x: tg.x + tg.width / 2,
                            y: tg.y + tg.height / 2
                        };

                        const dx = Math.abs(wc.x - tc.x);
                        const dy = Math.abs(wc.y - tc.y);

                        if (dx < tg.width * CENTER_RATIO * 1.4 &&
                            dy < tg.height * CENTER_RATIO * 1.4) {
                            allowUpdate = false;
                        }
                    }
                }
            }
        }
    }

    if (!allowUpdate) return;

    lastPreviewSignature = signature;

    // 🔥 cache decyzji do drop
    lastDropDecision = decision;

    let previewOrder = order.slice();

    if (mode === "swap") {

        [previewOrder[oldIndex], previewOrder[targetIndex]] =
        [previewOrder[targetIndex], previewOrder[oldIndex]];

    } else {

        previewOrder.splice(oldIndex, 1);

        let idx = insertIndex;
        if (oldIndex < idx) idx--;

        idx = Math.max(0, Math.min(previewOrder.length, idx));

        previewOrder.splice(idx, 0, win);
    }

    previewActive = true;

    const usable = getUsableArea();

    const previewModel = buildAndValidateModel(previewOrder, usable);
    if (!previewModel) return;

    scriptGeometryChange = true;
    applyLayoutModel(previewModel, usable, win);
    scriptGeometryChange = false;
}

function resetPreview() {

    if (!previewActive) return;

    previewActive = false;

    lockedTarget = null;
    lockedTargetIndex = -1;
    lastPreviewSignature = null;
    lastDropDecision = null;
    baseGeometries = null;

    if (previewTimer) {
        previewTimer.stop();
        previewTimer = null;
    }

    scheduleRelayout(0);
}


function handleManualDrop(win) {

    if (!lastDropDecision) {
        if (DEBUG) print("DROP skipped: no cached decision");
        return;
    }

    const { mode, targetIndex, insertIndex, oldIndex } = lastDropDecision;

    const order = getLastTiledOrder();
    if (!order || !order.includes(win)) return;

    if (mode === "swap") {

        [order[oldIndex], order[targetIndex]] =
        [order[targetIndex], order[oldIndex]];

    } else {

        order.splice(oldIndex, 1);

        let idx = insertIndex;
        if (oldIndex < idx) idx--;

        idx = Math.max(0, Math.min(order.length, idx));

        order.splice(idx, 0, win);
    }

    setLastTiledOrder(order);
    getCurrentState()._layoutDirty = true;
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

            // 🔥 NAJPIERW COMMIT
            handleManualDrop(c);

            // 🔥 POTEM RESET (KLUCZ FIX)
            resetPreview();

            movingWindow = null;
            movingStartCenter = null;
        }

        if (!c.move && !c.resize) {
            manualResizeInProgress = false;
        }

    });

    // 🔥 LIVE PREVIEW
    c.frameGeometryChanged.connect(() => {

        if (!c.move) return;
        if (scriptGeometryChange) return;

        schedulePreview(c);
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
relayoutTimer.interval = 100;
relayoutTimer.timeout.connect(function () {
    reLayout();
});


function scheduleRelayout(delay) {

    if (typeof delay === 'undefined') delay = 100;

    if (getCurrentState().allFloating) return;

    // 🔥 RESIZE WATCHDOG (naprawa stuck resize)
    if (manualResizeInProgress && delay !== 0) {

        const now = Date.now();

        // jeśli resize był niedawno → blokuj
        if (now - lastResizeTime < 500) {
            if (DEBUG) print("scheduleRelayout blocked (resize active)");
            return;
        }

        // 🔥 jeśli resize się “zgubił” → reset
        if (DEBUG) print("scheduleRelayout: resize timeout → force unlock");

        manualResizeInProgress = false;
        resizeEdges.clear();
    }

    // 🔥 natychmiastowy tryb (ważne)
    if (delay === 0) {
        relayoutTimer.stop();
        reLayout();
        return;
    }

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

        const newDeskIds = client.desktops.map(d => getDesktopIdSafe(d));

        for (let key in states) {
            const [, deskIdPart] = key.split(':');

            if (newDeskIds.includes(deskIdPart)) continue;

            const state = states[key];
            if (state && state.lastTiledOrder) {
                state.lastTiledOrder = state.lastTiledOrder.filter(w => w !== client);
            }
        }

        const currentDeskId = getCurrentDesktopIdentifier();

        if (canAutoRetile() && newDeskIds.includes(currentDeskId)) {
            scheduleRelayout();
        }
    });

    client._kwin_desktopChangeAttached = true;
}

workspace.windowList().forEach(attachDesktopChangeHandler);

// ──────────────────────────────────────────────────────────────
// SPECIAL WINDOW IGNORE
// ──────────────────────────────────────────────────────────────


function isIgnoredSpecialWindow(client) {
    if (!client) return false;
    const rClass = (client.resourceClass || "").toLowerCase();
    const rName = (client.resourceName || "").toLowerCase();
    return IGNORED_RESOURCE_CLASSES.some(cls => rClass.includes(cls)) ||
           IGNORED_RESOURCE_NAMES.some(name => rName.includes(name));
}

workspace.windowAdded.connect(client => {
    if (!client) return;
    _visibleCache = null;

    if (DEBUG) {
        print("---- NEW WINDOW DEBUG ----");
        print("caption:", client.caption);
        print("resourceClass:", client.resourceClass);
        print("resourceName:", client.resourceName);
        print("windowRole:", client.windowRole);
        print("wmClass:", client.resourceClass);
        print("minSize:", client.minSize ? client.minSize.width + "x" + client.minSize.height : "none");
        print("minimumSize:", client.minimumSize ? client.minimumSize.width + "x" + client.minimumSize.height : "none");
        print("geometry:", client.frameGeometry.width + "x" + client.frameGeometry.height);
        print("---------------------------");
    }

    // 🔥 TRACKUJ ZAWSZE
    trackMoveEvents(client);
    trackResizeEvents(client);
    trackWindowMinimizeRestore(client);
    attachDesktopChangeHandler(client);

    // 🔥 IGNORE
    if (isLauncher(client)) return;
    if (isIgnoredSpecialWindow(client)) return;
    if (IGNORE_TRANSIENT_WINDOWS && (client.transient || client.modal)) return;

    // 🔥 FLOAT ALL MODE → zawsze floating, zero tilingu
    if (getCurrentState().allFloating) {
        getFloatingSet().add(client);
        return;
    }

    // 🔥 NORMALNA LOGIKA AUTO-RETILE
    if (!(AUTO_LAYOUT_ON_NEW_WINDOW && canAutoRetile())) return;

    let timer = new QTimer();
    timer.interval = 160;

    timer.timeout.connect(() => {
        timer.stop();
        const vis = getVisibleWindows();
        const tiled = getTiledOrder();

        if (!client || client.deleted) return;
        if (isLauncher(client) || isIgnoredSpecialWindow(client)) return;
        if (IGNORE_TRANSIENT_WINDOWS && (client.transient || client.modal)) return;

        const { ordered, visible } = getTiledOrder();

        const usable = getUsableArea();

        if (visible.length > MAX_WINDOWS) {
            getFloatingSet().add(client);
            showOSDSafe(`Too many windows!\nTiling only ${MAX_WINDOWS}`, "dialog-warning");
            scheduleRelayout(0);
            return;
        }

        let testOrdered = ordered.slice();
        if (!testOrdered.includes(client)) testOrdered.push(client);

        const testModel = buildAndValidateModel(testOrdered, usable);

        if (!testModel) {
            getFloatingSet().add(client);
            autoFloating.add(client);
            const name = client.caption || client.resourceClass || "?";
            showOSDSafe("No space in the tile for:\n" + name, "dialog-warning");
            scheduleRelayout(0);
            return;
        }

        getFloatingSet().delete(client);
        autoFloating.delete(client);

        // Force-include new window in order (nawet jeśli jeszcze nie widać w visible)
        let order = getLastTiledOrder();
        if (!order.includes(client)) {
            order.push(client);
            setLastTiledOrder(order);
        }



        const model = getLayoutModel();

        // 🔥 FIX 1: model jeszcze nie istnieje
        if (!model) {
            clearLayoutModel();
            forceRebuildModel();
        } else {
            getCurrentState()._layoutDirty = true;
        }

        scheduleRelayout();


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

 function removeWindowFromModel(model, client) {
     if (!model || !client) return;

     try {
         if (model.leftMain && model.leftMain.win === client) {
             model.leftMain = null;
         }

         if (model.rows && Array.isArray(model.rows)) {
             for (let row of model.rows) {
                 if (!row || !row.windows) continue;

                 row.windows = row.windows.filter(item => item.win !== client);
             }

             model.rows = model.rows.filter(row => row.windows && row.windows.length > 0);
         }
     } catch (e) {
         if (DEBUG) print("removeWindowFromModel error:", e);
     }
 }

 function cleanupWindow(client) {
     if (!client) return;

     if (DEBUG) print("cleanupWindow:", client.caption || client.resourceClass || "?");

     // ─────────────────────────────────────────────
     // RESIZE STATE
     // ─────────────────────────────────────────────
     resizeEdges.delete(client);
     resizeState.delete(client);
     resizeOriginRect.delete(client);
     lastAppliedGeometry.delete(client);
     lastInternalResizeTime.delete(client);

     // ─────────────────────────────────────────────
     // FLOATING
     // ─────────────────────────────────────────────
     try {
         getFloatingSet().delete(client);
         autoFloating.delete(client);
     } catch (e) {}

     // ─────────────────────────────────────────────
     // MINIMIZED STACK
     // ─────────────────────────────────────────────
     try {
         const stack = getMinimizedStack();
         const idx = stack.indexOf(client);
         if (idx > -1) stack.splice(idx, 1);
     } catch (e) {}

     // ─────────────────────────────────────────────
     // STATE (global states[])
     // ─────────────────────────────────────────────
     for (let key in states) {
         const state = states[key];
         if (!state) continue;

         if (Array.isArray(state.lastTiledOrder)) {
             state.lastTiledOrder = state.lastTiledOrder.filter(w => w !== client);
         }

         if (Array.isArray(state._savedOrder)) {
             state._savedOrder = state._savedOrder.filter(w => w !== client);
         }

         if (state._savedFloating instanceof Set) {
             state._savedFloating.delete(client);
         }
     }

     // ─────────────────────────────────────────────
     // WORKSPACE STATE (KLUCZOWE!)
     // ─────────────────────────────────────────────
     for (let key in workspaceState) {
         const ws = workspaceState[key];
         if (!ws) continue;

         // layout model
         if (ws.layoutModel) {
             removeWindowFromModel(ws.layoutModel, client);
         }

         // floating
         if (ws.floating instanceof Set) {
             ws.floating.delete(client);
         }

         // order
         if (ws.state?.lastTiledOrder) {
             ws.state.lastTiledOrder =
             ws.state.lastTiledOrder.filter(w => w !== client);
         }
     }

     // ─────────────────────────────────────────────
     // MODEL (current)
     // ─────────────────────────────────────────────
     try {
         const model = getLayoutModel();
         if (model) {
             removeWindowFromModel(model, client);
         }
     } catch (e) {}

     // ─────────────────────────────────────────────
     // PREVIEW / DRAG STATE
     // ─────────────────────────────────────────────
     if (baseGeometries) {
         baseGeometries.delete(client);
     }

     if (movingWindow === client) {
         movingWindow = null;
         movingStartCenter = null;
     }

     if (lockedTarget === client) {
         lockedTarget = null;
         lockedTargetIndex = -1;
     }

     // ─────────────────────────────────────────────
     // CACHE
     // ─────────────────────────────────────────────
     try { _geoCache.delete(client); } catch (e) {}
     _visibleCache = null;

     // ─────────────────────────────────────────────
     // EXTRA SAFETY: purge deleted z map
     // ─────────────────────────────────────────────
     for (let [w] of resizeState) {
         if (!w || w.deleted) resizeState.delete(w);
     }

     for (let [w] of resizeEdges) {
         if (!w || w.deleted) resizeEdges.delete(w);
     }
     _visibleCache = null;
 }


function handleWindowRemoved(client) {
    if (!client) return;
    if (DEBUG) print("handleWindowRemoved:", client.caption || client.resourceClass || "?");

    // ─────────────────────────────────────────────
    // CZY OKNO BYŁO TILE'OWANE
    // ─────────────────────────────────────────────
    let wasTiled = false;
    try {
        const currentOrder = getLastTiledOrder();
        if (currentOrder && currentOrder.length) {
            wasTiled = currentOrder.includes(client);
        }
    } catch (e) {}
    // 🔥 SLOT SAVE (NOWE)
    try {
        const { ordered } = getTiledOrder();
        const idx = order.indexOf(client);

        if (idx !== -1) {
            lastFreedSlot = idx;
            if (DEBUG) print("SLOT FREED:", idx);
        }
    } catch (e) {}

    // ─────────────────────────────────────────────
    // 🔥 CENTRALNY CLEANUP (ZAMIENIA ROZPROSZONE DELETE)
    // ─────────────────────────────────────────────
    cleanupWindow(client);

    // ─────────────────────────────────────────────
    // 🔥 NOWA LOGIKA: NATYCHMIASTOWY RECLAIM AUTO-FLOATING
    // ─────────────────────────────────────────────
    const state = getCurrentState();
    const floating = Array.from(getFloatingSet())
    .filter(w => autoFloating.has(w));

    if (floating.length > 0 && AUTO_LAYOUT_ON_WINDOW_CLOSE && canAutoRetile()) {
        if (DEBUG) print(`Window removed → trying to reclaim ${floating.length} auto-floating windows`);

        const reclaimed = tryReclaimAutoFloatingWindows();

        if (reclaimed) {
            if (DEBUG) print("RECLAIM succeeded immediately after close");
            clearLayoutModel();
            forceRebuildModel();
            state._layoutDirty = true;
            scheduleRelayout(0);   // natychmiastowy rebuild
        }
    }

    // ─────────────────────────────────────────────
    // JEŚLI OKNO BYŁO TILE → RESET MODELU
    // ─────────────────────────────────────────────
    if (wasTiled) {
        if (DEBUG) print("WINDOW REMOVED → force rebuild");
        clearLayoutModel();
        forceRebuildModel();
        const state = getCurrentState();
        if (state) state._layoutDirty = true;
    }

    // ─────────────────────────────────────────────
    // AUTO-RELAYOUT (Twoja oryginalna logika)
    // ─────────────────────────────────────────────
    let shouldRelayout = false;
    if (AUTO_LAYOUT_ON_WINDOW_CLOSE && canAutoRetile()) {
        if (IGNORE_TRANSIENT_WINDOWS && (client.transient || client.modal)) {
            // ignore
        } else if (IGNORE_TRANSIENT_WINDOWS && isIgnoredSpecialWindow(client)) {
            // ignore
        } else if (isLauncher(client)) {
            // ignore
        } else {
            shouldRelayout = true;
        }
    }

    // ─────────────────────────────────────────────
    // RELAYOUT
    // ─────────────────────────────────────────────
    if (shouldRelayout) {
        scheduleRelayout();
    }

    // ─────────────────────────────────────────────
    // DEBUG
    // ─────────────────────────────────────────────
    if (DEBUG) {
        try {
            const model = getLayoutModel();
            const count = model && model._count;
            print("handleWindowRemoved done. model._count =", count);
        } catch (e) {}
    }
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

    if (!workspace.desktops || workspace.desktops.length === 0) return;

    const activeActivities = new Set(workspace.activities || []);
    const currentDesktops = new Set(
        workspace.desktops.map(getDesktopId).filter(id => id !== null)
    );

    for (let key in workspaceState) {

        const [actId, deskIdPart] = key.split(':');

        if (!activeActivities.has(actId) || !currentDesktops.has(deskIdPart)) {

            if (DEBUG) {
                print(`cleanup workspaceState → ${key}`);
            }

            delete workspaceState[key];
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

workspace.screensChanged.connect(invalidateAreaCache);
workspace.currentDesktopChanged.connect(invalidateAreaCache);

if (workspace.currentActivityChanged) {
    workspace.currentActivityChanged.connect(invalidateAreaCache);
}
