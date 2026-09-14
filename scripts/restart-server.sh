#!/usr/bin/env bash
# Stop the demo server without matching this script's own command line.
# `ss`/`lsof` are not present in every container, so walk /proc instead.
set -u
for pid in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$'); do
  [ -r "/proc/$pid/cmdline" ] || continue
  cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null) || continue
  case "$cmd" in
    *next-server*) kill "$pid" 2>/dev/null || true ;;
  esac
done
sleep 2
exit 0
