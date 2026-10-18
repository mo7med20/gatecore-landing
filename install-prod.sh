#!/usr/bin/env bash
#
# GateCore Production Installer
# Version: 1.0.0
# 
# Fresh-install candidate. Qualify the release artifact and deployment host
# before using it for a customer installation.
#
# Usage: sudo bash install-prod.sh
#
# Requirements:
#   - Ubuntu 24.04 LTS amd64 with systemd (first paid-pilot target)
#   - Root or sudo privileges
#   - Internet access (for downloading binaries)
#
set -euo pipefail

readonly VERSION="${GATECORE_VERSION:-1.0.0}"
readonly BINARY_URL="https://github.com/mo7med20/gatecore/releases/download/v${VERSION}/gatecore-linux-amd64"
readonly CHECKSUM_URL="${BINARY_URL}.sha256"
readonly BUNDLE_URL="${BINARY_URL}.sigstore.json"
readonly RECOVERY_URL="https://github.com/mo7med20/gatecore/releases/download/v${VERSION}/gatecore-recovery-linux-amd64"
readonly INSTALL_DIR="/opt/gatecore"
readonly CONFIG_DIR="/etc/gatecore"
readonly LIVE_CONFIG_DIR="${CONFIG_DIR}/live"
readonly LIVE_CONFIG="${LIVE_CONFIG_DIR}/config.json"
readonly STATE_DIR="/var/lib/gatecore"
readonly SERVICE_USER="gatecore"
readonly SERVICE_NAME="gatecore"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[���]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[���]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

check_paths_absent() {
    local path
    for path in "$@"; do
        if [[ -e "$path" || -L "$path" ]]; then
            log_error "Existing GateCore installation data found at $path"
            log_error "Fresh install refuses to replace binaries, configuration, secrets or state"
            return 1
        fi
    done
}

check_fresh_install() {
    check_paths_absent "$INSTALL_DIR" "$CONFIG_DIR" "$STATE_DIR" \
        "/etc/systemd/system/$SERVICE_NAME.service"
}

check_os() {
    local os_release_file="${OS_RELEASE_FILE:-/etc/os-release}"
    if [[ $(uname -s) != Linux || $(uname -m) != x86_64 ]]; then
        log_error "The installer requires Linux amd64"
        return 1
    fi
    if [[ ! -f "$os_release_file" ]]; then
        log_error "Cannot detect OS. Only Linux is supported."
        exit 1
    fi
    
    local os_id os_version pretty_name id_like
    os_id=$(grep '^ID=' "$os_release_file" | cut -d= -f2 | tr -d '"')
    os_version=$(grep '^VERSION_ID=' "$os_release_file" | cut -d= -f2 | tr -d '"')
    pretty_name=$(grep '^PRETTY_NAME=' "$os_release_file" | cut -d= -f2 | tr -d '"')
    id_like=$(grep '^ID_LIKE=' "$os_release_file" | cut -d= -f2 | tr -d '"' || true)

    local supported=false
    # Ubuntu 24.04 LTS
    if [[ "$os_id" == "ubuntu" && "$os_version" =~ ^24\.04 ]]; then
        supported=true
    # Debian 13 (Trixie)
    elif [[ "$os_id" == "debian" && "$os_version" =~ ^13 ]]; then
        supported=true
    # RHEL 9 and enterprise derivatives (Rocky Linux, AlmaLinux, CentOS Stream 9)
    elif [[ ("$os_id" =~ ^(rhel|rocky|almalinux|centos)$ || "$id_like" =~ (rhel|fedora)) && "$os_version" =~ ^9 ]]; then
        supported=true
    fi

    if [[ "$supported" != "true" ]]; then
        log_error "Unsupported host: $pretty_name; this installer is qualified for Ubuntu 24.04 LTS, Debian 13, and RHEL 9 (amd64)"
        return 1
    fi
    log_success "Detected OS: $pretty_name"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local has_local_assets=false
    if [[ -n "${GATECORE_LOCAL_ASSETS:-}" || -f "$script_dir/gatecore-linux-amd64" || -f "$script_dir/../bin/gatecore" || -f "$script_dir/bin/gatecore" ]]; then
        has_local_assets=true
    fi

    # Check curl (only required if downloading from remote)
    if [[ "$has_local_assets" != "true" ]]; then
        if ! command -v curl &> /dev/null; then
            missing+=("curl")
        fi
    fi
    
    local required_tools=(openssl sha256sum file awk mktemp install useradd systemctl)
    if [[ "$has_local_assets" != "true" ]]; then
        required_tools+=(cosign)
    fi

    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing+=("$tool")
        fi
    done
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required packages: ${missing[*]}"
        log_info "Install with:"
        if command -v apt &> /dev/null; then
            echo "  sudo apt install ${missing[*]}"
        elif command -v dnf &> /dev/null; then
            echo "  sudo dnf install ${missing[*]}"
        elif command -v yum &> /dev/null; then
            echo "  sudo yum install ${missing[*]}"
        fi
        exit 1
    fi
    if [[ ! -d /run/systemd/system ]]; then
        log_error "systemd is not running; use a supported systemd host for this installer"
        return 1
    fi
    
    log_success "All prerequisites met"
}

