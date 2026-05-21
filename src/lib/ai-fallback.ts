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
      if (options.rawText) {
        return content.trim();
      }

      // Otherwise, attempt JSON extraction (for structured responses)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch) {
        content = jsonMatch[1];
      } else {
        const firstBrace = content.indexOf("{");
        const firstBracket = content.indexOf("[");
        const lastBrace = content.lastIndexOf("}");
        const lastBracket = content.lastIndexOf("]");

        const firstValidIdx = Math.min(
          firstBrace === -1 ? Infinity : firstBrace,
          firstBracket === -1 ? Infinity : firstBracket
        );
        const lastValidIdx = Math.max(lastBrace, lastBracket);

        if (firstValidIdx !== Infinity && lastValidIdx !== -1) {
          content = content.substring(firstValidIdx, lastValidIdx + 1);
        }
      }

      return content;

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
