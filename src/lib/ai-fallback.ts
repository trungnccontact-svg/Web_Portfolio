/**
 * AI Model Fallback & Auto-Rotation System
 * 
 * Automatically cycles through a ranked list of free AI models when one fails.
 * Handles: rate limits (429), provider errors (503), no endpoints, network errors.
 * Tracks cooldowns per model to avoid re-hitting dead endpoints within a window.
 */

// Free models ranked by quality for text generation tasks (best first)
const FREE_MODELS = [
  "deepseek/deepseek-v4-flash:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "z-ai/glm-4.5-air:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "arcee-ai/trinity-large-thinking:free",
  "qwen/qwen3-coder:free",
  "openai/gpt-oss-120b:free",
  "minimax/minimax-m2.5:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openai/gpt-oss-20b:free",
];

// Cooldown tracking: model ID -> timestamp when it failed (cooldown for 5 minutes)
const failedModels: Map<string, number> = new Map();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown per failed model

/**
 * Self-healing JSON repair parser.
 * Automatically closes unclosed quotes, brackets, braces, and fixes mismatched brackets/braces
 * (e.g., when a model closes an array with '}' instead of ']').
 */
export function repairJSON(raw: string): string {
  let str = raw.trim();

  // Find the first opening curly brace or bracket
  const firstBrace = str.indexOf('{');
  const firstBracket = str.indexOf('[');
  
  const startIdx = Math.min(
    firstBrace === -1 ? Infinity : firstBrace,
    firstBracket === -1 ? Infinity : firstBracket
  );
  
  if (startIdx === Infinity) return '{}';
  
  str = str.substring(startIdx);

  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;
  let correctedStr = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (escape) {
      escape = false;
      correctedStr += char;
      continue;
    }
    if (char === '\\') {
      escape = true;
      correctedStr += char;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      correctedStr += char;
      continue;
    }
    if (inString) {
      correctedStr += char;
      continue;
    }

    if (char === '{') {
      openBraces++;
      correctedStr += char;
    } else if (char === '}') {
      if (openBrackets > 0 && openBraces <= 1) {
        // Mismatched bracket close: replaced with ']'
        correctedStr += ']';
        openBrackets--;
      } else {
        openBraces--;
        correctedStr += char;
      }
    } else if (char === '[') {
      openBrackets++;
      correctedStr += char;
    } else if (char === ']') {
      openBrackets--;
      correctedStr += char;
    } else {
      correctedStr += char;
    }
  }

  // Auto-close string quotes if truncated
  if (inString) {
    correctedStr += '"';
  }
  // Auto-balance remaining brackets & braces
  while (openBrackets > 0) {
    correctedStr += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    correctedStr += '}';
    openBraces--;
  }

  return correctedStr;
}

/**
 * Clean and extract a valid JSON substring from an AI response.
 * Handles backticks, markdown wraps, leading/trailing explanations, etc.
 */
export function extractJSONString(content: string): string {
  let cleaned = content.trim();
  
  // 1. Remove markdown code block markers if they exist at start/end
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  
  // 2. Self-heal and repair JSON string structures
  return repairJSON(cleaned);
}


/**
 * Check if a model is currently in cooldown (recently failed)
 */
function isModelAvailable(modelId: string): boolean {
  const failedAt = failedModels.get(modelId);
  if (!failedAt) return true;
  
  // If cooldown has expired, remove it and allow retry
  if (Date.now() - failedAt > COOLDOWN_MS) {
    failedModels.delete(modelId);
    return true;
  }
  return false;
}

/**
 * Mark a model as failed (enters cooldown)
 */
function markModelFailed(modelId: string): void {
  failedModels.set(modelId, Date.now());
}

/**
 * Get the ordered list of currently available (non-cooldown) models
 */
function getAvailableModels(): string[] {
  return FREE_MODELS.filter(isModelAvailable);
}

/**
 * Determines if an error is retryable (should try next model) vs fatal (stop immediately)
 */
function isRetryableError(status: number, errorMessage: string): boolean {
  // Rate limited
  if (status === 429) return true;
  // Server/provider errors
  if (status === 502 || status === 503 || status === 504) return true;
  // No endpoints found
  if (errorMessage.includes("No endpoints found")) return true;
  // Provider returned error
  if (errorMessage.includes("Provider returned error")) return true;
  // Model not found
  if (errorMessage.includes("not found")) return true;
  // Overloaded
  if (errorMessage.includes("overloaded") || errorMessage.includes("capacity")) return true;

  return false;
}

export interface AICallOptions {
  systemPrompt: string;
  userMessage: string;
  /** If true, returns raw text. If false, attempts JSON extraction (like original openrouter.ts) */
  rawText?: boolean;
  /** Optional preferred model to prioritize first before falling back to the pool */
  preferredModel?: string;
}

/**
 * Call a free AI model with automatic fallback rotation.
 * Tries each available model in ranked order until one succeeds.
 * 
 * @throws Error only when ALL models have been exhausted
 */