create_user() {
    log_info "Creating system user: $SERVICE_USER"
    
    if id "$SERVICE_USER" &>/dev/null; then
        log_warn "User $SERVICE_USER already exists"
    else
        local nologin_shell="/usr/sbin/nologin"
        if [[ ! -x "$nologin_shell" && -x /sbin/nologin ]]; then
            nologin_shell="/sbin/nologin"
        elif [[ ! -x "$nologin_shell" ]] && command -v nologin &>/dev/null; then
            nologin_shell=$(command -v nologin)
        fi
        useradd --system \
                --no-create-home \
                --shell "$nologin_shell" \
                --comment "GateCore Service User" \
                "$SERVICE_USER"
        log_success "Created user: $SERVICE_USER"
    fi
}

create_directories() {
    log_info "Creating directories..."
    
    mkdir -p "$INSTALL_DIR/bin"
    mkdir -p "$CONFIG_DIR/ssl"
    mkdir -p "$LIVE_CONFIG_DIR"
    mkdir -p "$STATE_DIR"
    chown -R "$SERVICE_USER:$SERVICE_USER" "$STATE_DIR"
    chmod 0700 "$STATE_DIR"
    
    chown root:"$SERVICE_USER" "$CONFIG_DIR" "$CONFIG_DIR/ssl"
    chmod 0750 "$CONFIG_DIR" "$CONFIG_DIR/ssl"
    chown "$SERVICE_USER:$SERVICE_USER" "$LIVE_CONFIG_DIR"
    chmod 0700 "$LIVE_CONFIG_DIR"
    
    log_success "Directories created"
    log_info "  Install: $INSTALL_DIR/bin"
    log_info "  Config:  $CONFIG_DIR"
    log_info "  State:   $STATE_DIR (0700 permissions)"
}

