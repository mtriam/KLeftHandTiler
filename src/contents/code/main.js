print("KLeftHandTiler – loaded");

// ──────────────────────────────────────────────────────────────
// SHORTCUTS
// ──────────────────────────────────────────────────────────────
registerShortcut("RestoreLastMinimized", "---Restore last minimized window", "Ctrl+!", restoreLastMinimized);
registerShortcut("CycleActiveWindow", "---Switch to next visible window", "Ctrl+Esc", cycleActiveWindow);
registerShortcut("ToggleMaxOrMin", "---Toggle Maximize / double tap → Minimize", "Ctrl+`", ToggleMaxOrMin);
registerShortcut("DoubleTapToggleFullscreen", "---Double Ctrl+CapsLock → toggle fullscreen", "Ctrl+CapsLock", handleDoubleTap);
registerShortcut("RotateWindowsClockwiseKeepFocus","---Rotate windows clockwise (keep focus)", "Shift+Ctrl+Esc", rotateWindowsKeepFocus);
registerShortcut("cycleMainRatioPresets", "---Cycle main ratio presets", "Ctrl+Shift+F2", cycleMainRatioPresets);
registerShortcut("SmartTileOrCycle", "---Smart Tile / Cycle / DoubleTap Maximize", "Ctrl+~", smartTileHandler);
registerShortcut("CycleAutoRetile","---Cycle auto-retile mode","Ctrl+Shift+F3",cycleAutoRetileMode);
registerShortcut("ToggleBorderMode","---Toggle border mode","Ctrl+Shift+F4",toggleBorderMode);
registerShortcut("CycleTileModes","---Cycle tile → KWin tile → floatall","Ctrl+Shift+F1",cycleTileModes);
registerShortcut("SwapWindowLeft",  "---Swap with left window",  "Meta+Ctrl+Alt+Left",  () => swapWindowInDirection("left"));
registerShortcut("SwapWindowRight", "---Swap with right window", "Meta+Ctrl+Alt+Right", () => swapWindowInDirection("right"));
registerShortcut("SwapWindowUp",    "---Swap with top window",   "Meta+Ctrl+Alt+Up",    () => swapWindowInDirection("top"));
registerShortcut("SwapWindowDown",  "---Swap with bottom window","Meta+Ctrl+Alt+Down",  () => swapWindowInDirection("bottom"));
registerShortcut("GrowActiveWindow", "---Grow active window", "Meta+Alt+X", growActiveWindow);
registerShortcut("ShrinkActiveWindow", "---Shrink active window", "Meta+Alt+Z", shrinkActiveWindow);
registerShortcut("MoveWindowLeft",  "---Move window left",  "Meta+Alt+Shift+Left",  () => moveWindowInDirection("left"));
registerShortcut("MoveWindowRight", "---Move window right", "Meta+Alt+Shift+Right", () => moveWindowInDirection("right"));
registerShortcut("MoveWindowUp",    "---Move window up",    "Meta+Alt+Shift+Up",    () => moveWindowInDirection("top"));
registerShortcut("MoveWindowDown",  "---Move window down",  "Meta+Alt+Shift+Down",  () => moveWindowInDirection("bottom"));
registerShortcut("Resize Left", "---Resize Left", "Ctrl+Shift+Left", () => resizeActiveWindowDirectional(-1, 0));
registerShortcut("Resize Right", "---Resize Right", "Ctrl+Shift+Right", () => resizeActiveWindowDirectional(1, 0));
registerShortcut("Resize Up", "---Resize Up", "Ctrl+Shift+Up", () => resizeActiveWindowDirectional(0, 1));
registerShortcut("Resize Down", "---Resize Down", "Ctrl+Shift+Down", () => resizeActiveWindowDirectional(0, -1));
registerShortcut("CapsDoubleFloating", "---Double Caps → Toggle Floating", "CapsLock", handleDoubleTapCapsFloating);
registerShortcut("ShiftCapsDoubleFloatAll","---Shift+Double Caps → Enable Float All","Shift+CapsLock",handleDoubleTapShiftCapsFloatAll);
registerShortcut("ToggleFloatAll","---Enable floating mode","Meta+Shift+F",() => toggleFloatAll(true));
//registerShortcut("ToggleFloating", "---Toggle floating window", "Meta+Shift+Space", toggleFloatingActiveWindow);
registerShortcut("TileAllFloating","---Tile all floating windows","Meta+Ctrl+Space",tileAllFloatingWindows);
registerShortcut("SaveFloatingLayout1", "---Save layout slot 1", "Ctrl+Shift+F5", () => saveFloatingLayoutToSlot(0));
registerShortcut("SaveFloatingLayout2", "---Save layout slot 2", "Ctrl+Shift+F6", () => saveFloatingLayoutToSlot(1));
registerShortcut("SaveFloatingLayout3", "---Save layout slot 3", "Ctrl+Shift+F7", () => saveFloatingLayoutToSlot(2));
registerShortcut("CycleFloatingLayouts", "---Cycle floating layouts", "Ctrl+Meta+`", cycleFloatingLayouts);
registerShortcut("ClearFloatingLayout1", "---Clear layout slot 1", "Ctrl+Shift+Alt+F5", () => clearFloatingLayout(0));
registerShortcut("ClearFloatingLayout2", "---Clear layout slot 2", "Ctrl+Shift+Alt+F6", () => clearFloatingLayout(1));
registerShortcut("ClearFloatingLayout3", "---Clear layout slot 3", "Ctrl+Shift+Alt+F7", () => clearFloatingLayout(2));
registerShortcut("KWinTileApply","Apply KWin Tiling","Ctrl+Alt+`",() => applyKWinTiling());

// ──────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────
const DEBUG = false;  
const LIVE_RESIZE_THROTTLE = 16;   // 50-80 is ideal
const MAX_FIRST_ROW = 3;
const RESIZE_STEP = 0.1;
const MAIN_RATIO_PRESETS = [[1.5,1.5],[2.0,2.0],[3.0,3.0],[1.0,1.0]];
const SWAP_THRESHOLD = 0.55;
const MOVE_THRESHOLD = 0.18;
const AREA_CACHE_TTL = 16; // ~1 frame (60fps)
const GEO_CACHE_TTL = 16;
const TILE_ON_START = false;
const REORDER_SLOT_THRESHOLD = 0.35;
const PREVIEW_THROTTLE_MS = 60;

const TARGET_LOCK_THRESHOLD   = 0.22; 
const TARGET_SWITCH_THRESHOLD = 0.38; 

const CENTER_RATIO = 0.28; // swap zone (window percentage)
const DEADZONE_PX  = 14;   // no reaction to micro-movements

const OSD_DISPLAY_TIME = 500;


const MAX_WINDOWS = readConfig("maxWindows", 5);
const OVERFLOW_BEHAVIOR = readConfig("overflowBehavior", 2);
const MINIMIZE_IGNORED_WINDOWS = readConfig("minimizeIgnoredWindows", true);
const TILE_EVEN_IF_NEW_MAXIMIZED = readConfig("tileEvenIfNewMaximized", true);
const AUTO_REMOVE_EMPTY_DESKTOPS = readConfig("autoRemoveEmptyDesktops", true);
const MINIMIZE_SNAPSHOT_OVERFLOW = readConfig("minimizeSnapshotOverflow", true);
const AUTO_LAYOUT_ON_DESKTOP_CHANGE = readConfig("autoLayoutOnDesktopChange", true);
const AUTO_LAYOUT_ON_ACTIVITY_CHANGE = readConfig("autoLayoutOnActivityChange", true);
const AUTO_LAYOUT_ON_NEW_WINDOW = readConfig("autoLayoutOnNewWindow", true);
const AUTO_LAYOUT_ON_WINDOW_CLOSE = readConfig("autoLayoutOnWindowClose", true);
const AUTO_LAYOUT_ON_WINDOW_MINIMIZE = readConfig("autoLayoutOnWindowMinimize", true);
const AUTO_LAYOUT_ON_WINDOW_RESTORE = readConfig("autoLayoutOnWindowRestore", true);
const AUTO_RETILE_MODE = readConfig("autoRetileMode", 1); // 0=off, 1=tiled only, 2=always
const SNAPSHOT_SLOTS_TEXT = [readConfig("SLOT_1", ""),readConfig("SLOT_2", ""),readConfig("SLOT_3", "")];
const DEFAULT_PRESET_INDEX = readConfig("defaultPresetIndex", 0);
const DEFAULT_DESKTOP_MODE = Math.max(0, Math.min(3, readConfig("defaultDesktopMode", 0))); // 0=tiled, 1=KWin, 2=float all, 3=max all
const DOUBLE_TAP_THRESHOLD = readConfig("doubleTapThresholdMs", 300);
const GAP = readConfig("gapBetweenWindows", 4);
const MARGIN = readConfig("screenMargin", 4);
const IGNORE_TILING = readConfig("ignoreWordsTiling1", "print,find,replace,confirm,settings,preferences,properties").split(",");
const IGNORE_CYCLING = readConfig("ignoreWordsCycling1", "").split(",");
const IGNORE_TRANSIENT_WINDOWS = readConfig("ignoreTransientWindows", true);
let borderMode = Number(readConfig("decorationMode", readConfig("borderMode", 0))); // compat: old key `borderMode`
if (!Number.isFinite(borderMode)) borderMode = 0;
borderMode = Math.max(0, Math.min(2, Math.trunc(borderMode)));
const IGNORED_RESOURCE_CLASSES = ["org.freedesktop.impl.portal.desktop.kde","org.freedesktop.portal.Desktop","xdg-desktop-portal"];
const IGNORED_RESOURCE_NAMES = ["xdg-desktop-portal","xdg-desktop-portal-kde"];
const EDGE_TOLERANCE = GAP + 6;


// =====================================================
// GLOBAL STATE
// =====================================================
let scriptGeometryChange = false;
let _kwinApplyIgnoreUntil = 0;
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
const layoutModels = {};          
const layoutMeta = {};
const floatingWindowsMap = {};
let floatingLayouts = [null, null, null];
let currentLayoutIndex = -1;
let _sanitizeLock = false;



let resizeState = new Map();          // win → { tX, tY }
let resizeOriginRect = new Map();     // win → origin
let lastAppliedGeometry = new Map();  // for detecting manual changes
let lastInternalResizeTime = new Map(); // win → timestamp ms
let autoFloating = new Set();
let lastFreedSlot = null;
let managedDesktops = new Set();
let _cleanupDesktopsLock = false;
let _forwardOverflowCreateBatch = null;


let previewTimer = null;
let lastPreviewTime = 0;
let lastPreviewSignature = null;

let previewActive = false;
let previewOrderBackup = null;

let lockedTarget = null;
let lockedTargetIndex = -1;
let lastDropDecision = null;
let baseGeometries = null;

let osdQueue = [];
let osdProcessing = false;

let _desktopSwitchTs = 0;
let _lastRelayoutRunTs = 0;
let _windowTokenSeq = 1;
const _windowTokens = new Map();

let accumulatedHeightDelta = 0;
let accumulatedWidthDelta   = 0;

let lastScreenCount = workspace.screens?.length ?? 0;
let cachedScreenId = null;
let _screenContextOverride = null;

const minimizedStacks = {};   
const states = {};

