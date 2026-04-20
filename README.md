# 🧩 KLeftHandTiler

![KDE Plasma](https://img.shields.io/badge/KDE-Plasma%206-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![KWin Script](https://img.shields.io/badge/KWin-script-orange)
![GitHub stars](https://img.shields.io/github/stars/mtriam/KLeftHandTiler?style=social)

**Window tiling script for KWin (KDE Plasma 6+)**

Designed for **left-hand keyboard shortcuts**, **per-desktop/activity layouts**,  
**drag-to-reorder windows**, and a **constraint-aware layout engine with live resize**.

---

## 🚀 What's new in v2.3

- 🖥️ **Full Multi-Monitor Support** — each monitor now has completely independent tiling state (layout, ratios, window order, floating windows, etc.)
- 💾 **Snapshots / Saved Layouts** — save and restore tiling or floating layouts (Ctrl+Shift+F5, F6, F7 + Cycle with Ctrl+Meta+`)
- 🧩 **KWin Native Tiling Mode** — new mode accessible via Ctrl+Shift+F1 (cycles: Normal Tiling → KWin Tiling → Float All → Maximize All)
- 🔄 **Window Rotation (All Modes)** — circular motion, keeps focus (Shift+Ctrl+Esc)
- 🌊 **Improved Overflow Behavior** — multiple configurable overflow modes (float, move to other workspace, create new, minimize)
- ⌨️ **Keyboard Shortcuts**:
  - `Ctrl+Shift+F1` — Cycle tile modes (Normal / KWin / Float / Maximize)
  - `Ctrl+Shift+F2` — Cycle main ratio presets
  - `Ctrl+Shift+F3` — Cycle auto-retile mode
- 🧱 **Better First Row Handling** — removed problematic Auto Grid mode that caused duplication; more predictable and stable layouts
- 🪟 **Dialogs & Transient Windows** — significantly improved ignoring of dialogs, tooltips, and portal windows

### 🛠️ Fixes

- 🖥️ **Major Multi-Monitor Fix** — tiling now works correctly and independently on every screen
- 🔀 **Fixed window leakage** between monitors
- 🧠 **Fixed layout state sharing** between screens
- 🪟 **Improved handling of dialogs and popups** (much fewer unwanted tiled dialogs)
- ⚡ **Better stability** when adding/removing windows on secondary monitors
- 🚀 **Various performance and cache improvements**

---

## 🎬 Preview

![preview](docs/preview3.gif)

---

## 🧭 Typical workflow

1. Open windows  
2. Press **Ctrl + Shift + `** → tile / cycle layout  
3. Drag window → drop near another → reorder  
4. Resize window → layout updates in real-time  
5. Press **Ctrl + Shift + `** → cycle layouts  
6. Close or minimize → layout auto-adjusts  
7. Press **Ctrl + Esc** → cycle focus  
8. Switch desktop/activity → layout restored  

Optional:
- Double-tap **Ctrl + Shift + `** → maximize all  
- Press **Ctrl + Shift + F1** → change main ratio  

---

## ✨ Features

### 🧠 Layout Engine
- Model-based tiling (rows + precise ratios)
- Dynamic grid with intelligent first-row fitting
- Constraint-aware (respects minimum window sizes)
- Stable and predictable layouts
- **Per-monitor independent layouts** (full multi-monitor support)

### 🔄 Live Resize
- Real-time layout updates during resize
- Directional resize (keyboard + mouse)
- Affects only adjacent windows
- Precise edge detection with no jitter

### ⌨️ Keyboard Control
- Directional **move** (reposition in order)
- Directional **swap** with neighbor
- Directional **resize**
- Window **rotation** (Shift+Ctrl+Esc)
- Consistent behavior across all layouts and monitors

### 👁 Live Preview & Drag-to-Reorder
- Live preview while dragging windows
- Position-based logic (swap vs insert)
- Same behavior for keyboard and mouse
- Hysteresis for stability (no flicker)

### 🧩 Layout Modes & Presets
- Adaptive layouts based on window count
- Left Master + Grid mode
- Ratio presets (Ctrl+Shift+F2)
- **KWin Native Tiling mode** (Ctrl+Shift+F1)
- Cycle between: Normal Tiling → KWin Tiling → Float All → Maximize All

### 💾 Layout Snapshots
- Save and restore tiling or floating layouts (3 slots)
- Quick cycle through saved layouts
- Works with both tiled and floating mode

### 🪟 Floating Windows
- Windows that don't fit are automatically floated
- Manual toggle floating for any window
- Auto-rejoin when space becomes available
- Float All mode with quick restore

### 🔄 Smart Auto-Retile
- Automatically retile on:
  - New window
  - Window close
  - Minimize / restore
  - Desktop / activity change
- Three modes: Off → Tiled only → Always (Ctrl+Shift+F3)

### 📐 Ratios & Visual Tuning
- Configurable main window ratio
- Adjustable gaps and screen margins
- Border mode control (tiled/floating/all)

### 🖥 Multi-Monitor Support
- Completely independent tiling per monitor
- Correct window detection across screens
- Proper usable area calculation per monitor
- Independent state (order, ratios, floating) for each screen

### 🛡️ Ignore System (very accurate)
- Two separate ignore lists (tiling & cycling)
- Matches caption, resourceClass, resourceName
- Automatic filtering of dialogs, popups, portals, launchers
- Optional auto-minimize for ignored windows

### 🔔 OSD Notifications
- Current layout name and ratio
- Mode changes and warnings
- Throttled to avoid spam

### ⚡ Performance & Stability
- Aggressive caching (geometry, visible windows, screen areas)
- Coalesced rendering
- Safe state cleanup
- Robust recovery from broken layouts

---

## ⌨ Default shortcuts

## Keyboard Shortcuts

### Core Tiling & Layout

| Shortcut                  | Action                                      |
|--------------------------|---------------------------------------------|
| `Ctrl + ~`               | Smart Tile / Cycle layouts                  |
| `Ctrl + Shift + F1`      | Cycle Tile Modes (Tiling → KWin Tiling → Float All → Maximize All) |
| `Ctrl + Shift + F2`      | Cycle main ratio presets                    |
| `Ctrl + Shift + F3`      | Cycle auto-retile mode (Off / Tiled only / Always) |
| `Ctrl + Shift + F4`      | Toggle border mode                          |
| `Shift + Ctrl + Esc`     | Rotate windows clockwise (keep focus)       |
| `Ctrl + Esc`             | Cycle to next visible window                |

### Window Movement & Resizing

| Shortcut                    | Action                            |
|----------------------------|-----------------------------------|
| `Meta + Ctrl + Alt + ←→↑↓` | Swap window with neighbor         |
| `Meta + Alt + Shift + ←→↑↓`| Move window in direction          |
| `Ctrl + Shift + ←→↑↓`      | Resize                            |
| `Meta + Alt + X`           | Grow active window                |
| `Meta + Alt + Z`           | Shrink active window              |

### Floating & Snapshots

| Shortcut                  | Action                                      |
|--------------------------|---------------------------------------------|
| `CapsLock` (double tap)  | Toggle floating for active window           |
| `Shift + CapsLock` (double tap) | Toggle Float All mode                   |
| `Meta + Ctrl + Space`    | Tile all currently floating windows         |
| `Ctrl + Shift + F5/F6/F7`| Save current layout to slot 1/2/3           |
| `Ctrl + Meta + ``        | Cycle through saved layouts                 |
| `Ctrl + Shift + Alt + F5/F6/F7` | Clear saved layout slot              |

### Maximize & Minimize

| Shortcut             | Action                                      |
|---------------------|---------------------------------------------|
| `Ctrl + ``          | Toggle maximize / minimize (double tap = minimize) |
| `Ctrl + CapsLock` (double) | Toggle fullscreen                    |
| `Ctrl + !`          | Restore last minimized window               |

### KWin Integration

| Shortcut         | Action                          |
|------------------|---------------------------------|
| `Ctrl + Alt + `` | Apply KWin native tiling mode   |

### ⚠️ Plasma default shortcuts (no conflicts)

KLeftHandTiler shortcuts are designed to **avoid conflicts with KDE Plasma defaults**.

The following system shortcuts remain available:

| Shortcut | Action |
|----------|--------|
| Meta+Ctrl+Arrows | Switch desktop |
| Meta+Ctrl+Shift+Arrows | Move window to desktop |
| Meta+Alt+Arrows | Focus window |

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

---

### Manual

    git clone https://github.com/mtriam/KLeftHandTiler.git
    cd KLeftHandTiler
    chmod +x KLeftHandTiler.sh
    ./KLeftHandTiler.sh install

---

## 🗑 Uninstall

    ./KLeftHandTiler.sh uninstall

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
