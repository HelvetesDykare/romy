/**
 * legifrance.ts
 * Native Légifrance + Judilibre tools via PISTE OAuth2 API.
 * No MCP required — tools are registered directly alongside TOOLS in chatTools.ts.
 *
 * Environment variables required:
 *   PISTE_CLIENT_ID      — PISTE production client ID
 *   PISTE_CLIENT_SECRET  — PISTE production client secret
 */

// ---------------------------------------------------------------------------
// OAuth2 token cache
// ---------------------------------------------------------------------------

const PISTE_TOKEN_URL = "https://oauth.piste.gouv.fr/api/oauth/token";
const LEGIFRANCE_API  = "https://api.piste.gouv.fr/dila/legifrance/lf-engine-app";
const JUDILIBRE_API   = "https://api.piste.gouv.fr/cassation/judilibre/v1.0";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry - 30_000) return cachedToken;

    const clientId     = process.env.PISTE_CLIENT_ID;
    const clientSecret = process.env.PISTE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("PISTE_CLIENT_ID and PISTE_CLIENT_SECRET are required for Légifrance tools");
    }

    const body = new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         "openid",
    });

    const res = await fetch(PISTE_TOKEN_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    body.toString(),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`PISTE token error: ${res.status} ${err}`);
    }

    const data = await res.json() as { access_token: string; expires_in: number };
    cachedToken  = data.access_token;
    tokenExpiry  = Date.now() + data.expires_in * 1000;
    return cachedToken;
}

async function legiHeaders(): Promise<Record<string, string>> {
    const token = await getToken();
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type":  "application/json",
        "Accept":        "application/json",
    };
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

/**
 * Search legislation on Légifrance (codes, lois, décrets, JORF).
 */
