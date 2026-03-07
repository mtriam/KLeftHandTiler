# 🧩 KLeftHandTiler

![KDE Plasma](https://img.shields.io/badge/KDE-Plasma%206-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![KWin Script](https://img.shields.io/badge/KWin-script-orange)
![GitHub stars](https://img.shields.io/github/stars/mtriam/KLeftHandTiler?style=social)

**Window tiling script for KWin (KDE Plasma 6+)**

Designed for **left-hand keyboard shortcuts**, **per-desktop/activity layouts**,
**drag-to-reorder windows**, and **smart auto-retile logic**.

---
# 🎬 Preview

![preview](docs/preview2.gif)


**Typical workflow overview:**

1. Open 2–5 windows  
2. Press **Ctrl + Shift + `** → windows snap into an intelligent **main + secondary** layout (with configurable main window ratio)  
3. Drag one window close to another → drop it → the **layout order updates automatically** (drag-to-reorder)  
4. Press **Ctrl + Shift + `** again → cycles to the next sensible layout for the current number of windows  
   (examples: main + two stacked | main + two side-by-side | three columns | main + 2×2 grid etc.)  
5. Close or minimize a window → layout **automatically adjusts** (when auto-retile is enabled)  
6. Press **Ctrl + Esc** → switch focus to the next visible window (in roughly spatial order)  
7. Switch desktop or activity → you return to the **previously saved, independent layout** for that context

**Key actions:**
- Smart Tile / Cycle  
  **Ctrl + Shift + `**  → single press = tile or cycle layout, double-tap = maximize all windows  
- Drag-to-reorder  
  Grab window titlebar → drop near another tiled window → order updates  
- Cycle main ratio presets  
  **Ctrl + Shift + F1** → 1.5:1 → 2:1 → 3:1 → 1:1 and back  
- Rotate windows (keep focus)  
  **Ctrl + Shift + Esc** → clockwise rotation of tiled order  
- Switch to next visible window  
  **Ctrl + Esc** → cycles focus to the next window among visible / tiled ones (sorted roughly by angle/position)

For smoother tiling animations, install the recommended addon:  [kwin4_effect_geometry_change](https://github.com/peterfajdiga/kwin4_effect_geometry_change)



---

# ✨ Features

### 🖥 Per-context layouts

Layouts are stored independently for every combination of:

```
activity + desktop + screen
```

Each workspace can therefore have a completely different layout.

---

### ⚡ Smart auto-retile triggers

Optional automatic layout refresh when:

• new window opens
• window closes
• window minimizes / restores
• desktop changes
• activity changes

### Auto-retile modes:

| Mode       | Shortcut             | Behavior                                              |
| ---------- | -------------------- | ----------------------------------------------------- |
| OFF        | **Ctrl + Shift + F2**| never retile automatically                            |
| Tiled only | **Ctrl + Shift + F3**| skip retile if at least one window is maximized (default) |
| Always     | **Ctrl + Shift + F4**| force retile                                          |

---

### 🧱 Adaptive layouts

Multiple tiling layouts depending on the **number of open windows**.

Cycle layouts with **Ctrl + Shift + `**

Examples:

• **2 windows**
  - left / right
  - top / bottom

• **3 windows**
  - main window + two stacked
  - one on top + two below
  - two on top + one below

...

Layouts automatically adapt to the number of windows while keeping a clear **main / secondary window structure**.

---


### 📐 Ratio presets

Cycle layout ratio presets using the shortcut **Ctrl + Shift + F1** (by default).  

These numbers define the **size of the main window relative to the other windows** in both **width and height**:

```
1.5; 2; 3; 1
```

Use this to quickly adjust the layout balance between the main window and side stack.

---

### 🚫 Window ignore system

Two independent ignore lists:

• **tiling ignore list**
• **window cycling ignore list**

Rules are based on **keywords in window titles**.


### 🖱 Drag-to-reorder

Drag a tiled window close to another one:

```
window → drop near target → layout order updates
```

No manual layout editing required.


### 🎛 Visual tuning

Adjustable:

• window gaps
• screen edge margins


### 📄 Smart dialog handling

Small transient windows such as:

```
settings dialogs
print dialogs
tool windows
```

can be automatically minimized during tiling.

---

# ⌨ Default shortcuts

## 📐 Tiling

| Shortcut              | Action                                      |
|-----------------------|---------------------------------------------|
| **Ctrl + Shift + `**  | Smart Tile · Cycle layout (when tiled) · double-tap → maximize all |
| **Ctrl + Shift + F1** | Cycle ratio presets                          |
| **Ctrl + Shift + Esc**| Rotate windows                               |                                      |

## 🪟 Window control

| Shortcut             | Action                                   |
|----------------------|------------------------------------------|
| **Ctrl + `**         | Toggle maximize / double-tap → minimize  |
| **Ctrl + CapsLock**  | Double-tap → toggle fullscreen           |
| **Ctrl + Esc**       | Cycle to next visible window             |
| **Ctrl + Shift + 1** | Restore last minimized window from stack |

## 🔁 Auto-retile modes

| Shortcut             | Action                                                      |
|----------------------|-------------------------------------------------------------|
| **Ctrl + Shift + F2**| Auto-retile: OFF                                            |
| **Ctrl + Shift + F3**| Auto-retile: Tiled only (skip if a window is maximized)     |
| **Ctrl + Shift + F4**| Auto-retile: Always                                         |

Shortcuts can be reassigned in:

```
System Settings → Shortcuts → KWin Scripts
```

---

# 📦 Installation (recommended)

### Recommended (install from `.kwinscript`)

1. Download the latest `.kwinscript` package from the repository.

2. Open **System Settings → Window Management → KWin Scripts**.

3. Click **Install from File…**

4. Select the downloaded file:

```
KLeftHandTiler.kwinscript
```

5. Enable **KLeftHandTiler** in the scripts list.

6. Apply the changes.

The script will now be active.

**Optional:** for smooth tiling animations, install [kwin4_effect_geometry_change](https://github.com/peterfajdiga/kwin4_effect_geometry_change).


### Alternative (manual install)

Clone the repository:

```
git clone https://github.com/mtriam/KLeftHandTiler.git
cd KLeftHandTiler
```

Run installer:

```
chmod +x KLeftHandTiler.sh
./KLeftHandTiler.sh install
```

---

## 🗑 Uninstall

You can remove the script either using the installer script or from KDE settings.

#### Using the script

```
./KLeftHandTiler.sh uninstall
```

#### From KDE settings

1. Open **System Settings → Window Management → KWin Scripts**.
2. Disable **KLeftHandTiler**.
3. Click **Remove** to uninstall the script.

---

# 🛠 Management commands

The installer script can manage the installation:

```
./KLeftHandTiler.sh status
./KLeftHandTiler.sh enable
./KLeftHandTiler.sh disable
./KLeftHandTiler.sh remove
./KLeftHandTiler.sh unload
```

---

# 🧠 Development

Project structure:

```
src/
 ├ metadata.json
 └ contents/
     ├ code/main.js
     ├ config/main.xml
     └ ui/config.ui
```

Installer script copies these files to:

```
~/.local/share/kwin/scripts/KLeftHandTiler
```

---

# 🤖 About this project

This project was developed with assistance from **AI tools**
to accelerate development, testing and documentation.

Human design, testing and final decisions remain under the project author.

---

# 📜 License

GPL-3.0

---

# 👤 Author

**triamond**

Inspired by the KDE tiling script community.