function parseSnapshotConfigEntry(rawText, fallbackSlot) {
    if (!rawText || typeof rawText !== "string") return null;
    const trimmed = rawText.trim();
    if (!trimmed) return null;

    let slot = fallbackSlot;
    let jsonText = trimmed;
    const prefixed = trimmed.match(/^SLOT_(\d+)\s*[:=\-]?\s*(\{[\s\S]*)$/);
    if (prefixed) {
        slot = Number(prefixed[1]) - 1;
        jsonText = prefixed[2];
    }

    const parsed = JSON.parse(jsonText);

    let snapshot = parsed;
    if (parsed && typeof parsed === "object" && parsed.snapshot) {
        snapshot = parsed.snapshot;
        if (Number.isInteger(parsed.slot)) {
            slot = parsed.slot;
        }
    }

    if (!snapshot || typeof snapshot !== "object") return null;
    const snapType = snapshot.type;
    const snapMode = snapshot.mode || snapType;
    if (snapType !== "floating" && snapType !== "tiling" && snapType !== "kwin") return null;
    if (snapMode !== "floating" && snapMode !== "tiling" && snapMode !== "kwin") return null;
    if (snapType === "floating" && !Array.isArray(snapshot.data)) return null;
    if (snapType === "tiling" && !snapshot.model) return null;

    if (!Number.isInteger(slot)) slot = fallbackSlot;
    const maxSlot = floatingLayouts.length - 1;
    slot = Math.max(0, Math.min(maxSlot, slot));

    return { slot: slot, snapshot: snapshot };
}

function loadSnapshotSlotsFromConfig() {
    for (let i = 0; i < SNAPSHOT_SLOTS_TEXT.length; i++) {
        try {
            const loaded = parseSnapshotConfigEntry(SNAPSHOT_SLOTS_TEXT[i], i);
            if (!loaded) continue;

            floatingLayouts[loaded.slot] = loaded.snapshot;
            currentLayoutIndex = loaded.slot;
            print("[SNAPSHOT_CONFIG_LOAD] SLOT_" + (i + 1) + " -> slot " + (loaded.slot + 1));
        } catch (e) {
            print("[SNAPSHOT_CONFIG_LOAD] SLOT_" + (i + 1) + " parse failed:", e);
        }
    }
}

loadSnapshotSlotsFromConfig();



function applyKWinTiling(options = {}) {
    const screen = normalizeScreenTarget(options.screen);
    const screenId = getScreenIdForTarget(screen);
    const desktop = options.desktop || workspace.currentDesktop;
    const activeBefore = workspace.activeWindow;

    if (DEBUG) {
        print(`[KWIN APPLY] source=${options.source || "manual"} screen=${screenId} active=${getScreenIdForTarget(workspace.activeScreen)}`);
    }

    return withScreenContext(screen, () => {
        _kwinApplyIgnoreUntil = Date.now() + 420;
        const state = getCurrentState();
        const wasFloating = state.allFloating;

        state.kwinTilingActive = true;
        state.allFloating = true;

        const root = workspace.rootTile(screen, desktop);

        if (!root) {
            if (DEBUG) print(`[KWIN APPLY] no root tile for screen=${screenId}`);
            showOSDSafe("KWin tiling applied", "view-grid");
            return;
        }

        showOSDSafe("KWin tiling mode", "view-grid");

        if (!wasFloating) {
            resetPreview();
            resizeEdges.clear();
            manualResizeInProgress = false;
            movingWindow = null;
        }

        let windows = getVisibleWindows()
            .filter(w => w && !w.deleted && !w.minimized && !w.skipTaskbar);


        function collectLeaves(tile, out = []) {
            if (tile.tiles && tile.tiles.length > 0) {
                tile.tiles.forEach(child => collectLeaves(child, out));
            } else {
                out.push(tile);
            }
            return out;
        }

        const leaves = collectLeaves(root);
        const limit = leaves.length;

        if (DEBUG) {
            print("KWIN APPLY:");
            print("windows:", windows.length);
            print("tiles:", limit);
            if (windows.length === 0) {
                const sample = workspace.windowList().filter(w => w && !w.deleted).slice(0, 6);
                for (let w of sample) {
                    debugWindowVisibility(w, "kwin-apply/sample");
                }
            }
        }

        if (windows.length > limit) {

            const overflow = windows.slice(limit);

            if (DEBUG) {
                print("KWIN OVERFLOW:", overflow.length);
            }

            overflow.forEach(w => {
                getFloatingSet().add(w);
                if (typeof autoFloating !== "undefined") {
                    autoFloating.add(w);
                }

                moveWindowToOverflow(w, {
                    source: "kwin_apply",
                    preserveWorkspace: true,
                    silent: true,
                    deferRelayout: true
                });
            });

            _visibleCache = null;
            windows = getVisibleWindows()
                .filter(w => w && !w.deleted && !w.minimized && !w.skipTaskbar)
                .slice(0, limit);
        }

        // =========================================================
        // 🔥 RESET TILE
        // =========================================================
        windows.forEach(w => {
            if (!w || !w.tile) return;

            try {
                w.tile.unmanage(w);
            } catch (e) {
                // noop: do not write to `window.tile` (deprecated in KWin)
            }
        });

        // =========================================================
        // 🔥 SORT (preserve saved order per workspace first)
        // =========================================================
        const savedOrder = getLastTiledOrder().filter(w => w && !w.deleted && windows.includes(w));
        const savedSet = new Set(savedOrder);
        const rest = windows
            .filter(w => !savedSet.has(w))
            .sort((a, b) => (a.stackingOrder || 0) - (b.stackingOrder || 0));
        windows = savedOrder.concat(rest);

        const count = Math.min(windows.length, leaves.length);

        if (count === 0) return;

        // =========================================================
        // 🔥 APPLY TILE
        // =========================================================
        for (let i = 0; i < count; i++) {
            const w = windows[i];
            const tile = leaves[i];

            if (!w || w.deleted) continue;

            workspace.activeWindow = w;

            tile.manage(w);

            w.fullScreen = false;

            getFloatingSet().delete(w);
            if (typeof autoFloating !== "undefined") {
                autoFloating.delete(w);
            }
        }

        // Persist KWin tile assignment order for this workspace context.
        setLastTiledOrder(windows.slice(0, count));

        if (activeBefore && !activeBefore.deleted) {
            workspace.activeWindow = activeBefore;
            workspace.raiseWindow(activeBefore);
        }

        clearLayoutModel();
        state._layoutDirty = false;

        _visibleCache = null;
        applyBorderMode();
    });
}

function cycleTileModes() {
    const state = getCurrentState();
    const visible = getVisibleWindows().filter(w => !w.deleted && !w.minimized);

    const isMaximizedAll = state.maximizedAll || 
                          (visible.length > 0 && visible.every(w => w.maximizeMode !== 0));

    // 1. Maximize All -> return to Normal Tiling
    if (isMaximizedAll) {
        unmaximizeAll();
        state.kwinTilingActive = false;
        state.allFloating = false;
        scheduleRelayout(0);
        return;
    }

    // 2. KWin Tiling → All Floating
    if (state.kwinTilingActive) {
        toggleFloatAll(true); // force on (disables KWin tiling if active)
        state.maximizedAll = false;
        return;
    }

    // 3. All Floating → Maximize All
    if (state.allFloating) {
        toggleFloatAll(false, { showOSD: false }); // force off (without "Tiling mode" flash)
        maximizeAll();
        return;
    }

    // 4. Normal Tiling (or no mode) -> enable KWin Tiling
    applyKWinTiling();
}

function disableKWinTiling() {
    const state = getCurrentState();

    getVisibleWindows().forEach(w => {
        if (!w || w.deleted || w.minimized || !w.tile) return;

        try {
            w.tile.unmanage(w);
        } catch (e) {
        }
    });

    state.kwinTilingActive = false;
}


// ====================== MAXIMIZE ALL ======================
function maximizeAll() {
    const visible = getVisibleWindows().filter(w => !w.deleted && !w.minimized);
    const state = getCurrentState();

    visible.forEach(w => {
        if (w.maximizable) {
            w.setMaximize(true, true);
        }
    });

    state.maximizedAll = true;
    state.kwinTilingActive = false;
    state.allFloating = false;

    showOSDSafe("Maximize All", "view-fullscreen");
}

function unmaximizeAll() {
    const visible = getVisibleWindows().filter(w => !w.deleted && !w.minimized);
    const state = getCurrentState();

    visible.forEach(w => {
        if (w.maximizable) {
            w.setMaximize(false, false);
        }
    });

    state.maximizedAll = false;
    showOSDSafe("Tiling mode", "view-grid");
}


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
                allFloating: false,
                kwinTilingActive: false,      // added for safety
                maximizedAll: false,          // ← NEW STATE
                _defaultModeApplied: false,
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
    return getStateKey(); // already has: activity:desktop:screen
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


function normalizeScreenTarget(screenTarget) {
    const screens = workspace.screens || [];

    if (typeof screenTarget === "number" && isFinite(screenTarget)) {
        const idx = Math.trunc(screenTarget);
        if (idx >= 0 && idx < screens.length) return screens[idx];
        if (DEBUG) print(`[SCREEN] normalize fallback: requested index=${screenTarget} count=${screens.length}`);
        return workspace.activeScreen || screens[0] || null;
    }

    if (screenTarget) return screenTarget;
    return workspace.activeScreen || screens[0] || null;
}

function getScreenIdForTarget(screenTarget) {
    const screens = workspace.screens || [];
    const target = normalizeScreenTarget(screenTarget);

    for (let i = 0; i < screens.length; i++) {
        if (screens[i] === target) return i;
    }

    if (typeof screenTarget === "number" && isFinite(screenTarget)) {
        const idx = Math.trunc(screenTarget);
        return idx >= 0 ? idx : 0;
    }

    return 0;
}

function getEffectiveScreenTarget() {
    if (_screenContextOverride !== null && _screenContextOverride !== undefined) {
        return normalizeScreenTarget(_screenContextOverride);
    }
    return normalizeScreenTarget(workspace.activeScreen);
}

function getEffectiveScreenId() {
    return getScreenIdForTarget(getEffectiveScreenTarget());
}

function withScreenContext(screenTarget, fn) {
    const prev = _screenContextOverride;
    _screenContextOverride = normalizeScreenTarget(screenTarget);
    try {
        return fn();
    } finally {
        _screenContextOverride = prev;
    }
}

function getScreenForWindow(win, desktopObj = getCurrentDesktopForAPI()) {
    if (!win || win.deleted || !win.frameGeometry) {
        return getEffectiveScreenTarget();
    }

    const screens = workspace.screens || [];
    const outputs = screens.length > 0 ? screens : [normalizeScreenTarget(workspace.activeScreen)];
    if (!outputs[0]) return normalizeScreenTarget(workspace.activeScreen);
    const geo = win.frameGeometry;
    const cx = geo.x + geo.width / 2;
    const cy = geo.y + geo.height / 2;

    let nearest = outputs[0];
    let nearestId = getScreenIdForTarget(outputs[0]);
    let nearestDist = Infinity;

    for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        const area = workspace.clientArea(KWin.FullScreenArea, output, desktopObj);
        const inside =
            cx >= area.x &&
            cx < area.x + area.width &&
            cy >= area.y &&
            cy < area.y + area.height;

        if (inside) {
            if (DEBUG) print(`[SCREEN] window "${win.caption || win.resourceClass || "?"}" -> screen ${i} (inside)`);
            return output;
        }

        const ax = area.x + area.width / 2;
        const ay = area.y + area.height / 2;
        const dist = Math.hypot(cx - ax, cy - ay);

        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = output;
            nearestId = i;
        }
    }

    if (DEBUG) print(`[SCREEN] window "${win.caption || win.resourceClass || "?"}" -> screen ${nearestId} (nearest fallback)`);
    return nearest;
}



function getStateKey() {
    const activityId = getCurrentActivityId();
    const desktopId = getCurrentDesktopIdentifier();
    const screenId = getEffectiveScreenId();

    return `${activityId}:${desktopId}:${screenId}`;
}

function getWorkspaceKey() {
    return getCurrentDesktopIdentifier() + "_" + getEffectiveScreenId();
}


function getCurrentDesktopForAPI() {
    const d = workspace.currentDesktop;

    // Plasma 6 
    if (typeof d === "object") return d;

    // fallback
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
        getEffectiveScreenId()
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
        getEffectiveScreenTarget(),
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
        getEffectiveScreenTarget(),
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
    return s.firstRowMode ?? -1;
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

    for (let w of clean)  {
        autoFloating.delete(w);
    }
}

//──────────────────────────────────────────────────────────────
// DESKTOPS PLASMA 6 WAYLAND
//──────────────────────────────────────────────────────────────
function getOtherDesktop() {
    const desktops = workspace.desktops || [];
    const current = workspace.currentDesktop;
    for (let d of desktops) {
        if (d !== current) return d;
    }
    return null;
}

function createNewDesktop(callback) {
    if (DEBUG) print("CREATE DESKTOP");

    function finalize(d) {
        if (!d) {
            callback && callback(null);
            return;
        }

        const id = getDesktopIdSafe(d);
        if (id != null) {
            managedDesktops.add(id);
        }

        callback && callback(d);
    }

    // 🔹 Primary (Plasma 6)
    if (typeof workspace.createDesktop === "function") {
        const d = workspace.createDesktop(-1, "");

        if (d) {
            let t = new QTimer();
            t.singleShot = true;
            t.interval = 120;

            t.timeout.connect(() => {
                t.stop();
                finalize(d);
            });

            t.start();
            return;
        }
    }

    // 🔹 Fallback
    const target = (workspace.numberOfDesktops || 1) + 1;
    workspace.numberOfDesktops = target;

    let t = new QTimer();
    t.singleShot = true;
    t.interval = 150;

    t.timeout.connect(() => {
        t.stop();

        const list = workspace.desktops || [];
        const d = list[list.length - 1] || null;

        finalize(d);
    });

    t.start();
}

function countWindowsOnDesktop(desktop) {
    if (!desktop) return 0;

    const currentActivity = workspace.currentActivity;
    const screenGeo = getFullArea();

    return workspace.windowList().filter(w => {
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
            isIgnoredSpecialWindow(w) ||
            w.deleted ||
            matchesIgnoreList(w, IGNORE_TILING)
        ) {
            return false;
        }

        if (!windowOnCurrentActivity(w, currentActivity)) return false;

        if (!windowOnDesktop(w, desktop)) return false;

        const geo = getCachedGeometry(w);
        const centerX = geo.x + geo.width / 2;
        const centerY = geo.y + geo.height / 2;

        return centerX >= screenGeo.x &&
               centerX <  screenGeo.x + screenGeo.width &&
               centerY >= screenGeo.y &&
               centerY <  screenGeo.y + screenGeo.height;
    }).length;
}

function getSafeDesktopForOverflow() {
    const desktops = workspace.desktops || [];
    const current = workspace.currentDesktop;

    let best = null;
    let bestCount = Infinity;

    for (let d of desktops) {
        if (!d) continue;
        if (d === current) continue;

        const count = countWindowsOnDesktop(d);

        if (count >= MAX_WINDOWS) continue;

        if (count < bestCount) {
            best = d;
            bestCount = count;
        }
    }

    return best;
}

function getBestDesktop() {

    const desktops = workspace.desktops || [];
    const current = workspace.currentDesktop;

    let best = null;
    let bestCount = Infinity;

    for (let d of desktops) {
        if (!d) continue;

        if (d === current) continue;

        const count = countWindowsOnDesktop(d);

        if (count >= MAX_WINDOWS) continue;

        if (count < bestCount) {
            best = d;
            bestCount = count;
        }
    }

    return best;
}


function cleanupEmptyDesktops() {
    if (_cleanupDesktopsLock) return;
    _cleanupDesktopsLock = true;

    try {
        const desktops = workspace.desktops || [];
        if (desktops.length <= 1) return;

        const current = workspace.currentDesktop;

        for (let d of desktops) {
            if (!d) continue;

            const id = getDesktopIdSafe(d);

            if (!managedDesktops.has(id)) continue;

            if (d === current) continue;

            const count = countWindowsOnDesktop(d);

            if (count === 0) {

                if (DEBUG) print("Removing empty desktop:", id);

                workspace.removeDesktop(d);
                managedDesktops.delete(id);
            }
        }
    } finally {
        _cleanupDesktopsLock = false;
    }
}

function moveWindowToOverflow(win, options) {
    const mode = Number(OVERFLOW_BEHAVIOR);
    if (!win || win.deleted) return;
    const source = (options && options.source) ? options.source : "relayout";
    const preserveWorkspace = !!(options && options.preserveWorkspace);
    const silentOverflow = !!(options && options.silent);
    const deferRelayout = !!(options && options.deferRelayout);

    function showOverflowOSD(type, desktop) {
        if (silentOverflow) return;
        let msg = `Workspace full (${MAX_WINDOWS})`;

        let idx = null;
        try {
            const list = workspace.desktops || [];
            const i = list.indexOf(desktop);
            if (i !== -1) idx = i + 1;
        } catch (e) {}

        const suffix = idx ? ` (#${idx})` : "";

        if (type === "float") {
            msg += "\n→ Floating window";
        } else if (type === "other") {
            msg += `\n→ Sent to another workspace${suffix}`;
        } else if (type === "forward") {
            msg += `\n→ Sent to next workspace${suffix}`;
        } else if (type === "empty") {
            msg += `\n→ Sent to empty workspace${suffix}`;
        } else if (type === "new") {
            msg += `\n→ New workspace created${suffix}`;
        } else if (type === "minimize") {
            msg += "\n→ Minimized window";
        } else {
            msg += `\n→ Reassigned${suffix}`;
        }

        showOSDSafe(msg, "dialog-warning");
    }

    // ───── MODE 0 ─────
    if (mode === 0) {
        getFloatingSet().add(win);
        autoFloating.add(win);

        showOverflowOSD("float");
        return;
    }

    function removeFromLayout(w) {
        let order = getLastTiledOrder();
        const idx = order.indexOf(w);
        if (idx !== -1) {
            order.splice(idx, 1);
            setLastTiledOrder(order);
        }
    }

    function getDesktops() {
        return workspace.desktops || [];
    }

    function getDesktopIndex(d) {
        return getDesktops().indexOf(d);
    }

    // 🔥 forward-only least busy
    function getSafeDesktopForward() {
        const desktops = getDesktops();
        const current = workspace.currentDesktop;
        const currentIdx = getDesktopIndex(current);

        let best = null;
        let bestCount = Infinity;

        for (let i = currentIdx + 1; i < desktops.length; i++) {
            const d = desktops[i];
            if (!d) continue;

            const count = countWindowsOnDesktop(d);
            if (count >= MAX_WINDOWS) continue;

            if (count < bestCount) {
                best = d;
                bestCount = count;
            }
        }

        return best;
    }

    function findEmptyDesktop() {
        const desktops = getDesktops();

        for (let d of desktops) {
            if (!d) continue;
            if (countWindowsOnDesktop(d) === 0) return d;
        }

        return null;
    }

    function moveAndFocus(w, desktop, osdType) {
        removeFromLayout(w);

        getFloatingSet().delete(w);
        autoFloating.delete(w);

        w.desktops = [desktop];

        if (!preserveWorkspace) {
            workspace.currentDesktop = desktop;
            workspace.activeWindow = w;
            workspace.raiseWindow(w);
        }

        showOverflowOSD(osdType, desktop);

        if (!deferRelayout) {
            let t = new QTimer();
            t.interval = 100;

            t.timeout.connect(() => {
                t.stop();
                _visibleCache = null;
                clearLayoutModel();
                scheduleRelayout(0);
            });

            t.start();
        }
    }

    function minimizeOverflow(w) {
        removeFromLayout(w);
        getFloatingSet().delete(w);
        autoFloating.delete(w);

        if (w.minimizable) {
            w.minimized = true;
            pushToMinimizedStack(w);
            showOverflowOSD("minimize");
        } else {
            getFloatingSet().add(w);
            autoFloating.add(w);
            showOverflowOSD("float");
        }

        if (!deferRelayout) {
            _visibleCache = null;
            clearLayoutModel();
            scheduleRelayout(0);
        }
    }

    // // =========================================================
    // // MODE 4 — minimize
    // // =========================================================
    // if (mode === 4) {
    //     if (source === "new_window") {
    //         getFloatingSet().add(win);
    //         autoFloating.add(win);
    //         showOverflowOSD("float");
    //         return;
    //     }

    //     if (DEBUG) print("MODE4 → MINIMIZE");
    //     minimizeOverflow(win);
    //     return;
    // }

    // =========================================================
    // MODE 1 — least busy (global)
    // =========================================================
    if (mode === 1) {
        const target = getSafeDesktopForOverflow();

        if (target) {
            if (DEBUG) print("MODE1 → SAFE:", getDesktopIdSafe(target));
            moveAndFocus(win, target, "other");
            return;
        }

        if (DEBUG) print("MODE1 → fallback");
    }

    // =========================================================
    // MODE 2 — least busy FORWARD ONLY
    // =========================================================
    if (mode === 2) {
        const target = getSafeDesktopForward();

        if (target) {
            if (DEBUG) print("MODE2 → FORWARD:", getDesktopIdSafe(target));
            moveAndFocus(win, target, "forward");
            return;
        }

        if (DEBUG) print("MODE2 → no forward → create/use shared new desktop");

        if (_forwardOverflowCreateBatch) {
            _forwardOverflowCreateBatch.windows.push(win);
            return;
        }

        _forwardOverflowCreateBatch = {
            windows: [win],
            preserveWorkspace: preserveWorkspace,
            silentOverflow: silentOverflow,
            deferRelayout: deferRelayout
        };

        createNewDesktop((_) => {
            const batch = _forwardOverflowCreateBatch;
            _forwardOverflowCreateBatch = null;
            if (!batch) return;

            const list = workspace.desktops || [];
            const createdTarget = list[list.length - 1];
            if (!createdTarget) return;

            for (let w of batch.windows) {
                if (!w || w.deleted) continue;

                removeFromLayout(w);
                getFloatingSet().delete(w);
                autoFloating.delete(w);
                w.desktops = [createdTarget];

                if (!batch.preserveWorkspace) {
                    workspace.currentDesktop = createdTarget;
                    workspace.activeWindow = w;
                    workspace.raiseWindow(w);
                }

                if (!batch.silentOverflow) {
                    showOverflowOSD("new", createdTarget);
                }
            }

            if (!batch.deferRelayout) {
                let t = new QTimer();
                t.interval = 100;
                t.timeout.connect(() => {
                    t.stop();
                    _visibleCache = null;
                    clearLayoutModel();
                    scheduleRelayout(0);
                });
                t.start();
            }
        });

        return;
    }

    // =========================================================
    // MODE 3 — empty / create
    // =========================================================
    if (mode === 3) {
        const empty = findEmptyDesktop();

        if (empty) {
            if (DEBUG) print("MODE3 → EMPTY:", getDesktopIdSafe(empty));
            moveAndFocus(win, empty, "empty");
            return;
        }

        if (DEBUG) print("MODE3 → create new");

        createNewDesktop((_) => {
            if (!win || win.deleted) return;

            const list = getDesktops();
            const target = list[list.length - 1];
            if (!target) return;

            moveAndFocus(win, target, "new");
        });

        return;
    }

    // =========================================================
    // 🔥 FINAL FALLBACK
    // =========================================================

    const best = getBestDesktop();
    if (best) {
        if (DEBUG) print("FALLBACK → BEST:", getDesktopIdSafe(best));
        moveAndFocus(win, best, "other");
        return;
    }

    const empty = findEmptyDesktop();
    if (empty) {
        if (DEBUG) print("FALLBACK → EMPTY:", getDesktopIdSafe(empty));
        moveAndFocus(win, empty, "empty");
        return;
    }

    if (DEBUG) print("FALLBACK → CREATE NEW");

    createNewDesktop((_) => {
        if (!win || win.deleted) return;

        const list = getDesktops();
        const target = list[list.length - 1];
        if (!target) return;

        moveAndFocus(win, target, "new");
    });
}

