# 🧩 KLeftHandTiler

![KDE Plasma](https://img.shields.io/badge/KDE-Plasma%206-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![KWin Script](https://img.shields.io/badge/KWin-script-orange)
![GitHub stars](https://img.shields.io/github/stars/mtriam/KLeftHandTiler?style=social)

**Advanced window layout engine for KWin (KDE Plasma 6+)**

A tiling and workspace management script with  
**left-hand optimized shortcuts**,  
**independent layouts per desktop and activity**,  
**drag-and-drop reordering**,  
**layout snapshots and restoration**, and a  
**constraint-aware engine with live resize and predictable behavior**.

## 🚀 Whats' new in v.2.7

- Fixed KWin tiling order persistence after swap and desktop/activity switch: swapped window order is now preserved per context (activity + desktop + screen).
- Fixed KWin swap logic to use tile reassignment instead of floating-geometry fallback, preventing mode-like behavior regressions.
- Fixed relayout trigger flow on desktop/activity change so relayout passes are no longer skipped incorrectly by signature/coalescing logic.
- Fixed KWin maximize/unmaximize restore behavior:
    - unmaximize via script shortcut now reliably reapplies KWin tiling,
    - unmaximize via titlebar button now uses geometry-based restore detection and reapplies KWin tiling,
    - fullscreen restore remains supported.
- Fixed focus jumps after KWin tiling apply by restoring previously active window focus when possible.
- Fixed minimize/restore behavior in KWin mode: minimizing via titlebar button no longer switches mode to floating; KWin tiling is now reapplied instead of running generic relayout.
- Fixed KWin-to-normal-tiling transition via `Ctrl+Shift+``: first press now cleanly switches to normal tiling without unintended layout-mode cycling in OSD (no extra “Layout reset” step).
- Changed floating activation behavior: toggleFloatAll() now defaults to enable-only when called without an explicit argument (no implicit toggle).
- Updated floating shortcuts to match enable-only behavior:
  - Meta+Shift+F now always enables floating mode.
  - Shift+CapsLock double-tap also enables floating mode.
- Improved floating OSD behavior: invoking floating enable now always shows Floating mode OSD, even if floating mode is already active.
- Fixed Brave --ozone=x11 KWin jitter/resize-loop scenarios:
  improved max-restore fallback stability and transition handling,
  added short post-applyKWinTiling suppression window so internal KWin-apply geometry changes do not retrigger max-restore reapply loops.


---

## 🎬 Preview

![preview](docs/preview3.gif)

## ✨ Features

### 🧩 Modes

KLeftHandTiler supports multiple global window management modes:

- 🧱 **Normal Tiling Mode** (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>`</kbd>)  
  Standard dynamic tiling behavior with all layout features enabled.

- 🧩 **KWin Native Tiling Mode** (<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>`</kbd>)  
  Delegates tiling to KWin’s native tiling system.

- 🪟 **Float All Mode** (<kbd>Shift</kbd> + 2x <kbd>CapsLock</kbd>)  
  Toggles all windows into floating mode for free placement.

- 🖥️ **Maximize All Mode** (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + 2x <kbd>`</kbd>)  
  Maximizes all windows (single-window focus mode).

You can cycle through all modes using: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F1</kbd>

---

### 🧠 Layout Engine
- Model-based tiling (rows + precise ratios)
- Dynamic grid with intelligent first-row fitting
- Constraint-aware (respects minimum window sizes)
- Stable and predictable layouts
- **Independent layouts per monitor, desktop, and activity**

### 🔄 Live Resize
- Real-time layout updates during resize
- Directional resize (keyboard + mouse)
- Affects only adjacent windows

### ⌨️ Keyboard Control
- Directional **move** (reposition in order)
- Directional **swap** with neighbor
- Directional **resize** (affects the layout regardless of the active window when the action is unambiguous)
- Window rotation (cycle window positions) (<kbd>Shift</kbd> + <kbd>Ctrl</kbd> + <kbd>Esc</kbd>)

### 👁 Live Preview & Drag-to-Reorder
- Live preview while dragging windows
- Position-based logic (swap vs insert)
- Same behavior for keyboard and mouse

### 🧩 Layout Modes & Presets
- Adaptive layouts based on window count
- Left Master + Grid mode
- Top Master modes (1 / 2 / 3 top windows, available when applicable)
- Ratio presets (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F2</kbd>)
- KWin Native Tiling mode (<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>`</kbd>)
- Cycle between: Normal Tiling → KWin Tiling → Float All → Maximize All ()

### 💾 Layout Snapshots
- Save and restore tiling or floating layouts (3 slots)
- Quick cycle through saved layouts (<kbd>Ctrl</kbd> + <kbd>Meta</kbd> + <kbd>`</kbd>)
- Works with both tiled and floating mode
- Windows are matched to the layout (by window identity/name) whenever possible

### 🪟 Floating Windows
- Windows that don't fit are handled automatically (float / move to another or new desktop)
- Manual toggle floating for any window
- Auto-rejoin when space becomes available
- Float All mode with quick restore

### 🔄 Smart Auto-Retile
- Automatically retile on:
  - New window
  - Window close
  - Minimize / restore
  - Desktop / activity change
- Three modes: Off → Tiled only (when no window is maximized) → Always (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F3</kbd>)

### 📐 Ratios & Visual Tuning
- Configurable main window ratio (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F2</kbd>)
- Adjustable gaps and screen margins
- Border mode control (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F4</kbd>) 

### 🖥 Multi-Monitor, Desktop & Activity Support
- Completely independent tiling per monitor, desktop and activity
- Independent state (order, ratios, floating) for each screen

### 🛡️ Ignore System
- Two separate ignore lists (tiling & cycling)
- Matches caption, resourceClass, resourceName
- Automatic filtering of dialogs, popups, portals, launchers
- Optional auto-minimize for ignored windows

### 🔔 OSD Notifications
- Current layout name and ratio
- Mode changes and warnings

### ⚡ Performance & Stability
- Aggressive caching (geometry, visible windows, screen areas)
- Coalesced rendering
- Safe state cleanup
- Robust recovery from broken layouts

---

## ⌨ Default shortcuts

### Core Tiling & Layout

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>`</kbd> | Smart Tile / Cycle layouts |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>`</kbd> | Apply KWin native tiling mode |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F1</kbd> | Cycle Tile Modes (Tiling → KWin Tiling → Float All → Maximize All) |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F2</kbd> | Cycle main ratio presets |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F3</kbd> | Cycle auto-retile mode (Off / Tiled only / Always) |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F4</kbd> | Toggle border mode |
| <kbd>Shift</kbd> + <kbd>Ctrl</kbd> + <kbd>Esc</kbd> | Rotate windows (keep focus) |
| <kbd>Ctrl</kbd> + <kbd>Esc</kbd> | Cycle to next visible window |

### Window Movement & Resizing

| Shortcut | Action |
|----------|--------|
| <kbd>Meta</kbd> + <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> | Swap window with neighbor |
| <kbd>Meta</kbd> + <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> | Move window in direction |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> | Resize |
| <kbd>Meta</kbd> + <kbd>Alt</kbd> + <kbd>X</kbd> | Grow active window |
| <kbd>Meta</kbd> + <kbd>Alt</kbd> + <kbd>Z</kbd> | Shrink active window |

### Floating

| Shortcut | Action |
|----------|--------|
| 2x <kbd>CapsLock</kbd> | Toggle floating for active window |
| <kbd>Shift</kbd> + 2x <kbd>CapsLock</kbd><br>or<br><kbd>Meta</kbd> + <kbd>Shift</kbd> + <kbd>f</kbd> | Float All mode |
| <kbd>Meta</kbd> + <kbd>Ctrl</kbd> + <kbd>Space</kbd> | Tile all currently floating windows |

### Snapshots

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F5</kbd>/<kbd>F6</kbd>/<kbd>F7</kbd> | Save current layout to slot 1/2/3 |
| <kbd>Ctrl</kbd> + <kbd>Meta</kbd> + <kbd>`</kbd> | Cycle through saved layouts |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>F5</kbd>/<kbd>F6</kbd>/<kbd>F7</kbd> | Clear saved layout slot |

### Maximize & Minimize

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl</kbd> + <kbd>`</kbd> | Toggle maximize / minimize (double tap = minimize) |
| <kbd>Ctrl</kbd> + 2x <kbd>CapsLock</kbd>  | Toggle fullscreen |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>1</kbd> | Restore last minimized window |


### ⚠️ Plasma default shortcuts (no conflicts)

KLeftHandTiler shortcuts **do not override KDE Plasma defaults** and are meant to be used together.

Useful KDE Plasma shortcuts when using the script:

| Shortcut | Action |
|----------|--------|
| <kbd>Meta</kbd> + <kbd>Ctrl</kbd> + <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> | Switch desktop |
| <kbd>Meta</kbd> + <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> | Move window to desktop |
| <kbd>Meta</kbd> + <kbd>Alt</kbd> + <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> | Focus window |
| <kbd>Meta</kbd> + <kbd>A</kbd> | Switch activities |
| <kbd>Meta</kbd> + <kbd>T</kbd> | Adjust layout (window count, sizes, and arrangement) using KWin tiling |

---

## ⚙️ Configuration

You can configure the script in:

**System Settings → Window Management → KWin Scripts → KLeftHandTiler → Configure**

---

### ⚠️ Important Note
After changing any setting, you **must disable and then re-enable** the script for the changes to take effect.

---

### Default Behavior (New Desktop / Startup)

- **Default mode** — Tiled / KWin Tiling / Float All / Maximize All
- **Default ratio preset** — 1.5 : 1.5, 2.0 : 2.0, 3.0 : 3.0, 1.0 : 1.0
- **Auto-retile mode** — Off / Tiled only / Always

### Decorations

- **Decoration mode**:
  - Tiled windows without borders, floating with borders (default)
  - All windows have borders
  - No borders at all

### Layout Limits

- **Maximum tiled windows** per screen (default: 5)
- **Overflow behavior** when limit is exceeded:
  - Keep as floating
  - Smart move to least busy desktop (or create new)
  - Smart move forward only
  - Move to empty desktop (or create new)
- **Auto-remove empty desktops** created by the script

### Auto-Retile Triggers

- New window
- Window closed
- Window minimized
- Window restored
- Desktop switch
- Activity switch

### Visual Settings

- **Gap between windows** (default: 4 px)
- **Screen margin** (default: 4 px)
- **Double-tap threshold** (for CapsLock / Ctrl shortcuts)

### Ignore System

Two separate lists:

- **Ignore from tiling** — windows will not be tiled (can be auto-minimized)
- **Ignore from cycling** — windows excluded from `Ctrl+Esc` cycling

Matching is done against:
- Window title (caption)
- `resourceClass` (WM_CLASS)
- `resourceName`

Additional options:
- **Ignore transient windows** (dialogs, popups, tooltips)
- **Minimize ignored windows**

### Snapshot Behavior

- Minimize windows that exceed layout after restoring from snapshot

## 📦 Installation

### Recommended (.kwinscript)

1. Download release  
2. Open KWin Scripts  
3. Install from file  
4. Enable  

#### 💾 Persistent Snapshots (optional)

1. Download the file `kleft-save-install.sh` from the KLeftHandTiler repository, make the file executable and run
   ```
   wget https://raw.githubusercontent.com/mtriam/KLeftHandTiler/main/kleft-save-install.sh && 
   chmod +x kleft-save-install.sh && ./kleft-save-install.sh
   ```
---

### Manual

    git clone https://github.com/mtriam/KLeftHandTiler.git
    cd KLeftHandTiler
    chmod +x KLeftHandTiler.sh
    ./KLeftHandTiler.sh install
---

## 🗑 Uninstall

### Manually remove from KWin
1. Open **System Settings**
2. Go to **Window Management → KWin Scripts**
3. Find **KLeftHandTiler**
4. Disable or remove it
5. Remove kleft-save.sh from: **System Settings → Startup and Shutdown → Desktop Session → Run Command Before Logout**

or

### Uninstall using the script
```bash
./KLeftHandTiler.sh uninstall
```
---

## 🛠 Management

    ./KLeftHandTiler.sh status
    ./KLeftHandTiler.sh enable
    ./KLeftHandTiler.sh disable
    ./KLeftHandTiler.sh remove
    ./KLeftHandTiler.sh unload

---

## 🧠 Development

    src/
      metadata.json
      contents/
        code/main.js
        config/main.xml
        ui/config.ui

Installed to:
    ~/.local/share/kwin/scripts/KLeftHandTiler


    kleft-save.sh

Installed to:
    ~/.local/bin/kleft-save.sh

Shutdown hook (Plasma):
    ~/.config/plasma-workspace/shutdown/kleft-save.sh  → symlink to: 
    ~/.local/bin/kleft-save.sh

---

## 🎞 Optional: Smooth window animations

KLeftHandTiler does not provide animations by itself (by design — for performance and stability).

If you want smooth animated transitions when windows resize or move, you can install the external KWin effect:

👉 https://github.com/peterfajdiga/kwin4_effect_geometry_change

---

### 📦 Installation

Download and extract the effect:

wget https://github.com/peterfajdiga/kwin4_effect_geometry_change/releases/download/v1.5/kwin4_effect_geometry_change_1_5.tar.gz
 -O /tmp/kwin4_effect_geometry_change_1_5.tar.gz && tar -xvzf /tmp/kwin4_effect_geometry_change_1_5.tar.gz -C ~/.local/share/kwin/effects/

 ---

### ⚙️ Enable the effect

1. Open:

   System Settings → Window Management → Desktop Effects

2. Find:

   **"Geometry Change"**

3. Enable it ✅

---



## 🤖 About

Developed with AI assistance.  
Final design and decisions by the author.

---

## 📜 License

GPL-3.0

---

## 👤 Author

triamond