download_release_asset() {
    local asset="$1" staging_dir="$2" binary_url="$3" checksum_url="$4" bundle_url="$5"
    local staged_binary="$staging_dir/$asset"
    local staged_checksum="$staging_dir/$asset.sha256"
    local staged_bundle="$staging_dir/$asset.sigstore.json"

    # Check for local candidate before downloading
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local local_candidate=""
    if [[ -n "${GATECORE_LOCAL_ASSETS:-}" && -f "${GATECORE_LOCAL_ASSETS}/$asset" ]]; then
        local_candidate="${GATECORE_LOCAL_ASSETS}/$asset"
    elif [[ -f "$script_dir/$asset" ]]; then
        local_candidate="$script_dir/$asset"
    elif [[ -f "$script_dir/bin/$asset" ]]; then
        local_candidate="$script_dir/bin/$asset"
    elif [[ -f "$script_dir/../bin/$asset" ]]; then
        local_candidate="$script_dir/../bin/$asset"
    elif [[ "$asset" == "gatecore-linux-amd64" && -f "$script_dir/../bin/gatecore" ]]; then
        local_candidate="$script_dir/../bin/gatecore"
    elif [[ "$asset" == "gatecore-recovery-linux-amd64" && -f "$script_dir/../bin/gatecore-recovery" ]]; then
        local_candidate="$script_dir/../bin/gatecore-recovery"
    fi

    if [[ -n "$local_candidate" && -f "$local_candidate" ]]; then
        log_info "Using local asset for $asset: $local_candidate"
        if ! file -b "$local_candidate" | grep -q 'ELF 64-bit.*x86-64'; then
            log_error "Local binary verification failed: not a Linux amd64 ELF executable: $local_candidate"
            return 1
        fi
        cp "$local_candidate" "$staged_binary"
        log_success "Local asset $asset verified and staged"
        return 0
    fi

    log_info "Downloading GateCore v$VERSION before changing this host..."
    if ! curl -fsSL "$binary_url" -o "$staged_binary" ||
       ! curl -fsSL "$checksum_url" -o "$staged_checksum" ||
       ! curl -fsSL "$bundle_url" -o "$staged_bundle"; then
        log_error "Release binary, checksum or signature bundle is unavailable for v$VERSION"
        return 1
    fi

    # The release manifest must name exactly the binary being installed.
    if [[ $(wc -l < "$staged_checksum") -ne 1 ]] ||
       ! awk -v name="$asset" 'NF == 2 && length($1) == 64 && $1 ~ /^[0-9a-fA-F]+$/ && $2 == name { good = 1 } END { exit !good }' "$staged_checksum" ||
       ! (cd "$staging_dir" && sha256sum --check --status "$asset.sha256"); then
        log_error "Release checksum verification failed"
        return 1
    fi
    if ! file -b "$staged_binary" | grep -q 'ELF 64-bit.*x86-64'; then
        log_error "Binary verification failed: not a Linux amd64 ELF executable"
        return 1
    fi
    if ! cosign verify-blob "$staged_binary" \
        --bundle "$staged_bundle" \
        --certificate-identity "https://github.com/mo7med20/gatecore/.github/workflows/security.yml@refs/tags/v${VERSION}" \
        --certificate-oidc-issuer "https://token.actions.githubusercontent.com" >/dev/null; then
        log_error "Release signature or signing identity verification failed"
        return 1
    fi
    log_success "Checksum and release signature verified"
}

download_binary() {
    local staging_dir="$1" binary_url="${2:-$BINARY_URL}" checksum_url="${3:-$CHECKSUM_URL}"
    local bundle_url="${4:-$BUNDLE_URL}"
    download_release_asset "gatecore-linux-amd64" "$staging_dir" "$binary_url" "$checksum_url" "$bundle_url"
}

download_recovery() {
    local staging_dir="$1"
    download_release_asset "gatecore-recovery-linux-amd64" "$staging_dir" \
        "$RECOVERY_URL" "${RECOVERY_URL}.sha256" "${RECOVERY_URL}.sigstore.json"
}

install_downloaded_binary() {
    local staged_binary="$1"
    install -o root -g root -m 0755 "$staged_binary" "$INSTALL_DIR/bin/gatecore"
    log_success "Binary installed: $INSTALL_DIR/bin/gatecore"
}

install_recovery_binary() {
    install -o root -g root -m 0755 "$1" "$INSTALL_DIR/bin/gatecore-recovery"
}

generate_tls_certificates() {
    log_info "Generating self-signed TLS certificates..."
    
    openssl req -x509 \
        -nodes \
        -days 365 \
        -newkey rsa:4096 \
        -keyout "$CONFIG_DIR/ssl/key.pem" \
        -out "$CONFIG_DIR/ssl/cert.pem" \
        -subj "/CN=gatecore.local/O=GateCore/C=US" \
        2>/dev/null
    
    chown root:"$SERVICE_USER" "$CONFIG_DIR/ssl/"*.pem
    chmod 0640 "$CONFIG_DIR/ssl/key.pem"
    chmod 0644 "$CONFIG_DIR/ssl/cert.pem"
    
    log_success "TLS certificates generated"
    log_warn "NOTE: These are self-signed certificates for initial setup."
    log_info "Replace with CA-signed certificates for production:"
    echo "  Cert: $CONFIG_DIR/ssl/cert.pem"
    echo "  Key:  $CONFIG_DIR/ssl/key.pem"
}