let _rebalanceLock = false;

function rebalanceOverflow() {
    if (_rebalanceLock) return;
    _rebalanceLock = true;

    try {
        if (!canAutoRetile()) return;

        const { ordered, visible } = getTiledOrder();
        if (!ordered || visible.length <= MAX_WINDOWS) return;

        const tooMany = ordered.slice(MAX_WINDOWS);
        const newOrder = ordered.slice(0, MAX_WINDOWS);

        for (let w of tooMany) {
            if (!w || w.deleted) continue;
            getFloatingSet().add(w);
            autoFloating.add(w);
            moveWindowToOverflow(w);
        }

        setLastTiledOrder(newOrder);
        _visibleCache = null;
        clearLayoutModel();
        getCurrentState()._layoutDirty = true;

        if (DEBUG) print(`Rebalanced overflow: ${tooMany.length} windows moved`);
    } finally {
        _rebalanceLock = false;
    }
}


function sanitizeFloatingBeforeTiling() {
    if (!canAutoRetile()) return;

    const currentDeskId = getCurrentDesktopIdentifier();
    const floating = Array.from(getFloatingSet())
        .filter(w =>
            w &&
            !w.deleted &&
            w.desktops &&
            w.desktops.some(d => getDesktopIdSafe(d) === currentDeskId)
        );

    if (floating.length <= MAX_WINDOWS) return;

    if (DEBUG) print("SANITIZE: too many floating windows:", floating.length);

    const overflow = floating.slice(MAX_WINDOWS);
    for (let w of overflow) {
        if (!w || w.deleted) continue;
        if (DEBUG) print("SANITIZE → moving to overflow:", w.caption || w.resourceClass);
        autoFloating.add(w);
        moveWindowToOverflow(w);
    }
}

//-----------------------snapshots-----------------------------
function getWindowSnapshotId(w) {
    if (!w) return null;
    const cls = (w.resourceClass || "").toLowerCase();
    const name = (w.resourceName || "").toLowerCase();
    const cap = (w.caption || "").toLowerCase();
    return `${cls}|${name}|${cap}`;
}

function cycleFloatingLayouts() {
    const available = floatingLayouts
    .map((l, i) => l ? i : null)
    .filter(i => i !== null);
    if (available.length === 0) {
        showOSDSafe("No saved layouts", "dialog-warning");
        return;
    }
    let idx = available.indexOf(currentLayoutIndex);
    idx = (idx + 1) % available.length;
    const nextSlot = available[idx];
    currentLayoutIndex = nextSlot;
    restoreFloatingLayoutFromSlot(nextSlot);
}

function clearFloatingLayout(slot) {
    floatingLayouts[slot] = null;
    if (currentLayoutIndex === slot) currentLayoutIndex = -1;
    print("SLOT_" + (slot + 1) + "={}");
    showOSDSafe(`Cleared slot ${slot + 1}`, "edit-clear");
}

// ==================== SAVE ====================

function saveFloatingLayoutToSlot(slot) {
    const visible = getVisibleWindows();
    const state = getCurrentState();
    const isKWin = !!(state && state.kwinTilingActive);
    const isTiling = state && !state.allFloating && !state.kwinTilingActive && getLayoutModel();

    if (!isKWin && (!visible || visible.length === 0)) {
        showOSDSafe("No windows to save", "dialog-warning");
        return;
    }

    let snapshot;
    if (isKWin) {
        snapshot = { type: "kwin", mode: "kwin" };
        showOSDSafe(`Layout saved (KWin tiling) → slot ${slot + 1}`, "document-save");
    } else if (isTiling) {
        const model = getLayoutModel();
        const savedModel = {
            leftMain: model.leftMain ? {
                class: model.leftMain.win.resourceClass || "",
                name: model.leftMain.win.resourceName || "",
                caption: model.leftMain.win.caption || "",
                widthRatio: model.leftMain.widthRatio || 0.6
            } : null,
            rows: []
        };

        for (let row of model.rows || []) {
            const newRow = [];
            for (let item of row.windows || []) {
                newRow.push({
                    class: item.win.resourceClass || "",
                    name: item.win.resourceName || "",
                    caption: item.win.caption || "",
                    widthRatio: item.widthRatio || 1
                });
            }
            savedModel.rows.push({
                heightRatio: row.heightRatio || 1,
                windows: newRow
            });
        }
        snapshot = { type: "tiling", mode: "tiling", model: savedModel };
        showOSDSafe(`Layout saved (tiling) → slot ${slot + 1}`, "document-save");
    } else {
        const data = [];
        for (let w of visible) {
            if (!w || w.deleted) continue;
            const g = w.frameGeometry;
            data.push({ x: g.x, y: g.y, width: g.width, height: g.height });
        }
        snapshot = { type: "floating", mode: "floating", data: data };
        showOSDSafe(`Layout saved (floating) → slot ${slot + 1}`, "document-save");
    }

    floatingLayouts[slot] = snapshot;
    currentLayoutIndex = slot;

    try {
        const snapshotText = JSON.stringify({
            slot: slot,
            slotHuman: slot + 1,
            snapshot: snapshot
        });
        print("SLOT_" + (slot + 1) + "=" + snapshotText);
    } catch (e) {
        print("SLOT_" + (slot + 1) + " serialize failed:", e);
    }
}

// ==================== RESTORE ================================================================================
function extractOrderFromModel(model) {
    const order = [];

    if (model.leftMain && model.leftMain.win) {
        order.push(model.leftMain.win);
    }

    for (let row of model.rows || []) {
        for (let item of row.windows || []) {
            if (item.win) {
                order.push(item.win);
            }
        }
    }

    return order;
}

function minimizeOverflowOutsideSnapshot(order) {
    if (!MINIMIZE_SNAPSHOT_OVERFLOW) return;

    const visible = getVisibleWindows() || [];
    const tiledSet = new Set(order);

    for (let w of visible) {
        if (!w || w.deleted) continue;

        // 🔥 windows NOT belonging to the snapshot
        if (!tiledSet.has(w)) {
            try {
                if (w.minimizable && !w.minimized) {
                    w.minimized = true;

                    if (DEBUG) {
                        print("Snapshot overflow → minimized:", w.caption || w.resourceClass);
                    }
                }
            } catch (e) {
                if (DEBUG) print("Snapshot minimize failed:", e);
            }
        }
    }
}

function restoreFloatingLayoutFromSlot(slot) {
    print("==== RESTORE START slot", slot, "====");

    const snapshot = floatingLayouts[slot];
    if (!snapshot) {
        showOSDSafe(`Slot ${slot + 1} empty`, "dialog-warning");
        return;
    }

    const snapshotMode = snapshot.mode || snapshot.type;

    if (snapshotMode === "kwin" || snapshot.type === "kwin") {
        const state = getCurrentState();
        state.maximizedAll = false;
        state.allFloating = false;
        state.kwinTilingActive = false;
        applyKWinTiling({ source: "snapshotRestore" });
        showOSDSafe(`KWin tiling restored → slot ${slot + 1}`, "view-grid");
        print("✅ KWIN RESTORE COMPLETED");
        return;
    }

    let windows = getVisibleWindows().filter(w => !w.deleted);
    if (windows.length === 0) {
        showOSDSafe("Brak okien do przywrócenia", "dialog-warning");
        return;
    }

    const usable = getUsableArea();

    // =========================================================
    // 🔥 FLOATING RESTORE
    // =========================================================
    if (snapshot.type === "floating") {
        const data = snapshot.data || [];

        const state = getCurrentState();
        state.allFloating = true;
        state._layoutDirty = false;

        for (let w of windows) {
            getFloatingSet().add(w);
        }

        for (let i = 0; i < Math.min(windows.length, data.length); i++) {
            const w = windows[i];
            const g = data[i];

            if (!w || w.deleted) continue;

            scriptGeometryChange = true;
            w.frameGeometry = {
                x: g.x,
                y: g.y,
                width: g.width,
                height: g.height
            };
            scriptGeometryChange = false;
        }

        applyBorderMode();

        _visibleCache = null;
        _geoCache.clear();

        showOSDSafe(`Floating restored → slot ${slot + 1}`, "view-restore");
        print("✅ FLOATING RESTORE COMPLETED");
        disableKWinTiling();
        return;
    }

    // =========================================================
    // 🔥 TILING RESTORE
    // =========================================================
    if (snapshot.type !== "tiling" || !snapshot.model) {
        print("❌ Not a valid snapshot");
        showOSDSafe(`Slot ${slot + 1} nieprawidłowy`, "dialog-warning");
        return;
    }

    let model = assignWindowsToModelBySnapshot(snapshot.model, windows);
    if (!model) {
        print("❌ assignWindowsToModelBySnapshot failed");
        return;
    }

    normalizeModelWithConstraints(model, usable);
    model = normalizeModelStructure(model);

    if (!canApplyLayoutModel(model, usable) || !validateLayoutBySimulation(model, usable)) {
        print("⚠️ Model invalid → fallback to auto grid");
        const orderFallback = windows.slice();
        model = buildAndValidateModel(orderFallback, usable);
        disableKWinTiling();
        if (!model) {
            showOSDSafe("Nie udało się odtworzyć układu", "dialog-error");
            return;
        }
    }

    // =========================================================
    // 🔥 ORDER FROM MODEL (NEW, CORRECT VERSION)
    // =========================================================
    const order = extractOrderFromModel(model);

    // =========================================================
    // 🔥 RESET OLD MODEL
    // =========================================================
    clearLayoutModel();
    forceRebuildModel();

    // =========================================================
    // 🔥 APPLY NEW MODEL
    // =========================================================
    setLayoutModel(model);
    setLastTiledOrder(order);
    minimizeOverflowOutsideSnapshot(order);

    const state = getCurrentState();
    state.allFloating = false;

    scriptGeometryChange = true;
    applyLayoutModel(model, usable);
    scriptGeometryChange = false;

    applyBorderMode();

    // =========================================================
    // 🔥 SYNC (persist)
    // =========================================================
    syncStateWithModel();

    // =========================================================
    // 🔥 RESET REBUILD FLAG (CRITICAL)
    // =========================================================
    state._layoutDirty = false;

    if (typeof state._forceRebuild !== "undefined") {
        state._forceRebuild = false;
    }

    if (typeof consumeForceRebuild === "function") {
        consumeForceRebuild();
    }

    _visibleCache = null;
    _geoCache.clear();

    showOSDSafe(`Tiling restored → slot ${slot + 1}`, "view-restore");
    print("✅ TILING RESTORE COMPLETED");
}

function assignWindowsToModelBySnapshot(snapshotModel, windows) {
    if (!snapshotModel) return null;

    const used = new Set();

    const model = {
        leftMain: null,
        rows: []
    };

    if (snapshotModel.leftMain) {
        model.leftMain = {
            win: null,
            widthRatio: snapshotModel.leftMain.widthRatio || 0.6,
            _snap: snapshotModel.leftMain
        };
    }

    for (let snapRow of snapshotModel.rows || []) {
        const newRow = {
            heightRatio: snapRow.heightRatio || 1,
            windows: []
        };

        for (let snapItem of (snapRow.windows || snapRow)) {
            newRow.windows.push({
                win: null,
                widthRatio: snapItem.widthRatio || 1,
                _snap: snapItem
            });
        }

        model.rows.push(newRow);
    }

    function assignSlot(slot) {
        const match = matchWindowToSnapshot(slot._snap, windows);
        if (match && !used.has(match)) {
            slot.win = match;
            used.add(match);
            return true;
        }
        return false;
    }

    if (model.leftMain) assignSlot(model.leftMain);

    for (let row of model.rows) {
        for (let slot of row.windows) {
            assignSlot(slot);
        }
    }

    // 🔥 3. FALLBACK
    const remaining = windows
    .filter(w => w && !w.deleted && !used.has(w))
    .sort((a, b) => (a.stackingOrder || 0) - (b.stackingOrder || 0));

    let idx = 0;

    function fillSlot(slot) {
        if (!slot.win && idx < remaining.length) {
            slot.win = remaining[idx++];
        }
    }

    if (model.leftMain) fillSlot(model.leftMain);

    for (let row of model.rows) {
        for (let slot of row.windows) {
            fillSlot(slot);
        }
    }

    // 🔥 4. CLEAN SNAP META
    if (model.leftMain) delete model.leftMain._snap;

    for (let row of model.rows) {
        for (let slot of row.windows) {
            delete slot._snap;
        }
    }

    return model;
}

function matchWindowToSnapshot(snap, windows) {
    if (!snap) return null;
    let best = null;
    let bestScore = -1;

    for (let w of windows) {
        if (!w || w.deleted) continue;
        let score = 0;
        const cls = (w.resourceClass || "").toLowerCase();
        const name = (w.resourceName || "").toLowerCase();
        const cap = (w.caption || "").toLowerCase();

        if (cls === (snap.class || "").toLowerCase()) score += 4;
        if (name === (snap.name || "").toLowerCase()) score += 3;
        if (cap && snap.caption && cap.includes((snap.caption || "").toLowerCase())) score += 2;

        if (score > bestScore) {
            bestScore = score;
            best = w;
        }
    }
    return bestScore > 1 ? best : null;   // raised threshold
}

