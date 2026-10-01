#!/usr/bin/env bash
# ==============================================================================
# SpecterOS v7.4 - Enterprise-Grade Termux Automated Installer
# Maintainer: Senior DevOps & Termux Platform Engineer
# File: install.sh
# ==============================================================================

set -o pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${GREEN}${BOLD}=== SpecterOS v7.4 Automated Installation Pipeline ===${NC}"
echo "--------------------------------------------------------"

# 1. Resolve Target Directory
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${HOME}/.specteros_dir"

# Storage Location Validation for Android/Termux
# Android's emulated shared storage (/storage/emulated/0 or /sdcard) does NOT support POSIX symlinks!
case "$CURRENT_DIR" in
  /storage/emulated/*|/sdcard|/sdcard/*)
    echo -e "${RED}[!] FATAL: Project is located in Android shared storage: ${CURRENT_DIR}${NC}"
    echo -e "${YELLOW}[!] Android's emulated shared storage does NOT support POSIX symlinks required by Node packages.${NC}"
    echo -e "${YELLOW}[!] Installing node_modules here will fail with 'EACCES: permission denied, symlink'.${NC}"
    echo -e "${CYAN}[*] Solution: Move the project into Termux internal private storage (~ / \$HOME):${NC}"
    echo -e "    1. mkdir -p ~/projects"
    echo -e "    2. cp -r \"${CURRENT_DIR}\" ~/projects/"
    echo -e "    3. cd ~/projects/$(basename "${CURRENT_DIR}")"
    echo -e "    4. ./install.sh"
    exit 1
    ;;
esac

echo -e "${CYAN}[*] Registering Enclave Directory:${NC} ${CURRENT_DIR}"
echo "$CURRENT_DIR" > "$CONFIG_FILE"

# 2. Detect System Environment
if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ] || [ -n "$PREFIX" ]; then
  PLATFORM="termux"
elif grep -qi "microsoft" /proc/version 2>/dev/null; then
  PLATFORM="wsl"
elif [ "$(uname -s 2>/dev/null)" = "Darwin" ]; then
  PLATFORM="macos"
else
  PLATFORM="linux"
fi

echo -e "${CYAN}[*] Target Platform:${NC} ${PLATFORM^^}"

# 3. Install System Packages
echo -e "${YELLOW}[1/4] Installing Required Core Packages (Node.js LTS, Git, Curl, Unzip)...${NC}"
if [ "$PLATFORM" = "termux" ]; then
  pkg update -y
  pkg install -y nodejs-lts git curl unzip
elif [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "wsl" ]; then
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y && sudo apt-get install -y nodejs npm git curl unzip || true
  fi
fi

# 4. Check Node Version
NODE_VER="$(node -v 2>/dev/null || echo 'Unknown')"
NPM_VER="$(npm -v 2>/dev/null || echo 'Unknown')"
echo -e "${GREEN}[✔] Node.js: ${NODE_VER} | NPM: ${NPM_VER}${NC}"

NODE_MAJOR="$(echo "$NODE_VER" | sed -E 's/^v//' | cut -d'.' -f1)"
if [ -n "$NODE_MAJOR" ] && [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}[!] Error: Node.js version must be >= 18.0.0.${NC}"
  if [ "$PLATFORM" = "termux" ]; then
    echo -e "${PURPLE}[+] Re-installing latest nodejs-lts...${NC}"
    pkg install -y nodejs-lts
  fi
fi

# 5. Dependency Installation & Cache Pre-seeding
echo -e "${YELLOW}[2/4] Resolving NPM Dependencies for SpecterOS (clean install)...${NC}"
cd "$CURRENT_DIR" || exit 1
mkdir -p .cache logs

# Clean npm install - NO --force, NO --legacy-peer-deps
npm install --no-audit --no-fund
INSTALL_STATUS=$?

if [ $INSTALL_STATUS -ne 0 ]; then
  echo -e "${RED}[!] FATAL: 'npm install' failed with exit code $INSTALL_STATUS.${NC}"
  echo -e "${RED}[!] Aborting installation without corrupted fallback.${NC}"
  exit $INSTALL_STATUS
fi

# Compute and cache package hash (package.json + package-lock.json)
compute_hash() {
  local files=()
  [ -f "package.json" ] && files+=("package.json")
  [ -f "package-lock.json" ] && files+=("package-lock.json")

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "${files[@]}" 2>/dev/null | sha256sum | awk '{print $1}'
  elif command -v md5sum >/dev/null 2>&1; then
    md5sum "${files[@]}" 2>/dev/null | md5sum | awk '{print $1}'
  else
    wc -c "${files[@]}" 2>/dev/null | awk '{sum+=$1} END {print sum}'
  fi
}

compute_hash > .cache/package.hash
echo -e "${GREEN}[✔] NPM dependencies verified and cached.${NC}"

# 6. Global Binary Registration
echo -e "${YELLOW}[3/4] Installing global 'alikakai' executable...${NC}"
chmod +x "$CURRENT_DIR/alikakai"
chmod +x "$CURRENT_DIR/start.sh"
chmod +x "$CURRENT_DIR/install.sh"

PREFIX_BIN="${PREFIX:-/data/data/com.termux/files/usr}/bin"

if [ -d "$PREFIX_BIN" ]; then
  cp "$CURRENT_DIR/alikakai" "$PREFIX_BIN/alikakai"
  chmod +x "$PREFIX_BIN/alikakai"
  echo -e "${GREEN}[✔] Global command installed to: ${PREFIX_BIN}/alikakai${NC}"
elif [ -d "/usr/local/bin" ] && [ -w "/usr/local/bin" ]; then
  cp "$CURRENT_DIR/alikakai" "/usr/local/bin/alikakai"
  chmod +x "/usr/local/bin/alikakai"
  echo -e "${GREEN}[✔] Global command installed to: /usr/local/bin/alikakai${NC}"
fi

# 7. Verification & Immediate Hand-off
echo -e "${YELLOW}[4/4] Installation Verification Completed Successfully!${NC}"
echo "--------------------------------------------------------"
echo -e "${BOLD}${GREEN}✔ SPECTEROS TERMINAL READY.${NC}"
echo -e "You can now run the complete OS console from ${BOLD}ANY${NC} directory by typing:"
echo ""
echo -e "      ${BOLD}${CYAN}alikakai${NC}"
echo ""
echo "--------------------------------------------------------"
echo -e "${YELLOW}[*] Launching SpecterOS now...${NC}"
sleep 1

exec "$CURRENT_DIR/alikakai"