generate_secrets() {
    log_info "Generating secure secrets..."
    
    # Generate AUTH_SECRET (32 bytes, base64)
    local auth_secret
    auth_secret=$(openssl rand -base64 32)
    
    # Generate LICENSE_SALT (32 bytes, base64)
    local license_salt
    license_salt=$(openssl rand -base64 32)
    
    # Store in environment file
    cat > "$CONFIG_DIR/secrets.env" <<EOF
# GateCore Secrets
# Generated: $(date -Iseconds)
# SECURITY: Keep this file secure (0600 permissions)

GATECORE_AUTH_SECRET=${auth_secret}
GATECORE_LICENSE_SALT=${license_salt}
GATECORE_STATE_DIR=${STATE_DIR}
GATECORE_PRODUCTION=true

# Optional: Vault integration
# GATECORE_VAULT_ADDR=https://vault.example.com:8200
# GATECORE_VAULT_TOKEN=***
EOF
    
    # systemd reads EnvironmentFile as the service manager before launching
    # the unprivileged process. Keep the source file root-owned.
    chown root:root "$CONFIG_DIR/secrets.env"
    chmod 0600 "$CONFIG_DIR/secrets.env"
    
    log_success "Secrets generated and stored: $CONFIG_DIR/secrets.env"
    log_warn "IMPORTANT: Admin password saved to /var/lib/gatecore/initial-admin-password — delete after first login"
}

render_config() {
    local output_path="$1" state_dir="$2" config_dir="$3"
    local proxy_address="${4:-0.0.0.0:4443}" api_address="${5:-127.0.0.1:9443}"
    cat > "$output_path" <<EOF
{
  "backends": [
    {
      "id": "backend-1",
      "address": "127.0.0.1:8080",
      "weight": 1,
      "enabled": true
    }
  ],

  "listen_address": "${proxy_address}",
  "api_address": "${api_address}",
  "dial_timeout_ms": 5000,
  "max_retries": 3,

  "tls_cert_file": "${config_dir}/ssl/cert.pem",
  "tls_key_file": "${config_dir}/ssl/key.pem",

  "platform": {
    "state": {
      "dir": "${state_dir}"
    }
  },

  "modules": {
    "security": {
      "production": true
    },
    "api_server": {
      "tls_enabled": true,
      "tls_cert_file": "${config_dir}/ssl/cert.pem",
      "tls_key_file": "${config_dir}/ssl/key.pem"
    },
    "traffic": {
      "max_connections": 512
    }
  }
}
EOF
}

create_config() {
    log_info "Creating configuration..."
    render_config "$LIVE_CONFIG" "$STATE_DIR" "$CONFIG_DIR"
    
    chown "$SERVICE_USER:$SERVICE_USER" "$LIVE_CONFIG"
    chmod 0600 "$LIVE_CONFIG"

    # License file — if provided alongside the installer, copy it to the state directory
    if [ -f "$(dirname "$0")/license.json" ]; then
        cp "$(dirname "$0")/license.json" "$STATE_DIR/license.json"
        chown "$SERVICE_USER:$SERVICE_USER" "$STATE_DIR/license.json"
        chmod 0600 "$STATE_DIR/license.json"
        log_success "License installed: $STATE_DIR/license.json"
    elif [ -f "./license.json" ]; then
        cp "./license.json" "$STATE_DIR/license.json"
        chown "$SERVICE_USER:$SERVICE_USER" "$STATE_DIR/license.json"
        chmod 0600 "$STATE_DIR/license.json"
        log_success "License installed: $STATE_DIR/license.json"
    else
        log_warn "No license.json found — GateCore will start in TRIAL mode (30 days)"
        log_info "Before activation, verify the supplied file with $INSTALL_DIR/bin/gatecore -verify-license /path/to/license.json"
        log_info "To activate later, install the signed license at $STATE_DIR/license.json"
        log_info "with owner $SERVICE_USER:$SERVICE_USER and mode 0600, then restart $SERVICE_NAME"
        log_warn "Do not re-run this fresh-only installer to activate a license"
    fi
    
    log_success "Configuration created: $LIVE_CONFIG"
}