async function searchLegifrance(params: {
    query: string;
    fond?: string;   // LODA | CODE | JORF | CIRC | ACCO | KALI
    page_number?: number;
    page_size?: number;
}): Promise<string> {
    const headers = await legiHeaders();
    const body = {
        recherche: {
            champs: [{ typeChamp: "ALL", criteres: [{ typeRecherche: "EXACTE", valeur: params.query }], operateur: "ET" }],
            filtres: params.fond ? [{ facette: "NOM_CODE", valeurs: [params.fond] }] : [],
            pageNumber: params.page_number ?? 1,
            pageSize:   params.page_size ?? 10,
            operateur:  "ET",
            sort:       "PERTINENCE",
            typePagination: "DEFAUT",
        },
        fond: params.fond ?? "LODA",
    };

    const res = await fetch(`${LEGIFRANCE_API}/search`, {
        method:  "POST",
        headers,
        body:    JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        return JSON.stringify({ error: `Légifrance search error: ${res.status}`, detail: err });
    }

    const data = await res.json() as {
        results?: Array<{
            titles?: Array<{ id: string; title: string; nature?: string; datePubli?: string }>;
            excerpts?: Array<{ text: string }>;
        }>;
        totalResultNumber?: number;
    };

    const results = (data.results ?? []).map((r) => ({
        id:      r.titles?.[0]?.id,
        title:   r.titles?.[0]?.title,
        nature:  r.titles?.[0]?.nature,
        date:    r.titles?.[0]?.datePubli,
        excerpt: r.excerpts?.[0]?.text,
    }));

    return JSON.stringify({ total: data.totalResultNumber ?? 0, results });
}

/**
 * Retrieve a specific article from a French code by its ID (LEGIARTI...).
 */
async function getLegiArticle(params: { article_id: string; date?: string }): Promise<string> {
    const headers = await legiHeaders();
    const body: Record<string, unknown> = { id: params.article_id };
    if (params.date) body.date = params.date;

    const res = await fetch(`${LEGIFRANCE_API}/consult/getArticle`, {
        method:  "POST",
        headers,
        body:    JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        return JSON.stringify({ error: `Article fetch error: ${res.status}`, detail: err });
    }

    const data = await res.json() as {
        article?: {
            id?: string;
            num?: string;
            texte?: string;
            etat?: string;
            dateDebut?: string;
            dateFin?: string;
            texteHtml?: string;
        };
    };

    const a = data.article;
    if (!a) return JSON.stringify({ error: "Article not found" });

    return JSON.stringify({
        id:         a.id,
        numero:     a.num,
        texte:      a.texte,
        etat:       a.etat,
        dateDebut:  a.dateDebut,
        dateFin:    a.dateFin,
    });
}

/**
 * Search a French code by its name and retrieve its table of contents.
 */
async function getCodeTableOfContents(params: { code_name: string }): Promise<string> {
    const headers = await legiHeaders();
    const body = {
        recherche: {
            champs: [{ typeChamp: "ALL", criteres: [{ typeRecherche: "EXACTE", valeur: params.code_name }], operateur: "ET" }],
            pageNumber: 1,
            pageSize: 5,
            operateur: "ET",
            sort: "PERTINENCE",
            typePagination: "DEFAUT",
        },
        fond: "CODE_DATE",
    };

    const res = await fetch(`${LEGIFRANCE_API}/search`, {
        method:  "POST",
        headers,
        body:    JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        return JSON.stringify({ error: `Code search error: ${res.status}`, detail: err });
    }

    const data = await res.json() as {
        results?: Array<{ titles?: Array<{ id: string; title: string }> }>;
    };

    const results = (data.results ?? []).map((r) => ({
        id:    r.titles?.[0]?.id,
        title: r.titles?.[0]?.title,
    }));

    return JSON.stringify({ results });
}

/**
 * Search Judilibre — the official Cour de cassation case law API.
 */
async function searchJudilibre(params: {
    query: string;
    jurisdiction?: string;  // cc | ca | tj
    chamber?: string;
    date_start?: string;    // YYYY-MM-DD
    date_end?: string;
    page_size?: number;
}): Promise<string> {
    const headers = await legiHeaders();

    const url = new URL(`${JUDILIBRE_API}/search`);
    url.searchParams.set("query",    params.query);
    url.searchParams.set("page_size", String(params.page_size ?? 10));
    if (params.jurisdiction) url.searchParams.set("jurisdiction", params.jurisdiction);
    if (params.chamber)      url.searchParams.set("chamber",      params.chamber);
    if (params.date_start)   url.searchParams.set("date_start",   params.date_start);
    if (params.date_end)     url.searchParams.set("date_end",     params.date_end);

    const res = await fetch(url.toString(), { method: "GET", headers });

    if (!res.ok) {
        const err = await res.text();
        return JSON.stringify({ error: `Judilibre search error: ${res.status}`, detail: err });
    }

    const data = await res.json() as {
        total?: { value: number };
        results?: Array<{
            id: string;
            number?: string;
            jurisdiction?: string;
            chamber?: string;
            formation?: string;
            decision_date?: string;
            solution?: string;
            summary?: string;
            themes?: string[];
        }>;
    };

    const results = (data.results ?? []).map((r) => ({
        id:            r.id,
        number:        r.number,
        jurisdiction:  r.jurisdiction,
        chamber:       r.chamber,
        date:          r.decision_date,
        solution:      r.solution,
        summary:       r.summary,
        themes:        r.themes,
    }));

    return JSON.stringify({ total: data.total?.value ?? 0, results });
}

/**
 * Retrieve the full text of a Judilibre decision by ID.
 */
async function getJudilibreDecision(params: { decision_id: string }): Promise<string> {
    const headers = await legiHeaders();
    const url = new URL(`${JUDILIBRE_API}/decision`);
    url.searchParams.set("id", params.decision_id);

    const res = await fetch(url.toString(), { method: "GET", headers });

    if (!res.ok) {
        const err = await res.text();
        return JSON.stringify({ error: `Judilibre decision error: ${res.status}`, detail: err });
    }

    const data = await res.json() as {
        id?: string;
        number?: string;
        jurisdiction?: string;
        chamber?: string;
        decision_date?: string;
        solution?: string;
        themes?: string[];
        summary?: string;
        text?: string;
    };

    return JSON.stringify({
        id:           data.id,
        number:       data.number,
        jurisdiction: data.jurisdiction,
        chamber:      data.chamber,
        date:         data.decision_date,
        solution:     data.solution,
        themes:       data.themes,
        summary:      data.summary,
        text:         data.text?.slice(0, 8000), // cap at 8k chars to avoid context overflow
    });
}

// ---------------------------------------------------------------------------
// Tool schemas (OpenAI function-calling format)
// ---------------------------------------------------------------------------

export const LEGIFRANCE_TOOLS = [
    {
        type: "function",
        function: {
            name: "search_legifrance",
            description:
                "Search the official Légifrance database for French legislation, codes, decrees, and Journal Officiel publications. Use this to find laws, regulations, and legislative texts by keyword. Returns a list of matching documents with titles and excerpts.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search query in French (e.g. 'rupture conventionnelle', 'RGPD sous-traitant', 'clause de non-concurrence')",
                    },
                    fond: {
                        type: "string",
                        enum: ["LODA", "CODE", "JORF", "CIRC", "ACCO", "KALI"],
                        description: "Document corpus to search: LODA (lois et décrets), CODE (codes consolidés), JORF (Journal Officiel), CIRC (circulaires), ACCO (accords), KALI (conventions collectives). Default: LODA.",
                    },
                    page_size: {
                        type: "integer",
                        description: "Number of results to return (default 10, max 25)",
                    },
                },
                required: ["query"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_legi_article",
            description:
                "Retrieve the full text of a specific article from French legislation by its Légifrance article ID (format: LEGIARTI...). Use this after search_legifrance to fetch the complete text of a specific article. Optionally specify a date to retrieve the historical version.",
            parameters: {
                type: "object",
                properties: {
                    article_id: {
                        type: "string",
                        description: "The Légifrance article ID, e.g. 'LEGIARTI000006438358'",
                    },
                    date: {
                        type: "string",
                        description: "Optional date (YYYY-MM-DD) to retrieve the version of the article in force on that date",
                    },
                },
                required: ["article_id"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_code_toc",
            description:
                "Search for a French code by name and retrieve its table of contents. Use this to find the Légifrance ID of a code before drilling into specific articles.",
            parameters: {
                type: "object",
                properties: {
                    code_name: {
                        type: "string",
                        description: "Name of the French code, e.g. 'Code civil', 'Code du travail', 'Code pénal', 'Code de commerce'",
                    },
                },
                required: ["code_name"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "search_judilibre",
            description:
                "Search the official Judilibre API for Cour de cassation and Cours d'appel decisions. This is the official government case law API — use it for authoritative French jurisprudence from the highest courts. Returns decision metadata including number, chamber, date, solution, and themes.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search query in French (e.g. 'licenciement faute grave', 'préjudice moral', 'clause résolutoire')",
                    },
                    jurisdiction: {
                        type: "string",
                        enum: ["cc", "ca", "tj"],
                        description: "Jurisdiction filter: cc (Cour de cassation), ca (Cours d'appel), tj (Tribunaux judiciaires)",
                    },
                    chamber: {
                        type: "string",
                        description: "Chamber filter, e.g. 'chambre sociale', 'chambre commerciale', 'chambre civile 1'",
                    },
                    date_start: {
                        type: "string",
                        description: "Start date filter (YYYY-MM-DD)",
                    },
                    date_end: {
                        type: "string",
                        description: "End date filter (YYYY-MM-DD)",
                    },
                    page_size: {
                        type: "integer",
                        description: "Number of results to return (default 10)",
                    },
                },
                required: ["query"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_judilibre_decision",
            description:
                "Retrieve the full text and metadata of a specific Judilibre decision by its ID. Use this after search_judilibre to read the complete text of a decision. Text is capped at 8,000 characters.",
            parameters: {
                type: "object",
                properties: {
                    decision_id: {
                        type: "string",
                        description: "The Judilibre decision ID returned by search_judilibre",
                    },
                },
                required: ["decision_id"],
            },
        },
    },
];

// ---------------------------------------------------------------------------
// Tool dispatcher — call from runToolCalls
// ---------------------------------------------------------------------------

export async function callLegifranceTool(
    name: string,
    args: Record<string, unknown>,
): Promise<string | null> {
    try {
        switch (name) {
            case "search_legifrance":
                return await searchLegifrance(args as Parameters<typeof searchLegifrance>[0]);
            case "get_legi_article":
                return await getLegiArticle(args as Parameters<typeof getLegiArticle>[0]);
            case "get_code_toc":
                return await getCodeTableOfContents(args as Parameters<typeof getCodeTableOfContents>[0]);
            case "search_judilibre":
                return await searchJudilibre(args as Parameters<typeof searchJudilibre>[0]);
            case "get_judilibre_decision":
                return await getJudilibreDecision(args as Parameters<typeof getJudilibreDecision>[0]);
            default:
                return null; // not a Légifrance tool
        }
    } catch (err) {
        return JSON.stringify({ error: String(err) });
    }
}

export function isLegifranceTool(name: string): boolean {
    return [
        "search_legifrance",
        "get_legi_article",
        "get_code_toc",
        "search_judilibre",
        "get_judilibre_decision",
    ].includes(name);
}
