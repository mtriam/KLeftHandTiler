# 🧩 KLeftHandTiler

![KDE Plasma](https://img.shields.io/badge/KDE-Plasma%206-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![KWin Script](https://img.shields.io/badge/KWin-script-orange)
![GitHub stars](https://img.shields.io/github/stars/mtriam/KLeftHandTiler?style=social)

**Advanced window tiling script for KWin (KDE Plasma 6+)**

Designed for **left-hand keyboard shortcuts**, **per-desktop/activity layouts**,
**drag-to-reorder windows**, and **smart auto-retile logic**.

---

# 🎬 Preview

![preview](docs/preview.gif)

Typical workflow:

• Tile windows with one shortcut
• Drag a window near another → reorder layout
• Switch desktops or activities → independent layouts
• Smart auto-retile keeps layouts consistent

---

# ✨ Features

### 🖥 Per-context layouts

Layouts are stored independently for every combination of:

```
activity + desktop + screen
```

Each workspace can therefore have a completely different layout.

---

### 🖱 Drag-to-reorder

Drag a tiled window close to another one:

```
window → drop near target → layout order updates
```

No manual layout editing required.

---

### ⚡ Smart auto-retile triggers

Optional automatic layout refresh when:

• new window opens
• window closes
• window minimizes / restores
• desktop changes
• activity changes

Auto-retile modes:

| Mode       | Behavior                        |
| ---------- | ------------------------------- |
| OFF        | never retile automatically      |
| Tiled only | skip when windows are maximized |
| Always     | force retile                    |

---

### 📐 Ratio presets

Cycle presets with a shortcut:

```
1.5 : 1.5
2   : 2
3   : 3
1   : 1
```

---

### 🧱 Flexible first row layout

Configurable main panel behavior:

• main window + side stack
• full width main row
• automatic layout

---

### ⌨ Smart shortcut behavior

Supports **double-tap actions**.

Examples:

• double press → minimize
• double press → fullscreen toggle

---

### 🚫 Window ignore system

Two independent ignore lists:

• **tiling ignore list**
• **window cycling ignore list**

Rules are based on **keywords in window titles**.

---

### 🎛 Visual tuning

Adjustable:

• window gaps
• screen edge margins

---

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

| Shortcut               | Action                                              |
| ---------------------- | --------------------------------------------------- |
| **Ctrl + Shift + →**   | Smart Tile / Cycle Layout / Double-tap Maximize All |
| **Ctrl + Shift + F1**  | Cycle ratio presets                                 |
| **Shift + Ctrl + Esc** | Rotate windows clockwise                            |
| **Ctrl + Esc**         | Cycle to next visible window                        |
| **Ctrl + →**           | Toggle maximize / double-tap → minimize             |
| **Ctrl + CapsLock**    | Double press → toggle fullscreen                    |
| **Ctrl + Shift + 1**   | Restore last minimized window from stack            |
| **Ctrl + Shift + F2**  | Auto-retile: OFF                                    |
| **Ctrl + Shift + F3**  | Auto-retile: Tiled only                             |
| **Ctrl + Shift + F4**  | Auto-retile: Always                                 |

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

# 🧯 Troubleshooting

### Layout doesn't update

Disable and enable the script again in **KWin Scripts**.

---

### Windows not tiling

Check:

• ignore lists
• transient window settings
• auto-retile mode

---

### Wrong monitor used

Restart KWin:

```
kwin --replace &
```

or log out and log in again.

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