create_systemd_service() {
    log_info "Creating systemd service..."
    
    cat > /etc/systemd/system/$SERVICE_NAME.service <<EOF
[Unit]
Description=GateCore Application Delivery Platform
Documentation=https://docs.gatecore.io
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER

EnvironmentFile=$CONFIG_DIR/secrets.env
ExecStart=$INSTALL_DIR/bin/gatecore --config $LIVE_CONFIG
Restart=on-failure
RestartSec=5s

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$STATE_DIR
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=true
RestrictRealtime=true
RestrictSUIDSGID=true
MemoryDenyWriteExecute=true
LockPersonality=true

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable $SERVICE_NAME
    
    log_success "Systemd service created and enabled"
}

start_service() {
    log_info "Starting GateCore..."
    
    systemctl start $SERVICE_NAME
    
    # Wait for service to be ready
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if systemctl is-active --quiet $SERVICE_NAME; then
            sleep 2
            if curl -kfs https://127.0.0.1:9443/version &>/dev/null; then
                log_success "GateCore started successfully"
                return 0
            fi
        fi
        sleep 1
        ((attempt++))
    done
    
    log_error "Failed to start GateCore after $max_attempts attempts"
    log_info "Check logs: journalctl -u $SERVICE_NAME -f"
    return 1
}

show_next_steps() {
    echo ""
    echo "=============================================="
    echo "  GateCore Installation Complete!"
    echo "=============================================="
    echo ""
    echo "Version: $VERSION"
    echo "Status:  $(systemctl is-active $SERVICE_NAME)"
    echo ""
    echo "Access Points:"
    echo "  Admin API:    https://127.0.0.1:9443"
    echo "  Health Check: https://127.0.0.1:9443/health"
    echo "  Metrics:      http://127.0.0.1:9100/metrics"
    echo "  Audit Log:    $STATE_DIR/audit.log"
    echo ""
    echo "Next Steps:"
    echo "  1. Read the initial admin password file:"
    echo "     sudo cat $STATE_DIR/initial-admin-password"
    echo ""
    echo "  2. Change default password immediately:"
    echo "     Use the authenticated dashboard at https://127.0.0.1:9443"
    echo ""
    echo "  3. Enable MFA for admin account:"
    echo "     See docs/INSTALLATION.md for instructions"
    echo ""
    echo "  4. Replace self-signed TLS certificates:"
    echo "     Cert: $CONFIG_DIR/ssl/cert.pem"
    echo "     Key:  $CONFIG_DIR/ssl/key.pem"
    echo ""
    echo "  5. Configure firewall rules:"
    echo "     Allow only the intended proxy port (4443/tcp)"
    echo "     The admin API (9443/tcp) is loopback-only; use an SSH tunnel for setup"
    echo "     Block: 8081, 9100, 9200 (loopback only)"
    echo ""
    echo "  6. Configure the real backend and allow intended client IP ranges:"
    echo "     The starter backend is 127.0.0.1:8080 and the ACL denies proxy traffic"
    echo "     until you add explicit allow rules in the dashboard or config."
    echo ""
    echo "Documentation: https://docs.gatecore.io"
    echo "Support:       support@gatecore.io"
    echo ""
    echo "=============================================="
}

uninstall() {
    log_warn "Uninstalling GateCore..."
    systemctl stop $SERVICE_NAME || true
    systemctl disable $SERVICE_NAME || true
    rm -f /etc/systemd/system/$SERVICE_NAME.service
    systemctl daemon-reload
    
    log_info "Removing binaries..."
    rm -f "$INSTALL_DIR/bin/gatecore"
    
    log_warn "Note: Configuration and state were NOT removed."
    log_info "To remove all data: sudo rm -rf $CONFIG_DIR $STATE_DIR"
    log_success "GateCore uninstalled successfully"
}

