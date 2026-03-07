#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="KLeftHandTiler"
SCRIPT_DIR="$HOME/.local/share/kwin/scripts/$SCRIPT_NAME"
CONTENTS_DIR="$SCRIPT_DIR/contents"
SCRIPT_SOURCE="src"

help() {
    echo "Usage: $0 [status|install|remove|enable|disable|unload|package|help]"
    exit 0
}

build_package() {

    local version="$1"

    TMP_DIR=$(mktemp -d)
    PKG_DIR="$TMP_DIR/$SCRIPT_NAME"

    mkdir -p "$PKG_DIR/contents/code"
    mkdir -p "$PKG_DIR/contents/config"
    mkdir -p "$PKG_DIR/contents/ui"

    cp "$SCRIPT_SOURCE/metadata.json" "$PKG_DIR/metadata.json"
    cp "$SCRIPT_SOURCE/contents/code/main.js" "$PKG_DIR/contents/code/main.js"
    cp "$SCRIPT_SOURCE/contents/config/main.xml" "$PKG_DIR/contents/config/main.xml"
    cp "$SCRIPT_SOURCE/contents/ui/config.ui" "$PKG_DIR/contents/ui/config.ui"

    if [ -z "$version" ]; then
        OUT_FILE="${SCRIPT_NAME}.kwinscript"
    else
        OUT_FILE="${SCRIPT_NAME}-${version}.kwinscript"
    fi

    echo "Creating package: $OUT_FILE"

    (cd "$TMP_DIR" && zip -r "$OLDPWD/$OUT_FILE" "$SCRIPT_NAME" >/dev/null)

    rm -rf "$TMP_DIR"

    echo ""
    echo "Package created:"
    echo " $OUT_FILE"
    echo ""
}


[ $# -eq 0 ] && { help; exit 0; }

case "$1" in
    enable)
        kwriteconfig6 --file kwinrc --group Plugins --key "${SCRIPT_NAME}Enabled" true
        qdbus6 org.kde.KWin /KWin reconfigure
        exit 0
        ;;
    disable)
        kwriteconfig6 --file kwinrc --group Plugins --key "${SCRIPT_NAME}Enabled" false
        qdbus6 org.kde.KWin /KWin reconfigure
        exit 0
        ;;
    remove)
        rm -rf "$SCRIPT_DIR"
        qdbus6 org.kde.KWin /Scripting unloadScript "$SCRIPT_NAME"
        qdbus6 org.kde.kglobalaccel /component/kwin org.kde.kglobalaccel.Component.cleanUp
        qdbus6 org.kde.KWin /KWin reconfigure
        exit 0
        ;;
    unload)
        qdbus6 org.kde.KWin /Scripting unloadScript "$SCRIPT_NAME"
        exit 0
        ;;
    status)
        installed="no" ; enabled="no" ; loaded="no"
        [ -d "$SCRIPT_DIR" ] && installed="yes"
        if [ "$installed" = "yes" ]; then
            val=$(kreadconfig6 --file kwinrc --group Plugins --key "${SCRIPT_NAME}Enabled" 2>/dev/null || echo "false")
            [[ "$val" =~ ^[Tt][Rr][Uu][Ee]$ ]] && enabled="yes"
            [ "$(qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "$SCRIPT_NAME" 2>/dev/null)" = "true" ] && loaded="yes"
        fi
        echo "installed: $installed enabled: $enabled loaded: $loaded"
        exit 0
        ;;

    package)
        TMP_DIR=$(mktemp -d)
        PKG_DIR="$TMP_DIR/$SCRIPT_NAME"

        echo "Creating package structure..."

        mkdir -p "$PKG_DIR/contents/code"
        mkdir -p "$PKG_DIR/contents/config"
        mkdir -p "$PKG_DIR/contents/ui"

        cp "$SCRIPT_SOURCE/metadata.json" "$PKG_DIR/metadata.json"
        cp "$SCRIPT_SOURCE/contents/code/main.js" "$PKG_DIR/contents/code/main.js"
        cp "$SCRIPT_SOURCE/contents/config/main.xml" "$PKG_DIR/contents/config/main.xml"
        cp "$SCRIPT_SOURCE/contents/ui/config.ui" "$PKG_DIR/contents/ui/config.ui"

        OUT_FILE="${SCRIPT_NAME}.kwinscript"

        echo "Creating $OUT_FILE ..."
        (cd "$TMP_DIR" && zip -r "$OLDPWD/$OUT_FILE" "$SCRIPT_NAME" >/dev/null)

        rm -rf "$TMP_DIR"

        echo ""
        echo "Package created:"
        echo " $OUT_FILE"
        echo ""
        echo "Install in KDE:"
        echo " System Settings → Window Management → KWin Scripts → Install from File"
        echo ""

        exit 0
        ;;
       
     install) ;;
    *) help ;;
esac

echo "Creating directory structure..."
mkdir -p "$CONTENTS_DIR/code"
mkdir -p "$CONTENTS_DIR/config"
mkdir -p "$CONTENTS_DIR/ui"

echo "Creating contents/config/main.xml..."
cp "$SCRIPT_SOURCE/contents/config/main.xml" "$CONTENTS_DIR/config/main.xml"

echo "Creating contents/ui/config.ui..."
cp "$SCRIPT_SOURCE/contents/ui/config.ui"  "$CONTENTS_DIR/ui/config.ui"

echo "Creating contents/code/main.js..."
cp "$SCRIPT_SOURCE/contents/code/main.js"  "$CONTENTS_DIR/code/main.js"

echo "Creating metadata.json..."
cp "$SCRIPT_SOURCE/metadata.json"  "$SCRIPT_DIR/metadata.json"

echo "Refreshing KDE and KWin cache..."
kbuildsycoca6 --noincremental || true
qdbus6 org.kde.KWin /KWin reconfigure || true

echo ""
echo "KLeftHandTiler installation / update completed."
echo ""
echo "Next steps:"
echo " 1. System Settings → Window Management → KWin Scripts"
echo " → find 'KLeftHandTiler' → gear icon → configure"
echo " 2. After any setting change: disable and re-enable the script"
echo " 3. Check status: $0 status"
echo ""
echo "Quick restart after changes:"
echo " qdbus6 org.kde.KWin /KWin reconfigure"
echo " or toggle in KWin Scripts list"
echo ""
