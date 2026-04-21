#!/usr/bin/env sh
set -e

BIN_DIR="$HOME/.local/bin"
KDE_SHUTDOWN_DIR="$HOME/.config/plasma-workspace/shutdown"

SAVE_SCRIPT="$BIN_DIR/kleft-save.sh"
SYMLINK="$KDE_SHUTDOWN_DIR/kleft-save.sh"

# 🔴 REMOVE MODE
if [ "$1" = "--remove" ]; then

  echo "➡️ Removing symlink..."
  rm -f "$SYMLINK" || true

  echo "➡️ Removing script..."
  rm -f "$SAVE_SCRIPT" || true

  echo "✅ REMOVED"
  exit 0
fi

# 🟢 INSTALL MODE
echo "➡️ Creating directories..."
mkdir -p "$BIN_DIR"
mkdir -p "$KDE_SHUTDOWN_DIR"

echo "➡️ Creating save script..."
cat > "$SAVE_SCRIPT" << 'EOF'
#!/usr/bin/env sh

journalctl --user -u plasma-kwin_wayland -r -b \
| grep -o 'SLOT_[123]={.*}' \
| awk -F= '!seen[$1]++' \
| tac \
| while IFS='=' read -r k v; do
    kwriteconfig6 --file kwinrc --group "Script-KLeftHandTiler" --key "$k" "$v"
  done

echo "[kleft-save] DONE"
EOF

chmod +x "$SAVE_SCRIPT"

echo "➡️ Creating symlink..."
ln -sf "$SAVE_SCRIPT" "$SYMLINK"

echo "✅ INSTALLED"