// ──────────────────────────────────────────────────────────────
// AUTO-RETILE LOGIC
// ──────────────────────────────────────────────────────────────


function canAutoRetile() {

    const state = getCurrentState();

    if (state.allFloating && !state.kwinTilingActive) return false;

    const mode = state.autoRetileMode ?? AUTO_RETILE_MODE;

    if (mode === 0) return false;

    const visible = getVisibleWindows();
    if (!visible || visible.length === 0) return false;

    const NOW = Date.now();

    let anyMaximized;

    if (TILE_EVEN_IF_NEW_MAXIMIZED) {

        anyMaximized = visible.some(w =>
        w.maximizeMode !== 0 &&
        !(w._kwinAddedAt && (NOW - w._kwinAddedAt < 400))
        );

    } else {

        anyMaximized = visible.some(w => w.maximizeMode !== 0);
    }

    // 🔥 KWin -> treat as mode 2 (always)
//    if (state.kwinTilingActive) return true;

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

function windowOnDesktop(win, targetDesktopRef) {
    if (!win) return false;

    if (win.onAllDesktops) return true;

    const desktops = getWindowDesktopRefs(win);
    const targetAliases = getDesktopAliases(targetDesktopRef);
    const targetDesktopObj = (targetDesktopRef && typeof targetDesktopRef === "object")
        ? targetDesktopRef
        : null;

    if (desktops.length > 0) {
        return desktops.some(d => {
            if (!d) return false;
            if (targetDesktopObj && d === targetDesktopObj) return true;
            const aliases = getDesktopAliases(d);
            for (let id of aliases) {
                if (targetAliases.has(id)) return true;
            }
            return false;
        });
    }

    if (win.desktop) {
        if (targetDesktopObj && win.desktop === targetDesktopObj) return true;
        const aliases = getDesktopAliases(win.desktop);
        for (let id of aliases) {
            if (targetAliases.has(id)) return true;
        }
        return false;
    }

    return false;
}

function windowOnCurrentDesktop(win, currentDeskId) {
    const currentDesktopObj = workspace.currentDesktop;
    const targetRef = currentDesktopObj || currentDeskId;

    if (windowOnDesktop(win, targetRef)) return true;

    const desktopRefs = getWindowDesktopRefs(win);
    const hasUsableRefAlias = desktopRefs.some(d => getDesktopAliases(d).size > 0);
    const desktopAliasCount = win.desktop ? getDesktopAliases(win.desktop).size : 0;
    // Wayland/KWin can expose windows without explicit desktop assignment.
    // Treat missing or non-resolvable assignment as visible in current desktop context.
    if (!win.onAllDesktops && ((!win.desktop && desktopRefs.length === 0) || (!hasUsableRefAlias && desktopAliasCount === 0))) {
        if (DEBUG) {
            const label = win.caption || win.resourceClass || win.resourceName || "?";
            print(`[desktop-fallback] allowing "${label}" (desktop assignment not resolvable)`);
        }
        return true;
    }

    // Conservative fallback: allow only the active window (newly opened/transient cases).
    // Broad fallback caused cross-desktop pollution and layout desync loops.
    if (workspace.activeWindow && win === workspace.activeWindow) {
        return true;
    }

    if (DEBUG) {
        const label = win.caption || win.resourceClass || win.resourceName || "?";
        print(`[desktop-fallback] rejecting "${label}" (no desktop assignment exposed)`);
    }
    return false;
}

function windowOnCurrentActivity(win, currentActivity) {
    if (!win) return false;
    if (!currentActivity) return true;
    if (win.onAllActivities) return true;

    const activityRefs = getWindowActivityRefs(win);

    // In KWin, empty activity assignment can mean "all activities".
    if (activityRefs.length === 0) return true;

    for (let ref of activityRefs) {
        if (!ref) continue;
        const id = String(ref).toLowerCase();
        if (id === String(currentActivity).toLowerCase()) return true;
        if (id === "00000000-0000-0000-0000-000000000000") return true;
    }

    return false;
}

function isStickyWindow(win) {
    if (!win) return false;
    if (win.onAllDesktops || win.onAllActivities) return true;
    const activityRefs = getWindowActivityRefs(win);
    return activityRefs.some(ref => String(ref).toLowerCase() === "00000000-0000-0000-0000-000000000000");
}

function getWindowDesktopRefs(win) {
    if (!win || !win.desktops) return [];

    const d = win.desktops;

    if (Array.isArray(d)) return d.filter(x => x);

    if (typeof d.length === "number") {
        const out = [];
        for (let i = 0; i < d.length; i++) {
            if (d[i]) out.push(d[i]);
        }
        if (out.length > 0) return out;
    }

    if (typeof d[Symbol.iterator] === "function") {
        const out = [];
        for (let item of d) {
            if (item) out.push(item);
        }
        return out;
    }

    return [];
}

function getWindowActivityRefs(win) {
    if (!win || !win.activities) return [];

    const a = win.activities;

    if (Array.isArray(a)) return a.filter(x => x);

    if (typeof a.length === "number") {
        const out = [];
        for (let i = 0; i < a.length; i++) {
            if (a[i]) out.push(a[i]);
        }
        if (out.length > 0) return out;
    }

    if (typeof a[Symbol.iterator] === "function") {
        const out = [];
        for (let item of a) {
            if (item) out.push(item);
        }
        return out;
    }

    return [];
}

function getDesktopAliases(desktopRef) {
    const out = new Set();

    if (desktopRef === null || desktopRef === undefined) return out;

    if (typeof desktopRef === "string") {
        if (desktopRef.length > 0) out.add(desktopRef);
        return out;
    }

    if (typeof desktopRef === "number" && isFinite(desktopRef)) {
        out.add(Math.trunc(desktopRef).toString());
        return out;
    }

    const idSafe = getDesktopIdSafe(desktopRef);
    if (idSafe) out.add(idSafe);

    if (desktopRef && typeof desktopRef === "object") {
        if (typeof desktopRef.id === "string" && desktopRef.id.length > 0) {
            out.add(desktopRef.id);
        }
        if (typeof desktopRef.x11DesktopNumber === "number" && desktopRef.x11DesktopNumber > 0) {
            out.add(desktopRef.x11DesktopNumber.toString());
        }
    }

    return out;
}

function debugWindowVisibility(win, tag = "visible-debug") {
    if (!DEBUG || !win) return;

    const currentDeskId = getCurrentDesktopIdentifier();
    const currentActivity = workspace.currentActivity;
    const screenGeo = getFullArea();
    const geo = win.frameGeometry || { x: 0, y: 0, width: 0, height: 0 };
    const centerX = geo.x + geo.width / 2;
    const centerY = geo.y + geo.height / 2;

    const checks = {
        normalWindow: !!win.normalWindow,
        managed: !!win.managed,
        minimized: !!win.minimized,
        specialWindow: !!win.specialWindow,
        dock: !!win.dock,
        desktopWindow: !!win.desktopWindow,
        skipTaskbar: !!win.skipTaskbar,
        popup: !!win.popup,
        dialog: !!win.dialog,
        utilityWindow: !!win.utilityWindow,
        deleted: !!win.deleted,
        ignoreMatch: matchesIgnoreList(win, IGNORE_TILING),
        activityOk: windowOnCurrentActivity(win, currentActivity),
        desktopOk: windowOnCurrentDesktop(win, currentDeskId),
        screenOk:
            centerX >= screenGeo.x &&
            centerX < screenGeo.x + screenGeo.width &&
            centerY >= screenGeo.y &&
            centerY < screenGeo.y + screenGeo.height
    };

    const rejectedBy = [];
    if (!checks.normalWindow) rejectedBy.push("normalWindow=false");
    if (!checks.managed) rejectedBy.push("managed=false");
    if (checks.minimized) rejectedBy.push("minimized");
    if (checks.specialWindow) rejectedBy.push("specialWindow");
    if (checks.dock) rejectedBy.push("dock");
    if (checks.desktopWindow) rejectedBy.push("desktopWindow");
    if (checks.skipTaskbar) rejectedBy.push("skipTaskbar");
    if (checks.popup) rejectedBy.push("popup");
    if (checks.dialog) rejectedBy.push("dialog");
    if (checks.utilityWindow) rejectedBy.push("utilityWindow");
    if (checks.deleted) rejectedBy.push("deleted");
    if (checks.ignoreMatch) rejectedBy.push("ignoreList");
    if (!checks.activityOk) rejectedBy.push("activity");
    if (!checks.desktopOk) rejectedBy.push("desktop");
    if (!checks.screenOk) rejectedBy.push("screen");

    const label = win.caption || win.resourceClass || win.resourceName || "?";
    const screenId = getEffectiveScreenId();
    print(`[${tag}] "${label}" screen=${screenId} desk=${currentDeskId} rejectedBy=${rejectedBy.join(",") || "none"}`);
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

    const cacheKey =
    getCurrentActivityId() + ":" +
    getCurrentDesktopIdentifier() + ":" +
    getEffectiveScreenId();

    // 🔥 cache valid (short TTL + same context)
    if (
        _visibleCache &&
        cacheKey === _visibleCacheKey &&
        (now - _visibleCacheTime < 50)
    ) {
        return _visibleCache;
    }

    const currentDeskId = getCurrentDesktopIdentifier();
    const currentActivity = workspace.currentActivity;
    const activeScreen = getEffectiveScreenId();


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
            isIgnoredSpecialWindow(w) ||
            w.deleted ||
            matchesIgnoreList(w, IGNORE_TILING)
        ) {
            return false;
        }

        // ACTIVITY
        if (!windowOnCurrentActivity(w, currentActivity)) {
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

    _visibleCache = result;
    _visibleCacheTime = now;
    _visibleCacheKey = cacheKey;

    return result;
}

function getCyclingWindows() {
    const currentDeskId = getCurrentDesktopIdentifier();
    const currentActivity = workspace.currentActivity;
    const activeScreen = getEffectiveScreenId();

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
            isIgnoredSpecialWindow(w) ||
            w.deleted ||
            matchesIgnoreList(w, IGNORE_CYCLING)
        ) {
            return false;
        }

        if (!windowOnCurrentActivity(w, currentActivity)) {
            return false;
        }

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
    if (!MINIMIZE_IGNORED_WINDOWS) return;
    const currentDeskId = getCurrentDesktopIdentifier();
    const allWindows = workspace.windowList();

    let hasTiledCandidate = false;

    for (let w of allWindows) {
        if (!w) continue;

        if (
            windowOnCurrentDesktop(w, currentDeskId) &&
            !w.minimized &&
            !isIgnoredSpecialWindow(w) &&
            !(IGNORE_TILING.some(word => (w.caption || "").toLowerCase().includes(word)))
        ) {
            hasTiledCandidate = true;
            break;
        }
    }

    if (!hasTiledCandidate) {
        if (DEBUG) print("minimizeIgnoredWindows: skip (only ignored windows)");
        return;
    }

    // ─────────────────────────────────────────────
    // ORIGINAL LOGIC (unchanged)
    // ─────────────────────────────────────────────
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

    // ───── 2 WINDOWS ─────
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

    // ───── LEFT MAIN ───── 
    if (getFirstRowWindowsMode() === -1 && count > 1) {
        const main = ordered[0];
        const rest = ordered.slice(1);
        const usableWidth = area.width;
        const total = getLeftRatio() + 1;
        let leftW = (getLeftRatio() / total) * usableWidth;
        const minLeft = getMinWidth(main);
        const maxRightWidth = usableWidth - minLeft - GAP;

        let rightCols;

        // 🔥 SPECIAL CASE: 2 windows in grid -> vertical (1 column)
        // prevents 3 windows in one row
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

    // ───── GRID MODE - improved first-row logic (auto + fixed) ─────
    let firstRowCount;

    if (getFirstRowWindowsMode() > 0) {
        // Manual mode (e.g. 3 windows on top)
        firstRowCount = Math.min(getFirstRowWindowsMode(), count);
    } else {
        // AUTO - safe version
        firstRowCount = Math.ceil(Math.sqrt(count));   // start from the classic value

        // Decrease the number of windows in the first row until it fits
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
        // 🔥 dynamic adjustment of how many windows can actually fit
        let maxFit = 0;
        let runningSum = 0;

        for (let i = 0; i < firstRowCount; i++) {
            const m = getMinWidth(ordered[idx + i]);
            const gaps = GAP * Math.max(0, maxFit);
            if (runningSum + m + gaps > area.width) break;

            runningSum += m;
            maxFit++;
        }

        // 🔥 fallback - always at least 1
        firstRowCount = Math.max(1, maxFit);

        const usableW = area.width - GAP * Math.max(0, firstRowCount - 1);

        let minSum = 0;
        const mins = [];

        for (let i = 0; i < firstRowCount; i++) {
            const m = getMinWidth(ordered[idx + i]);
            mins.push(m);
            minSum += m;
        }

        // 🔥 safety (should not happen after the checks above, but we keep it)
        if (minSum > usableW) {
            if (DEBUG) print(`FIRST ROW IMPOSSIBLE – minSum=${minSum} > usableW=${usableW} (firstRowCount=${firstRowCount})`);
            return null;
        }

        const extra = usableW - minSum;
        const windows = [];

        if (firstRowCount > 1) {

            const normalCount = firstRowCount - 1;
            const totalW = getLeftRatio() + normalCount;

            // 🔥 first window (main/left)
            windows.push({
                win: ordered[idx++],
                widthRatio: (mins[0] + extra * (getLeftRatio() / totalW)) / usableW
            });

            // 🔥 remaining windows
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

    // ───── DYNAMIC GRID – remaining windows ─────
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

    // ─────────────────────────────
    // RATIOS
    // ─────────────────────────────
    let ratios = [];
    let ratioSum = 0;

    for (let i = 0; i < n; i++) {
        let r = safeNumber(getRatio(items[i]), 0);

        // 🔥 clamp ratio (important!)
        if (r <= 0) r = 0.01;

        ratios.push(r);
        ratioSum += r;
    }

    if (ratioSum <= 0) {
        ratioSum = n;
        ratios = new Array(n).fill(1);
    }

    // ─────────────────────────────
    // MIN SIZES
    // ─────────────────────────────
    const mins = [];
    let sumMin = 0;

    for (let i = 0; i < n; i++) {
        let m = safeNumber(getMin(items[i]), 0);
        m = Math.max(0, Math.min(m, usable));
        mins.push(m);
        sumMin += m;
    }

    // ─────────────────────────────
    // 🔥 FIX: fallback preserving proportions
    // ─────────────────────────────
    if (sumMin > usable) {

        let sizes = [];

        for (let i = 0; i < n; i++) {
            sizes[i] = usable * (ratios[i] / ratioSum);
        }

        // normalization
        sizes = sizes.map(s => safeSize(s, 1));

        let sum = sizes.reduce((a, b) => a + b, 0);
        let diff = usable - sum;

        let i = 0;
        while (diff !== 0 && i < n * 20) {
            const idx = i % n;

            if (diff > 0) {
                sizes[idx]++;
                diff--;
            } else {
                if (sizes[idx] > 1) {
                    sizes[idx]--;
                    diff++;
                }
            }
            i++;
        }

        return sizes;
    }

    // ─────────────────────────────
    // NORMAL CASE
    // ─────────────────────────────
    let sizes = [];

    for (let i = 0; i < n; i++) {
        sizes[i] = usable * (ratios[i] / ratioSum);
    }

    // enforce min
    for (let i = 0; i < n; i++) {
        if (sizes[i] < mins[i]) sizes[i] = mins[i];
    }

    let sum = sizes.reduce((a, b) => a + b, 0);

    // ─────────────────────────────
    // OVERFLOW REDUCTION
    // ─────────────────────────────
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

    // ─────────────────────────────
    // FINAL NORMALIZATION
    // ─────────────────────────────
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

    // base normalization
    for (let row of model.rows) {
        row.heightRatio /= sumRatios;
    }

    // clamp to minimum
    for (let i = 0; i < model.rows.length; i++) {

        const minRatio = minHeights[i] / totalH;

        if (model.rows[i].heightRatio < minRatio) {
            model.rows[i].heightRatio = minRatio;
        }
    }

    // scale if overflow
    let sumAfterClamp = model.rows.reduce((a, r) => a + r.heightRatio, 0);

    if (sumAfterClamp > 1) {
        const scale = 1 / sumAfterClamp;
        for (let row of model.rows) {
            row.heightRatio *= scale;
        }

        // 🔥 KEY: re-clamp (DO NOT REMOVE!)
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

        // 🔥 remove empty rows
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

    // 🔥 NEW HARD CHECK (KEY)
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
    let slotsLeft = MAX_WINDOWS - ordered.length;
    if (slotsLeft <= 0) return false;

    const usable = getUsableArea();
    let changed = false;

    // Try inserting starting from the oldest auto-floating windows
    for (let w of floating) {
        if (!w || w.deleted || !autoFloating.has(w)) continue;

        let inserted = false;

        const model = getLayoutModel();
        const startIndex = (model?.leftMain) ? 1 : 0;

        // 🔥 build trial order
        let indices = [];

        // 1. first the slot after the removed window
        if (lastFreedSlot !== null && lastFreedSlot >= startIndex) {
            indices.push(lastFreedSlot);
            if (DEBUG) print("TRY SLOT:", lastFreedSlot);
        }

        // 2. fallback - from the end (to fill the grid)
        for (let i = ordered.length; i >= startIndex; i--) {
            if (i !== lastFreedSlot) indices.push(i);
        }

        // 🔁 try these positions
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

            lastFreedSlot = null;   // 🔥 slot consumed
            changed = true;
            inserted = true;
            slotsLeft--;

            break;
        }

        if (!inserted && DEBUG) {
            print("Could not reclaim:", w.caption || w.resourceClass);
        }

        if (slotsLeft <= 0) break;
    }

    if (changed) {
        setLastTiledOrder(ordered);
        // We do not clear the model here - we leave that to handleWindowRemoved
        return true;
    }
    return false;
}

workspace.currentDesktopChanged.connect(() => {
    _desktopSwitchTs = Date.now();
});

function isDuringDesktopSwitch() {
    return (Date.now() - _desktopSwitchTs) < 3;
}

function getWindowToken(win) {
    if (!win) return 0;
    if (_windowTokens.has(win)) return _windowTokens.get(win);
    const id = _windowTokenSeq++;
    _windowTokens.set(win, id);
    return id;
}

function reLayout() {
    const state = getCurrentState();
    if (state.allFloating || state.maximizedAll) return;

    sanitizeState();
    cleanupFloatingWindows();
    cleanupResizeEdges();

    let { ordered, visible: tiledVisible } = getTiledOrder();
    if (DEBUG) print(`[reLayout] key=${getStateKey()} ordered=${ordered ? ordered.length : -1} visible=${tiledVisible ? tiledVisible.length : -1} dirty=${!!state._layoutDirty}`);
    if (!ordered || ordered.length === 0) return;
    if (tiledVisible.every(w => w.minimized)) return;

    const currentDeskId = getCurrentDesktopIdentifier();
    lastDesktopId = currentDeskId;

    // Unmaximize
    const allVisible = getVisibleWindows();
    for (let w of allVisible) {
        if (!w || w.deleted) continue;
        if (w.fullScreen) w.fullScreen = false;
        if (w.maximizeMode !== 0) w.setMaximize(false, false);
    }

    // Handling too many windows
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

    const ws = getWS();
    const hasForcePending = !!(ws.layoutMeta && ws.layoutMeta.force);
    const hasRetilePending = !!(ws.layoutMeta && ws.layoutMeta.retile);
    const signature =
        getCurrentActivityId() + "|" +
        getCurrentDesktopIdentifier() + "|" +
        getEffectiveScreenId() + "|" +
        effectiveOrder.map(getWindowToken).join(",") + "|" +
        usable.x + "," + usable.y + "," + usable.width + "," + usable.height + "|" +
        !!state.kwinTilingActive + "|" + !!state.allFloating + "|" + !!state.maximizedAll;

    if (!state._layoutDirty && !hasForcePending && !hasRetilePending && state._lastRelayoutSignature === signature) {
        if (DEBUG) print(`[reLayout] skipped signature unchanged key=${getStateKey()}`);
        return;
    }
    if (ws.layoutMeta) {
        ws.layoutMeta.retile = false;
    }

    let model = getLayoutModel();

    if (model && model._count !== ordered.length) {
        if (DEBUG) print("MODEL DESYNC → clearing");
        clearLayoutModel();
        forceRebuildModel();
        model = null;
    }

    model = normalizeModelStructure(model);
    assertModelConsistency(model);

    // 🔥 FIX #3 — inteligentny rebuild
    const blockRebuild = isDuringDesktopSwitch();
    const isHardDesync = !model || model._count !== ordered.length;

    let needRebuild = isHardDesync ||
    consumeForceRebuild() ||
    state._layoutDirty;

    // 🔥 block only SOFT rebuild (e.g. resize), NOT critical
    if (blockRebuild && !isHardDesync && needRebuild) {
        if (DEBUG) print("SKIP SOFT REBUILD (desktop switch)");
        needRebuild = false;
        state._layoutDirty = false;
    }

    if (needRebuild) {
        let workingOrder = effectiveOrder.slice();

        let newModel = buildAndValidateModel(workingOrder, usable);

        const removedWindows = [];

        while (!newModel && workingOrder.length > 1) {
            const removed = workingOrder.pop();
            if (removed) removedWindows.push(removed);
            newModel = buildAndValidateModel(workingOrder, usable);
        }

        // AutoFloating on layout change
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

        newModel._count = workingOrder.length;

        setLayoutModel(newModel);
        state._layoutDirty = false;

        if (DEBUG) print("MODEL REBUILT (per workspace)");

        setLastTiledOrder(workingOrder);

        // Reclaim
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
    state._lastRelayoutSignature = signature;

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

    // <<< PROTECTION >>>
    sanitizeFloatingBeforeTiling();
    rebalanceOverflow();

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
            target = isWindowTiled(w); // tiled
        }
        else if (borderMode === 1) {
            target = false; // everything with borders
        }
        else if (borderMode === 2) {
            target = true; // everything borderless
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

  //  if (canAutoRetile()) {
   //     scheduleRelayout();
   // }
}


// ──────────────────────────────────────────────────────────────
// CYCLE RATIO PRESETS
// ──────────────────────────────────────────────────────────────
function getRatioOSD() {
    const left = getLeftRatio();
    const top  = getTopRatio();

    // convert to percentage (clearer than ratio)
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

    const state = getCurrentState();

    const isTiledMode = !state.allFloating && !state.kwinTilingActive;

    // 🔥 ONLY in your tiling mode
    if (isTiledMode) {
        state._layoutDirty = true;

        minimizeIgnoredWindows();
        scheduleRelayout();
    }

    const ratio = getRatioOSD();
    showOSD(ratio.text, "view-split-left-right");
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
        newMode = (currentMode === 0) ? -1 : 1;
    }

    setFirstRowWindowsMode(newMode);
    getCurrentState()._layoutDirty = true;

    minimizeIgnoredWindows();

    sanitizeFloatingBeforeTiling();
    rebalanceOverflow();

    scheduleRelayout(0);

    let extra = "";
    if (visible.length > MAX_WINDOWS) {
        extra = `Too many windows! (only ${MAX_WINDOWS} tiled)`;
    } else {
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
function rotateWindowsKeepFocus(direction = 1) {
    const wins = getVisibleWindows()
    .filter(w => w && !w.deleted && !w.minimized && !w.skipTaskbar);

    if (wins.length < 2) return;

    const activeBefore = workspace.activeWindow;
    const state = getCurrentState();

    function getRotatedIndex(i, len, dir) {
        return dir === 1
        ? (i - 1 + len) % len   // clockwise
        : (i + 1) % len;        // counter-clockwise
    }

    const isKWin = wins.some(w => w.tile);


    function collectLeaves(tile, out = []) {
        if (tile.tiles && tile.tiles.length > 0) {
            tile.tiles.forEach(child => collectLeaves(child, out));
        } else {
            out.push(tile);
        }
        return out;
    }


    function sortTilesByPosition(tiles) {
        return tiles.slice().sort((a, b) => {
            const ga = a.absoluteGeometryInScreen;
            const gb = b.absoluteGeometryInScreen;

            if (!ga || !gb) return 0;

            // first by row (Y), then by column (X)
            if (Math.abs(ga.y - gb.y) > 20) {
                return ga.y - gb.y;
            }
            return ga.x - gb.x;
        });
    }

    // =========================================================
    // 🔥 TRYB 1 — KWIN TILE
    // =========================================================

    if (isKWin) {

        const root = workspace.rootTile(workspace.activeScreen, workspace.currentDesktop);
        if (!root) return;

        function collectLeaves(tile, out = []) {
            if (tile.tiles && tile.tiles.length > 0) {
                tile.tiles.forEach(child => collectLeaves(child, out));
            } else {
                out.push(tile);
            }
            return out;
        }

        function sortTilesByPosition(tiles) {
            return tiles.slice().sort((a, b) => {
                const ga = a.absoluteGeometryInScreen;
                const gb = b.absoluteGeometryInScreen;

                if (!ga || !gb) return 0;

                if (Math.abs(ga.y - gb.y) > 20) {
                    return ga.y - gb.y;
                }
                return ga.x - gb.x;
            });
        }

        const leaves = sortTilesByPosition(collectLeaves(root));

        // 🔥 KEY: assign windows TO TILES (not the other way around)
        const tileWindows = [];

        leaves.forEach(tile => {
            const w = wins.find(win => win.tile === tile);
            if (w) tileWindows.push(w);
        });

            const count = tileWindows.length;
            if (count < 2) return;

            // 🔥 detach only those we rotate
            tileWindows.forEach(w => {
                if (!w || !w.tile) return;
                try {
                    w.tile.unmanage(w);
                } catch (e) {
                    // noop: do not write to `window.tile` (deprecated in KWin)
                }
            });

                const assignedOrder = [];

                // 🔥 ROTACJA PO KOLE (O)
                for (let i = 0; i < count; i++) {
                    const srcIdx = getRotatedIndex(i, count, direction);

                    const w = tileWindows[srcIdx];
                    const tile = leaves[i];

                    if (!w || w.deleted) continue;

                    workspace.activeWindow = w;
                    tile.manage(w);
                    assignedOrder.push(w);
                }

                if (assignedOrder.length > 0) {
                    setLastTiledOrder(assignedOrder);
                }

                if (activeBefore && !activeBefore.deleted) {
                    workspace.activeWindow = activeBefore;
                    workspace.raiseWindow(activeBefore);
                }

                return;
    }

    // =========================================================
    // 🔥 MODE 2 — FLOATING
    // =========================================================
    if (state.allFloating) {

        const ordered = sortByAngle(wins).reverse();

        const slots = ordered.map(w => {
            const g = w.frameGeometry;
            return { x: g.x, y: g.y, w: g.width, h: g.height };
        });

        for (let i = 0; i < ordered.length; i++) {
            const srcIdx = getRotatedIndex(i, ordered.length, direction);

            const w = ordered[i];
            const s = slots[srcIdx];

            if (!w || w.deleted || !s) continue;

            scriptGeometryChange = true;
            w.frameGeometry = {
                x: s.x,
                y: s.y,
                width: s.w,
                height: s.h
            };
            scriptGeometryChange = false;
        }

        if (activeBefore && !activeBefore.deleted) {
            workspace.activeWindow = activeBefore;
            workspace.raiseWindow(activeBefore);
        }

        return;
    }

    // =========================================================
    // 🔥 MODE 3 — YOUR TILING (PERIMETER + SLOT REMAP)
    // =========================================================

    // 🔥 1. take the current order (model-based!)
    let baseOrder = getLastTiledOrder().filter(w =>
    w && !w.deleted && wins.includes(w)
    );

    if (baseOrder.length < 2) return;

    // =========================================================
    // 🔥 2. build PERIMETER PATH from geometry
    // =========================================================
    function buildPerimeterPath(windows) {

        const sorted = windows.slice().sort((a, b) => {
            const ga = a.frameGeometry;
            const gb = b.frameGeometry;

            if (Math.abs(ga.y - gb.y) > 30) return ga.y - gb.y;
            return ga.x - gb.x;
        });

        const rows = [];
        const ROW_THRESHOLD = 40;

        for (let w of sorted) {
            const g = w.frameGeometry;

            let placed = false;

            for (let row of rows) {
                if (Math.abs(g.y - row[0].frameGeometry.y) < ROW_THRESHOLD) {
                    row.push(w);
                    placed = true;
                    break;
                }
            }

            if (!placed) rows.push([w]);
        }

        for (let row of rows) {
            row.sort((a, b) => a.frameGeometry.x - b.frameGeometry.x);
        }

        const path = [];
        const used = new Set();

        // top
        for (let w of rows[0] || []) {
            path.push(w); used.add(w);
        }

        // right
        for (let r = 1; r < rows.length; r++) {
            const row = rows[r];
            const w = row[row.length - 1];
            if (w && !used.has(w)) {
                path.push(w); used.add(w);
            }
        }

        // bottom
        if (rows.length > 1) {
            const bottom = rows[rows.length - 1];
            for (let i = bottom.length - 1; i >= 0; i--) {
                const w = bottom[i];
                if (!used.has(w)) {
                    path.push(w); used.add(w);
                }
            }
        }

        // left
        for (let r = rows.length - 2; r > 0; r--) {
            const row = rows[r];
            const w = row[0];
            if (w && !used.has(w)) {
                path.push(w); used.add(w);
            }
        }

        // fallback (center)
        for (let row of rows) {
            for (let w of row) {
                if (!used.has(w)) path.push(w);
            }
        }

        return path;
    }

    const path = buildPerimeterPath(baseOrder);

    if (!path || path.length !== baseOrder.length) return;

    // =========================================================
    // 🔥 3. ROTACJA PATH
    // =========================================================
    const len = path.length;
    const rotated = [];

    for (let i = 0; i < len; i++) {
        const srcIdx = getRotatedIndex(i, len, direction);
        rotated.push(path[srcIdx]);
    }

    // =========================================================
    // 🔥 4. SLOT REMAP 
    // =========================================================

    // slot index = index in baseOrder
    // but we assign windows from the rotated PATH

    const newOrder = new Array(baseOrder.length);

    // map: window → index in path
    const indexInPath = new Map();
    for (let i = 0; i < path.length; i++) {
        indexInPath.set(path[i], i);
    }

    // slot assignment
    for (let i = 0; i < baseOrder.length; i++) {
        const slotWindow = baseOrder[i];
        const idx = indexInPath.get(slotWindow);

        if (idx !== undefined) {
            newOrder[i] = rotated[idx];
        } else {
            newOrder[i] = slotWindow;
        }
    }

    // =========================================================
    // 🔥 5. APPLY
    // =========================================================
    setLastTiledOrder(newOrder);

    state._layoutDirty = true;

    minimizeIgnoredWindows();
    sanitizeFloatingBeforeTiling();
    rebalanceOverflow();

    scheduleRelayout();

    // 🔥 focus restore
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
    // Remove duplicate if it already exists
    const idx = stack.indexOf(win);
    if (idx > -1) stack.splice(idx, 1);
    stack.push(win);
}

function restoreLastMinimized() {
    const stack = getMinimizedStack();

    while (stack.length > 0) {
        const w = stack.pop();

        if (!w || w.deleted || !w.minimized) continue;

        // Restore window
        w.minimized = false;

        // Switch desktop and activity to the one where the window was
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

        // ─────────────────────────────────────────────
        // RESTORE
        // ─────────────────────────────────────────────
        if (!c.minimized && AUTO_LAYOUT_ON_WINDOW_RESTORE && canAutoRetile()) {
            var timer = new QTimer();
            timer.singleShot = true;
            timer.interval = 100;

            timer.timeout.connect(() => {
                timer.stop();

                _visibleCache = null;

                if (canAutoRetile()) {
                    const state = getCurrentState();
                    if (state && state.kwinTilingActive) {
                        applyKWinTiling({ screen: getScreenForWindow(c), source: "windowRestore" });
                    } else {
                        scheduleRelayout();
                    }

                    // 🔥 ADD — after restore
                    rebalanceOverflow();
                }
            });

            timer.start();
        }

        // ─────────────────────────────────────────────
        // MINIMIZE
        // ─────────────────────────────────────────────
        if (c.minimized && AUTO_LAYOUT_ON_WINDOW_MINIMIZE && canAutoRetile()) {
            var timer = new QTimer();
            timer.singleShot = true;
            timer.interval = 80;

            timer.timeout.connect(() => {
                timer.stop();

                _visibleCache = null;

                if (canAutoRetile()) {
                    const state = getCurrentState();
                    if (state && state.kwinTilingActive) {
                        applyKWinTiling({ screen: getScreenForWindow(c), source: "windowMinimize" });
                    } else {
                        scheduleRelayout();
                    }

                    // 🔥 ADD — after minimize
                    rebalanceOverflow();
                }
            });

            timer.start();
        }
    });

    c._minimizeRestoreTracked = true;
}

function trackWindowMaximizeRestoreKWin(c) {
    if (!c || !c.normalWindow || c.specialWindow || c.dock || c.skipTaskbar) return;
    if (c._kwin_maxRestoreTracked) return;
    const isKWinModeActiveForHandler = () => {
        const state = getCurrentState();
        if (state && state.kwinTilingActive) return true;
        try {
            const visible = getVisibleWindows();
            return visible.some(w => w && !w.deleted && !w.minimized && !!w.tile);
        } catch (e) {
            return false;
        }
    };
    const scheduleReapply = (source) => {
        if (!c || c.deleted) return;
        if (Date.now() < _kwinApplyIgnoreUntil) return;
        if (!isKWinModeActiveForHandler()) return;

        const now = Date.now();
        if (c._kwinMaxRestoreCooldownUntil && now < c._kwinMaxRestoreCooldownUntil) {
            return;
        }
        c._kwinMaxRestoreCooldownUntil = now + 320;

        if (c._kwinReapplyTimer) {
            c._kwinReapplyTimer.stop();
        } else {
            c._kwinReapplyTimer = new QTimer();
            c._kwinReapplyTimer.singleShot = true;
            c._kwinReapplyTimer.timeout.connect(() => {
                if (!c || c.deleted) return;
                const screenTarget = getScreenForWindow(c);
                if (DEBUG) {
                    const label = c.caption || c.resourceClass || c.resourceName || "?";
                    print(`[kwin/maxRestore] "${label}" source=${source} -> reapply KWin tiling`);
                }
                applyKWinTiling({ screen: screenTarget, source: "maximizeRestore" });
            });
        }

        c._kwinReapplyTimer.interval = 90;
        c._kwinReapplyTimer.start();
    };

    c._kwinLastMaxMode = (typeof c.maximizeMode === "number") ? c.maximizeMode : 0;
    c._kwinAwaitUnmaximizeRetile = false;

    const isLikelyMaximizedGeometry = () => {
        if (!c || c.deleted || !c.frameGeometry) return false;
        const screenTarget = getScreenForWindow(c);
        const desk = getCurrentDesktopForAPI();
        const area = workspace.clientArea(KWin.FullScreenArea, screenTarget, desk);
        if (!area) return false;

        const g = c.frameGeometry;
        const tol = 12;
        return (
            Math.abs(g.x - area.x) <= tol &&
            Math.abs(g.y - area.y) <= tol &&
            Math.abs(g.width - area.width) <= tol &&
            Math.abs(g.height - area.height) <= tol
        );
    };

    c._kwinLastLikelyMaxGeometry = !!isLikelyMaximizedGeometry();

    if (typeof c.maximizeModeChanged === "function") {
        c.maximizeModeChanged.connect(() => {
            if (!c || c.deleted) return;
            if (Date.now() < _kwinApplyIgnoreUntil) return;

            const prev = (typeof c._kwinLastMaxMode === "number") ? c._kwinLastMaxMode : 0;
            const curr = (typeof c.maximizeMode === "number") ? c.maximizeMode : 0;
            c._kwinLastMaxMode = curr;

            if (curr !== 0) {
                c._kwinAwaitUnmaximizeRetile = true;
                if (DEBUG) {
                    const label = c.caption || c.resourceClass || c.resourceName || "?";
                    print(`[kwin/maxRestore] "${label}" mark-await (maximizeMode=${curr})`);
                }
                return;
            }

            // Trigger only on real transition: maximized -> normal.
            if (prev !== 0 && curr === 0) {
                c._kwinAwaitUnmaximizeRetile = false;
                scheduleReapply("maximizeModeChangedRestore");
            }
        });
    }

    if (typeof c.fullScreenChanged === "function") {
        c.fullScreenChanged.connect(() => {
            if (Date.now() < _kwinApplyIgnoreUntil) return;
            // Trigger only on exiting fullscreen.
            if (c && !c.deleted && !c.fullScreen) {
                scheduleReapply("fullScreenChanged");
            }
        });
    }

    if (typeof c.frameGeometryChanged === "function") {
        c.frameGeometryChanged.connect(() => {
            if (!c || c.deleted) return;
            if (Date.now() < _kwinApplyIgnoreUntil) return;
            if (!isKWinModeActiveForHandler()) return;
            if (c.fullScreen) return;

            // Titlebar maximize on some setups doesn't expose maximizeMode reliably.
            // Track transitions of fullscreen-like geometry and wait for a subsequent restore.
            const likelyMax = isLikelyMaximizedGeometry();
            const prevLikelyMax = !!c._kwinLastLikelyMaxGeometry;
            c._kwinLastLikelyMaxGeometry = likelyMax;

            if (likelyMax && !prevLikelyMax) {
                c._kwinAwaitUnmaximizeRetile = true;
                if (DEBUG) {
                    const label = c.caption || c.resourceClass || c.resourceName || "?";
                    print(`[kwin/maxRestore] "${label}" mark-await (geometry transition -> fullscreen-like)`);
                }
                return;
            }

            if (!likelyMax && c._kwinAwaitUnmaximizeRetile) {
                c._kwinAwaitUnmaximizeRetile = false;
                if (DEBUG) {
                    const label = c.caption || c.resourceClass || c.resourceName || "?";
                    print(`[kwin/maxRestore] "${label}" restore-detected (geometry transition <- fullscreen-like)`);
                }
                scheduleReapply("frameGeometryChangedTitlebarRestore");
            }
        });
    }

    c._kwin_maxRestoreTracked = true;
}

workspace.windowAdded.connect(trackWindowMinimizeRestore);
workspace.windowList().forEach(trackWindowMinimizeRestore);
workspace.windowAdded.connect(trackWindowMaximizeRestoreKWin);
workspace.windowList().forEach(trackWindowMaximizeRestoreKWin);


// ──────────────────────────────────────────────────────────────
// TOGGLE MAX OR MIN
// ──────────────────────────────────────────────────────────────
function ToggleMaxOrMin() {
    const w = workspace.activeWindow;
    if (!w || !w.normalWindow || w.deleted || !w.managed) return;
    const state = getCurrentState();
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
            if (state && state.kwinTilingActive) {
                const screenTarget = getScreenForWindow(w);
                const t = new QTimer();
                t.singleShot = true;
                t.interval = 110;
                t.timeout.connect(() => {
                    t.stop();
                    if (!w || w.deleted) return;
                    if (DEBUG) {
                        const label = w.caption || w.resourceClass || w.resourceName || "?";
                        print(`[kwin/maxRestore] "${label}" source=ToggleMaxOrMin -> reapply KWin tiling`);
                    }
                    applyKWinTiling({ screen: screenTarget, source: "maximizeRestoreShortcut" });
                });
                t.start();
            }
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
// DOUBLE TAP SHIFT CAPS  ENABLE FLOATING ALL
// ──────────────────────────────────────────────────────────────


function handleDoubleTapShiftCapsFloatAll() {

    if (!handleDoubleTapShiftCapsFloatAll.lastPressTime)
        handleDoubleTapShiftCapsFloatAll.lastPressTime = 0;

    const now = Date.now();

    if (now - handleDoubleTapShiftCapsFloatAll.lastPressTime <= DOUBLE_TAP_THRESHOLD) {

        if (DEBUG) print("Shift+Caps double → enable Float All");

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
    const state = getCurrentState();
    const now = Date.now();

    // DOUBLE TAP → Maximize all
    if (now - smartTileLastTap < DOUBLE_TAP_THRESHOLD) {
        smartTileLastTap = 0;
        setFirstRowWindowsMode(smartTilePrevFirstRowMode);
        maximizeAll();                    
        return;
    }

    smartTileLastTap = now;

    if (state.maximizedAll) {
        unmaximizeAll();
        state.kwinTilingActive = false;
        state.allFloating = false;
        state.maximizedAll = false;
        clearLayoutModel();
        forceRebuildModel();
        getCurrentState()._layoutDirty = true;
        scheduleRelayout(0);
        return;
    }

    if (visible.length === 0) {
        state.kwinTilingActive = false;
        state.allFloating = false;
        state.maximizedAll = false;
        clearLayoutModel();
        forceRebuildModel();
        getCurrentState()._layoutDirty = true;
        scheduleRelayout(0);
        showOSDSafe("Tiling mode", "view-grid");
        return;
    }

    // KWin tiling -> normal script tiling (single action, no layout cycling)
    if (state.kwinTilingActive) {
        disableKWinTiling();
        state.kwinTilingActive = false;
        state.allFloating = false;
        state.maximizedAll = false;
        clearLayoutModel();
        forceRebuildModel();
        state._layoutDirty = true;
        scheduleRelayout(0);
        showOSDSafe("Tiling mode", "view-grid");
        return;
    }

    // Single window → soft fullscreen
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

        const isFull = Math.abs(g.x - target.x) < 2 &&
                      Math.abs(g.y - target.y) < 2 &&
                      Math.abs(g.width - target.width) < 2 &&
                      Math.abs(g.height - target.height) < 2;

        if (!isFull) {
            scriptGeometryChange = true;
            win.frameGeometry = target;
            scriptGeometryChange = false;
            lastAppliedGeometry.set(win, target);
            showOSDSafe("Fullscreen", "view-fullscreen");
        } else {
            clearLayoutModel();
            forceRebuildModel();
            getCurrentState()._layoutDirty = true;
            scheduleRelayout(0);
            showOSDSafe("Tiled", "view-grid");
        }
        return;
    }

    if (exitFloatAllToTiling()) {
        sanitizeFloatingBeforeTiling();
        rebalanceOverflow();
        return;
    }

    const anyMax = visible.some(w => w.maximizeMode !== 0);
    if (anyMax && visible.length > 1) {
        minimizeIgnoredWindows();
        scheduleRelayout();
    } else {
        smartTilePrevFirstRowMode = getFirstRowWindowsMode();
        cycleFirstRowWindows();
    }

    sanitizeFloatingBeforeTiling();
    rebalanceOverflow();
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

    // ───── dynamic Top N limit (not more than the number of windows) ─────
    const effectiveMaxTop = Math.min(MAX_FIRST_ROW, n);

    const candidates = [-1];                    // Left Master + without Auto Grid

    // Top 1 … effectiveMaxTop
    for (let i = effectiveMaxTop; i >= 1; i--) {
        candidates.unshift(i);
    }

    let idx = candidates.indexOf(currentMode);
    if (idx === -1) idx = 0;

    // Find the next layout that is different and fits
    for (let i = 1; i < candidates.length + 10; i++) {   // +10 = safety
        const nextMode = candidates[(idx + i) % candidates.length];

        if (nextMode < 0) {
            // ---Auto Grid and +++Left Master are always allowed
            return nextMode;
        }

        // Check whether Top N actually fits
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

    return -1;
}



// ──────────────────────────────────────────────────────────────
// HELPER: maximum number of windows in the first row that can actually fit
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
// AUTO-SKIP impossible firstRowMode values - moves to the next possible one
// ──────────────────────────────────────────────────────────────
function findNextPossibleFirstRowMode(currentMode, ordered, usable) {
    const possibleModes = [-1, 0]; // Left Master and Auto Grid always at the end

    // Add all sensible Top N values (from largest to 1)
    const maxPossible = getMaxPossibleFirstRowCount(ordered, usable);
    for (let n = maxPossible; n >= 1; n--) {
        possibleModes.unshift(n); // insert at the beginning
    }

    // Remove duplicates
    const unique = [...new Set(possibleModes)];

    let idx = unique.indexOf(currentMode);
    if (idx === -1) idx = 0;

    // Start from the next one after the current mode
    for (let i = 1; i < unique.length; i++) {
        const nextIdx = (idx + i) % unique.length;
        const candidate = unique[nextIdx];

        if (candidate <= 0) return candidate; // Left / Auto always accepted

        // Check whether this Top N fits
        let minSum = 0;
        for (let j = 0; j < candidate && j < ordered.length; j++) {
            minSum += getMinWidth(ordered[j]);
        }
        const usableW = usable.width - GAP * Math.max(0, candidate - 1);
        if (minSum <= usableW) {
            return candidate;
        }
    }
    return 0; // fallback to Auto Grid
}


function getMinWidth(win) {
    if (!win || win.deleted) {
        return 240;
    }

    // Most reliable source - minimumSize
    if (win.minimumSize && typeof win.minimumSize.width === "number" && win.minimumSize.width > 0) {
        return Math.max(180, Math.min(620, win.minimumSize.width));   // hard cap
    }

    // Older property (for compatibility)
    if (win.minSize && typeof win.minSize.width === "number" && win.minSize.width > 0) {
        return Math.max(180, Math.min(620, win.minSize.width));
    }

    // Fallback based on resourceClass / resourceName
    const cls = (win.resourceClass || "").toLowerCase();
    const name = (win.resourceName || "").toLowerCase();

    if (cls.includes("brave") || cls.includes("chrome") || cls.includes("chromium") ||
        cls.includes("electron") || cls.includes("vscode") || name.includes("brave")) {
        return 460;        // safe value for Brave (works well in practice)
    }

    if (cls.includes("konsole") || cls.includes("terminal") || cls.includes("kitty") || cls.includes("alacritty")) {
        return 280;
    }

    // Default value for other applications
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

    const minGrid = Math.max(minGridGlobal, minGridRow);

    const maxMain = usable.width - GAP - minGrid;

    // fallback
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

    // neighbor selection (same as mouse resize)
    let leftItem, rightItem;

    if (winIndex < row.windows.length - 1) {
        leftItem = activeItem;
        rightItem = row.windows[winIndex + 1];
    } else {
        leftItem = row.windows[winIndex - 1];
        rightItem = activeItem;
        deltaPx = -deltaPx; // reverse direction
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

    // 🔥 save to model
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

function recomputeHeightsFromBoundaryDelta(model, usable, upperRowIndex, delta) {
    if (!model || model.rows.length < 2) return;
    if (Math.abs(delta) < 0.8) return;        // filtr szumu

    const totalDelta = delta + accumulatedHeightDelta;

    // If the sum is still too small - only accumulate and exit
    if (Math.abs(totalDelta) < 5.5) {         
        accumulatedHeightDelta = totalDelta;
        return;
    }

    // ──────── The sum is sufficient -> perform resize ────────
    accumulatedHeightDelta = 0;               // reset ONLY after applying

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


function recomputeRowFromGeometry(row, usableWidth, activeWin) {
    if (!row || row.windows.length < 2) return;
    if (!activeWin || activeWin.deleted) return;
    if (!resizeEdges.has(activeWin)) return;

    var edge = resizeEdges.get(activeWin);
    var g = activeWin.frameGeometry;
    var activeEdges = getActiveResizeEdges(edge, g);

    // We only care about resizing the left or right edge
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

    // ==================== WIDTH ACCUMULATOR ====================
    const totalDelta = realDelta + accumulatedWidthDelta;

    if (Math.abs(totalDelta) < 5.5) {           
        accumulatedWidthDelta = totalDelta;
        return;
    }

    // The sum is sufficient -> apply and reset
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

    // ==================== LEFT MAIN ACCUMULATOR ====================
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

    // Update grid window widths
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

    let newMainW = currentMainW + totalDelta;   // delta is already reversed by logic
    newMainW = clampLeftMainWidth(newMainW, usable, model);

    const appliedDelta = newMainW - currentMainW;
    model.leftMain.widthRatio = newMainW / usable.width;

    const newGridW = safeWidth(usable.width - newMainW - GAP);

    let newColW = currentColW - appliedDelta;
    const minW = getMinWidth(item.win);
    newColW = Math.max(minW, newColW);
    if (newColW > newGridW) newColW = newGridW;

    item.widthRatio = newColW / newGridW;

    // Remaining grid columns proportionally
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

                // 🔥 KEY: only LEFT = main/grid boundary
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

            // 🔥 KEY: DOMINANT-MOTION DETECTION (corner fix)
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

            lastResizeTime = Date.now();   

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


        if (getCurrentState().allFloating) return;

        const model = getLayoutModel();

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
    if (!state.allFloating || state.kwinTilingActive) return false;

    const visible = getVisibleWindows();
    if (!visible || visible.length === 0) {
        state.allFloating = false;
        state.kwinTilingActive = false;
        clearLayoutModel();
        forceRebuildModel();
        state._layoutDirty = true;
        scheduleRelayout(0);
        showOSDSafe("Tiling mode", "view-grid");
        return true;
    }

    const floatingSet = getFloatingSet();

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
    sanitizeFloatingBeforeTiling();
    rebalanceOverflow();

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

        order = order.filter(w => w !== win);
        setLastTiledOrder(order);

        getFloatingSet().add(win);
        autoFloating.delete(win);

        clearLayoutModel();
        forceRebuildModel();
        getCurrentState()._layoutDirty = true;

        scriptGeometryChange = true;
        win.frameGeometry = centered;
        scriptGeometryChange = false;

        scheduleRelayout(0);

        workspace.raiseWindow(win);

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

    clearLayoutModel();
    forceRebuildModel();
    getCurrentState()._layoutDirty = true;

    scheduleRelayout(0);

    showOSDSafe(`Tiled:\n${name}`, "view-grid");

}


function toggleFloatAll(force, options) {
    const state = getCurrentState();
    const visible = getVisibleWindows();
    const hasWindows = visible && visible.length > 0;
    const floatingSet = getFloatingSet();
    const showOSD = !(options && options.showOSD === false);

    // Default behavior: always enable floating mode when called without explicit force.
    if (typeof force === "undefined") force = true;

    const floatAllActive = !!state.allFloating && !state.kwinTilingActive;

    if (force === true && floatAllActive) {
        if (showOSD) showOSDSafe("Floating mode", "window");
        return;
    }
    if (force === false && !floatAllActive) return;

    // === ENTER FLOAT ALL ===
    if (!floatAllActive) {
        if (state.kwinTilingActive) {
            disableKWinTiling();
            state.kwinTilingActive = false;
        }

        resetPreview();
        resizeEdges.clear();
        manualResizeInProgress = false;
        movingWindow = null;

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
            state._savedOrder = [];
            state._savedFloating = new Set();
        }

        state.allFloating = true;
        applyBorderMode();
        if (showOSD) showOSDSafe("Floating mode", "window");
        return;
    }

    // === EXIT FLOAT ALL → RESTORE TILNG ===
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
            w && !w.deleted && visibleNow.includes(w)
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
        sanitizeFloatingBeforeTiling();  
        rebalanceOverflow();              
        clearLayoutModel();
        forceRebuildModel();
        state._layoutDirty = true;
        scheduleRelayout(0);
        applyBorderMode();
    }

    if (showOSD) showOSDSafe("Tiling mode", "view-grid");
}


function tileAllFloatingWindows() {
    const visible = getVisibleWindows();
    if (!visible || visible.length === 0) return;

    const floatingSet = getFloatingSet();
    let order = getLastTiledOrder() || [];
    let added = 0;

    for (let w of visible) {
        if (!w || w.deleted) continue;
        if (!floatingSet.has(w)) continue;

        floatingSet.delete(w);
        autoFloating.delete(w);        
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
    clearLayoutModel();
    forceRebuildModel();
    getCurrentState()._layoutDirty = true;

    sanitizeFloatingBeforeTiling();  
    rebalanceOverflow();             

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

        // 🔥 local layout (without offsets)
        const cx = ((origin.left + origin.right) / 2) - usable.x;
        const cy = ((origin.top + origin.bottom) / 2) - usable.y;

        const screenCx = usable.width / 2;
        const screenCy = usable.height / 2;

        const isRight = cx > screenCx;
        const isTop   = cy < screenCy;

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
        getCurrentState()._layoutDirty = false; 

        if (DEBUG) print("resizeTiledWindowUnified: model saved persistently");
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

    const INTERNAL_WINDOW_MS = 60; 

    const isInternalResize = (now - lastTime) < INTERNAL_WINDOW_MS;

    if (last && !isInternalResize) {
        const manualChange =
        Math.abs(g.x - last.x) > 2 ||
        Math.abs(g.y - last.y) > 2 ||
        Math.abs(g.width - last.width) > 2 ||
        Math.abs(g.height - last.height) > 2;

        if (manualChange) {
            if (DEBUG) print("KLeftHandTiler: detected manual geometry change after float → resetting resize state");

            resizeState.delete(win);
            resizeOriginRect.delete(win);
            lastAppliedGeometry.delete(win);

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
    return (bottom - top) > 20;   // ← must be at least 20 px of vertical overlap
}

function horizontalOverlap(a, b) {
    const ga = a.frameGeometry;
    const gb = b.frameGeometry;
    const left  = Math.max(ga.x, gb.x);
    const right = Math.min(ga.x + ga.width, gb.x + gb.width);
    return (right - left) > 20;   // ← min. 20 px of horizontal overlap
}


function getAllNeighbors(win, direction) {

    const wins = getVisibleWindows();
    const neighbors = [];

    for (let w of wins) {

        if (!w || w === win || w.deleted) continue;

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
    const state = getCurrentState();

    const winTiled = isWindowTiled(win);
    const neighborTiled = isWindowTiled(neighbor);

    // ==========================================================
    // 🧩 TRYB 0: KWIN TILING (no internal model)
    // ==========================================================
    if (state && state.kwinTilingActive && win.tile && neighbor.tile) {
        const winTile = win.tile;
        const neighborTile = neighbor.tile;

        try {
            winTile.unmanage(win);
        } catch (e) {}
        try {
            neighborTile.unmanage(neighbor);
        } catch (e) {}

        workspace.activeWindow = neighbor;
        winTile.manage(neighbor);
        workspace.activeWindow = win;
        neighborTile.manage(win);

        const order = getLastTiledOrder();
        const i1 = order.indexOf(win);
        const i2 = order.indexOf(neighbor);
        if (i1 !== -1 && i2 !== -1) {
            [order[i1], order[i2]] = [order[i2], order[i1]];
            setLastTiledOrder(order);
        }

        workspace.raiseWindow(neighbor);
        workspace.raiseWindow(win);
        return;
    }

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
    // 🪟 FLOATING 
    // ==========================================================
    scriptGeometryChange = true;

    try {

        const g = win.frameGeometry;
        const step = 60; // you can increase it

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

            handleManualDrop(c);

            resetPreview();

            movingWindow = null;
            movingStartCenter = null;
        }

        if (!c.move && !c.resize) {
            manualResizeInProgress = false;
        }

    });

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
    _lastRelayoutRunTs = Date.now();
    reLayout();
});

var defaultModeTimer = new QTimer();
defaultModeTimer.singleShot = true;
defaultModeTimer.interval = 0;
defaultModeTimer.timeout.connect(function () {
    applyDefaultDesktopModeIfNeeded();
});

function scheduleApplyDefaultDesktopMode(delay) {
    if (typeof delay === "undefined") delay = 0;
    defaultModeTimer.stop();
    defaultModeTimer.interval = delay;
    defaultModeTimer.start();
}

function applyDefaultDesktopModeIfNeeded() {
    const state = getCurrentState();
    if (!state || state._defaultModeApplied) return;

    state._defaultModeApplied = true;

    if (DEFAULT_DESKTOP_MODE === 0) {
        state.kwinTilingActive = false;
        state.allFloating = false;
        state.maximizedAll = false;
        scheduleRelayout(0);
        return;
    }

    if (DEFAULT_DESKTOP_MODE === 1) {
        state.kwinTilingActive = false;
        state.allFloating = false;
        state.maximizedAll = false;
        applyKWinTiling();
        return;
    }

    if (DEFAULT_DESKTOP_MODE === 2) {
        if (state.kwinTilingActive) {
            disableKWinTiling();
            state.kwinTilingActive = false;
        }
        state.allFloating = false;
        state.maximizedAll = false;
        toggleFloatAll(true, { showOSD: false });
        return;
    }

    if (DEFAULT_DESKTOP_MODE === 3) {
        state.kwinTilingActive = false;
        state.allFloating = false;
        maximizeAll();
    }
}


function scheduleRelayout(delay) {
    const state = getCurrentState();

    if (state.maximizedAll) return;

    if (state.kwinTilingActive) {
        disableKWinTiling();
    }

    if (typeof delay === 'undefined') delay = 100;

    if (state.allFloating) return;

    if (manualResizeInProgress && delay !== 0) {

        const now = Date.now();

        if (now - lastResizeTime < 500) {
            if (DEBUG) print("scheduleRelayout blocked (resize active)");
            return;
        }

        if (DEBUG) print("scheduleRelayout: resize timeout → force unlock");

        manualResizeInProgress = false;
        resizeEdges.clear();
    }

    if (delay === 0) {
        const now = Date.now();
        const wsMeta = getWS().layoutMeta || {};
        const forcePending = !!wsMeta.force;
        const runPending = !!wsMeta.run;
        const retilePending = !!wsMeta.retile;
        if (DEBUG) {
            print(`[scheduleRelayout] delay=0 dirty=${!!state._layoutDirty} force=${forcePending} run=${runPending} retile=${retilePending} dt=${now - _lastRelayoutRunTs}`);
        }
        if (!state._layoutDirty && !forcePending && !runPending && (now - _lastRelayoutRunTs) < 80) {
            if (DEBUG) print("scheduleRelayout: coalesced immediate call");
            return;
        }
        wsMeta.run = false;
        relayoutTimer.stop();
        _lastRelayoutRunTs = now;
        reLayout();
        return;
    }

    relayoutTimer.stop();
    relayoutTimer.interval = delay;
    relayoutTimer.start();
}

function runContextActionForCurrentWorkspace(reason, options = {}) {
    const delay = (typeof options.delay === "number") ? options.delay : 100;
    const screenTarget = options.screen || getEffectiveScreenTarget();
    const forceRetile = !!options.force;
    const skipDirty = !!options.skipDirty;
    const forceRun = !!options.forceRun;
    const forceRetilePass = !!options.forceRetilePass;

    return withScreenContext(screenTarget, () => {
        const state = getCurrentState();
        if (!state) return;

        const autoMode = state.autoRetileMode ?? AUTO_RETILE_MODE;
        const autoEnabled = autoMode !== 0;
        if (DEBUG) {
            print(`[context] reason=${reason || "?"} delay=${delay} force=${forceRetile} forceRun=${forceRun} forceRetilePass=${forceRetilePass} skipDirty=${skipDirty} autoMode=${autoMode} canAuto=${canAutoRetile()} key=${getStateKey()}`);
        }

        if (state.maximizedAll) {
            maximizeAll();
            return;
        }

        if (state.kwinTilingActive) {
            applyKWinTiling({
                screen: screenTarget,
                desktop: workspace.currentDesktop,
                source: reason || "contextChanged"
            });
            return;
        }

        if (state.allFloating) {
            return;
        }

        if (!autoEnabled) {
            return;
        }

        if (canAutoRetile() || forceRetile) {
            if (forceRun && delay === 0) {
                getWS().layoutMeta.run = true;
            }
            if (forceRetilePass && delay === 0) {
                getWS().layoutMeta.retile = true;
            }
            if (delay === 0 && !skipDirty) {
                state._layoutDirty = true;
            }
            scheduleRelayout(delay);
        } else if (DEBUG) {
            print(`[context] skipped reason=${reason || "?"} (canAutoRetile=false and force=false)`);
        }
    });
}

function handleWindowContextChanged(client, reason, options = {}) {
    if (!client || client.deleted) return;

    const currentDeskId = getCurrentDesktopIdentifier();
    if (!windowOnCurrentDesktop(client, currentDeskId)) return;

    const currentActivity = workspace.currentActivity;
    if (!windowOnCurrentActivity(client, currentActivity)) return;

    const screenTarget = options.screen || getScreenForWindow(client);

    runContextActionForCurrentWorkspace(reason, {
        delay: (typeof options.delay === "number") ? options.delay : 100,
        screen: screenTarget
    });
}

// ──────────────────────────────────────────────────────────────
// DESKTOP & ACTIVITY CHANGE HANDLERS
// ──────────────────────────────────────────────────────────────
function onDesktopChanged() {
    const state = getCurrentState();
    if (state) {
        if (state.kwinTilingActive) {
            showOSDSafe("KWin tiling mode", "view-grid");
        } else if (state.allFloating) {
            showOSDSafe("Floating mode", "window");
        } else if (state.maximizedAll) {
            showOSDSafe("Maximize all", "window-maximize");
        } else {
            showOSDSafe("Tiling mode", "view-grid");
        }
    }

    if (!AUTO_LAYOUT_ON_DESKTOP_CHANGE) return;
    if (DEBUG) print(`[desktopChanged] key=${getStateKey()} trigger=${AUTO_LAYOUT_ON_DESKTOP_CHANGE}`);

    // Two-pass retile helps with KWin state settling right after desktop switch,
    // especially for sticky windows visible across multiple desktops.
    _visibleCache = null;
    runContextActionForCurrentWorkspace("desktopChangedImmediate", { delay: 0, force: true, forceRun: true, forceRetilePass: true, skipDirty: true });
    runContextActionForCurrentWorkspace("desktopChangedSettled", { delay: 120, force: true, skipDirty: true });
}

function onActivityChanged() {
    const state = getCurrentState();
    if (state) {
        if (state.kwinTilingActive) {
            showOSDSafe("KWin tiling mode", "view-grid");
        } else if (state.allFloating) {
            showOSDSafe("Floating mode", "window");
        } else if (state.maximizedAll) {
            showOSDSafe("Maximize all", "window-maximize");
        } else {
            showOSDSafe("Tiling mode", "view-grid");
        }
    }

    if (!AUTO_LAYOUT_ON_ACTIVITY_CHANGE) return;
    if (DEBUG) print(`[activityChanged] key=${getStateKey()} trigger=${AUTO_LAYOUT_ON_ACTIVITY_CHANGE}`);

    cachedScreenId = null;
    _visibleCache = null;
    runContextActionForCurrentWorkspace("activityChangedImmediate", { delay: 0, force: true, forceRun: true, forceRetilePass: true, skipDirty: true });
    runContextActionForCurrentWorkspace("activityChangedSettled", { delay: 120, force: true, skipDirty: true });
}

workspace.currentDesktopChanged.connect(onDesktopChanged);

if (workspace.currentActivityChanged) {
    workspace.currentActivityChanged.connect(onActivityChanged);
} else {
    if (DEBUG) print("KLeftHandTiler WARNING: currentActivityChanged signal not available – no auto-retile on activity switch");
}

function attachDesktopChangeHandler(client) {
    if (!client) return;
    if (typeof client.desktopsChanged === 'function' && !client._kwin_desktopChangeAttached) {
        client.desktopsChanged.connect(() => {

            if (!client || client.deleted) return;
            const sticky = isStickyWindow(client);
            const desktopRefs = getWindowDesktopRefs(client);
            if (!sticky && desktopRefs.length === 0) return;

            const newDeskIds = desktopRefs.map(d => getDesktopIdSafe(d)).filter(Boolean);

            // Sticky windows should not be treated as if they were "moved"
            // between desktops; they are projected into each desktop context.
            if (!sticky) {
                for (let key in states) {
                    const [, deskIdPart] = key.split(':');

                    if (newDeskIds.includes(deskIdPart)) continue;

                    const state = states[key];
                    if (state && state.lastTiledOrder) {
                        state.lastTiledOrder = state.lastTiledOrder.filter(w => w !== client);
                    }
                }
            }

            handleWindowContextChanged(client, "clientDesktopChanged", { delay: 0 });
        });

        client._kwin_desktopChangeAttached = true;
    }

    if (typeof client.activitiesChanged === 'function' && !client._kwin_activityChangeAttached) {
        client.activitiesChanged.connect(() => {
            if (!client || client.deleted) return;

            const sticky = isStickyWindow(client);
            const activityRefs = getWindowActivityRefs(client);

            // Sticky windows are not migrated between activities; they are visible in each.
            // Avoid treating this signal as a move event for them.
            if (sticky) return;

            if (!sticky && activityRefs.length > 0) {
                const newActivityIds = new Set(activityRefs.filter(Boolean));

                for (let key in states) {
                    const [actIdPart] = key.split(':');
                    if (newActivityIds.has(actIdPart)) continue;

                    const state = states[key];
                    if (state && state.lastTiledOrder) {
                        state.lastTiledOrder = state.lastTiledOrder.filter(w => w !== client);
                    }
                }
            }

            handleWindowContextChanged(client, "clientActivityChanged", { delay: 0 });
        });
        client._kwin_activityChangeAttached = true;
    }

    if (typeof client.frameGeometryChanged === 'function' && !client._kwin_screenChangeAttached) {
        client._kwin_lastScreenId = getScreenIdForTarget(getScreenForWindow(client));
        client.frameGeometryChanged.connect(() => {
            if (!client || client.deleted) return;

            const screenTarget = getScreenForWindow(client);
            const newScreenId = getScreenIdForTarget(screenTarget);
            const oldScreenId = client._kwin_lastScreenId;
            client._kwin_lastScreenId = newScreenId;

            if (oldScreenId === undefined || oldScreenId === newScreenId) return;

            const screens = workspace.screens || [];
            const oldScreenTarget =
                (oldScreenId >= 0 && oldScreenId < screens.length)
                    ? screens[oldScreenId]
                    : null;

            if (oldScreenTarget) {
                runContextActionForCurrentWorkspace("clientScreenChangedSource", {
                    delay: 0,
                    screen: oldScreenTarget
                });
            }

            handleWindowContextChanged(client, "clientScreenChanged", {
                delay: 0,
                screen: screenTarget
            });
        });
        client._kwin_screenChangeAttached = true;
    }
}

workspace.windowList().forEach(attachDesktopChangeHandler);

// ──────────────────────────────────────────────────────────────
// SPECIAL WINDOW IGNORE
// ──────────────────────────────────────────────────────────────


function isIgnoredSpecialWindow(client) {
    if (!client) return true;

    const rClass = (client.resourceClass || "").toLowerCase();
    const rName  = (client.resourceName || "").toLowerCase();
    const caption = (client.caption || "").trim();

    const w = client.frameGeometry ? client.frameGeometry.width : 0;
    const h = client.frameGeometry ? client.frameGeometry.height : 0;

        // if (DEBUG) {
        // print("---- NEW WINDOW DEBUG ----");
        // print("caption:", client.caption);
        // print("resourceClass:", client.resourceClass);
        // print("resourceName:", client.resourceName);
        // print("windowRole:", client.windowRole);
        // print("wmClass:", client.resourceClass);
        // print("minSize:", client.minSize ? client.minSize.width + "x" + client.minSize.height : "none");
        // print("minimumSize:", client.minimumSize ? client.minimumSize.width + "x" + client.minimumSize.height : "none");
        // print("geometry:", client.frameGeometry.width + "x" + client.frameGeometry.height);
        // print("---------------------------");
        // }


    if (isLauncher(client)) return true;

    if (!rClass && !rName && !caption) 
        return true;
        
    
    if (client.popup) 
        return true;

    // Plasma OSD-like helper windows can be reported as normal/managed in some setups.
    // Keep them out of tiling/cycling regardless of activity visibility.
    const role = (client.windowRole || "").toLowerCase();
    if (
        rClass === "org.kde.plasmashell" &&
        (role.includes("osd") || rName.includes("osd") || caption.toLowerCase().includes("osd"))
    ) {
        return true;
    }
     
    return false;
}

function isIgnoredTransientDialog(client) {
    if (!client) return true;

    const rClass = (client.resourceClass || "").toLowerCase();
    const rName  = (client.resourceName || "").toLowerCase();

    if (
        IGNORED_RESOURCE_CLASSES.some(cls => rClass.includes(cls)) ||
        IGNORED_RESOURCE_NAMES.some(name => rName.includes(name))
    ) {
        return true;
    }

  return !!(client.transient || client.modal);
}

workspace.windowAdded.connect(client => {
    if (!client) return;

    const clientLabel = client.caption || client.resourceClass || client.resourceName || "?";
    const addedDesktopId = getCurrentDesktopIdentifier();
    const addedActivityId = getCurrentActivityId();
    const addedScreen = getScreenForWindow(client);
    const addedScreenId = getScreenIdForTarget(addedScreen);

    if (DEBUG) {
        print(`[windowAdded] "${clientLabel}" screen=${addedScreenId} active=${getScreenIdForTarget(workspace.activeScreen)} desktop=${addedDesktopId} activity=${addedActivityId}`);
    }

    if (isIgnoredSpecialWindow(client)) {
        if (DEBUG) print("IGNORED WINDOW:", client.frameGeometry.width + "x" + client.frameGeometry.height);
        return;
    }

    if (IGNORE_TRANSIENT_WINDOWS && isIgnoredTransientDialog(client)) return;

    _visibleCache = null;

    trackMoveEvents(client);
    trackResizeEvents(client);
    trackWindowMinimizeRestore(client);
    trackWindowMaximizeRestoreKWin(client);
    attachDesktopChangeHandler(client);

    withScreenContext(addedScreen, () => {
        const state = getCurrentState();

        if (state.maximizedAll) {
            let maximizeTimer = new QTimer();
            maximizeTimer.singleShot = true;
            maximizeTimer.interval = 0;
            maximizeTimer.timeout.connect(() => {
                maximizeTimer.stop();

                const runtimeScreen = getScreenForWindow(client);
                withScreenContext(runtimeScreen, () => {
                    if (!client || client.deleted) return;
                    if (isIgnoredSpecialWindow(client)) return;
                    if (IGNORE_TRANSIENT_WINDOWS && isIgnoredTransientDialog(client)) return;
                    if (!getCurrentState().maximizedAll) return;

                    if (DEBUG) print(`[windowAdded/max] "${clientLabel}" maximize on screen=${runtimeScreen}`);

                    if (client.maximizable) {
                        client.setMaximize(true, true);
                    }
                });
            });
            maximizeTimer.start();
            return;
        }

        if (!AUTO_LAYOUT_ON_NEW_WINDOW) {
            if (DEBUG) print(`[windowAdded] auto-layout disabled "${clientLabel}"`);
            return;
        }

        if (!state.kwinTilingActive && !canAutoRetile()) {
            if (DEBUG) print(`[windowAdded] skip auto-retile "${clientLabel}" screen=${addedScreenId} kwin=${state.kwinTilingActive}`);
            debugWindowVisibility(client, "windowAdded/skip");
            return;
        }

        if (state.kwinTilingActive) {

            const root = workspace.rootTile(addedScreen, workspace.currentDesktop);

            if (root) {

                function collectLeaves(tile, out = []) {
                    if (tile.tiles && tile.tiles.length > 0) {
                        tile.tiles.forEach(child => collectLeaves(child, out));
                    } else {
                        out.push(tile);
                    }
                    return out;
                }

                const leaves = collectLeaves(root);
                const limit = leaves.length;

                const windows = getVisibleWindows()
                    .filter(w => w && !w.deleted && !w.minimized && !w.skipTaskbar);

                if (DEBUG) {
                    print(`[windowAdded/kwin] "${clientLabel}" screen=${addedScreenId}`);
                    print("windows:", windows.length);
                    print("tiles:", limit);
                }

                if (windows.length > limit) {

                    if (DEBUG) print("KWIN OVERFLOW → moving window");

                    getFloatingSet().add(client);
                    autoFloating.add(client);

                    moveWindowToOverflow(client, { source: "new_window" });

                    return;
                }

                if (AUTO_LAYOUT_ON_NEW_WINDOW) {
                    if (DEBUG) print("KWIN APPLY TILE");
                    applyKWinTiling({ screen: addedScreen, source: "windowAdded" });
                }

                return; 
            } else if (DEBUG) {
                print(`[windowAdded/kwin] no root on screen=${addedScreenId}`);
            }
        }

        // ─────────────────────────────────────────────
        // 🔥 FLOAT ALL MODE 
        // ─────────────────────────────────────────────
        if (getCurrentState().allFloating) {
            getFloatingSet().add(client);
            return;
        }


        {
            const { ordered } = getTiledOrder();

            if (ordered && ordered.length > MAX_WINDOWS) {

                if (DEBUG) print("EARLY OVERFLOW → skipping tiling");

                getFloatingSet().add(client);
                autoFloating.add(client);

                moveWindowToOverflow(client, { source: "new_window" });

                return;
            }
        }


        const startDesktop = getCurrentDesktopIdentifier();
        const startActivity = getCurrentActivityId();
        let startScreen = addedScreen;
        let startScreenId = addedScreenId;

        let timer = new QTimer();
        timer.interval = 0;

        timer.timeout.connect(() => {
            timer.stop();

            if (!client || client.deleted) return;
            if (isIgnoredSpecialWindow(client)) return;
            if (IGNORE_TRANSIENT_WINDOWS && isIgnoredTransientDialog(client)) return;

            const runtimeDesktop = getCurrentDesktopIdentifier();
            const runtimeActivity = getCurrentActivityId();
            if (runtimeDesktop !== startDesktop) {
                if (DEBUG) print(`ABORT windowAdded: desktop changed during timer ${startDesktop} -> ${runtimeDesktop}`);
                return;
            }
            if (runtimeActivity !== startActivity) {
                if (DEBUG) print(`ABORT windowAdded: activity changed during timer ${startActivity} -> ${runtimeActivity}`);
                return;
            }

            const runtimeScreen = getScreenForWindow(client);
            const runtimeScreenId = getScreenIdForTarget(runtimeScreen);
            if (runtimeScreenId !== startScreenId) {
                if (DEBUG) print(`[windowAdded] client screen changed ${startScreenId} -> ${runtimeScreenId}; switching context`);
                startScreen = runtimeScreen;
                startScreenId = runtimeScreenId;
            }

            withScreenContext(startScreen, () => {
                const { ordered, visible } = getTiledOrder();
                const usable = getUsableArea();

                let testOrdered = ordered.slice();
                if (!testOrdered.includes(client)) testOrdered.push(client);

                const testModel = buildAndValidateModel(testOrdered, usable);

                if (!testModel) {
                    if (DEBUG) print("MODEL INVALID → overflow");

                    getFloatingSet().add(client);
                    autoFloating.add(client);

                    moveWindowToOverflow(client, { source: "new_window" });

                    scheduleRelayout(0);
                    return;
                }

                getFloatingSet().delete(client);
                autoFloating.delete(client);

                let order = getLastTiledOrder();
                let orderChanged = false;
                if (!order.includes(client)) {
                    order.push(client);
                    setLastTiledOrder(order);
                    orderChanged = true;
                }

                const model = getLayoutModel();

                if (!model) {
                    clearLayoutModel();
                    forceRebuildModel();
                } else if (orderChanged) {
                    getCurrentState()._layoutDirty = true;
                } else if (DEBUG) {
                    print(`[windowAdded] duplicate add signal ignored for "${clientLabel}"`);
                }

                if (DEBUG) {
                    print(`[windowAdded] scheduleRelayout "${clientLabel}" screen=${startScreenId} visible=${visible.length}`);
                }

                if (!model || orderChanged) {
                    scheduleRelayout();
                }
            });
        });

        timer.start();
    });
});
// ──────────────────────────────────────────────────────────────
// WINDOW REMOVED
// ──────────────────────────────────────────────────────────────
function isWindowInLayoutModel(model, client) {

    if (!model || !client) return false;

    if (model.leftMain && model.leftMain.win === client) {
        return true;
    }

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
     // WORKSPACE STATE
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
     // EXTRA SAFETY: purge deleted entries from maps
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

    if (isLauncher(client)) return;
    if (isIgnoredSpecialWindow(client)) return;
    if (IGNORE_TRANSIENT_WINDOWS && isIgnoredTransientDialog(client)) return;
    if (DEBUG) print("handleWindowRemoved:", client.caption || client.resourceClass || "?");


    const model = getLayoutModel();
    if (!isWindowInLayoutModel(model, client)) {
        if (DEBUG) print("IGNORED REMOVE (not in model):", client.resourceClass);
        return;
    }

    // ─────────────────────────────────────────────
    // WAS THE WINDOW TILED
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
        const idx = ordered.indexOf(client);   
        if (idx !== -1) {
            lastFreedSlot = idx;
            if (DEBUG) print("SLOT FREED:", idx);
        }
    } catch (e) {}

    // ─────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────
    cleanupWindow(client);

    // ─────────────────────────────────────────────
    // RECLAIM AUTO-FLOATING
    // ─────────────────────────────────────────────
    const state = getCurrentState();
    const currentDeskId = getCurrentDesktopIdentifier();
    const floating = Array.from(getFloatingSet())
        .filter(w =>
            autoFloating.has(w) &&
            w &&
            !w.deleted &&
            windowOnCurrentDesktop(w, currentDeskId)
        );

    if (floating.length > 0 && AUTO_LAYOUT_ON_WINDOW_CLOSE && canAutoRetile()) {
        if (DEBUG) print(`Window removed → trying to reclaim ${floating.length} auto-floating windows`);

        const reclaimed = tryReclaimAutoFloatingWindows();

        if (reclaimed) {
            if (DEBUG) print("RECLAIM succeeded immediately after close");

            clearLayoutModel();
            forceRebuildModel();
            state._layoutDirty = true;

            scheduleRelayout(0);

            rebalanceOverflow();
        }
    }

    // ─────────────────────────────────────────────
    // RESET MODELU
    // ─────────────────────────────────────────────
    if (wasTiled) {
        if (DEBUG) print("WINDOW REMOVED → force rebuild");

        clearLayoutModel();
        forceRebuildModel();

        const state = getCurrentState();
        if (state) state._layoutDirty = true;
    }

    // ─────────────────────────────────────────────
    // AUTO-RELAYOUT
    // ─────────────────────────────────────────────
    if (AUTO_LAYOUT_ON_WINDOW_CLOSE && canAutoRetile()) {
      if (
        !isIgnoredSpecialWindow(client) &&
        (!IGNORE_TRANSIENT_WINDOWS || !isIgnoredTransientDialog(client))
      ) {
        scheduleRelayout();
        rebalanceOverflow();
      }
    }

}

if (typeof workspace.windowRemoved === 'function') {
    workspace.windowRemoved.connect(handleWindowRemoved);
} else if (typeof workspace.clientRemoved === 'function') {
    workspace.clientRemoved.connect(handleWindowRemoved);
}


function updateScreenCache() {
    const currentCount = workspace.screens?.length ?? 0;
    if (currentCount !== lastScreenCount) {
        if (DEBUG) print(`[SCREENS] count changed ${lastScreenCount} -> ${currentCount}`);
        cachedScreenId = null;
        _visibleCache = null;
        invalidateAreaCache();
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

if (workspace.currentActivityChanged) {
    workspace.currentActivityChanged.connect(invalidateAreaCache);
}

workspace.windowRemoved.connect(function(win) {
  if (!AUTO_REMOVE_EMPTY_DESKTOPS) return;
  cleanupEmptyDesktops();
});

workspace.currentDesktopChanged.connect(() => {
    _visibleCache = null;
    sanitizeFloatingBeforeTiling();
    rebalanceOverflow();
    scheduleApplyDefaultDesktopMode(0);
    if (AUTO_REMOVE_EMPTY_DESKTOPS) {
        cleanupEmptyDesktops();
    }
 //   scheduleRelayout();
});

const state = getCurrentState();
if (typeof state.kwinTilingActive === "undefined") state.kwinTilingActive = false;
if (typeof state.maximizedAll === "undefined") state.maximizedAll = false;
if (typeof state.allFloating === "undefined") state.allFloating = false;
if (typeof state._defaultModeApplied === "undefined") state._defaultModeApplied = false;

scheduleApplyDefaultDesktopMode(0);
