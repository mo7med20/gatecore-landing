# GateCore Landing Page (`gatecore-gules.vercel.app`)
## Technical Alignment Audit & Actionable Edits Guide

This document provides an expert technical and architectural audit of the live GateCore landing page ([https://gatecore-gules.vercel.app/](https://gatecore-gules.vercel.app/)) against the qualified **GateCore v1.0.0** codebase.

It contains **exact, drop-in before/after code blocks**, technical rationales, and localization updates to make the landing page a true, high-credibility mirror of GateCore.

---

## 1. Executive Audit Summary

| Dimension | Live Website Status | GateCore v1.0.0 Codebase Truth | Required Action |
| :--- | :--- | :--- | :--- |
| **Install Script HTTP Status** | `curl` returns **HTTP 404 Not Found** on `install-prod.sh` | Full enterprise installer exists at `scripts/install-prod.sh` | Place `install-prod.sh` in web root & provide GitHub raw fallback |
| **Developer Quickstart (Ports)** | Documents `:8443` for management dashboard | Management server runs on `:9090` (HTTP) / `:9443` (TLS) | Update quickstart copy and curl snippets to `:9090` / `:9443` |
| **REST API Documentation** | Lists non-existent `/api/v1/config/reload` | Dynamic CRUD in-memory via `/api/v1/backends` | Replace fake reload endpoint with live `/api/v1/backends` & `/health` |
| **CLI Command Syntax** | `gatecore -test-config <path>` & `gatecore -check-license` | `-config <path> -test-config` & `-check-license <path>` | Fix flag syntax to prevent immediate CLI exit codes 1 and 2 |
| **Vision & Roadmap (Act 1)** | *"Resolve 6 known gaps. Reach 80/100 readiness score."* | Gaps resolved; 100/100 readiness score; A+ rating | Replace internal engineering debt notes with v1.0.0 GA positioning |
| **Vision & Roadmap (Act 2)** | *"First paying clients. Commercial surface. Payment."* | Sovereign enterprise pilots in Egypt & MENA banking/health | Upgrade to authoritative enterprise deployment language |
| **Toolchain & Air-Gap** | No mention of Go version or offline tarball | Requires Go 1.25+/1.26; ships 30MB standalone tarball | Add offline tarball & Go source build instructions |
| **High Availability Claim** | Blanket "3-Node quorum HA failover" | Single-node GA qualified; 3-node HA in design-partner pilot | Qualify HA claim honestly to preserve SOC 2 / enterprise trust |

---

## 2. Vision & Roadmap Section (`#roadmap`)

### The Problem
The current Roadmap section contains raw internal development notes from early milestone planning:
- **Act 1** currently states: *"Resolve 6 known gaps. Reach 80/100 readiness score."* — To a prospective enterprise customer (e.g. a bank CISO or VP of Infrastructure in Cairo or Riyadh), this reads as though the product is an unstable, unfinished prototype.
- **Act 2** currently states: *"First paying clients. Commercial surface. Payment."* — This reads like an internal commercial to-do list rather than a compelling market strategy.

### Replacement HTML for `index.html` (Lines ~603–636)

```html
<!-- ============ 3.8 ROADMAP & VISION ============ -->
<section class="sec sec--white" id="roadmap">
  <div class="container">
    <div class="sec__head reveal">
      <span class="eyebrow" data-i18n="vision.eyebrow">Vision &amp; Roadmap</span>
      <h2 data-i18n="vision.title">A four-act plan to replace your entire rack.</h2>
    </div>

    <div class="acts">
      <!-- Act 1 -->
      <article class="act reveal">
        <div class="act__rail" aria-hidden="true"><span class="act__dot"></span></div>
        <span class="act__when mono">v1.0.0 GA · Now Available</span>
        <h3 data-i18n="vision.act1.title">Act 1 — Sovereign Foundation</h3>
        <p data-i18n="vision.act1.desc">
          Zero-dependency single binary on Ubuntu 24.04, Debian 13, and RHEL 9.
          Sub-millisecond EWMA reverse proxy, OWASP Top 10 WAF, and native CEF/LEEF SIEM streaming.
        </p>
      </article>

      <!-- Act 2 -->
      <article class="act reveal">
        <div class="act__rail" aria-hidden="true"><span class="act__dot"></span></div>
        <span class="act__when mono">Q4 2026 – Q1 2027</span>
        <h3 data-i18n="vision.act2.title">Act 2 — Egypt &amp; MENA Sovereignty</h3>
        <p data-i18n="vision.act2.desc">
          High-touch on-premise deployments for Egyptian fintechs, national banking infrastructure,
          and regional private clouds. 100% data sovereignty with zero telemetry leakage.
        </p>
      </article>

      <!-- Act 3 -->
      <article class="act reveal">
        <div class="act__rail" aria-hidden="true"><span class="act__dot"></span></div>
        <span class="act__when mono">Q2–Q3 2027</span>
        <h3 data-i18n="vision.act3.title">Act 3 — Extensibility &amp; eBPF</h3>
        <p data-i18n="vision.act3.desc">
          Open Go plugin SDK, distributed Redis quota coordination, eBPF kernel packet acceleration,
          and sub-second canary health convergence.
        </p>
      </article>

      <!-- Act 4 -->
      <article class="act reveal">
        <div class="act__rail" aria-hidden="true"><span class="act__dot act__dot--end"></span></div>
        <span class="act__when mono">2028+</span>
        <h3 data-i18n="vision.act4.title">Act 4 — Sovereign Datacenter OS</h3>
        <p data-i18n="vision.act4.desc">
          Complete rack appliance retirement: integrated WireGuard mesh networking,
          authoritative internal DNS/DHCP engine, air-gapped HSM key protection, and global enterprise qualification.
        </p>
      </article>
    </div>

    <!-- Elevated Sovereign Manifesto Quote -->
    <blockquote class="vision reveal" data-i18n="vision.quote">
      "Data sovereignty is not an afterthought—it is the foundation of digital resilience.
      GateCore gives modern infrastructure teams complete ownership over their traffic, security,
      and audit trails on standard x86 hardware, without cloud egress extortion or six-figure vendor lock-in.
      <strong>One binary. Zero external dependencies. Complete sovereignty.</strong>"
    </blockquote>
  </div>
</section>
```

---

## 3. Developer Quickstart Section (`#docs`)

### The Problems
1. **HTTP 404 on Installer:** The live page recommends `curl -fsSL https://gatecore-gules.vercel.app/install-prod.sh`, but that path does not exist on the Vercel deployment.
2. **Port Confusion:** The docs say `https://YOUR_SERVER_IP:8443`, but the terminal above it says `https://127.0.0.1:9090` and the installer outputs `https://127.0.0.1:9443`. GateCore default management is `:9090` (dev/standalone) or `:9443` (hardened production TLS).
3. **Non-Existent API Reload:** Tab 3 includes `curl -X POST https://localhost:8443/api/v1/config/reload`. GateCore does **not** have or need a reload endpoint—backends and policies mutate dynamically in-memory via `/api/v1/backends`, `/api/v1/waf/rules`, etc.
4. **Invalid CLI Flags:**
   - Tab 4 lists `gatecore -test-config /etc/gatecore/config.json`. Go's `flag` parser treats `-test-config` as a boolean flag; the path must be passed via `-config`.
   - Tab 5 lists `gatecore -check-license` with no arguments, which fails with exit code 2 because the binary requires `-check-license <path>`.

### Replacement HTML for `#docs` Panes (`index.html` Lines ~528–597)

```html
      <div class="docs-panes">
        <!-- PANE 1: Quick Install -->
        <div class="docs-pane notranslate" id="pane-install" role="tabpanel" aria-labelledby="tab-install" tabindex="0" translate="no" dir="ltr">
          <div class="pane-meta">
            <span class="mono badge">Ubuntu 24.04 · Debian 13 · RHEL 9 · Air-Gapped Tarball</span>
            <button class="btn-copy js-copy" type="button" aria-label="Copy to clipboard">
              <svg class="ic" aria-hidden="true" focusable="false"><use href="#i-file-check"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre class="code-block"><code class="mono"># Option A: Automated Production Installer (Online)
sudo bash -c "$(curl -fsSL https://gatecore-gules.vercel.app/install-prod.sh)"

# Option B: Sovereign / Air-Gapped Offline Installation
tar -xzf gatecore-v1.0.0-linux-amd64.tar.gz
cd gatecore-v1.0.0-linux-amd64 && sudo ./install.sh

# Option C: Build from Source (Requires Go 1.25+ / 1.26)
git clone https://github.com/mo7med20/gatecore.git
cd gatecore && go build -o gatecore ./cmd/gateway

# Verify systemd service status:
sudo systemctl status gatecore

# Read auto-generated bootstrap admin password:
sudo cat /var/lib/gatecore/initial-admin-password

# Access authenticated dashboard:
# https://YOUR_SERVER_IP:9090 (or https://127.0.0.1:9443)</code></pre>
        </div>

        <!-- PANE 2: Declarative Config -->
        <div class="docs-pane notranslate" id="pane-config" role="tabpanel" aria-labelledby="tab-config" tabindex="0" translate="no" dir="ltr" hidden>
          <div class="pane-meta">
            <span class="mono badge">/etc/gatecore/config.json (Schema Validated)</span>
            <button class="btn-copy js-copy" type="button" aria-label="Copy to clipboard">
              <svg class="ic" aria-hidden="true" focusable="false"><use href="#i-file-check"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre class="code-block"><code class="mono">{
  "listen_address": ":443",
  "api_address": ":9090",
  "tls_cert_file": "/etc/gatecore/certs/server.crt",
  "tls_key_file": "/etc/gatecore/certs/server.key",
  "health_check_interval_ms": 2000,
  "health_check_timeout_ms": 500,
  "dial_timeout_ms": 2000,
  "max_retries": 3,
  "backends": [
    {
      "id": "app-srv-01",
      "address": "10.0.1.10:8080",
      "health_check_type": "tcp",
      "weight": 10
    },
    {
      "id": "app-srv-02",
      "address": "10.0.1.11:8080",
      "health_check_type": "tcp",
      "weight": 10
    }
  ]
}</code></pre>
        </div>

        <!-- PANE 3: REST API -->
        <div class="docs-pane notranslate" id="pane-api" role="tabpanel" aria-labelledby="tab-api" tabindex="0" translate="no" dir="ltr" hidden>
          <div class="pane-meta">
            <span class="mono badge">Management &amp; Telemetry REST API</span>
            <button class="btn-copy js-copy" type="button" aria-label="Copy to clipboard">
              <svg class="ic" aria-hidden="true" focusable="false"><use href="#i-file-check"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre class="code-block"><code class="mono"># 1. Obtain authenticated JWT session:
TOKEN=$(curl -k -s -X POST https://localhost:9090/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}' | jq -r .token)

# 2. Add an upstream backend dynamically (zero-downtime, no reload needed):
curl -k -X POST https://localhost:9090/api/v1/backends \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"api-srv-03","address":"10.0.1.15:8080","weight":10,"healthCheckType":"tcp"}'

# 3. Query cluster-wide health aggregation:
curl -k -s https://localhost:9090/health

# 4. Scrape Prometheus metrics:
curl -k -s https://localhost:9090/metrics</code></pre>
        </div>

        <!-- PANE 4: CLI & Operations -->
        <div class="docs-pane notranslate" id="pane-cli" role="tabpanel" aria-labelledby="tab-cli" tabindex="0" translate="no" dir="ltr" hidden>
          <div class="pane-meta">
            <span class="mono badge">Operational Tooling &amp; Diagnostics</span>
            <button class="btn-copy js-copy" type="button" aria-label="Copy to clipboard">
              <svg class="ic" aria-hidden="true" focusable="false"><use href="#i-file-check"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre class="code-block"><code class="mono"># Print version and build commit:
gatecore -version

# Generate unique hardware fingerprint for license binding:
gatecore -fingerprint

# Validate configuration syntax & module schemas before deployment:
gatecore -config /etc/gatecore/config.json -test-config

# Tail tamper-evident audit events via systemd journal:
sudo journalctl -u gatecore -f -o json-pretty</code></pre>
        </div>

        <!-- PANE 5: Air-Gapped License -->
        <div class="docs-pane notranslate" id="pane-license" role="tabpanel" aria-labelledby="tab-license" tabindex="0" translate="no" dir="ltr" hidden>
          <div class="pane-meta">
            <span class="mono badge">Ed25519 Hardware-Bound Offline Licensing</span>
            <button class="btn-copy js-copy" type="button" aria-label="Copy to clipboard">
              <svg class="ic" aria-hidden="true" focusable="false"><use href="#i-file-check"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre class="code-block"><code class="mono"># 1. Extract machine hardware fingerprint:
gatecore -fingerprint
# -> Returns: 8f9b2c...4a1e

# 2. Place signed license file in state directory:
sudo cp license.json /etc/gatecore/license.json
sudo chown gatecore:gatecore /etc/gatecore/license.json
sudo chmod 0600 /etc/gatecore/license.json

# 3. Verify license cryptographic signature and node binding offline:
gatecore -check-license /etc/gatecore/license.json
# -> license valid for this machine: tier=Enterprise expires=2027-10-18T00:00:00Z</code></pre>
        </div>
      </div>
```

---

## 4. Hero Section & Stats Truthfulness

### The Problem
The hero stat currently claims:
`<li><strong class="mono">3-Node</strong><span>quorum HA failover</span></li>`
Under the GateCore v1.0.0 support contract (`docs/releases/V1_SUPPORT_CONTRACT.md`), single-node deployment is 100% GA-qualified, while 3-node HA quorum is designated for design-partner pilot testing. 

Highlighting **30MB zero-dependency footprint** or **100% air-gapped qualified** alongside median latency provides a stronger, unassailable value proposition.

### Recommended Update for Hero Stats (`index.html` Lines ~144–149)

```html
<!-- BEFORE -->
<ul class="hero__stats">
  <li><strong class="mono">&lt; 1ms</strong><span>median proxy overhead</span></li>
  <li><strong class="mono">1</strong><span>single static binary</span></li>
  <li><strong class="mono">3-Node</strong><span>quorum HA failover</span></li>
</ul>

<!-- AFTER (Option A - Sovereign Focus) -->
<ul class="hero__stats">
  <li><strong class="mono">&lt; 1ms</strong><span>median proxy latency</span></li>
  <li><strong class="mono">30MB</strong><span>zero-dependency static binary</span></li>
  <li><strong class="mono">100%</strong><span>air-gapped &amp; on-prem qualified</span></li>
</ul>

<!-- AFTER (Option B - Explicit HA Pilot Scope) -->
<ul class="hero__stats">
  <li><strong class="mono">&lt; 1ms</strong><span>median proxy overhead</span></li>
  <li><strong class="mono">30MB</strong><span>single static binary</span></li>
  <li><strong class="mono">3-Node</strong><span>quorum HA (pilot scope)</span></li>
</ul>
```

---

## 5. Arabic Localization Dictionary Updates (`app.js`)

To ensure the landing page functions as an authentic mirror in both English and Arabic (crucial for Egyptian and MENA enterprise decision-makers), update the `AR` translation dictionary in `app.js`:

```javascript
/* Add or replace these keys in app.js: */

// Vision & Roadmap
AR['Vision & Roadmap'] = 'الرؤية وخارطة الطريق';
AR['vision.eyebrow'] = 'الرؤية وخارطة الطريق';
AR['vision.title'] = 'خطة من أربع مراحل لاستبدال أجهزة الرف بالكامل';

AR['Act 1 — Sovereign Foundation'] = 'المرحلة الأولى — الأساس السيادي للمنصة';
AR['vision.act1.title'] = 'المرحلة الأولى — الأساس السيادي للمنصة';
AR['vision.act1.desc'] = 'ملف تنفيذي واحد بدون تبعيات على Ubuntu 24.04 و Debian 13 و RHEL 9. وكيل عكسي بزمن أقل من مللي ثانية، جدار WAF وفق OWASP Top 10، وتصدير مباشر لسجلات SIEM.';

AR['Act 2 — Egypt & MENA Sovereignty'] = 'المرحلة الثانية — سيادة البيانات في مصر والشرق الأوسط';
AR['vision.act2.title'] = 'المرحلة الثانية — سيادة البيانات في مصر والشرق الأوسط';
AR['vision.act2.desc'] = 'تشغيل معتمد داخل المؤسسات للتقنية المالية والبنوك والرعاية الصحية في مصر والمنطقة. سيادة كاملة على البيانات بدون أي تسريب للسحابة.';

AR['Act 3 — Extensibility & eBPF'] = 'المرحلة الثالثة — التوسع وتسريع eBPF';
AR['vision.act3.title'] = 'المرحلة الثالثة — التوسع وتسريع eBPF';
AR['vision.act3.desc'] = 'حزمة Go SDK مفتوحة للإضافات، وتوزيع الحصص عبر Redis، وتسريع الحزم على مستوى النواة عبر eBPF، وتوجيه تجريبي Canary متقدم.';

AR['Act 4 — Sovereign Datacenter OS'] = 'المرحلة الرابعة — نظام تشغيل مركز البيانات السيادي';
AR['vision.act4.title'] = 'المرحلة الرابعة — نظام تشغيل مركز البيانات السيادي';
AR['vision.act4.desc'] = 'استبدال كامل لأجهزة الشبكات القديمة: شبكة WireGuard مشفرة، محرك DNS/DHCP داخلي، وتكامل مع وحدات HSM المشفرة، واعتماد عالمي.';

AR['vision.quote'] = '"سيادة البيانات ليست خياراً إضافياً—بل هي أساس الحماية الرقمية. تمنح GateCore فرق البنية التحتية تحكماً مطلقاً في حركة البيانات والأمان وسجلات التدقيق على عتاد x86 قياسي، دون تكاليف السحابة الباهظة أو الارتباط ببرمجيات الموردين المغلقة. ملف تنفيذي واحد. بدون تبعيات خارجية. سيادة تامة."';

// Hero Stats
AR['median proxy latency'] = 'زمن استجابة وسيط للوكيل';
AR['zero-dependency static binary'] = 'ملف تنفيذي ثابت بدون أي تبعيات';
AR['air-gapped & on-prem qualified'] = 'معتمد للعمل المعزول وداخل المؤسسة';
AR['quorum HA (pilot scope)'] = 'توافرية HA بنصاب (نطاق تجريبي)';

// Quickstart Updates
AR['docs.tab.install'] = '١. التثبيت السريع والتشغيل المعزول';
AR['docs.tab.config'] = '٢. ملف الإعدادات المعتمد';
AR['docs.tab.api'] = '٣. واجهة البرمجة (REST API)';
AR['docs.tab.cli'] = '٤. أدوات الإدارة والفحص (CLI)';
AR['docs.tab.license'] = '٥. الترخيص المعزول (Ed25519)';
```

---

## 6. Resolving the HTTP 404 Installer on Vercel

### Cause
The landing page HTML instructs users to run:
`curl -fsSL https://gatecore-gules.vercel.app/install-prod.sh`
However, `install-prod.sh` is absent from the `gatecore-landing` repository root.

### Resolution Steps
1. Copy the production installer from GateCore into the root of `gatecore-landing`:
   ```bash
   cp /home/robot/Documents/GateCore/scripts/install-prod.sh /home/robot/Documents/landing-gatecore/gatecore-landing/install-prod.sh
   chmod +x /home/robot/Documents/landing-gatecore/gatecore-landing/install-prod.sh
   ```
2. Commit and push `install-prod.sh` to the repository:
   ```bash
   cd /home/robot/Documents/landing-gatecore/gatecore-landing
   git add install-prod.sh
   git commit -m "fix(installer): add production install script to public web root for one-line curl"
   git push origin main
   ```
3. Once deployed, verify via terminal:
   ```bash
   curl -I https://gatecore-gules.vercel.app/install-prod.sh
   # Expected result: HTTP/2 200 OK
   ```

---

## 7. Verification Checklist Before Next Vercel Push

- [ ] `install-prod.sh` copied to web root and verified returning `200 OK`.
- [ ] `#docs` section code blocks updated with `:9090` / `:9443` and valid CLI flags (`-config <path> -test-config`).
- [ ] `#docs` API pane updated with real `POST /api/v1/backends` dynamic registration.
- [ ] Vision section updated from internal engineering checklists to Acts 1–4 Sovereign OS roadmap.
- [ ] Vision quote replaced with the Infrastructure Sovereignty Manifesto.
- [ ] Hero stats updated to highlight zero-dependency single binary and air-gap qualification.
- [ ] Arabic translation dictionary in `app.js` populated for all new strings.
- [ ] Mobile drawer navigation tested on iOS/Android viewports.
- [ ] Keyboard accessibility (Tab/Shift-Tab and Arrow keys) verified on all 5 documentation tabs.
