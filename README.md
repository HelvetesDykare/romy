# Romy — Sovereign French Legal AI

> *"No data leaving France."*

Romy is an open-source French legal AI platform built as a fork of [Emilie](https://github.com/veronica-builds/emilie) (itself a fork of [MikeOSS](https://github.com/willchen96/mike)), extended for French law and deployed on French sovereign infrastructure.

Built by **Andres** (TMT, Data Privacy & Disputes lawyer, Panthéon-Assas and UVSQ alumnus — as a hands-on exercise in Legal AI Engineering and a contribution to the French open legal tech community) and **Romy Descours-Karmitz**.

---

## Why Romy?

Harvey AI raised $100M. Legora is valued at $5.6B. Both are closed, US-hosted, and expensive.

France has one of the richest open legal data ecosystems in Europe:
- **JusticeLibre** — 4M+ decisions (CE, CAA, TA, Cour de cassation, CEDH, CJUE) + 1.5M law articles, free, no auth, with a native MCP server and 30 legal tools
- **Légifrance API** — all French legislation, codes, regulations (via PISTE)
- **Judilibre (PISTE)** — official Cour de cassation case law API

Romy assembles these pieces into a working sovereign legal AI that costs less per month than a single hour of BigLaw associate time.

---

## What Romy Does

- **Document analysis** — upload French contracts, NDAs, court decisions; ask legal questions; get cited, grounded answers
- **Real jurisprudence retrieval** — searches JusticeLibre's 4M+ decisions in real time via MCP; returns verified case identifiers you can check on Légifrance in one click
- **Legislation lookup** — retrieves article text from 22 French codes (Code civil, Code pénal, Code du travail...) with historical versioning
- **Contract drafting** — generates Word (.docx) documents with proper French legal formatting
- **Tracked changes** — proposes edits to uploaded contracts as Accept/Reject tracked changes
- **Tabular review** — extract structured data from batches of contracts (governing law, liability caps, notice periods, etc.)
- **Workflows** — reusable legal prompts for recurring tasks
- **Multilingual** — interface and AI responses in French 🇫🇷, English 🇬🇧, or Spanish 🇪🇸, selectable per user

---

## The Sovereign Stack

| Layer | Choice | Why |
|---|---|---|
| AI Model | [Mistral Large](https://mistral.ai) | French company, EU infrastructure, OpenAI-compatible API |
| Case law | [JusticeLibre](https://justicelibre.org) | 4M+ decisions, free, 30-tool MCP server, no auth required |
| Legislation | JusticeLibre `search_legi` + `get_law_article` | 1.5M articles, historical versioning |
| Object storage | OVHcloud / Scaleway | French data centers, S3-compatible |
| Auth | Custom JWT + bcrypt | No Supabase, no third-party auth service |
| Database | PostgreSQL | Self-hosted, no external dependency |

No query leaves France. No document touches a US server.

---

## Architecture

```
Browser (Next.js)
    │
    ▼
Backend (Express / TypeScript)
    ├── Mistral Large (via OpenAI-compatible endpoint)
    ├── JusticeLibre MCP Client ──► justicelibre.org/mcp (30 tools)
    │     ├── search_all (federated BM25 search)
    │     ├── search_admin (CE, CAA, TA — 4M+ decisions)
    │     ├── search_judiciaire_libre (Cass, CA, CC)
    │     ├── get_law_article (historical versioning)
    │     └── 26 more tools...
    ├── Language injection (FR/EN/ES per user)
    └── PostgreSQL + OVHcloud Object Storage
```

The MCP client connects to JusticeLibre at startup and pre-loads all 30 tools so they're available on the first query.

---

## Changes from Emilie

Emilie made three changes from MikeOSS for Swiss sovereignty. Romy makes five more for France:

1. **French legal data** — JusticeLibre MCP server configured as default with 30 legal tools pre-loaded at startup
2. **MCP pre-connection** — JusticeLibre tools loaded at server startup via `initMCPConnections()`, not lazily, so they're available on the first query without delay
3. **Mistral routing fixed** — `models.ts` default changed from Gemini to `VLLM_MAIN_MODEL`; `resolveModel()` extended to accept Mistral model IDs; title generation routed to `VLLM_LIGHT_MODEL` instead of Gemini
4. **Mistral tool call compatibility** — `localllm.ts` fixed to send `content: ""` instead of `content: null` when Mistral returns tool calls (Mistral API requires non-null content alongside tool_calls)
5. **Multilingual support** — language preference (FR/EN/ES) stored per user in Postgres; injected into system prompt on every request; selectable via flag buttons in account settings

---

## Getting Started

### Prerequisites
- Node.js 20+ (LTS)
- PostgreSQL 14+
- A [Mistral AI](https://console.mistral.ai) API key
- Optional: [PISTE](https://piste.api.gouv.fr) credentials for Judilibre + Légifrance direct API access

### Installation

```bash
git clone https://github.com/HelvetesDykare/romy
cd romy

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (see below)

# Create the database
psql -U postgres -c "CREATE DATABASE romy;"
psql -U postgres -d romy -f migrations/000_one_shot_schema.sql

# Add language column
psql -U postgres -d romy -c "ALTER TABLE user_profiles ADD COLUMN language VARCHAR(10) DEFAULT 'en';"

npm run dev

# Frontend (separate terminal)
cd ../frontend
npm install --legacy-peer-deps
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/romy

# Auth
JWT_SECRET=your-long-random-secret

# Mistral (sovereign model — French company, EU servers)
VLLM_BASE_URL=https://api.mistral.ai/v1
VLLM_API_KEY=your-mistral-api-key
VLLM_MAIN_MODEL=mistral-large-latest
VLLM_LIGHT_MODEL=mistral-small-latest

# JusticeLibre MCP (free, no key required)
MCP_SERVERS=[{"name":"justicelibre","url":"https://justicelibre.org/mcp"}]

# Object storage (leave blank for local filesystem in dev)
STORAGE_ENDPOINT_URL=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_BUCKET_NAME=
```

---

## French Legal Data Sources

| Source | Coverage | Access |
|---|---|---|
| [JusticeLibre](https://justicelibre.org) | 4M+ decisions (CE, CAA, TA, Cass, CEDH, CJUE) + 1.5M law articles | Free, no auth, MCP server with 30 tools |
| [Judilibre (PISTE)](https://piste.api.gouv.fr) | Cour de cassation decisions (official API) | Free, registration required |
| [Légifrance (PISTE)](https://piste.api.gouv.fr) | All French legislation, codes, regulations | Free, registration required |

### Available JusticeLibre Tools (30 total)
- `search_all` — federated BM25 search across all sources with French legal thesaurus
- `search_admin` — 4M+ administrative decisions (CE, 9 CAA, 40 TA)
- `search_judiciaire_libre` — 620k+ Cour de cassation + Cours d'appel decisions
- `search_cedh` — 76k ECHR decisions
- `search_cjue` — 44k CJEU judgments
- `get_law_article` — article text at a specific date (historical versioning)
- `get_law_versions` — full timeline of an article's versions
- `search_legi` — 1.5M+ articles from 22 consolidated codes
- `search_jorf` — Journal Officiel post-1990
- `search_kali` — collective agreements
- `search_cnil` — 26k+ CNIL decisions
- And 19 more...

---

## Multilingual Support

Users can select their preferred language in Account Settings. The AI responds in the selected language automatically.

Supported languages:
- 🇬🇧 English
- 🇫🇷 Français
- 🇪🇸 Español

The language preference is stored in the user's profile and injected into every system prompt.

---

## Sovereign Deployment (OVHcloud)

For a fully sovereign French deployment:

1. Spin up a VPS on [OVHcloud](https://www.ovhcloud.com) (Paris region)
2. Use OVHcloud Object Storage (S3-compatible) for document storage
3. Point `VLLM_BASE_URL` at Mistral's EU API endpoint
4. Configure your domain and HTTPS

No data leaves France.

---

## Lineage

```
MikeOSS (Will Chen) ──► Emilie (veronica-builds) ──► Romy (this repo)
Harvey alternative      Swiss sovereignty           French sovereignty
                        Mistral + Apertus           Mistral + JusticeLibre
                        Swiss legal data            French legal data (4M+ decisions)
```

This project stands on the shoulders of Will Chen's insight that Harvey's core platform can be replicated in two weeks, and the Swiss legal engineer who showed what sovereign deployment looks like in practice.

---

## Roadmap

- [ ] Full UI translation (FR/EN/ES) — labels, buttons, placeholders
- [ ] Légifrance API direct integration (PISTE credentials → legislation search)
- [ ] OVHcloud production deployment guide
- [ ] French legal prompt library (workflows for TMT/data privacy/disputes)
- [ ] Swedish fork (Riksdagen API — open, well-structured)
- [ ] Spanish fork (BOE-MCP already exists)
- [ ] Dominican Republic fork (requires building legal corpus from scratch)

---

## License

AGPL-3.0 — same as MikeOSS and Emilie. If you build on this, share your changes.

---

## Contributing

Issues and PRs welcome. If you're building a sovereign legal AI for another jurisdiction, open an issue — the architecture is jurisdiction-agnostic.

---

*Built with the conviction that access to legal knowledge should not cost €200/month per lawyer.*
