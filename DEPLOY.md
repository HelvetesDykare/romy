# Romy — Production Deployment Guide

OVHcloud VPS (Paris) · Mistral AI · JusticeLibre · Let's Encrypt

---

## Prerequisites

- OVHcloud account, **Paris (GRA) region**
- Domain name with DNS you control (e.g. `romy.example.fr`)
- Mistral API key — [console.mistral.ai](https://console.mistral.ai)
- Optional: PISTE credentials — [piste.api.gouv.fr](https://piste.api.gouv.fr) for Légifrance + Judilibre direct tools (JusticeLibre covers 95 % of use cases without them)

---

## 1. Provision the VPS

Order a **Starter** or **Value** VPS on OVHcloud, **Paris (GRA)** region:

| Resource | Minimum | Recommended |
|---|---|---|
| vCPU | 1 | 2 |
| RAM | 2 GB | 4 GB |
| SSD | 20 GB | 40 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

> **No GPU needed.** Romy calls the Mistral API remotely — all AI inference runs on Mistral's EU infrastructure.

Once provisioned, note your server's public IP (`SERVER_IP`).

---

## 2. Harden the Server

SSH in as root, then run the following in order.

**Create a non-root deploy user:**

```bash
adduser deploy
usermod -aG sudo deploy
```

**Configure UFW (allow only SSH, HTTP, HTTPS):**

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

**Install and configure fail2ban:**

```bash
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

**Disable root SSH login** — edit `/etc/ssh/sshd_config`:

```bash
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh
```

> From this point on, SSH as `deploy` using `sudo` for privileged commands.

---

## 3. Install Runtime Dependencies

SSH in as `deploy`.

**Node.js 20 LTS (via NodeSource):**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # should print v20.x.x
```

**PostgreSQL 14:**

```bash
sudo apt-get install -y postgresql-14 postgresql-client-14
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**Create the database and run the migration:**

```bash
sudo -u postgres createdb romy
sudo -u postgres psql -d romy -f /opt/romy/backend/migrations/000_one_shot_schema.sql
```

> The migration is idempotent — safe to re-run. The `language` column is created inside `CREATE TABLE user_profiles`; the `ALTER TABLE … ADD COLUMN IF NOT EXISTS` at the end will simply skip on a fresh install.

---

## 4. Deploy the App

**Clone the repository:**

```bash
sudo mkdir -p /opt/romy
sudo chown deploy:deploy /opt/romy
git clone https://github.com/HelvetesDykare/romy /opt/romy
cd /opt/romy
```

**Install backend dependencies and build:**

```bash
cd /opt/romy/backend
npm ci
npm run build          # tsc → dist/
```

**Install frontend dependencies and build:**

```bash
cd /opt/romy/frontend
npm ci --legacy-peer-deps
npm run build          # next build → .next/
```

**Configure backend environment:**

```bash
cd /opt/romy/backend
cp .env.example .env
nano .env
```

Fill in every variable. Inline guidance:

```env
PORT=3001
FRONTEND_URL=https://yourdomain.com

# PostgreSQL — created in step 3
DATABASE_URL=postgres://postgres:CHANGE_ME@localhost:5432/romy

# JWT — generate a strong secret
# openssl rand -base64 48
JWT_SECRET=CHANGE_ME

# Download token signing — generate a separate secret
# openssl rand -hex 32
DOWNLOAD_SIGNING_SECRET=CHANGE_ME

# S3-compatible object storage (optional — see step 8)
# Leave blank to use local filesystem (backend/uploads/)
STORAGE_ENDPOINT_URL=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_BUCKET_NAME=

# Gemini / Anthropic — not required for sovereign deployment
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Mistral — French company, EU infrastructure
# Get your key at https://console.mistral.ai
VLLM_BASE_URL=https://api.mistral.ai/v1
VLLM_API_KEY=CHANGE_ME
VLLM_MAIN_MODEL=mistral-large-latest
VLLM_LIGHT_MODEL=mistral-small-latest

# JusticeLibre MCP — free, no auth required
MCP_SERVERS=[{"name":"justicelibre","url":"https://justicelibre.org/mcp"}]

# PISTE — optional, for Légifrance + Judilibre native tools
# Register free at https://piste.api.gouv.fr
PISTE_CLIENT_ID=
PISTE_CLIENT_SECRET=
```

**Configure frontend environment:**

```bash
cd /opt/romy/frontend
cp .env.local.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
```

---

## 5. Systemd Service for the Backend

**Create the unit file:**

```bash
sudo nano /etc/systemd/system/romy-backend.service
```

```ini
[Unit]
Description=Romy Backend (Express/Node.js)
After=network.target postgresql.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/romy/backend
ExecStart=/usr/bin/node dist/index.js
EnvironmentFile=/opt/romy/backend/.env
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=romy-backend

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable romy-backend
sudo systemctl start romy-backend
sudo systemctl status romy-backend
```

Expected output includes:
```
Active: active (running)
romy-backend[…]: Romy backend running on port 3001
romy-backend[…]: [mcp] Pre-loaded 30 tools
```

**Systemd service for the frontend:**

```bash
sudo nano /etc/systemd/system/romy-frontend.service
```

```ini
[Unit]
Description=Romy Frontend (Next.js)
After=network.target romy-backend.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/opt/romy/frontend
ExecStart=/usr/bin/node .next/standalone/server.js
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
EnvironmentFile=/opt/romy/frontend/.env.local
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=romy-frontend

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable romy-frontend
sudo systemctl start romy-frontend
```

---

## 6. Nginx

**Install Nginx:**

```bash
sudo apt-get install -y nginx
```

**Create the site configuration:**

```bash
sudo nano /etc/nginx/sites-available/romy
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Backend API
    location /api/ {
        proxy_pass         http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;

        # SSE (streaming chat responses)
        proxy_buffering    off;
        proxy_cache        off;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable and test:**

```bash
sudo ln -s /etc/nginx/sites-available/romy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. HTTPS with Let's Encrypt

**Install Certbot:**

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

**Obtain and install certificate:**

```bash
sudo certbot --nginx -d yourdomain.com
```

Certbot patches the Nginx config automatically to add TLS and redirect HTTP → HTTPS.

**Confirm auto-renewal is active:**

```bash
sudo systemctl status certbot.timer
```

Expected:
```
Active: active (waiting)
Trigger: …next run in ~N hours
```

**Test renewal without deploying:**

```bash
sudo certbot renew --dry-run
```

---

## 8. OVHcloud Object Storage (Optional — Production Recommended)

Local filesystem storage (`backend/uploads/`) is fine for development and low-traffic deployments. For production, use OVHcloud Object Storage (Paris region) for durability and separation of concerns.

**Create a container:**

1. Log into OVHcloud → **Public Cloud** → **Object Storage**
2. Create a container in the **GRA (Paris)** region, **Private** visibility
3. Generate S3 credentials: **Users & Roles** → **Add a user** → **Download openrc file** and note the S3 access key + secret

**Update `.env`:**

```bash
nano /opt/romy/backend/.env
```

```env
STORAGE_ENDPOINT_URL=https://s3.gra.io.cloud.ovh.net
STORAGE_ACCESS_KEY_ID=YOUR_ACCESS_KEY
STORAGE_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
STORAGE_BUCKET_NAME=romy-documents
```

**Restart the backend to pick up new storage config:**

```bash
sudo systemctl restart romy-backend
```

> Documents uploaded after this change will go to OVHcloud. Documents uploaded before (under `backend/uploads/`) will need to be migrated manually if you want them accessible — or simply leave them on disk as an archive.

---

## 9. Smoke Test

Run these checks against your production URL after deployment. Replace `https://yourdomain.com` throughout.

**1. Backend health check:**

```bash
curl https://yourdomain.com/api/health
```

Expected:
```json
{"ok":true}
```

**2. Database — language column present:**

```bash
sudo -u postgres psql -d romy -c "\d user_profiles" | grep language
```

Expected:
```
 language | character varying(10) | not null | 'en'::character varying
```

**3. Backend startup log — Romy branding + 30 JusticeLibre tools:**

```bash
sudo journalctl -u romy-backend -n 20 --no-pager
```

Expected lines:
```
Romy backend running on port 3001
[mcp] Connecting to justicelibre
[mcp] Pre-loaded 30 tools
[mcp] Connections initialized
```

**4. Sign up and verify GET /user/profile returns language field:**

```bash
TOKEN=$(curl -s -X POST https://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.local","password":"smoketest123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

curl -s https://yourdomain.com/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected (key fields):
```json
{
  "language": "en",
  "tabular_model": "mistral-large-latest"
}
```

**5. Tabular review — routes to Mistral, not Gemini:**

With no `GEMINI_API_KEY` set in `.env`, create a project, upload a DOCX, create a tabular review, and trigger a single-cell generation. A successful JSON response confirms Mistral routing. If Gemini had been attempted, the call would fail immediately (no API key).

```bash
# Confirm GEMINI_API_KEY is absent from the running environment
sudo systemctl cat romy-backend | grep GEMINI
sudo journalctl -u romy-backend | grep -i gemini
```

Neither command should show a key or error. The tabular cell result should be a valid JSON object:
```json
{"summary":"…","flag":"green","reasoning":"…"}
```

**6. Légifrance error handling — blank PISTE creds:**

If `PISTE_CLIENT_ID` and `PISTE_CLIENT_SECRET` are left blank in `.env`, any Légifrance tool call returns clean JSON — no stack trace, no crash:

```json
{"error":"Error: PISTE_CLIENT_ID and PISTE_CLIENT_SECRET are required for Légifrance tools"}
```

The AI receives this as a tool result and relays it as a user-friendly message. JusticeLibre MCP tools (all 30) continue to work without PISTE credentials.

---

## 10. Sovereignty Note

| Layer | Provider | Jurisdiction |
|---|---|---|
| AI inference | Mistral Large (EU endpoint) | France / EU |
| Case law + legislation | JusticeLibre (30 tools) | French public infrastructure |
| Légifrance / Judilibre | PISTE OAuth2 (optional) | French government |
| Object storage | OVHcloud Paris (GRA) | French jurisdiction |
| Compute | OVHcloud VPS Paris | French jurisdiction |
| Auth | Custom JWT + bcrypt | Self-hosted, no third party |
| Database | PostgreSQL (self-hosted) | On-VPS, no cloud DB |

**No data leaves France.**

Mistral's EU API endpoint routes all inference within EU infrastructure operated by a French company. JusticeLibre is built on France's own public legal data (4M+ decisions from CE, Cour de cassation, CEDH, CJUE — all published under open licences). OVHcloud's GRA region is physically located in Roubaix, France, under French law.

PISTE credentials are optional. JusticeLibre covers 95 % of French legal research use cases (case law search, legislation lookup, article text retrieval) without them. PISTE unlocks five additional native tools (`search_legifrance`, `get_legi_article`, `get_code_toc`, `search_judilibre`, `get_judilibre_decision`) that call official DILA and Cour de cassation APIs directly.