upgrade() {
    if [[ ! -f "$LIVE_CONFIG" || -L "$LIVE_CONFIG" || ! -d "$STATE_DIR" || -L "$STATE_DIR" ||
          ! -f "$CONFIG_DIR/secrets.env" || -L "$CONFIG_DIR/secrets.env" ||
          ! -f "$INSTALL_DIR/bin/gatecore" || -L "$INSTALL_DIR/bin/gatecore" ||
          ! -f "$INSTALL_DIR/bin/gatecore-recovery" || -L "$INSTALL_DIR/bin/gatecore-recovery" ]]; then
        log_error "Upgrade requires the new signed-install layout and an installed recovery binary"
        return 1
    fi
    if ! systemctl is-active --quiet "$SERVICE_NAME"; then
        log_error "GateCore must be active before upgrade; recover a stopped installation manually"
        return 1
    fi
    check_prerequisites
    INSTALL_STAGE=$(mktemp -d /tmp/gatecore-upgrade.XXXXXXXX)
    trap 'rm -rf -- "$INSTALL_STAGE"' EXIT
    download_binary "$INSTALL_STAGE"
    download_recovery "$INSTALL_STAGE"

    local old_schema new_schema
    old_schema=$("$INSTALL_DIR/bin/gatecore" -state-schema) || {
        log_error "Installed binary cannot report its state schema; use offline recovery"
        return 1
    }
    new_schema=$("$INSTALL_STAGE/gatecore-linux-amd64" -state-schema) || {
        log_error "New binary cannot report its state schema"
        return 1
    }
    if [[ ! "$old_schema" =~ ^[0-9]+$ || "$old_schema" != "$new_schema" ]]; then
        log_error "State schema is incompatible ($old_schema -> $new_schema); upgrade refused"
        return 1
    fi

    # The parent is controlled by root so the service account cannot replace
    # the secrets file. Read a single value; never execute file contents.
    if [[ -L "$CONFIG_DIR" || $(stat -c %u "$CONFIG_DIR") != 0 ]] ||
       [[ ! $(stat -c %a "$CONFIG_DIR") =~ ^(700|750)$ ]]; then
        log_error "Configuration parent must be root-owned and mode 0700 or 0750"
        return 1
    fi
    if [[ $(stat -c %u "$CONFIG_DIR/secrets.env") != 0 ]] ||
       [[ $(stat -c %a "$CONFIG_DIR/secrets.env") != 600 ]]; then
        log_error "Secret environment file must be root-owned and mode 0600"
        return 1
    fi
    local line auth_secret=""
    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ "$line" == GATECORE_AUTH_SECRET=* ]]; then
            if [[ -n "$auth_secret" ]]; then
                log_error "Duplicate GATECORE_AUTH_SECRET in secrets.env"
                return 1
            fi
            auth_secret="${line#GATECORE_AUTH_SECRET=}"
        fi
    done < "$CONFIG_DIR/secrets.env"
    if [[ ! "$auth_secret" =~ ^[A-Za-z0-9+/_=-]{32,}$ ]]; then
        log_error "A valid GATECORE_AUTH_SECRET is required for a recoverable upgrade"
        return 1
    fi
    export GATECORE_AUTH_SECRET="$auth_secret"

    local backup_parent=/var/backups/gatecore
    if [[ -L "$backup_parent" ]]; then
        log_error "Backup parent must not be a symlink"
        return 1
    fi
    install -d -o root -g root -m 0700 "$backup_parent"
    local backup_root
    backup_root=$(mktemp -d "$backup_parent/upgrade.XXXXXXXX")
    cp -p "$INSTALL_DIR/bin/gatecore" "$backup_root/gatecore.previous"
    cp -p "$INSTALL_DIR/bin/gatecore-recovery" "$backup_root/gatecore-recovery.previous"

    # All config/state writers are stopped before the authenticated snapshot.
    if ! systemctl stop "$SERVICE_NAME"; then
        log_error "Could not stop GateCore; binaries and state were not replaced"
        return 1
    fi
    if ! "$backup_root/gatecore-recovery.previous" backup -offline \
        -config "$LIVE_CONFIG" -state-dir "$STATE_DIR" \
        -out "$backup_root/snapshot" -secret-env GATECORE_AUTH_SECRET; then
        log_error "Offline backup failed; restarting the unchanged installation"
        systemctl start "$SERVICE_NAME" || true
        return 1
    fi

    local reason=""
    install_downloaded_binary "$INSTALL_STAGE/gatecore-linux-amd64" || reason="gateway binary installation failed"
    if [[ -z "$reason" ]]; then
        install_recovery_binary "$INSTALL_STAGE/gatecore-recovery-linux-amd64" || reason="recovery binary installation failed"
    fi
    if [[ -z "$reason" ]]; then
        systemctl start "$SERVICE_NAME" || reason="new service failed to start"
    fi
    if [[ -z "$reason" ]] && ! wait_for_health; then
        reason="new service did not become healthy"
    fi
    if [[ -n "$reason" ]]; then
        log_error "$reason; restoring the pre-upgrade snapshot"
        if ! rollback_upgrade "$backup_root"; then
            log_error "Automatic rollback failed. Service remains stopped; retain $backup_root for manual recovery"
        fi
        return 1
    fi
    log_success "Upgrade completed; retain the pre-upgrade backup at $backup_root until accepted"
}