export async function callAIWithFallback(options: AICallOptions): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OpenRouter API Key. Set NEXT_PUBLIC_OPENROUTER_API_KEY in .env.local");

  let availableModels = getAvailableModels();
  
  // If a preferred model is provided and not in cooldown, prioritize it
  if (options.preferredModel && isModelAvailable(options.preferredModel)) {
    availableModels = [
      options.preferredModel,
      ...availableModels.filter(m => m !== options.preferredModel)
    ];
  }

  if (availableModels.length === 0) {
    // All models are in cooldown — clear cooldowns and retry from scratch to avoid hard failures
    failedModels.clear();
    availableModels = getAvailableModels();
    if (options.preferredModel) {
      availableModels = [
        options.preferredModel,
        ...availableModels.filter(m => m !== options.preferredModel)
      ];
    }
  }

  const errors: string[] = [];

  for (const model of availableModels) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: options.systemPrompt },
            { role: "user", content: options.userMessage }
          ]
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // Could not parse error body
        }

        if (isRetryableError(response.status, errorMessage)) {
          markModelFailed(model);
          errors.push(`[${model}] ${errorMessage}`);
          continue; // Try next model
        }

        // Non-retryable error (e.g., auth failure) — throw immediately
        throw new Error(errorMessage);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";

      if (!content || content.trim() === "") {
        // Empty response — try next model
        markModelFailed(model);
        errors.push(`[${model}] Empty response`);
        continue;
      }

      // If rawText mode, return as-is
      // Otherwise, attempt JSON extraction & validation
      const extracted = extractJSONString(content);
      try {
        JSON.parse(extracted);
        return extracted;
      } catch (parseErr: any) {
        markModelFailed(model);
        errors.push(`[${model}] Invalid JSON output: ${parseErr.message}`);
        continue;
      }

    } catch (err: any) {
      // Network error or unexpected failure
      if (err.message && !err.message.includes("Missing OpenRouter")) {
        markModelFailed(model);
        errors.push(`[${model}] ${err.message}`);
        continue;
      }
      throw err;
    }
  }

  // All models exhausted
  throw new Error(
    `All free AI models failed. Tried ${errors.length} models:\n${errors.join("\n")}\n\nPlease try again in a few minutes.`
  );
}

/**
 * Get current fallback system status (for debugging/UI display)
 */
export function getAIFallbackStatus() {
  const available = getAvailableModels();
  const coolingDown = FREE_MODELS.filter((m) => !isModelAvailable(m));
  return {
    totalModels: FREE_MODELS.length,
    availableCount: available.length,
    cooldownCount: coolingDown.length,
    availableModels: available,
    cooldownModels: coolingDown,
  };
}

// Free vision models ranked by quality & real-world reliability
const FREE_VISION_MODELS = [
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "google/gemma-4-31b-it:free",
];

export interface AIVisionOptions {
  systemPrompt: string;
  userMessage: string;
  base64Image: string; // The data URL, e.g. "data:image/png;base64,..."
  rawText?: boolean;
}

/**
 * Call a free Vision AI model with automatic fallback rotation.
 * Tries each available vision model in ranked order.
 */
export async function callAIVisionWithFallback(options: AIVisionOptions): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OpenRouter API Key. Set NEXT_PUBLIC_OPENROUTER_API_KEY in .env.local");

  const availableVisionModels = FREE_VISION_MODELS.filter(isModelAvailable);
  let modelsToTry = availableVisionModels;

  if (modelsToTry.length === 0) {
    // If all are in cooldown, clear cooldowns for these vision models
    for (const model of FREE_VISION_MODELS) {
      failedModels.delete(model);
    }
    modelsToTry = [...FREE_VISION_MODELS];
  }

  const errors: string[] = [];

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: options.systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: options.userMessage },
                {
                  type: "image_url",
                  image_url: {
                    url: options.base64Image
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // Ignore
        }

        if (isRetryableError(response.status, errorMessage)) {
          markModelFailed(model);
          errors.push(`[${model}] ${errorMessage}`);
          continue;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";

      if (!content || content.trim() === "") {
        markModelFailed(model);
        errors.push(`[${model}] Empty response`);
        continue;
      }

      if (options.rawText) {
        return content.trim();
      }

      // JSON extraction & validation
      const extracted = extractJSONString(content);
      try {
        const parsed = JSON.parse(extracted);
        
        // Strict Schema Validation: Enforce required fields for scanning sheets
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          !("transcription" in parsed) ||
          !("vocabulary" in parsed) ||
          !("grammar" in parsed)
        ) {
          throw new Error("Missing required JSON fields: transcription, vocabulary, or grammar");
        }
        
        return extracted;
      } catch (parseErr: any) {
        markModelFailed(model);
        errors.push(`[${model}] Invalid JSON output: ${parseErr.message}`);
        continue;
      }

    } catch (err: any) {
      if (err.message && !err.message.includes("Missing OpenRouter")) {
        markModelFailed(model);
        errors.push(`[${model}] ${err.message}`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    `All free Vision AI models failed. Tried ${errors.length} models:\n${errors.join("\n")}\n\nPlease try again in a few minutes.`
  );
}
