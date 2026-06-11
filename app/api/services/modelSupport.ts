import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface ModelCapabilities {
  model: string;
  supportsImageInput: boolean;
  supportsTextInput: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  contextLength?: number;
  provider?: string;
  architecture?: string;
  inputModalities: string[];
  outputModalities: string[];
  checkedAt: string;
}

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "model-capabilities.json");

async function ensureCacheFile() {
  await mkdir(CACHE_DIR, { recursive: true });
  try {
    await readFile(CACHE_FILE, "utf8");
  } catch {
    await writeFile(CACHE_FILE, JSON.stringify({}, null, 2));
  }
}

async function readCache(): Promise<Record<string, ModelCapabilities>> {
  await ensureCacheFile();
  try {
    const data = await readFile(CACHE_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeCache(cache: Record<string, ModelCapabilities>) {
  await ensureCacheFile();
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function normalizeCapabilities(modelData: any): ModelCapabilities {
  const inputModalities = modelData?.architecture?.input_modalities ?? [];
  const outputModalities = modelData?.architecture?.output_modalities ?? [];

  return {
    model: modelData.id,
    supportsImageInput: inputModalities.includes("image"),
    supportsTextInput: inputModalities.includes("text"),
    supportsTools: modelData.supported_parameters?.includes("tools") ?? false,
    supportsStreaming:
      modelData.supported_parameters?.includes("stream") ?? true,
    contextLength: modelData.context_length,
    provider: modelData.top_provider?.name,
    architecture: modelData.architecture?.modality,
    inputModalities,
    outputModalities,
    checkedAt: new Date().toISOString(),
  };
}

export async function getModelCapabilities(
  model: string,
  apiKey: string,
): Promise<ModelCapabilities | null> {
  const cache = await readCache();
  if (cache[model]) {
    console.log(`[ModelSupport] Cache hit for ${model}`);
    return cache[model];
  }

  console.log(`[ModelSupport] Fetching metadata for ${model}`);
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const json = await response.json();
  const modelData = json?.data?.find((m: any) => m.id === model);
  if (!modelData) return null;

  const capabilities = normalizeCapabilities(modelData);
  cache[model] = capabilities;
  await writeCache(cache);
  return capabilities;
}
