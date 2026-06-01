# 🇫🇷 Romy OSS — IA Juridique Française, Souveraine par Architecture

> *« Aucune donnée ne quitte la France. »*

> Un fork d'**[Emilie](https://github.com/veronica-builds/emilie)**, étendu pour l'IA juridique souveraine française.
> Emilie est elle-même un fork de **[MikeOSS](https://github.com/willchen96/mike)** de Will Chen.

Romy est une plateforme d'IA juridique française open-source, construite sur les infrastructures de données juridiques publiques de la France. Elle assemble le jeu de données juridiques ouvertes le plus riche d'Europe en un outil souverain opérationnel — déployable sur des serveurs français, propulsé par un modèle français, à une fraction du coût des alternatives propriétaires.

Construite par **Andres Alma** (avocat TMT, données personnelles & contentieux, alumnus de Panthéon-Assas et de l'UVSQ — comme exercice pratique d'ingénierie en IA Juridique et contribution à la communauté française du legal tech open-source) et **Romy Descours-Karmitz**.

---

## Pourquoi Romy ?

La France dispose de l'un des écosystèmes de données juridiques ouvertes les plus riches d'Europe — constitué et maintenu à fonds publics, librement accessible à tous. La plupart des plateformes d'IA juridique l'ignorent, acheminant les requêtes de droit français via des modèles hébergés aux États-Unis et entraînés sur des données propriétaires.

Romy adopte une approche différente : elle est construite entièrement sur ce que la France a déjà rendu public.

- **JusticeLibre** — 4M+ décisions (CE, CAA, TA, Cour de cassation, CEDH, CJUE) + 1,5M articles de loi, gratuit, sans authentification, avec un serveur MCP natif et 30 outils juridiques
- **API Légifrance** — toute la législation, les codes et les règlements français (via PISTE)
- **Judilibre (PISTE)** — l'API officielle de la jurisprudence de la Cour de cassation
- **Mistral Large** — un modèle français, sur une infrastructure française

La souveraineté n'est pas une fonctionnalité. C'est l'architecture.

---

## Ce que fait Romy

- **Analyse documentaire** — chargez des contrats, NDA, décisions de justice françaises ; posez des questions juridiques ; obtenez des réponses citées et sourcées
- **Recherche jurisprudentielle réelle** — interroge en temps réel les 4M+ décisions de JusticeLibre via MCP ; retourne des identifiants de décisions vérifiables sur Légifrance en un clic
- **Consultation législative** — récupère le texte des articles de 22 codes français (Code civil, Code pénal, Code du travail...) avec versionnage historique
- **Rédaction contractuelle** — génère des documents Word (.docx) avec la mise en forme juridique française appropriée
- **Modifications suivies** — propose des modifications aux contrats chargés sous forme de corrections Accepter/Rejeter
- **Revue tabulaire** — extrait des données structurées depuis des lots de contrats (loi applicable, plafonds de responsabilité, préavis, etc.)
- **Workflows** — modèles de requêtes juridiques réutilisables pour les tâches récurrentes
- **Multilingue** — interface et réponses de l'IA en français 🇫🇷, anglais 🇬🇧 ou espagnol 🇪🇸, sélectionnable par utilisateur

---

## La Stack Souveraine

| Couche | Choix | Pourquoi |
|---|---|---|
| Modèle IA | [Mistral Large](https://mistral.ai) | Entreprise française, infrastructure EU, API compatible OpenAI |
| Jurisprudence | [JusticeLibre](https://justicelibre.org) | 4M+ décisions, gratuit, serveur MCP 30 outils, sans authentification |
| Législation | JusticeLibre `search_legi` + `get_law_article` | 1,5M articles, versionnage historique |
| Stockage objets | Système de fichiers local (défaut) ou compatible S3 | OVHcloud / Scaleway recommandé en production |
| Authentification | JWT personnalisé + bcrypt | Aucun service d'auth tiers |
| Base de données | PostgreSQL | Auto-hébergée, aucune dépendance externe |

---

## Architecture

```
Navigateur (Next.js)
    │
    ▼
Backend (Express / TypeScript)
    ├── Mistral Large (via endpoint compatible OpenAI)
    ├── Client MCP JusticeLibre ──► justicelibre.org/mcp (30 outils)
    │     ├── search_all (recherche BM25 fédérée)
    │     ├── search_admin (CE, CAA, TA — 4M+ décisions)
    │     ├── search_judiciaire_libre (Cass, CA, CC)
    │     ├── get_law_article (versionnage historique)
    │     └── 26 outils supplémentaires...
    ├── Injection de langue (FR/EN/ES par utilisateur)
    └── PostgreSQL + système de fichiers local (ou stockage compatible S3)
```

Le client MCP se connecte à JusticeLibre au démarrage et précharge les 30 outils afin qu'ils soient disponibles dès la première requête sans délai.

---

## Filiation

Romy est un fork d'[Emilie](https://github.com/veronica-builds/emilie) (lui-même fork de [MikeOSS](https://github.com/willchen96/mike)), étendu pour le droit français et l'infrastructure souveraine française.

```
MikeOSS (Will Chen) ──► Emilie (veronica-builds) ──► Romy (ce dépôt)
IA juridique générale    Souveraineté suisse          Souveraineté française
                         Mistral + Apertus            Mistral + JusticeLibre
                         Données juridiques suisses   Données juridiques françaises (4M+ décisions)
```

### Modifications par rapport à Emilie

Emilie a apporté trois modifications à MikeOSS pour la souveraineté suisse. Romy en apporte cinq supplémentaires pour la France :

1. **Données juridiques françaises** — serveur MCP JusticeLibre configuré par défaut avec 30 outils juridiques préchargés au démarrage
2. **Préconnexion MCP** — outils JusticeLibre chargés au démarrage du serveur via `initMCPConnections()`, et non paresseusement, afin d'être disponibles dès la première requête sans délai
3. **Routage Mistral corrigé** — le modèle par défaut de `models.ts` remplacé de Gemini par `VLLM_MAIN_MODEL` ; `resolveModel()` étendu pour accepter les identifiants de modèles Mistral ; la génération de titres routée vers `VLLM_LIGHT_MODEL` au lieu de Gemini
4. **Compatibilité des appels d'outils Mistral** — `localllm.ts` corrigé pour envoyer `content: ""` au lieu de `content: null` lorsque Mistral retourne des appels d'outils (l'API Mistral exige un contenu non nul en plus de tool_calls)
5. **Support multilingue** — préférence de langue (FR/EN/ES) stockée par utilisateur dans Postgres ; injectée dans le prompt système à chaque requête ; sélectionnable via des boutons drapeau dans les paramètres du compte

---

## Démarrage Rapide

### Prérequis
- Node.js 20+ (LTS)
- PostgreSQL 14+
- Une clé API pour le modèle de votre choix (voir **Choisir votre modèle** ci-dessous)
- Optionnel : identifiants [PISTE](https://piste.api.gouv.fr) pour l'accès direct à Judilibre + Légifrance

### Installation

```bash
git clone https://github.com/HelvetesDykare/romy
cd romy

# Backend
cd backend
npm install
cp .env.example .env
# Modifiez .env avec vos identifiants (voir ci-dessous)

# Créer la base de données
psql -U postgres -c "CREATE DATABASE romy;"
psql -U postgres -d romy -f migrations/000_one_shot_schema.sql

npm run dev

# Frontend (terminal séparé)
cd ../frontend
npm install --legacy-peer-deps
cp .env.local.example .env.local
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## Choisir votre modèle

Romy fonctionne avec n'importe quelle API de modèle compatible OpenAI :

- **Mistral Large** (recommandé) — entreprise française, serveurs EU, entièrement testé avec les 30 outils MCP JusticeLibre. Le seul choix qui garantit la souveraineté de vos données. Obtenez une clé sur [console.mistral.ai](https://console.mistral.ai)
- **OpenAI GPT-4o** — définissez `VLLM_BASE_URL=https://api.openai.com/v1`
- **Modèles locaux via Ollama ou LM Studio** — définissez `VLLM_BASE_URL` sur votre point d'accès local (ex. `http://localhost:11434/v1`), laissez `VLLM_API_KEY` vide
- **N'importe quel autre fournisseur compatible OpenAI** — Groq, Together AI, etc.

> ⚠️ **Note de compatibilité :** Mistral est l'option testée et garantie pour les appels d'outils. Le code inclut un correctif spécifique au format d'appel d'outils de Mistral (envoi de `content: ""` au lieu de `null`). D'autres modèles peuvent avoir leurs propres particularités avec les 30 outils MCP JusticeLibre et peuvent nécessiter des ajustements mineurs dans `backend/src/lib/localllm.ts`.

Pour un déploiement souverain français, Mistral est le bon choix — vos données restent en France, votre modèle tourne en France.

### Ajouter votre clé API

**Option 1 — Via l'interface (recommandé)**
Allez dans Paramètres du compte → Modèles et collez votre clé.
Elle est stockée chiffrée dans votre propre base de données.

**Option 2 — Au niveau du serveur (déploiements auto-hébergés)**
Définissez `VLLM_API_KEY` dans `backend/.env` pour partager une clé entre tous les utilisateurs de votre serveur.

---

## Variables d'Environnement

```env
# Base de données
DATABASE_URL=postgres://postgres:password@localhost:5432/romy

# Authentification
JWT_SECRET=votre-secret-long-et-aléatoire

# Modèle souverain (Mistral — entreprise française, serveurs EU)
VLLM_BASE_URL=https://api.mistral.ai/v1
VLLM_API_KEY=votre-clé-api-mistral
VLLM_MAIN_MODEL=mistral-large-latest
VLLM_LIGHT_MODEL=mistral-small-latest

# MCP JusticeLibre (gratuit, aucune clé requise)
MCP_SERVERS=[{"name":"justicelibre","url":"https://justicelibre.org/mcp"}]

# Stockage objets (laisser vide pour le système de fichiers local en développement)
STORAGE_ENDPOINT_URL=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_BUCKET_NAME=
```

---

## Sources de Données Juridiques Françaises

| Source | Couverture | Accès |
|---|---|---|
| [JusticeLibre](https://justicelibre.org) | 4M+ décisions (CE, CAA, TA, Cass, CEDH, CJUE) + 1,5M articles | Gratuit, sans auth, serveur MCP avec 30 outils |
| [Judilibre (PISTE)](https://piste.api.gouv.fr) | Décisions de la Cour de cassation (API officielle) | Gratuit, inscription requise |
| [Légifrance (PISTE)](https://piste.api.gouv.fr) | Toute la législation, codes et règlements français | Gratuit, inscription requise |

### Outils JusticeLibre disponibles (30 au total)
- `search_all` — recherche BM25 fédérée sur toutes les sources avec thésaurus juridique français
- `search_admin` — 4M+ décisions administratives (CE, 9 CAA, 40 TA)
- `search_judiciaire_libre` — 620k+ décisions Cour de cassation + Cours d'appel
- `search_cedh` — 76k décisions CEDH
- `search_cjue` — 44k arrêts CJUE
- `get_law_article` — texte d'un article à une date donnée (versionnage historique)
- `get_law_versions` — chronologie complète des versions d'un article
- `search_legi` — 1,5M+ articles issus de 22 codes consolidés
- `search_jorf` — Journal Officiel depuis 1990
- `search_kali` — conventions collectives
- `search_cnil` — 26k+ décisions CNIL
- Et 19 autres...

---

## Support Multilingue

Les utilisateurs peuvent sélectionner leur langue préférée dans les Paramètres du compte. L'IA répond automatiquement dans la langue sélectionnée.

Langues supportées :
- 🇬🇧 English
- 🇫🇷 Français
- 🇪🇸 Español

---

## Déploiement Souverain (OVHcloud)

Pour un déploiement souverain français complet, consultez **[DEPLOY.md](./DEPLOY.md)** pour le guide complet.

En résumé :

1. Créez un VPS sur [OVHcloud](https://www.ovhcloud.com) (région Paris)
2. Utilisez OVHcloud Object Storage (compatible S3) pour le stockage des documents
3. Pointez `VLLM_BASE_URL` sur l'endpoint EU de l'API Mistral
4. Configurez votre domaine et HTTPS via Let's Encrypt

Aucune donnée ne quitte la France.

---

## Feuille de Route

- [x] Mistral Large comme modèle IA souverain
- [x] Données juridiques françaises via MCP JusticeLibre (30 outils)
- [x] Interface multilingue (FR/EN/ES) via next-intl
- [x] Bibliothèque de prompts juridiques français (TMT, données personnelles, contentieux)
- [x] Intégration directe Légifrance + Judilibre via PISTE OAuth2 (5 outils natifs)
- [x] Guide de déploiement en production (OVHcloud VPS + Nginx + Let's Encrypt)

---

## Licence

AGPL-3.0 — comme MikeOSS et Emilie. Si vous construisez dessus, partagez vos modifications.

---

## Contribuer

Issues et PR bienvenus. Si vous construisez une IA juridique souveraine pour une autre juridiction, ouvrez une issue — l'architecture est agnostique à la juridiction.

---

*Construit avec la conviction que l'accès à la connaissance juridique est un bien public.*

---
---

# 🇬🇧 Romy OSS — French Legal AI, Sovereign by Design

> *"No data leaving France."*

> A fork of **[Emilie](https://github.com/veronica-builds/emilie)**, extended for French sovereign legal AI.
> Emilie is itself a fork of **[MikeOSS](https://github.com/willchen96/mike)** by Will Chen.

Romy is an open-source French legal AI platform built on France's own public legal data infrastructure. It assembles the richest open legal dataset in Europe into a working, sovereign AI tool — deployable on French servers, powered by a French model, at a fraction of the cost of proprietary alternatives.

Built by **Andres Alma** (TMT, Data Privacy & Disputes lawyer, Panthéon-Assas and UVSQ alumnus — as a hands-on exercise in Legal AI Engineering and a contribution to the French open legal tech community) and **Romy Descours-Karmitz**.

---

## Why Romy?

France has one of the richest open legal data ecosystems in Europe — built and maintained at public expense, freely available to anyone. Most legal AI platforms ignore it, routing French law queries through US-hosted models trained on proprietary data.

Romy takes a different approach: it is built entirely on what France has already made public.

- **JusticeLibre** — 4M+ decisions (CE, CAA, TA, Cour de cassation, CEDH, CJUE) + 1.5M law articles, free, no auth, with a native MCP server and 30 legal tools
- **Légifrance API** — all French legislation, codes, regulations (via PISTE)
- **Judilibre (PISTE)** — official Cour de cassation case law API
- **Mistral Large** — a French model, on French infrastructure

Sovereignty is not a feature. It is the architecture.

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
| Object storage | Local filesystem (default) or S3-compatible | OVHcloud / Scaleway recommended for production |
| Auth | Custom JWT + bcrypt | No third-party auth service |
| Database | PostgreSQL | Self-hosted, no external dependency |

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
    └── PostgreSQL + local filesystem (or S3-compatible storage)
```

The MCP client connects to JusticeLibre at startup and pre-loads all 30 tools so they're available on the first query without delay.

---

## Lineage

Romy is a fork of [Emilie](https://github.com/veronica-builds/emilie) (itself a fork of [MikeOSS](https://github.com/willchen96/mike)), extended for French law and French sovereign infrastructure.

```
MikeOSS (Will Chen) ──► Emilie (veronica-builds) ──► Romy (this repo)
General legal AI        Swiss sovereignty           French sovereignty
                        Mistral + Apertus           Mistral + JusticeLibre
                        Swiss legal data            French legal data (4M+ decisions)
```

### Changes from Emilie

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
- An API key for your chosen model (see **Choosing your model** below)
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

npm run dev

# Frontend (separate terminal)
cd ../frontend
npm install --legacy-peer-deps
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Choosing Your Model

Romy works with any OpenAI-compatible model API:

- **Mistral Large** (recommended) — French company, EU servers, fully tested with all 30 JusticeLibre MCP tools. The only choice that keeps your data sovereign. Get a key at [console.mistral.ai](https://console.mistral.ai)
- **OpenAI GPT-4o** — set `VLLM_BASE_URL=https://api.openai.com/v1`
- **Local models via Ollama or LM Studio** — set `VLLM_BASE_URL` to your local endpoint (e.g. `http://localhost:11434/v1`), leave `VLLM_API_KEY` blank
- **Any other OpenAI-compatible provider** — Groq, Together AI, etc.

> ⚠️ **Compatibility note:** Mistral is the tested, guaranteed-working option for tool calls. The codebase includes a fix for Mistral's tool call format (sending `content: ""` instead of `null`). Other models may have their own quirks with the 30 JusticeLibre MCP tools and may require minor adjustments in `backend/src/lib/localllm.ts`.

For a truly sovereign French deployment, Mistral is the right choice — your data stays in France, your model runs in France.

### Adding Your API Key

**Option 1 — Via the UI (recommended)**
Go to Account Settings → Models and paste your key.
It is stored encrypted in your own database.

**Option 2 — Server-wide (self-hosted deployments)**
Set `VLLM_API_KEY` in `backend/.env` to share one key across all users on your server.

---

## Environment Variables

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

---

## Sovereign Deployment (OVHcloud)

For a fully sovereign French deployment, see **[DEPLOY.md](./DEPLOY.md)** for the complete guide.

In brief:

1. Spin up a VPS on [OVHcloud](https://www.ovhcloud.com) (Paris region)
2. Use OVHcloud Object Storage (S3-compatible) for document storage
3. Point `VLLM_BASE_URL` at Mistral's EU API endpoint
4. Configure your domain and HTTPS via Let's Encrypt

No data leaves France.

---

## Roadmap

- [x] Mistral Large as sovereign AI model
- [x] French legal data via JusticeLibre MCP (30 tools)
- [x] Multilingual UI (FR/EN/ES) via next-intl
- [x] French legal prompt library (TMT, données personnelles, contentieux)
- [x] Légifrance + Judilibre direct integration via PISTE OAuth2 (5 native tools)
- [x] Production deployment guide (OVHcloud VPS + Nginx + Let's Encrypt)

---

## License

AGPL-3.0 — same as MikeOSS and Emilie. If you build on this, share your changes.

---

## Contributing

Issues and PRs welcome. If you're building a sovereign legal AI for another jurisdiction, open an issue — the architecture is jurisdiction-agnostic.

---

*Built with the conviction that access to legal knowledge is a public good.*
