#!/usr/bin/env sh
journalctl --user -u plasma-kwin_wayland -r -b \
| grep -o 'SLOT_[123]={.*}' \
| awk -F= '!seen[$1]++' \
| tac \
| while IFS='=' read -r k v; do
    kwriteconfig6 --file kwinrc --group "Script-KLeftHandTiler" --key "$k" "$v"
  done && echo SAVED
