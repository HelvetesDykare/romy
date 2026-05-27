import { pool } from "./db";
import { LOCAL_MODELS, DEFAULT_TITLE_MODEL, type UserApiKeys } from "./llm";

export type UserModelSettings = {
    title_model: string;
    tabular_model: string;
    api_keys: UserApiKeys;
};

function resolveTitleModel(apiKeys: UserApiKeys): string {
    if (apiKeys.gemini?.trim()) return DEFAULT_TITLE_MODEL;
    if (apiKeys.claude?.trim()) return "claude-haiku-4-5";
    return process.env.VLLM_LIGHT_MODEL ?? "localllm-light";
}

function resolveTabularModel(storedModel: string | null | undefined): string {
    if (storedModel && (LOCAL_MODELS as readonly string[]).includes(storedModel)) return storedModel;
    return process.env.VLLM_MAIN_MODEL ?? process.env.VLLM_LIGHT_MODEL ?? "localllm-main";
}

export async function getUserModelSettings(userId: string): Promise<UserModelSettings> {
    const { rows } = await pool.query<{
        tabular_model: string | null;
        claude_api_key: string | null;
        gemini_api_key: string | null;
    }>(
        "SELECT tabular_model, claude_api_key, gemini_api_key FROM user_profiles WHERE user_id = $1",
        [userId],
    );
    const data = rows[0] ?? null;
    const api_keys: UserApiKeys = {
        claude: data?.claude_api_key ?? null,
        gemini: data?.gemini_api_key ?? null,
    };
    return {
        title_model: resolveTitleModel(api_keys),
        tabular_model: resolveTabularModel(data?.tabular_model),
        api_keys,
    };
}

export async function getUserApiKeys(userId: string): Promise<UserApiKeys> {
    const { rows } = await pool.query<{
        claude_api_key: string | null;
        gemini_api_key: string | null;
    }>(
        "SELECT claude_api_key, gemini_api_key FROM user_profiles WHERE user_id = $1",
        [userId],
    );
    const data = rows[0] ?? null;
    return {
        claude: data?.claude_api_key ?? null,
        gemini: data?.gemini_api_key ?? null,
    };
}
