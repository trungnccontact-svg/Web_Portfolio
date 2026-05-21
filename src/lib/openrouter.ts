import { callAIWithFallback } from "./ai-fallback";

/**
 * Global OpenRouter API call helper.
 * Routed through the resilient model auto-rotation fallback system.
 * 
 * @param systemPrompt The instruction guide for the AI behavior.
 * @param userMessage The main CV text, job list, or other query contents.
 * @param model Preferred starting model. Defaults to deepseek/deepseek-v4-flash:free.
 */
export async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  model: string = "deepseek/deepseek-v4-flash:free"
): Promise<string> {
  return callAIWithFallback({
    systemPrompt,
    userMessage,
    rawText: false,
    preferredModel: model
  });
}
