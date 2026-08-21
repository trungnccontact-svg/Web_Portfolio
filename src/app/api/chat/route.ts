import { NextRequest } from "next/server";

// Cooldown tracking for streaming models
const failedModels = new Set<string>();
const cooldownTimestamps = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown

const STREAM_FREE_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
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
  "openrouter/free"
];

function isModelAvailable(model: string): boolean {
  if (!failedModels.has(model)) return true;
  const failedAt = cooldownTimestamps.get(model) || 0;
  if (Date.now() - failedAt > COOLDOWN_MS) {
    failedModels.delete(model);
    cooldownTimestamps.delete(model);
    return true;
  }
  return false;
}

function markModelFailed(model: string): void {
  failedModels.add(model);
  cooldownTimestamps.set(model, Date.now());
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing OpenRouter API Key in environment variables." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty messages history." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Context compression: Keep last 6 messages to keep prefill time exceptionally fast
    const historyLimit = 6;
    const recentMessages = messages.slice(-historyLimit);
    
    const formattedHistory = recentMessages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const userQuery = recentMessages[recentMessages.length - 1]?.content || "";

    const systemPrompt = `You are the official Portfolio AI Assistant of Nguyen Chi Trung. 
Your job is to introduce Trung, answer questions about his skills, experience, and projects, and direct visitors to his interactive portfolio features.

Tone: Professional, warm, highly engaging, and extremely brief.
If the visitor writes in Vietnamese, answer in Vietnamese. If in English, answer in English.

Trung's complete professional profile:
- Full Name: Nguyen Chi Trung
- Role: Junior Business Analyst | Technical Background (1+ year software delivery experience)
- Core Skills: Requirement Gathering & Clarification, Process Mapping (Visio/Flowcharts), Project Planning & Tracking (MS Project), Data & Workflow Analysis, SQL Server, ReactJS, NestJS, MongoDB
- Experience:
  1. Thuan Nhat – IAS (01/2026 - 07/2026): Software Engineer (Project execution planning via MS Project, Visio flowcharts/swimlane for 3+ PCS workflows, SQL Server & VB.NET maintenance).
  2. SQ Strategic Solutions (03/2025 - 11/2025): Full stack developer (Agile sprint delivery, web & mobile end-to-end features).
- Projects:
  1. CONUT (https://conut.vn) - Technical & Business Contributor: Social group-buying e-commerce platform. Business workflow mapping, scope gap analysis, technical spec review.
  2. Pezzel (https://www.pezzel.com) - Full-stack Developer: Real estate booking. React, NestJS, Google Maps API.
  3. Pozzel - Service-booking app. React Native, NestJS.
- Interactive Pages on this site (Highly Recommended - tell users to try them!):
  - Play Chess Lounge (/chess): Battle a smart adaptive AI.
  - AI English Scanner (/english): OCR vision grammar and pronunciation helper.
  - Interactive Notepad (/notepad): Local Markdown note manager.
  - AI Job Agent (/ai-job-agent): Match resumes to job descriptions.
- Contact Details:
  - Phone: 0832942345
  - Email: trungnc.contact@gmail.com
  - LinkedIn: linkedin.com/in/trungit2026/
  - Location: Ho Chi Minh City, Vietnam.

CRITICAL INSTRUCTIONS FOR ULTRA-SPEED:
- Keep all your answers extremely concise and brief (strictly under 2-3 sentences, maximum 60 words).
- Avoid conversational filler. Get straight to the point to ensure fast completions.
- Use bullet points only for clean, short lists (like contact info or tech stacks).
- NEVER start your response with 'Assistant:' or 'Trung:'. Just reply directly to the User's final query.`;

    const userMessage = `Recent conversation history:\n${formattedHistory}\n\nUser Query: "${userQuery}"`;

    let activeModels = STREAM_FREE_MODELS.filter(isModelAvailable);
    if (activeModels.length === 0) {
      failedModels.clear();
      cooldownTimestamps.clear();
      activeModels = [...STREAM_FREE_MODELS];
    }

    let response: Response | null = null;
    let successfulModel = "";

    // Sequential fallback loop
    for (const model of activeModels) {
      try {
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://trungit.railway.app",
            "X-Title": "Trung Portfolio"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ],
            stream: true,
            temperature: 0.3, // Lower temperature makes text generation faster and more focused
            max_tokens: 150   // Restrict output length at model level to increase speed
          })
        });

        if (openRouterResponse.ok && openRouterResponse.body) {
          response = openRouterResponse;
          successfulModel = model;
          break; // Successfully connected to a working model stream!
        }

        // Retryable error - mark failed and try next
        markModelFailed(model);
        console.warn(`[Streaming Fallback] Model ${model} returned HTTP ${openRouterResponse.status}`);
      } catch (err: any) {
        markModelFailed(model);
        console.warn(`[Streaming Fallback] Network issue with model ${model}: ${err.message}`);
      }
    }

    if (!response || !response.body) {
      return new Response(
        JSON.stringify({ error: "All streaming free models are temporarily overloaded. Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream transformation pipeline to push content chunks raw
    const responseStream = response.body;
    const customStream = new ReadableStream({
      async start(controller) {
        const reader = responseStream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned) continue;
              if (cleaned === "data: [DONE]") continue;

              if (cleaned.startsWith("data: ")) {
                try {
                  const jsonStr = cleaned.slice(6);
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  // Ignore JSON chunk errors
                }
              }
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    // Display clean name for model header
    let cleanModelName = successfulModel
      .split('/')
      .pop()
      ?.replace(':free', '')
      ?.replace('-instruct', '')
      ?.replace('-it', '')
      ?.split('-')
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(' ') || successfulModel;

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Active-Model": cleanModelName,
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
    console.error("Error in streaming chat API route:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