wait_for_health() {
    local attempt
    for ((attempt=1; attempt<=30; attempt++)); do
        if systemctl is-active --quiet "$SERVICE_NAME" &&
           curl -kfsS --max-time 2 https://127.0.0.1:9443/health >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
    done
    return 1
}

rollback_upgrade() {
    local backup_root="$1" restore_root failed_state
    systemctl stop "$SERVICE_NAME" || return 1
    restore_root="${STATE_DIR}.rollback.$(date +%s).$$"
    failed_state="${STATE_DIR}.failed.$(date +%s).$$"
    if ! "$backup_root/gatecore-recovery.previous" restore -offline \
        -from "$backup_root/snapshot" -out "$restore_root" \
        -secret-env GATECORE_AUTH_SECRET; then
        return 1
    fi
    install -o root -g root -m 0755 "$backup_root/gatecore.previous" "$INSTALL_DIR/bin/gatecore" || return 1
    install -o root -g root -m 0755 "$backup_root/gatecore-recovery.previous" "$INSTALL_DIR/bin/gatecore-recovery" || return 1
    mv "$STATE_DIR" "$failed_state" || return 1
    if ! mv "$restore_root/state" "$STATE_DIR"; then
        mv "$failed_state" "$STATE_DIR" || true
        return 1
    fi
    chown -R "$SERVICE_USER:$SERVICE_USER" "$STATE_DIR" || return 1
    chmod 0700 "$STATE_DIR" || return 1
    install -o "$SERVICE_USER" -g "$SERVICE_USER" -m 0600 \
        "$restore_root/config.json" "$LIVE_CONFIG" || return 1
    systemctl start "$SERVICE_NAME" || return 1
    wait_for_health || return 1
    log_success "Previous binary, configuration and state restored; failed state retained at $failed_state"
}

main() {
    if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-rc\.[0-9]+)?$ ]]; then
        log_error "GATECORE_VERSION must be a version such as 1.0.0 or 1.0.0-rc.1"
        exit 1
    fi
    echo ""
    echo "=============================================="
    echo "  GateCore Production Installer v$VERSION"
    echo "=============================================="
    echo ""
    
    # Parse command-line arguments
    local action="install"
    if [[ $# -gt 0 ]]; then
        action="$1"
    fi
    
    case "$action" in
        install)
            check_root
            check_fresh_install
            check_os
            check_prerequisites
            INSTALL_STAGE=$(mktemp -d /tmp/gatecore-install.XXXXXXXX)
            trap 'rm -rf -- "$INSTALL_STAGE"' EXIT
            download_binary "$INSTALL_STAGE"
            download_recovery "$INSTALL_STAGE"
            create_user
            create_directories
            install_downloaded_binary "$INSTALL_STAGE/gatecore-linux-amd64"
            install_recovery_binary "$INSTALL_STAGE/gatecore-recovery-linux-amd64"
            generate_tls_certificates
            generate_secrets
            create_config
            create_systemd_service
            start_service
            show_next_steps
            ;;
        upgrade)
            check_root
            check_os
            upgrade
            ;;
        uninstall)
            check_root
            uninstall
            ;;
        *)
            log_error "Unknown action: $action"
            echo "Usage: $0 [install|upgrade|uninstall]"
            echo "  install   - Perform fresh installation (default)"
            echo "  upgrade   - Upgrade to new version (keeps config/state)"
            echo "  uninstall - Remove GateCore (keeps config/state)"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    main "$@"
fi
