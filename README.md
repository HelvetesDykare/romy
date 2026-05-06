# Romy — Sovereign French Legal AI

> *"No Anthropic. No OpenAI. No data leaving France."*

Romy is an open-source French legal AI platform built as a fork of [Emilie](https://github.com/veronica-builds/emilie) (itself a fork of [MikeOSS](https://github.com/willchen96/mike)), extended for French law and deployed on French sovereign infrastructure.

Built by **Andres Alma** — TMT, Data Privacy & Disputes lawyer, Panthéon-Assas and UVSQ alumnus — as a hands-on exercise in Legal AI Engineering and a contribution to the French open legal tech community, and, **Romy Descours-Karmitz**

---

## Why Romy?

Harvey AI raised $100M. Legora is valued at $5.6B. Both are closed, US-hosted, and expensive.

France has one of the richest open legal data ecosystems in Europe:
- **JusticeLibre** — 4M+ decisions (CE, CAA, TA, Cour de cassation, CEDH, CJUE), free, no auth, with a native MCP server
- **Légifrance API** — all French legislation, codes, regulations
- **Judilibre (PISTE)** — official Cour de cassation case law API

Romy assembles these pieces into a working sovereign legal AI that costs less per month than a single hour of BigLaw associate time.

Named after my dear friend and contributor **Romy Descours-Karmitz** (aka La Rockstar)

---

## What Romy Does

- **Document analysis** — upload French contracts, NDAs, court decisions; ask legal questions; get cited, grounded answers
- **Jurisprudence research** — searches JusticeLibre's 4M+ decisions in real time via MCP; returns real case identifiers, not hallucinations
- **Contract drafting** — generates Word (.docx) documents with proper French legal formatting
- **Tracked changes** — proposes edits to uploaded contracts as Accept/Reject tracked changes
- **Tabular review** — extract structured data from batches of contracts (governing law, liability caps, notice periods, etc.)
- **Workflows** — reusable legal prompts for recurring tasks

---

## The Sovereign Stack

| Layer | Choice | Why |
|---|---|---|
| AI Model | [Mistral Large](https://mistral.ai) | French company, EU infrastructure, OpenAI-compatible API |
| Case law | [JusticeLibre](https://justicelibre.org) | 4M+ decisions, free, MCP server, no auth required |
| Legislation | Légifrance / PISTE API | Official French government open data |
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
    ├── JusticeLibre MCP Client ──► justicelibre.org/mcp
    ├── Légifrance API (PISTE)
    └── PostgreSQL + OVHcloud Object Storage
```

The MCP client connects to JusticeLibre at startup and exposes 24 legal tools to the model — `search_all`, `search_admin`, `search_judiciaire_libre`, `get_law_article`, `get_law_versions`, and more.

---

## Changes from Emilie

Emilie made three changes from MikeOSS for Swiss sovereignty. Romy makes three more for France:

1. **French legal data** — JusticeLibre MCP server configured as default; PISTE (Judilibre + Légifrance) credentials supported
2. **MCP pre-connection** — JusticeLibre tools loaded at server startup, not lazily, so they're available on the first query
3. **Mistral routing fixed** — `models.ts` default changed from Gemini to `VLLM_MAIN_MODEL`; `resolveModel()` extended to accept Mistral model IDs; `localllm.ts` fixed to send `content: ""` instead of `content: null` when Mistral returns tool calls (Mistral API compatibility fix)

---

## Getting Started

### Prerequisites
- Node.js 20+ (LTS)
- PostgreSQL 14+
- A [Mistral AI](https://console.mistral.ai) API key
- Optional: [PISTE](https://piste.api.gouv.fr) credentials for Judilibre + Légifrance

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/romy
cd romy

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (see below)
# Run the database schema
psql -U postgres -d romy -f migrations/000_one_shot_schema.sql
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

# Mistral (sovereign model)
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

## Sovereign Deployment (OVHcloud)

For a fully sovereign French deployment:

1. Spin up a VPS on [OVHcloud](https://www.ovhcloud.com) (Paris region)
2. Use OVHcloud Object Storage (S3-compatible) for document storage
3. Point `VLLM_BASE_URL` at Mistral's EU API endpoint
4. Configure your domain and HTTPS

No data leaves France.

---

## French Legal Data Sources

| Source | Coverage | Access |
|---|---|---|
| [JusticeLibre](https://justicelibre.org) | 4M+ decisions (CE, CAA, TA, Cass, CEDH, CJUE) + 1.5M law articles | Free, no auth, MCP server |
| [Judilibre (PISTE)](https://piste.api.gouv.fr) | Cour de cassation decisions (official API) | Free, registration required |
| [Légifrance (PISTE)](https://piste.api.gouv.fr) | All French legislation, codes, regulations | Free, registration required |

---

## Lineage

```
MikeOSS (Will Chen) ──► Emilie (veronica-builds) ──► Romy (this repo)
Harvey alternative      Swiss sovereignty           French sovereignty
```

This project stands on the shoulders of Will Chen's insight that Harvey's core platform can be replicated in two weeks, and the Swiss legal engineer who showed what sovereign deployment looks like in practice.

---

## Roadmap

- [ ] Légifrance API integration (PISTE credentials → legislation search)
- [ ] OVHcloud production deployment guide
- [ ] French legal prompt library (workflows for common TMT/data privacy tasks)
- [ ] Spanish fork (BOE-MCP already exists)
- [ ] Swedish fork (Riksdagen API)

---

## License

AGPL-3.0 — same as MikeOSS and Emilie. If you build on this, share your changes.

---

## Contributing

Issues and PRs welcome. If you're building a sovereign legal AI for another jurisdiction, open an issue — the architecture is jurisdiction-agnostic.

---

*Built with the conviction that access to legal knowledge should not cost €200/month per lawyer.*
