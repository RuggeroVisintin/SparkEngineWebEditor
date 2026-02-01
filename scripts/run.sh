#!/bin/bash
set -e

# This script is maintained for backward compatibility
# It now delegates to Vite or Jest depending on the command

case "$1" in
  start)
    vite
    ;;
  build)
    vite build
    ;;
  test)
    shift
    jest --config jest.unit.config.js --watch "$@"
    ;;
  *)
    vite "$@"
    ;;
esac